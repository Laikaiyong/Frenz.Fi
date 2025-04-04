// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseHook} from "v4-periphery/src/utils/BaseHook.sol";

import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "v4-core/src/types/BeforeSwapDelta.sol";

/**
 * @title DynamicFeeHook
 * @notice A simplified version of DynamicFeeHook that optimizes for contract size
 */
contract DynamicFeeHook is BaseHook {
    using PoolIdLibrary for PoolKey;

    // Fee tiers
    uint24 public constant BASE_FEE = 500;     // 0.05% base fee
    uint24 public constant LOW_FEE = 1000;     // 0.1% during low volatility
    uint24 public constant MID_FEE = 3000;     // 0.3% during medium volatility 
    uint24 public constant HIGH_FEE = 10000;   // 1% during high volatility
    uint24 public constant EXTREME_FEE = 30000; // 3% during extreme volatility

    // Volatility thresholds (basis points = 1/100 of 1%)
    uint24 public constant LOW_VOLATILITY = 50;     // 0.5% price change
    uint24 public constant MID_VOLATILITY = 200;    // 2% price change
    uint24 public constant HIGH_VOLATILITY = 500;   // 5% price change 
    uint24 public constant EXTREME_VOLATILITY = 1000; // 10% price change

    // Simplified pool data structure to save gas
    struct PoolData {
        uint160 lastSqrtPriceX96;
        uint256 lastTimestamp;
        uint256 volume;
        uint24 currentFee;
    }

    // Mapping from poolId to pool data
    mapping(PoolId => PoolData) public poolData;
    
    // Track swap counts for analytics
    mapping(PoolId => uint256) public swapCount;

    constructor(IPoolManager _poolManager) BaseHook(_poolManager) {}

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
        
        return BaseHook.beforeInitialize.selector;
    }

    function _afterInitialize(address, PoolKey calldata, uint160, int24)
        internal
        pure
        override
        returns (bytes4)
    {
        // No additional initialization needed
        return BaseHook.afterInitialize.selector;
    }

    function _beforeSwap(
        address,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        bytes calldata
    ) internal override returns (bytes4, BeforeSwapDelta, uint24) {
        PoolId poolId = key.toId();
        swapCount[poolId]++;
        
        // Get the dynamic fee
        uint24 dynamicFee = calculateDynamicFee(poolId, params);
        
        return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, dynamicFee);
    }

    function _afterSwap(
    address,
    PoolKey calldata key,
    IPoolManager.SwapParams calldata params,
    BalanceDelta, // Remove 'delta' parameter name
    bytes calldata
) internal override returns (bytes4, int128) {
        PoolId poolId = key.toId();
        PoolData storage data = poolData[poolId];
        
        // Update volume data - simplified
        uint256 swapVolume = params.amountSpecified < 0 ? 
            uint256(-params.amountSpecified) : 
            uint256(params.amountSpecified);
        
        data.volume += swapVolume;
        
        // Update last timestamp
        data.lastTimestamp = block.timestamp;
        
        // Update current fee
        data.currentFee = calculateDynamicFee(poolId, params);
        
        return (BaseHook.afterSwap.selector, 0);
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
            
        // Very simplified fee logic to reduce contract size
        // Check recent volume
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
     * @notice Get current fee tier for a pool
     * @param key Pool key
     * @return Current fee tier
     */
    function getCurrentFee(PoolKey calldata key) external view returns (uint24) {
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
        PoolData storage data = poolData[poolId];
        
        // Use most recent calculated fee
        poolManager.updateDynamicLPFee(key, data.currentFee);
    }
}