"use client";

import React from "react";
import Link from "next/link";
import { getCompanyConfig } from "@/lib/config";

export default function FeaturesPage() {
  const company = getCompanyConfig();

  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-hidden text-left">
      {/* Background ambient glow shapes */}
      <div className="absolute top-[10%] left-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-purple pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-blue pointer-events-none z-0" />

      {/* Header */}
      <header className="w-full h-16 border-b border-gray-200/60 bg-white/70 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:flex w-8 h-8 rounded-lg bg-black items-center justify-center font-bold text-white text-base shrink-0">
            {company.name[0]}
          </span>
          <span className="font-bold text-base sm:text-lg text-black tracking-tight uppercase">
            {company.name}
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs font-semibold px-4 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-black transition-colors"
        >
          ← Back to Home
        </Link>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 z-10 space-y-12">
        {/* Hero Section */}
        <div className="space-y-4 text-center sm:text-left">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-950 border border-emerald-200">
            Platform Architecture &amp; Capabilities
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-black leading-tight tracking-tight">
            How {company.name} Secures Your Campaigns
          </h1>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed max-w-2xl">
            A comprehensive, end-to-end breakdown of our bilateral contract execution flow, digital signatures, audit logs, and cryptographic verification layer.
          </p>
        </div>

        {/* Section 1: The Contract Creation Wizard Options */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-black uppercase tracking-wider border-b border-gray-100 pb-3">
            The Contract Creation Wizard: Every Option Explained
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            Verbal agreements and chat transcripts do not hold up in billing departments or courts. Here is how our 6-step creation wizard secures every detail of your deals:
          </p>

          <div className="space-y-6 mt-4">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">Step 1: Deliverables Specification</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Define the content format (Reel, Story, Post, YouTube Video, TikTok Short), post quantities, and retention deadlines (e.g. permanent vs. 30-day post duration).
              </p>
              <p className="text-[11px] text-emerald-800 font-semibold bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                <strong>Why it matters:</strong> Prevents creators from deleting campaign content early or claiming they did not agree to permanent feed placements.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">Step 2: Commercial Usage Rights Scope</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Determine exactly where the brand can re-use the creator&apos;s intellectual property (Organic reposts, Paid digital ads, Print/Out-of-home billboards, or Full broadcast media) and for how long (e.g., 30 Days, 6 Months, or Perpetuity).
              </p>
              <p className="text-[11px] text-emerald-800 font-semibold bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                <strong>Why it matters:</strong> Ensures brands don&apos;t run creator content as paid advertisements indefinitely without paying secondary licensing fees.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">Step 3: Financial Milestones &amp; Payout Routes</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Input total valuation, optional advance deposit requirements, and specific due dates. The system locks in the payout route method selected (Direct Bank IBAN, JazzCash Mobile, or EasyPaisa Mobile) and account details.
              </p>
              <p className="text-[11px] text-emerald-800 font-semibold bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                <strong>Why it matters:</strong> Protects creators from billing payment defaults. Binding payout routes inside the signed contract prevents payment details interception or email payment fraud.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">Step 4: Turnaround, Deemed Approval &amp; Product Shipment</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Includes delivery turnaround times, maximum revision rounds, product shipment details (Provision vs. Loan), damage fees, and the 48-Hour Deemed Approval Protocol.
              </p>
              <p className="text-[11px] text-emerald-800 font-semibold bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                <strong>Why it matters:</strong> The 48-hour deemed approval stops brands from holding creator content hostage by ignoring drafts. Product loan return clauses prevent creators from keeping high-value loan items without returning them.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">Step 5: Bilateral Safeguard Penalties</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Define late payment fees (% per day), late content delivery penalties, pre-delivery cancellation fees, and the 7-day non-delivery cutoff rule.
              </p>
              <p className="text-[11px] text-emerald-800 font-semibold bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                <strong>Why it matters:</strong> Establishes clear financial consequences. Late payment penalties keep brands accountable, and late delivery penalties protect brand marketing schedules.
              </p>
            </div>

            {/* Step 6 */}
            <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">Step 6: OTP Authentication</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Before any agreement draft can be published or shared for counterparty signing, the creator/brand initiator must complete a 6-digit email OTP (One-Time Password) check to verify their identity.
              </p>
              <p className="text-[11px] text-emerald-800 font-semibold bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                <strong>Why it matters:</strong> Establishes identity proof, stops spoofing, and logs the email address in the audit logs.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Contract PDF and Certificate PDF */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-black uppercase tracking-wider border-b border-gray-100 pb-3">
            Anatomy of the Tamper-Proof Document Pair
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            Once signed by both parties, {company.name} compiles the agreement into two distinct PDF documents that secure your legal rights:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">1. The Executed Agreement PDF</h3>
              <ul className="text-[11px] text-gray-600 space-y-1.5 leading-relaxed list-disc pl-4">
                <li>Bilateral terms compiled into standard formatting.</li>
                <li>Clear tables detailing deliverables, usage rights, and payment methods.</li>
                <li>Both party signatures, timestamps, and designators directly embedded.</li>
                <li>Governing law and ADR clauses mapped under applicable jurisdiction acts.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">2. The Audit Certificate PDF</h3>
              <ul className="text-[11px] text-gray-600 space-y-1.5 leading-relaxed list-disc pl-4">
                <li>Cryptographic SHA-256 hash of the master contract PDF.</li>
                <li>Verification log of both signatory emails, phone numbers, and job titles.</li>
                <li>Detailed timestamps and IP addresses for every action taken.</li>
                <li>Client user-agent string metadata identifying operating systems and devices.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 3: Verification System - How & Why It Works */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-black uppercase tracking-wider border-b border-gray-100 pb-3">
            The Verification Layer: How it Works &amp; Why it is Solid
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            Our verification module (accessible via `/verify`) offers two separate layers of security to prove that a document is authentic and unmodified:
          </p>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">Method A: Database Lookup Verification</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                By entering a contract&apos;s unique tracking token, anyone (auditor, billing team, lawyer) can look up the contract inside the platform. The system retrieves signature logs, execution dates, and active contract status directly from our database.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">Method B: Local Cryptographic File Hash Check</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Simply upload the contract PDF. Our page computes the SHA-256 hash locally in your browser before contacting our servers. This hash is compared against the database.
              </p>
              <p className="text-[11px] text-emerald-800 font-semibold bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                <strong>Why it is 100% Solid:</strong> Changing even a single comma, fee amount, or date alters the computed SHA-256 hash. If any tampering has occurred, the verification check fails instantly, identifying the document as modified.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/60 bg-white/70 backdrop-blur-md py-6 flex flex-col md:flex-row items-center justify-between px-6 gap-4 z-10">
        <span className="text-xs text-gray-500 font-semibold">
          © {new Date().getFullYear()} {company.name}. All rights reserved.
        </span>
        <div className="flex gap-4 items-center flex-wrap justify-center">
          <Link href="/features" className="text-xs text-black font-bold hover:underline">
            Features
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/verify" className="text-xs text-gray-600 hover:text-black font-semibold transition-colors">
            Verify Document
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/terms" className="text-xs text-gray-600 hover:text-black font-semibold transition-colors">
            Terms &amp; Privacy
          </Link>
          <span className="text-gray-300">|</span>
          <a href={`mailto:${company.supportEmail}`} className="text-xs text-gray-500 hover:text-black font-semibold transition-colors">
            Support: {company.supportEmail}
          </a>
        </div>
      </footer>
    </div>
  );
}
