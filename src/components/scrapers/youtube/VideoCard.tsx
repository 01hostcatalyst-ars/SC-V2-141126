"use client";

import React, { useState } from "react";
import { YouTubeVideoItem } from "@/lib/scrapers/types";

interface VideoCardProps {
  video: YouTubeVideoItem;
  rank: number;
  isShort?: boolean;
}

export function VideoCard({ video, rank, isShort = false }: VideoCardProps) {
  const [showComments, setShowComments] = useState(rank <= 1); // Expand comments by default on the #1 most recent video

  const formattedDate = video.publishedAt
    ? new Date(video.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const engagementRate =
    video.viewCount > 0
      ? (((video.likeCount + video.commentCount) / video.viewCount) * 100).toFixed(1)
      : "0";

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Thumbnail Container */}
        <div className="relative aspect-video w-full bg-gray-900 overflow-hidden group">
          {video.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
              No Thumbnail
            </div>
          )}

          {/* Rank Badge */}
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/75 backdrop-blur-md text-white text-xs font-black rounded-lg">
            #{rank} {isShort ? "Short" : "Long"}
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/85 backdrop-blur-md text-white text-xs font-mono font-bold rounded-md flex items-center gap-1">
            <span>⏱️</span>
            <span>{video.durationFormatted}</span>
          </div>
        </div>

        {/* Video Info */}
        <div className="p-5">
          <div className="text-[11px] font-bold text-gray-400 mb-1.5 flex items-center justify-between">
            <span>Published {formattedDate}</span>
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">
              {engagementRate}% Eng.
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-black line-clamp-2 hover:text-blue-600 transition-colors mb-4">
            <a href={video.url} target="_blank" rel="noopener noreferrer">
              {video.title}
            </a>
          </h3>

          {/* 3 Metric Pills */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 text-center">
            <div className="p-2 bg-gray-50 rounded-xl">
              <div className="text-[10px] uppercase font-bold text-gray-400">Views</div>
              <div className="text-xs sm:text-sm font-black text-black mt-0.5">
                {video.viewCount.toLocaleString()}
              </div>
            </div>
            <div className="p-2 bg-gray-50 rounded-xl">
              <div className="text-[10px] uppercase font-bold text-gray-400">Likes</div>
              <div className="text-xs sm:text-sm font-black text-black mt-0.5">
                {video.likeCount.toLocaleString()}
              </div>
            </div>
            <div className="p-2 bg-gray-50 rounded-xl">
              <div className="text-[10px] uppercase font-bold text-gray-400">Comments</div>
              <div className="text-xs sm:text-sm font-black text-black mt-0.5">
                {video.commentCount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {video.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expandable Comments Drawer (for top 3 videos) */}
      {video.comments && video.comments.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50/70 p-4">
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="w-full flex items-center justify-between text-xs font-bold text-gray-700 hover:text-black transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <span>💬</span>
              <span>5 Most Recent Comments ({video.comments.length})</span>
            </span>
            <span className="text-gray-400">{showComments ? "▲ Hide" : "▼ Show"}</span>
          </button>

          {showComments && (
            <div className="mt-3 space-y-2.5 pt-2 border-t border-gray-200/60">
              {video.comments.map((comment, cIdx) => (
                <div
                  key={comment.id || cIdx}
                  className="bg-white p-2.5 rounded-xl border border-gray-200/70 text-xs space-y-1 shadow-2xs"
                >
                  <div className="flex items-center justify-between text-gray-500 text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                      {comment.authorProfileImageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={comment.authorProfileImageUrl}
                          alt={comment.authorDisplayName}
                          className="w-4 h-4 rounded-full"
                        />
                      )}
                      <span>{comment.authorDisplayName}</span>
                    </div>
                    {comment.likeCount > 0 && (
                      <span className="text-red-500 font-semibold">❤️ {comment.likeCount}</span>
                    )}
                  </div>
                  <p className="text-gray-700 font-medium leading-snug break-words">
                    {comment.textDisplay.replace(/<[^>]*>?/gm, "")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
