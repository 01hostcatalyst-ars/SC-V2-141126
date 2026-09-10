"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  FileText,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export function WorkflowBridgeSection() {
  const steps = [
    {
      num: "01",
      title: "Audit & Value Any Handle",
      subtitle: "Empirical Rate Radar",
      description:
        "Input any public Instagram, YouTube, or TikTok profile. Our 16-knot engine strips pinned media outliers, calculates view velocity, and calibrates deliverable rates against regional GDP PPP.",
      icon: Activity,
      accentColor: "text-amber-600 bg-amber-50 border-amber-200/80",
      cta: "Try Calculator",
      ctaLink: "/influencer-rate-calculator",
    },
    {
      num: "02",
      title: "Draft Bilateral 1-Page Terms",
      subtitle: "Smart Contract Engine",
      description:
        "Select your commercial relationship (Creator ↔ Brand or Agency). Lock deliverable scope, exclusivity embargoes, paid ad whitelisting rights, and 48-hour deemed approval protections.",
      icon: FileText,
      accentColor: "text-emerald-600 bg-emerald-50 border-emerald-200/80",
      cta: "Create Free Contract",
      ctaLink: "/instant",
    },
    {
      num: "03",
      title: "Cryptographic Settlement",
      subtitle: "SHA-256 Audit Trail",
      description:
        "Both parties authenticate via mandatory 6-digit email OTP and execute digital signatures. Instant tamper-proof PDF audit certificates are minted with microsecond UTC timestamps and device hashes.",
      icon: ShieldCheck,
      accentColor: "text-zinc-950 bg-zinc-100 border-zinc-200",
      cta: "Verify a Document",
      ctaLink: "/verify",
    },
  ];

  return (
    <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 text-left">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
          End-to-End Infrastructure
        </span>
        <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-950 font-display tracking-tight">
          How the Workflow Bridge Works.
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 font-medium leading-relaxed">
          The creator economy moves too fast for 20-page legal retainers. We condense the entire commercial partnership pipeline into three seamless steps.
        </p>
      </div>

      {/* 3 Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {steps.map((step, idx) => {
          const IconComp = step.icon;
          return (
            <div
              key={step.num}
              className="bg-white border border-zinc-200/90 rounded-2xl p-7 shadow-sm flex flex-col justify-between space-y-6 surface-card relative"
            >
              <div className="space-y-4">
                {/* Step Number & Icon */}
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center ${step.accentColor}`}
                  >
                    <IconComp className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <span className="font-mono text-xs font-bold text-zinc-400">
                    STEP {step.num}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
                    {step.subtitle}
                  </span>
                  <h3 className="text-base font-semibold text-zinc-950 mt-1">
                    {step.title}
                  </h3>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-100">
                <Link
                  href={step.ctaLink}
                  className="text-xs font-bold text-zinc-950 hover:text-emerald-700 transition-colors inline-flex items-center gap-1.5 group cursor-pointer"
                >
                  <span>{step.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-700 transition-colors" strokeWidth={2} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
