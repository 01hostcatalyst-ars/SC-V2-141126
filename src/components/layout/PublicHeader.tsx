"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Activity,
  CreditCard,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  BookOpen,
  Tag,
  CheckCircle2,
  Users,
} from "lucide-react";

export interface PublicHeaderProps {
  activeRoute?: string;
  authButton?: React.ReactNode;
  rightBadge?: React.ReactNode;
}

interface ToolItem {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  accentColor: string;
  badge?: string;
  isExternal?: boolean;
  activePattern?: RegExp;
}

const SUITE_TOOLS: ToolItem[] = [
  {
    id: "creators",
    name: "Creator Directory",
    description: "Database of 1,500+ multi-platform creators, rates & reach",
    href: "/creators",
    icon: Users,
    accentColor: "text-blue-600 bg-blue-50 border-blue-200/80",
    badge: "Active",
    activePattern: /^\/creators/,
  },
  {
    id: "contracts",
    name: "Commercial Agreements",
    description: "Instant 1-page bilateral contracts with global compliance",
    href: "/instant",
    icon: FileText,
    accentColor: "text-emerald-600 bg-emerald-50 border-emerald-200/80",
    badge: "Active",
    activePattern: /^\/(instant|c\/|contracts)/,
  },
  {
    id: "radar",
    name: "Influencer Valuation Radar",
    description: "16-knot empirical rate engine & cross-platform telemetry",
    href: "/influencer-rate-calculator",
    icon: Activity,
    accentColor: "text-amber-600 bg-amber-50 border-amber-200/80",
    badge: "Active",
    activePattern: /^\/(influencer-rate-calculator|calculator|scrapers)/,
  },
  {
    id: "invoicing",
    name: "Milestone Payouts & Escrow",
    description: "Commercial deliverables release & automated tax withholding",
    href: "#",
    icon: CreditCard,
    accentColor: "text-zinc-500 bg-zinc-100 border-zinc-200",
    badge: "Coming Soon",
  },
  {
    id: "mediakit",
    name: "Dynamic Media Kit",
    description: "Live-audited creator portfolio with verified audience stats",
    href: "#",
    icon: Sparkles,
    accentColor: "text-zinc-500 bg-zinc-100 border-zinc-200",
    badge: "Coming Soon",
  },
];

const NAV_LINKS = [
  { name: "Creators", href: "/creators", icon: Users },
  { name: "Pricing", href: "/pricing", icon: Tag },
  { name: "Academy", href: "/knowledge", icon: BookOpen },
  { name: "Verify", href: "/verify", icon: ShieldCheck },
];

