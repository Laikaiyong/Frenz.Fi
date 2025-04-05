"use client";

import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DynamicFeeDashboard() {
  const { ready, authenticated } = usePrivy();
  const [pools, setPools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [emergencyStatus, setEmergencyStatus] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch pool info regardless of authentication
    async function fetchData() {
      try {
        setIsLoading(true);
        const poolsResponse = await fetch('/api/uniswap?action=getPoolInfo');
        const poolsData = await poolsResponse.json();
        
        const emergencyResponse = await fetch('/api/uniswap?action=getEmergencyStatus');
        const emergencyData = await emergencyResponse.json();
        
        setPools(poolsData.pools);
        setEmergencyStatus(emergencyData.isActive);
        setError(null);
      } catch (err) {
        setError('Failed to load data: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (ready) {
      fetchData();
      // Set up a polling interval to refresh data
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      
      // Clean up on unmount
      return () => clearInterval(interval);
    }
  }, [ready]);

  if (!ready || isLoading) {
    return <div className="p-8 text-center">Loading pool data...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dynamic Fee Pools</h1>
      
      {emergencyStatus && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Emergency Mode Active</p>
          <p>All pools are currently using emergency fee settings.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pools.map((pool, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{pool.name}</CardTitle>
              <Badge variant="secondary">{pool.formattedCurrentFee} Fee</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Volume:</span>
                  <span className="font-semibold">{pool.formattedVolume}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Swap Count:</span>
                  <span className="font-semibold">{pool.swapCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-semibold">
                    {pool.initialized === false ? "Not Initialized" : "Active"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}