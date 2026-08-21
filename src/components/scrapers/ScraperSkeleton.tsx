"use client";

import React from "react";

export function ScraperSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-pulse mt-8">
      {/* Banner & Profile skeleton */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="h-44 sm:h-56 bg-gray-200" />
        <div className="p-6 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-20 sm:-mt-24 mb-6">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gray-300 border-4 border-white shrink-0 shadow-md" />
            <div className="space-y-3 w-full">
              <div className="h-7 w-64 bg-gray-300 rounded-lg" />
              <div className="h-4 w-40 bg-gray-200 rounded-md" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-2xl space-y-2">
                <div className="h-3 w-20 bg-gray-200 rounded" />
                <div className="h-6 w-28 bg-gray-300 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="h-11 w-48 bg-gray-200 rounded-xl" />
          <div className="h-11 w-40 bg-gray-100 rounded-xl" />
        </div>

        {/* Video cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden space-y-3 p-4">
              <div className="h-44 bg-gray-200 rounded-xl" />
              <div className="h-5 w-full bg-gray-300 rounded" />
              <div className="h-4 w-2/3 bg-gray-200 rounded" />
              <div className="flex justify-between pt-2">
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="h-4 w-20 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
