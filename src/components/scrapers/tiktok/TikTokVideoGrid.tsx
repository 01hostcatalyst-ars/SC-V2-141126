"use client";

import React from "react";
import { TikTokVideoItem } from "@/lib/scrapers/types";
import { TikTokVideoCard } from "./TikTokVideoCard";

interface TikTokVideoGridProps {
  videos: TikTokVideoItem[];
}

export function TikTokVideoGrid({ videos }: TikTokVideoGridProps) {
  if (!videos || videos.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center text-gray-500 space-y-2">
        <p className="font-bold text-gray-800">No recent videos found for this creator</p>
        <p className="text-xs">Account may be private or has not published recent public clips.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-black tracking-tight">
            Recent Video Uploads & Performance
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Showing top {videos.length} recent video clips (5 per row)
          </p>
        </div>

        <div className="px-3 py-1 bg-gray-100 rounded-xl text-xs font-bold text-gray-700 self-start sm:self-auto">
          {videos.length} Videos Loaded
        </div>
      </div>

      {/* 5-Column Responsive Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {videos.map((video) => (
          <TikTokVideoCard key={video.id || video.url} video={video} />
        ))}
      </div>
    </div>
  );
}
