"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";

export default function Navbar() {
  const { login, ready, authenticated, user, logout } = usePrivy();
  const [selectedPill, setSelectedPill] = useState(null);
  const [account, setAccount] = useState(null);
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);

  useEffect(() => {
    // Check localStorage after component mounts
    const pill = localStorage.getItem("selectedPill");
    setSelectedPill(pill);
    
    // Check if MetaMask is available
    checkMetaMaskConnection();
  }, []);

  // Check if MetaMask is installed and connected
  const checkMetaMaskConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Get accounts
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsMetaMaskConnected(true);
          
          // Get current network
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          updateSelectedNetwork(chainId);
        }

        // Setup listeners for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsMetaMaskConnected(true);
          } else {
            setAccount(null);
            setIsMetaMaskConnected(false);
          }
        });

        // Listen for chain changes
        window.ethereum.on('chainChanged', (chainId) => {
          updateSelectedNetwork(chainId);
        });
      } catch (error) {
        console.error("Error checking MetaMask connection:", error);
      }
    }
  };

  const updateSelectedNetwork = (chainId) => {
    // Convert chainId to appropriate network key
    if (chainId === '0x14a33' || chainId === '84531') { // Base Goerli (testnet)
      setSelectedPill('base');
      localStorage.setItem("selectedPill", "base");
    } else if (chainId === '0xaeef' || chainId === '44787') { // Celo Alfajores Testnet
      setSelectedPill('celo');
      localStorage.setItem("selectedPill", "celo");
    } else if (chainId === '0xaa36a7' || chainId === '11155111') { // Sepolia - Fixed decimal value
      setSelectedPill('sepolia');
      localStorage.setItem("selectedPill", "sepolia");
    } else if (chainId === '0x2105' || chainId === '8453') { // Base mainnet - Fixed decimal value
      setSelectedPill('base');
      localStorage.setItem("selectedPill", "base");
    }
  };

  // Connect to MetaMask
  const connectMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setIsMetaMaskConnected(true);
        
        // Get current network after connection
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        updateSelectedNetwork(chainId);
      } catch (error) {
        console.error("User rejected the connection request", error);
      }
    } else {
      alert("MetaMask is not installed. Please install it to use this feature.");
    }
  };

  // Disconnect from MetaMask (this is just UI, can't really disconnect)
  const disconnectMetaMask = () => {
    setAccount(null);
    setIsMetaMaskConnected(false);
  };

  // Switch network in MetaMask
  const switchNetwork = async (networkName) => {
    if (typeof window.ethereum === 'undefined') {
      alert("MetaMask is not installed. Please install it to use this feature.");
      return;
    }

    try {
      // Network parameters for different networks
      let params;
      if (networkName === 'base') {
        // Base Mainnet
        params = {
          chainId: '0x2105', // 8453 in hex
          chainName: 'Base Mainnet',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: ['https://mainnet.base.org'],
          blockExplorerUrls: ['https://basescan.org']
        };
      } else if (networkName === 'celo') {
        // Celo Alfajores L2 Testnet
        params = {
          chainId: '0xaeef', // 44787 in hex
          chainName: 'Celo Alfajores',
          nativeCurrency: {
            name: 'CELO',
            symbol: 'CELO',
            decimals: 18
          },
          rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
          blockExplorerUrls: ['https://alfajores.celoscan.io', 'https://celo-alfajores.blockscout.com/']
        };
      } else if (networkName === 'sepolia') {
        // Sepolia testnet
        params = {
          chainId: '0xaa36a7', // 11155111 in hex
          chainName: 'Sepolia Testnet',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: ['https://rpc.sepolia.org'],
          blockExplorerUrls: ['https://sepolia.etherscan.io']
        };
      }

      // Try to switch to the network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: params.chainId }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [params],
          });
        } else {
          throw switchError;
        }
      }

      setSelectedPill(networkName);
      localStorage.setItem("selectedPill", networkName);
    } catch (error) {
      console.error(`Error switching to ${networkName}:`, error);
      alert(`Failed to switch to ${networkName}. ${error.message}`);
    }
  };

  const networkConfig = {
    base: {
      name: "Base Mainnet",
      icon: "https://payload-marketing.moonpay.com/api/media/file/base%20logo.webp",
      color: "#0052FF",
    },
    celo: {
      name: "Celo Alfajores",
      icon: "https://celo.org/favicon.ico",
      color: "#FBCC5C",
    },
    sepolia: {
      name: "Sepolia Testnet",
      icon: "https://images.seeklogo.com/logo-png/40/2/ethereum-logo-png_seeklogo-407463.png",
      color: "#627EEA",
    },
  };

  // Network selection buttons instead of dropdown
  const NetworkButtons = () => (
    <div className="flex items-center space-x-2 ml-4">
      {Object.keys(networkConfig).map((network) => (
        <button
          key={network}
          onClick={() => switchNetwork(network)}
          className={`
            flex items-center px-4 py-2 rounded-full transition-all hover:scale-[1.02]
            ${selectedPill === network 
              ? "border-2 border-gray-300 bg-white" 
              : "border-2 border-gray-200 hover:border-gray-300 bg-white"
            }
          `}
        >
          <img
            src={networkConfig[network].icon}
            alt={`${networkConfig[network].name} icon`}
            className="w-5 h-5 rounded-full mr-2"
          />
          <span className="text-sm font-medium">
            {networkConfig[network].name}
          </span>
        </button>
      ))}
    </div>
  );

  if (!selectedPill) {
    return (
      <nav className="fixed top-0 w-full backdrop-blur-md bg-transparent shadow-sm3 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/app" className="text-2xl font-bold">
            <img
              src="/logo.png"
              alt="Frenz.fi Logo"
              className="h-8 inline-block mr-2"
            />
            Frenz.fi
          </a>
          <div>
            <NetworkButtons />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 w-full backdrop-blur-md bg-transparent shadow-sm3 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <a href="/app" className="text-2xl font-bold">
          <img
            src="/logo.png"
            alt="Frenz.fi Logo"
            className="h-8 inline-block mr-2"
          />
          Frenz.fi
        </a>
        <>
          <div className="flex items-center">
            <NetworkButtons />
            
            {/* Display MetaMask address if connected */}
            {isMetaMaskConnected && account && (
              <span className="text-sm mx-3 text-gray-600">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            )}
            
            {/* MetaMask Connect/Disconnect Button */}
            <div
              className={`${
                isMetaMaskConnected
                  ? "p-[2px] bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] rounded-full"
                  : ""
              }`}>
              <button
                onClick={isMetaMaskConnected ? disconnectMetaMask : connectMetaMask}
                className={`px-6 py-2 rounded-full font-bold ${
                  isMetaMaskConnected
                    ? "bg-white hover:bg-transparent text-black hover:text-white"
                    : "bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white"
                } hover:opacity-90 transition-all transform hover:scale-105`}>
                {isMetaMaskConnected ? "Disconnect" : "Connect Wallet"}
              </button>
            </div>
          </div>
        </>
      </div>
    </nav>
  );
}