// /home/wanaqil/repo/heke/Frenz.Fi/frontend/src/app/api/uniswap/route.js
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import path from 'path';
import fs from 'fs';

// Load the ABI
const abiPath = path.join(process.cwd(), 'DynamicFeeHook.json');
const DynamicFeeHookABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

// Contract addresses
const HOOK_ADDRESS = "0x0787c1624420428c837FFCF35cf4b28Fd342f0C0";
const POOL_MANAGER_ADDRESS = "0x498581ff718922c3f8e6a244956af099b2652b2b"; // Base Mainnet Pool Manager
const POSITION_MANAGER_ADDRESS = "0x4B2C77d209D3405F41a037Ec6c77F7F5b8e2ca80"; // Position Manager on Base Mainnet

// Provider setup - using Base Mainnet
const RPC_URL = process.env.BASE_RPC_URL || "https://mainnet.base.org";
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

// Initialize contract instance
const hookContract = new ethers.Contract(HOOK_ADDRESS, DynamicFeeHookABI, provider);

// Define common pool configurations
const SUPPORTED_POOLS = [
  {
    name: "ETH/USDC",
    currency0: "0x4200000000000000000000000000000000000006", // WETH on Base
    currency1: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
    fee: 3000, // 0.3% fee tier
    tickSpacing: 60,
    hooks: HOOK_ADDRESS,
    token0Decimals: 18,
    token1Decimals: 6,
    token0Symbol: "WETH",
    token1Symbol: "USDC"
  }
  // Add more pools as needed
];

// Helper function to format pool key
function formatPoolKey(currency0, currency1, fee, tickSpacing) {
  return {
    currency0,
    currency1,
    fee: parseInt(fee),
    tickSpacing: parseInt(tickSpacing),
    hooks: HOOK_ADDRESS
  };
}

// Calculate pool ID from pool key (simplified version - actual calculation may vary)
function getPoolId(currency0, currency1, fee, tickSpacing) {
  return ethers.solidityKeccak256(
    ['address', 'address', 'uint24', 'int24', 'address'],
    [currency0, currency1, parseInt(fee), parseInt(tickSpacing), HOOK_ADDRESS]
  );
}

// Helper function to format fee percentage
function formatFeePercentage(fee) {
  return (fee / 10000).toFixed(4) + "%";
}

