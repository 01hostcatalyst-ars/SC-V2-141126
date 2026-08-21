"use client";

import React from "react";
import { YouTubeScraperData } from "@/lib/scrapers/types";

interface EngagementSummaryProps {
  stats: YouTubeScraperData["stats"];
}

export function EngagementSummary({ stats }: EngagementSummaryProps) {
  return (
    <div className="bg-linear-to-br from-gray-900 via-gray-950 to-black text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-gray-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <span>⚡ Recent Content Performance Overview</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Benchmarks computed from the most recent 10 Long Videos & 10 Shorts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
            Live Extracted
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Long Videos Avg Views */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Recent Long Avg Views</span>
            <span className="text-blue-400">📽️</span>
          </div>
          <div className="text-2xl font-black text-white">
            {stats.avgLongVideoViews.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Across 10 recent uploads
          </div>
        </div>

        {/* Long Videos Engagement */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Long Engagement Rate</span>
            <span className="text-emerald-400">💬</span>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {stats.avgLongEngagementRate}%
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            (Likes + Comments) / Views
          </div>
        </div>

        {/* Shorts Avg Views */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Recent Shorts Avg Views</span>
            <span className="text-red-400">📱</span>
          </div>
          <div className="text-2xl font-black text-white">
            {stats.avgShortVideoViews.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Across 10 recent Shorts
          </div>
        </div>

        {/* Shorts Engagement */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Shorts Engagement Rate</span>
            <span className="text-red-400">🔥</span>
          </div>
          <div className="text-2xl font-black text-red-400">
            {stats.avgShortEngagementRate}%
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            (Likes + Comments) / Views
          </div>
        </div>
      </div>
    </div>
  );
}
