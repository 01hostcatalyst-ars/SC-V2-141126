"use client";

import React, { useState, useEffect } from "react";
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSearch = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch("/api/scrapers/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl.trim() }),
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

  // Optional: Auto-load default sample on initial visit for immediate wow factor
  useEffect(() => {
    handleSearch("@VideoWaliSarkar1");
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb] text-gray-900 selection:bg-black selection:text-white">
      <PublicHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-10">
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
            Extract verified channel metrics, the 10 most recent long videos & shorts, and top comments in seconds.
          </p>
        </div>

        {/* Search Input Bar */}
        <ScraperInput onSearch={handleSearch} isLoading={isLoading} initialValue="@VideoWaliSarkar1" />

        {/* Error Notification Banner */}
        {error && (
          <div className="max-w-4xl mx-auto p-4 sm:p-5 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-3 text-red-800 shadow-sm animate-shake">
            <div className="text-xl shrink-0">⚠️</div>
            <div className="space-y-1 text-sm">
              <div className="font-bold">Scraping Error</div>
              <div className="font-medium text-red-700">{error}</div>
              <div className="text-xs text-red-500 mt-1">
                Tip: Try passing the direct channel link (e.g. <code className="bg-red-100 px-1 py-0.5 rounded font-mono">https://www.youtube.com/@VideoWaliSarkar1</code>)
              </div>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && <ScraperSkeleton />}

        {/* Main Content View */}
        {!isLoading && data && (
          <div className="space-y-8 sm:space-y-10">
            {/* 1. Channel Profile Card */}
            <ChannelProfileCard channel={data.channel} />

            {/* 2. Content Performance Benchmark */}
            <EngagementSummary stats={data.stats} />

            {/* 3. 10 Long vs 10 Shorts Video Tabs */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                  Recent Uploads Catalog
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  10 most recent long-form uploads & 10 most recent shorts with real-time views, likes, and comment threads.
                </p>
              </div>

              <VideoTabs
                longVideos={data.longVideos}
                shortVideos={data.shortVideos}
              />
            </div>
          </div>
        )}

        {/* Empty State before any search */}
        {!isLoading && !data && !error && hasSearched && (
          <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-gray-200">
            <div className="text-4xl">🔍</div>
            <h3 className="text-lg font-bold text-gray-800">No channel data to display</h3>
            <p className="text-xs text-gray-500">Enter a YouTube link above to start extracting data.</p>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
