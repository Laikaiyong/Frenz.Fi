// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseHook} from "v4-periphery/src/utils/BaseHook.sol";

import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";
import {BalanceDeltaLibrary} from "v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "v4-core/src/types/BeforeSwapDelta.sol";

/**
 * @title DynamicFeeHook
 * @notice Enhanced DynamicFeeHook with circuit breakers and MEV protection
 */
contract DynamicFeeHook is BaseHook {
    using PoolIdLibrary for PoolKey;
    using BalanceDeltaLibrary for BalanceDelta;

    // Fee tiers (unchanged)
    uint24 public constant BASE_FEE = 500;     // 0.05% base fee
    uint24 public constant LOW_FEE = 1000;     // 0.1% during low volatility
    uint24 public constant MID_FEE = 3000;     // 0.3% during medium volatility 
    uint24 public constant HIGH_FEE = 10000;   // 1% during high volatility
    uint24 public constant EXTREME_FEE = 30000; // 3% during extreme volatility

    // Volatility thresholds (unchanged)
    uint24 public constant LOW_VOLATILITY = 50;     // 0.5% price change
    uint24 public constant MID_VOLATILITY = 200;    // 2% price change
    uint24 public constant HIGH_VOLATILITY = 500;   // 5% price change 
    uint24 public constant EXTREME_VOLATILITY = 1000; // 10% price change

    // Circuit breaker settings
    uint24 public constant MAX_FEE_INCREASE_PER_BLOCK = 1500; // Max 0.15% increase per block
    uint16 public constant MIN_BLOCKS_AT_ELEVATED_FEE = 3;    // Fee stays elevated for at least 3 blocks
    uint24 public constant PRICE_DEVIATION_THRESHOLD = 800;   // 8% max price deviation

    // Emergency settings
    bool public emergencyModeActive;
    uint24 public emergencyFee = BASE_FEE;
    address public owner;
    
    // Enhanced pool data structure
    struct PoolData {
        uint160 lastSqrtPriceX96;  // Last observed price
        uint256 lastTimestamp;     // Timestamp of last activity
        uint256 volume;            // Total volume tracker
        uint24 currentFee;         // Current fee tier
        uint64 blockLastFeeChange; // Block when fee was last changed
        uint64 blockLastElevation; // Block when fee was last elevated
        uint160 upperPriceBound;   // Upper price boundary for circuit breaker
        uint160 lowerPriceBound;   // Lower price boundary for circuit breaker
    }

    // Mapping from poolId to pool data
    mapping(PoolId => PoolData) public poolData;
    
    // Track swap counts for analytics
    mapping(PoolId => uint256) public swapCount;

    // Events
    event FeeChanged(PoolId indexed poolId, uint24 oldFee, uint24 newFee);
    event EmergencyModeActivated(bool active, uint24 fee);
    event CircuitBreakerTriggered(PoolId indexed poolId, uint160 price);

    constructor(IPoolManager _poolManager) BaseHook(_poolManager) {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: true,
            afterInitialize: true,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    function _beforeInitialize(address, PoolKey calldata key, uint160 sqrtPriceX96)
        internal
        override
        returns (bytes4)
    {
        PoolId poolId = key.toId();
        PoolData storage data = poolData[poolId];
        
        data.lastSqrtPriceX96 = sqrtPriceX96;
        data.lastTimestamp = block.timestamp;
        data.currentFee = BASE_FEE;
        data.blockLastFeeChange = uint64(block.number);
        data.blockLastElevation = 0;
        
        // Initialize price boundaries for circuit breaker
        updatePriceBoundaries(data, sqrtPriceX96);
        
        return BaseHook.beforeInitialize.selector;
    }

    function _afterInitialize(address, PoolKey calldata, uint160, int24)
        internal
        pure
        override
        returns (bytes4)
    {
        return BaseHook.afterInitialize.selector;
    }

    function _beforeSwap(
        address,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        bytes calldata
    ) internal override returns (bytes4, BeforeSwapDelta, uint24) {
        // If emergency mode is active, use emergency fee
        if (emergencyModeActive) {
            return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, emergencyFee);
        }
        
        PoolId poolId = key.toId();
        swapCount[poolId]++;
        
        PoolData storage data = poolData[poolId];
        
        // Use the price that was last stored
        uint160 currentPrice = data.lastSqrtPriceX96;
        
        // Check for price manipulation (circuit breaker)
        if (isPriceManipulated(data, currentPrice)) {
            emit CircuitBreakerTriggered(poolId, currentPrice);
            // Use existing fee if price movement is suspicious
            return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, data.currentFee);
        }
        
        // Get dynamic fee with MEV protection
        uint24 dynamicFee = calculateProtectedFee(poolId, data, params);
        
        return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, dynamicFee);
    }

    function _afterSwap(
        address,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata
    ) internal override returns (bytes4, int128) {
        PoolId poolId = key.toId();
        PoolData storage data = poolData[poolId];
        
        // Estimate new price based on the swap
        uint160 currentPrice = estimateNewPrice(data.lastSqrtPriceX96, delta, params.zeroForOne);
        
        // Update volume data
        uint256 swapVolume = params.amountSpecified < 0 ? 
            uint256(-params.amountSpecified) : 
            uint256(params.amountSpecified);
        
        data.volume += swapVolume;
        
        // Update last timestamp and price
        data.lastTimestamp = block.timestamp;
        data.lastSqrtPriceX96 = currentPrice;
        
        // Update price boundaries
        updatePriceBoundaries(data, currentPrice);
        
        // Skip fee update if in emergency mode
        if (emergencyModeActive) {
            return (BaseHook.afterSwap.selector, 0);
        }
        
        // Calculate new base fee
        uint24 newFee = calculateDynamicFee(poolId, params);
        
        // Apply circuit breaker to limit fee increases per block
        if (newFee > data.currentFee) {
            // Limit how much fee can increase in a single block
            uint24 maxAllowedFee = data.currentFee + MAX_FEE_INCREASE_PER_BLOCK;
            newFee = newFee < maxAllowedFee ? newFee : maxAllowedFee;
            
            if (newFee > data.currentFee) {
                // Record this block as the last time fee was elevated
                data.blockLastElevation = uint64(block.number);
            }
        } 
        // Only allow fee to decrease if minimum blocks at elevated fee have passed
        else if (block.number > data.blockLastElevation + MIN_BLOCKS_AT_ELEVATED_FEE) {
            // Allow fee to decrease but only to the calculated value
            // This prevents manipulation to push fees artificially low
        } else {
            // Otherwise keep fee elevated for MEV protection
            newFee = data.currentFee;
        }
        
        // Update current fee if changed
        if (newFee != data.currentFee) {
            uint24 oldFee = data.currentFee;
            data.currentFee = newFee;
            data.blockLastFeeChange = uint64(block.number);
            emit FeeChanged(poolId, oldFee, newFee);
        }
        
        return (BaseHook.afterSwap.selector, 0);
    }

    /**
     * @notice Estimate the new price after a swap
     * @param oldPrice Previous price
     * @param delta Balance delta from the swap
     * @param zeroForOne Direction of the swap
     * @return Estimated new price
     */
    function estimateNewPrice(
        uint160 oldPrice, 
        BalanceDelta delta,
        bool zeroForOne
    ) internal pure returns (uint160) {
        // This is a very simplified price update mechanism
        
        // Get the actual amounts from the BalanceDelta using the proper library
        int128 amount0 = delta.amount0();
        int128 amount1 = delta.amount1();
        
        // If zeroForOne (selling token0 for token1), price goes down
        // If !zeroForOne (selling token1 for token0), price goes up
        if (zeroForOne) {
            // Price decreases (token0 → token1)
            // The larger the swap, the more significant the change
            if (amount0 < -10 ether) {
                return uint160(uint256(oldPrice) * 95 / 100); // 5% drop for large swaps
            } else {
                return uint160(uint256(oldPrice) * 99 / 100); // 1% drop for small swaps
            }
        } else {
            // Price increases (token1 → token0)
            if (amount1 < -10 ether) {
                return uint160(uint256(oldPrice) * 105 / 100); // 5% rise for large swaps
            } else {
                return uint160(uint256(oldPrice) * 101 / 100); // 1% rise for small swaps
            }
        }
    }

    /**
     * @notice Calculate the dynamic fee for a swap
     * @param poolId Pool identifier
     * @param params Swap parameters
     * @return Dynamic fee to apply
     */
    function calculateDynamicFee(PoolId poolId, IPoolManager.SwapParams calldata params) 
        internal 
        view 
        returns (uint24) 
    {
        PoolData storage data = poolData[poolId];
        
        // If this is the first swap, use base fee
        if (data.lastTimestamp == 0) {
            return BASE_FEE;
        }
        
        // Calculate swap volume
        uint256 swapVolume = params.amountSpecified < 0 ? 
            uint256(-params.amountSpecified) : 
            uint256(params.amountSpecified);
            
        // Volume-based fee logic (unchanged)
        if (swapVolume > 1000e18) {
            return EXTREME_FEE;
        } else if (swapVolume > 100e18) {
            return HIGH_FEE;
        } else if (swapVolume > 10e18) {
            return MID_FEE;
        } else if (swapVolume > 1e18) {
            return LOW_FEE;
        }
        
        return BASE_FEE;
    }

    /**
     * @notice Calculate fee with MEV protection
     * @param poolId Pool identifier
     * @param data Pool data
     * @param params Swap parameters
     * @return Protected fee
     */
    function calculateProtectedFee(
        PoolId poolId,
        PoolData storage data,
        IPoolManager.SwapParams calldata params
    ) internal view returns (uint24) {
        // Calculate base fee
        uint24 baseFee = calculateDynamicFee(poolId, params);
        
        // MEV Protection: If fee would decrease but we're still within the
        // protection window, maintain the current fee
        if (baseFee < data.currentFee && 
            block.number <= data.blockLastElevation + MIN_BLOCKS_AT_ELEVATED_FEE) {
            return data.currentFee;
        }
        
        return baseFee;
    }
    
    /**
     * @notice Check if price movement indicates manipulation
     * @param data Pool data
     * @param currentPrice Current price
     * @return True if price manipulation detected
     */
    function isPriceManipulated(
        PoolData storage data, 
        uint160 currentPrice
    ) internal view returns (bool) {
        // Check if price is outside the acceptable range
        return (
            currentPrice > data.upperPriceBound || 
            currentPrice < data.lowerPriceBound
        );
    }
    
    /**
     * @notice Update price boundaries for circuit breaker
     * @param data Pool data
     * @param currentPrice Current price
     */
    function updatePriceBoundaries(PoolData storage data, uint160 currentPrice) internal {
        // Set boundaries at +/- PRICE_DEVIATION_THRESHOLD from current price
        data.upperPriceBound = uint160((uint256(currentPrice) * (10000 + PRICE_DEVIATION_THRESHOLD)) / 10000);
        data.lowerPriceBound = uint160((uint256(currentPrice) * (10000 - PRICE_DEVIATION_THRESHOLD)) / 10000);
    }

    /**
     * @notice Set emergency mode
     * @param active Whether emergency mode is active
     * @param fee Fee to use in emergency mode
     */
    function setEmergencyMode(bool active, uint24 fee) external onlyOwner {
        emergencyModeActive = active;
        if (active) {
            emergencyFee = fee;
        }
        emit EmergencyModeActivated(active, fee);
    }
    
    /**
     * @notice Transfer ownership
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        owner = newOwner;
    }

    /**
     * @notice Get current fee tier for a pool
     * @param key Pool key
     * @return Current fee tier
     */
    function getCurrentFee(PoolKey calldata key) external view returns (uint24) {
        if (emergencyModeActive) {
            return emergencyFee;
        }
        
        PoolId poolId = key.toId();
        return poolData[poolId].currentFee;
    }

    /**
     * @notice Get total volume for a pool
     * @param key Pool key
     * @return Total volume
     */
    function getTotalVolume(PoolKey calldata key) external view returns (uint256) {
        PoolId poolId = key.toId();
        return poolData[poolId].volume;
    }

    /**
     * @notice Update the dynamic fee for a pool through the pool manager
     * @param key Pool key
     */
    function updatePoolFee(PoolKey calldata key) external {
        PoolId poolId = key.toId();
        
        if (emergencyModeActive) {
            poolManager.updateDynamicLPFee(key, emergencyFee);
        } else {
            PoolData storage data = poolData[poolId];
            poolManager.updateDynamicLPFee(key, data.currentFee);
        }
    }
    
    /**
     * @notice Get price boundaries for a pool
     * @param key Pool key
     * @return lower Lower price boundary
     * @return upper Upper price boundary
     */
    function getPriceBoundaries(PoolKey calldata key) external view returns (uint160 lower, uint160 upper) {
        PoolId poolId = key.toId();
        PoolData storage data = poolData[poolId];
        return (data.lowerPriceBound, data.upperPriceBound);
    }
}