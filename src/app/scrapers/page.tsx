"use client";

import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function ScrapersHubPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb] text-gray-900 selection:bg-black selection:text-white">
      <PublicHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {/* Hub Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-xs font-bold shadow-2xs">
            <span>🚀 Social Intelligence Suite</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-black font-display">
            Platform Scrapers & Insights
          </h1>

          <p className="text-base sm:text-lg text-gray-600 font-medium">
            Extract creator metrics, audience analytics, recent uploads, and comments across all major creator platforms.
          </p>
        </div>

        {/* Platform Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. YouTube (Active) */}
          <div className="bg-white rounded-3xl border-2 border-red-500/30 p-6 sm:p-8 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -mr-10 -mt-10" />

            <div className="space-y-4 relative">
              <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-emerald-100 text-emerald-800">
                  ● ACTIVE & READY
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-black">YouTube Scraper</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  Extract complete channel stats, lifetime views, 10 most recent long videos, 10 shorts, and top 5 recent comments.
                </p>
              </div>

              <ul className="space-y-1.5 text-xs font-semibold text-gray-500 pt-2 border-t border-gray-100">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Channel handle & bio extraction
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> 10 Long-Form + 10 Shorts
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Top 5 recent comments on top 3
                </li>
              </ul>
            </div>

            <div className="pt-6 relative">
              <Link
                href="/scrapers/youtube"
                className="w-full py-3.5 px-6 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-sm text-center flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>Launch YouTube Scraper</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* 2. Instagram (Coming Soon) */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 flex flex-col justify-between opacity-80 hover:opacity-100 transition-all">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-yellow-500 via-pink-600 to-purple-700 text-white flex items-center justify-center shadow-md">
                <span className="text-2xl">📸</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-gray-100 text-gray-600">
                  COMING NEXT
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-black">Instagram Insights</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  Extract creator profiles, followers, reels performance, engagement rates, and recent feed posts.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                disabled
                className="w-full py-3.5 px-6 rounded-xl bg-gray-100 text-gray-400 font-bold text-sm text-center cursor-not-allowed"
              >
                In Development
              </button>
            </div>
          </div>

          {/* 3. TikTok (Coming Soon) */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 flex flex-col justify-between opacity-80 hover:opacity-100 transition-all">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
                <span className="text-2xl">🎵</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-gray-100 text-gray-600">
                  COMING NEXT
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-black">TikTok Intelligence</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  Analyze TikTok creator profile stats, average views on latest 20 videos, likes count, and comment sentiment.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                disabled
                className="w-full py-3.5 px-6 rounded-xl bg-gray-100 text-gray-400 font-bold text-sm text-center cursor-not-allowed"
              >
                In Development
              </button>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
