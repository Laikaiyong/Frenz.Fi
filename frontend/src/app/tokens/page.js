// Show all tokens
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function TokensPage() {
  const [tokens, setTokens] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("marketCap");
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - Replace with actual API call
  useEffect(() => {
    setTokens([
      {
        id: "eth-token",
        name: "Ethereum Token",
        symbol: "ETH",
        price: "$2000",
        change: "+5.67%",
        marketCap: "$1.2M",
        volume: "$250K",
        network: "ethereum",
      },
      {
        id: "base-token",
        name: "Base Token",
        symbol: "BASE",
        price: "$5",
        change: "-2.34%",
        marketCap: "$500K",
        volume: "$100K",
        network: "base",
      },
      // Add more mock tokens...
    ]);
    setIsLoading(false);
  }, []);

  return (
    <div className="mt-20 container mx-auto px-4 max-w-6xl">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C]">
            Explore Tokens
          </span>
        </h1>
        <p className="text-gray-600">
          Discover and track tokens across multiple networks
        </p>
      </motion.div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded-full border border-gray-200 focus:ring-2 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none"
        >
          <option value="all">All Networks</option>
          <option value="ethereum">Ethereum</option>
          <option value="base">Base</option>
          <option value="celo">Celo</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 rounded-full border border-gray-200 focus:ring-2 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none"
        >
          <option value="marketCap">Market Cap</option>
          <option value="volume">Volume</option>
          <option value="price">Price</option>
        </select>
      </div>

      {/* Tokens Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {tokens.map((token, index) => (
          <motion.div
            key={token.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/token/${token.id}`}>
              <div className="p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-xl hover:shadow-2xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{token.name}</h2>
                    <span className="text-sm text-gray-500">{token.symbol}</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      token.change.startsWith("+")
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {token.change}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-lg font-bold">{token.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Volume</p>
                    <p className="text-lg font-bold">{token.volume}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Market Cap</p>
                    <p className="text-lg font-bold">{token.marketCap}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Network</p>
                    <p className="text-lg font-bold capitalize">{token.network}</p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052FF]"></div>
        </div>
      )}
    </div>
  );
}