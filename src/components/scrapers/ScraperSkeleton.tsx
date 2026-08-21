"use client";

import React from "react";

export function ScraperSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-pulse mt-8">
      {/* Profile Card Skeleton (No Banner) */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-200 shrink-0" />
            <div className="space-y-2.5">
              <div className="h-7 w-56 bg-gray-300 rounded-lg" />
              <div className="h-4 w-36 bg-gray-200 rounded-md" />
            </div>
          </div>
          <div className="h-10 w-36 bg-gray-200 rounded-xl" />
        </div>

        {/* 4 Stats Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-2xl space-y-2">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="h-6 w-28 bg-gray-300 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Video Feed Skeleton (5 per row) */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="h-6 w-64 bg-gray-300 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden space-y-3 p-3">
              <div className="aspect-video bg-gray-200 rounded-xl" />
              <div className="h-4 w-full bg-gray-300 rounded" />
              <div className="h-3 w-2/3 bg-gray-200 rounded" />
              <div className="grid grid-cols-3 gap-1 pt-1">
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
