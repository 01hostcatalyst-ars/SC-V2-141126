"use client";

import React, { useState, useMemo } from "react";
import { Platform } from "@/lib/calculator/types";

interface ProfileSearchHeroProps {
  onSearch?: (input: string, platform?: Platform) => void;
  isLoading?: boolean;
}

export function ProfileSearchHero({ onSearch, isLoading = false }: ProfileSearchHeroProps) {
  const [inputQuery, setInputQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("instagram");

  // Determine if input is a full URL or a handle
  const isUrl = useMemo(() => {
    const trimmed = inputQuery.trim().toLowerCase();
    return (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.includes("instagram.com") ||
      trimmed.includes("youtube.com") ||
      trimmed.includes("youtu.be") ||
      trimmed.includes("tiktok.com") ||
      trimmed.includes("www.")
    );
  }, [inputQuery]);

  // If URL, determine platform
  const detectedUrlPlatform = useMemo<string | null>(() => {
    if (!isUrl) return null;
    const lower = inputQuery.toLowerCase();
    if (lower.includes("instagram.com")) return "Instagram";
    if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "YouTube";
    if (lower.includes("tiktok.com")) return "TikTok";
    return "URL Detected";
  }, [inputQuery, isUrl]);

  const hasHandleInput = inputQuery.trim().length > 0 && !isUrl;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    onSearch?.(inputQuery.trim(), isUrl ? undefined : selectedPlatform);
  };

  const handleQuickTest = (value: string, platform?: Platform) => {
    setInputQuery(value);
    if (platform) setSelectedPlatform(platform);
  };

  return (
    <div className="w-full max-w-xl mx-auto py-8 sm:py-12 px-4">
      {/* Refined Minimal Header */}
      <div className="text-center space-y-2 mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-900" />
          <span>2025–2026 Valuation Engine</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-950">
          Influencer Rate Calculator
        </h1>

        <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
          Enter a profile link or handle to benchmark sponsorship pricing across Instagram, TikTok, and YouTube.
        </p>
      </div>

      {/* Modern Search Container */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-3.5 sm:p-4 space-y-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative flex items-center bg-gray-50/80 rounded-xl border border-gray-200/90 focus-within:border-gray-900 focus-within:bg-white focus-within:ring-1 focus-within:ring-gray-900 transition-all p-1">
            {/* Search SVG Icon */}
            <div className="pl-3 pr-1 text-gray-400 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>

            {/* Input */}
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Paste profile URL or enter handle (e.g. @mkbhd)"
              className="flex-1 px-2.5 py-2 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 bg-transparent outline-none font-medium"
              autoFocus
            />

            {/* URL detected badge */}
            {isUrl && detectedUrlPlatform && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-gray-200/70 text-gray-700 text-[10px] font-medium mr-1.5 shrink-0">
                {detectedUrlPlatform}
              </span>
            )}

            {/* Start Button */}
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-4 py-2 bg-gray-950 hover:bg-black disabled:opacity-40 text-white font-semibold text-xs rounded-lg transition-all shadow-2xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Loading</span>
                </>
              ) : (
                <>
                  <span>Start</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Platform Selector Segmented Control (Only appears when handle is typed) */}
          {hasHandleInput && (
            <div className="pt-1 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-gray-50/70 border border-gray-150 text-xs">
                <span className="text-gray-500 font-medium text-[11px]">
                  Handle Platform:
                </span>

                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-gray-200 shadow-2xs">
                  {/* Instagram Button with SVG */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlatform("instagram")}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedPlatform === "instagram"
                        ? "bg-gray-950 text-white shadow-2xs"
                        : "text-gray-600 hover:text-gray-950 hover:bg-gray-100"
                    }`}
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    <span>Instagram</span>
                  </button>

                  {/* YouTube Button with SVG */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlatform("youtube")}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedPlatform === "youtube"
                        ? "bg-gray-950 text-white shadow-2xs"
                        : "text-gray-600 hover:text-gray-950 hover:bg-gray-100"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <span>YouTube</span>
                  </button>

                  {/* TikTok Button with SVG */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlatform("tiktok")}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedPlatform === "tiktok"
                        ? "bg-gray-950 text-white shadow-2xs"
                        : "text-gray-600 hover:text-gray-950 hover:bg-gray-100"
                    }`}
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                    <span>TikTok</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Minimal Quick Test Links */}
        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
          <span className="text-gray-400">Examples:</span>
          <button
            type="button"
            onClick={() => handleQuickTest("https://www.instagram.com/irfanjunejo/", "instagram")}
            className="px-2 py-0.5 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-700 transition-all border border-gray-200/60 cursor-pointer"
          >
            Instagram URL
          </button>
          <button
            type="button"
            onClick={() => handleQuickTest("https://www.youtube.com/@mkbhd", "youtube")}
            className="px-2 py-0.5 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-700 transition-all border border-gray-200/60 cursor-pointer"
          >
            YouTube URL
          </button>
          <button
            type="button"
            onClick={() => handleQuickTest("@mrbeast", "tiktok")}
            className="px-2 py-0.5 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-700 transition-all border border-gray-200/60 cursor-pointer"
          >
            @mrbeast
          </button>
        </div>
      </div>
    </div>
  );
}
