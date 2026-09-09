"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Sparkles,
  ArrowRight,
  FileText,
  Activity,
  CheckCircle2,
  Shield,
  Zap,
} from "lucide-react";

export function HomeHero() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<"all" | "instagram" | "youtube" | "tiktok">("all");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchValue.trim();
    if (!query) {
      router.push("/influencer-rate-calculator");
      return;
    }
    const cleanHandle = query.replace(/^@/, "").replace(/^https?:\/\/(www\.)?(instagram|youtube|tiktok)\.com\//, "");
    router.push(`/influencer-rate-calculator?handle=${encodeURIComponent(cleanHandle)}&platform=${selectedPlatform}`);
  };

  const handleQuickDemo = (handle: string, platform: "instagram" | "youtube" | "tiktok") => {
    router.push(`/influencer-rate-calculator?handle=${encodeURIComponent(handle)}&platform=${platform}`);
  };

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden text-center">
      {/* Subtle Directional Ambient Spotlight */}
      <div className="absolute top-0 inset-x-0 h-[480px] ambient-spotlight-emerald pointer-events-none z-0" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center">
        
        {/* Eyebrow Trust Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-semibold shadow-sm border border-zinc-800 mb-6 animate-fadeIn">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] text-emerald-400 font-bold uppercase tracking-wider">v2.0 Active</span>
          <span className="text-zinc-400 font-light">•</span>
          <span className="text-zinc-200">The Commercial Operating System for Creators &amp; Brands</span>
        </div>

        {/* Master Display Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-zinc-950 tracking-tight leading-[1.08] font-display max-w-4xl">
          Stop Sealing Deals in DMs.{" "}
          <span className="text-zinc-950 relative inline-block">
            Start Signing Them.
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
          Audit empirical influencer deliverable rates, enforce commercial protection clauses, and execute legally binding agreements with tamper-proof SHA-256 audit trails in under 60 seconds.
        </p>

        {/* ========================================================= */}
        {/* COLLABSTR-INSPIRED OMNI-SEARCH BAR                        */}
        {/* ========================================================= */}
        <div className="w-full max-w-3xl mt-10">
          <form
            onSubmit={handleSearchSubmit}
            className="p-2 sm:p-2.5 rounded-2xl bg-white border border-zinc-300 shadow-xl focus-within:border-zinc-950 focus-within:ring-2 focus-within:ring-zinc-950/10 transition-all surface-card"
          >
            {/* Top Row: Platform Selection Pills */}
            <div className="flex items-center gap-1 px-2 pb-2 border-b border-zinc-100 overflow-x-auto text-xs font-semibold">
              <span className="text-zinc-400 text-[11px] uppercase tracking-wider font-bold mr-1 shrink-0">
                Channel:
              </span>
              {(["all", "instagram", "youtube", "tiktok"] as const).map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setSelectedPlatform(plat)}
                  className={`px-3 py-1 rounded-md capitalize transition-all shrink-0 cursor-pointer ${
                    selectedPlatform === plat
                      ? "bg-zinc-950 text-white font-bold shadow-2xs"
                      : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                  }`}
                >
                  {plat === "all" ? "All Channels" : plat}
                </button>
              ))}
            </div>

            {/* Bottom Row: Search Input & Action Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Paste any @handle or URL (e.g. mkbhd, irfanjunejo)..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold text-zinc-950 placeholder:text-zinc-400 focus:outline-none bg-transparent"
                />
              </div>

              <button
                type="submit"
                className="bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer pressable"
              >
                <Activity className="w-4 h-4 text-amber-400" strokeWidth={2.5} />
                <span>Audit &amp; Value Rate</span>
              </button>
            </div>
          </form>

          {/* Quick Example Chips & Guest Route */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500">
            <span className="font-medium text-zinc-400">Quick Try:</span>
            <button
              type="button"
              onClick={() => handleQuickDemo("irfanjunejo", "instagram")}
              className="px-2.5 py-1 rounded-lg bg-zinc-100/80 hover:bg-zinc-200/80 text-zinc-800 font-semibold border border-zinc-200/60 transition-colors cursor-pointer"
            >
              @irfanjunejo (Multi-Channel)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("mkbhd", "youtube")}
              className="px-2.5 py-1 rounded-lg bg-zinc-100/80 hover:bg-zinc-200/80 text-zinc-800 font-semibold border border-zinc-200/60 transition-colors cursor-pointer"
            >
              @mkbhd (YouTube)
            </button>
            <span className="text-zinc-300">•</span>
            <Link
              href="/instant"
              className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2} />
              <span>Or Draft 1-Page Contract (Guest Mode) ➔</span>
            </Link>
          </div>
        </div>

        {/* Feature Proof Points */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl text-left border-t border-zinc-200/80 pt-8">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={2} />
            <div>
              <div className="text-xs font-bold text-zinc-950">16-Knot Valuation</div>
              <div className="text-[11px] text-zinc-500">Unpinned Reels empirical rate</div>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={2} />
            <div>
              <div className="text-xs font-bold text-zinc-950">Bilateral 1-Page Terms</div>
              <div className="text-[11px] text-zinc-500">Exclusivity, IP &amp; 48h approval</div>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={2} />
            <div>
              <div className="text-xs font-bold text-zinc-950">SHA-256 Audit Trail</div>
              <div className="text-[11px] text-zinc-500">Tamper-proof legal certificate</div>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={2} />
            <div>
              <div className="text-xs font-bold text-zinc-950">Zero Signup Friction</div>
              <div className="text-[11px] text-zinc-500">2 free contracts/day in Guest Mode</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
