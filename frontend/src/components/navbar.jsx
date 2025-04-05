"use client";

import { usePrivy } from "@privy-io/react-auth";
import * as fcl from "@onflow/fcl";
import { useState, useEffect } from "react";


export default function Navbar() {
  const { login, ready, authenticated, user, logout } = usePrivy();
  const [flowUser, setFlowUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const selectedPill = typeof window !== "undefined" ? localStorage.getItem("selectedPill") : null;

  useEffect(() => {
    fcl.config({
      "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn", // Endpoint set to Testnet
    })
    
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

  if (!selectedPill) {
    return (
      <nav className="fixed top-0 w-full backdrop-blur-md bg-transparent shadow-sm3 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold">
            <img
              src="/logo.png"
              alt="Frenz.fi Logo"
              className="h-8 inline-block mr-2"
            />
            Frenz.fi
          </div>
          <div></div>
        </div>
      </nav>
    );
  }

  if (selectedPill === "flow") {
    return (
      <nav className="fixed top-0 w-full backdrop-blur-md bg-transparent shadow-sm3 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold">
            <img
              src="/logo.png"
              alt="Frenz.fi Logo"
              className="h-8 inline-block mr-2"
            />
            Frenz.fi
          </div>
          {!isLoading && (
            <div className="flex items-center gap-4">
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
        <div className="text-2xl font-bold">
          <img
            src="/logo.png"
            alt="Frenz.fi Logo"
            className="h-8 inline-block mr-2"
          />
          Frenz.fi
        </div>
        <>
          {ready && (
            <div className="flex items-center gap-4">
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