export function PublicHeader({
  activeRoute,
  authButton,
  rightBadge,
}: PublicHeaderProps) {
  const pathname = usePathname() || activeRoute || "/";
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsToolsOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsToolsOpen(false);
  }, [pathname]);

  // Determine current active tool for indicator
  const activeTool = SUITE_TOOLS.find((tool) =>
    tool.activePattern?.test(pathname)
  );

  return (
    <header className="w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* ========================================================= */}
        {/* LEFT: BRAND IDENTITY & SUITE TOOLS SWITCHER             */}
        {/* ========================================================= */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center group cursor-pointer select-none">
            <span className="font-black text-base sm:text-lg tracking-tight text-zinc-950 uppercase font-display hover:opacity-85 transition-opacity">
              SIGNCOLLAB
            </span>
          </Link>

          {/* Slash Separator */}
          <span className="text-zinc-300 font-light text-base select-none hidden md:inline">/</span>

          {/* Suite Tools Switcher Dropdown */}
          <div className="relative hidden md:block" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none ${
                isToolsOpen
                  ? "bg-zinc-100 text-zinc-950 border-zinc-300 shadow-2xs"
                  : "bg-zinc-50/70 text-zinc-700 border-zinc-200/80 hover:bg-zinc-100 hover:text-zinc-950 hover:border-zinc-300"
              }`}
              aria-expanded={isToolsOpen}
            >
              <span className="truncate max-w-[150px]">
                {activeTool ? activeTool.name : "Suite Tools"}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-150 ${
                  isToolsOpen ? "rotate-180 text-zinc-950" : ""
                }`}
                strokeWidth={2}
              />
            </button>

            {/* Dropdown Menu */}
            {isToolsOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 rounded-xl bg-white border border-zinc-200/90 shadow-2xl p-2 z-50 surface-elevated animate-fadeIn">
                <div className="px-2 py-1.5 border-b border-zinc-100 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Creator Economy Operating Tools
                  </span>
                </div>
                <div className="space-y-1">
                  {SUITE_TOOLS.map((tool) => {
                    const IconComponent = tool.icon;
                    const isAvailable = tool.badge === "Active";
                    const isCurrent = activeTool?.id === tool.id;

                    const Content = (
                      <div
                        className={`flex items-start gap-3 p-2.5 rounded-lg text-left transition-all ${
                          isAvailable
                            ? isCurrent
                              ? "bg-zinc-100/90 border border-zinc-200"
                              : "hover:bg-zinc-50 cursor-pointer"
                            : "opacity-60 cursor-not-allowed"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${tool.accentColor}`}
                        >
                          <IconComponent className="w-4 h-4" strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-zinc-950 truncate">
                              {tool.name}
                            </span>
                            {tool.badge && (
                              <span
                                className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  tool.badge === "Active"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-zinc-100 text-zinc-600"
                                }`}
                              >
                                {tool.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 line-clamp-1 leading-snug mt-0.5">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    );

                    return isAvailable ? (
                      <Link
                        key={tool.id}
                        href={tool.href}
                        onClick={() => setIsToolsOpen(false)}
                      >
                        {Content}
                      </Link>
                    ) : (
                      <div key={tool.id}>{Content}</div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER: DESKTOP NAVIGATION LINKS                         */}
        {/* ========================================================= */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link
            href="/influencer-rate-calculator"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              pathname.includes("calculator") || pathname.includes("scrapers")
                ? "bg-zinc-100 text-zinc-950 font-bold"
                : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
            }`}
          >
            Rate Radar
          </Link>
          <Link
            href="/instant"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              pathname === "/instant" || pathname.startsWith("/c/")
                ? "bg-zinc-100 text-zinc-950 font-bold"
                : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
            }`}
          >
            Instant Contracts
          </Link>
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-zinc-100 text-zinc-950 font-bold"
                    : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* ========================================================= */}
        {/* RIGHT: CTAs, AUTH & MOBILE HAMBURGER                      */}
        {/* ========================================================= */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {rightBadge}

          {/* Auth Button or Direct Sign In Link */}
          {authButton ? (
            authButton
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold px-3 py-2 rounded-lg text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors whitespace-nowrap hidden sm:inline-block"
            >
              Sign In
            </Link>
          )}

          {/* Primary Action Button (Desktop & Tablet only, cleanly hidden on mobile) */}
          <Link
            href="/instant"
            className="hidden sm:inline-flex px-3.5 py-2 text-xs font-bold rounded-lg bg-zinc-950 text-white hover:bg-zinc-900 transition-all shadow-sm hover:shadow whitespace-nowrap items-center gap-1.5 cursor-pointer"
          >
            <span>Create Free Contract</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" strokeWidth={2} />
          </Link>

          {/* Mobile Hamburger Button (Touch target >= 44px) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-zinc-800 hover:text-zinc-950 hover:bg-zinc-100 transition-colors focus:outline-none cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px]"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open navigation menu"}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-zinc-900" strokeWidth={2.5} />
            ) : (
              <Menu className="w-5 h-5 text-zinc-900" strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE DRAWER (Touch Targets >= 44px)                      */}
      {/* ========================================================= */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200/80 bg-white/98 backdrop-blur-md px-4 py-5 shadow-2xl space-y-4 animate-fadeIn">
          {/* Mobile Top Primary Action Button */}
          <Link
            href="/instant"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full py-3 px-4 rounded-xl bg-zinc-950 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
          >
            <span>Create Free Contract</span>
            <ArrowRight className="w-4 h-4 text-zinc-400" strokeWidth={2} />
          </Link>
          {/* Suite Tools Section */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block px-1">
              Creator Operating Tools
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {SUITE_TOOLS.filter((t) => t.badge === "Active").map((tool) => {
                const IconComponent = tool.icon;
                const isCurrent = activeTool?.id === tool.id;
                return (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all min-h-[44px] ${
                      isCurrent
                        ? "bg-zinc-100 border-zinc-300"
                        : "bg-white border-zinc-200/70 hover:bg-zinc-50"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${tool.accentColor}`}
                    >
                      <IconComponent className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-xs font-bold text-zinc-950">{tool.name}</div>
                      <div className="text-[11px] text-zinc-500 line-clamp-1">{tool.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-1 pt-2 border-t border-zinc-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block px-1 mb-1">
              Navigation
            </span>
            {NAV_LINKS.map((link) => {
              const IconComp = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 min-h-[44px] transition-colors"
                >
                  <IconComp className="w-4 h-4 text-zinc-500" strokeWidth={2} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Bottom Sign In */}
          <div className="pt-3 border-t border-zinc-100 flex flex-col gap-2">
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 rounded-lg border border-zinc-200 text-xs font-bold text-center text-zinc-800 hover:bg-zinc-50 min-h-[44px] flex items-center justify-center"
            >
              Sign In to Workspace
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

// Re-export alias for semantic clarity
export { PublicHeader as SuiteHeader };
