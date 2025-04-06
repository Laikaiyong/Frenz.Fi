// - Insurance Subscription for coin deployed on platform going down
// - Staking pool of usdc that can supplies to ppl who lose money
// - If you are part of this pool, 1% of any token is being auto distributed on our platform
// - If you are part of the pool, for the more usdc u staked in, u get governance point (vote for platform directions)
// - platform directions voting access
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";

const GOVERNANCE_ROLES = {
    GUARDIAN: { icon: '🛡️', title: 'Guardian', minStake: '1,000' },
    KNIGHT: { icon: '⚔️', title: 'Knight', minStake: '5,000' },
    NOBLE: { icon: '👑', title: 'Noble', minStake: '10,000' },
    SOVEREIGN: { icon: '🏰', title: 'Sovereign', minStake: '50,000' }
  };
  
  const POOL_STATS = {
    SECURITY: { icon: '🔐', title: 'Security Level' },
    GROWTH: { icon: '📈', title: 'Growth Rate' },
    STABILITY: { icon: '⚡', title: 'Pool Stability' }
  };

  const GovernanceRoleCard = ({ role, isActive }) => {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`p-4 rounded-xl backdrop-blur-md ${
          isActive 
            ? 'bg-gradient-to-br from-indigo-900/90 to-blue-900/90 text-white border-2 border-blue-400'
            : 'bg-white/20 border border-gray-200'
        }`}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">{role.icon}</div>
          <h3 className="font-bold mb-1">{role.title}</h3>
          <p className="text-sm opacity-75">Min Stake: {role.minStake} USDC</p>
        </div>
      </motion.div>
    );
  };
  
  const PoolInfoCard = ({ info, value, maxValue }) => {
    const percentage = (value / maxValue) * 100;
    
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-900/20 to-indigo-900/20 p-4">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{info.icon}</span>
            <h3 className="font-medium">{info.title}</h3>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              className="h-full bg-gradient-to-r from-[#627EEA] to-[#0052FF]"
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-repeat bg-[url('data:image/svg+xml,...')]" />
        </div>
      </div>
    );
  };

export default function InsurancePage() {
  const { authenticated, user } = usePrivy();
  const [stakeAmount, setStakeAmount] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const poolData = {
    totalStaked: "500,000 USDC",
    stakeholders: 150,
    averageAPY: "8%",
    governancePoints: 1500,
    distributedRewards: "50,000 USDC",
  };

  const userStats = {
    stakedAmount: "1,000 USDC",
    earnedPoints: 100,
    votingPower: "2%",
    pendingRewards: "50 USDC",
  };

  const proposals = [
    {
      id: 1,
      title: "Increase Coverage Pool",
      status: "Active",
      votes: 120,
      endDate: "2024-04-15",
    },
    {
      id: 2,
      title: "Adjust Premium Rates",
      status: "Pending",
      votes: 80,
      endDate: "2024-04-20",
    },
  ];

  const maxPoolCapacity = 1000000; // 1M USDC
  const currentFillPercentage = (parseInt(poolData.totalStaked.replace(/[^0-9]/g, '')) / maxPoolCapacity) * 100;

//   if (!authenticated) {
//     return (
//       <div className="mt-20 flex justify-center items-center min-h-[60vh]">
//         <div className="text-center p-8 rounded-lg bg-white/80 backdrop-blur-sm shadow-xl">
//           <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C]">
//             Please connect your wallet to access insurance features
//           </h2>
//         </div>
//       </div>
//     );
//   }

  return (
    <div className="mt-20 container mx-auto px-4 max-w-6xl">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C]">
            Insurance & Staking Pool
          </span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Stake USDC to earn governance points and platform rewards while providing insurance coverage for the community.
        </p>
      </motion.div>

      {/* Tabs Navigation */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 bg-gray-100 rounded-lg">
          {["overview", "stake", "governance"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium capitalize transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Pool Statistics */}
        {/* Left Panel - Enhanced Pool Stats */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-1"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">💧</span>
            <h2 className="text-xl font-bold">Pool Statistics</h2>
          </div>

          <div className="space-y-4">
            <PoolInfoCard 
              info={POOL_STATS.SECURITY} 
              value={75} 
              maxValue={100} 
            />
            <PoolInfoCard 
              info={POOL_STATS.GROWTH} 
              value={85} 
              maxValue={100} 
            />
            <PoolInfoCard 
              info={POOL_STATS.STABILITY} 
              value={90} 
              maxValue={100} 
            />

            <div className="mt-6 p-4 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Total Staked</span>
                <span className="text-2xl">💎</span>
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-[#627EEA] to-[#0052FF] bg-clip-text text-transparent">
                {poolData.totalStaked}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Center/Right Panel - Enhanced Governance View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-2"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-6">
          {activeTab === "governance" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">⚔️</span>
                <h2 className="text-xl font-bold">Governance Ranks</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {Object.entries(GOVERNANCE_ROLES).map(([key, role]) => (
                  <GovernanceRoleCard
                    key={key}
                    role={role}
                    isActive={userStats.stakedAmount >= parseInt(role.minStake.replace(/,/g, ''))}
                  />
                ))}
              </div>

              {/* Existing proposals with enhanced styling */}
              <div className="space-y-4 mt-8">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span>🏛️</span> Active Proposals
                </h3>
                {/* ...existing proposals mapping... */}
              </div>
            </>
          )}
            {activeTab === "overview" && (
              <div>
                <h2 className="text-xl font-bold mb-6">Your Insurance Stats</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600">Your Stake</p>
                    <p className="text-2xl font-bold">{userStats.stakedAmount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Governance Points</p>
                    <p className="text-2xl font-bold">{userStats.earnedPoints}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Voting Power</p>
                    <p className="text-2xl font-bold">{userStats.votingPower}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Pending Rewards</p>
                    <p className="text-2xl font-bold text-green-600">
                      {userStats.pendingRewards}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "stake" && (
              <div>
                <h2 className="text-xl font-bold mb-6">Stake USDC</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount to Stake
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none"
                        placeholder="Enter USDC amount"
                      />
                      <button className="px-6 py-2 bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white rounded-lg hover:opacity-90 transition-all">
                        Stake
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "governance" && (
              <div>
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div
                      key={proposal.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-[#0052FF] transition-all"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{proposal.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            proposal.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {proposal.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Votes: {proposal.votes}</span>
                        <span>Ends: {proposal.endDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}