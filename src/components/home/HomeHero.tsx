"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  TrendingUp,
  Calendar,
  FileText,
  BookOpen,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

export function HomeHero() {
  const scrollToExplore = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("valuation-hub") || document.getElementById("directory-preview");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.href = "/creators";
    }
  };

  return (
    <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden bg-gradient-to-b from-[#fafaff] via-white to-[#f7f8fc]">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute top-0 right-1/4 w-[650px] h-[650px] bg-indigo-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-20 right-0 w-[480px] h-[480px] bg-purple-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-0 w-[420px] h-[420px] bg-blue-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ========================================================= */}
        {/* TOP ROW: 2-COLUMN HERO (COPY + CONSTELLATION)             */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* LEFT COLUMN: HERO COPY & CALL TO ACTION (5 COLS) */}
          <div className="lg:col-span-5 text-left space-y-6 z-10">
            {/* Eyebrow Label */}
            <div className="inline-block">
              <span className="text-xs sm:text-sm font-black tracking-widest uppercase text-indigo-600 font-mono">
                The Commercial Operating System for the Creator Economy
              </span>
            </div>

            {/* Master Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-zinc-950 leading-[1.08] font-display">
              Everything You Need to Navigate the{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
                Creator Economy.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal max-w-xl">
              Discover creators, understand market value, plan campaigns, structure deals, and build better creator partnerships — all through one connected platform.
            </p>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={scrollToExplore}
                className="group px-7 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-500/25 transition-all duration-200 flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Explore the Platform</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Social Proof Stack */}
            <div className="pt-4 flex items-center gap-3">
              <div className="flex -space-x-2 overflow-hidden shrink-0">
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                  alt="Creator avatar 1"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
                  alt="Creator avatar 2"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces"
                  alt="Creator avatar 3"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces"
                  alt="Creator avatar 4"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"
                  alt="Creator avatar 5"
                />
              </div>
              <span className="text-xs sm:text-sm text-zinc-600 font-medium">
                Trusted by 10,000+ brands and creators worldwide
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: THE CONNECTED CONSTELLATION GRAPHIC (7 COLS) */}
          <div className="lg:col-span-7 relative">
            {/* =================================================== */}
            {/* DESKTOP CONSTELLATION VIEW (Visible on lg+)        */}
            {/* =================================================== */}
            <div className="hidden lg:block relative w-full h-[620px]">
              {/* Dynamic SVG Connector Lines */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#c084fc" stopOpacity="0.2" />
                  </linearGradient>
                </defs>

                {/* 1. To Creator Directory (Upper-Left) */}
                <line x1="270" y1="190" x2="180" y2="95" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="3 3" />
                {/* 2. To Rate Intelligence (Upper-Right) */}
                <line x1="445" y1="190" x2="535" y2="95" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="3 3" />
                {/* 3. To Campaign Planner (Mid-Right) */}
                <line x1="475" y1="270" x2="570" y2="245" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="3 3" />
                {/* 4. To Contracts (Lower-Right) */}
                <line x1="465" y1="365" x2="550" y2="395" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="3 3" />
                {/* 5. To Knowledge Base (Bottom-Right) */}
                <line x1="400" y1="430" x2="440" y2="530" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="3 3" />
                {/* 6. To Verification (Bottom-Left) */}
                <line x1="300" y1="430" x2="250" y2="530" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="3 3" />
                {/* 7. To Creator Profiles (Mid-Left) */}
                <line x1="240" y1="280" x2="180" y2="270" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="3 3" />

                {/* Connection Nodes */}
                <circle cx="270" cy="190" r="3" fill="#6366f1" />
                <circle cx="445" cy="190" r="3" fill="#6366f1" />
                <circle cx="475" cy="270" r="3" fill="#6366f1" />
                <circle cx="465" cy="365" r="3" fill="#6366f1" />
                <circle cx="400" cy="430" r="3" fill="#6366f1" />
                <circle cx="300" cy="430" r="3" fill="#6366f1" />
                <circle cx="240" cy="280" r="3" fill="#6366f1" />
              </svg>

              {/* 1. TOP-LEFT: Creator Directory Card */}
              <Link
                href="/creators"
                className="absolute top-4 left-6 z-10 w-[215px] p-3 rounded-2xl bg-white/95 backdrop-blur-sm border border-zinc-200/90 shadow-md hover:shadow-xl hover:border-indigo-300 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Users className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                      Creator Directory
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight mt-1">
                  Discover the right creators for your brand.
                </p>
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-zinc-100">
                  <div className="flex -space-x-1 overflow-hidden">
                    <img className="inline-block h-4 w-4 rounded-full ring-1 ring-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop" alt="c1" />
                    <img className="inline-block h-4 w-4 rounded-full ring-1 ring-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop" alt="c2" />
                    <img className="inline-block h-4 w-4 rounded-full ring-1 ring-white object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50&h=50&fit=crop" alt="c3" />
                  </div>
                  <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                    3,000+ creators
                  </span>
                </div>
              </Link>

              {/* 2. TOP-RIGHT: Rate Intelligence Card */}
              <Link
                href="/influencer-rate-calculator"
                className="absolute top-4 right-6 z-10 w-[215px] p-3 rounded-2xl bg-white/95 backdrop-blur-sm border border-zinc-200/90 shadow-md hover:shadow-xl hover:border-indigo-300 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                      <TrendingUp className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                      Rate Intelligence
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight mt-1">
                  Know what creators are worth.
                </p>
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-zinc-100">
                  <span className="text-[10px] font-mono font-bold text-zinc-900 bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
                    $2.4K – $12.8K
                  </span>
                  <svg className="w-12 h-4 text-purple-500" viewBox="0 0 50 16" fill="none">
                    <path d="M0 12 Q 12 4, 25 8 T 50 2" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </div>
              </Link>

              {/* 3. RIGHT-MID: Campaign Planner Card */}
              <div className="absolute top-[185px] right-0 z-10 w-[210px] p-3 rounded-2xl bg-white/95 backdrop-blur-sm border border-zinc-200/90 shadow-md hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Calendar className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-bold text-zinc-900">
                      Campaign Planner
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight mt-1">
                  Plan smarter, get better results.
                </p>
                <div className="flex items-center gap-1 pt-2 mt-2 border-t border-zinc-100 text-[9px] text-zinc-600">
                  <span className="bg-zinc-100 px-1.5 py-0.5 rounded">Budget</span>
                  <span className="bg-zinc-100 px-1.5 py-0.5 rounded">Audience</span>
                  <span className="bg-zinc-100 px-1.5 py-0.5 rounded">Goals</span>
                </div>
              </div>

              {/* 4. RIGHT-BOTTOM: Contracts Card */}
              <Link
                href="/instant"
                className="absolute top-[350px] right-4 z-10 w-[210px] p-3 rounded-2xl bg-white/95 backdrop-blur-sm border border-zinc-200/90 shadow-md hover:shadow-xl hover:border-indigo-300 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                      <FileText className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                      Contracts
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight mt-1">
                  Secure, fast and compliant agreements.
                </p>
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-zinc-100 text-[9px]">
                  <span className="text-zinc-600">1-Page • eSign • SHA-256</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </Link>

              {/* 5. BOTTOM-RIGHT: Knowledge Base Card */}
              <Link
                href="/knowledge"
                className="absolute bottom-2 right-[110px] z-10 w-[210px] p-3 rounded-2xl bg-white/95 backdrop-blur-sm border border-zinc-200/90 shadow-md hover:shadow-xl hover:border-indigo-300 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <BookOpen className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                      Knowledge Base
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight mt-1">
                  Learn, grow and stay ahead in the creator economy.
                </p>
                <div className="flex items-center gap-1 pt-2 mt-2 border-t border-zinc-100 text-[9px] text-zinc-500">
                  <span>Guides • Tutorials • Insights</span>
                </div>
              </Link>

              {/* 6. BOTTOM-LEFT: Verification Card */}
              <Link
                href="/verify"
                className="absolute bottom-4 left-[90px] z-10 w-[210px] p-3 rounded-2xl bg-white/95 backdrop-blur-sm border border-zinc-200/90 shadow-md hover:shadow-xl hover:border-indigo-300 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                      <ShieldCheck className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                      Verification
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight mt-1">
                  Trust verified creator data and authentic profiles.
                </p>
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-zinc-100 text-[9px]">
                  <span className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-mono font-semibold">
                    SHA-256 • Verified
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                </div>
              </Link>

              {/* 7. LEFT-MID: Creator Profiles Card */}
              <Link
                href="/creators"
                className="absolute top-[210px] left-0 z-10 w-[215px] p-3 rounded-2xl bg-white/95 backdrop-blur-sm border border-zinc-200/90 shadow-md hover:shadow-xl hover:border-indigo-300 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <UserCheck className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                      Creator Profiles
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight mt-1">
                  Deep insights into audiences, engagement and performance.
                </p>
                <div className="flex items-center gap-1 pt-2 mt-2 border-t border-zinc-100 text-[9px] text-zinc-500">
                  <span className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded">Audience</span>
                  <span className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded">Engagement</span>
                  <span className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded">Growth</span>
                </div>
              </Link>

              {/* =================================================== */}
              {/* THE CENTRAL ANCHOR: CREATOR PROFILE CARD           */}
              {/* =================================================== */}
              <div className="absolute top-[160px] left-[240px] z-20 w-[235px] rounded-3xl bg-white p-2.5 border border-indigo-100 shadow-2xl shadow-indigo-500/15 transform hover:scale-[1.02] transition-transform duration-300">
                {/* Creator Image */}
                <div className="relative w-full h-[145px] rounded-2xl overflow-hidden bg-zinc-100">
                  <Image
                    src="/images/creator_hero_portrait.jpg"
                    alt="Areeba Hassaan - Travel & Lifestyle Creator"
                    fill
                    sizes="240px"
                    priority
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>

                {/* Creator Identity */}
                <div className="pt-2.5 px-1 space-y-1">
                  <div className="flex items-center gap-1">
                    <h3 className="text-xs font-black text-zinc-950 truncate">
                      Areeba Hassaan
                    </h3>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 fill-blue-600 text-white" />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium">
                    Travel &amp; Lifestyle
                  </p>
                </div>

                {/* Platform Metric Badges */}
                <div className="grid grid-cols-3 gap-1 pt-2 px-1 text-[9px] font-mono">
                  <div className="flex items-center gap-0.5 bg-red-50 text-red-700 px-1.5 py-1 rounded-md font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                    <span>1.2M</span>
                  </div>
                  <div className="flex items-center gap-0.5 bg-pink-50 text-pink-700 px-1.5 py-1 rounded-md font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-600 shrink-0" />
                    <span>892K</span>
                  </div>
                  <div className="flex items-center gap-0.5 bg-zinc-100 text-zinc-800 px-1.5 py-1 rounded-md font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 shrink-0" />
                    <span>654K</span>
                  </div>
                </div>

                {/* Combined Reach & Growth Footer */}
                <div className="mt-2.5 pt-2 px-1 border-t border-zinc-100 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-zinc-400 block font-medium">
                      Combined Reach
                    </span>
                    <span className="text-xs font-black font-mono text-zinc-950">
                      2.7M
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 font-mono">
                      +12%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================== */}
            {/* MOBILE & TABLET FALLBACK VIEW (Screens under lg)    */}
            {/* =================================================== */}
            <div className="block lg:hidden space-y-6 pt-4">
              {/* Central Card Centered */}
              <div className="max-w-[280px] mx-auto rounded-3xl bg-white p-3 border border-indigo-100 shadow-xl">
                <div className="relative w-full h-[170px] rounded-2xl overflow-hidden bg-zinc-100">
                  <Image
                    src="/images/creator_hero_portrait.jpg"
                    alt="Areeba Hassaan"
                    fill
                    sizes="280px"
                    className="object-cover"
                  />
                </div>
                <div className="pt-3 px-1 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-zinc-950">Areeba Hassaan</h3>
                    <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-600 text-white" />
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">Travel &amp; Lifestyle</p>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-2.5 px-1 text-[10px] font-mono font-bold">
                  <div className="bg-red-50 text-red-700 p-1.5 rounded text-center">YT 1.2M</div>
                  <div className="bg-pink-50 text-pink-700 p-1.5 rounded text-center">IG 892K</div>
                  <div className="bg-zinc-100 text-zinc-800 p-1.5 rounded text-center">TT 654K</div>
                </div>
                <div className="mt-3 pt-2 px-1 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700">Combined Reach: 2.7M</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
                </div>
              </div>

              {/* Grid of Platform Capabilities */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <Link href="/creators" className="p-3 rounded-xl bg-white border border-zinc-200 shadow-xs text-left">
                  <Users className="w-4 h-4 text-indigo-600 mb-1" />
                  <div className="text-xs font-bold text-zinc-900">Creator Directory</div>
                  <div className="text-[10px] text-zinc-500">3,000+ Creators</div>
                </Link>
                <Link href="/influencer-rate-calculator" className="p-3 rounded-xl bg-white border border-zinc-200 shadow-xs text-left">
                  <TrendingUp className="w-4 h-4 text-purple-600 mb-1" />
                  <div className="text-xs font-bold text-zinc-900">Rate Intelligence</div>
                  <div className="text-[10px] text-zinc-500">Empirical 16-Knot</div>
                </Link>
                <Link href="/instant" className="p-3 rounded-xl bg-white border border-zinc-200 shadow-xs text-left">
                  <FileText className="w-4 h-4 text-violet-600 mb-1" />
                  <div className="text-xs font-bold text-zinc-900">Contracts</div>
                  <div className="text-[10px] text-zinc-500">1-Page Bilateral</div>
                </Link>
                <Link href="/verify" className="p-3 rounded-xl bg-white border border-zinc-200 shadow-xs text-left">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
                  <div className="text-xs font-bold text-zinc-900">Verification</div>
                  <div className="text-[10px] text-zinc-500">SHA-256 Audit</div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM VALUE BAR: 5 HORIZONTAL PILLARS (TRUST STRIP)      */}
        {/* ========================================================= */}
        <div className="mt-16 pt-10 border-t border-zinc-200/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
            {/* Pillar 1 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                <Users className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-950">
                  Scalable Creator Database
                </h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Thousands of vetted creators across 20+ verticals and 17 regions.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-950">
                  Data-Driven Valuations
                </h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  16-Knot quantitative model with global PPP adjustments.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-950">
                  Secure Contracts
                </h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  1-page contracts, 48h approval, SHA-256 audit trail.
                </p>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-950">
                  Campaign Tools
                </h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Budget allocation, deliverables, timeline and tracking.
                </p>
              </div>
            </div>

            {/* Pillar 5 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-950">
                  Built for Trust
                </h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Verify profiles, audit deals, ensure compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
