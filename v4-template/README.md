# Dynamic Fee Hook for Uniswap v4 on Base Mainnet

## Overview

This project implements a Dynamic Fee mechanism for Uniswap v4 pools on Base mainnet using hooks. The DynamicFeeHook automatically adjusts LP fees based on trading conditions to optimize revenue capture during periods of high volume or volatility.

## Base Mainnet Deployment Details

### Contract Addresses
- **Pool Manager**: `0x498581ff718922c3f8e6a244956af099b2652b2b`
- **Position Manager**: `0x7c5f5a4bbd8fd63184577525126123b519429bdc`
- **Permit2**: `0x000000000022D473030F116dDEE9F6B43aC78BA3`

### Hooks Addresses
- **Base Mainnet**: `https://basescan.org/address/0xeb81c4d4f4b5dbdac055e547ee805640328eb0c0`

### Sample transaction

- **ETH / USDC**: `https://basescan.org/tx/0x0e8fc8e0e1616faed018962af39ded4335675e8902817284f14ed69552beafa8`

## Celo Alfajores Deployment Details

### Uniswap Deployed Contracts

**PoolManager**: `0xAF85A0023fAc623fCE4F20f50BD475C01e6791B1`
https://alfajores.celoscan.io/address/0xaf85a0023fac623fce4f20f50bd475c01e6791b1

**PoolModifyLiquidityTest**: `0xEC0Bc9D59A187AA5693084657deC06889A8398bD`
https://alfajores.celoscan.io/address/0xcea902f0e73813b8158a029f9453e63c2d66560e

**PoolSwapTest**: `0xCea902f0E73813B8158a029F9453e63c2d66560e`
https://alfajores.celoscan.io/address/0xec0bc9d59a187aa5693084657dec06889a8398bd

**PoolDonateTest**: `0x42EDfF2AB874c94F843C8112629313066eb82847`
https://alfajores.celoscan.io/address/0x42edff2ab874c94f843c8112629313066eb828474

**Hooks**: `0xacEa1aA10C3dBAe4fd3EbE2AfCcC17492b4170c0`
https://alfajores.celoscan.io/address/0xacea1aa10c3dbae4fd3ebe2afccc17492b4170c0


## Sepolia Deployment Details

**Hooks** :`0x89fb990845b7643d13717815cf752ae9087bb0c0`
https://sepolia.etherscan.io/address/0x89fb990845b7643d13717815cf752ae9087bb0c0

## Key Features

- **Progressive Fee Structure**: Five fee tiers (0.05% to 3%) that adjust dynamically
- **Volume-Based Metrics**: Fee calculations based on actual trade size
- **Optimized Contract Size**: Designed to fit within Ethereum's contract size limits
- **Easy Integration**: Seamless hook integration with Uniswap v4 pools on Base

## Fee Tiers

| Fee Tier | Percentage | When Applied |
|----------|------------|--------------|
| BASE_FEE | 0.05% | Default fee under normal conditions |
| LOW_FEE | 0.1% | During periods of slightly elevated trading |
| MID_FEE | 0.3% | During medium volume trading |
| HIGH_FEE | 1% | During high trading volume |
| EXTREME_FEE | 3% | During massive trading activity |

## Deployment & Usage

### Prerequisites

- Foundry
- Base Mainnet RPC URL
- Private Key with sufficient ETH for gas fees

### Deploying the Hook

```bash
# Set environment variables
export PRIVATE_KEY=your_private_key
export BASE_RPC_URL=https://mainnet.base.org

# Deploy the hook
forge script script/BaseMainnetDeployment.s.sol \
  --rpc-url $BASE_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

### Creating a Pool with the Hook

```bash
# Update the script/base/Config.sol with your deployed hook address
forge script script/CreatePoolWithHook.s.sol \
  --rpc-url $BASE_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### Adding Liquidity

```bash
# Use the AddLiquidityToPool script
forge script script/AddLiquidityToPool.s.sol \
  --rpc-url $BASE_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

## Implementation Considerations

1. **Contract Size**: Carefully manage contract size to stay within Ethereum's 24KB limit
2. **Gas Optimization**: The hook is designed to minimize gas overhead
3. **Dynamic Fee Calculation**: Fees adjust based on:
   - Swap volume
   - Trading activity
   - Volatility metrics

## Hook Flags

The hook uses the following permission flags:
- BEFORE_INITIALIZE_FLAG
- AFTER_INITIALIZE_FLAG
- BEFORE_SWAP_FLAG
- AFTER_SWAP_FLAG

## Future Enhancements

- Implement more sophisticated volatility tracking
- Add token-specific fee strategies
- Introduce more granular fee adjustment mechanisms

## Dependencies

- Foundry/Forge
- Uniswap v4 core and periphery contracts
- Base Mainnet infrastructure

## Security

- Thoroughly tested on testnet
- Audits recommended before significant liquidity deployment
- Always verify contract interactions

## License

MIT License

## Disclaimer

This is an experimental implementation. Use with caution and conduct thorough testing before deploying with significant liquidity.