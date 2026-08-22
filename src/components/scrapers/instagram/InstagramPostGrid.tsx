"use client";

import React, { useState } from "react";
import { InstagramPostItem } from "@/lib/scrapers/types";
import { InstagramPostCard } from "./InstagramPostCard";

interface InstagramPostGridProps {
  posts: InstagramPostItem[];
  pinnedPosts?: InstagramPostItem[];
}

export function InstagramPostGrid({ posts, pinnedPosts = [] }: InstagramPostGridProps) {
  const [filter, setFilter] = useState<"ALL" | "REELS" | "CAROUSEL" | "IMAGE">("ALL");

  if (!posts || posts.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center text-gray-500 space-y-2">
        <p className="font-bold text-gray-800">No recent posts found for this creator</p>
        <p className="text-xs">Posts may be restricted or account has not published public media recently.</p>
      </div>
    );
  }

  // Filter posts if user selects specific tab
  const filteredPosts = posts.filter((post) => {
    if (filter === "REELS") return post.contentType === "Reel" || post.contentType === "Video";
    if (filter === "CAROUSEL") return post.contentType === "Carousel";
    if (filter === "IMAGE") return post.contentType === "Image";
    return true;
  });

  // Limit to top 12 posts
  const displayPosts = filteredPosts.slice(0, 12);

  return (
    <div className="space-y-6">
      {/* 1. PINNED POSTS SPOTLIGHT (If available) */}
      {pinnedPosts && pinnedPosts.length > 0 && (
        <div className="bg-white rounded-3xl border border-amber-200/80 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-amber-100">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-2xs">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M16 9V4l1 0V2H7v2l1 0v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                Featured & Pinned Highlights ({pinnedPosts.length})
              </h2>
              <p className="text-xs text-gray-500">
                Showcased posts pinned to the top of the creator&apos;s profile
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {pinnedPosts.map((post) => (
              <InstagramPostCard key={`pinned-${post.id}`} post={post} />
            ))}
          </div>
        </div>
      )}

      {/* 2. RECENT UPLOADS GRID (12 POSTS) */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-black tracking-tight">
              Recent Uploads & Timeline
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing {displayPosts.length} recent uploads
            </p>
          </div>

          {/* Content Type Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                filter === "ALL"
                  ? "bg-white text-black shadow-2xs"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              All ({posts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("REELS")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                filter === "REELS"
                  ? "bg-white text-black shadow-2xs"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Reels
            </button>
            <button
              type="button"
              onClick={() => setFilter("CAROUSEL")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                filter === "CAROUSEL"
                  ? "bg-white text-black shadow-2xs"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Carousels
            </button>
            <button
              type="button"
              onClick={() => setFilter("IMAGE")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                filter === "IMAGE"
                  ? "bg-white text-black shadow-2xs"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Images
            </button>
          </div>
        </div>

        {/* 5 POSTS PER ROW GRID (3 ROWS = 15 POSTS MAX) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {displayPosts.map((post) => (
            <InstagramPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
