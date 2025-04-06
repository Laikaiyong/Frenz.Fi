"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

// ABI containing just the functions we need
const TOKEN_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "publicMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "newSymbol",
        "type": "string"
      }
    ],
    "name": "setCustomSymbol",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function LaunchForm() {
  const [formData, setFormData] = useState({
    ticker: "",
    name: "",
    image: null,
    brandingKit: null,
    description: "",
    mintAmount: "1000", // Default value for minting
    socials: {
      twitter: "",
      telegram: "",
      discord: "",
    },
  });

  const [transactionStatus, setTransactionStatus] = useState("");
  const [tokenBalance, setTokenBalance] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  
  // Contract addresses for different networks
  const contractAddresses = {
    // Base Mainnet
    "0x2105": "0x7F5a5a672EDa96dE749fAAF2D0ad74Cf93f9cb70", // 8453 in hex
    // Sepolia Testnet
    "0xaa36a7": "0x439c14569af254ea3d20Bdcd75481CB29919524C", // 11155111 in hex
    // Celo Testnet (Alfajores)
    "0xaeef": "0x1022f54BE54E5BD3161F090356cB1356e5c69c92" // 44787 in hex
  };

  const [imagePreview, setImagePreview] = useState(null);
  const [brandingFiles, setBrandingFiles] = useState([]);

  // Check for connected wallet on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Get current network
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          setNetwork(chainId);
          
          // Get accounts without prompting
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            fetchTokenBalance(accounts[0], chainId);
          }
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          
          // Listen for chain changes
          window.ethereum.on('chainChanged', (chainId) => {
            setNetwork(chainId);
            // Reload balance on chain change
            if (account) {
              fetchTokenBalance(account, chainId);
            }
          });
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };
    
    checkWalletConnection();
    
    // Cleanup listeners on unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        // Fix: Don't pass null as a listener
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  // Handle account changes
  const handleAccountsChanged = async (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      // Get current chain ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      fetchTokenBalance(accounts[0], chainId);
    } else {
      setAccount(null);
      setTokenBalance("0");
    }
  };

  // Get the contract address for the current network
  const getContractAddress = (chainId) => {
    return contractAddresses[chainId] || null;
  };

  // Fetch token balance for the connected account
  const fetchTokenBalance = async (address, chainId) => {
    const contractAddress = getContractAddress(chainId);
    
    if (!contractAddress) {
      setTokenBalance("0");
      setTransactionStatus("Please switch to a supported network (Base Mainnet, Sepolia, or Celo Alfajores)");
      return;
    }
    
    try {
      // Create ethers provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      const tokenContract = new ethers.Contract(contractAddress, TOKEN_ABI, provider);
      const balance = await tokenContract.balanceOf(address);
      setTokenBalance(ethers.formatUnits(balance, 18));
      setTransactionStatus("");
    } catch (error) {
      console.error("Error fetching token balance:", error);
      setTokenBalance("0");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBrandingKitChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, brandingKit: file });
      setBrandingFiles([file]); // Show file name in preview
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if already connected via navbar
    if (!account) {
      setTransactionStatus("Please connect your wallet using the Connect Wallet button in the navbar");
      return;
    }
    
    // Get current chain ID
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const contractAddress = getContractAddress(chainId);
    
    if (!contractAddress) {
      setTransactionStatus("Please switch to a supported network (Base Mainnet, Sepolia, or Celo Alfajores)");
      return;
    }
    
    setIsLoading(true);
    setTransactionStatus("Processing transaction...");
    
    try {
      // Initialize ethers provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Create contract instance
      const tokenContract = new ethers.Contract(contractAddress, TOKEN_ABI, signer);
      
      // Set custom token symbol if provided
      if (formData.ticker) {
        setTransactionStatus("Setting custom symbol...");
        const symbolTx = await tokenContract.setCustomSymbol(formData.ticker);
        await symbolTx.wait();
        setTransactionStatus("Custom symbol set successfully. Minting tokens...");
      }
      
      // Mint tokens - convert amount to wei (18 decimals)
      const mintAmount = ethers.parseUnits(formData.mintAmount.toString(), 18);
      setTransactionStatus("Minting tokens...");
      const mintTx = await tokenContract.publicMint(mintAmount);
      
      // Wait for transaction to be mined
      await mintTx.wait();
      
      // Update token balance
      await fetchTokenBalance(account, chainId);
      
      setTransactionStatus(`🎉 Successfully minted ${formData.mintAmount} tokens with symbol ${formData.ticker || "default"}!`);
      
      // You could add code here to upload the image and metadata to your server
      // for example uploadImageAndMetadata(formData);
      
    } catch (error) {
      console.error("Transaction error:", error);
      setTransactionStatus("Transaction failed: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mt-20">
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-xl space-y-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400 mb-6">
          Launch Your Token
        </h2>

        {account && (
          <div className="p-3 bg-blue-50 rounded-md mb-4">
            <p className="text-sm text-blue-800">
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </p>
            {network && (
              <p className="text-sm text-blue-800">
                Network: {
                  network === "0x2105" ? "Base Mainnet" :
                  network === "0xaa36a7" ? "Sepolia Testnet" :
                  network === "0xaeef" ? "Celo Alfajores" :
                  "Unsupported Network"
                }
              </p>
            )}
            {tokenBalance !== "0" && (
              <p className="text-sm text-blue-800">Token Balance: {parseFloat(tokenBalance).toLocaleString()} {formData.ticker || "MTK"}</p>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Token Ticker (Sets your custom symbol)
            </label>
            <input
              type="text"
              value={formData.ticker}
              onChange={(e) =>
                setFormData({ ...formData, ticker: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00f0ff] focus:border-[#00f0ff] outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Token Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00f0ff] focus:border-[#00f0ff] outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00f0ff] focus:border-[#00f0ff] outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm"
              rows="4"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Mint Amount
            </label>
            <input
              type="number"
              value={formData.mintAmount}
              onChange={(e) =>
                setFormData({ ...formData, mintAmount: e.target.value })
              }
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00f0ff] focus:border-[#00f0ff] outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Token Image
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleImageChange}
                className="hidden"
                id="token-image"
              />
              <label
                htmlFor="token-image"
                className="px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:border-[#00f0ff] transition-all duration-200 bg-white/50 backdrop-blur-sm">
                Choose File
              </label>
              {imagePreview && (
                <div className="relative w-16 h-16">
                  <img
                    src={imagePreview}
                    alt="Token preview"
                    className="w-16 h-16 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Branding Kit (ZIP)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".zip"
                onChange={handleBrandingKitChange}
                className="hidden"
                id="branding-kit"
              />
              <label
                htmlFor="branding-kit"
                className="px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:border-[#00f0ff] transition-all duration-200 bg-white/50 backdrop-blur-sm">
                Choose File
              </label>
              {brandingFiles.length > 0 && (
                <div className="text-sm text-gray-600">
                  {brandingFiles[0].name}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 block">
              Social Links
            </label>
            {["twitter", "telegram", "discord"].map((social) => (
              <input
                key={social}
                type="url"
                placeholder={`${
                  social.charAt(0).toUpperCase() + social.slice(1)
                } URL`}
                value={formData.socials[social]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socials: { ...formData.socials, [social]: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00f0ff] focus:border-[#00f0ff] outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm"
              />
            ))}
          </div>
        </div>

        {transactionStatus && (
          <div className={`p-3 rounded-md ${
            transactionStatus.includes("failed") || transactionStatus.includes("Failed") 
              ? "bg-red-50 text-red-800" 
              : transactionStatus.includes("successfully") || transactionStatus.includes("🎉") 
                ? "bg-green-50 text-green-800" 
                : "bg-blue-50 text-blue-800"
          }`}>
            <p className="text-sm">{transactionStatus}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !account}
          className={`w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white py-3 px-4 rounded-md hover:opacity-90 transition-all duration-200 font-medium mt-6 focus:outline-none focus:ring-2 focus:ring-[#00f0ff] focus:ring-offset-2 transform hover:scale-[1.02] ${(isLoading || !account) ? 'opacity-70 cursor-not-allowed' : ''}`}>
          {isLoading ? "Processing..." : !account ? "Connect Wallet in Navbar to Launch" : "Launch Token"}
        </button>
      </form>
    </div>
  );
}