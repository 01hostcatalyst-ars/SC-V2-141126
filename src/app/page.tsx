import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getCompanyConfig } from "@/lib/config";
import { HomeAuthCard } from "@/components/home/HomeAuthCard";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

export const metadata: Metadata = {
  title: "SignCollab | Creator Agreement & e-Signature Proof Layer",
  description:
    "SignCollab is the commercial agreement proof layer for creators, brands, and agencies. Generate bilaterally signed digital contracts, enforce campaign terms, and secure audit trails with global e-signature compliance.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SignCollab | Creator Agreement & e-Signature Proof Layer",
    description:
      "Formalize creator-brand partnerships and secure bilaterally signed audit trails with global electronic signature compliance.",
    url: baseUrl,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SignCollab | Creator Agreement & e-Signature Proof Layer",
    description:
      "Formalize creator-brand partnerships and secure bilaterally signed audit trails with global electronic signature compliance.",
  },
};

export default function Home() {
  const company = getCompanyConfig();

  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-hidden">
      {/* Background ambient glow shapes */}
      <div className="absolute top-[10%] left-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-purple pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-blue pointer-events-none z-0" />

      {/* Header + Auth Card — client component (needs shared auth tab state) */}
      <HomeAuthCard company={company}>
        {/* Column 1: Info Column — server-rendered, passed as children */}
        <div className="flex flex-col text-left space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-900 border border-emerald-300 w-fit">
            Instant 1-Page Contracts Now Available • No Signup Required
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-black leading-tight tracking-tight">
            Bilateral Contracts.<br />
            <span className="text-accent-gradient">Secure Evidence.</span>
          </h1>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed max-w-xl">
            Stop executing commercial social media partnerships via transient chat logs. 
            <strong> {company.name}</strong> provides a simple, bilateral proof-layer with tamper-proof signature logs and cryptographic audit trails compliant with global electronic signature standards.
          </p>

          {/* Badges system */}
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="px-3 py-1 rounded-md text-xs font-bold border bg-blue-50 border-blue-200 text-blue-800">
              #Creator
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-bold border bg-emerald-50 border-emerald-200 text-emerald-800">
              #Brand
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-bold border bg-orange-50 border-orange-200 text-orange-800">
              #Agency
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-bold border bg-amber-50 border-amber-200 text-amber-800">
              #GlobalCompliance
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-bold border bg-rose-50 border-rose-200 text-rose-800">
              #SignedPDF
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-200/80 pt-6 mt-2">
            <div>
              <h4 className="text-xl font-bold text-black">Guest Mode</h4>
              <p className="text-xs text-gray-500 mt-1">2 free instant contracts per day per email without signing up.</p>
            </div>
            <div>
              <h4 className="text-xl font-bold text-black">Audit Trails</h4>
              <p className="text-xs text-gray-500 mt-1">Includes SHA-256 integrity check and device identifiers.</p>
            </div>
          </div>
        </div>
      </HomeAuthCard>

      {/* Footer — fully server-rendered */}
      <footer className="w-full border-t border-gray-200/80 bg-white/80 backdrop-blur-md py-8 px-6 z-10 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
            <span className="font-bold text-sm tracking-tight text-black uppercase">
              {company.name}
            </span>
            <p className="text-xs text-gray-500 font-medium">
              Bilateral Agreement Proof-Layer &amp; Tamper-Proof Audit Trails
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-gray-600">
            <Link href="/knowledge" className="hover:text-black transition-colors">
              Knowledge Base
            </Link>
            <Link href="/survey" className="hover:text-emerald-600 transition-colors text-emerald-700 font-bold">
              Pricing Index Survey
            </Link>
            <Link href="/features" className="hover:text-black transition-colors">
              Features
            </Link>
            <Link href="/verify" className="hover:text-black transition-colors">
              Verify Document
            </Link>
            <Link href="/terms" className="hover:text-black transition-colors">
              Terms &amp; Privacy
            </Link>
            <a href={`mailto:${company.supportEmail}`} className="hover:text-black transition-colors">
              Support
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-gray-100 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2 text-center sm:text-left">
          <span>
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </span>
          <span className="text-gray-400 font-medium">
            {company.supportEmail}
          </span>
        </div>
      </footer>
    </div>
  );
}
