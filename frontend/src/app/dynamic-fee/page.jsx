// src/app/dynamic-fee/page.jsx
"use client";

import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DynamicFeeDashboard from '@/components/DynamicFeeDashboard';
import CreateLiquidityPosition from '@/components/CreateLiquidityPosition';
import PrivyAuth from '@/components/PrivyAuth';

export default function DynamicFeePage() {
  const { ready } = usePrivy();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!ready) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dynamic Fee Hook</h1>
        <PrivyAuth />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Pools Dashboard</TabsTrigger>
          <TabsTrigger value="create">Create LP</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <DynamicFeeDashboard />
        </TabsContent>
        
        <TabsContent value="create">
          <CreateLiquidityPosition />
        </TabsContent>
      </Tabs>
    </div>
  );
}