// GET handler for API routes
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  try {
    // Check what action is requested
    switch (action) {
      case 'getCurrentFee': {
        const currency0 = searchParams.get('currency0');
        const currency1 = searchParams.get('currency1');
        const fee = searchParams.get('fee');
        const tickSpacing = searchParams.get('tickSpacing');
        
        if (!currency0 || !currency1 || !fee || !tickSpacing) {
          return NextResponse.json({ error: 'Missing pool parameters' }, { status: 400 });
        }
        
        const poolKey = formatPoolKey(currency0, currency1, fee, tickSpacing);
        const currentFee = await hookContract.getCurrentFee(poolKey);
        
        return NextResponse.json({ 
          fee: currentFee.toNumber(),
          formattedFee: formatFeePercentage(currentFee.toNumber())
        });
      }
      
      case 'getTotalVolume': {
        const currency0 = searchParams.get('currency0');
        const currency1 = searchParams.get('currency1');
        const fee = searchParams.get('fee');
        const tickSpacing = searchParams.get('tickSpacing');
        
        if (!currency0 || !currency1 || !fee || !tickSpacing) {
          return NextResponse.json({ error: 'Missing pool parameters' }, { status: 400 });
        }
        
        const poolKey = formatPoolKey(currency0, currency1, fee, tickSpacing);
        const totalVolume = await hookContract.getTotalVolume(poolKey);
        
        return NextResponse.json({ 
          volume: totalVolume.toString(),
          formattedVolume: ethers.formatEther(totalVolume)
        });
      }
      
      case 'getPriceBoundaries': {
        const currency0 = searchParams.get('currency0');
        const currency1 = searchParams.get('currency1');
        const fee = searchParams.get('fee');
        const tickSpacing = searchParams.get('tickSpacing');
        
        if (!currency0 || !currency1 || !fee || !tickSpacing) {
          return NextResponse.json({ error: 'Missing pool parameters' }, { status: 400 });
        }
        
        const poolKey = formatPoolKey(currency0, currency1, fee, tickSpacing);
        const [lower, upper] = await hookContract.getPriceBoundaries(poolKey);
        
        return NextResponse.json({ 
          lowerBound: lower.toString(),
          upperBound: upper.toString()
        });
      }
      
      case 'getEmergencyStatus': {
        const isActive = await hookContract.emergencyModeActive();
        const emergencyFee = await hookContract.emergencyFee();
        
        return NextResponse.json({ 
          isActive,
          emergencyFee: emergencyFee.toNumber(),
          formattedEmergencyFee: formatFeePercentage(emergencyFee.toNumber())
        });
      }
      
      case 'getPoolData': {
        const currency0 = searchParams.get('currency0');
        const currency1 = searchParams.get('currency1');
        const fee = searchParams.get('fee');
        const tickSpacing = searchParams.get('tickSpacing');
        
        if (!currency0 || !currency1 || !fee || !tickSpacing) {
          return NextResponse.json({ error: 'Missing pool parameters' }, { status: 400 });
        }
        
        // Get pool ID 
        const poolId = getPoolId(currency0, currency1, fee, tickSpacing);
        
        try {
          const poolData = await hookContract.poolData(poolId);
          
          return NextResponse.json({
            lastSqrtPriceX96: poolData.lastSqrtPriceX96.toString(),
            lastTimestamp: poolData.lastTimestamp.toString(),
            volume: poolData.volume.toString(),
            formattedVolume: ethers.formatEther(poolData.volume),
            currentFee: poolData.currentFee,
            formattedCurrentFee: formatFeePercentage(poolData.currentFee),
            blockLastFeeChange: poolData.blockLastFeeChange.toString(),
            blockLastElevation: poolData.blockLastElevation.toString(),
            upperPriceBound: poolData.upperPriceBound.toString(),
            lowerPriceBound: poolData.lowerPriceBound.toString()
          });
        } catch (error) {
          // If the pool doesn't exist or hasn't been initialized yet
          return NextResponse.json({ error: 'Pool does not exist or has not been initialized' }, { status: 404 });
        }
      }

      case 'getSwapCount': {
        const currency0 = searchParams.get('currency0');
        const currency1 = searchParams.get('currency1');
        const fee = searchParams.get('fee');
        const tickSpacing = searchParams.get('tickSpacing');
        
        if (!currency0 || !currency1 || !fee || !tickSpacing) {
          return NextResponse.json({ error: 'Missing pool parameters' }, { status: 400 });
        }
        
        const poolId = getPoolId(currency0, currency1, fee, tickSpacing);
        const swapCount = await hookContract.swapCount(poolId);
        
        return NextResponse.json({ 
          swapCount: swapCount.toString() 
        });
      }
      
      case 'getHookConstants': {
        // Get all constant fee tiers and thresholds from the contract
        const [baseFee, lowFee, midFee, highFee, extremeFee] = await Promise.all([
          hookContract.BASE_FEE(),
          hookContract.LOW_FEE(),
          hookContract.MID_FEE(),
          hookContract.HIGH_FEE(),
          hookContract.EXTREME_FEE()
        ]);
        
        const [lowVol, midVol, highVol, extremeVol] = await Promise.all([
          hookContract.LOW_VOLATILITY(),
          hookContract.MID_VOLATILITY(),
          hookContract.HIGH_VOLATILITY(),
          hookContract.EXTREME_VOLATILITY()
        ]);
        
        return NextResponse.json({
          feeTiers: {
            baseFee: baseFee.toNumber(),
            lowFee: lowFee.toNumber(),
            midFee: midFee.toNumber(),
            highFee: highFee.toNumber(),
            extremeFee: extremeFee.toNumber(),
            formattedBaseFee: formatFeePercentage(baseFee),
            formattedLowFee: formatFeePercentage(lowFee),
            formattedMidFee: formatFeePercentage(midFee),
            formattedHighFee: formatFeePercentage(highFee),
            formattedExtremeFee: formatFeePercentage(extremeFee)
          },
          volatilityThresholds: {
            lowVolatility: lowVol.toNumber(),
            midVolatility: midVol.toNumber(),
            highVolatility: highVol.toNumber(),
            extremeVolatility: extremeVol.toNumber(),
            formattedLowVolatility: (lowVol.toNumber() / 100) + "%",
            formattedMidVolatility: (midVol.toNumber() / 100) + "%",
            formattedHighVolatility: (highVol.toNumber() / 100) + "%",
            formattedExtremeVolatility: (extremeVol.toNumber() / 100) + "%"
          }
        });
      }
      
      case 'getHookInfo': {
        // Return information about the hook that users would need to create an LP
        // Get owner from contract
        const owner = await hookContract.owner();
        
        return NextResponse.json({
          hookAddress: HOOK_ADDRESS,
          poolManagerAddress: POOL_MANAGER_ADDRESS,
          positionManagerAddress: POSITION_MANAGER_ADDRESS,
          owner: owner,
          baseFee: (await hookContract.BASE_FEE()).toNumber(),
          formattedBaseFee: formatFeePercentage(await hookContract.BASE_FEE()),
          supportedPools: SUPPORTED_POOLS
        });
      }
      
      case 'getPoolInfo': {
        // Get all supported pools with their current fees and volumes
        try {
          const poolsWithData = await Promise.all(
            SUPPORTED_POOLS.map(async (pool) => {
              const poolKey = {
                currency0: pool.currency0,
                currency1: pool.currency1,
                fee: pool.fee,
                tickSpacing: pool.tickSpacing,
                hooks: pool.hooks
              };
              
              try {
                // Get current fee
                const currentFee = await hookContract.getCurrentFee(poolKey);
                
                // Get total volume
                const totalVolume = await hookContract.getTotalVolume(poolKey);
                
                // Get pool ID
                const poolId = getPoolId(pool.currency0, pool.currency1, pool.fee, pool.tickSpacing);
                
                // Get swap count
                const swapCount = await hookContract.swapCount(poolId);
                
                return {
                  ...pool,
                  currentFee: currentFee.toNumber(),
                  formattedCurrentFee: formatFeePercentage(currentFee),
                  totalVolume: totalVolume.toString(),
                  formattedVolume: ethers.utils.formatEther(totalVolume),
                  swapCount: swapCount.toString(),
                  poolId: poolId
                };
              } catch (error) {
                // This pool might not be initialized yet
                return {
                  ...pool,
                  currentFee: pool.fee,
                  formattedCurrentFee: formatFeePercentage(pool.fee),
                  totalVolume: "0",
                  formattedVolume: "0",
                  swapCount: "0",
                  poolId: getPoolId(pool.currency0, pool.currency1, pool.fee, pool.tickSpacing),
                  initialized: false
                };
              }
            })
          );
          
          return NextResponse.json({ pools: poolsWithData });
        } catch (error) {
          console.error('Error fetching pool info:', error);
          return NextResponse.json({ error: 'Failed to fetch pool information' }, { status: 500 });
        }
      }
      
      case 'getOwnerStatus': {
        // Check if a given address is the owner of the hook
        const address = searchParams.get('address');
        
        if (!address) {
          return NextResponse.json({ error: 'Missing address parameter' }, { status: 400 });
        }
        
        const owner = await hookContract.owner();
        const isOwner = owner.toLowerCase() === address.toLowerCase();
        
        return NextResponse.json({ 
          address,
          owner,
          isOwner
        });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST handler for actions that modify state
export async function POST(request) {
  try {
    const data = await request.json();
    
    switch (data.action) {
      case 'setEmergencyMode': {
        // NOTE: This is just API setup - in production you would need to:
        // 1. Authenticate that the caller is the owner
        // 2. Use a wallet with private key to sign transactions
        // 3. Implement proper security
        
        return NextResponse.json({ 
          success: false, 
          message: "This endpoint requires a proper authentication and signing mechanism. Frontend should use a wallet connection for this operation." 
        });
      }
      
      case 'updatePoolFee': {
        // Same security concerns as above
        return NextResponse.json({ 
          success: false, 
          message: "This endpoint requires a proper authentication and signing mechanism. Frontend should use a wallet connection for this operation." 
        });
      }
      
      case 'estimatePoolCreation': {
        // This endpoint could be used to estimate gas costs for pool creation
        // Note: This doesn't modify state, but it's more complex than a simple GET
        const { currency0, currency1, fee, tickSpacing } = data;
        
        if (!currency0 || !currency1 || !fee || !tickSpacing) {
          return NextResponse.json({ error: 'Missing pool parameters' }, { status: 400 });
        }
        
        // Check if the pool already exists
        const poolId = getPoolId(currency0, currency1, fee, tickSpacing);
        
        try {
          // Try to get pool data - if it succeeds, pool exists
          await hookContract.poolData(poolId);
          
          return NextResponse.json({ 
            exists: true,
            poolId,
            message: "Pool already exists" 
          });
        } catch (error) {
          // Pool doesn't exist yet, return information for creation
          return NextResponse.json({
            exists: false,
            poolId,
            poolKey: {
              currency0,
              currency1,
              fee: parseInt(fee),
              tickSpacing: parseInt(tickSpacing),
              hooks: HOOK_ADDRESS
            },
            estimatedGas: "500000", // Example value - actual gas estimation would require more logic
            hookAddress: HOOK_ADDRESS
          });
        }
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
