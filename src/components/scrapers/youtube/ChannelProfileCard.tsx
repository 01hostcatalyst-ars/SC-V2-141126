"use client";

import React, { useState } from "react";
import { YouTubeChannelProfile } from "@/lib/scrapers/types";

interface ChannelProfileCardProps {
  channel: YouTubeChannelProfile;
}

export function ChannelProfileCard({ channel }: ChannelProfileCardProps) {
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

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden transition-all">
      {/* Banner Section */}
      <div className="relative h-44 sm:h-64 w-full bg-linear-to-r from-gray-900 via-gray-800 to-black overflow-hidden">
        {channel.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={channel.bannerUrl}
            alt={`${channel.title} Banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 font-black text-3xl tracking-widest uppercase">
            {channel.title}
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Main Channel Details */}
      <div className="px-6 sm:px-8 pb-8 pt-0 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 -mt-16 sm:-mt-20 mb-6">
          {/* Avatar and Identity */}
          <div className="flex items-end gap-4 sm:gap-6">
            <div className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={channel.avatarUrl}
                alt={channel.title}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl sm:rounded-3xl border-4 border-white object-cover shadow-xl bg-white"
              />
            </div>

            <div className="space-y-1 mb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-black tracking-tight">
                  {channel.title}
                </h1>
                {channel.country && (
                  <span className="px-2 py-0.5 text-xs font-extrabold bg-gray-100 text-gray-700 rounded-md border border-gray-200">
                    🌍 {channel.country}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500">
                <span>{channel.handle || `@${channel.title}`}</span>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="hover:text-black transition-colors font-mono inline-flex items-center gap-1"
                  title="Click to copy Channel ID"
                >
                  <span>{channel.id}</span>
                  <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                    {copiedId ? "Copied!" : "Copy ID"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions / Extracted Email */}
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
                <span>{copiedEmail ? "Email Copied!" : channel.extractedEmail}</span>
              </button>
            )}

            <a
              href={`https://www.youtube.com/${channel.handle || `channel/${channel.id}`}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all flex items-center gap-1.5 shadow-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>View on YouTube</span>
            </a>
          </div>
        </div>

        {/* 4 Key Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6">
          <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
              <span>Subscribers</span>
              <span className="text-base">👥</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-black">
              {channel.subscriberCountFormatted}
            </div>
            <div className="text-[11px] text-gray-400 font-medium mt-1">
              {channel.subscriberCount.toLocaleString()} total
            </div>
          </div>

          <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
              <span>Lifetime Views</span>
              <span className="text-base">👁️</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-black">
              {channel.lifetimeViewCountFormatted}
            </div>
            <div className="text-[11px] text-gray-400 font-medium mt-1">
              {channel.lifetimeViewCount.toLocaleString()} total
            </div>
          </div>

          <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
              <span>Total Videos</span>
              <span className="text-base">🎬</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-black">
              {channel.videoCount.toLocaleString()}
            </div>
            <div className="text-[11px] text-gray-400 font-medium mt-1">
              Since {formattedDate}
            </div>
          </div>

          <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
              <span>Avg Views / Video</span>
              <span className="text-base">📈</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-black">
              {channel.avgViewsPerVideo.toLocaleString()}
            </div>
            <div className="text-[11px] text-gray-400 font-medium mt-1">
              Lifetime average
            </div>
          </div>
        </div>

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
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {channel.topicCategories?.map((topic) => (
              <span
                key={topic}
                className="px-2.5 py-1 text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60 rounded-lg"
              >
                🏷️ {topic}
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
    </div>
  );
}
