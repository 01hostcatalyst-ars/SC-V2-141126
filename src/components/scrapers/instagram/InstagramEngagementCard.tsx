"use client";

import React from "react";
import { InstagramScraperData } from "@/lib/scrapers/types";

interface InstagramEngagementCardProps {
  stats: InstagramScraperData["stats"];
  totalFollowers: number;
}

export function InstagramEngagementCard({
  stats,
  totalFollowers,
}: InstagramEngagementCardProps) {
  // Engagement Health Indicator
  let engagementHealth = "Normal";
  let healthColor = "text-blue-600 bg-blue-50 border-blue-200";

  if (stats.avgEngagementRate >= 3.0) {
    engagementHealth = "High Engagement";
    healthColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
  } else if (stats.avgEngagementRate >= 1.5) {
    engagementHealth = "Good Engagement";
    healthColor = "text-purple-700 bg-purple-50 border-purple-200";
  } else if (stats.avgEngagementRate > 0) {
    engagementHealth = "Average";
    healthColor = "text-amber-700 bg-amber-50 border-amber-200";
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-black tracking-tight">
            Engagement & Performance Analytics
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Calculated across recent uploads against {totalFollowers.toLocaleString()} followers
          </p>
        </div>

        <span className={`px-3 py-1 text-xs font-black rounded-xl border ${healthColor} self-start sm:self-auto`}>
          {engagementHealth}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Average Likes */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-50/60 to-purple-50/40 border border-pink-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-pink-700 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Average Likes / Post</span>
            <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats.avgLikesFormatted}
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-1">
            {stats.avgLikesPerPost.toLocaleString()} likes per post
          </div>
        </div>

        {/* Average Comments */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border border-blue-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Average Comments / Post</span>
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats.avgCommentsFormatted}
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-1">
            {stats.avgCommentsPerPost.toLocaleString()} comments per post
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-teal-50/40 border border-emerald-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Engagement Rate</span>
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">
            {stats.avgEngagementRate}%
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-1">
            Industry Benchmark: ~1.2% - 2.5%
          </div>
        </div>
      </div>
    </div>
  );
}
