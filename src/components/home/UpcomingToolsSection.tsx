"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  PieChart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Users,
  Target,
  Zap,
} from "lucide-react";

export function UpcomingToolsSection() {
  const [waitlistEmail, setWaitlistEmail] = useState("");
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
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Product Roadmap • The Horizon</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-950 font-display tracking-tight">
              The Future of Creator Commerce.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 font-medium leading-relaxed">
              We are actively expanding SignCollab from rate intelligence and 1-page contracts into the comprehensive commercial operating system for talent, agencies, and brand marketers.
            </p>
          </div>

          <div className="text-xs font-mono font-semibold text-zinc-600 bg-white px-3.5 py-2 rounded-xl border border-zinc-200 shrink-0">
            Roadmap Status: Q4 2026 Pipeline
          </div>
        </div>

        {/* 2 Feature Roadmap Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Tool 03: Searchable Creator Directory */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-sm surface-card flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                  Tool 03 • In Active Development
                </span>
                <span className="text-xs font-mono text-zinc-600">Beta Launch: Next</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-950">
                    Searchable Creator Directory
                  </h3>
                  <span className="text-xs text-zinc-500 font-medium">
                    Talent Discovery with Built-In Valuation Transparency
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
                Browse thousands of audited creators across 20+ specialized verticals and 17 global regions. Filter talent by verified view velocity, actual engagement quality, and defensible rate benchmarks. Skip cold outreach guessing games and book talent with agreed pricing from day one.
              </p>

              {/* Feature Highlights List */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 text-xs">
                <div className="flex items-center gap-2 text-zinc-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Granular Filtering:</strong> Search by niche, sub-vertical, audience geography, and PPP economic tier.</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Verified Quality Index:</strong> Audit organic engagement and skip-resistance retention before reaching out.</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Creator Claim Portal:</strong> Creators can claim public profiles to manage verified rate cards and receive direct commercial briefs.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
              <span className="text-xs text-zinc-500 font-medium">
                {submittedTool === "directory" ? (
                  <span className="text-emerald-700 font-bold">You are on the priority waitlist.</span>
                ) : (
                  "Be the first to access when the directory opens."
                )}
              </span>
              <button
                type="button"
                onClick={() => handleJoinWaitlist("directory")}
                disabled={submittedTool === "directory"}
                className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer disabled:opacity-60"
              >
                {submittedTool === "directory" ? "Waitlist Confirmed" : "Request Early Access"}
              </button>
            </div>
          </div>

          {/* Tool 04: Budget-Based Campaign Planner */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-sm surface-card flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                  Tool 04 • In Active Development
                </span>
                <span className="text-xs font-mono text-zinc-600">Q4 Roadmap</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
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
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span><strong>Optimal Roster Allocation:</strong> Automatically balances Macro anchor credibility with Micro organic conversion.</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span><strong>Milestone Delivery Tracking:</strong> Schedule multi-creator flighting with integrated 48h approval workflows.</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span><strong>Consolidated Invoicing:</strong> Execute multi-creator agreements under unified bilateral contractual terms.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
              <span className="text-xs text-zinc-500 font-medium">
                {submittedTool === "planner" ? (
                  <span className="text-blue-700 font-bold">You are on the priority waitlist.</span>
                ) : (
                  "Get early access to algorithmic campaign allocation."
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

        </div>

        {/* Public Beta Commitment & Legacy Guarantee Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-zinc-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-8 text-left border border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Free Public Beta Commitment
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
              Every Tool in SignCollab is Currently 100% Free.
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
              We are building the commercial operating system of the creator economy in public. No subscription fees, no credit card requirements, and zero legal paywalls. Early users who sign deals and audit profiles today will receive grandfathered lifetime perks when premium enterprise plans launch.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 relative z-10">
            <Link
              href="/influencer-rate-calculator"
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs sm:text-sm transition-all text-center shadow-sm cursor-pointer"
            >
              Start Auditing Rates Free
            </Link>
            <Link
              href="/instant"
              className="px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-bold rounded-xl text-xs sm:text-sm transition-all text-center cursor-pointer"
            >
              Draft Free Contract
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
