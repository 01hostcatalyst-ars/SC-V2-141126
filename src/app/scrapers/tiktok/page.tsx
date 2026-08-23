"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TikTokScraperData, ScraperResponse } from "@/lib/scrapers/types";
import { TikTokProfileCard } from "@/components/scrapers/tiktok/TikTokProfileCard";
import { TikTokEngagementCard } from "@/components/scrapers/tiktok/TikTokEngagementCard";
import { TikTokVideoGrid } from "@/components/scrapers/tiktok/TikTokVideoGrid";

export default function TikTokScraperPage() {
  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TikTokScraperData | null>(null);

  const handleScrape = async (overrideInput?: string, forceRefresh = false) => {
    const target = (overrideInput || inputUrl).trim();
    if (!target) return;

    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setError(null);
      setData(null);
    }

    try {
      const res = await fetch("/api/scrapers/tiktok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: target, forceRefresh }),
      });

      const json: ScraperResponse<TikTokScraperData> = await res.json();

      if (!json.success || !json.data) {
        throw new Error(json.error || "Failed to fetch TikTok data.");
      }

      setData(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to scrape TikTok creator.";
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black selection:bg-black selection:text-white pb-24">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/scrapers/instagram"
              className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
              title="Back"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  TikTok Intelligence
                </span>
                <span className="text-xs font-semibold text-gray-400">Bright Data Powered</span>
              </div>
              <h1 className="text-sm font-black text-black">
                Creator & Video Engagement Scraper
              </h1>
            </div>
          </div>

          {/* Platform Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
            <Link
              href="/scrapers/youtube"
              className="px-3 py-1 text-xs font-bold rounded-lg text-gray-600 hover:text-black transition-colors"
            >
              YouTube
            </Link>
            <Link
              href="/scrapers/instagram"
              className="px-3 py-1 text-xs font-bold rounded-lg text-gray-600 hover:text-black transition-colors"
            >
              Instagram
            </Link>
            <span className="px-3 py-1 text-xs font-bold rounded-lg bg-white text-black shadow-2xs">
              TikTok
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Search Bar */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Analyze any TikTok Creator
          </h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Extract profile statistics, verified badges, total lifetime likes, and recent video performance with exact views and shares.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleScrape();
            }}
            className="flex items-center gap-2 p-2 bg-white rounded-2xl border border-gray-200 shadow-sm max-w-xl mx-auto focus-within:border-black transition-colors"
          >
            <div className="pl-3 text-gray-400">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </div>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Enter TikTok handle or URL (e.g. @mrbeast)"
              className="flex-1 px-2 py-2 text-sm bg-transparent outline-none text-gray-900 placeholder:text-gray-400 font-medium"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputUrl.trim()}
              className="px-5 py-2.5 bg-black hover:bg-gray-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Scraping...</span>
                </>
              ) : (
                <span>Fetch Profile</span>
              )}
            </button>
          </form>

          {/* Quick Examples */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-gray-500">
            <span className="text-gray-400">Try testing:</span>
            {["@mrbeast", "@khaby.lame", "@charlidamelio", "@bellapoarch"].map((handle) => (
              <button
                key={handle}
                type="button"
                onClick={() => {
                  setInputUrl(handle);
                  handleScrape(handle);
                }}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-black transition-all border border-gray-200/60"
              >
                {handle}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 font-bold">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Failed to fetch TikTok data</span>
            </div>
            <p className="text-xs text-red-700 leading-relaxed">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="max-w-xl mx-auto bg-white rounded-3xl border border-gray-200 p-8 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-black animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-black">
                Extracting TikTok Creator Intelligence...
              </h3>
              <p className="text-xs text-gray-500">
                Fetching profile stats, total likes, video play counts, and shares via Bright Data.
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-left text-xs text-gray-600 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                  1
                </div>
                <span>Connecting to Bright Data TikTok dataset</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                  2
                </div>
                <span>Resolving 23 recent video view counts & engagement metrics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px]">
                  3
                </div>
                <span>Storing 24-hour snapshot in PostgreSQL</span>
              </div>
            </div>
          </div>
        )}

        {/* Results View */}
        {data && (
          <div className="space-y-6">
            {/* Profile Card */}
            <TikTokProfileCard
              profile={data.profile}
              scrapedAt={data.scrapedAt}
              isCached={data.isCached}
              cacheAgeHours={data.cacheAgeHours}
              onForceRefresh={() => handleScrape(undefined, true)}
              isRefreshing={refreshing}
            />

            {/* Engagement Card */}
            <TikTokEngagementCard
              stats={data.stats}
              totalFollowers={data.profile.followerCount}
            />

            {/* Video Grid (5 Videos Per Row) */}
            <TikTokVideoGrid videos={data.videos} />
          </div>
        )}
      </div>
    </div>
  );
}
