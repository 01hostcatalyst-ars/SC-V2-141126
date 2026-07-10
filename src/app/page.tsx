"use client";

import React from "react";
import Link from "next/link";
import { getCompanyConfig } from "@/lib/config";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function Home() {
  const company = getCompanyConfig();

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 overflow-hidden relative">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

      <Header />

      {/* Hero Section */}
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/15 uppercase tracking-widest">
            🛡️ Admissible Evidence Under ETO 2002
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.1] text-white">
            Formalize Deals. Secure Evidence. <br />
            <span className="text-accent-gradient">Protect Collabs.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
            Stop negotiating vital commercial campaigns on temporary chat logs. {company.name} builds immutable, signed proof for creator-brand deals across Pakistan. No account setup required for brand signatures.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center max-w-md">
            <Link href="/signup" className="flex-1 sm:flex-none">
              <Button className="w-full sm:w-auto px-8 py-3">Get Started For Free</Button>
            </Link>
            <Link href="#features" className="flex-1 sm:flex-none">
              <Button variant="secondary" className="w-full sm:w-auto px-8 py-3">
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl w-full mt-16 border-t border-slate-900 pt-10">
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-extrabold text-white">100%</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Free to Try</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-extrabold text-white">ETO 2002</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Admissible Evidence</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-extrabold text-white">PKR 0</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hidden Fees</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-extrabold text-white">100%</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tamper-Proof</span>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 mt-12">
          <div className="flex flex-col items-center text-center gap-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-400">Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Designed For the Pakistani Creator Economy
            </h2>
            <p className="text-sm text-slate-500 max-w-xl">
              We solve the core friction points of WhatsApp agreements with structured proof fields.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="flex flex-col gap-4 text-left">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg">
                ✍️
              </div>
              <h3 className="text-lg font-bold text-slate-100">Bilateral Signatures</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Both parties sign capturing server-side timestamps, IP logs, and user-agent metadata. Direct verification closes agent/PA proxy loopholes.
              </p>
            </Card>

            <Card className="flex flex-col gap-4 text-left">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center font-bold text-lg">
                📐
              </div>
              <h3 className="text-lg font-bold text-slate-100">Structured Usage Rights</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Explicit terms for platforms allowed, whitelisting/paid ad usage rights, revision counts, and campaign durations to eliminate quality dispute arguments.
              </p>
            </Card>

            <Card className="flex flex-col gap-4 text-left">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg">
                ⚡
              </div>
              <h3 className="text-lg font-bold text-slate-100">Bilateral Penalties</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Establish late payment penalties for brand delays and late delivery penalties for creator delays at a 3%/day default rate to protect performance.
              </p>
            </Card>
          </div>
        </section>

        {/* Legality Section */}
        <section id="legal" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900 text-center">
          <Card className="flex flex-col items-center gap-6 p-8 md:p-12">
            <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center text-xl">
              ⚖️
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Legal Admissibility in Pakistan</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
              Under Pakistan&apos;s Electronic Transactions Ordinance (ETO 2002), electronic records, signatures, and verified consent logs hold strong legal standing in disputes. {company.name} compiles and locks these metadata points in a clean, tamper-evident audit trail PDF delivered directly to your inbox.
            </p>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Neutral Record-Keeping Agency. No Legal Opinion or Mediation Offered.
            </span>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
