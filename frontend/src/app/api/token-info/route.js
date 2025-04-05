// app/api/token-info/route.js
import { NextResponse } from "next/server";
import { ethers } from "ethers";

// Base RPC URL
const BASE_RPC_URL = "https://base-mainnet.g.alchemy.com/v2/GbQIfyw0myWOarypoVsyfL_nxPn4SWCk";

// Token ABI - minimal for looking up token info
const tokenAbi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

// Common tokens cache to avoid repeated RPC calls
const COMMON_TOKENS = {
  "0x4200000000000000000000000000000000000006": { 
    symbol: "WETH", 
    name: "Wrapped Ether", 
    decimals: 18 
  },
  "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": { 
    symbol: "USDC", 
    name: "USD Coin", 
    decimals: 6 
  },
  "0x27d2decb4bfc9c76f0309b8e88dec3a601fe25a8": { 
    symbol: "BALD", 
    name: "Based Bald", 
    decimals: 18 
  },
  "0xf34d508f72a9c59594d02df2742f8abc67bec0a7": { 
    symbol: "DEGEN", 
    name: "Degen", 
    decimals: 18 
  },
  "0x4ed4e862860bed51a9570b96d89af5e1b0efefed": { 
    symbol: "DEGEN", 
    name: "Degen", 
    decimals: 18
  }
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address")?.toLowerCase();
  const chain = searchParams.get("chain") || "base";
  
  if (!address || !address.startsWith("0x")) {
    return NextResponse.json({ error: "Invalid address format" }, { status: 400 });
  }
  
  try {
    // Check if it's a common token we already know
    if (COMMON_TOKENS[address]) {
      return NextResponse.json({
        ...COMMON_TOKENS[address],
        address: address,
        chain: chain
      });
    }
    
    // Use Base RPC endpoint to look up the token
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    
    // Create contract instance
    const tokenContract = new ethers.Contract(address, tokenAbi, provider);
    
    // Get token info in parallel for efficiency
    const [name, symbol, decimals] = await Promise.all([
      tokenContract.name().catch(() => "Unknown Token"),
      tokenContract.symbol().catch(() => "UNKNOWN"),
      tokenContract.decimals().catch(() => 18)
    ]);
    
    // Store this token for future reference
    COMMON_TOKENS[address] = { name, symbol, decimals };
    
    return NextResponse.json({
      name,
      symbol,
      decimals,
      address,
      chain
    });
  } catch (error) {
    console.error("Error fetching token info:", error);
    
    // Return a fallback response with error information
    return NextResponse.json({ 
      symbol: "UNKNOWN",
      name: "Unknown Token",
      decimals: 18,
      address: address,
      chain: chain,
      error: error.message
    }, { status: 200 }); // Still return 200 to prevent UI breakage
  }
}