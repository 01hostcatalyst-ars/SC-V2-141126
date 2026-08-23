"use client";

import React from "react";
import { TikTokVideoItem } from "@/lib/scrapers/types";

interface TikTokVideoCardProps {
  video: TikTokVideoItem;
}

export function TikTokVideoCard({ video }: TikTokVideoCardProps) {
  // Format Date
  const dateFormatted = video.createDate
    ? new Date(video.createDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between hover:border-black">
      {/* Media Thumbnail Container (TikTok 3:4 Vertical Aspect Ratio) */}
      <div className="relative aspect-[3/4] w-full bg-gray-900 overflow-hidden">
        {video.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.coverImage}
            alt={video.description || "TikTok Video"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* View Count Overlay (Top Left) */}
        <div className="absolute top-2 left-2 z-10">
          <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs">
            <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{video.playCountFormatted}</span>
          </span>
        </div>

        {/* Engagement Overlay (Likes & Comments Badges) */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1 text-[11px] font-bold text-white">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs shadow-2xs">
            <svg className="w-3 h-3 text-rose-500 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>{video.diggCountFormatted}</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs shadow-2xs">
            <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{video.commentCountFormatted}</span>
          </div>
        </div>
      </div>

      {/* Video Details & Caption */}
      <div className="p-3 space-y-2 flex flex-col justify-between flex-1">
        {video.description ? (
          <p className="text-xs text-gray-700 line-clamp-2 leading-snug font-medium">
            {video.description}
          </p>
        ) : (
          <p className="text-xs text-gray-400 italic">No description provided</p>
        )}

        {/* Share & Bookmark Counts */}
        <div className="flex items-center gap-3 text-[10px] text-gray-500 font-semibold">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {video.shareCountFormatted} shares
          </span>

          <span className="flex items-center gap-1">
            <svg className="w-3 h-3 text-amber-500 fill-current" viewBox="0 0 24 24">
              <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
            </svg>
            {video.favoritesCountFormatted} saves
          </span>
        </div>

        {/* Date & Direct Video Link */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-500 font-medium">
          <span>{dateFormatted}</span>

          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-black font-bold hover:underline"
          >
            <span>Watch</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
