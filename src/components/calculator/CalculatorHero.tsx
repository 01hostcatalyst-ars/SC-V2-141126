"use client";

import React from "react";

export function CalculatorHero() {
  return (
    <div className="text-center max-w-3xl mx-auto mb-10">
      {/* Top Status Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100/90 border border-gray-200/90 text-xs font-semibold text-gray-800 mb-5 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
        <span className="tracking-wide">2025–2026 Empirical Benchmark Engine</span>
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-black uppercase mb-4 leading-[1.15]">
        Influencer Campaign <br className="hidden sm:inline" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-black via-gray-800 to-gray-600">
          Rate & Pricing Calculator
        </span>
      </h1>

      <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed max-w-2xl mx-auto">
        Estimate fair market rates for Instagram, TikTok, and YouTube collaborations.
        Calibrated with piecewise continuous interpolation, organic engagement velocity, commercial usage rights, and volume discounts.
      </p>

      {/* Dataset Trust Badges (Clean SVG Icons, Zero Emojis) */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6 text-[11px] font-semibold text-gray-600">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200/80 rounded-lg shadow-2xs">
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Aspire 2026 Rates</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200/80 rounded-lg shadow-2xs">
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>HypeAuditor Baselines</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200/80 rounded-lg shadow-2xs">
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>CreatorIQ Compensation</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200/80 rounded-lg shadow-2xs">
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
          <span>Zero Price Cliffs</span>
        </div>
      </div>
    </div>
  );
}
