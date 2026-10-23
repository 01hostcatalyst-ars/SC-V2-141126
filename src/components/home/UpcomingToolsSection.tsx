"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PieChart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  CreditCard,
  Lock,
} from "lucide-react";

export function UpcomingToolsSection() {
  const [submittedTool, setSubmittedTool] = useState<string | null>(null);

  const handleJoinWaitlist = (toolName: string) => {
    setSubmittedTool(toolName);
    setTimeout(() => {
      setSubmittedTool(null);
    }, 4000);
  };

  return (
    <section className="py-16 md:py-24 bg-zinc-50/70 border-t border-zinc-200/80 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 text-white text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Product Roadmap • The Commercial Pipeline</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-950 font-display tracking-tight">
              Expanding the Operating System.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 font-medium leading-relaxed">
              SignCollab is actively expanding from directory discovery, rate intelligence, and 1-page bilateral agreements into an end-to-end commercial operations suite for modern marketing teams.
            </p>
          </div>

          <div className="text-xs font-mono font-semibold text-zinc-600 bg-white px-3.5 py-2 rounded-xl border border-zinc-200 shrink-0">
            Roadmap Pipeline: 2026 Release Schedule
          </div>
        </div>

        {/* 2 Pipeline Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Tool 01: Budget-Based Campaign Planner */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-sm surface-card flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200 font-mono">
                  In Development • Q4 Roadmap
                </span>
                <span className="text-xs font-mono text-zinc-500">Campaign Operations</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                  <PieChart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-950">
                    Budget-Based Campaign Planner
                  </h3>
                  <span className="text-xs text-zinc-500 font-medium">
                    Algorithmic Media Mix &amp; Campaign Orchestration
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
                Input your total commercial budget (e.g. $10,000, £5,000, or Rs. 1,500,000) and campaign targets. SignCollab&apos;s allocation engine automatically generates the optimal creator portfolio, deliverable mix, and flighting timeline to maximize combined reach and minimize blended CPM.
              </p>

              {/* Feature Highlights List */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 text-xs">
                <div className="flex items-center gap-2 text-zinc-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span><strong>Optimal Roster Allocation:</strong> Automatically balances Macro anchor credibility with Micro organic conversion.</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span><strong>Milestone Delivery Tracking:</strong> Schedule multi-creator flighting with integrated 48h approval workflows.</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span><strong>Unified Reporting:</strong> Aggregate performance across YouTube, Instagram, and TikTok under one dashboard.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
              <span className="text-xs text-zinc-500 font-medium">
                {submittedTool === "planner" ? (
                  <span className="text-indigo-700 font-bold">You are on the priority waitlist.</span>
                ) : (
                  "Get early access to campaign allocation beta."
                )}
              </span>
              <button
                type="button"
                onClick={() => handleJoinWaitlist("planner")}
                disabled={submittedTool === "planner"}
                className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer disabled:opacity-60"
              >
                {submittedTool === "planner" ? "Waitlist Confirmed" : "Request Early Access"}
              </button>
            </div>
          </div>

          {/* Tool 02: Milestone Escrow & Automated Settlement */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-sm surface-card flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-violet-50 text-violet-800 border border-violet-200 font-mono">
                  In Architecture • Q1 2027
                </span>
                <span className="text-xs font-mono text-zinc-500">Financial Infrastructure</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-950">
                    Milestone Escrow &amp; Settlement
                  </h3>
                  <span className="text-xs text-zinc-500 font-medium">
                    Secure Payment Custody &amp; Automated Releases
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
                Eliminate creator payment chasing and brand delivery risk. Brands fund campaign milestones upfront into secure third-party escrow. Funds are automatically disbursed upon verified deliverable approval or via the enforced 48-hour deemed approval protocol.
              </p>

              {/* Feature Highlights List */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 text-xs">
                <div className="flex items-center gap-2 text-zinc-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                  <span><strong>Advance Deposit Lock:</strong> Guarantee creator compensation before production commences.</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                  <span><strong>Automated Delivery Release:</strong> Disburse final payouts upon verified upload without manual wire chasing.</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                  <span><strong>Global Multi-Currency:</strong> Settlement via bank IBAN, ACH, and cross-border digital rails across 17+ markets.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
              <span className="text-xs text-zinc-500 font-medium">
                {submittedTool === "escrow" ? (
                  <span className="text-violet-700 font-bold">You are on the priority waitlist.</span>
                ) : (
                  "Get early access to secure escrow settlements."
                )}
              </span>
              <button
                type="button"
                onClick={() => handleJoinWaitlist("escrow")}
                disabled={submittedTool === "escrow"}
                className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer disabled:opacity-60"
              >
                {submittedTool === "escrow" ? "Waitlist Confirmed" : "Request Early Access"}
              </button>
            </div>
          </div>
        </div>

        {/* Public Beta Commitment & Trust Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-zinc-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-8 text-left border border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold text-indigo-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Public Beta Commitment
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
              Free During Public Beta. No Credit Card Required.
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
              Explore 3,000+ audited creator profiles, benchmark multi-platform valuations, and generate legally binding 1-page bilateral contracts with zero subscription paywalls or hidden fees.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 relative z-10">
            <Link
              href="/creators"
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all text-center shadow-sm cursor-pointer"
            >
              Search Creator Directory
            </Link>
            <Link
              href="/instant"
              className="px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-bold rounded-xl text-xs sm:text-sm transition-all text-center cursor-pointer"
            >
              Draft Instant Contract
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
