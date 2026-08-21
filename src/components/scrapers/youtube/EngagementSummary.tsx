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
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Recent Content Performance Overview</span>
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
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
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
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
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
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
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
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
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
