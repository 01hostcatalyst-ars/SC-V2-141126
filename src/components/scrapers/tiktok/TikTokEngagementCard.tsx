"use client";

import React from "react";
import { TikTokScraperData } from "@/lib/scrapers/types";

interface TikTokEngagementCardProps {
  stats: TikTokScraperData["stats"];
  totalFollowers: number;
}

export function TikTokEngagementCard({ stats }: TikTokEngagementCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-black tracking-tight">
            TikTok Video Engagement Intelligence
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Performance analytics calculated across {stats.totalVideosFetched} recent video uploads
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-black border border-rose-200 self-start sm:self-auto">
          <span>{stats.avgEngagementRate.toFixed(2)}% Avg Engagement</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Average Views Per Video */}
        <div className="p-5 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-2xl border border-blue-100/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Avg Views / Video</span>
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black">
            {stats.avgViewsFormatted}
          </div>
          <div className="text-[11px] text-blue-700/80 font-medium mt-1">
            {stats.avgViewsPerVideo.toLocaleString()} views/clip
          </div>
        </div>

        {/* 2. Average Likes Per Video */}
        <div className="p-5 bg-gradient-to-br from-pink-50/50 to-rose-50/30 rounded-2xl border border-pink-100/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-pink-800 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Avg Likes / Video</span>
            <svg className="w-4 h-4 text-pink-600 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black">
            {stats.avgLikesFormatted}
          </div>
          <div className="text-[11px] text-pink-700/80 font-medium mt-1">
            {stats.avgLikesPerVideo.toLocaleString()} likes/clip
          </div>
        </div>

        {/* 3. Average Shares Per Video */}
        <div className="p-5 bg-gradient-to-br from-purple-50/50 to-fuchsia-50/30 rounded-2xl border border-purple-100/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-800 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Avg Shares / Video</span>
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black">
            {stats.avgSharesFormatted}
          </div>
          <div className="text-[11px] text-purple-700/80 font-medium mt-1">
            {stats.avgSharesPerVideo.toLocaleString()} shares/clip
          </div>
        </div>

        {/* 4. Average Comments Per Video */}
        <div className="p-5 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 rounded-2xl border border-emerald-100/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Avg Comments</span>
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black">
            {stats.avgCommentsFormatted}
          </div>
          <div className="text-[11px] text-emerald-700/80 font-medium mt-1">
            {stats.avgCommentsPerVideo.toLocaleString()} comments/clip
          </div>
        </div>
      </div>
    </div>
  );
}
