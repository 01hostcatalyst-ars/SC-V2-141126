"use client";

import React from "react";
import { Card } from "@/components/ui/Card";

interface StatsBarProps {
  stats: {
    total: number;
    active: number;
    completed: number;
    pending: number;
  };
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <Card className="flex flex-col gap-1 p-4 bg-slate-900/10 text-left">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Agreements</span>
        <span className="text-2xl font-extrabold text-white">{stats.total}</span>
      </Card>

      <Card className="flex flex-col gap-1 p-4 bg-slate-900/10 text-left">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Campaigns</span>
        <span className="text-2xl font-extrabold text-emerald-400">{stats.active}</span>
      </Card>

      <Card className="flex flex-col gap-1 p-4 bg-slate-900/10 text-left">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pending Execution</span>
        <span className="text-2xl font-extrabold text-amber-400">{stats.pending}</span>
      </Card>

      <Card className="flex flex-col gap-1 p-4 bg-slate-900/10 text-left">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fulfilled Deals</span>
        <span className="text-2xl font-extrabold text-blue-400">{stats.completed}</span>
      </Card>
    </div>
  );
};
