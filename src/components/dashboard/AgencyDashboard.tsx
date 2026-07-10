"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StatsBar } from "./StatsBar";
import { ContractCard } from "@/components/contract/ContractCard";
import { Button } from "@/components/ui/Button";

interface AgencyDashboardProps {
  contracts: any[];
}

export const AgencyDashboard: React.FC<AgencyDashboardProps> = ({ contracts }) => {
  const [activeTab, setActiveTab] = useState("BRAND_CAMPAIGNS"); // BRAND_CAMPAIGNS or CREATOR_CAMPAIGNS
  const [filter, setFilter] = useState("ALL");

  const getStats = () => {
    return {
      total: contracts.length,
      active: contracts.filter((c) => c.status === "ACTIVE").length,
      pending: contracts.filter((c) => ["PENDING_RESPONDENT", "PENDING_INITIATOR"].includes(c.status)).length,
      completed: contracts.filter((c) => c.status === "COMPLETED").length,
    };
  };

  const getFilteredContracts = () => {
    // 1. Separate campaigns based on agency contract type
    const baseList = contracts.filter((c) => {
      if (activeTab === "BRAND_CAMPAIGNS") {
        return c.contractType === "AGENCY_TO_BRAND";
      } else {
        return c.contractType === "AGENCY_TO_CREATOR";
      }
    });

    // 2. Apply status filters
    return baseList.filter((c) => {
      if (filter === "ALL") return true;
      if (filter === "ACTIVE") return c.status === "ACTIVE";
      if (filter === "PENDING") return ["PENDING_RESPONDENT", "PENDING_INITIATOR"].includes(c.status);
      if (filter === "COMPLETED") return c.status === "COMPLETED";
      return true;
    });
  };

  const filteredContracts = getFilteredContracts();

  return (
    <div className="flex flex-col gap-8 text-left">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Agency Hub</h2>
          <p className="text-sm text-slate-500 mt-1">Orchestrate multi-partner campaigns, manage liability firewalls, and audit pairings.</p>
        </div>
        <Link href="/contracts/new">
          <Button>+ New Agreement</Button>
        </Link>
      </div>

      <StatsBar stats={getStats()} />

      {/* Agency direction switcher tabs */}
      <div className="flex border-b border-slate-900 mt-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("BRAND_CAMPAIGNS")}
          className={`px-6 py-3 font-semibold text-sm border-b-2 whitespace-nowrap transition-all outline-none ${
            activeTab === "BRAND_CAMPAIGNS"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Agency ↔ Brand Agreements
        </button>
        <button
          onClick={() => setActiveTab("CREATOR_CAMPAIGNS")}
          className={`px-6 py-3 font-semibold text-sm border-b-2 whitespace-nowrap transition-all outline-none ${
            activeTab === "CREATOR_CAMPAIGNS"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Agency ↔ Creator Agreements
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-2 border-b border-slate-900 pb-3 overflow-x-auto">
          {["ALL", "PENDING", "ACTIVE", "COMPLETED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all outline-none ${
                filter === f
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {f.toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {filteredContracts.length > 0 ? (
            filteredContracts.map((c) => <ContractCard key={c.id} contract={c} />)
          ) : (
            <div className="text-center py-16 rounded-xl border border-dashed border-slate-900 text-xs font-semibold text-slate-600 uppercase tracking-widest">
              No contracts matching this tab.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
