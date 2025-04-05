// User Profile Web 3 Token Holding Portfolio
// Show owns tokens holding
// Show owns tokens deployed

"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import useGetTokensOwnedByAccount from "../../utils/nodit/token/useGetTokensOwnedByAccount";
import Link from "next/link";

const DEFAULT_TOKEN_LOGO =
  "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=026";

export default function ProfilePage() {
  const { user, authenticated } = usePrivy();
  const [tokens, setTokens] = useState({
    holdings: [],
    deployed: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState(null);

  // Get selected network from localStorage
  useEffect(() => {
    const network = localStorage.getItem("selectedPill");
    setSelectedNetwork(network);
  }, []);

  async function fetchAndSetTokens() {
    if (!user?.wallet?.address || !selectedNetwork) return;

    try {
      setIsLoading(true);
      const tokenHoldings = await useGetTokensOwnedByAccount(
        selectedNetwork,
        user.wallet.address
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
              user.wallet.address?.toLowerCase()
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
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch tokens when user or network changes
  useEffect(() => {
    if (authenticated && user?.wallet?.address && selectedNetwork) {
      fetchAndSetTokens();
    }
  }, [authenticated, user?.wallet?.address, selectedNetwork]);

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
        <div className="space-y-2">
          <p className="text-gray-600">
            {user?.wallet?.address?.slice(0, 6)}...
            {user?.wallet?.address?.slice(-4)}
          </p>
          <p className="text-sm text-gray-500 capitalize">
            Network: {selectedNetwork}
          </p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052FF]"></div>
        </div>
      ) : (
        <>
          {/* Token Holdings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Token Holdings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tokens.holdings.map((token, index) => (
                <Link
                  href={`/token/${token.contractAddress}`}
                  key={token.symbol}>
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
                        <span
                          className={`text-sm ${
                            token.priceChange?.startsWith("+")
                              ? "text-green-500"
                              : "text-red-500"
                          }`}>
                          {token.priceChange}
                        </span>
                      </div>
                      <div className="bg-gray-50/50 rounded-lg p-3">
                        <p className="text-sm text-gray-500">Network</p>
                        <p className="text-lg font-medium capitalize">
                          {token.network}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="w-2 h-2 rounded-full bg-green-400"></span>
                          <span className="text-xs text-gray-500">Active</span>
                        </div>
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
                <Link
                  href={`/token/${token.contractAddress}`}
                  key={token.symbol}>
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
                        <div className="flex items-center gap-1 mt-1">
                          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                          <span className="text-xs text-gray-500">Creator</span>
                        </div>
                      </div>
                      <div className="bg-gray-50/50 rounded-lg p-3">
                        <p className="text-sm text-gray-500">Holders</p>
                        <p className="text-lg font-bold">{token.holders}</p>
                        <span className="text-xs text-gray-500">
                          Community Members
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
