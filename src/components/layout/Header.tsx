"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getCompanyConfig } from "@/lib/config";
import { Button } from "@/components/ui/Button";

export const Header: React.FC = () => {
  const company = getCompanyConfig();
  const [isOpen, setIsOpen] = useState(false);

  // Note: authSession check can be wired here later
  const isLoggedIn = false; 

  return (
    <header className="fixed top-0 left-0 w-full z-40 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo Branding */}
        <Link href="/" className="flex items-center gap-2 outline-none">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center font-bold text-white text-base shadow-lg shadow-blue-500/20">
            {company.name[0]}
          </span>
          <span className="font-display font-bold text-lg tracking-tight text-white">
            {company.name}
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
            Overview
          </Link>
          <Link href="#features" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#legal" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
            Legality
          </Link>
          <a href={`mailto:${company.supportEmail}`} className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
            Support
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button variant="secondary">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-900 bg-slate-950 px-4 py-4 flex flex-col gap-4">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Overview
          </Link>
          <Link
            href="#features"
            onClick={() => setIsOpen(false)}
            className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Features
          </Link>
          <Link
            href="#legal"
            onClick={() => setIsOpen(false)}
            className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Legality
          </Link>
          <a
            href={`mailto:${company.supportEmail}`}
            onClick={() => setIsOpen(false)}
            className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Support
          </a>
          <hr className="border-slate-900 my-1" />
          {isLoggedIn ? (
            <Link href="/dashboard" onClick={() => setIsOpen(false)}>
              <Button variant="secondary" className="w-full">Dashboard</Button>
            </Link>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full">Sign In</Button>
              </Link>
              <Link href="/signup" onClick={() => setIsOpen(false)}>
                <Button variant="primary" className="w-full">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
