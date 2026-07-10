"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StatsBar } from "./StatsBar";
import { ContractCard } from "@/components/contract/ContractCard";
import { Button } from "@/components/ui/Button";

interface BrandDashboardProps {
  contracts: any[];
}

export const BrandDashboard: React.FC<BrandDashboardProps> = ({ contracts }) => {
  const [filter, setFilter] = useState("ALL");

  const getStats = () => {
    return {
      total: contracts.length,
      active: contracts.filter((c) => c.status === "ACTIVE").length,
      pending: contracts.filter((c) => ["PENDING_RESPONDENT", "PENDING_INITIATOR"].includes(c.status)).length,
      completed: contracts.filter((c) => c.status === "COMPLETED").length,
    };
  };

  const filteredContracts = contracts.filter((c) => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return c.status === "ACTIVE";
    if (filter === "PENDING") return ["PENDING_RESPONDENT", "PENDING_INITIATOR"].includes(c.status);
    if (filter === "COMPLETED") return c.status === "COMPLETED";
    return true;
  });

  return (
    <div className="flex flex-col gap-8 text-left">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Brand Console</h2>
          <p className="text-sm text-slate-500 mt-1">Formalize creator partnerships, verify deliverables, and audit usage scope.</p>
        </div>
        <Link href="/contracts/new">
          <Button>+ Invite Creator</Button>
        </Link>
      </div>

      <StatsBar stats={getStats()} />

      <div className="flex flex-col gap-4 mt-2">
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
              No contracts matching this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
