"use client";

import React from "react";
import Link from "next/link";

interface PublicHeaderProps {
  activeRoute?: string;
  authButton?: React.ReactNode;
}

export function PublicHeader({ authButton }: PublicHeaderProps) {
  return (
    <header className="w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left Logo - Clean SIGNCOLLAB text only */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-black text-xl tracking-tight text-black uppercase">
            SIGNCOLLAB
          </span>
        </Link>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {authButton}
          <Link
            href="/instant"
            className="px-3.5 py-2 text-xs font-bold rounded-lg bg-black text-white hover:bg-gray-800 transition-all shadow-sm whitespace-nowrap"
          >
            <span className="md:hidden">Free Contract</span>
            <span className="hidden md:inline">Create Free Contract</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
