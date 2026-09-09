import React from "react";
import Link from "next/link";
import { getCompanyConfig } from "@/lib/config";

export function PublicFooter() {
  const company = getCompanyConfig();

  const footerLinks = [
    { label: "Home", href: "/" },
    { label: "Rate Calculator", href: "/influencer-rate-calculator" },
    { label: "About Us", href: "/about" },
    { label: "Vision & Mission", href: "/vision" },
    { label: "Knowledge Base", href: "/knowledge" },
    { label: "Pricing Index Survey", href: "/survey" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Verify Document", href: "/verify" },
    { label: "Terms & Privacy", href: "/terms" },
    { label: "Contact & Support", href: "/contact" },
  ];

  return (
    <footer className="w-full border-t border-zinc-200/80 bg-white/90 backdrop-blur-md py-10 px-6 z-10 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-zinc-950 text-white flex items-center justify-center font-bold text-[10px]">
              BB
            </div>
            <span className="font-black text-sm tracking-tight text-zinc-950 uppercase font-display">
              BrandBridge
            </span>
            <span className="text-zinc-300 font-light">•</span>
            <span className="text-xs text-zinc-500 font-semibold">SignCollab Proof Layer</span>
          </div>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            The Commercial Operating System for Creators, Brands &amp; Agencies.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-zinc-600">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-zinc-950 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/login" className="hover:text-zinc-950 text-zinc-900 font-bold transition-colors">
            Workspace Sign In
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-zinc-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-2 text-center sm:text-left">
        <span>
          © {new Date().getFullYear()} BrandBridge (SignCollab). All rights reserved.
        </span>
        <span className="text-zinc-400 font-mono text-[11px]">
          {company.supportEmail}
        </span>
      </div>
    </footer>
  );
}
