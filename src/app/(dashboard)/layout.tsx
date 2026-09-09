"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { ProtectedRoute, useAuth } from "@/components/layout/ProtectedRoute";
import { getCompanyConfig } from "@/lib/config";

const NAV_LINKS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-4 h-4" strokeWidth={2} />,
  },
  {
    name: "My Contracts",
    href: "/contracts",
    icon: <FileText className="w-4 h-4" strokeWidth={2} />,
  },
  {
    name: "Create Contract",
    href: "/contracts/new",
    icon: <PlusCircle className="w-4 h-4" strokeWidth={2} />,
  },
  {
    name: "Profile & Settings",
    href: "/profile",
    icon: <Settings className="w-4 h-4" strokeWidth={2} />,
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
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 uppercase tracking-wider">CREATOR</span>;
      case "BRAND":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 uppercase tracking-wider">BRAND</span>;
      case "AGENCY":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-900 border border-orange-200 uppercase tracking-wider">AGENCY</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-900 border border-gray-200 uppercase tracking-wider">{role}</span>;
    }
  };

  const navContent = (
    <div className="flex flex-col flex-1 justify-between p-5 space-y-6">
      <div>
        {/* Primary Sidebar Action CTA - Emerald Accent to differentiate from black Nav tabs */}
        <div className="mb-6">
          <Link href="/contracts/new" onClick={() => setMobileMenuOpen(false)}>
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Create New Agreement</span>
            </button>
          </Link>
        </div>

        {/* Menu Navigation with Generous Spacing */}
        <nav className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-3 block">
            Workspace Navigation
          </span>
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive
                  ? "bg-black text-white shadow-sm"
                  : "text-gray-600 hover:text-black hover:bg-gray-100/80"
                  }`}
              >
                <div className="flex items-center gap-3">
                  {link.icon}
                  <span>{link.name}</span>
                </div>
                {link.name === "My Contracts" && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-emerald-400 text-black" : "bg-gray-200 text-gray-700"}`}>
                    Active
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Monthly Plan Quota Meter Widget */}
        <div className="mt-8 p-4 bg-gradient-to-br from-slate-900 to-black text-white rounded-2xl border border-gray-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Professional Plan
            </span>
            <Link href="/pricing" className="text-[10px] font-semibold text-gray-400 hover:text-white underline">
              Upgrade
            </Link>
          </div>
          <div className="text-xs font-bold text-gray-200 font-display">
            14 / 250 Agreements Used
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: "5.6%" }} />
          </div>
          <p className="text-[10px] text-gray-400 font-medium leading-normal pt-0.5">
            5.6% monthly quota used • 236 remaining
          </p>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="pt-4 border-t border-gray-200/80 space-y-3 shrink-0">
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm shrink-0">
            {user?.name[0]}
          </div>
          <div className="flex flex-col text-left overflow-hidden min-w-0">
            <span className="text-xs font-bold text-black truncate">{user?.name}</span>
            <div className="mt-0.5">{getRoleBadge(user?.role || "")}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200/60 transition-colors"
        >
          <LogOut className="w-4 h-4" strokeWidth={2} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas flex flex-col md:flex-row relative text-left">
      {/* Mobile Top Header */}
      <header className="md:hidden w-full h-16 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md flex items-center justify-between px-5 z-30 sticky top-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold text-xs">
            BB
          </div>
          <span className="font-bold text-base tracking-tight text-zinc-950 uppercase font-display">
            {company.name}
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200 uppercase">
            Workspace
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg border border-zinc-200 text-zinc-950 hover:bg-zinc-100 focus:outline-none cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" strokeWidth={2} />
          ) : (
            <Menu className="w-5 h-5" strokeWidth={2} />
          )}
        </button>
      </header>

      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-gray-200/80 bg-white/90 backdrop-blur-md h-screen sticky top-0 flex-col z-20 shadow-sm">
        {/* Sidebar Brand Header */}
        <div className="h-16 border-b border-gray-200/80 flex items-center px-6 justify-between shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight text-black uppercase font-display">
              {company.name}
            </span>
          </Link>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-wider">
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
        <div className="max-w-6xl mx-auto w-full space-y-10">
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
