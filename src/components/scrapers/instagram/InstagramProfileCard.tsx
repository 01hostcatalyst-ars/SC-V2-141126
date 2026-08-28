"use client";

import React, { useState } from "react";
import { InstagramProfile } from "@/lib/scrapers/types";

interface InstagramProfileCardProps {
  profile: InstagramProfile;
  scrapedAt?: string;
  isCached?: boolean;
  cacheAgeHours?: number;
  onForceRefresh?: () => void;
  isRefreshing?: boolean;
}

export function InstagramProfileCard({
  profile,
  scrapedAt,
  isCached,
  cacheAgeHours,
  onForceRefresh,
  isRefreshing = false,
}: InstagramProfileCardProps) {
  const [showFullBio, setShowFullBio] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    if (profile.extractedEmail) {
      navigator.clipboard.writeText(profile.extractedEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

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
              Data is preserved till this exact timestamp. Any new posts or follower changes after this time will be recorded in the next 24-hour snapshot.
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
            title="Bypass 24-hour cache and fetch fresh Instagram snapshot immediately"
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

      {/* Top Header: Avatar + Profile Details + Action Buttons (No Banner) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        {/* Avatar & Creator Info */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-6">
          <div className="relative shrink-0">
            <img
              src={profile.avatarUrl}
              alt={profile.fullName || profile.username}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-gray-200 object-cover shadow-sm bg-gray-50 p-0.5"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-black tracking-tight">
                {profile.fullName || profile.username}
              </h1>
              {profile.isVerified && (
                <span className="inline-flex items-center text-blue-600" title="Verified Creator">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </span>
              )}
              {profile.categoryName && (
                <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-50 text-purple-700 rounded-md border border-purple-200">
                  {profile.categoryName}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500">
              <span className="text-gray-900 font-bold">@{profile.username}</span>
              {profile.userId && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="px-2 py-0.5 text-[11px] font-mono font-medium bg-gray-100 text-gray-600 rounded-md border border-gray-200">
                    ID: {profile.userId}
                  </span>
                </>
              )}
              {profile.isBusinessAccount && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-600 font-medium">Business / Creator Account</span>
                </>
              )}
              {profile.isPrivate && (
                <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-50 text-amber-700 rounded-md border border-amber-200">
                  Private
                </span>
              )}
              {profile.isJoinedRecently && (
                <span className="px-2 py-0.5 text-[11px] font-bold bg-rose-50 text-rose-700 rounded-md border border-rose-200">
                  New Account
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {profile.extractedEmail && (
            <button
              type="button"
              onClick={handleCopyEmail}
              className="px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{copiedEmail ? "Email Copied" : profile.extractedEmail}</span>
            </button>
          )}

          <a
            href={`https://www.instagram.com/${profile.username}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:opacity-95 text-white transition-all flex items-center gap-1.5 shadow-xs"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>Open Instagram</span>
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
            {profile.followerCount.toLocaleString()} total
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
            {profile.followingCount.toLocaleString()} accounts
          </div>
        </div>

        {/* Total Posts */}
        <div className="p-4 sm:p-5 bg-gray-50/80 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Total Posts</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-xl sm:text-2xl font-black text-black">
            {profile.postsCountFormatted}
          </div>
          <div className="text-[11px] text-gray-400 font-medium mt-1">
            {profile.postsCount.toLocaleString()} lifetime uploads
          </div>
        </div>

        {/* Account Status / Verified */}
        <div className="p-4 sm:p-5 bg-gray-50/80 rounded-2xl border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Account Type</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="text-xl sm:text-2xl font-black text-black">
            {profile.isVerified ? "Verified" : "Standard"}
          </div>
          <div className="text-[11px] text-gray-400 font-medium mt-1">
            {profile.isBusinessAccount ? "Creator / Business" : "Public Account"}
          </div>
        </div>
      </div>

      {/* External Bio Links */}
      {profile.externalUrls && profile.externalUrls.length > 0 && (
        <div className="bg-gray-50/60 rounded-2xl p-4 sm:p-5 border border-gray-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Bio Links ({profile.externalUrls.length})</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {profile.externalUrls.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 hover:text-black transition-all shadow-2xs group"
              >
                <svg className="w-3 h-3 text-pink-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>{link.title || link.url.replace(/^https?:\/\/(www\.)?/, '')}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Bio / Biography */}
      {profile.biography && (
        <div className="bg-gray-50/60 rounded-2xl p-4 sm:p-5 border border-gray-100">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Instagram Bio
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
