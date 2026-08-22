"use client";

import React, { useState } from "react";
import { InstagramPostItem } from "@/lib/scrapers/types";
import { InstagramPostCard } from "./InstagramPostCard";

interface InstagramPostGridProps {
  posts: InstagramPostItem[];
}

export function InstagramPostGrid({ posts }: InstagramPostGridProps) {
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

  // Limit to top 10 posts (5 in 1 row, 2 rows total)
  const displayPosts = filteredPosts.slice(0, 10);

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-black tracking-tight">
            Recent Uploads & Content Feed
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Showing top {displayPosts.length} posts (5 per row)
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
            All Posts ({posts.length})
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

      {/* 5 POSTS PER ROW GRID (2 ROWS = 10 POSTS TOTAL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {displayPosts.map((post) => (
          <InstagramPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
