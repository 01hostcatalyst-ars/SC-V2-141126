"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { CreatorDashboard } from "@/components/dashboard/CreatorDashboard";
import { BrandDashboard } from "@/components/dashboard/BrandDashboard";
import { AgencyDashboard } from "@/components/dashboard/AgencyDashboard";

export default function DashboardPage() {
  const [role, setRole] = useState<string>("CREATOR");
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndContracts = async () => {
    try {
      // 1. Fetch user role
      const profileRes = await fetch("/api/profile");
      const profileData = await profileRes.json();
      if (profileRes.ok && profileData.success) {
        setRole(profileData.profile.role);
      }

      // 2. Fetch contracts
      const contractsRes = await fetch("/api/contracts");
      const contractsData = await contractsRes.json();
      if (contractsRes.ok && contractsData.success) {
        setContracts(contractsData.contracts);
      }
    } catch (err) {
      console.error("Failed to load dashboard parameters", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndContracts();
  }, []);

  const renderDashboardByRole = () => {
    switch (role) {
      case "BRAND":
        return <BrandDashboard contracts={contracts} />;
      case "AGENCY":
        return <AgencyDashboard contracts={contracts} />;
      case "CREATOR":
      default:
        return <CreatorDashboard contracts={contracts} />;
    }
  };

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
              ) : (
                renderDashboardByRole()
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
