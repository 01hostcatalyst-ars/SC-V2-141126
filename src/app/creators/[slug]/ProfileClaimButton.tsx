"use client";

import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { ClaimProfileModal } from "@/components/creators/ClaimProfileModal";

interface ProfileClaimButtonProps {
  creator: {
    id: string;
    canonicalName: string;
    brandName?: string | null;
    slug?: string | null;
    verifiedEmail?: string | null;
    youtubeHandle?: string | null;
    instagramUsername?: string | null;
    tiktokUsername?: string | null;
  };
  isClaimed?: boolean;
}

export function ProfileClaimButton({ creator, isClaimed }: ProfileClaimButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isClaimed) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
        <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span>Official Verified Creator</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center justify-center px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-2xs hover:shadow-xs transition"
      >
        <span>Claim This Profile</span>
      </button>

      <ClaimProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        creator={creator}
      />
    </>
  );
}
