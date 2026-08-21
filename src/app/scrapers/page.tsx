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
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Social Intelligence Suite</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-black font-display">
            Platform Scrapers & Insights
          </h1>

          <p className="text-base sm:text-lg text-gray-600 font-medium">
            Extract creator metrics, audience analytics, recent uploads, and comments across major creator platforms.
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
                  ACTIVE & READY
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-black">YouTube Scraper</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  Extract complete channel stats, lifetime views, all profile links, 10 most recent long videos, 10 shorts, and top comments.
                </p>
              </div>

              <ul className="space-y-1.5 text-xs font-semibold text-gray-500 pt-2 border-t border-gray-100">
                <li className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Channel handle, bio & profile links</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>10 Long-Form + 10 Shorts</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Top 5 recent comments on top 3 videos</span>
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
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
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
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
                </svg>
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
