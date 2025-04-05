"use client";

import { usePrivy } from "@privy-io/react-auth";
import * as fcl from "@onflow/fcl";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const { login, ready, authenticated, user, logout } = usePrivy();
  const [flowUser, setFlowUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const selectedPill =
    typeof window !== "undefined" ? localStorage.getItem("selectedPill") : null;

  useEffect(() => {
    fcl
      .config()
      .put("flow.network", "testnet")
      .put("accessNode.api", "https://rest-testnet.onflow.org")
      .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
      .put(
        "walletconnect.projectId",
        process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
      )
      .put("app.detail.title", "Test Harness")
      .put("app.detail.icon", "https://i.imgur.com/r23Zhvu.png")
      .put("app.detail.description", "A test harness for FCL")
      .put("app.detail.url", "https://myapp.com")
      .put("0xFlowToken", "0x7e60df042a9c0868");
    fcl.currentUser.subscribe(setFlowUser);
    setIsLoading(false);
  }, []);

  const handleFlowLogin = async () => {
    try {
      await fcl.authenticate();
    } catch (error) {
      console.error("Error logging in with Flow:", error);
    }
  };

  const handleFlowLogout = async () => {
    try {
      await fcl.unauthenticate();
    } catch (error) {
      console.error("Error logging out from Flow:", error);
    }
  };

  const networkConfig = {
    flow: {
      name: "Flow",
      icon: "https://cryptologos.cc/logos/flow-flow-logo.png",
      color: "#00EF8B",
    },
    base: {
      name: "Base",
      icon: "https://payload-marketing.moonpay.com/api/media/file/base%20logo.webp",
      color: "#0052FF",
    },
    celo: {
      name: "Celo",
      icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyejSxfv1VRb4-lAhpR2xyG-_-A1XH0n9riw&s",
      color: "#FBCC5C",
    },
  };

  const NetworkButton = ({ network }) => (
    <Link 
      href="/app?reset=true"
      className={`
        flex mr-4 items-center gap-2 px-4 py-2 rounded-full
        ${network ? 'border-2 border-gray-200 hover:border-gray-300' : 'bg-gradient-to-r from-[#00EF8B] via-[#0052FF] to-[#FBCC5C]'}
        transition-all ml-4 group hover:scale-[1.02]
      `}
    >
      {network ? (
        <>
          <img 
            src={networkConfig[network].icon} 
            alt={`${networkConfig[network].name} icon`}
            className="w-5 h-5 rounded-full"
          />
          <span className="text-sm font-medium">
            {networkConfig[network].name}
          </span>
        </>
      ) : (
        <>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-5 h-5 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
          <span className="text-sm font-medium text-white">
            Select Network
          </span>
        </>
      )}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-4 w-4 ${network ? 'text-gray-500' : 'text-white'}`}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M19 9l-7 7-7-7" 
        />
      </svg>
    </Link>
  );

  if (!selectedPill) {
    return (
      <nav className="fixed top-0 w-full backdrop-blur-md bg-transparent shadow-sm3 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/app" className="text-2xl font-bold">
            <img
              src="/logo.png"
              alt="Frenz.fi Logo"
              className="h-8 inline-block mr-2"
            />
            Frenz.fi
          </a>
          <div>
            <NetworkButton network="" />
          </div>
        </div>
      </nav>
    );
  }

  if (selectedPill === "flow") {
    return (
      <nav className="fixed top-0 w-full backdrop-blur-md bg-transparent shadow-sm3 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/app" className="text-2xl font-bold">
            <img
              src="/logo.png"
              alt="Frenz.fi Logo"
              className="h-8 inline-block mr-2"
            />
            Frenz.fi
          </a>
          {!isLoading && (
            <div className="flex items-center">
              <NetworkButton network="flow" />
              {flowUser?.addr && (
                <span className="text-sm text-gray-600">
                  {flowUser.addr.slice(0, 6)}...{flowUser.addr.slice(-4)}
                </span>
              )}
              <div
                className={`${
                  flowUser?.addr
                    ? "p-[2px] bg-gradient-to-r from-[#00EF8B] via-[#0052FF] to-[#FBCC5C] rounded-full"
                    : ""
                }`}>
                <button
                  onClick={flowUser?.addr ? handleFlowLogout : handleFlowLogin}
                  className={`px-6 py-2 rounded-full font-bold ${
                    flowUser?.addr
                      ? "bg-white hover:bg-transparent text-black hover:text-white"
                      : "bg-gradient-to-r from-[#00EF8B] via-[#0052FF] to-[#FBCC5C] text-white"
                  } hover:opacity-90 transition-all transform hover:scale-105`}>
                  {flowUser?.addr ? "Logout" : "Connect Flow"}
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  // Default Privy login for other networks
  return (
    <nav className="fixed top-0 w-full backdrop-blur-md bg-transparent shadow-sm3 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <a href="/app" className="text-2xl font-bold">
          <img
            src="/logo.png"
            alt="Frenz.fi Logo"
            className="h-8 inline-block mr-2"
          />
          Frenz.fi
        </a>
        <>
          {ready && (
            <div className="flex items-center">
              <NetworkButton network={selectedPill} />
              {authenticated && (
                <span className="text-sm text-gray-600">
                  {user?.wallet?.address?.slice(0, 6)}...
                  {user?.wallet?.address?.slice(-4)}
                </span>
              )}
              <div
                className={`${
                  authenticated
                    ? "p-[2px] bg-gradient-to-r from-[#00EF8B] via-[#0052FF] to-[#FBCC5C] rounded-full"
                    : ""
                }`}>
                <button
                  onClick={authenticated ? logout : login}
                  className={`px-6 py-2 rounded-full font-bold ${
                    authenticated
                      ? "bg-white hover:bg-transparent text-black hover:text-white"
                      : "bg-gradient-to-r from-[#00EF8B] via-[#0052FF] to-[#FBCC5C] text-white"
                  } hover:opacity-90 transition-all transform hover:scale-105`}>
                  {authenticated ? "Logout" : "Login"}
                </button>
              </div>
            </div>
          )}
        </>
      </div>
    </nav>
  );
}
