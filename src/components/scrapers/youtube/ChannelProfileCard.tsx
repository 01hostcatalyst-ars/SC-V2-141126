"use client";

import React, { useState } from "react";
import { YouTubeChannelProfile } from "@/lib/scrapers/types";

interface ChannelProfileCardProps {
  channel: YouTubeChannelProfile;
  scrapedAt?: string;
  isCached?: boolean;
  cacheAgeHours?: number;
  onForceRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ChannelProfileCard({
  channel,
  scrapedAt,
  isCached,
  cacheAgeHours,
  onForceRefresh,
  isRefreshing = false,
}: ChannelProfileCardProps) {
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyEmail = () => {
    if (channel.extractedEmail) {
      navigator.clipboard.writeText(channel.extractedEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(channel.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formattedDate = channel.publishedAt
    ? new Date(channel.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  const formattedSnapshotTime = scrapedAt
    ? new Date(scrapedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "Just now";

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
      {/* 24-Hour Snapshot Timestamp & Cache Notice Banner */}
      <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 text-gray-700 shadow-2xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">
                Data Snapshot Recorded: <span className="font-black text-black">{formattedSnapshotTime}</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                  isCached
                    ? "bg-blue-100 text-blue-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {isCached ? `24H Cache Active (${cacheAgeHours}h old)` : "Fresh Daily Snapshot"}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Data is preserved till this exact timestamp. Any new videos or metrics posted after this time will be recorded in the next 24-hour snapshot.
            </p>
          </div>
        </div>

        {/* Force Refresh Button */}
        {onForceRefresh && (
          <button
            type="button"
            onClick={onForceRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 hover:border-black text-gray-700 hover:text-black font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-2xs disabled:opacity-50 text-[11px]"
            title="Bypass 24-hour cache and fetch fresh snapshot immediately"
          >
            <svg
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isRefreshing ? "Re-fetching..." : "Force Re-fetch"}</span>
          </button>
        )}
      </div>

      {/* Top Header: Avatar + Channel Info + Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        {/* Avatar & Channel Details */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-6">
          <div className="relative shrink-0">
            <img
              src={channel.avatarUrl}
              alt={channel.title}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-gray-200 object-cover shadow-sm bg-gray-50"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-black tracking-tight">
                {channel.title}
              </h1>
              {channel.country && (
                <span className="px-2.5 py-0.5 text-xs font-bold bg-gray-100 text-gray-700 rounded-md border border-gray-200">
                  {channel.country}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500">
              <span className="text-gray-900 font-bold">
                {channel.handle ? (channel.handle.startsWith("@") ? channel.handle : `@${channel.handle}`) : `@${channel.title}`}
              </span>
              <span className="text-gray-300">•</span>
              <button
                type="button"
                onClick={handleCopyId}
                className="hover:text-black transition-colors font-mono inline-flex items-center gap-1 text-gray-500"
                title="Click to copy Channel ID"
              >
                <span>{channel.id}</span>
                <span className="text-[10px] bg-gray-100 hover:bg-gray-200 px-1.5 py-0.5 rounded text-gray-700 font-sans">
                  {copiedId ? "Copied" : "Copy ID"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {channel.extractedEmail && (
            <button
              type="button"
              onClick={handleCopyEmail}
              className="px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{copiedEmail ? "Email Copied" : channel.extractedEmail}</span>
            </button>
          )}

          <a
            href={`https://www.youtube.com/${channel.handle || `channel/${channel.id}`}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all flex items-center gap-1.5 shadow-xs"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>Open YouTube</span>
          </a>
        </div>
      </div>

      {/* 4 Core Public Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Subscribers */}
        <div className="p-4 sm:p-5 bg-gray-50/80 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Subscribers</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="text-xl sm:text-2xl font-black text-black">
            {channel.subscriberCountFormatted}
          </div>
          <div className="text-[11px] text-gray-400 font-medium mt-1">
            {channel.subscriberCount.toLocaleString()} total
          </div>
        </div>

        {/* Lifetime Views */}
        <div className="p-4 sm:p-5 bg-gray-50/80 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Lifetime Views</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div className="text-xl sm:text-2xl font-black text-black">
            {channel.lifetimeViewCountFormatted}
          </div>
          <div className="text-[11px] text-gray-400 font-medium mt-1">
            {channel.lifetimeViewCount.toLocaleString()} total
          </div>
        </div>

        {/* Total Videos */}
        <div className="p-4 sm:p-5 bg-gray-50/80 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Total Videos</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-xl sm:text-2xl font-black text-black">
            {channel.videoCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 font-medium mt-1">
            Since {formattedDate}
          </div>
        </div>

        {/* Avg Views / Video */}
        <div className="p-4 sm:p-5 bg-gray-50/80 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Avg Views / Video</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="text-xl sm:text-2xl font-black text-black">
            {channel.avgViewsPerVideo.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 font-medium mt-1">
            Lifetime average
          </div>
        </div>
      </div>

      {/* External Profile Links (All Links on Profile) */}
      {channel.externalLinks && channel.externalLinks.length > 0 && (
        <div className="bg-gray-50/60 rounded-2xl p-4 sm:p-5 border border-gray-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Profile Links & Socials ({channel.externalLinks.length})</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {channel.externalLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 hover:text-black transition-all shadow-2xs group"
              >
                <svg className="w-3 h-3 text-blue-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>{link.title}</span>
                <span className="text-[10px] text-gray-400 font-normal">({link.domain})</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Bio / Description */}
      {channel.description && (
        <div className="bg-gray-50/60 rounded-2xl p-4 sm:p-5 border border-gray-100">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            About Channel
          </div>
          <p className={`text-sm text-gray-700 whitespace-pre-line leading-relaxed ${!showFullDesc && channel.description.length > 220 ? "line-clamp-2" : ""}`}>
            {channel.description}
          </p>
          {channel.description.length > 220 && (
            <button
              type="button"
              onClick={() => setShowFullDesc(!showFullDesc)}
              className="mt-2 text-xs font-bold text-black hover:underline inline-flex items-center gap-1"
            >
              {showFullDesc ? "Show less" : "Read full description"}
            </button>
          )}
        </div>
      )}

      {/* Topic Categories & Keywords */}
      {(channel.topicCategories?.length || channel.keywords?.length) ? (
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          {channel.topicCategories?.map((topic) => (
            <span
              key={topic}
              className="px-2.5 py-1 text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60 rounded-lg"
            >
              {topic}
            </span>
          ))}
          {channel.keywords?.slice(0, 8).map((kw) => (
            <span
              key={kw}
              className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg"
            >
              #{kw}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
