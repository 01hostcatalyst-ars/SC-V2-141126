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
    <footer className="w-full border-t border-gray-200/80 bg-white/80 backdrop-blur-md py-8 px-6 z-10 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
          <span className="font-bold text-sm tracking-tight text-black uppercase">
            SIGNCOLLAB
          </span>
          <p className="text-xs text-gray-500 font-medium">
            Bilateral Agreement Proof-Layer &amp; Tamper-Proof Audit Trails
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-gray-600">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-black transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-gray-100 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2 text-center sm:text-left">
        <span>
          © {new Date().getFullYear()} SignCollab. All rights reserved.
        </span>
        <span className="text-gray-400 font-medium">
          {company.supportEmail}
        </span>
      </div>
    </footer>
  );
}
