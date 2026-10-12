import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCompanyConfig } from "@/lib/config";

export function PublicFooter() {
  const company = getCompanyConfig();

  const productLinks = [
    { label: "Rate Radar (Valuation)", href: "/influencer-rate-calculator" },
    { label: "Instant Contracts (e-Sign)", href: "/instant" },
    { label: "Verify Document (SHA-256)", href: "/verify" },
    { label: "Platform Features", href: "/features" },
    { label: "Pricing & Plans", href: "/pricing" },
  ];

  const resourceLinks = [
    { label: "Knowledge Base", href: "/knowledge" },
    { label: "Creator Directory", href: "/creators" },
    { label: "Pricing Index Survey", href: "/survey" },
    { label: "Multi-Platform Valuation", href: "/influencer-rate-calculator" },
  ];

  const companyLinks = [
    { label: "About Us", href: "/about" },
    { label: "Vision & Mission", href: "/vision" },
    { label: "Contact & Support", href: "/contact" },
    { label: "Terms of Service", href: "/terms" },
  ];

  return (
    <footer className="w-full border-t border-zinc-200/80 bg-white z-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Column (Span 2 columns on lg) */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-4 text-left">
            <Link href="/" className="inline-block">
              <span className="font-black text-xl tracking-tight text-zinc-950 uppercase font-display hover:opacity-85 transition-opacity">
                SIGNCOLLAB
              </span>
            </Link>
            
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed max-w-sm font-medium">
              The commercial agreement and rate valuation operating system for creators, brands, and agencies. Enforce bilateral terms, calculate empirical deliverable rates, and audit digital signatures with cryptographic proof.
            </p>

            {/* Operational Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200/80 text-[11px] font-semibold text-zinc-700">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
              <span className="text-zinc-300">•</span>
              <span className="font-mono text-zinc-500">v2.0</span>
            </div>
          </div>

          {/* Column 1: Products & Tools */}
          <div className="text-left space-y-3">
            <span className="text-[11px] font-bold text-zinc-950 uppercase tracking-wider font-mono block">
              Products &amp; Tools
            </span>
            <ul className="space-y-2.5 text-xs font-medium text-zinc-600">
              {productLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-zinc-950 transition-colors block py-0.5">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Resources & Data */}
          <div className="text-left space-y-3">
            <span className="text-[11px] font-bold text-zinc-950 uppercase tracking-wider font-mono block">
              Resources &amp; Data
            </span>
            <ul className="space-y-2.5 text-xs font-medium text-zinc-600">
              {resourceLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-zinc-950 transition-colors block py-0.5">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company & Governance */}
          <div className="text-left space-y-3">
            <span className="text-[11px] font-bold text-zinc-950 uppercase tracking-wider font-mono block">
              Company &amp; Legal
            </span>
            <ul className="space-y-2.5 text-xs font-medium text-zinc-600">
              {companyLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-zinc-950 transition-colors block py-0.5">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link href="/login" className="font-bold text-zinc-950 hover:underline inline-flex items-center gap-1 py-0.5">
                  <span>Workspace Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500" strokeWidth={2} />
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal / Copyright Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span>© {new Date().getFullYear()} SignCollab. All rights reserved.</span>
            <span className="hidden sm:inline text-zinc-300">•</span>
            <span>US ESIGN &amp; Global eIDAS Compliance Standard</span>
          </div>

          <div className="font-mono text-[11px] text-zinc-400">
            {company.supportEmail}
          </div>
        </div>
      </div>
    </footer>
  );
}
