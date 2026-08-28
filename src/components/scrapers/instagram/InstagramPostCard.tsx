"use client";

import React from "react";
import { InstagramPostItem } from "@/lib/scrapers/types";

interface InstagramPostCardProps {
  post: InstagramPostItem;
}

export function InstagramPostCard({ post }: InstagramPostCardProps) {
  // Format Date
  const dateFormatted = post.datetime
    ? new Date(post.datetime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between hover:border-black">
      {/* Media Thumbnail Container */}
      <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.caption || "Instagram Post"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Content Type Badge (Top Right) */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {post.contentType === "Reel" || post.contentType === "Video" ? (
            <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>{post.contentType}</span>
            </span>
          ) : post.contentType === "Carousel" ? (
            <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Carousel {post.photos?.length ? `(${post.photos.length})` : ''}</span>
            </span>
          ) : null}
        </div>

        {/* Engagement Overlay (Likes & Comments Badges) */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1 text-[11px] font-bold text-white">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/70 backdrop-blur-xs shadow-2xs">
            <svg className="w-3.5 h-3.5 text-pink-500 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>{post.likesFormatted}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/70 backdrop-blur-xs shadow-2xs">
            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{post.commentsCountFormatted}</span>
          </div>
        </div>
      </div>

      {/* Post Details & Caption */}
      <div className="p-3 space-y-2 flex flex-col justify-between flex-1">
        {post.caption ? (
          <p className="text-xs text-gray-700 line-clamp-2 leading-snug">
            {post.caption}
          </p>
        ) : (
          <p className="text-xs text-gray-400 italic">No caption provided</p>
        )}

        {/* Geotagged Location */}
        {post.location && (
          <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium truncate">
            <svg className="w-3 h-3 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{post.location}</span>
          </div>
        )}

        {/* Tagged Accounts Indicator */}
        {post.taggedUsers && post.taggedUsers.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold truncate">
            <svg className="w-3 h-3 text-purple-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="truncate">
              Tagged: {post.taggedUsers.map((u) => `@${u.username || u.fullName}`).join(", ")}
            </span>
          </div>
        )}

        {/* Post Hashtags */}
        {post.postHashtags && post.postHashtags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {post.postHashtags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-[10px] font-semibold text-blue-600">
                #{tag.replace(/^#/, '')}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-500 font-medium">
          <span>{dateFormatted}</span>

          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-black font-bold hover:underline"
          >
            <span>View</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
