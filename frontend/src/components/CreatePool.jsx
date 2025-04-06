"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const NETWORK_TOKENS = {
  'base': { // Base Mainnet
    USDC: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
    WETH: '0x4200000000000000000000000000000000000006',
    DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb'
  },
  'celo': { // Celo Alfajores
    CELO: '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9',
    cUSD: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1'
  },
  'ethereum': { // Sepolia
    WETH: '0x7af963cF6D228E564e2A0aA0DdBF06210B38615D',
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
  }
};

export default function CreatePool() {
  const [hookInfo, setHookInfo] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  
  // Token and Pool Configuration
  const [token0Address, setToken0Address] = useState('');
  const [token1Address, setToken1Address] = useState('');
  const [fee, setFee] = useState(500); // Default to 0.05%
  const [tickSpacing, setTickSpacing] = useState(10);
  const [token0Symbol, setToken0Symbol] = useState('');
  const [token1Symbol, setToken1Symbol] = useState('');
  const [token0Decimals, setToken0Decimals] = useState(18);
  const [token1Decimals, setToken1Decimals] = useState(18);
  const [initialPrice, setInitialPrice] = useState('');
  
  // UI and Transaction States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1);
  const [txHash, setTxHash] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);

  // Fee and Tick Spacing Options
  const feeOptions = [
    { value: 500, label: '0.05% (Base fee)' },
    { value: 1000, label: '0.1% (Low fee)' },
    { value: 3000, label: '0.3% (Medium fee)' },
  ];

  const tickSpacingOptions = [
    { value: 10, label: '10 (Recommended for 0.05% fee)' },
    { value: 60, label: '60 (Recommended for 0.3% fee)' },
  ];

  // Block explorer URLs for different networks
  const explorerUrls = {
    '0x2105': 'https://basescan.org', // Base Mainnet
    '0x44d': 'https://alfajores.celoscan.io', // Celo Testnet
    '0xaa36a7': 'https://sepolia.etherscan.io' // Sepolia
  };

  // Check wallet connection on component mount
  useEffect(() => {
    checkWalletConnection();
    fetchHookInfo();
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
    // Reset some states when network changes
    setError('');
    setTxHash('');
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

  // Fetch Hook Information
  async function fetchHookInfo() {
    try {
      const response = await fetch('/api/uniswap?action=getHookInfo');
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setHookInfo(data);
    } catch (err) {
      console.error('Failed to load hook information:', err);
      setError('Failed to load hook information: ' + err.message);
    }
  }

  useEffect(() => {
    // Get initial selected network from localStorage
    const storedNetwork = localStorage.getItem("selectedPill");
    // Set default token addresses when network changes
    if (NETWORK_TOKENS[storedNetwork]) {
      const tokens = Object.entries(NETWORK_TOKENS[storedNetwork]);
      if (tokens.length >= 2) {
        // Set first token as token0
        const [symbol0, address0] = tokens[0];
        setToken0Address(address0);
        setToken0Symbol(symbol0);
        
        // Set second token as token1
        const [symbol1, address1] = tokens[1];
        setToken1Address(address1);
        setToken1Symbol(symbol1);
        
        // Lookup additional token info
        lookupTokenInfo(address0, setToken0Symbol, setToken0Decimals);
        lookupTokenInfo(address1, setToken1Symbol, setToken1Decimals);
      }
    } else {
      // Reset token fields if network not supported
      setToken0Address('');
      setToken1Address('');
      setToken0Symbol('');
      setToken1Symbol('');
      setToken0Decimals(18);
      setToken1Decimals(18);
    }
  }, []);

  // Check Owner Status
  useEffect(() => {
    async function checkOwnerStatus() {
      if (!isConnected || !account) return;
      
      try {
        const response = await fetch(`/api/uniswap?action=getOwnerStatus&address=${account}`);
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setIsOwner(data.isOwner);
      } catch (err) {
        console.error('Failed to check owner status:', err);
      }
    }

    if (isConnected && account) {
      checkOwnerStatus();
    }
  }, [isConnected, account]);

  // Token Information Lookup
  const lookupTokenInfo = async (address, setSymbol, setDecimals) => {
    if (!address || address.trim() === '') return;
    
    // Simple address validation
    if (!address.startsWith('0x') || address.length !== 42) {
      setError('Invalid token address format');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Try direct contract call first
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const tokenAbi = [
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)"
          ];
          
          const tokenContract = new ethers.Contract(address, tokenAbi, provider);
          
          // Get token details
          let symbol, decimals;
          
          try { 
            symbol = await tokenContract.symbol(); 
            setSymbol(symbol);
          } catch (e) { 
            console.warn("Error getting symbol:", e);
          }
          
          try { 
            decimals = await tokenContract.decimals(); 
            setDecimals(Number(decimals));
          } catch (e) { 
            console.warn("Error getting decimals:", e);
          }
          
          if (symbol) {
            // If we got at least the symbol, consider it a success
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Error getting token info directly:", e);
          // Fall back to API route
        }
      }
      
      // Fallback to API route
      const response = await fetch(`/api/token-info?address=${address}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch token info: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.symbol) {
        setSymbol(data.symbol);
      }
      
      if (data.decimals) {
        setDecimals(Number(data.decimals));
      }
    } catch (err) {
      console.error("Error looking up token info:", err);
      // Not setting error here to allow manual entry
      // Instead, prompt user to enter manually
      setSymbol('');
      setDecimals(18);
    } finally {
      setIsLoading(false);
    }
  };

  // Create Pool Transaction
  const createPool = async () => {
    // Validation checks
    if (!isConnected) {
      connectWallet();
      return;
    }

    if (!token0Address || !token1Address) {
      setError('Please enter valid token addresses');
      return;
    }

    if (!initialPrice || parseFloat(initialPrice) <= 0) {
      setError('Please enter a valid initial price');
      return;
    }

    if (!hookInfo) {
      setError('Hook information not loaded');
      return;
    }

    // Reset transaction states
    setIsLoading(true);
    setError('');
    setSuccess('');
    setTxHash('');

    try {
      // Provider selection
      if (!window.ethereum) {
        throw new Error("No Ethereum provider found. Please install MetaMask.");
      }

      // Create provider and get network information
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const chainId = "0x" + network.chainId.toString(16);
      
      // Verify connected to a supported network
      const supportedNetworks = ['0x2105', '0x44d', '0xaa36a7']; // Base Mainnet, Celo Testnet, Sepolia
      const networkNames = {
        '0x2105': 'Base Mainnet',
        '0x44d': 'Celo Testnet',
        '0xaa36a7': 'Sepolia Testnet'
      };
      
      if (!supportedNetworks.includes(chainId)) {
        throw new Error(`Please switch to a supported network (Base Mainnet, Celo Testnet, or Sepolia Testnet). Current network: ${networkNames[chainId] || 'Unknown'}`);
      }

      const signer = await provider.getSigner();
      
      // Verify signer address
      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() !== account.toLowerCase()) {
        throw new Error("Wallet address mismatch");
      }

      // Token validation contracts
      const tokenAbi = [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)"
      ];

      const token0Contract = new ethers.Contract(token0Address, tokenAbi, signer);
      const token1Contract = new ethers.Contract(token1Address, tokenAbi, signer);

      // Fetch and validate token details with error handling
      let token0Name = "", token0Symbol = "", token0Decimals = 18;
      let token1Name = "", token1Symbol = "", token1Decimals = 18;
      
      try {
        // Try to get token0 details - handle each call separately to avoid Promise.all failing completely
        try { token0Name = await token0Contract.name(); } catch (e) { token0Name = "Unknown Token"; }
        try { token0Symbol = await token0Contract.symbol(); } catch (e) { token0Symbol = "TKN0"; }
        try { token0Decimals = await token0Contract.decimals(); } catch (e) { token0Decimals = 18; }
        
        // Try to get token1 details
        try { token1Name = await token1Contract.name(); } catch (e) { token1Name = "Unknown Token"; }
        try { token1Symbol = await token1Contract.symbol(); } catch (e) { token1Symbol = "TKN1"; }
        try { token1Decimals = await token1Contract.decimals(); } catch (e) { token1Decimals = 18; }
      } catch (err) {
        console.error("Error fetching token details:", err);
        // Continue with defaults if there's an error
      }

      // Update state with fetched token details
      setToken0Symbol(token0Symbol);
      setToken0Decimals(Number(token0Decimals));
      setToken1Symbol(token1Symbol);
      setToken1Decimals(Number(token1Decimals));

      // Sort tokens (Uniswap requirement)
      let [sortedToken0, sortedToken1] = token0Address.toLowerCase() < token1Address.toLowerCase() 
        ? [token0Address, token1Address] 
        : [token1Address, token0Address];

      // Factory ABI for pool creation
      const factoryAbi = [
        "function createAndInitializePoolIfNecessary(address token0, address token1, uint24 fee, uint160 sqrtPriceX96) external payable returns (address pool)"
      ];
      
      const factoryAddress = hookInfo.poolManagerAddress;
      const factory = new ethers.Contract(factoryAddress, factoryAbi, signer);
      
      // Convert price to sqrtPriceX96
      const price = parseFloat(initialPrice);
      const sqrtPrice = Math.sqrt(price);
      const sqrtPriceX96 = BigInt(Math.floor(sqrtPrice * 2**96));
      
      setSuccess('Creating pool... Please confirm the transaction.');
      
      // Create and initialize pool
      const tx = await factory.createAndInitializePoolIfNecessary(
        sortedToken0,
        sortedToken1,
        fee,
        sqrtPriceX96,
        { gasLimit: BigInt(3000000) }
      );
      
      setTxHash(tx.hash);
      setSuccess(`Transaction submitted! Waiting for confirmation...`);
      
      const receipt = await tx.wait();
      
      if (receipt && receipt.status === 1) {
        setSuccess(`Pool created successfully! Transaction hash: ${tx.hash}`);
        setStep(2);
      } else {
        throw new Error("Transaction failed");
      }
    } catch (err) {
      console.error('Error creating pool:', err);
      
      // Detailed error handling
      if (err.message.includes("wallet") || err.message.includes("provider")) {
        setError('Wallet connection failed. Please reconnect.');
      } else if (err.message.includes("network")) {
        setError('Please switch to a supported network (Base Mainnet, Celo Testnet, or Sepolia Testnet)');
      } else {
        setError(err.message || 'Failed to create pool');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form for creating another pool
  const resetForm = () => {
    setStep(1);
    setToken0Address('');
    setToken1Address('');
    setToken0Symbol('');
    setToken1Symbol('');
    setInitialPrice('');
    setSuccess('');
    setError('');
    setTxHash('');
  };

  // Get explorer URL based on current network
  const getExplorerUrl = (txHash) => {
    if (!network || !explorerUrls[network]) {
      // Default to Base
      return `https://basescan.org/tx/${txHash}`;
    }
    return `${explorerUrls[network]}/tx/${txHash}`;
  };

  // Get network name
  const getNetworkName = () => {
    const names = {
      '0x2105': 'Base Mainnet',
      '0x44d': 'Celo Testnet',
      '0xaa36a7': 'Sepolia Testnet'
    };
    return network ? (names[network] || 'Unknown Network') : 'Not Connected';
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-6 mt-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Create New Pool with Dynamic Fees</h2>
        <p className="text-gray-600">
          Create a Uniswap v4 liquidity pool with our Dynamic Fee Hook.
          Fees will automatically adjust from 0.05% to 3% based on market conditions.
        </p>
        {network && (
          <div className="mt-2 text-sm text-blue-600">
            Connected to: {getNetworkName()}
          </div>
        )}
      </div>
      
      {step === 1 && (
        <div className="space-y-6">
          {!isConnected ? (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="mb-4">Connect your wallet to create a new pool</p>
              <button
                onClick={connectWallet}
                className="px-6 py-2 bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white rounded-full hover:opacity-90 transition-all"
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                  <p className="font-bold">Error</p>
                  <p>{error}</p>
                </div>
              )}
              
              {success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
                  <p className="font-bold">Status</p>
                  <p>{success}</p>
                  {txHash && (
                    <p className="mt-2">
                      <a 
                        href={getExplorerUrl(txHash)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 underline"
                      >
                        View on Block Explorer
                      </a>
                    </p>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Token 0 Address Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Token 0 Address</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={token0Address}
                      onChange={(e) => setToken0Address(e.target.value)}
                      onBlur={() => lookupTokenInfo(token0Address, setToken0Symbol, setToken0Decimals)}
                      placeholder="0x..."
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none"
                    />
                    <button
                      onClick={() => lookupTokenInfo(token0Address, setToken0Symbol, setToken0Decimals)}
                      className="px-4 py-2 bg-gray-100 border border-gray-300 border-l-0 rounded-r-lg hover:bg-gray-200"
                    >
                      Lookup
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm text-gray-600">Symbol</label>
                      <input
                        type="text"
                        value={token0Symbol}
                        onChange={(e) => setToken0Symbol(e.target.value)}
                        placeholder="Token Symbol"
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Decimals</label>
                      <input
                        type="number"
                        value={token0Decimals}
                        onChange={(e) => setToken0Decimals(Number(e.target.value))}
                        placeholder="18"
                        min="0"
                        max="18"
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Token 1 Address Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Token 1 Address</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={token1Address}
                      onChange={(e) => setToken1Address(e.target.value)}
                      onBlur={() => lookupTokenInfo(token1Address, setToken1Symbol, setToken1Decimals)}
                      placeholder="0x..."
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none"
                    />
                    <button
                      onClick={() => lookupTokenInfo(token1Address, setToken1Symbol, setToken1Decimals)}
                      className="px-4 py-2 bg-gray-100 border border-gray-300 border-l-0 rounded-r-lg hover:bg-gray-200"
                    >
                      Lookup
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm text-gray-600">Symbol</label>
                      <input
                        type="text"
                        value={token1Symbol}
                        onChange={(e) => setToken1Symbol(e.target.value)}
                        placeholder="Token Symbol"
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Decimals</label>
                      <input
                        type="number"
                        value={token1Decimals}
                        onChange={(e) => setToken1Decimals(Number(e.target.value))}
                        placeholder="18"
                        min="0"
                        max="18"
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fee Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Base Fee</label>
                  <select
                    value={fee}
                    onChange={(e) => setFee(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none"
                  >
                    {feeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="text-sm text-gray-600">
                    This is the starting fee. The hook will adjust it dynamically based on volume and volatility.
                  </div>
                </div>
                
                {/* Tick Spacing */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Tick Spacing</label>
                  <select
                    value={tickSpacing}
                    onChange={(e) => setTickSpacing(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none"
                  >
                    {tickSpacingOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="text-sm text-gray-600">
                    Tick spacing affects price ranges and liquidity concentration.
                  </div>
                </div>
              </div>
              
              {/* Initial Price */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Initial Price ({token1Symbol || "Token1"}/{token0Symbol || "Token0"})
                </label>
                <input
                  type="number"
                  value={initialPrice}
                  onChange={(e) => setInitialPrice(e.target.value)}
                  placeholder="1.0"
                  min="0"
                  step="0.000001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none"
                />
                <div className="text-sm text-gray-600">
                  This sets the initial price for the new pool.
                </div>
              </div>
              
              <button
                onClick={createPool}
                disabled={isLoading || !token0Address || !token1Address || !initialPrice}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white rounded-full hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Pool...' : 'Create Pool'}
              </button>
            </>
          )}
        </div>
      )}
      
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
            <p className="font-bold">Pool Created Successfully!</p>
            <p className="mt-2">
              Your pool creation transaction has been confirmed. The pool is now available for liquidity provision.
            </p>
            {txHash && (
              <p className="mt-2">
                <a 
                  href={getExplorerUrl(txHash)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 underline"
                >
                  View transaction on Block Explorer
                </a>
              </p>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={resetForm}
              className="px-6 py-2 border-2 border-[#0052FF] text-[#0052FF] rounded-full hover:bg-[#0052FF] hover:text-white transition-all"
            >
              Create Another Pool
            </button>
            
            <button
              onClick={() => window.location.href = '/add-liquidity'}
              className="px-6 py-2 bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white rounded-full hover:opacity-90 transition-all"
            >
              Add Liquidity
            </button>
          </div>
        </div>
      )}
    </div>
  );
}