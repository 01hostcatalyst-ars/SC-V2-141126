"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  Calendar,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function EcosystemWorkflowSection() {
  const steps = [
    {
      num: "01",
      title: "Discover",
      label: "Talent Discovery",
      icon: Users,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      description:
        "Filter 3,000+ verified creators across YouTube, Instagram, and TikTok by audience demographics, engagement velocity, and commercial buyer intent.",
      link: "/creators",
      linkText: "Explore Directory",
    },
    {
      num: "02",
      title: "Understand",
      label: "Rate Intelligence",
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      description:
        "Replace pricing guesswork with our 16-Knot empirical valuation model. Defend creator deliverable rates with geographic purchasing power parity adjustments.",
      link: "/influencer-rate-calculator",
      linkText: "Audit Fair Rates",
    },
    {
      num: "03",
      title: "Plan",
      label: "Campaign Tools",
      icon: Calendar,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      description:
        "Input your campaign budget to automatically model the optimal creator portfolio, deliverable mix, and flighting schedule for maximum blended reach.",
      link: "/features",
      linkText: "View Pipeline",
    },
    {
      num: "04",
      title: "Execute",
      label: "Instant Contracts",
      icon: FileText,
      color: "text-violet-600 bg-violet-50 border-violet-200",
      description:
        "Lock terms into binding 1-page bilateral contracts with 48h deemed approvals, capped whitelisting windows, and tamper-evident SHA-256 audit trails.",
      link: "/instant",
      linkText: "Draft Contract",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-[#fbfbfe] border-t border-zinc-200/80 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unified Commercial Workflow</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 font-display tracking-tight">
              The Commercial Lifecycle in Four Connected Steps.
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 font-normal leading-relaxed">
              SignCollab connects every stage of creator partnerships so you can move from discovery to signed execution in minutes instead of weeks.
            </p>
          </div>

          <div className="text-xs font-mono font-bold text-zinc-500 bg-white px-4 py-2 rounded-xl border border-zinc-200 shadow-2xs shrink-0">
            End-to-End Infrastructure
          </div>
        </div>

        {/* 4 Connected Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-zinc-400">
                      PHASE {step.num}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center ${step.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
                      {step.label}
                    </span>
                    <h3 className="text-xl font-bold text-zinc-950 mt-0.5">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100">
                  <Link
                    href={step.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors"
                  >
                    <span>{step.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
