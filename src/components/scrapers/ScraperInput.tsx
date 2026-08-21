"use client";

import React, { useState } from "react";

interface ScraperInputProps {
  onSearch: (url: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

const SAMPLE_CHANNELS = [
  { label: "@VideoWaliSarkar1", url: "https://www.youtube.com/@VideoWaliSarkar1" },
  { label: "@MrBeast", url: "https://www.youtube.com/@MrBeast" },
  { label: "@MKBHD", url: "https://www.youtube.com/@mkbhd" },
  { label: "@Veritasium", url: "https://www.youtube.com/@veritasium" },
];

export function ScraperInput({ onSearch, isLoading, initialValue = "" }: ScraperInputProps) {
  const [url, setUrl] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onSearch(url.trim());
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
      }
    } catch {
      // Clipboard access denied or unsupported
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center shadow-lg rounded-2xl bg-white border-2 border-gray-900/10 focus-within:border-black transition-all p-1.5 sm:p-2">
          {/* YouTube Icon */}
          <div className="pl-3 pr-2 text-red-600 shrink-0">
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>

          {/* Text Input */}
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube channel link, handle (@username), or video URL..."
            className="w-full px-2 py-3 text-sm sm:text-base font-medium text-black placeholder-gray-400 focus:outline-none bg-transparent"
            disabled={isLoading}
          />

          {/* Quick Paste Button */}
          {!url && (
            <button
              type="button"
              onClick={handlePaste}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-lg mr-2 transition-colors shrink-0"
              title="Paste from clipboard"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Paste
            </button>
          )}

          {/* Clear Button */}
          {url && !isLoading && (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full mr-1 transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Action Submit Button */}
          <button
            type="submit"
            disabled={!url.trim() || isLoading}
            className="px-5 sm:px-7 py-3 text-sm font-bold text-white bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shrink-0 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Scraping...</span>
              </>
            ) : (
              <>
                <span>Scrape Channel</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Sample channels clickable chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span className="font-semibold text-gray-400">Try sample:</span>
        {SAMPLE_CHANNELS.map((ch) => (
          <button
            key={ch.label}
            type="button"
            onClick={() => {
              setUrl(ch.url);
              onSearch(ch.url);
            }}
            disabled={isLoading}
            className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-full font-medium text-gray-700 hover:text-black transition-colors"
          >
            {ch.label}
          </button>
        ))}
      </div>
    </div>
  );
}
