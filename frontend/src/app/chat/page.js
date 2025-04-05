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

export default function ChatPage() {
  const { authenticated, user } = usePrivy();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [tokenOwned, setTokenOwned] = useState();
  const [transformedTokens, setTransformedTokens] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState()
  
  useEffect(() => {
    const network = localStorage.getItem("selectedPill");
    setSelectedNetwork(network);
  }, []);

  const fetchTokenData = async () => {
    try {
      const tokenOwned = await getTokensOwnedByAccount(selectedNetwork,
        '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');

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
    async function provideAiWithTokenInfo() {
      if(transformedTokens){
        const response = await getGroqChatCompletion(transformedTokens+". This is the token profile that I have. Please remember this.");

        
              }

    }

    if (tokenOwned) {
      const transformedTokens = tokenOwned.items.map(token => ({
        name: token.contract.name,
        totalSupply: token.contract.totalSupply,
        balance: token.balance,
      }));
      setTransformedTokens(transformedTokens);
    }
  }, [tokenOwned]);

  useEffect(() => {
    

    provideAiWithTokenInfo()
  },[transformedTokens]);

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
      type: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const response = await getGroqChatCompletion(input);

    const aiMessage = {
      type: "ai",
      content: response,
    };

    setIsLoading(false);
    setMessages((prev) => [...prev, aiMessage]);
  };

  return (
    <div className="mt-20 container mx-auto px-4 max-w-6xl min-h-screen">
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
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-4 rounded-lg ${
                      message.type === "user"
                        ? "bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white"
                        : "bg-gray-100"
                    }`}
                  >
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
                  className="px-6 py-2 bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white rounded-full hover:opacity-90 transition-all transform hover:scale-105"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Token Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-6"
          >
            <h2 className="text-xl font-bold mb-4">Related Tokens</h2>
            <div className="space-y-3">
              {relevantInfo.tokens.map((token) => (
                <Link
                  key={token.id}
                  href={`/token/${token.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{token.name}</span>
                    <span className="text-gray-600">{token.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Governance Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-6"
          >
            <h2 className="text-xl font-bold mb-4">Governance</h2>
            <div className="space-y-2">
              <p>Active Proposals: {relevantInfo.governance.proposals}</p>
              <p>Ongoing Votes: {relevantInfo.governance.activeVotes}</p>
            </div>
          </motion.div>

          {/* Insurance Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-6"
          >
            <h2 className="text-xl font-bold mb-4">Insurance</h2>
            <div className="space-y-2">
              <p>Coverage: {relevantInfo.insurance.coverage}</p>
              <p>Premium: {relevantInfo.insurance.premium}</p>
              <Link
                href="/insurance"
                className="inline-block mt-2 text-[#0052FF] hover:underline"
              >
                View Details →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}