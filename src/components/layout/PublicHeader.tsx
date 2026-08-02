"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface PublicHeaderProps {
  activeRoute?: string;
  authButton?: React.ReactNode;
}

export function PublicHeader({ activeRoute, authButton }: PublicHeaderProps) {
  const pathname = usePathname();
  const currentPath = activeRoute || pathname || "/";

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Vision & Mission", href: "/vision" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Knowledge Base", href: "/knowledge" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left Logo - Clean SIGNCOLLAB text only */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-black text-xl tracking-tight text-black uppercase">
            SIGNCOLLAB
          </span>
        </Link>

        {/* Center Navigation Links - Desktop Only */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-700">
          {navLinks.map((link) => {
            const isActive = currentPath === link.href || (link.href !== "/" && currentPath.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-black ${
                  isActive ? "text-black font-bold border-b-2 border-black pb-0.5" : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

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
