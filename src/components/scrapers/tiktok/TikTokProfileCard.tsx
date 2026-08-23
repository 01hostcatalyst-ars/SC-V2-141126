"use client";

import React, { useState } from "react";
import { TikTokProfile } from "@/lib/scrapers/types";

interface TikTokProfileCardProps {
  profile: TikTokProfile;
  scrapedAt?: string;
  isCached?: boolean;
  cacheAgeHours?: number;
  onForceRefresh?: () => void;
  isRefreshing?: boolean;
}

export function TikTokProfileCard({
  profile,
  scrapedAt,
  isCached,
  cacheAgeHours,
  onForceRefresh,
  isRefreshing,
}: TikTokProfileCardProps) {
  const [showFullBio, setShowFullBio] = useState(false);

  // Format Snapshot Date
  const formattedScrapeDate = scrapedAt
    ? new Date(scrapedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Snapshot Timestamp & Cache Indicator Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-gray-100 text-xs text-gray-500 font-medium">
        <div className="flex items-center gap-2">
          {isCached ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Database Cache ({cacheAgeHours ?? 0}h ago)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Live Fresh Snapshot
            </span>
          )}

          {formattedScrapeDate && (
            <span className="text-gray-400">
              Captured on {formattedScrapeDate}
            </span>
          )}
        </div>

        {onForceRefresh && (
          <button
            type="button"
            onClick={onForceRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-gray-600 hover:text-black hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Bypass 24-hour cache and fetch fresh live data"
          >
            <svg
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-black" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isRefreshing ? "Refreshing..." : "Force Re-fetch"}</span>
          </button>
        )}
      </div>

      {/* Profile Header (Avatar + Details + Actions) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        {/* Avatar & Creator Info */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-6">
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatarUrl}
              alt={profile.nickname || profile.username}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-gray-200 object-cover shadow-sm bg-gray-50 p-0.5"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-black tracking-tight">
                {profile.nickname || profile.username}
              </h1>
              {profile.isVerified && (
                <span className="inline-flex items-center text-blue-500" title="Verified Creator">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </span>
              )}
              {profile.isCommerceUser && (
                <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-700 rounded-md border border-amber-200">
                  TikTok Shop Creator
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500">
              <span className="text-gray-900 font-bold">@{profile.username}</span>
              {profile.isPrivate && (
                <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-50 text-amber-700 rounded-md border border-amber-200">
                  Private
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={`https://www.tiktok.com/@${profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-black hover:bg-gray-800 text-white transition-all flex items-center gap-1.5 shadow-xs"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
            </svg>
            <span>Open TikTok</span>
          </a>
        </div>
      </div>

      {/* 4 Core Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Followers */}
        <div className="p-4 sm:p-5 bg-gray-50/80 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Followers</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="text-xl sm:text-2xl font-black text-black">
            {profile.followerCountFormatted}
          </div>
          <div className="text-[11px] text-gray-400 font-medium mt-1">
            {profile.followerCount.toLocaleString()} fans
          </div>
        </div>

        {/* Total Hearts / Likes */}
        <div className="p-4 sm:p-5 bg-gray-50/80 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Total Likes</span>
            <svg className="w-4 h-4 text-rose-500 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <div className="text-xl sm:text-2xl font-black text-black">
            {profile.heartCountFormatted}
          </div>
          <div className="text-[11px] text-gray-400 font-medium mt-1">
            {profile.heartCount.toLocaleString()} lifetime hearts
          </div>
        </div>

        {/* Total Videos Count */}
        <div className="p-4 sm:p-5 bg-gray-50/80 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Total Videos</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-xl sm:text-2xl font-black text-black">
            {profile.videoCountFormatted}
          </div>
          <div className="text-[11px] text-gray-400 font-medium mt-1">
            {profile.videoCount.toLocaleString()} published clips
          </div>
        </div>

        {/* Following */}
        <div className="p-4 sm:p-5 bg-gray-50/80 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Following</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div className="text-xl sm:text-2xl font-black text-black">
            {profile.followingCountFormatted}
          </div>
          <div className="text-[11px] text-gray-400 font-medium mt-1">
            {profile.followingCount.toLocaleString()} creators
          </div>
        </div>
      </div>

      {/* Bio Link */}
      {profile.bioLink && (
        <div className="bg-gray-50/60 rounded-2xl p-4 sm:p-5 border border-gray-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Website Link</span>
          </div>

          <a
            href={profile.bioLink.startsWith("http") ? profile.bioLink : `https://${profile.bioLink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 hover:text-black transition-all shadow-2xs group"
          >
            <svg className="w-3 h-3 text-cyan-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>{profile.bioLink.replace(/^https?:\/\/(www\.)?/, "")}</span>
          </a>
        </div>
      )}

      {/* Bio / Signature */}
      {profile.biography && (
        <div className="bg-gray-50/60 rounded-2xl p-4 sm:p-5 border border-gray-100">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            TikTok Bio
          </div>
          <p className={`text-sm text-gray-700 whitespace-pre-line leading-relaxed ${!showFullBio && profile.biography.length > 200 ? "line-clamp-2" : ""}`}>
            {profile.biography}
          </p>
          {profile.biography.length > 200 && (
            <button
              type="button"
              onClick={() => setShowFullBio(!showFullBio)}
              className="mt-2 text-xs font-bold text-black hover:underline inline-flex items-center gap-1"
            >
              {showFullBio ? "Show less" : "Read full bio"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
