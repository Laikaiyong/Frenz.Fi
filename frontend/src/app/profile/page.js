// User Profile Web 3 Token Holding Portfolio
// Show owns tokens holding
// Show owns tokens deployed

"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, authenticated } = usePrivy();
  const [tokens, setTokens] = useState({
    holdings: [],
    deployed: []
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch user's token data
    // Mock data for now
    setTokens({
      holdings: [
        { name: "Ethereum", symbol: "ETH", balance: "1.5", value: "$3,000" },
        { name: "Base", symbol: "BASE", balance: "100", value: "$200" },
        { name: "Celo", symbol: "CELO", balance: "500", value: "$750" },
      ],
      deployed: [
        { name: "MyToken", symbol: "MTK", totalSupply: "1,000,000", holders: 150 },
        { name: "Community", symbol: "COM", totalSupply: "500,000", holders: 75 },
      ]
    });
    setIsLoading(false);
  }, []);

  if (!authenticated) {
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

  return (
    <div className="mt-20 container mx-auto px-4 max-w-6xl">
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C]">
            Web3 Portfolio
          </span>
        </h1>
        <p className="text-gray-600">
          {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
        </p>
      </motion.div>

      {/* Token Holdings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-6">Token Holdings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokens.holdings.map((token, index) => (
            <motion.div
              key={token.symbol}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-lg bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{token.name}</h3>
                <span className="text-sm text-gray-500">{token.symbol}</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className="text-2xl font-bold">{token.balance}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Value</p>
                  <p className="text-lg font-medium text-green-600">{token.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Deployed Tokens */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold mb-6">Deployed Tokens</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tokens.deployed.map((token, index) => (
            <motion.div
              key={token.symbol}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              className="p-6 rounded-lg bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{token.name}</h3>
                <span className="text-sm text-gray-500">{token.symbol}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Supply</p>
                  <p className="text-lg font-bold">{token.totalSupply}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Holders</p>
                  <p className="text-lg font-bold">{token.holders}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}