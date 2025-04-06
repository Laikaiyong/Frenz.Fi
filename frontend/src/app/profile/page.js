// User Profile Web 3 Token Holding Portfolio
// Show owns tokens holding
// Show owns tokens deployed

"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import getTokensOwnedByAccount from "../../utils/nodit/token/useGetTokensOwnedByAccount";
import Link from "next/link";
import { marked } from "marked";
import getGroqChatCompletion from "../api/groq/getGroqChatCompletion";
import axios from "axios";

export async function getBalance(network, address) {
  if (!address) return "0";

  try {
    let config;

    if (network === "base") {
      config = {
        method: "post",
        url: "https://base-mainnet.nodit.io/",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-API-KEY": process.env.NEXT_PUBLIC_NODIT_API_KEY,
        },
        data: {
          id: 1,
          jsonrpc: "2.0",
          method: "eth_getBalance",
          params: [address, "latest"],
        },
      };
    } else if (network === "ethereum") {
      config = {
        method: "post",
        url: "https://ethereum-mainnet.nodit.io/",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-API-KEY": process.env.NEXT_PUBLIC_NODIT_API_KEY,
        },
        data: {
          id: 1,
          jsonrpc: "2.0",
          method: "eth_getBalance",
          params: [address, "latest"],
        },
      };
    } else if (network === "celo") {
      config = {
        method: "post",
        url: "https://alfajores-forno.celo-testnet.org",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          id: 1,
          jsonrpc: "2.0",
          method: "eth_getBalance",
          params: [address, "latest"],
        },
      };
    }

    const response = await axios(config);
    const balance = parseInt(response.data.result, 16);
    return (balance / 1e18).toFixed(4); // Convert from wei to ETH/CELO
  } catch (error) {
    console.error("Error fetching balance:", error);
    return "0";
  }
}

const DEFAULT_TOKEN_LOGO =
  "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=026";

