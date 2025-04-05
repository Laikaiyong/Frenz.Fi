// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {CurrencyLibrary, Currency} from "v4-core/src/types/Currency.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {LiquidityAmounts} from "v4-core/test/utils/LiquidityAmounts.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {StateLibrary} from "v4-core/src/libraries/StateLibrary.sol";

// Interface for PositionManager
interface IPositionManager {
    function mint(
        PoolKey calldata key,
        int24 tickLower,
        int24 tickUpper,
        uint128 amount,
        uint256 amount0Max,
        uint256 amount1Max,
        address recipient,
        uint256 deadline,
        bytes calldata hookData
    ) external returns (uint256 tokenId);
}

// Interface for Permit2
interface IAllowanceTransfer {
    function approve(
        address token,
        address spender,
        uint160 amount,
        uint48 expiration
    ) external;
}

contract AddLiquidityToPool is Script {
    using CurrencyLibrary for Currency;
    using PoolIdLibrary for PoolKey;
    using StateLibrary for IPoolManager;

    // Base Sepolia PoolManager address
    address constant POOL_MANAGER = 0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408;
    address constant POSITION_MANAGER = 0x4B2C77d209D3405F41a037Ec6c77F7F5b8e2ca80;
    address constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
    
    // Token addresses on Base Sepolia
    address constant WETH = 0x4200000000000000000000000000000000000006;
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    
    // Pool configuration
    uint24 lpFee = 3000; // 0.30% base fee
    int24 tickSpacing = 60;
    
    // Configuration for liquidity
    uint256 public token0Amount = 0.001e18; // Small amount for testing
    uint256 public token1Amount = 0.001e18; // Small amount for testing
    
    // Range of the position (full range)
    int24 tickLower = -60; // Must be a multiple of tickSpacing
    int24 tickUpper = 60;
    
    // Your hook address
    address hookAddress;
    
    // Interface for contracts
    IPoolManager poolManager = IPoolManager(POOL_MANAGER);
    IPositionManager posm;
    
    // Currencies and tokens
    Currency currency0;
    Currency currency1;
    IERC20 token0;
    IERC20 token1;

    function setUp() public {
        // Load your deployed hook address from environment
        hookAddress = vm.envAddress("HOOK_ADDRESS");
        posm = IPositionManager(POSITION_MANAGER);
        
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
        
        // Use a default sqrtPriceX96 value for Base Sepolia
        uint160 sqrtPriceX96 = 79228162514264337593543950336; // 1.0 in sqrtPriceX96 format
        
        // Calculate liquidity from token amounts
        uint128 liquidity = LiquidityAmounts.getLiquidityForAmounts(
            sqrtPriceX96,
            TickMath.getSqrtPriceAtTick(tickLower),
            TickMath.getSqrtPriceAtTick(tickUpper),
            token0Amount,
            token1Amount
        );
        
        // Approve tokens for Position Manager
        token0.approve(address(PERMIT2), type(uint256).max);
        token1.approve(address(PERMIT2), type(uint256).max);
        IAllowanceTransfer(PERMIT2).approve(address(token0), address(posm), type(uint160).max, type(uint48).max);
        IAllowanceTransfer(PERMIT2).approve(address(token1), address(posm), type(uint160).max, type(uint48).max);
        
        // Add liquidity using Position Manager
        uint256 tokenId = posm.mint(
            pool,
            tickLower,
            tickUpper,
            liquidity,
            token0Amount + 1 wei, // slippage protection
            token1Amount + 1 wei, // slippage protection
            msg.sender,
            block.timestamp + 60, // deadline
            ""  // hook data
        );
        
        console.log("Liquidity added to pool with DynamicFeeHook on Base Sepolia");
        console.log("Position NFT ID:", tokenId);
        console.log("Liquidity amount:", liquidity);
        console.log("Currency0:", Currency.unwrap(currency0));
        console.log("Currency1:", Currency.unwrap(currency1));
        
        vm.stopBroadcast();
    }
}