// Token Details by Contract Address
// - Current Price
// - Community Forum (Only hodlers allowed)
// - bullish / bearish button (by hodlers only)
// - Brandng Kit
// - Liquidity Pool (token/USDC)
// - News

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import useGetTokenHoldersByContract from "@/app/api/nodit/token/useGetTokenHoldersByContract";
import useGetTokenPricesByContracts from "@/app/api/nodit/token/useGetTokenPricesByContracts";
import useGetTokenTransfersByContract from "@/app/api/nodit/token/useGetTokenTransfersByContract";
import useGetTokenContractMetadataByContracts from "@/app/api/nodit/token/useGetTokenContractMetadataByContracts";

export default function TokenDetailPage() {
  const { id } = useParams();
  const { authenticated, user } = usePrivy();
  const [isHodler, setIsHodler] = useState(false);
  const [sentiment, setSentiment] = useState({ bullish: 60, bearish: 40 });
  const [activeTab, setActiveTab] = useState("overview");
  const [tokenHolders, setTokenHolders] = useState();
  const [tokenPrices, setTokenPrices] = useState();
  const [tokenTransfers, setTokenTransfers] = useState();
  const [tokenMetadata, setTokenMetadata] = useState();

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const tokenHolders = await useGetTokenHoldersByContract(
          "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
        );
        const tokenPrices = await useGetTokenPricesByContracts(id);
        const tokenTransfers = await useGetTokenTransfersByContract(id);
        const tokenMetadata = await useGetTokenContractMetadataByContracts(id);

        setTokenHolders(tokenHolders);
        setTokenPrices(tokenPrices);
        setTokenTransfers(tokenTransfers);
        setTokenMetadata(tokenMetadata);
      } catch (error) {
        console.error("Error fetching token data:", error);
      }
    };

    fetchTokenData();
  }, []);

  console.log(tokenHolders);
  console.log(tokenPrices);
  console.log(tokenTransfers);
  console.log(tokenMetadata);

  // Mock token data
  const tokenData = {
    name: "Sample Token",
    symbol: "SMPL",
    price: "$1.23",
    priceChange: "+5.67%",
    marketCap: "$1.2M",
    volume: "$250K",
    liquidity: "$500K",
    holders: 1500,
  };

  // Mock forum posts
  const forumPosts = [
    {
      id: 1,
      author: "0x1234...5678",
      title: "Future of this token",
      comments: 23,
      timestamp: "2h ago",
    },
    // Add more mock posts
  ];

  return (
    <div className="mt-20 container mx-auto px-4 max-w-6xl">
      {/* Token Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {tokenData.name}
              <span className="ml-2 text-gray-500 text-xl">
                {tokenData.symbol}
              </span>
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold">{tokenData.price}</span>
              <span
                className={`text-lg ${
                  tokenData.priceChange.startsWith("+")
                    ? "text-green-500"
                    : "text-red-500"
                }`}>
                {tokenData.priceChange}
              </span>
            </div>
          </div>

          {isHodler && (
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setSentiment((prev) => ({
                    ...prev,
                    bullish: prev.bullish + 1,
                  }))
                }
                className="px-6 py-2 bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white rounded-full hover:opacity-90 transition-all">
                🐂 Bullish
              </button>
              <button
                onClick={() =>
                  setSentiment((prev) => ({
                    ...prev,
                    bearish: prev.bearish + 1,
                  }))
                }
                className="px-6 py-2 border-2 border-gray-200 rounded-full hover:border-gray-300 transition-all">
                🐻 Bearish
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-6">
          {/* Market Stats */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4">Market Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Market Cap</span>
                <span className="font-bold">{tokenData.marketCap}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">24h Volume</span>
                <span className="font-bold">{tokenData.volume}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Liquidity</span>
                <span className="font-bold">{tokenData.liquidity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Holders</span>
                <span className="font-bold">{tokenData.holders}</span>
              </div>
            </div>
          </div>

          {/* Sentiment Meter */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4">Market Sentiment</h2>
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#627EEA] to-[#0052FF]"
                style={{ width: `${sentiment.bullish}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span>🐂 {sentiment.bullish}%</span>
              <span>🐻 {sentiment.bearish}%</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Forum & Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2">
          {/* Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-6">
            <div className="flex gap-4 mb-6">
              {["overview", "forum", "liquidity", "news"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full capitalize ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}>
                  {tab}
                </button>
              ))}
            </div>

            {activeTab == "overview" && (
              <div className="space-y-4">
                <div className="w-full h-[400px] rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.geckoterminal.com/base/pools/${id}?embed=1&info=0&swaps=0&grayscale=0&light_chart=0`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    title="Token Price Chart"
                    className="w-full h-full"
                    allow="clipboard-write"
                  />
                </div>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === "forum" && (
              <div className="space-y-4">
                {isHodler ? (
                  forumPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-[#0052FF] transition-all">
                      <h3 className="font-bold mb-2">{post.title}</h3>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>By: {post.author}</span>
                        <span>{post.comments} comments</span>
                        <span>{post.timestamp}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      Only token holders can access the community forum
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "liquidity" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-bold">Token/USDC Pool</h3>
                    <p className="text-gray-600">
                      Total Liquidity: {tokenData.liquidity}
                    </p>
                  </div>
                  <button className="px-6 py-2 bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white rounded-full hover:opacity-90 transition-all">
                    Add Liquidity
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
