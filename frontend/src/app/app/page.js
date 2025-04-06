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
import getTokenContractMetadataByContracts from "../../utils/nodit/token/useGetTokenContractMetadataByContracts";

export async function getCoinList(platform) {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/list?include_platform=true",
      {
        headers: {
          accept: "application/json",
          "x-cg-api-key": process.env.NEXT_PUBLIC_CG_API_KEY,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch coin list");

    const data = await response.json();
    return data
      .filter((coin) => coin.platforms && coin.platforms[platform])
      .slice(0, 10);
  } catch (error) {
    console.error("Error fetching coin list:", error);
    return [];
  }
}

export async function getPoolsByNetwork(network) {
  try {
    const response = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/${network}/pools`,
      {
        headers: {
          accept: "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch pools");

    const data = await response.json();
    const pools = data.data;
    const randomPools = [];
    const poolsCopy = [...pools];
    
    for (let i = 0; i < 10 && poolsCopy.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * poolsCopy.length);
        randomPools.push(poolsCopy.splice(randomIndex, 1)[0]);
    }
    
    return randomPools;
  } catch (error) {
    console.error("Error fetching pools:", error);
    return [];
  }
}

function AppContent() {
  const [selectedPill, setSelectedPill] = useState(null);
  const searchParams = useSearchParams();
  const [tokens, setTokens] = useState([]);
  const [pools, setPools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!selectedPill) return;

      setIsLoading(true);
      try {
        // Get platform name based on selected pill
        const platform =
          selectedPill === "ethereum"
            ? "eth"
            : selectedPill === "base"
            ? "base"
            : "celo";

        // Fetch coins and pools
        const [coinList, poolList] = await Promise.all([
          getCoinList(selectedPill),
          getPoolsByNetwork(platform),
        ]);

        // Get token metadata for each coin
        // const tokenMetadata = await Promise.all(
        //   coinList.map((coin) =>
        //     getTokenContractMetadataByContracts(platform, coin.platforms[platform])
        //   )
        // );

        // Combine data
        // const enrichedTokens = coinList.map((coin, index) => ({
        //   id: coin.id,
        //   name: coin.name,
        //   symbol: coin.symbol.toUpperCase(),
        //   price: tokenMetadata[index]?.price || "0",
        //   change: tokenMetadata[index]?.price_change_24h || "0",
        //   isWinner: (tokenMetadata[index]?.price_change_24h || 0) > 0,
        // }));

        setTokens(coinList);
        setPools(poolList);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [selectedPill]);

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
            {/* Enhanced Launched Tokens Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-[#00EF8B] to-[#0052FF] text-transparent bg-clip-text">
                Launched Tokens
              </h2>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                </div>
              ) : (
                tokens.map((token) => (
                  <Link
                    href={`/token/${token.platforms[selectedPill]}`}
                    key={token.id}>
                    <div className="flex justify-between items-center p-4 rounded-lg bg-white/30 dark:bg-black/30 hover:bg-white/40 dark:hover:bg-black/40 transition-all cursor-pointer">
                      <div className="flex flex-col">
                        <span className="font-bold text-lg">{token.name}</span>
                        <span className="text-sm text-gray-500">
                          {token.symbol.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Enhanced Liquidity Pools Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-[#627EEA] to-[#FBCC5C] text-transparent bg-clip-text">
                Top Liquidity Pools
              </h2>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                </div>
              ) : (
                pools.map((pool) => (
                  <Link
                    href={`/token/${pool.attributes.address}`}
                    key={pool.id}>
                    <div className="p-4 rounded-lg bg-white/30 dark:bg-black/30 hover:bg-white/40 dark:hover:bg-black/40 transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-lg">
                          {pool.attributes.name}
                        </span>
                        <span
                          className={`text-sm px-2 py-1 rounded-full ${
                            Number(
                              pool.attributes.price_change_percentage?.[
                                "24h"
                              ] || 0
                            ) >= 0
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}>
                          {Number(
                            pool.attributes.price_change_percentage?.["24h"] ||
                              0
                          ) > 0
                            ? "+"
                            : ""}
                          
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>
                          TVL: $
                          {Number(
                            pool.attributes.reserve_in_usd
                          ).toLocaleString()}
                        </span>
                        
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

        {/* Winners & Losers Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-2xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold mb-4 text-green-500">
                    🏆 Winners
                </h2>
                <div className="space-y-4">
                    {[
                        {
                            id: 1,
                            image: "https://assets.coingecko.com/coins/images/36308/standard/01_avatar.jpg?1711090303",
                            name: "Undeads Games",
                            symbol: "UDS", 
                            change: "+96.2%",
                            price: "$0.3041"
                        },
                        {
                            id: 2, 
                            image: "https://assets.coingecko.com/coins/images/761/standard/FUN.png?1696501914",
                            name: "FUNToken",
                            symbol: "FUN",
                            change: "+49.0%",
                            price: "$0.00824"
                        },
                        {
                            id: 3,
                            image: "https://assets.coingecko.com/coins/images/55027/standard/gunz.jpg?1743262298",
                            name: "Gunz",
                            symbol: "GUN",
                            change: "+35.1%", 
                            price: "$0.05605"
                        }
                    ].map((token) => (
                        <div key={token.id} className="flex items-center p-4 rounded-lg bg-white/30 dark:bg-black/30">
                            <img src={token.image} alt={token.name} className="w-8 h-8 rounded-full mr-3" />
                            <div className="flex-1">
                                <div className="font-medium">{token.name}</div>
                                <div className="text-sm text-gray-500">{token.symbol}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-green-500">{token.change}</div>
                                <div className="text-sm">{token.price}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-2xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold mb-4 text-red-500">
                    💀 Losers
                </h2>
                <div className="space-y-2">
                {[
                        {
                            id: 1,
                            image: "https://assets.coingecko.com/coins/images/27344/standard/mplx.png?1696526391",
                            name: "Metaplex",
                            symbol: "MPLX", 
                            change: "-7.5%",
                            price: "$0.1762"
                        },
                        {
                            id: 2, 
                            image: "https://assets.coingecko.com/coins/images/50985/standard/infinitar.jpg?1729654559",
                            name: "Infinitar Governance Token",
                            symbol: "IGT",
                            change: "-6.1%",
                            price: "$0.3419"
                        },
                        {
                            id: 3,
                            image: "https://assets.coingecko.com/coins/images/19155/standard/ssv.png?1696518606",
                            name: "SSV Network",
                            symbol: "SSV",
                            change: "-6.0%", 
                            price: "$5.72"
                        }
                    ].map((token) => (
                        <div key={token.id} className="flex items-center p-4 rounded-lg bg-white/30 dark:bg-black/30">
                            <img src={token.image} alt={token.name} className="w-8 h-8 rounded-full mr-3" />
                            <div className="flex-1">
                                <div className="font-medium">{token.name}</div>
                                <div className="text-sm text-gray-500">{token.symbol}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-red-500">{token.change}</div>
                                <div className="text-sm">{token.price}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AppPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }>
      <AnimatePresence>
        <AppContent />
      </AnimatePresence>
    </Suspense>
  );
}
