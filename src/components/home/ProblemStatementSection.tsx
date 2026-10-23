"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import {
  YouTubeIcon,
  InstagramIcon,
  TikTokIcon,
} from "@/components/icons/PlatformIcons";

export function ProblemStatementSection() {
  return (
    <section className="py-16 md:py-24 bg-white border-t border-zinc-200/80 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider border border-red-200 font-mono">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>The Creator Economy Dilemma</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 font-display tracking-tight leading-tight">
            The Creator Economy is Booming.
            <br />
            <span className="text-zinc-500 font-semibold">
              The Commercial Infrastructure is Broken.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Every year, billions of dollars flow into creator partnerships. Yet deals are still struck through disorganized direct messages, unstandardized pricing spreadsheets, and disputed deliverable terms.
          </p>
        </div>

        {/* The Broken Creator Commerce Workflow Canvas (Visual Metaphor) */}
        <div className="p-6 sm:p-10 rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-2xl relative overflow-hidden space-y-8">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Level 1: Platform Fragmentation Header */}
          <div className="relative z-10 space-y-3 border-b border-zinc-800/80 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-400">
                Phase 1: Multi-Platform Fragmentation
              </span>
              <span className="text-xs font-mono text-zinc-500">
                Current Industry Reality
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                  <YouTubeIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">YouTube</div>
                  <div className="text-[11px] text-zinc-500">Long-form retention &amp; view velocity</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0">
                  <InstagramIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">Instagram</div>
                  <div className="text-[11px] text-zinc-500">Stories &amp; Reels with follower bloat</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                  <TikTokIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">TikTok</div>
                  <div className="text-[11px] text-zinc-500">Volatile virality &amp; unpredictable reach</div>
                </div>
              </div>
            </div>
          </div>

          {/* Level 2: The Three Operational Friction Points (Visual Artifacts) */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Artifact 1: The Disorganized DM Thread */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold">Social DMs &amp; Inboxes</span>
                </div>
                <span className="text-[10px] text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-900/50">
                  Unstructured
                </span>
              </div>

              <div className="space-y-2 text-xs font-sans">
                <div className="p-2.5 rounded-xl bg-zinc-800/70 border border-zinc-700/50 text-zinc-300">
                  <span className="text-[10px] text-zinc-500 block font-mono mb-0.5">@brand_agency:</span>
                  &ldquo;Hey! Loved your recent video, can we do a collab next month? What are your rates?&rdquo;
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-900/50 text-zinc-200 ml-3">
                  <span className="text-[10px] text-indigo-400 block font-mono mb-0.5">@creator:</span>
                  &ldquo;Depends on scope! Here is our 2024 PDF media kit...&rdquo;
                </div>
                <div className="text-[11px] text-zinc-500 italic pl-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-zinc-500 shrink-0" />
                  <span>Left on read for 18 days</span>
                </div>
              </div>
            </div>

            {/* Artifact 2: The Manual Pricing Spreadsheet */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-bold">Internal Spreadsheets</span>
                </div>
                <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-900/50">
                  Opaque Pricing
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] space-y-1.5 overflow-x-auto">
                <div className="flex justify-between text-zinc-500 border-b border-zinc-800 pb-1">
                  <span>CREATOR</span>
                  <span>RATE</span>
                  <span>STATUS</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="truncate max-w-[90px]">@tech_guru</span>
                  <span className="text-zinc-400">$18,000</span>
                  <span className="text-red-400 text-[10px]">#CALC_ERR</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="truncate max-w-[90px]">@daily_vlogs</span>
                  <span className="text-zinc-400">$8,500</span>
                  <span className="text-amber-400 text-[10px]">Unverified</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span className="truncate max-w-[90px]">@travel_pak</span>
                  <span className="text-zinc-400">???</span>
                  <span className="text-zinc-500 text-[10px]">No Data</span>
                </div>
              </div>
            </div>

            {/* Artifact 3: The Disputed Handshake Deal */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span className="font-bold">Handshake Execution</span>
                </div>
                <span className="text-[10px] text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-900/50">
                  High Risk
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-900/40 text-red-200">
                  <div className="font-bold text-[11px] text-red-400 font-mono mb-0.5">Disputed Terms:</div>
                  &ldquo;CMO demands 3 additional revisions and uncapped ad whitelisting before disbursing the fee.&rdquo;
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1">
                  <span>Net-60 Overdue</span>
                  <span className="text-red-400 font-bold">Zero Legal Recourse</span>
                </div>
              </div>
            </div>
          </div>

          {/* Level 3: The Contrast & Solution Transition */}
          <div className="relative z-10 pt-4 border-t border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1 max-w-2xl">
              <div className="text-sm sm:text-base font-bold text-white font-display">
                The creator economy has scaled to $250 Billion. Its commercial infrastructure hasn&apos;t.
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                SignCollab unifies talent discovery, 16-Knot empirical rate intelligence, and 1-page bilateral contracts into one connected operating system.
              </p>
            </div>

            <Link
              href="#commercial-lifecycle"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shrink-0 cursor-pointer shadow-md shadow-indigo-600/30"
            >
              <span>Explore The 4-Stage System</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
