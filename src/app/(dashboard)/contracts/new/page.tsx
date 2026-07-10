"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { ContractWizard } from "@/components/contract/ContractForm/ContractWizard";

export default function NewContractPage() {
  const [role, setRole] = useState<string>("CREATOR");
  const [linkedContracts, setLinkedContracts] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch profile to determine role
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (res.ok && data.success) {
          setRole(data.profile.role);
          
          // 2. If Agency, fetch active Agency-Brand contracts to support pairing
          if (data.profile.role === "AGENCY") {
            const contractsRes = await fetch("/api/contracts");
            const contractsData = await contractsRes.json();
            if (contractsRes.ok && contractsData.success) {
              const activeBrandCampaigns = contractsData.contracts
                .filter((c: any) => c.contractType === "AGENCY_TO_BRAND")
                .map((c: any) => ({
                  label: `${c.contractNumber} (${c.respondentCompany || "Brand Link"})`,
                  value: c.id,
                }));
              setLinkedContracts(activeBrandCampaigns);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load layout profile info", err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Header />
        
        <div className="flex flex-1 pt-16">
          <Sidebar userRole={role as any} />
          
          <main className="flex-1 pl-64 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
            <div className="flex flex-col gap-6 py-6">
              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Collaboration Agreement</h2>
                <p className="text-sm text-slate-500 mt-1">Specify campaign terms, deliverables, and security parameters.</p>
              </div>

              <ContractWizard userRole={role} linkedContracts={linkedContracts} />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
