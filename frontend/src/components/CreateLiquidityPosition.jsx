"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function CreateLiquidityPosition() {
  // Basic states for pool selection and position parameters
  const [selectedPool, setSelectedPool] = useState("");
  const [poolOptions, setPoolOptions] = useState([]);
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");
  const [tickLower, setTickLower] = useState(-60);
  const [tickUpper, setTickUpper] = useState(60);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [hookInfo, setHookInfo] = useState(null);
  const [network, setNetwork] = useState(null);

  // Block explorer URLs for different networks
  const explorerUrls = {
    '0x2105': 'https://basescan.org', // Base Mainnet
    '0xaeef': 'https://alfajores.celoscan.io', // Celo Testnet
    '0xaa36a7': 'https://sepolia.etherscan.io' // Sepolia
  };

  // Network names mapping
  const networkNames = {
    '0x2105': 'Base Mainnet',
    '0xaeef': 'Celo Alfajores L2',
    '0xaa36a7': 'Sepolia Testnet'
  };

  // On component mount
  useEffect(() => {
    checkWalletConnection();
    fetchPoolInfo();
  }, []);

  // Check for MetaMask connection
  async function checkWalletConnection() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          setNetwork(chainId);
        }
        
        // Add listener for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  }

  // Handle account changes
  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setIsConnected(true);
    } else {
      setAccount(null);
      setIsConnected(false);
    }
  };

  // Handle network changes
  const handleChainChanged = (chainId) => {
    setNetwork(chainId);
    // Reload pool info when network changes
    fetchPoolInfo();
  };

  // Connect wallet function
  async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        setAccount(accounts[0]);
        setIsConnected(true);
        setNetwork(chainId);
      } catch (error) {
        console.error("Error connecting to MetaMask", error);
        setError("Failed to connect wallet: " + error.message);
      }
    } else {
      setError("MetaMask is not installed. Please install it to use this feature.");
    }
  }

  // Get network param based on current chainId
  const getNetworkParam = () => {
    if (!network) return 'base'; // Default to base
    
    if (network === '0x2105') return 'base';
    if (network === '0xaeef') return 'celo';
    if (network === '0xaa36a7') return 'sepolia';
    
    return 'base'; // Default fallback
  };

  // Fetch available pools
  async function fetchPoolInfo() {
    try {
      // Get the appropriate network parameter
      const networkParam = getNetworkParam();
      
      const response = await fetch(`/api/uniswap?action=getHookInfo&network=${networkParam}`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setHookInfo(data);
      if (data.supportedPools && data.supportedPools.length > 0) {
        setPoolOptions(data.supportedPools);
        setSelectedPool(data.supportedPools[0].name);
      }
    } catch (err) {
      console.error('Failed to load pool information:', err);
      setError('Failed to load pool information: ' + err.message);
    }
  }

  // Handle pool selection
  const handlePoolSelect = (e) => {
    setSelectedPool(e.target.value);
  };

  // Calculate price from tick
  const calculatePrice = (tick) => {
    return Math.pow(1.0001, tick);
  };

  // Get block explorer URL based on current network
  const getExplorerUrl = (txHash) => {
    if (!network || !explorerUrls[network]) {
      // Default to Base
      return `https://basescan.org/tx/${txHash}`;
    }
    return `${explorerUrls[network]}/tx/${txHash}`;
  };

  // Get the current network name for display
  const getCurrentNetworkName = () => {
    return networkNames[network] || 'Unknown Network';
  };

  // Create liquidity position
  const createPosition = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      connectWallet();
      return;
    }

    if (!selectedPool) {
      setError('Please select a pool first');
      return;
    }

    if (!amount0 || !amount1) {
      setError('Please enter valid token amounts');
      return;
    }

    if (!hookInfo) {
      setError('Hook information not loaded');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      // Get the selected pool data
      const pool = poolOptions.find(p => p.name === selectedPool);
      if (!pool) {
        throw new Error("Selected pool not found");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Verify we're on a supported network
      const currentNetwork = await provider.getNetwork();
      const chainId = "0x" + currentNetwork.chainId.toString(16);
      
      // Check if we're on a supported network
      const supportedNetworks = ['0x2105', '0xaeef', '0xaa36a7']; // Base, Celo, Sepolia
      if (!supportedNetworks.includes(chainId)) {
        throw new Error(`Please switch to a supported network (Base, Celo Alfajores or Sepolia). Current network: ${getCurrentNetworkName()}`);
      }

      // Position Manager ABI (simplified)
      const positionManagerAbi = [
        "function mint(tuple(address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline) params) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)"
      ];

      const positionManagerAddress = hookInfo.positionManagerAddress;
      const positionManager = new ethers.Contract(
        positionManagerAddress,
        positionManagerAbi,
        signer
      );

      // Format amounts based on token decimals
      const formattedAmount0 = ethers.parseUnits(
        amount0,
        pool.token0Decimals || 18
      );

      const formattedAmount1 = ethers.parseUnits(
        amount1,
        pool.token1Decimals || 18
      );

      // Add 20 minutes to current time for deadline
      const deadline = Math.floor(Date.now() / 1000) + 1200;

      // Create mint parameters
      const mintParams = {
        token0: pool.currency0,
        token1: pool.currency1,
        fee: pool.fee,
        tickLower: tickLower,
        tickUpper: tickUpper,
        amount0Desired: formattedAmount0,
        amount1Desired: formattedAmount1,
        amount0Min: 0, // Set minimum amounts to 0 for simplicity
        amount1Min: 0, // In production, calculate slippage
        recipient: await signer.getAddress(),
        deadline: deadline
      };

      setSuccess('Creating position... Please confirm the transaction in your wallet.');

      // Execute the mint transaction
      const tx = await positionManager.mint(mintParams, {
        gasLimit: 3000000
      });

      setSuccess(`Transaction submitted! Waiting for confirmation...`);

      const receipt = await tx.wait();

      // Check if the transaction was successful
      if (receipt && receipt.status === 1) {
        setSuccess(`Position created successfully! <a href="${getExplorerUrl(tx.hash)}" target="_blank" class="text-blue-500 underline">View on Explorer</a>`);
      } else {
        throw new Error("Transaction failed");
      }
    } catch (err) {
      console.error('Error creating liquidity position:', err);
      setError(err.message || 'Failed to create liquidity position');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-6 mt-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Create Liquidity Position</h2>
        <p className="text-gray-600">Add liquidity to a pool with dynamic fees</p>
        {network && (
          <div className="mt-2 text-sm text-blue-600">
            Connected to: {getCurrentNetworkName()}
          </div>
        )}
      </div>
      
      <div className="space-y-6">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
            <p className="font-bold">Status</p>
            <p dangerouslySetInnerHTML={{ __html: success }}></p>
          </div>
        )}
        
        {!isConnected ? (
          <div className="text-center p-4">
            <p className="mb-4">You need to connect your wallet to create a liquidity position</p>
            <button
              onClick={connectWallet}
              className="px-6 py-2 bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white rounded-full hover:opacity-90 transition-all"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Select Pool</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none"
                value={selectedPool}
                onChange={handlePoolSelect}
              >
                <option value="">Select a pool</option>
                {poolOptions.map((pool, index) => (
                  <option key={index} value={pool.name}>
                    {pool.name}
                  </option>
                ))}
              </select>
              {poolOptions.length === 0 && (
                <p className="text-sm text-yellow-600">
                  No pools available for the current network. Please switch to a supported network.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Token0 Amount
                </label>
                <input
                  type="number"
                  value={amount0}
                  onChange={(e) => setAmount0(e.target.value)}
                  placeholder="0.0"
                  min="0"
                  step="0.000001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Token1 Amount
                </label>
                <input
                  type="number"
                  value={amount1}
                  onChange={(e) => setAmount1(e.target.value)}
                  placeholder="0.0"
                  min="0"
                  step="0.000001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Lower Price Bound (Tick)
                </label>
                <input
                  type="number"
                  value={tickLower}
                  onChange={(e) => setTickLower(parseInt(e.target.value))}
                  placeholder="-60"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Upper Price Bound (Tick)
                </label>
                <input
                  type="number"
                  value={tickUpper}
                  onChange={(e) => setTickUpper(parseInt(e.target.value))}
                  placeholder="60"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none"
                />
              </div>
            </div>
            
            <button
              onClick={createPosition}
              disabled={isLoading || !selectedPool || !amount0 || !amount1}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white rounded-full hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Position...' : 'Create Position'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}