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
  const { authenticated, user, ready, login } = usePrivy();
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

  // Get the network from localStorage
  useEffect(() => {
    let network = localStorage.getItem("selectedPill");
    network = network == "ethereum" ? "eth" : network;
    setSelectedNetwork(network);
  }, []);

  // Fetch pool data from GeckoTerminal
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
          console.warn(`GeckoTerminal API returned ${response.status}`);
          setApiErrors(prev => ({...prev, geckoTerminal: `API Error: ${response.status}`}));
          return;
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
        setApiErrors(prev => ({...prev, geckoTerminal: error.message}));
      }
    };

    fetchPoolData();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchPoolData, 30000);
    return () => clearInterval(interval);
  }, [id, selectedNetwork]);

  // Fetch Uniswap v4 dynamic fee pools
  useEffect(() => {
    const fetchUniswapData = async () => {
      if (!ready) return;
      
      try {
        setIsLoading(true);
        
        // Fetch pool information from your API
        const poolsResponse = await fetch('/api/uniswap?action=getPoolInfo');
        if (!poolsResponse.ok) {
          throw new Error(`Failed to fetch Uniswap pool data: ${poolsResponse.statusText}`);
        }
        
        const poolsData = await poolsResponse.json();
        
        // Fetch emergency mode status
        const emergencyResponse = await fetch('/api/uniswap?action=getEmergencyStatus');
        if (!emergencyResponse.ok) {
          throw new Error(`Failed to fetch emergency status: ${emergencyResponse.statusText}`);
        }
        
        const emergencyData = await emergencyResponse.json();
        
        setPools(poolsData.pools || []);
        setIsEmergencyMode(emergencyData.isActive || false);
        setUniswapError(null);
      } catch (err) {
        console.error("Uniswap data fetch error:", err);
        setUniswapError(err.message || "Failed to load Uniswap data");
        // Set default empty pools array so UI still renders
        setPools([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUniswapData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUniswapData, 30000);
    
    return () => clearInterval(interval);
  }, [ready]);

  // Check if user is a holder
  useEffect(() => {
    if (authenticated && user?.wallet?.address && Array.isArray(tokenHolders) && tokenHolders.length > 0) {
      try {
        // Check if user's address is in the holders list
        const isUserHolder = tokenHolders.some(
          holder => holder && holder.address && user.wallet.address &&
          holder.address.toLowerCase() === user.wallet.address.toLowerCase()
        );
        setIsHodler(isUserHolder);
      } catch (error) {
        console.error("Error checking holder status:", error);
        setIsHodler(false);
      }
    }
  }, [authenticated, user, tokenHolders]);

  // Fetch token data
  useEffect(() => {
    const fetchTokenData = async () => {
      if (!id) return;
      
      try {
        const tokenHolders = await getTokenHoldersByContract(id);
        // const tokenPrices = await useGetTokenPricesByContracts(id);
        const tokenTransfers = await getTokenTransfersByContract(id);
        const tokenMetadata = await getTokenContractMetadataByContracts(selectedNetwork, id);

        console.log("tokenHolders", tokenHolders);
        console.log("tokenTransfers", tokenTransfers);
        console.log("tokenMetadata", tokenMetadata);
        setTokenHolders(tokenHolders);
        // setTokenPrices(tokenPrices);
        setTokenTransfers(tokenTransfers);
        setTokenMetadata(tokenMetadata);
      } catch (error) {
        console.error("Error fetching token data:", error);
      }
    };

    if (id) {
      fetchTokenData();
    }
  }, [id]);


  // Mock token data
  const tokenData = {
    name: tokenMetadata?.name || "Sample Token",
    symbol: tokenMetadata?.symbol || "SMPL",
    price: tokenPrices?.price ? `$${tokenPrices.price}` : "$1.23",
    priceChange: tokenPrices?.priceChange || "+5.67%",
    marketCap: tokenPrices?.marketCap || "$1.2M",
    volume: tokenPrices?.volume || "$250K",
    liquidity: tokenPrices?.liquidity || "$500K",
    holders: Array.isArray(tokenHolders) ? tokenHolders.length : 0,
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
    {
      id: 2,
      author: "0xabcd...ef01",
      title: "Development roadmap discussion",
      comments: 15,
      timestamp: "5h ago",
    },
    {
      id: 3,
      author: "0x9876...5432",
      title: "Community AMA results",
      comments: 42,
      timestamp: "1d ago",
    },
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

      {/* API Errors Banner - Show only if there are errors */}
      {Object.keys(apiErrors).length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Some data couldn't be loaded. API rate limits may have been exceeded.
              </p>
            </div>
          </div>
        </div>
      )}

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
            <div className="flex flex-wrap gap-2 mb-6">
              {["overview", "forum", "liquidity", "dynamic-fees", "news"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full capitalize ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}>
                  {tab.replace("-", " ")}
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
                    <div className="flex flex-col items-center justify-center h-full bg-gray-50">
                      {apiErrors.geckoTerminal ? (
                        <>
                          <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <p className="text-gray-500 text-center">Chart data unavailable</p>
                          <p className="text-gray-400 text-sm mt-1">{apiErrors.geckoTerminal}</p>
                        </>
                      ) : (
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052FF]"></div>
                      )}
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
                    {!authenticated && (
                      <button
                        onClick={login}
                        className="mt-4 px-6 py-2 bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white rounded-full hover:opacity-90 transition-all"
                      >
                        Connect Wallet
                      </button>
                    )}
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
                  <button 
                    onClick={() => document.getElementById('createPool').scrollIntoView({ behavior: 'smooth' })}
                    className="px-6 py-2 bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white rounded-full hover:opacity-90 transition-all">
                    Add Liquidity
                  </button>
                </div>
                
                {/* CreatePool Component with ID for scroll targeting */}
                <div id="createPool">
                  <CreatePool />
                </div>
                
                {/* Embedded CreateLiquidityPosition component */}
                <CreateLiquidityPosition />
              </div>
            )}
            
            {/* Dynamic Fees Tab */}
            {activeTab === "dynamic-fees" && (
              <div className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold mb-2">Uniswap v4 Dynamic Fee Pools</h2>
                  <p className="text-gray-600">
                    These pools feature dynamic fees that adjust based on market conditions. 
                    Fees range from 0.05% to 3% depending on trading volume and volatility.
                  </p>
                </div>
                
                {isEmergencyMode && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                    <p className="font-bold">Emergency Mode Active</p>
                    <p>All pools are currently using emergency fee settings.</p>
                  </div>
                )}
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052FF]"></div>
                  </div>
                ) : uniswapError ? (
                  <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
                    <p className="font-bold">Connection Error</p>
                    <p>We're having trouble connecting to the Base Mainnet. Please try again later.</p>
                    <p className="text-xs mt-2 text-yellow-600">{uniswapError}</p>
                  </div>
                ) : pools.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No dynamic fee pools available yet</p>
                    <button 
                      onClick={() => {
                        setActiveTab("liquidity");
                        setTimeout(() => {
                          document.getElementById('createPool').scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white rounded-full hover:opacity-90 transition-all">
                      Create New Pool
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {pools.map((pool, index) => (
                      <div 
                        key={index}
                        className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-4 hover:shadow-lg transition-all">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-bold">{pool.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            pool.currentFee > 10000 ? "bg-red-100 text-red-700" : 
                            pool.currentFee > 3000 ? "bg-orange-100 text-orange-700" : 
                            "bg-green-100 text-green-700"
                          }`}>
                            {pool.formattedCurrentFee} Fee
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-gray-500 text-sm">Volume:</span>
                            <span className="ml-2 font-semibold">{pool.formattedVolume}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Swaps:</span>
                            <span className="ml-2 font-semibold">{pool.swapCount}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Status:</span>
                            <span className="ml-2 font-semibold">
                              {pool.initialized === false ? "Not Initialized" : "Active"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Last Update:</span>
                            <span className="ml-2 font-semibold">{pool.lastUpdated || "N/A"}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <button 
                            onClick={() => {
                              setActiveTab("liquidity");
                              setTimeout(() => {
                                document.getElementById('createPool').scrollIntoView({ behavior: 'smooth' });
                              }, 100);
                            }}
                            className="px-4 py-1 bg-gradient-to-r from-[#627EEA] to-[#0052FF] text-white text-sm rounded-full hover:opacity-90 transition-all">
                            Add Liquidity
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* News Tab */}
            {activeTab === "news" && (
              <div className="space-y-4">
                <div className="text-center py-12">
                  <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <p className="text-gray-600">News feed coming soon</p>
                  <p className="text-sm text-gray-500 mt-2">Stay tuned for the latest updates about this token</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}