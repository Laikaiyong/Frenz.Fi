"use client";

import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import DynamicFeeDashboard from '@/components/DynamicFeeDashboard';
import CreateLiquidityPosition from '@/components/CreateLiquidityPosition';

export default function DynamicFeePage() {
  const { ready, authenticated, login } = usePrivy();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!ready) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="mt-20 container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dynamic Fee Hook</h1>
        <button
          onClick={login}
          className="px-4 py-2 bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white rounded-full hover:opacity-90 transition-all"
        >
          {authenticated ? "Connected" : "Connect Wallet"}
        </button>
      </div>
      
      <div className="mb-6">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            className={`flex-1 py-2 rounded-md transition-all ${
              activeTab === "dashboard"
                ? "bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            Pools Dashboard
          </button>
          <button
            className={`flex-1 py-2 rounded-md transition-all ${
              activeTab === "create"
                ? "bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("create")}
          >
            Create LP
          </button>
        </div>
      </div>
      
      <div className="mt-4">
        {activeTab === "dashboard" && <DynamicFeeDashboard />}
        {activeTab === "create" && <CreateLiquidityPosition />}
      </div>
    </div>
  );
}