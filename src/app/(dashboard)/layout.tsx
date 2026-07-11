"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProtectedRoute, useAuth } from "@/components/layout/ProtectedRoute";
import { getCompanyConfig } from "@/lib/config";

// List of shared navigation links used on both desktop and mobile
const NAV_LINKS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
      </svg>
    ),
  },
  {
    name: "Create Contract",
    href: "/contracts/new",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    name: "My Contracts",
    href: "/contracts",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    name: "Profile Settings",
    href: "/profile",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const company = getCompanyConfig();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleColorClass = (role: string) => {
    switch (role) {
      case "CREATOR":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "BRAND":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "AGENCY":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const navContent = (
    <div className="flex flex-col flex-1 justify-between">
      {/* Top Links */}
      <nav className="flex flex-col gap-1.5 px-4 py-6">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-2 block">
          Menu Navigation
        </span>
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                isActive
                  ? "bg-black text-white border-black"
                  : "text-gray-600 hover:text-black hover:bg-gray-100 border-transparent"
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Area */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm uppercase">
            {user?.name[0]}
          </div>
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-xs font-bold text-black truncate">{user?.name}</span>
            <span className={`w-fit text-[9px] font-extrabold px-2 py-0.5 rounded border mt-0.5 uppercase tracking-wider ${getRoleColorClass(user?.role || "")}`}>
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 border border-transparent transition-colors focus:outline-none"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Mobile Top Header */}
      <header className="md:hidden w-full h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 z-20 sticky top-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-black flex items-center justify-center font-bold text-white text-base">
            {company.name[0]}
          </span>
          <span className="font-bold text-base text-black tracking-tight uppercase">
            {company.name}
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg border border-gray-200 text-black hover:bg-gray-50 focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-gray-200/80 bg-white h-screen sticky top-0 flex-col z-10">
        {/* Sidebar Logo Header */}
        <div className="h-16 border-b border-gray-200/60 flex items-center px-6 gap-2">
          <span className="w-8 h-8 rounded-lg bg-black flex items-center justify-center font-bold text-white text-base">
            {company.name[0]}
          </span>
          <span className="font-bold text-base text-black tracking-tight uppercase">
            {company.name}
          </span>
        </div>
        {navContent}
      </aside>

      {/* Mobile Menu Panel Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex flex-col top-16 bg-white border-t border-gray-200">
          {navContent}
        </div>
      )}

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full">
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
