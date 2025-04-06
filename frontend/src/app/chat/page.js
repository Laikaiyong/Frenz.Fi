// AI Agent Chat
// Linkage to tokens within platform with /token/[id]
// governance related info and insurance info linkage to /insurance
"use client";

import { useState, useEffect, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { motion } from "framer-motion";
import getGroqChatCompletion from "../api/groq/getGroqChatCompletion";
import getTokensOwnedByAccount from "../../utils/nodit/token/useGetTokensOwnedByAccount";

const SAMPLE_PROMPTS = [
    "What is the Base blockchain?",
    "What is the Celo ecosystem in DeFAI",
    "What is liquidity pool?",
    "What are the best DeFi strategies?",
    "Search about uniswap and how hooks help Defi",
    "How to use Nodit Blockchain API to improve my crypto portfolio?",
  ];

export default function ChatPage() {
  const { authenticated, user } = usePrivy();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [tokenOwned, setTokenOwned] = useState();
  const [transformedTokens, setTransformedTokens] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState();
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    const network = localStorage.getItem("selectedPill");
    setSelectedNetwork(network);
  }, []);

  const handlePromptClick = (prompt) => {
    setInput(prompt);
    handleSubmit(new Event('submit'));
  };


  const fetchTokenData = async () => {
    try {
      const tokenOwned = await getTokensOwnedByAccount(
        selectedNetwork,
        user?.wallet?.address
      );

      setTokenOwned(tokenOwned);
    } catch (error) {
      console.error("Error fetching token data:", error);
    }
  };

  useEffect(() => {
    if (authenticated && user?.wallet?.address && selectedNetwork) {
      fetchTokenData();
    }
  }, [authenticated, user?.wallet?.address, selectedNetwork]);

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

  // Mock data for token and insurance info
  const relevantInfo = {
    tokens: [
      { id: "eth-token", name: "ETH Token", price: "$2000" },
      { id: "base-token", name: "Base Token", price: "$5" },
    ],
    governance: {
      proposals: 3,
      activeVotes: 2,
    },
    insurance: {
      coverage: "$1M",
      premium: "$100/month",
    },
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await getGroqChatCompletion(input.trim(), [...messages]);
      setSearchResults(response.searchResults);

      const aiMessage = {
        role: "assistant",
        content: response.message || "I'm sorry, I couldn't process that.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I encountered an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-20 container mx-auto px-4 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-6 min-h-[70vh] flex flex-col">
            <h1 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C]">
              AI Assistant
            </h1>

            {/* Messages Container */}
            <div className="flex-grow overflow-y-auto mb-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}>
                  <div
                    className={`max-w-[70%] p-4 rounded-lg ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white"
                        : "bg-gray-100"
                    }`}>
                    {message.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PROMPTS.map((prompt, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm px-4 py-2 rounded-full border border-gray-200 
                             bg-white hover:bg-gray-50 text-gray-700 
                             transition-all cursor-pointer whitespace-nowrap
                             hover:border-[#0052FF] hover:text-[#0052FF]"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none transition-all duration-200"
                  placeholder="Ask about tokens, governance, or insurance..."
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white rounded-full hover:opacity-90 transition-all transform hover:scale-105">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Search Results Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {searchResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-4">
                <h2 className="text-lg font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#627EEA] to-[#0052FF]">
                  References
                </h2>

                {searchResults.knowledge && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <h3 className="font-bold text-sm text-gray-800 mb-2">
                      {searchResults.knowledge.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {searchResults.knowledge.description}
                    </p>
                    {searchResults.knowledge.attributes && (
                      <div className="mt-2 text-xs text-gray-500">
                        {Object.entries(searchResults.knowledge.attributes).map(
                          ([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span>{key}:</span>
                              <span>{value}</span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  {searchResults.results.map((result, index) => (
                    <a
                      key={index}
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-all">
                      <h3 className="font-bold text-sm text-blue-600 mb-1">
                        [{index + 1}] {result.title}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {result.snippet}
                      </p>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
