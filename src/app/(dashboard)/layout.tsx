"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProtectedRoute, useAuth } from "@/components/layout/ProtectedRoute";
import { getCompanyConfig } from "@/lib/config";

const NAV_LINKS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
      </svg>
    ),
  },
  {
    name: "My Contracts",
    href: "/contracts",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    name: "Create Contract",
    href: "/contracts/new",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    name: "Profile & Settings",
    href: "/profile",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const company = getCompanyConfig();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "CREATOR":
        return <span className="text-[9px] font-black px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 uppercase tracking-wider">CREATOR</span>;
      case "BRAND":
        return <span className="text-[9px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 uppercase tracking-wider">BRAND</span>;
      case "AGENCY":
        return <span className="text-[9px] font-black px-2 py-0.5 rounded bg-orange-100 text-orange-900 border border-orange-200 uppercase tracking-wider">AGENCY</span>;
      default:
        return <span className="text-[9px] font-black px-2 py-0.5 rounded bg-gray-100 text-gray-900 border border-gray-200 uppercase tracking-wider">{role}</span>;
    }
  };

  const navContent = (
    <div className="flex flex-col flex-1 justify-between p-4 space-y-6">
      <div className="space-y-4">
        {/* Primary Sidebar Action CTA */}
        <Link href="/contracts/new" onClick={() => setMobileMenuOpen(false)}>
          <button className="w-full bg-black hover:bg-gray-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Create New Agreement</span>
          </button>
        </Link>

        {/* Menu Navigation */}
        <nav className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-3 mb-2 block">
            Workspace Navigation
          </span>
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-600 hover:text-black hover:bg-gray-100/80"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {link.icon}
                  <span>{link.name}</span>
                </div>
                {link.name === "My Contracts" && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? "bg-emerald-400 text-black" : "bg-gray-200 text-gray-700"}`}>
                    Active
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Monthly Plan Quota Meter Widget */}
        <div className="p-3.5 bg-gradient-to-br from-slate-900 to-black text-white rounded-2xl border border-gray-800 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
              Professional Plan
            </span>
            <Link href="/pricing" className="text-[10px] font-bold text-gray-400 hover:text-white underline">
              Upgrade
            </Link>
          </div>
          <div className="text-xs font-bold text-gray-200">
            14 / 250 Agreements Used
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: "5.6%" }} />
          </div>
          <p className="text-[10px] text-gray-400 font-medium leading-none pt-0.5">
            5.6% monthly quota used • 236 remaining
          </p>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="pt-4 border-t border-gray-200/80 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-black text-sm uppercase shadow-sm">
            {user?.name[0]}
          </div>
          <div className="flex flex-col text-left overflow-hidden min-w-0">
            <span className="text-xs font-bold text-black truncate">{user?.name}</span>
            <div className="mt-0.5">{getRoleBadge(user?.role || "")}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200/60 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col md:flex-row relative text-left">
      {/* Ambient background glow shapes */}
      <div className="absolute top-[10%] left-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-purple pointer-events-none z-0 opacity-40 blur-3xl" />
      <div className="absolute bottom-[10%] right-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-blue pointer-events-none z-0 opacity-30 blur-3xl" />

      {/* Mobile Top Header */}
      <header className="md:hidden w-full h-16 border-b border-gray-200/80 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-30 sticky top-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-black text-xl tracking-tight text-black uppercase">
            {company.name}
          </span>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 uppercase">
            Workspace
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl border border-gray-200 text-black hover:bg-gray-100 focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-gray-200/80 bg-white/90 backdrop-blur-md h-screen sticky top-0 flex-col z-20 shadow-sm">
        {/* Sidebar Brand Header */}
        <div className="h-16 border-b border-gray-200/80 flex items-center px-6 justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-black text-xl tracking-tight text-black uppercase">
              {company.name}
            </span>
          </Link>
          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-wider">
            APP
          </span>
        </div>
        {navContent}
      </aside>

      {/* Mobile Menu Panel Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col top-16 bg-white/95 backdrop-blur-md border-t border-gray-200 overflow-y-auto">
          {navContent}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 z-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ProtectedRoute>
  );
}
