"use client";

import React, { useState } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ScraperInput } from "@/components/scrapers/ScraperInput";
import { ScraperSkeleton } from "@/components/scrapers/ScraperSkeleton";
import { ChannelProfileCard } from "@/components/scrapers/youtube/ChannelProfileCard";
import { EngagementSummary } from "@/components/scrapers/youtube/EngagementSummary";
import { VideoTabs } from "@/components/scrapers/youtube/VideoTabs";
import { YouTubeScraperData, ScraperResponse } from "@/lib/scrapers/types";

export default function YouTubeScraperPage() {
  const [data, setData] = useState<YouTubeScraperData | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSearch = async (targetUrl: string, forceRefresh: boolean = false) => {
    if (!targetUrl.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setCurrentUrl(targetUrl.trim());

    try {
      const response = await fetch("/api/scrapers/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: targetUrl.trim(),
          forceRefresh,
        }),
      });

      const resJson: ScraperResponse<YouTubeScraperData> = await response.json();

      if (!response.ok || !resJson.success || !resJson.data) {
        throw new Error(resJson.error || "Failed to fetch YouTube channel data.");
      }

      setData(resJson.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb] text-gray-900 selection:bg-black selection:text-white">
      <PublicHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-10">
        {/* Page Hero Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200/80 rounded-full text-red-700 text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>YouTube Channel & Video Intelligence Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-black font-display">
            YouTube Data Scraper
          </h1>

          <p className="text-sm sm:text-base text-gray-600 font-medium">
            Extract verified channel metrics, all profile links, 10 most recent long videos, 10 shorts, and top comments with 24-hour historical snapshot tracking.
          </p>
        </div>

        {/* Search Input Bar (No auto-search, completely user controlled) */}
        <ScraperInput
          onSearch={(url) => handleSearch(url, false)}
          isLoading={isLoading}
        />

        {/* Error Notification Banner */}
        {error && (
          <div className="max-w-4xl mx-auto p-4 sm:p-5 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-3 text-red-800 shadow-sm animate-shake">
            <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="space-y-1 text-sm">
              <div className="font-bold">Scraping Error</div>
              <div className="font-medium text-red-700">{error}</div>
              <div className="text-xs text-red-500 mt-1">
                Tip: Try passing the direct channel link (e.g. <code className="bg-red-100 px-1 py-0.5 rounded font-mono">https://www.youtube.com/@username</code>)
              </div>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && <ScraperSkeleton />}

        {/* Main Content View */}
        {!isLoading && data && (
          <div className="space-y-8 sm:space-y-10">
            {/* 1. Channel Profile Card (With 24h snapshot notice, timestamp, and force refresh) */}
            <ChannelProfileCard
              channel={data.channel}
              scrapedAt={data.scrapedAt}
              isCached={data.isCached}
              cacheAgeHours={data.cacheAgeHours}
              onForceRefresh={() => handleSearch(currentUrl, true)}
              isRefreshing={isLoading}
            />

            {/* 2. Content Performance Benchmark Overview */}
            <EngagementSummary stats={data.stats} />

            {/* 3. 10 Long Videos (5x2) & 10 Shorts (5x2) */}
            <VideoTabs
              longVideos={data.longVideos}
              shortVideos={data.shortVideos}
            />
          </div>
        )}

        {/* Initial Empty State before any search */}
        {!isLoading && !data && !error && !hasSearched && (
          <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-gray-200/80 shadow-xs max-w-3xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">Ready to Scrape</h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
              Paste any YouTube channel URL, custom handle (@username), or video link above to extract data and store daily snapshots.
            </p>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
