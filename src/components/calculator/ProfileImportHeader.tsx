"use client";

import React, { useState } from "react";
import { Platform } from "@/lib/calculator/types";
import { CreatorAIClassification } from "@/lib/ai/gemini";

interface ImportedCreatorData {
  username: string;
  displayName: string;
  avatarUrl: string;
  biography?: string;
  platform: Platform;
  followerCount: number;
  avgLikes: number;
  avgComments: number;
  avgViews: number;
  avgShares?: number;
  externalLinks?: Array<{ platform: string; url: string }>;
}

interface ProfileImportHeaderProps {
  onImportSuccess: (data: {
    creator: ImportedCreatorData;
    aiEnrichment: CreatorAIClassification;
    rateCardItems?: unknown[];
  }) => void;
  onSelectSecondaryNiche: (nicheId: number) => void;
  activeNicheId: number;
  importedCreator: ImportedCreatorData | null;
  aiEnrichment: CreatorAIClassification | null;
}

type PlatformTab = "auto" | "instagram" | "youtube" | "tiktok";

export function ProfileImportHeader({
  onImportSuccess,
  onSelectSecondaryNiche,
  activeNicheId,
  importedCreator,
  aiEnrichment,
}: ProfileImportHeaderProps) {
  const [urlInput, setUrlInput] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformTab>("auto");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async (overrideUrl?: string, overridePlatform?: PlatformTab) => {
    const target = (overrideUrl || urlInput).trim();
    if (!target) return;

    setLoading(true);
    setError(null);

    const platformToSend = overridePlatform || selectedPlatform;
    const isInstagram = platformToSend === "instagram" || (platformToSend === "auto" && target.toLowerCase().includes("instagram.com"));

    try {
      // 1. Stage 1: If Instagram, run Fast Mode (Process 1) first to immediately get bio links and unblock YouTube/TikTok!
      const initialRes = await fetch("/api/calculator/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: target,
          requestedPlatform: platformToSend !== "auto" ? platformToSend : undefined,
          fastMode: isInstagram,
        }),
      });

      const initialText = await initialRes.text();
      let initialJson: { success?: boolean; error?: string; creator?: ImportedCreatorData; aiEnrichment?: CreatorAIClassification };

      try {
        initialJson = JSON.parse(initialText);
      } catch {
        throw new Error(
          initialRes.ok
            ? "Server returned invalid response. Please try again."
            : `Server error (${initialRes.status}): Please verify the creator handle or URL.`
        );
      }

      if (!initialRes.ok || !initialJson.success || !initialJson.creator || !initialJson.aiEnrichment) {
        throw new Error(initialJson.error || "Failed to import creator profile.");
      }

      // Immediately propagate Process 1 results so secondary platforms start scraping NOW
      onImportSuccess({
        creator: initialJson.creator,
        aiEnrichment: initialJson.aiEnrichment,
        rateCardItems: (initialJson as Record<string, unknown>).rateCardItems as unknown[],
      });

      setLoading(false);

      // 2. Stage 2: If Instagram, continue with full Process 2 post enrichment in the background
      if (isInstagram) {
        fetch("/api/calculator/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: target,
            requestedPlatform: "instagram",
            fastMode: false,
          }),
        })
          .then((res) => res.json())
          .then((fullJson) => {
            if (fullJson.success && fullJson.creator && fullJson.aiEnrichment) {
              onImportSuccess({
                creator: fullJson.creator,
                aiEnrichment: fullJson.aiEnrichment,
                rateCardItems: fullJson.rateCardItems,
              });
            }
          })
          .catch((e) => {
            console.warn("Background Process 2 enrichment error:", e);
          });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to import profile.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-7 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              Live Channel Audit &amp; AI Integration
            </span>
            <span className="text-xs font-semibold text-gray-400">SignCollab LLM Engine Powered</span>
          </div>
          <h2 className="text-lg font-black text-black tracking-tight mt-1">
            Import Creator Profile
          </h2>
        </div>

        {/* Platform Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200/80 self-start sm:self-auto">
          {[
            { id: "auto", label: "Auto Detect" },
            { id: "instagram", label: "Instagram" },
            { id: "youtube", label: "YouTube" },
            { id: "tiktok", label: "TikTok" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedPlatform(tab.id as PlatformTab)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                selectedPlatform === tab.id
                  ? "bg-white text-black shadow-xs font-black"
                  : "text-gray-600 hover:text-black hover:bg-gray-200/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleImport();
        }}
        className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-black transition-colors"
      >
        <div className="pl-3 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder={
            selectedPlatform === "instagram"
              ? "Enter Instagram handle or URL (e.g. @irfanjunejo or instagram.com/irfanjunejo)"
              : selectedPlatform === "youtube"
              ? "Enter YouTube channel URL or handle (e.g. @mkbhd or youtube.com/@mkbhd)"
              : selectedPlatform === "tiktok"
              ? "Enter TikTok handle or URL (e.g. @mrbeast or tiktok.com/@mrbeast)"
              : "Paste URL or handle (e.g. @irfanjunejo, instagram.com/mkbhd, tiktok.com/@mrbeast)"
          }
          className="flex-1 px-2 py-2 text-xs sm:text-sm bg-transparent outline-none text-gray-900 placeholder:text-gray-400 font-medium"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !urlInput.trim()}
          className="px-4 sm:px-6 py-2.5 bg-black hover:bg-gray-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Analyzing...</span>
            </>
          ) : (
            <span>Import Profile</span>
          )}
        </button>
      </form>

      {/* Quick Test Handles */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
        <span className="text-gray-400">Quick Test:</span>
        {[
          { label: "@irfanjunejo (IG)", handle: "https://www.instagram.com/irfanjunejo/", platform: "instagram" as PlatformTab },
          { label: "@mkbhd (YT)", handle: "https://www.youtube.com/@mkbhd", platform: "youtube" as PlatformTab },
          { label: "@mrbeast (TT)", handle: "https://www.tiktok.com/@mrbeast", platform: "tiktok" as PlatformTab },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              setUrlInput(item.handle);
              setSelectedPlatform(item.platform);
              handleImport(item.handle, item.platform);
            }}
            className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-black transition-all border border-gray-200/60"
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* AI Enriched Creator Card */}
      {importedCreator && aiEnrichment && (
        <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200/90 space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {importedCreator.avatarUrl && (
                <img
                  src={importedCreator.avatarUrl}
                  alt={importedCreator.displayName}
                  className="w-12 h-12 rounded-full border border-gray-200 object-cover shadow-2xs"
                />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-black text-base tracking-tight">
                    {importedCreator.displayName}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-black text-white text-[10px] font-bold uppercase">
                    {importedCreator.platform}
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-500">@{importedCreator.username?.replace(/^@+/, "")}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-gray-700">
              <div className="text-right">
                <div className="text-[10px] text-gray-400 uppercase">Followers</div>
                <div className="font-black text-black">{importedCreator.followerCount.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-400 uppercase">Avg Likes</div>
                <div className="font-black text-black">{importedCreator.avgLikes.toLocaleString()}</div>
              </div>
              {importedCreator.avgViews > 0 && (
                <div className="text-right">
                  <div className="text-[10px] text-gray-400 uppercase">Avg Views</div>
                  <div className="font-black text-black">{importedCreator.avgViews.toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>

          {/* AI Executive Summary */}
          {aiEnrichment.creatorSummary && (
            <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-950 leading-relaxed">
              <span className="font-bold text-blue-900">AI Creator Summary: </span>
              {aiEnrichment.creatorSummary}
            </div>
          )}

          {/* 3 Niches Display (1 Primary + 2 Secondary Quick Switch) */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Identified Content Niches:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Primary Niche Badge */}
              <div
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-2xs border ${
                  activeNicheId === aiEnrichment.primaryNiche.id
                    ? "bg-black text-white border-black"
                    : "bg-gray-100 text-gray-800 border-gray-200 cursor-pointer"
                }`}
                onClick={() => onSelectSecondaryNiche(aiEnrichment.primaryNiche.id)}
              >
                <span>Primary: {aiEnrichment.primaryNiche.name}</span>
              </div>

              {/* Secondary Niche Pills */}
              {aiEnrichment.secondaryNiches.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => onSelectSecondaryNiche(sec.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    activeNicheId === sec.id
                      ? "bg-black text-white border-black"
                      : "bg-white hover:bg-gray-100 text-gray-700 border-gray-200 shadow-2xs"
                  }`}
                  title="Click to apply this category to calculation"
                >
                  <span>{sec.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
