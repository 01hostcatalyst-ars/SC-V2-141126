"use client";

import React, { useState } from "react";
import { YouTubeVideoItem } from "@/lib/scrapers/types";
import { VideoCard } from "./VideoCard";

interface VideoTabsProps {
  longVideos: YouTubeVideoItem[];
  shortVideos: YouTubeVideoItem[];
}

export function VideoTabs({ longVideos, shortVideos }: VideoTabsProps) {
  const [longSortBy, setLongSortBy] = useState<"recent" | "views" | "likes">("recent");
  const [shortSortBy, setShortSortBy] = useState<"recent" | "views" | "likes">("recent");

  // Sorted arrays
  const sortedLongVideos = [...longVideos];
  if (longSortBy === "views") {
    sortedLongVideos.sort((a, b) => b.viewCount - a.viewCount);
  } else if (longSortBy === "likes") {
    sortedLongVideos.sort((a, b) => b.likeCount - a.likeCount);
  }

  const sortedShortVideos = [...shortVideos];
  if (shortSortBy === "views") {
    sortedShortVideos.sort((a, b) => b.viewCount - a.viewCount);
  } else if (shortSortBy === "likes") {
    sortedShortVideos.sort((a, b) => b.likeCount - a.likeCount);
  }

  return (
    <div className="space-y-12">
      {/* SECTION 1: 10 Long-Form Videos */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-black tracking-tight">
                  10 Most Recent Long-Form Videos
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-black text-white">
                  {sortedLongVideos.length}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Standard format videos (&gt; 60 seconds) with duration, views, likes, and comments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <span>Sort:</span>
            <select
              value={longSortBy}
              onChange={(e) => setLongSortBy(e.target.value as "recent" | "views" | "likes")}
              aria-label="Sort long videos by"
              className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg font-bold text-black focus:outline-none focus:border-black text-xs"
            >
              <option value="recent">Most Recent</option>
              <option value="views">Most Views</option>
              <option value="likes">Most Likes</option>
            </select>
          </div>
        </div>

        {/* 5 videos in 1 row, total 2 rows (10 videos) */}
        {sortedLongVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {sortedLongVideos.map((video, idx) => (
              <VideoCard
                key={video.id || idx}
                video={video}
                rank={idx + 1}
                isShort={false}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <div className="text-sm font-bold text-gray-700">No Long-Form videos found</div>
            <p className="text-xs text-gray-400 mt-1">This creator has no recent uploads over 60 seconds.</p>
          </div>
        )}
      </div>

      {/* SECTION 2: 10 Short-Form Videos */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-black tracking-tight">
                  10 Most Recent Shorts
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-red-600 text-white">
                  {sortedShortVideos.length}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Short-form vertical videos (&le; 60 seconds) with duration, views, likes, and comments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <span>Sort:</span>
            <select
              value={shortSortBy}
              onChange={(e) => setShortSortBy(e.target.value as "recent" | "views" | "likes")}
              aria-label="Sort shorts by"
              className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg font-bold text-black focus:outline-none focus:border-black text-xs"
            >
              <option value="recent">Most Recent</option>
              <option value="views">Most Views</option>
              <option value="likes">Most Likes</option>
            </select>
          </div>
        </div>

        {/* 5 videos in 1 row, total 2 rows (10 videos) */}
        {sortedShortVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {sortedShortVideos.map((video, idx) => (
              <VideoCard
                key={video.id || idx}
                video={video}
                rank={idx + 1}
                isShort={true}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <div className="text-sm font-bold text-gray-700">No Shorts videos found</div>
            <p className="text-xs text-gray-400 mt-1">This creator has no recent YouTube shorts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
