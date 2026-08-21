"use client";

import React, { useState } from "react";
import { YouTubeVideoItem } from "@/lib/scrapers/types";
import { VideoCard } from "./VideoCard";

interface VideoTabsProps {
  longVideos: YouTubeVideoItem[];
  shortVideos: YouTubeVideoItem[];
}

export function VideoTabs({ longVideos, shortVideos }: VideoTabsProps) {
  const [activeTab, setActiveTab] = useState<"long" | "short">("long");
  const [sortBy, setSortBy] = useState<"recent" | "views" | "likes">("recent");

  const currentList = activeTab === "long" ? [...longVideos] : [...shortVideos];

  // Sorting logic
  if (sortBy === "views") {
    currentList.sort((a, b) => b.viewCount - a.viewCount);
  } else if (sortBy === "likes") {
    currentList.sort((a, b) => b.likeCount - a.likeCount);
  }

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("long")}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === "long"
                ? "bg-white text-black shadow-sm"
                : "text-gray-600 hover:text-black"
            }`}
          >
            <span>📽️ Long Videos</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeTab === "long"
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {longVideos.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("short")}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === "short"
                ? "bg-white text-black shadow-sm"
                : "text-gray-600 hover:text-black"
            }`}
          >
            <span>📱 YouTube Shorts</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeTab === "short"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {shortVideos.length}
            </span>
          </button>
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "recent" | "views" | "likes")}
            aria-label="Sort videos by"
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl font-bold text-black focus:outline-none focus:border-black transition-colors"
          >
            <option value="recent">Most Recent</option>
            <option value="views">Most Views</option>
            <option value="likes">Most Likes</option>
          </select>
        </div>
      </div>

      {/* Video Grid */}
      {currentList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentList.map((video, idx) => (
            <VideoCard
              key={video.id || idx}
              video={video}
              rank={idx + 1}
              isShort={activeTab === "short"}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <div className="text-3xl mb-2">📭</div>
          <div className="font-bold text-gray-800">No {activeTab === "long" ? "Long-Form" : "Shorts"} videos found</div>
          <p className="text-xs text-gray-500 mt-1">This creator may not have published recent videos in this format.</p>
        </div>
      )}
    </div>
  );
}
