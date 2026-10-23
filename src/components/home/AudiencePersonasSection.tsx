"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  UserCheck,
  Building2,
  Briefcase,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export function AudiencePersonasSection() {
  const personas = [
    {
      id: "creators",
      badge: "For Creators",
      badgeStyle: "bg-purple-50 text-purple-700 border-purple-200",
      icon: UserCheck,
      iconColor: "text-purple-600 bg-purple-50",
      headline: "Know your worth. Protect your intellectual property.",
      description:
        "Stop letting brands underpay you or exploit your content rights. Defend your rate card with empirical metrics and execute protective bilateral agreements.",
      points: [
        "Defensible rate benchmarks based on view velocity & retention",
        "Enforced 48-hour deemed approval to stop endless revision cycles",
        "Capped paid whitelisting and clear usage duration rights",
        "Advance deposit terms to guarantee payment before production",
      ],
      link: "/influencer-rate-calculator",
      linkText: "Audit Your Rates Free",
    },
    {
      id: "brands",
      badge: "For Brands & Marketers",
      badgeStyle: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: Building2,
      iconColor: "text-indigo-600 bg-indigo-50",
      headline: "Hire verified talent. Eliminate pricing guesswork.",
      description:
        "Skip vanity follower metrics and cold DM chaos. Discover vetted creators with audited engagement, fair market pricing, and standardized commercial contracts.",
      points: [
        "Access 3,000+ indexed profiles across YouTube, Instagram & TikTok",
        "Empirical CPM valuations with geographic PPP adjustments",
        "Pre-cleared 1-page bilateral contracts ready to sign in 60s",
        "Protection against non-delivery and unapproved deliverables",
      ],
      link: "/creators",
      linkText: "Search Creator Directory",
    },
    {
      id: "agencies",
      badge: "For Talent Agencies",
      badgeStyle: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Briefcase,
      iconColor: "text-blue-600 bg-blue-50",
      headline: "Standardize terms. Scale client campaigns.",
      description:
        "Streamline operations across your entire creator roster. Standardize commercial agreement terms, remove negotiation friction, and generate client-ready reports.",
      points: [
        "Unified contractual terms across your entire creator roster",
        "Eliminate back-and-forth contract markups with legal clauses",
        "Defend proposal rate cards with independent third-party models",
        "SHA-256 audit certificates for client governance and compliance",
      ],
      link: "/features",
      linkText: "Explore Agency Suite",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white border-t border-zinc-200/80 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Built For Every Stakeholder</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 font-display tracking-tight leading-tight">
            Tailored Commercial Solutions for Creators, Brands &amp; Agencies.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 font-normal leading-relaxed">
            Every party at the creator economy negotiation table has distinct goals. SignCollab gives each one the exact tools needed to collaborate with trust and speed.
          </p>
        </div>

        {/* 3 Personas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {personas.map((persona) => {
            const Icon = persona.icon;
            return (
              <div
                key={persona.id}
                className="p-6 sm:p-8 rounded-3xl bg-zinc-50 border border-zinc-200/90 shadow-xs flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border font-mono ${persona.badgeStyle}`}
                    >
                      {persona.badge}
                    </span>
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center ${persona.iconColor}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-zinc-950 leading-snug">
                    {persona.headline}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                    {persona.description}
                  </p>

                  <div className="space-y-2.5 pt-3 border-t border-zinc-200/60 text-xs text-zinc-700">
                    {persona.points.map((pt, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-200/60">
                  <Link
                    href={persona.link}
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs transition-colors shadow-2xs"
                  >
                    <span>{persona.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
