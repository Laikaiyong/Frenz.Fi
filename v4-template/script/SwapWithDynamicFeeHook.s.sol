// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {CurrencyLibrary, Currency} from "v4-core/src/types/Currency.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";

// Interface for PoolSwapTest
interface PoolSwapTest {
    struct TestSettings {
        bool takeClaims;
        bool settleUsingBurn;
    }
    
    function swap(
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        TestSettings calldata testSettings,
        bytes calldata hookData
    ) external returns (int256 amount0Delta, int256 amount1Delta);
}

// Interface for DynamicFeeHook
interface DynamicFeeHook {
    function getCurrentFee(PoolKey calldata key) external view returns (uint24);
    function getCurrentVolatility(PoolKey calldata key) external view returns (uint256);
    function getPoolHourlyVolume(PoolKey calldata key) external view returns (uint256);
}

contract SwapWithDynamicFeeHook is Script {
    using CurrencyLibrary for Currency;
    using PoolIdLibrary for PoolKey;

    // Base Sepolia contract addresses
    address constant POOL_MANAGER = 0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408;
    address constant SWAP_ROUTER = 0x8B5bcC363ddE2614281aD875bad385E0A785D3B9;
    
    // Token addresses on Base Sepolia
    address constant WETH = 0x4200000000000000000000000000000000000006;
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    
    // Price limits for swaps
    uint160 public constant MIN_PRICE_LIMIT = TickMath.MIN_SQRT_PRICE + 1;
    uint160 public constant MAX_PRICE_LIMIT = TickMath.MAX_SQRT_PRICE - 1;

    // Pool configuration
    uint24 lpFee = 3000; // 0.30% base fee
    int24 tickSpacing = 60;
    
    // Your hook address
    address hookAddress;
    
    // Interfaces
    IPoolManager poolManager = IPoolManager(POOL_MANAGER);
    PoolSwapTest swapRouter;
    
    // Currencies and tokens
    Currency currency0;
    Currency currency1;
    IERC20 token0;
    IERC20 token1;

    function setUp() public {
        // Load your deployed hook address
        hookAddress = vm.envAddress("HOOK_ADDRESS");
        swapRouter = PoolSwapTest(SWAP_ROUTER);
        
        // Set up currencies - ensure they're sorted
        if (uint160(USDC) < uint160(WETH)) {
            currency0 = Currency.wrap(USDC);
            currency1 = Currency.wrap(WETH);
            token0 = IERC20(USDC);
            token1 = IERC20(WETH);
        } else {
            currency0 = Currency.wrap(WETH);
            currency1 = Currency.wrap(USDC);
            token0 = IERC20(WETH);
            token1 = IERC20(USDC);
        }
    }

    function run() public {
        // Get private key from environment variable
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(privateKey);
        
        // Create pool key with your hook
        PoolKey memory pool = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: lpFee,
            tickSpacing: tickSpacing,
            hooks: IHooks(hookAddress)
        });
        
        // Check current fee before swap
        DynamicFeeHook hook = DynamicFeeHook(hookAddress);
        uint24 preFee = hook.getCurrentFee(pool);
        console.log("Current fee before swap:", preFee);
        
        // Approve tokens for the swap router
        token0.approve(address(swapRouter), type(uint256).max);
        token1.approve(address(swapRouter), type(uint256).max);
        
        // Execute swap - using a small amount for testing
        bool zeroForOne = true;  // Swap token0 for token1
        int256 amountSpecified = 0.0001e18;  // Very small amount to test
        
        IPoolManager.SwapParams memory params = IPoolManager.SwapParams({
            zeroForOne: zeroForOne,
            amountSpecified: amountSpecified,
            sqrtPriceLimitX96: zeroForOne ? MIN_PRICE_LIMIT : MAX_PRICE_LIMIT // unlimited impact
        });
        
        // Settings for swap
        PoolSwapTest.TestSettings memory testSettings = PoolSwapTest.TestSettings({
            takeClaims: false,
            settleUsingBurn: false
        });
        
        // Execute the swap
        (int256 amount0Delta, int256 amount1Delta) = swapRouter.swap(pool, params, testSettings, "");
        
        // Check the fee after swap
        uint24 postFee = hook.getCurrentFee(pool);
        console.log("Swap executed successfully");
        console.log("amount0Delta:", amount0Delta);
        console.log("amount1Delta:", amount1Delta);
        console.log("Current fee after swap:", postFee);
        
        // Check volatility and volume metrics
        uint256 volatility = hook.getCurrentVolatility(pool);
        console.log("Current volatility (bps):", volatility);
        
        uint256 volume = hook.getPoolHourlyVolume(pool);
        console.log("Current hourly volume:", volume);
        
        vm.stopBroadcast();
    }
}