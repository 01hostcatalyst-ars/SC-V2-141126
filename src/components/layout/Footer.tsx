"use client";

import React from "react";
import Link from "next/link";
import { getCompanyConfig } from "@/lib/config";

export const Footer: React.FC = () => {
  const company = getCompanyConfig();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Branding label */}
        <div className="flex flex-col gap-2">
          <Link href="/" className="flex items-center gap-2 outline-none">
            <span className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center font-bold text-white text-[11px]">
              {company.name[0]}
            </span>
            <span className="font-display font-bold text-sm tracking-tight text-white">
              {company.name}
            </span>
          </Link>
          <span className="text-xs text-slate-500 max-w-sm">
            {company.legalInfo}
          </span>
        </div>

        {/* Action items/Legal Links */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs text-slate-400">
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <a href={`mailto:${company.supportEmail}`} className="hover:text-white transition-colors">
            Contact Support
          </a>
          <span className="text-slate-600">
            &copy; {year} {company.name}. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};
