"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';

export default function CreateLiquidityPosition() {
  const { ready, authenticated, user, login } = usePrivy();
  const [hookInfo, setHookInfo] = useState(null);
  const [selectedPool, setSelectedPool] = useState(null);
  const [tickLower, setTickLower] = useState(-60);
  const [tickUpper, setTickUpper] = useState(60);
  const [amount0, setAmount0] = useState('');
  const [amount1, setAmount1] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchHookInfo() {
      try {
        const response = await fetch('/api/uniswap?action=getHookInfo');
        const data = await response.json();
        setHookInfo(data);
        if (data.supportedPools && data.supportedPools.length > 0) {
          setSelectedPool(data.supportedPools[0]);
        }
      } catch (err) {
        setError('Failed to load hook information: ' + err.message);
      }
    }

    if (ready) {
      fetchHookInfo();
    }
  }, [ready]);

  // Check if connected user is the hook owner
  useEffect(() => {
    async function checkOwnerStatus() {
      if (!authenticated || !user.wallet?.address) return;
      
      try {
        const response = await fetch(`/api/uniswap?action=getOwnerStatus&address=${user.wallet.address}`);
        const data = await response.json();
        setIsOwner(data.isOwner);
      } catch (err) {
        console.error('Failed to check owner status:', err);
      }
    }

    if (ready && authenticated && user.wallet?.address) {
      checkOwnerStatus();
    }
  }, [ready, authenticated, user]);

  // Handle pool selection
  const handlePoolSelect = (poolName) => {
    const pool = hookInfo.supportedPools.find(p => p.name === poolName);
    setSelectedPool(pool);
  };

  // Create liquidity position
  const createPosition = async () => {
    if (!authenticated) {
      login();
      return;
    }

    if (!selectedPool) {
      setError('Please select a pool');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Get the signer from Privy
      const provider = await user.wallet.getEthersProvider();
      const signer = provider.getSigner();
      
      // Load position manager ABI - this would be a simplified version
      const positionManagerAbi = [
        "function mint(tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 amount0Max, uint256 amount1Max, address recipient, uint256 deadline, bytes hookData) external returns (uint256 tokenId)"
      ];
      
      const positionManager = new ethers.Contract(
        hookInfo.positionManagerAddress,
        positionManagerAbi,
        signer
      );

      // Load token contracts for approvals
      const erc20Abi = ["function approve(address spender, uint256 amount) external returns (bool)"];
      
      const token0 = new ethers.Contract(selectedPool.currency0, erc20Abi, signer);
      const token1 = new ethers.Contract(selectedPool.currency1, erc20Abi, signer);
      
      // Convert amounts to wei with proper decimals
      const amount0Wei = ethers.utils.parseUnits(amount0, selectedPool.token0Decimals);
      const amount1Wei = ethers.utils.parseUnits(amount1, selectedPool.token1Decimals);
      
      // Approve tokens to position manager
      setSuccess('Approving tokens...');
      
      const approve0Tx = await token0.approve(hookInfo.positionManagerAddress, amount0Wei);
      await approve0Tx.wait();
      
      const approve1Tx = await token1.approve(hookInfo.positionManagerAddress, amount1Wei);
      await approve1Tx.wait();
      
      setSuccess('Tokens approved, creating position...');
      
      // Create pool key
      const poolKey = {
        currency0: selectedPool.currency0,
        currency1: selectedPool.currency1,
        fee: selectedPool.fee,
        tickSpacing: selectedPool.tickSpacing,
        hooks: hookInfo.hookAddress
      };
      
      // Calculate deadline 30 minutes from now
      const deadline = Math.floor(Date.now() / 1000) + 1800;
      
      // This is a simplified liquidity calculation - actual implementation would use proper math
      // For demonstration purposes only
      const liquidity = amount0Wei.mul(amount1Wei).sqrt();
      
      // Create position
      const mintTx = await positionManager.mint(
        poolKey,
        tickLower,
        tickUpper,
        liquidity,
        amount0Wei,
        amount1Wei,
        user.wallet.address,
        deadline,
        "0x" // No hook data
      );
      
      setSuccess('Transaction submitted, waiting for confirmation...');
      
      const receipt = await mintTx.wait();
      
      setSuccess(`Liquidity position created successfully! Transaction: ${receipt.transactionHash}`);
    } catch (err) {
      console.error('Error creating liquidity position:', err);
      setError(err.message || 'Failed to create liquidity position');
    } finally {
      setIsLoading(false);
    }
  };

  if (!ready || !hookInfo) {
    return <div className="p-8 text-center">Loading hook information...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Create Liquidity Position</h2>
          <p className="text-gray-600">Add liquidity to a pool with dynamic fees</p>
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
              <p className="font-bold">Success</p>
              <p>{success}</p>
            </div>
          )}
          
          {!authenticated ? (
            <div className="text-center p-4">
              <p className="mb-4">You need to connect your wallet to create a liquidity position</p>
              <button
                onClick={login}
                className="px-6 py-2 bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white rounded-full hover:opacity-90 transition-all"
              >
                Login with Privy
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Select Pool</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none"
                  value={selectedPool?.name}
                  onChange={(e) => handlePoolSelect(e.target.value)}
                >
                  <option value="">Select a pool</option>
                  {hookInfo?.supportedPools?.map((pool, index) => (
                    <option key={index} value={pool.name}>
                      {pool.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Continue with the rest of your form fields using similar styling */}
              
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
    </div>
  );
}