export default function ProfilePage() {
  const chatEndRef = useRef(null);
  const [account, setAccount] = useState(null);
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);

  async function analyzeWallet(tokens, nativeBalance, network) {
    const portfolioSummary = `
      Network: ${network}
      Native Balance: ${nativeBalance} ETH
      Token Holdings: ${tokens.holdings
        .map((token) => `${token.balance} ${token.symbol} (${token.name})`)
        .join(", ")}
      Deployed Tokens: ${tokens.deployed
        .map(
          (token) =>
            `${token.name} (${token.symbol}) - Total Supply: ${token.totalSupply}, Holders: ${token.holders}`
        )
        .join(", ")}
    `;

    try {
      const analysis = await getGroqChatCompletion(
        `Analyze this crypto wallet portfolio and provide insights: ${portfolioSummary}. 
         Include: 
         1. Total number of different tokens
         2. Portfolio diversity
         3. Any significant holdings
         4. Notable deployed tokens
         5. Recommendations for portfolio management`,
        []
      );

      return analysis.message;
    } catch (error) {
      console.error("Error analyzing wallet:", error);
      return "Unable to analyze wallet at this time.";
    }
  }

  // Add state for analysis in the component
  const [walletAnalysis, setWalletAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [tokens, setTokens] = useState({
    holdings: [],
    deployed: [],
  });
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [tokenOwned, setTokenOwned] = useState(); // State for token owned
  const [transformedTokens, setTransformedTokens] = useState(); // State for token owned

  const fetchTokenData = async () => {
    if (!account || !selectedNetwork) return;

    try {
      const tokenOwned = await getTokensOwnedByAccount(
        selectedNetwork,
        account
      );

      setTokenOwned(tokenOwned);
    } catch (error) {
      console.error("Error fetching token data:", error);
    }
  };

  const [nativeBalance, setNativeBalance] = useState("0");

  // Add this useEffect after the other useEffects

  // Add this useEffect to fetch balance when account or network changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (account && selectedNetwork) {
        const balance = await getBalance(selectedNetwork, account);
        setNativeBalance(balance);
      }
    };

    fetchBalance();
  }, [account, selectedNetwork]);

  useEffect(() => {
    const checkMetaMaskConnection = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsMetaMaskConnected(true);
          }

          // Listen for account changes
          window.ethereum.on("accountsChanged", (accounts) => {
            if (accounts.length > 0) {
              setAccount(accounts[0]);
              setIsMetaMaskConnected(true);
            } else {
              setAccount(null);
              setIsMetaMaskConnected(false);
            }
          });
        } catch (error) {
          console.error("Error checking MetaMask connection:", error);
        }
      }
    };

    checkMetaMaskConnection();
    const network = localStorage.getItem("selectedPill");
    setSelectedNetwork(network);
  }, [account]);

  async function fetchAndSetTokens() {
    if (!account || !selectedNetwork) return;

    try {
      const tokenHoldings = await getTokensOwnedByAccount(
        selectedNetwork,
        account
      );
      setTokens({
        holdings: tokenHoldings.items.map((token) => ({
          name: token.contract.name || "Unknown Token",
          symbol: token.contract.symbol || "UNKNOWN",
          balance: (
            BigInt(token.balance) /
            BigInt(10 ** (token.contract.decimals || 18))
          ).toString(),
          network: selectedNetwork,
          contractAddress: token.contract.address,
          logo: token.contract.logoUrl || DEFAULT_TOKEN_LOGO,
        })),
        deployed: tokenHoldings.items
          .filter(
            (token) =>
              token.contract.deployerAddress?.toLowerCase() ===
              account?.toLowerCase()
          )
          .map((token) => ({
            name: token.contract.name || "Unknown Token",
            symbol: token.contract.symbol || "UNKNOWN",
            totalSupply: token.contract.totalSupply || "0",
            holders: token.contract.holders || 0,
            network: selectedNetwork,
            contractAddress: token.contract.address,
            logo: token.contract.logoUrl || DEFAULT_TOKEN_LOGO,
          })),
      });
    } catch (error) {
      console.error("Error fetching tokens:", error);
    }
  }

  // Fetch tokens when user or network changes
  useEffect(() => {
    if (account && selectedNetwork) {
      fetchAndSetTokens();
      fetchTokenData();
    }
  }, [account, selectedNetwork]);

  useEffect(() => {
    if (tokenOwned) {
      const transformedTokens = tokenOwned.items
        .map(
          (token) =>
            `Name: ${token.contract.name}, Total Supply: ${token.contract.totalSupply}, Balance: ${token.balance}`
        )
        .join("; ");
      setTransformedTokens(transformedTokens);
    }
  }, [tokenOwned]);

  useEffect(() => {
    const getAnalysis = async () => {
        setIsAnalyzing(true);
        const analysis = await analyzeWallet(
          tokens,
          nativeBalance,
          selectedNetwork
        );
        setWalletAnalysis(analysis);
        setIsAnalyzing(false);
    };

    getAnalysis();
  }, []);

  if (!account) {
    return (
      <div className="mt-20 flex justify-center items-center min-h-[60vh]">
        <div className="text-center p-8 rounded-lg bg-white/80 backdrop-blur-sm shadow-xl">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C]">
            Please connect your wallet to view profile
          </h2>
        </div>
      </div>
    );
  }

  if (!selectedNetwork) {
    return (
      <div className="mt-20 flex justify-center items-center min-h-[60vh]">
        <div className="text-center p-8 rounded-lg bg-white/80 backdrop-blur-sm shadow-xl">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C]">
            Please select a network
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-20 container mx-auto px-4 max-w-6xl">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C]">
            Web3 Portfolio
          </span>
        </h1>
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <p className="text-gray-600">
              {account.slice(0, 6)}...{account.slice(-4)}
            </p>
            <div className="px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm shadow-sm">
              <span className="font-medium">{nativeBalance} ETH</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 capitalize">
            Network: {selectedNetwork}
          </p>
        </div>
      </motion.div>

      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 p-6 rounded-lg bg-white/80 backdrop-blur-sm shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Portfolio Analysis</h2>
          {isAnalyzing ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0052FF]"></div>
              <span className="ml-3 text-gray-600">Analyzing portfolio...</span>
            </div>
          ) : (
            <div className="prose prose-blue max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: marked(walletAnalysis),
                }}
              />
            </div>
          )}
        </motion.div>
        {/* Token Holdings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Token Holdings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokens.holdings.map((token, index) => (
              <Link href={`/token/${token.contractAddress}`} key={token.symbol}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-6 rounded-lg bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-105">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-50 p-2 ring-2 ring-gray-100">
                      <img
                        src={token.logo}
                        alt={`${token.name} logo`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold group-hover:text-[#0052FF] transition-colors">
                        {token.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {token.symbol}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-50/50 rounded-lg p-3">
                      <p className="text-sm text-gray-500">Balance</p>
                      <p className="text-xl font-bold">{token.balance}</p>
                    </div>
                    <div className="bg-gray-50/50 rounded-lg p-3">
                      <p className="text-sm text-gray-500">Network</p>
                      <p className="text-lg font-medium capitalize">
                        {token.network}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Deployed Tokens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}>
          <h2 className="text-2xl font-bold mb-6">Deployed Tokens</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tokens.deployed.map((token, index) => (
              <Link href={`/token/${token.contractAddress}`} key={token.symbol}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className="group p-6 rounded-lg bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-105">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-50 p-2 ring-2 ring-gray-100">
                      <img
                        src={token.logo}
                        alt={`${token.name} logo`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold group-hover:text-[#0052FF] transition-colors">
                        {token.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {token.symbol}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50/50 rounded-lg p-3">
                      <p className="text-sm text-gray-500">Total Supply</p>
                      <p className="text-lg font-bold">{token.totalSupply}</p>
                    </div>
                    <div className="bg-gray-50/50 rounded-lg p-3">
                      <p className="text-sm text-gray-500">Holders</p>
                      <p className="text-lg font-bold">{token.holders}</p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </>
    </div>
  );
}
