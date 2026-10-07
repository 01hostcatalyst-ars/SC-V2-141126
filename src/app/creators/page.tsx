import React, { Suspense } from "react";
import { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { CreatorDirectoryView } from "@/components/creators/CreatorDirectoryView";

export const metadata: Metadata = {
  title: "Creator Directory - 1,500+ Verified Creators, Rates & Analytics | SignCollab",
  description:
    "Explore the premier institutional creator directory. Filter multi-platform creators across YouTube, Instagram, and TikTok by country, niche, reach, and empirical commercial rates.",
  openGraph: {
    title: "Creator Commercial Directory | SignCollab",
    description:
      "Empirical rates, verified cross-platform reach, and instant bilateral contracts for 1,500+ creators.",
  },
};

export default function CreatorsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans">
      <PublicHeader />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-xs text-zinc-400">
              Loading Creator Directory...
            </div>
          }
        >
          <CreatorDirectoryView />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
