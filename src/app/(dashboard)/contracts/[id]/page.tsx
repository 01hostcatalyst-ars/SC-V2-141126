"use client";

import React, { useEffect, useState, use } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { ContractDetail } from "@/components/contract/ContractDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ContractDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [role, setRole] = useState<string>("CREATOR");
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndContract = async () => {
    try {
      // 1. Fetch user role
      const profileRes = await fetch("/api/profile");
      const profileData = await profileRes.json();
      if (profileRes.ok && profileData.success) {
        setRole(profileData.profile.role);
      }

      // 2. Fetch contract details
      const contractRes = await fetch(`/api/contracts/${resolvedParams.id}`);
      const contractData = await contractRes.json();
      if (contractRes.ok && contractData.success) {
        setContract(contractData.contract);
      }
    } catch (err) {
      console.error("Failed to load details page parameters", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndContract();
  }, [resolvedParams.id]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Header />

        <div className="flex flex-1 pt-16">
          <Sidebar userRole={role as any} />

          <main className="flex-1 pl-64 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
            <div className="flex flex-col gap-6 py-6">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
                </div>
              ) : contract ? (
                <ContractDetail
                  contract={contract}
                  userRole={role}
                  refreshContract={fetchProfileAndContract}
                />
              ) : (
                <div className="text-center py-20 text-slate-500 font-semibold">
                  Contract details not found.
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
