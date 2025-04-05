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
import getTokenHoldersByContract from "@/utils/nodit/token/useGetTokenHoldersByContract";
// import useGetTokenPricesByContracts from "@/app/api/nodit/token/useGetTokenPricesByContracts";
import getTokenTransfersByContract from "@/utils/nodit/token/useGetTokenTransfersByContract";
import getTokenContractMetadataByContracts from "@/utils/nodit/token/useGetTokenContractMetadataByContracts";

export default function TokenDetailPage() {
  const { id } = useParams();
  const { authenticated, user } = usePrivy();
  const [isHodler, setIsHodler] = useState(false);
  const [sentiment, setSentiment] = useState({ bullish: 60, bearish: 40 });
  const [activeTab, setActiveTab] = useState("overview");
  const [tokenHolders, setTokenHolders] = useState();
  const [tokenPrice, setTokenPrice] = useState();
  const [tokenTransfers, setTokenTransfers] = useState();
  const [tokenMetadata, setTokenMetadata] = useState();

  const [poolData, setPoolData] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [tokenStats, setTokenStats] = useState({
    price: "0.00",
    priceChange24h: "0.00",
    marketCap: "0",
    volume24h: "0",
    liquidity: "0",
    lockedLiquidity: "0",
  });

  // Add this useEffect to get the network from localStorage
  useEffect(() => {
    let network = localStorage.getItem("selectedPill");
    network = network == "ethereum" ? "eth" : network;
    setSelectedNetwork(network);
  }, []);

  useEffect(() => {
    const fetchPoolData = async () => {
      if (!id || !selectedNetwork) return;

      try {
        const response = await fetch(
          `https://api.geckoterminal.com/api/v2/networks/${selectedNetwork}/tokens/${id}/pools`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch pool data");
        }

        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const poolInfo = data.data[0].attributes;
          setPoolData(data.data[0]);

          // Update token stats with real data
          setTokenStats({
            price: Number(poolInfo.base_token_price_usd).toFixed(6),
            priceChange24h: Number(
              poolInfo.price_change_percentage?.["24h"] || 0
            ).toFixed(2),
            marketCap: Number(poolInfo.market_cap_usd || 0).toLocaleString(),
            volume24h: Number(
              poolInfo.volume_usd?.["24h"] || 0
            ).toLocaleString(),
            liquidity: Number(poolInfo.reserve_in_usd || 0).toLocaleString(),
            lockedLiquidity: Number(
              poolInfo.locked_liquidity_percentage || 0
            ).toFixed(2),
          });
        }
      } catch (error) {
        console.error("Error fetching pool data:", error);
      }
    };

    fetchPoolData();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchPoolData, 30000);
    return () => clearInterval(interval);
  }, [id, selectedNetwork]);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const tokenHolders = await getTokenHoldersByContract(id);
        // const tokenPrices = await useGetTokenPricesByContracts(id);
        const tokenTransfers = await getTokenTransfersByContract(id);
        const tokenMetadata = await getTokenContractMetadataByContracts(id);

        setTokenHolders(tokenHolders);
        // setTokenPrices(tokenPrices);
        setTokenTransfers(tokenTransfers);
        setTokenMetadata(tokenMetadata);
      } catch (error) {
        console.error("Error fetching token data:", error);
      }
    };

    fetchTokenData();
  }, []);

  console.log("tokenHolders", tokenHolders);
  console.log("tokenTransfers", tokenTransfers);
  console.log("tokenMetadata", tokenMetadata);

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
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold">
                    ${tokenStats.price}
                  </span>
                  <span
                    className={`text-lg ${
                      Number(tokenStats.priceChange24h) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}>
                    {Number(tokenStats.priceChange24h) > 0 ? "+" : ""}
                    {tokenStats.priceChange24h}%
                  </span>
                </div>
              </div>
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
                <span className="font-bold">${tokenStats.marketCap}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">24h Volume</span>
                <span className="font-bold">${tokenStats.volume24h}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Liquidity</span>
                <span className="font-bold">${tokenStats.liquidity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Locked Liquidity</span>
                <span className="font-bold">{tokenStats.lockedLiquidity}%</span>
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

            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="w-full h-[400px] rounded-lg overflow-hidden">
                  {poolData ? (
                    <iframe
                      src={`https://www.geckoterminal.com/${selectedNetwork}/pools/${poolData.attributes.address}?embed=1&info=0&swaps=0&grayscale=0&light_chart=0`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      title="Token Price Chart"
                      className="w-full h-full"
                      allow="clipboard-write"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-50">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052FF]"></div>
                    </div>
                  )}
                </div>

                {poolData && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-sm text-gray-500">Pool Liquidity</p>
                      <p className="text-lg font-bold">
                        ${tokenStats.liquidity}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tokenStats.lockedLiquidity}% Locked
                      </p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-sm text-gray-500">24h Volume</p>
                      <p className="text-lg font-bold">
                        ${tokenStats.volume24h}
                      </p>
                      <p className="text-xs text-gray-500">
                        Price: $
                        {Number(
                          poolData.attributes.base_token_price_quote_token
                        ).toFixed(6)}
                      </p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-sm text-gray-500">Market Cap</p>
                      <p className="text-lg font-bold">
                        ${tokenStats.marketCap}
                      </p>
                      <p className="text-xs text-gray-500">
                        FDV: $
                        {Number(poolData.attributes.fdv_usd).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-sm text-gray-500">Price Change 24h</p>
                      <p
                        className={`text-lg font-bold ${
                          Number(tokenStats.priceChange24h) >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}>
                        {Number(tokenStats.priceChange24h) > 0 ? "+" : ""}
                        {tokenStats.priceChange24h}%
                      </p>
                      <p className="text-xs text-gray-500">
                        Created:{" "}
                        {new Date(
                          poolData.attributes.pool_created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
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
