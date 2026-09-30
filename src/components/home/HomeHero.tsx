"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";

export function HomeHero() {
  const scrollToValuation = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("valuation-hub");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.href = "/influencer-rate-calculator";
    }
  };

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden text-center">
      {/* Subtle Directional Ambient Spotlight */}
      <div className="absolute top-0 inset-x-0 h-[520px] ambient-spotlight-emerald pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center">
        {/* Eyebrow Platform Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-semibold shadow-sm border border-zinc-800 mb-6 animate-fadeIn max-w-[94vw]">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="font-mono text-[10px] sm:text-[11px] text-emerald-400 font-bold uppercase tracking-wider shrink-0">
            100% Free Public Beta
          </span>
          <span className="text-zinc-600 font-light">•</span>
          <span className="text-zinc-200 truncate text-[11px] sm:text-xs">
            The Commercial Operating System for Creators, Brands &amp; Agencies
          </span>
        </div>

        {/* Master Category Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold text-zinc-950 tracking-tight leading-[1.08] font-display max-w-4xl">
          Where Creator Deals are{" "}
          <span className="text-zinc-950 relative inline-block">
            Valued, Negotiated, and Signed.
            <svg
              className="absolute -bottom-2 left-0 w-full text-emerald-500/80"
              height="8"
              viewBox="0 0 100 8"
              preserveAspectRatio="none"
              fill="currentColor"
            >
              <path d="M0 7c30-5 70-5 100 0v1H0z" />
            </svg>
          </span>
        </h1>

        {/* Subtitle Value Proposition */}
        <p className="mt-6 text-base sm:text-lg text-zinc-600 max-w-2xl leading-relaxed font-medium">
          SignCollab replaces chaotic DMs and guesswork pricing with empirical deliverable valuations, 1-page bilateral agreements, and automated campaign workflows. Fast, transparent, and completely free.
        </p>

        {/* Dual High-Intent CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
          <button
            type="button"
            onClick={scrollToValuation}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Explore Valuation Radar</span>
            <ArrowRight className="w-4 h-4 text-zinc-400" />
          </button>

          <Link
            href="/instant"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-900 text-xs sm:text-sm font-semibold transition-all border border-zinc-200 shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-zinc-700" />
            <span>Draft Instant Contract</span>
          </Link>
        </div>

        {/* Trust Subtext */}
        <div className="mt-3 text-xs text-zinc-600 font-medium">
          No credit card or registration required • Instant Guest Mode enabled
        </div>

        {/* ========================================================= */}
        {/* HERO PRODUCT ECOSYSTEM PREVIEW                            */}
        {/* ========================================================= */}
        <div className="w-full max-w-5xl mt-12 surface-card p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-zinc-200/90 shadow-xl bg-white/95 backdrop-blur-sm text-left">
          <div className="flex items-center justify-between px-2 pb-3 mb-3 border-b border-zinc-100 text-xs font-semibold text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-mono text-zinc-900 uppercase tracking-wider text-[11px]">
                SignCollab Bilateral Commercial Flow
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
              <Lock className="w-3 h-3 text-zinc-400" /> SHA-256 Tamper-Proof Infrastructure
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
            {/* Left Box: Rate Intelligence Card */}
            <div className="lg:col-span-5 p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 font-mono">
                  Phase 1 • Empirical Valuation Radar
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Model Confidence 94%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-950 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  IJ
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-950 truncate">Irfan Junejo</div>
                  <div className="text-[11px] font-mono text-zinc-500 truncate">
                    @irfanjunejo • Filmmaking &amp; Visual Media
                  </div>
                </div>
                <div className="ml-auto text-right shrink-0">
                  <div className="text-xs font-bold font-mono text-zinc-950">2.75M</div>
                  <div className="text-[9px] uppercase font-bold text-zinc-600">Combined Reach</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 rounded-lg bg-white border border-zinc-200/80">
                  <span className="text-[10px] text-zinc-600 block">Dedicated Video (YT)</span>
                  <span className="text-xs font-bold font-mono text-zinc-950">$5,600 USD</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-zinc-200/80">
                  <span className="text-[10px] text-zinc-600 block">Organic Reel (IG)</span>
                  <span className="text-xs font-bold font-mono text-zinc-950">$2,425 USD</span>
                </div>
              </div>
            </div>

            {/* Center Bridge Indicator */}
            <div className="lg:col-span-1 flex flex-row lg:flex-col items-center justify-center gap-1.5 py-1 text-center">
              <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
                <ArrowRight className="w-4 h-4 rotate-90 lg:rotate-0 text-emerald-600" />
              </div>
              <span className="text-[9px] font-mono font-bold uppercase text-zinc-600 tracking-wider">
                1-Click
              </span>
            </div>

            {/* Right Box: Bilateral 1-Page Contract */}
            <div className="lg:col-span-5 p-4 rounded-xl bg-zinc-900 text-white border border-zinc-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 font-mono">
                  Phase 2 • 1-Page Bilateral Agreement
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-800 text-emerald-400 border border-zinc-700 flex items-center gap-1 font-mono">
                  SC-2026-INSTANT
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/80 border border-zinc-700">
                  <span className="text-[11px] text-zinc-300">48h Deemed Approval Clause</span>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono">Enforced</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/80 border border-zinc-700">
                  <span className="text-[11px] text-zinc-300">Paid Whitelisting Usage Limit</span>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono">30 Days Capped</span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] border-t border-zinc-800 text-zinc-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Bilateral Digital Signatures
                </span>
                <span className="font-mono text-[10px] text-zinc-300">Ready to Sign in 60s</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pillars Overview Strip */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl text-left border-t border-zinc-200/80 pt-8">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="text-sm font-bold text-zinc-950">Empirical Rate Valuation</h3>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed pl-8">
              Defended via our 16-knot quantitative matrix. Eliminates arbitrary follower multipliers using unpinned retention, view velocity, and 17-country PPP adjustments.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="text-sm font-bold text-zinc-950">Bilateral 1-Page Contracts</h3>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed pl-8">
              Converts agreed valuations into legally binding 1-page contracts with protective clauses for 48h deemed approvals, paid whitelisting scope, and tamper-proof SHA-256 e-sign.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="text-sm font-bold text-zinc-950">Commercial Campaign OS</h3>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed pl-8">
              Expanding suite featuring talent discovery directory and algorithmic budget allocation to plan, price, and execute creator campaigns with zero friction.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
