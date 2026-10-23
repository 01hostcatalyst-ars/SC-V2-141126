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
  ShieldCheck,
  TrendingUp,
  Globe,
} from "lucide-react";

interface FeaturedCreator {
  name: string;
  handle: string;
  slug: string;
  avatarUrl: string;
  vertical: string;
  country: string;
  reach: string;
  platforms: {
    youtube?: string;
    instagram?: string;
    tiktok?: string;
  };
  rateRange: string;
  buyerIntent: string;
  safetyScore: string;
}

const FEATURED_CREATORS: FeaturedCreator[] = [
  {
    name: "Dhar Mann Studios",
    handle: "@dharmann",
    slug: "dhar-mann-bonus",
    avatarUrl:
      "https://yt3.ggpht.com/osxs7UlkTYpb0Ug57x02xu87r5jRTLh8q7LIsBEPJaqoplqfHSdSN3xi86AEetbJBvXFO1qonQ=s800-c-k-c0x00ffffff-no-rj",
    vertical: "Scripted Narrative Drama",
    country: "United States (US)",
    reach: "23.4M Subs",
    platforms: {
      youtube: "23.4M",
      instagram: "5.8M",
      tiktok: "12.1M",
    },
    rateRange: "$18,000 – $28,500",
    buyerIntent: "High Intent",
    safetyScore: "99% Brand Safe",
  },
  {
    name: "Marques Brownlee",
    handle: "@mkbhd",
    slug: "marques-brownlee-mkbhd",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    vertical: "Consumer Tech & Hardware",
    country: "United States (US)",
    reach: "18.6M Subs",
    platforms: {
      youtube: "18.6M",
      instagram: "4.7M",
    },
    rateRange: "$28,000 – $45,000",
    buyerIntent: "Very High Intent",
    safetyScore: "100% Brand Safe",
  },
  {
    name: "Ali Abdaal",
    handle: "@aliabdaal",
    slug: "ali-abdaal",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    vertical: "Productivity & Prosumer",
    country: "United Kingdom (UK)",
    reach: "5.4M Subs",
    platforms: {
      youtube: "5.4M",
      instagram: "1.2M",
      tiktok: "850K",
    },
    rateRange: "$12,000 – $19,500",
    buyerIntent: "High Intent",
    safetyScore: "100% Brand Safe",
  },
  {
    name: "Areeba Hassaan",
    handle: "@areebahassaan",
    slug: "areeba-hassaan",
    avatarUrl: "/images/creator_hero_portrait.jpg",
    vertical: "Travel & Lifestyle",
    country: "Pakistan & GCC",
    reach: "2.7M Reach",
    platforms: {
      youtube: "1.2M",
      instagram: "892K",
      tiktok: "654K",
    },
    rateRange: "$2,400 – $4,800",
    buyerIntent: "High Engagement",
    safetyScore: "98% Brand Safe",
  },
];

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

        {/* The Living Creator Database Showcase (4 Prominent Creator Tiles) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                Live Directory Showcase (4 of 3,000+ Indexed Creators)
              </span>
            </div>
            <Link
              href="/creators"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 transition-colors"
            >
              <span>View all 3,000+ profiles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_CREATORS.map((creator) => (
              <div
                key={creator.slug}
                className="p-5 rounded-3xl bg-white border border-zinc-200/90 shadow-xs hover:shadow-lg hover:border-indigo-200 transition-all flex flex-col justify-between space-y-4 group"
              >
                {/* Header: Photo + Name + Handle */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-zinc-100 shrink-0 ring-1 ring-zinc-200">
                      <img
                        src={creator.avatarUrl}
                        alt={creator.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          const fallback = target.nextElementSibling as HTMLElement | null;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                      <div
                        style={{ display: "none" }}
                        className="w-full h-full bg-indigo-50 text-indigo-700 font-bold text-base flex items-center justify-center"
                      >
                        {creator.name.charAt(0)}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <h3 className="text-sm font-bold text-zinc-950 truncate">
                          {creator.name}
                        </h3>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 fill-blue-600 text-white shrink-0" />
                      </div>
                      <div className="text-xs font-mono text-zinc-400 truncate">
                        {creator.handle}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-medium truncate mt-0.5">
                        {creator.country}
                      </div>
                    </div>
                  </div>

                  {/* Vertical Tag */}
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-[11px] font-semibold">
                      {creator.vertical}
                    </span>
                  </div>

                  {/* Platform Metrics Strip */}
                  <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] font-mono font-bold text-center">
                    {creator.platforms.youtube && (
                      <div className="p-1 rounded bg-red-50 text-red-700">
                        <span className="block text-[9px] text-red-500">YT</span>
                        {creator.platforms.youtube}
                      </div>
                    )}
                    {creator.platforms.instagram && (
                      <div className="p-1 rounded bg-pink-50 text-pink-700">
                        <span className="block text-[9px] text-pink-500">IG</span>
                        {creator.platforms.instagram}
                      </div>
                    )}
                    {creator.platforms.tiktok && (
                      <div className="p-1 rounded bg-zinc-100 text-zinc-800">
                        <span className="block text-[9px] text-zinc-500">TT</span>
                        {creator.platforms.tiktok}
                      </div>
                    )}
                  </div>

                  {/* Valuation Range Box */}
                  <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 space-y-0.5">
                    <span className="text-[10px] uppercase font-mono font-bold text-purple-700 block">
                      Audited Valuation
                    </span>
                    <div className="text-xs font-black font-mono text-zinc-950">
                      {creator.rateRange}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-zinc-100">
                  <Link
                    href={`/creators/${creator.slug}`}
                    className="inline-flex items-center justify-between w-full px-3 py-2 rounded-xl bg-zinc-50 hover:bg-indigo-50 text-zinc-800 hover:text-indigo-700 text-xs font-bold transition-all"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
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
