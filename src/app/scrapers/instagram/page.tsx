"use client";

import React, { useState, useEffect } from "react";
import { InstagramScraperData } from "@/lib/scrapers/types";
import { InstagramProfileCard } from "@/components/scrapers/instagram/InstagramProfileCard";
import { InstagramEngagementCard } from "@/components/scrapers/instagram/InstagramEngagementCard";
import { InstagramPostGrid } from "@/components/scrapers/instagram/InstagramPostGrid";

export default function InstagramScraperPage() {
  const [inputUrl, setInputUrl] = useState("@mkbhd");
  const [data, setData] = useState<InstagramScraperData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(1);

  // Progressive Loading Steps Simulation for live scraping feedback
  useEffect(() => {
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;
    let timer3: NodeJS.Timeout;

    if (loading || refreshing) {
      setLoadingStep(1);
      timer1 = setTimeout(() => setLoadingStep(2), 5000);
      timer2 = setTimeout(() => setLoadingStep(3), 18000);
      timer3 = setTimeout(() => setLoadingStep(4), 35000);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [loading, refreshing]);

  const handleScrape = async (overrideUrl?: string, forceRefresh: boolean = false) => {
    const target = overrideUrl || inputUrl;
    if (!target.trim()) return;

    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setData(null);
    }
    setError(null);

    try {
      const res = await fetch("/api/scrapers/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: target.trim(),
          forceRefresh,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch Instagram profile.");
      }

      setData(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border border-pink-200 text-gray-800 text-xs font-bold shadow-2xs">
            <svg className="w-3.5 h-3.5 text-pink-600 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>Instagram Creator Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
            Instagram Creator & Engagement Scraper
          </h1>
          <p className="text-sm text-gray-600">
            Extract profile statistics, verified badges, recent uploads, exact likes, comment metrics, and 24-hour historical snapshots.
          </p>
        </div>

        {/* Search Bar & Quick Handles */}
        <div className="max-w-2xl mx-auto space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleScrape();
            }}
            className="flex items-center gap-2 p-1.5 bg-white border-2 border-gray-200 focus-within:border-black rounded-2xl shadow-sm transition-all"
          >
            <div className="pl-3 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Enter Instagram handle or URL (e.g. @mkbhd or instagram.com/mkbhd)"
              className="flex-1 px-2 py-2 bg-transparent text-sm sm:text-base font-semibold text-black placeholder:text-gray-400 focus:outline-hidden"
            />

            <button
              type="submit"
              disabled={loading || refreshing || !inputUrl.trim()}
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
            {["@mkbhd", "@cristiano", "@selenagomez", "@mrbeast"].map((handle) => (
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
              <span>Failed to fetch Instagram data</span>
            </div>
            <p className="text-xs text-red-700 leading-relaxed">{error}</p>
          </div>
        )}

        {/* Loading State with Step Indicator */}
        {loading && (
          <div className="max-w-xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center space-y-6">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-500 p-0.5 animate-pulse">
              <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-pink-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900">
                Fetching Instagram Creator Profile...
              </h3>
              <p className="text-xs text-gray-500">
                Bypassing Meta challenges & extracting 12 recent posts with likes and comments.
              </p>
            </div>

            {/* Step-by-Step Progress */}
            <div className="space-y-2.5 text-left max-w-sm mx-auto text-xs">
              <div className={`flex items-center gap-2.5 ${loadingStep >= 1 ? "text-gray-900 font-bold" : "text-gray-400"}`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${loadingStep >= 1 ? "bg-black text-white" : "bg-gray-200 text-gray-500"}`}>
                  1
                </div>
                <span>Connecting to residential proxy pipeline</span>
              </div>
              <div className={`flex items-center gap-2.5 ${loadingStep >= 2 ? "text-gray-900 font-bold" : "text-gray-400"}`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${loadingStep >= 2 ? "bg-black text-white" : "bg-gray-200 text-gray-500"}`}>
                  2
                </div>
                <span>Extracting creator profile, followers, and bio</span>
              </div>
              <div className={`flex items-center gap-2.5 ${loadingStep >= 3 ? "text-gray-900 font-bold" : "text-gray-400"}`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${loadingStep >= 3 ? "bg-black text-white" : "bg-gray-200 text-gray-500"}`}>
                  3
                </div>
                <span>Parsing recent posts, likes count, and comments</span>
              </div>
              <div className={`flex items-center gap-2.5 ${loadingStep >= 4 ? "text-gray-900 font-bold" : "text-gray-400"}`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${loadingStep >= 4 ? "bg-black text-white" : "bg-gray-200 text-gray-500"}`}>
                  4
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
            <InstagramProfileCard
              profile={data.profile}
              scrapedAt={data.scrapedAt}
              isCached={data.isCached}
              cacheAgeHours={data.cacheAgeHours}
              onForceRefresh={() => handleScrape(undefined, true)}
              isRefreshing={refreshing}
            />

            {/* Engagement Card */}
            <InstagramEngagementCard
              stats={data.stats}
              totalFollowers={data.profile.followerCount}
            />

            {/* 5 Posts Per Row (2 Rows = 10 Posts) */}
            <InstagramPostGrid posts={data.posts} />
          </div>
        )}
      </div>
    </div>
  );
}
