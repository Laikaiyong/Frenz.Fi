# Dynamic Fee Hook for Uniswap v4

This project implements a Dynamic Fee mechanism for Uniswap v4 pools using hooks. The DynamicFeeHook automatically adjusts LP fees based on trading conditions to optimize revenue capture during periods of high volume or volatility.

## Overview

Uniswap v4 introduces hooks - customizable logic that can intervene at various points in the swap lifecycle. This DynamicFeeHook leverages the hook system to:

- Start with a base fee (0.05%) during normal market conditions
- Automatically increase fees during periods of high trading volume
- Scale fees up to 3% during extreme market activity
- Track volume and swap metrics for analysis

This allows LPs to capture more value during high-volume trading periods (common with memecoins and volatile assets) while maintaining competitive fees during normal market conditions.

## Key Features

- **Progressive Fee Structure**: Five fee tiers (0.05% to 3%) that adjust dynamically
- **Volume-Based Metrics**: Fee calculations based on actual trade size
- **Optimized Contract Size**: Designed to fit within Ethereum's contract size limits
- **Easy Integration**: Seamless hook integration with standard Uniswap v4 pools

## Fee Tiers

| Fee Tier | Percentage | When Applied |
|----------|------------|--------------|
| BASE_FEE | 0.05% | Default fee under normal conditions |
| LOW_FEE | 0.1% | During periods of slightly elevated trading |
| MID_FEE | 0.3% | During medium volume trading |
| HIGH_FEE | 1% | During high trading volume |
| EXTREME_FEE | 3% | During massive trading activity |

## Implementation

The main contract is `DynamicFeeHook.sol`, which implements the following hook functions:

- `beforeInitialize` & `afterInitialize`: Configure initial pool settings
- `beforeSwap`: Calculate and apply the dynamic fee for the current swap
- `afterSwap`: Update volume metrics and price data after the swap

The hook tracks trading volume and calculates fees based on the size of individual swaps:

```solidity
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
```

## Deployment & Usage

### Deploying the Hook

```bash
forge script script/04_DynamicFeeHook.s.sol --rpc-url <YOUR_RPC_URL> --private-key <YOUR_KEY> --broadcast
```

Take note of the deployed hook address.

### Updating Configuration

Update the `script/base/Config.sol` file with your hook address:

```solidity
IHooks constant hookContract = IHooks(YOUR_DEPLOYED_HOOK_ADDRESS);
```

### Creating a Pool with the Hook

```bash
forge script script/01_CreatePoolOnly.s.sol --rpc-url <YOUR_RPC_URL> --private-key <YOUR_KEY> --broadcast
```

### Adding Liquidity

```bash
forge script script/02_AddLiquidity.s.sol --rpc-url <YOUR_RPC_URL> --private-key <YOUR_KEY> --broadcast
```

### Testing with Swaps

```bash
forge script script/03_Swap.s.sol --rpc-url <YOUR_RPC_URL> --private-key <YOUR_KEY> --broadcast
```

## Running Tests

```bash
forge test --match-contract DynamicFeeHookTest
```

## Implementation Considerations

1. **Contract Size**: The Ethereum contract size limit is 24KB. The DynamicFeeHook is optimized to fit within this limit.

2. **Hook Flags**: The hook uses the following permission flags:
   - BEFORE_INITIALIZE_FLAG
   - AFTER_INITIALIZE_FLAG
   - BEFORE_SWAP_FLAG
   - AFTER_SWAP_FLAG

3. **Fee Updates**: Only the hook specified at pool creation can update dynamic fees for that pool.

## Future Enhancements

Potential improvements to consider:

- Time-weighted volume tracking for more sophisticated fee strategies
- Price impact considerations in fee calculations
- Token-specific fee strategies for different pairs
- More complex volatility-based fee adjustments

## Dependencies

- Foundry/Forge for development and testing
- Uniswap v4 core and periphery contracts

## License

MIT