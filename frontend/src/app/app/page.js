// // /App
// - Launchpad (Already launched tokens)
// - Launch Button (Leads to /launch)
// - EZ Liquidity Pools (Pairings beside the "Already Launched Tokens") (
// - Loser / Winner
// - AI Advisor

"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PillsScreen from "@/components/pillsScreen";

// Mock data - Replace with actual data from your backend
const LAUNCHED_TOKENS = [
  {
    id: 1,
    name: "PEPE",
    price: "$0.0001",
    change: "+420%",
    isWinner: true,
  },
  {
    id: 2,
    name: "WOJAK",
    price: "$0.00001",
    change: "-69%",
    isWinner: false,
  },
];

const LIQUIDITY_POOLS = [
  {
    id: 1,
    pair: "PEPE/ETH",
    tvl: "$1.2M",
    apy: "42%",
  },
  {
    id: 2,
    pair: "WOJAK/ETH",
    tvl: "$500K",
    apy: "69%",
  },
];

export default function AppPage() {
  const [selectedPill, setSelectedPill] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("reset") === "true") {
      localStorage.removeItem("selectedPill");
      setSelectedPill(null);
      return;
    }

    const storedPill = localStorage.getItem("selectedPill");
    if (storedPill) {
      setSelectedPill(storedPill);
    }
  }, [searchParams]);

  const handlePillSelection = (color) => {
    setSelectedPill(color);
    localStorage.setItem("selectedPill", color);
    window.location.href = "/app";
  };

  return (
    <Suspense fallback={
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }>
    <AnimatePresence>
      {!selectedPill ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center">
          <PillsScreen onSelect={handlePillSelection} />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20 container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00EF8B] via-[#0052FF] to-[#FBCC5C] text-transparent bg-clip-text">
              Frenz.fi App
            </h1>
            <Link href="/launch">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-[#00EF8B] to-[#0052FF] text-white px-6 py-3 rounded-full font-bold">
                Launch Token
              </motion.button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Launched Tokens Section */}
            <div className="bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold mb-4">Launched Tokens</h2>
              <div className="space-y-4">
                {LAUNCHED_TOKENS.map((token) => (
                  <div
                    key={token.id}
                    className="flex justify-between items-center p-4 rounded-lg bg-white/30 dark:bg-black/30">
                    <span className="font-bold">{token.name}</span>
                    <span>{token.price}</span>
                    <span
                      className={
                        token.isWinner ? "text-green-500" : "text-red-500"
                      }>
                      {token.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Liquidity Pools Section */}
            <div className="bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold mb-4">EZ Liquidity Pools</h2>
              <div className="space-y-4">
                {LIQUIDITY_POOLS.map((pool) => (
                  <div
                    key={pool.id}
                    className="flex justify-between items-center p-4 rounded-lg bg-white/30 dark:bg-black/30">
                    <span className="font-bold">{pool.pair}</span>
                    <span>TVL: {pool.tvl}</span>
                    <span className="text-green-500">APY: {pool.apy}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Advisor Section */}
          <div className="mt-8 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">AI Advisor</h2>
            <div className="flex items-center space-x-4 p-4 rounded-lg bg-white/30 dark:bg-black/30">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00EF8B] to-[#0052FF] flex items-center justify-center">
                🤖
              </div>
              <div>
                <p className="font-medium">Today&apos;s Advice</p>
                <p className="text-gray-600 dark:text-gray-400">
                  &ldquo;Market sentiment is bullish! Consider providing
                  liquidity to PEPE/ETH pool for optimal yields.&ldquo;
                </p>
              </div>
            </div>
          </div>

          {/* Winners & Losers Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-green-500">
                🏆 Winners
              </h2>
              <div className="space-y-2">
                {LAUNCHED_TOKENS.filter((t) => t.isWinner).map((token) => (
                  <div
                    key={token.id}
                    className="p-4 rounded-lg bg-white/30 dark:bg-black/30">
                    {token.name} ({token.change})
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-red-500">
                💀 Losers
              </h2>
              <div className="space-y-2">
                {LAUNCHED_TOKENS.filter((t) => !t.isWinner).map((token) => (
                  <div
                    key={token.id}
                    className="p-4 rounded-lg bg-white/30 dark:bg-black/30">
                    {token.name} ({token.change})
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </Suspense>
  );
}
