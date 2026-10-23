"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  UserCheck,
  Building2,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FileText,
  Lock,
  Layers,
} from "lucide-react";

export function AudiencePersonasSection() {
  return (
    <section className="py-16 md:py-24 bg-white border-t border-zinc-200/80 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Built For Every Stakeholder</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 font-display tracking-tight leading-tight">
            Tailored Commercial Solutions for Creators, Brands &amp; Agencies.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 font-normal leading-relaxed">
            Every party at the creator economy negotiation table has distinct goals. SignCollab gives each one the exact tools needed to collaborate with trust and speed.
          </p>
        </div>

        {/* 3 Distinct Visual Persona Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Persona 1: For Creators */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-purple-50/50 via-white to-white border border-purple-100 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border font-mono bg-purple-50 text-purple-700 border-purple-200">
                  For Creators
                </span>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-purple-600 bg-purple-100/70">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>

              {/* Visual Metaphor Artifact: Defended Rate & Rights Card */}
              <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <span className="text-zinc-500 text-[11px]">RATE DEFENSE</span>
                  <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded text-[10px]">
                    16-Knot Verified
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-700 font-bold">Defended Deliverable:</span>
                  <span className="text-zinc-950 font-black text-sm">$4,800</span>
                </div>
                <div className="space-y-1.5 pt-1 text-[11px] text-zinc-600">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span>48h Deemed Approval Sealed</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-indigo-700">
                    <Lock className="w-3.5 h-3.5 shrink-0 text-indigo-600" />
                    <span>30-Day Capped Whitelisting</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-950 leading-snug">
                  Know your worth. Protect your work. Get paid on time.
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal mt-2">
                  Stop letting brands underpay you or exploit your content rights. Defend your rate card with empirical metrics and execute protective bilateral agreements.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-purple-100/80 text-xs text-zinc-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                  <span>Defensible rate benchmarks based on view velocity &amp; retention</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                  <span>Advance deposit terms to guarantee payment before production</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-purple-100/80">
              <Link
                href="/influencer-rate-calculator"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-purple-950 hover:bg-purple-900 text-white font-bold text-xs transition-colors shadow-2xs"
              >
                <span>Audit Your Rates Free</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-300" />
              </Link>
            </div>
          </div>

          {/* Persona 2: For Brands & Marketers */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-indigo-50/50 via-white to-white border border-indigo-100 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border font-mono bg-indigo-50 text-indigo-700 border-indigo-200">
                  For Brands
                </span>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-indigo-600 bg-indigo-100/70">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>

              {/* Visual Metaphor Artifact: Verified Talent Match Card */}
              <div className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-xs space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <span className="text-zinc-500 text-[11px]">TALENT MATCH</span>
                  <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                    Verified Reach
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-700 font-bold">Buyer Intent:</span>
                  <span className="text-emerald-600 font-bold">94% High Intent</span>
                </div>
                <div className="space-y-1.5 pt-1 text-[11px] text-zinc-600">
                  <div className="flex items-center gap-1.5 text-indigo-700">
                    <FileText className="w-3.5 h-3.5 shrink-0 text-indigo-600" />
                    <span>Pre-Cleared 1-Page Bilateral Contract</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-700">
                    <TrendingUp className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                    <span>17 Country PPP Calibrated Rates</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-950 leading-snug">
                  Hire verified talent. Eliminate pricing guesswork.
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal mt-2">
                  Skip vanity follower counts and cold DM chaos. Discover vetted creators with audited engagement, fair market pricing, and standardized commercial contracts.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-indigo-100/80 text-xs text-zinc-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Access 3,000+ indexed profiles across YouTube, Instagram &amp; TikTok</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Protection against non-delivery and disputed deliverable scopes</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-indigo-100/80">
              <Link
                href="/creators"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-2xs"
              >
                <span>Search Creator Directory</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-200" />
              </Link>
            </div>
          </div>

          {/* Persona 3: For Talent Agencies */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-blue-50/50 via-white to-white border border-blue-100 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border font-mono bg-blue-50 text-blue-700 border-blue-200">
                  For Agencies
                </span>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-blue-600 bg-blue-100/70">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>

              {/* Visual Metaphor Artifact: Multi-Creator Governance Dashboard */}
              <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-xs space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <span className="text-zinc-500 text-[11px]">ROSTER GOVERNANCE</span>
                  <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded text-[10px]">
                    Multi-Talent
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-700 font-bold">Standardized Roster:</span>
                  <span className="text-zinc-950 font-black text-sm">24 Creators</span>
                </div>
                <div className="space-y-1.5 pt-1 text-[11px] text-zinc-600">
                  <div className="flex items-center gap-1.5 text-blue-700">
                    <Layers className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                    <span>Consolidated Client Billing &amp; Flighting</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-purple-700">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-purple-600" />
                    <span>SHA-256 Audit Trail Certificates</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-950 leading-snug">
                  Standardize terms. Scale client campaigns.
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal mt-2">
                  Streamline operations across your entire creator roster. Standardize commercial agreement terms, remove negotiation friction, and generate client-ready reports.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-blue-100/80 text-xs text-zinc-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Unified contractual terms across your entire creator roster</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Defend proposal rate cards with independent third-party models</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-blue-100/80">
              <Link
                href="/features"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs transition-colors shadow-2xs"
              >
                <span>Explore Agency Suite</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
