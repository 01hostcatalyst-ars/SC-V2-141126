"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Globe,
  SlidersHorizontal,
} from "lucide-react";

export function LiveDirectoryShowcase() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/creators?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/creators");
    }
  };

  const popularNiches = [
    { label: "Tech & Hardware", nicheId: 6 },
    { label: "Lifestyle & Entertainment", nicheId: 8 },
    { label: "Gaming & Esports", nicheId: 14 },
    { label: "Fashion & Apparel", nicheId: 12 },
    { label: "Filmmaking & Media", nicheId: 18 },
    { label: "Automotive & Mobility", nicheId: 17 },
  ];

  return (
    <section
      id="directory-preview"
      className="py-16 md:py-24 bg-gradient-to-b from-white via-indigo-50/20 to-white border-t border-zinc-200/80 text-left scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-200">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Talent Discovery &amp; Verification</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 font-display tracking-tight leading-tight">
              Discover 3,000+ Verified Creators.
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 font-normal leading-relaxed">
              Explore multi-platform creator profiles audited for view velocity, audience demographics, commercial buyer intent, and defensible deliverable valuations.
            </p>
          </div>

          <Link
            href="/creators"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-500/20 shrink-0 cursor-pointer"
          >
            <span>Explore Full Directory (3,000+)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Search Bar & Filter Strip */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-indigo-100 shadow-xl shadow-indigo-500/5 space-y-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by creator name, @handle, or topic (e.g. tech, fitness, travel)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-zinc-900 placeholder:text-zinc-400 font-medium transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm transition-colors shrink-0 cursor-pointer"
            >
              Search Creators
            </button>
          </form>

          {/* Popular Vertical Chips */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-zinc-100">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono mr-1">
              Popular Verticals:
            </span>
            {popularNiches.map((niche) => (
              <Link
                key={niche.nicheId}
                href={`/creators?nicheId=${niche.nicheId}`}
                className="px-3 py-1.5 rounded-xl bg-zinc-50 hover:bg-indigo-50 text-zinc-700 hover:text-indigo-700 border border-zinc-200/80 hover:border-indigo-200 text-xs font-semibold transition-all cursor-pointer"
              >
                {niche.label}
              </Link>
            ))}
          </div>
        </div>

        {/* 4 Quantitative Metric Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase text-zinc-400 font-mono block">
              Indexed Talent
            </span>
            <div className="text-2xl sm:text-3xl font-black text-zinc-950 font-display">
              3,000+
            </div>
            <p className="text-[11px] text-zinc-500">Verified multi-platform profiles</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase text-zinc-400 font-mono block">
              Covered Niches
            </span>
            <div className="text-2xl sm:text-3xl font-black text-zinc-950 font-display">
              20+
            </div>
            <p className="text-[11px] text-zinc-500">From tech hardware to FMCG lifestyle</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase text-zinc-400 font-mono block">
              Global Reach
            </span>
            <div className="text-2xl sm:text-3xl font-black text-zinc-950 font-display">
              17 Markets
            </div>
            <p className="text-[11px] text-zinc-500">Local PPP economic calibrations</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase text-zinc-400 font-mono block">
              Commercial Terms
            </span>
            <div className="text-2xl sm:text-3xl font-black text-zinc-950 font-display">
              1-Click
            </div>
            <p className="text-[11px] text-zinc-500">Direct bilateral contract drafting</p>
          </div>
        </div>
      </div>
    </section>
  );
}
