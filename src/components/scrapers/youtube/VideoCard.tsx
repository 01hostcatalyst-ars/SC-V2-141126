"use client";

import React, { useState } from "react";
import { YouTubeVideoItem } from "@/lib/scrapers/types";

interface VideoCardProps {
  video: YouTubeVideoItem;
  rank: number;
  isShort?: boolean;
}

export function VideoCard({ video, rank, isShort = false }: VideoCardProps) {
  const [showComments, setShowComments] = useState(false);

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
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Thumbnail Container */}
        <div className="relative aspect-video w-full bg-gray-900 overflow-hidden">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold">
              No Thumbnail
            </div>
          )}

          {/* Rank Badge */}
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-md text-white text-[11px] font-black rounded-md">
            #{rank} {isShort ? "Short" : "Long"}
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/85 backdrop-blur-md text-white text-[10px] font-mono font-bold rounded flex items-center gap-1">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{video.durationFormatted}</span>
          </div>
        </div>

        {/* Video Info */}
        <div className="p-3.5 space-y-2.5">
          <div className="text-[10px] font-bold text-gray-400 flex items-center justify-between">
            <span>{formattedDate}</span>
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
              {engagementRate}% Eng.
            </span>
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-black line-clamp-2 hover:text-blue-600 transition-colors leading-snug">
            <a href={video.url} target="_blank" rel="noopener noreferrer" title={video.title}>
              {video.title}
            </a>
          </h3>

          {/* 3 Metric Pills */}
          <div className="grid grid-cols-3 gap-1.5 py-2 border-y border-gray-100 text-center text-[10px]">
            <div className="p-1 bg-gray-50 rounded-lg">
              <div className="uppercase font-bold text-gray-400 text-[9px]">Views</div>
              <div className="font-black text-black mt-0.5 truncate">
                {video.viewCount.toLocaleString()}
              </div>
            </div>
            <div className="p-1 bg-gray-50 rounded-lg">
              <div className="uppercase font-bold text-gray-400 text-[9px]">Likes</div>
              <div className="font-black text-black mt-0.5 truncate">
                {video.likeCount.toLocaleString()}
              </div>
            </div>
            <div className="p-1 bg-gray-50 rounded-lg">
              <div className="uppercase font-bold text-gray-400 text-[9px]">Comments</div>
              <div className="font-black text-black mt-0.5 truncate">
                {video.commentCount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Comments Drawer */}
      {video.comments && video.comments.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50/70 p-2.5">
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="w-full flex items-center justify-between text-[11px] font-bold text-gray-700 hover:text-black transition-colors"
          >
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>5 Recent Comments</span>
            </span>
            <svg
              className={`w-3 h-3 text-gray-400 transition-transform ${showComments ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showComments && (
            <div className="mt-2 space-y-1.5 pt-2 border-t border-gray-200/60 max-h-56 overflow-y-auto">
              {video.comments.map((comment, cIdx) => (
                <div
                  key={comment.id || cIdx}
                  className="bg-white p-2 rounded-lg border border-gray-200/70 text-[11px] space-y-0.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between text-gray-500 text-[10px]">
                    <div className="flex items-center gap-1 font-bold text-gray-900 truncate">
                      {comment.authorProfileImageUrl && (
                        <img
                          src={comment.authorProfileImageUrl}
                          alt={comment.authorDisplayName}
                          className="w-3.5 h-3.5 rounded-full"
                        />
                      )}
                      <span className="truncate">{comment.authorDisplayName}</span>
                    </div>
                    {comment.likeCount > 0 && (
                      <span className="text-gray-600 font-semibold text-[9px] shrink-0">
                        +{comment.likeCount}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 font-medium leading-tight line-clamp-3 break-words">
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
