"use client";

import React, { useState } from "react";
import Link from "next/link";

interface PricingClientProps {
  companyName: string;
  supportEmail: string;
}

export function PricingClient({ companyName, supportEmail }: PricingClientProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "How does the 50% Launch Offer work?",
      a: "All paid monthly plans receive 50% off for your first 3 months. No coupon code is required; the discount is automatically applied when you select a plan. If you choose an annual plan, you save 20% year-round (equal to 2 months free).",
    },
    {
      q: "What happens after I reach my monthly limit?",
      a: "You can upgrade your plan anytime to immediately increase your agreement capacity, or wait until your monthly quota resets at the start of your next billing cycle.",
    },
    {
      q: "Can I change or cancel my plan anytime?",
      a: "Yes. You can upgrade, downgrade, or cancel your subscription whenever your business needs change with zero penalty fees.",
    },
    {
      q: "Are electronic signatures legally binding in my country?",
      a: "Yes. SignCollab signatures generate audit certificates compliant with major global electronic signature laws (including US ESIGN & UETA, UK eIDAS, EU eIDAS, UAE Decree 46/2021, KSA Royal Decree M/18, India IT Act, Pakistan ETO 2002, and electronic transaction acts in 20+ additional countries).",
    },
    {
      q: "How do team seats work on the Team plan?",
      a: "The Team plan includes up to 5 team member seats with a shared team workspace, shared contract history, shared template library, and centralized permission controls.",
    },
  ];

  const collaborationTypes = [
    { flow: "Agency ↔ Creator", desc: "Campaign deliverables, retention & milestone payout agreements" },
    { flow: "Agency ↔ Brand", desc: "Master service agreements, client retainers & campaign scopes" },
    { flow: "Brand ↔ Creator", desc: "Direct influencer sponsorships, usage rights & ad boosting terms" },
    { flow: "Brand ↔ Agency", desc: "Marketing campaign delegation & management agreements" },
    { flow: "Creator ↔ Agency", desc: "Talent representation & agent onboarding agreements" },
    { flow: "Creator ↔ Brand", desc: "Direct creator sponsorship proposals & commercial terms" },
  ];

  const universalFeatures = [
    { title: "Legally Binding E-Signatures", desc: "Compliant with major electronic signature laws worldwide (US ESIGN, UK/EU eIDAS, UAE, KSA, India, Pakistan, etc.)." },
    { title: "OTP Email Verification", desc: "Mandatory 6-digit email authentication before signature lock." },
    { title: "SHA-256 Audit Trail Certificates", desc: "Tamper-proof PDF certificates with microsecond UTC timestamps, IP logs, and user-agent fingerprints." },
    { title: "Creator Contract Provisions", desc: "Usage rights, paid ad boosting, whitelisting, exclusivity embargoes, and 48-hour deemed approval terms." },
    { title: "Multi-Party Signing", desc: "Multi-party execution for creators, managers, brand leads, and agencies." },
    { title: "On-Device Local Verification", desc: "Web Crypto API hash computation at /verify running locally inside your browser." },
  ];

  const comparisonRows = [
    { feature: "Legally Binding E-Signatures", starter: true, pro: true, business: true, team: true },
    { feature: "OTP Verification", starter: true, pro: true, business: true, team: true },
    { feature: "SHA-256 Audit Trail", starter: true, pro: true, business: true, team: true },
    { feature: "Creator Contract Templates", starter: true, pro: true, business: true, team: true },
    { feature: "Usage Rights Clauses", starter: true, pro: true, business: true, team: true },
    { feature: "Whitelisting Clauses", starter: true, pro: true, business: true, team: true },
    { feature: "Exclusivity Clauses", starter: true, pro: true, business: true, team: true },
    { feature: "Commercial Licensing", starter: true, pro: true, business: true, team: true },
    { feature: "Multi-Party Signing", starter: true, pro: true, business: true, team: true },
    { feature: "PDF Download", starter: true, pro: true, business: true, team: true },
    { feature: "Dashboard", starter: false, pro: true, business: true, team: true },
    { feature: "Saved Contracts", starter: false, pro: true, business: true, team: true },
    { feature: "Contract Search", starter: false, pro: true, business: true, team: true },
    { feature: "Reusable Templates", starter: false, pro: true, business: true, team: true },
    { feature: "Priority Support", starter: false, pro: false, business: true, team: true },
    { feature: "Team Workspace", starter: false, pro: false, business: false, team: true },
    { feature: "Team Members", starter: "✕", pro: "1", business: "1", team: "5" },
    { feature: "API Access (Coming Soon)", starter: false, pro: false, business: true, team: true },
  ];

  const renderCell = (val: boolean | string) => {
    if (typeof val === "string") {
      if (val === "✕") {
        return <span className="text-gray-300 font-bold text-sm">✕</span>;
      }
      return <span className="font-extrabold text-black text-sm">{val}</span>;
    }
    if (val) {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
          ✓
        </span>
      );
    }
    return <span className="text-gray-300 font-bold text-sm">✕</span>;
  };

  return (
    <div className="space-y-12">
      {/* HERO SECTION */}
      <section className="text-center max-w-4xl mx-auto space-y-4 pt-8">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300 shadow-sm">
          Launch Offer • 50% OFF First 3 Months
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-black leading-tight tracking-tight">
          Simple, Transparent Pricing Built for <span className="text-accent-gradient">Creator Marketing</span>
        </h1>
        <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-gray-200/80 shadow-sm">
          No per-envelope fees or hidden charges. Positioned specifically for brands, agencies, and creators.
        </p>

        {/* TRUST STRIP */}
        <div className="pt-4 border-t border-gray-200/60 max-w-3xl mx-auto">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
            Trusted for Modern Creator Collaborations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-gray-800">
            <span className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> Legally binding e-signatures</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> Built for brands, agencies &amp; creators</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> Secure SHA-256 audit certificates</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> No per-envelope pricing</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> Start free in under 60 seconds</span>
          </div>
        </div>

        {/* MONTHLY / ANNUAL BILLING TOGGLE */}
        <div className="pt-6 flex flex-col items-center justify-center gap-3">
          <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200 shadow-sm inline-flex items-center gap-2">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                !isAnnual
                  ? "bg-black text-white shadow-md"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Monthly (50% OFF First 3 Mo)
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isAnnual
                  ? "bg-black text-white shadow-md"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Annual (Save 20%)
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500 text-black font-extrabold uppercase">
                2 Mo Free
              </span>
            </button>
          </div>
          <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Launch Offer: Discount automatically applied at checkout • No coupon required
          </span>
        </div>
      </section>

      {/* PRICING CARDS TOP GRID (4 COLUMNS ON DESKTOP) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {/* Tier 1: Starter */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-700 bg-gray-100 px-3 py-1 rounded-full inline-block mb-3">
              Starter
            </span>
            <h3 className="text-xl font-bold text-black mb-1">Starter</h3>
            <p className="text-xs text-gray-600 font-medium mb-4 leading-relaxed">
              Ideal for trying SignCollab &amp; single collaborations
            </p>

            <div className="mb-4">
              <span className="text-3xl font-black text-black">$0</span>
              <span className="text-xs text-gray-500 font-medium"> / month</span>
              <p className="text-[11px] text-gray-500 mt-1 font-semibold">No Credit Card Required</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 mb-4 text-xs font-semibold text-gray-800 space-y-1">
              <p>Up to 2 instant agreements per day</p>
              <p className="text-[10px] text-gray-500 font-normal">Fair Usage Policy applies</p>
            </div>

            <ul className="space-y-2 text-xs text-gray-700 mb-6 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>Start in 60 seconds (Guest Mode)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>Download signed PDF agreements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>Tamper-proof SHA-256 audit certificates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>On-device document verification</span>
              </li>
            </ul>
          </div>

          <div>
            <span className="block text-[10px] font-bold text-center text-blue-900 bg-blue-50 py-1 px-2 rounded-lg mb-3 border border-blue-100">
              ✓ All Collaboration Types Included
            </span>
            <Link
              href="/instant"
              className="w-full py-3 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center transition-all shadow-sm"
            >
              Create Free Contract
            </Link>
          </div>
        </div>

        {/* Tier 2: Professional */}
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-500 shadow-xl flex flex-col justify-between relative overflow-hidden transform lg:-translate-y-2">
          <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
            Most Popular
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full inline-block mb-3">
              Professional
            </span>
            <h3 className="text-xl font-bold text-black mb-1">Professional</h3>
            <p className="text-xs text-gray-600 font-medium mb-4 leading-relaxed">
              Ideal for freelancers, creators &amp; small brands running regular collaborations
            </p>

            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-gray-400 line-through font-bold">
                  {isAnnual ? "$190/yr" : "$19"}
                </span>
                <span className="text-3xl font-black text-black">
                  {isAnnual ? "$15" : "$9.50"}
                </span>
                <span className="text-xs text-gray-500 font-medium"> / month</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-bold mt-1">
                {isAnnual ? "Billed annually ($150/yr • 2 Months Free)" : "50% OFF first 3 months (then $19/mo) • ≈ $0.31/day"}
              </p>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 mb-4 text-xs font-semibold text-emerald-950 space-y-1">
              <p>Includes up to 250 agreements/month</p>
              <p className="text-[10px] text-emerald-800 font-normal">No per-envelope fees</p>
            </div>

            <ul className="space-y-2 text-xs text-gray-700 mb-6 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span><strong>Everything in Starter, plus:</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>Manage every agreement from one place</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>Search every signed agreement instantly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>Reuse your creator agreements in seconds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>Priority email support &amp; future updates</span>
              </li>
            </ul>
          </div>

          <div>
            <span className="block text-[10px] font-bold text-center text-blue-900 bg-blue-50 py-1 px-2 rounded-lg mb-3 border border-blue-100">
              ✓ All Collaboration Types Included
            </span>
            <Link
              href="/contact"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center justify-center transition-all shadow-md"
            >
              Get Started with Professional
            </Link>
          </div>
        </div>

        {/* Tier 3: Business */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 bg-purple-100 px-3 py-1 rounded-full inline-block mb-3">
              Business
            </span>
            <h3 className="text-xl font-bold text-black mb-1">Business</h3>
            <p className="text-xs text-gray-600 font-medium mb-4 leading-relaxed">
              Ideal for growing agencies &amp; campaign managers handling multiple creators
            </p>

            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-gray-400 line-through font-bold">
                  {isAnnual ? "$390/yr" : "$39"}
                </span>
                <span className="text-3xl font-black text-black">
                  {isAnnual ? "$31" : "$19.50"}
                </span>
                <span className="text-xs text-gray-500 font-medium"> / month</span>
              </div>
              <p className="text-[11px] text-purple-700 font-bold mt-1">
                {isAnnual ? "Billed annually ($312/yr • 2 Months Free)" : "50% OFF first 3 months (then $39/mo) • ≈ $0.65/day"}
              </p>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 mb-4 text-xs font-semibold text-purple-950 space-y-1">
              <p>Includes up to 1,000 agreements/month</p>
              <p className="text-[10px] text-purple-800 font-normal">Faster document processing</p>
            </div>

            <ul className="space-y-2 text-xs text-gray-700 mb-6 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold shrink-0">✓</span>
                <span><strong>Everything in Professional, plus:</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold shrink-0">✓</span>
                <span>Advanced dashboard analytics &amp; activity logs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold shrink-0">✓</span>
                <span>Faster document PDF processing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold shrink-0">✓</span>
                <span>API access (when released)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold shrink-0">✓</span>
                <span>Early access to new features</span>
              </li>
            </ul>
          </div>

          <div>
            <span className="block text-[10px] font-bold text-center text-blue-900 bg-blue-50 py-1 px-2 rounded-lg mb-3 border border-blue-100">
              ✓ All Collaboration Types Included
            </span>
            <Link
              href="/contact"
              className="w-full py-3 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center transition-all shadow-sm"
            >
              Get Started with Business
            </Link>
          </div>
        </div>

        {/* Tier 4: Team */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 bg-blue-100 px-3 py-1 rounded-full inline-block mb-3">
              Team
            </span>
            <h3 className="text-xl font-bold text-black mb-1">Team</h3>
            <p className="text-xs text-gray-600 font-medium mb-4 leading-relaxed">
              Ideal for brand marketing departments &amp; multi-agent agency teams
            </p>

            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-gray-400 line-through font-bold">
                  {isAnnual ? "$790/yr" : "$79"}
                </span>
                <span className="text-3xl font-black text-black">
                  {isAnnual ? "$63" : "$39.50"}
                </span>
                <span className="text-xs text-gray-500 font-medium"> / month</span>
              </div>
              <p className="text-[11px] text-blue-700 font-bold mt-1">
                {isAnnual ? "Billed annually ($630/yr • 2 Months Free)" : "50% OFF first 3 months (then $79/mo) • ≈ $1.31/day"}
              </p>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 mb-4 text-xs font-semibold text-blue-950 space-y-1">
              <p>Includes up to 2,500 agreements/month</p>
              <p className="text-[10px] text-blue-800 font-normal">Up to 5 Team Members included</p>
            </div>

            <ul className="space-y-2 text-xs text-gray-700 mb-6 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold shrink-0">✓</span>
                <span><strong>Everything in Business, plus:</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold shrink-0">✓</span>
                <span>Up to 5 team member seats included</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold shrink-0">✓</span>
                <span>Shared team workspace &amp; contract history</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold shrink-0">✓</span>
                <span>Shared template library &amp; permissions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold shrink-0">✓</span>
                <span>Priority business SLA support</span>
              </li>
            </ul>
          </div>

          <div>
            <span className="block text-[10px] font-bold text-center text-blue-900 bg-blue-50 py-1 px-2 rounded-lg mb-3 border border-blue-100">
              ✓ All Collaboration Types Included
            </span>
            <Link
              href="/contact"
              className="w-full py-3 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center transition-all shadow-sm"
            >
              Get Started with Team
            </Link>
          </div>
        </div>
      </section>

      {/* FULL WIDTH ENTERPRISE CARD BELOW TOP 4 TIERS */}
      <section className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white rounded-3xl p-8 border border-gray-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left flex-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 border border-amber-800 px-3 py-1 rounded-full inline-block">
              Enterprise &amp; White-Label
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-white">Enterprise Plan</h3>
            <p className="text-xs md:text-sm text-gray-300 font-medium max-w-2xl leading-relaxed">
              Ideal for enterprise brands, large agency networks, and organizations requiring custom contract volume, white-label PDF signing pages, dedicated SLA support, and API integrations.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-xs font-semibold text-amber-300 pt-2">
              <span>✓ Unlimited Agreements &amp; Seats</span>
              <span>✓ White-Label PDF Branding</span>
              <span>✓ Dedicated Onboarding &amp; SLA</span>
              <span>✓ Custom Legal Templates</span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center md:items-end space-y-3">
            <div className="text-center md:text-right">
              <span className="text-2xl md:text-3xl font-black text-white">Custom Pricing</span>
              <p className="text-xs text-amber-400 font-bold">Tailored to your organization</p>
            </div>
            <Link
              href="/contact"
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 whitespace-nowrap"
            >
              Contact Sales ↗
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE COMPARISON TABLE */}
      <section className="max-w-7xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl p-6 md:p-10 border border-gray-200 shadow-xl space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-3 py-1 rounded-full">
            Detailed Comparison
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-black tracking-tight">
            Feature Comparison Matrix
          </h2>
          <p className="text-xs md:text-sm text-gray-600">
            Compare platform features across all plans to choose the right fit for your collaboration scale.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b-2 border-gray-200 text-xs font-black uppercase text-black bg-gray-50/80">
                <th className="py-4 px-4 text-left">Feature</th>
                <th className="py-4 px-4 text-center">Starter</th>
                <th className="py-4 px-4 text-center">Professional</th>
                <th className="py-4 px-4 text-center">Business</th>
                <th className="py-4 px-4 text-center">Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-800">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900">{row.feature}</td>
                  <td className="py-3.5 px-4 text-center">{renderCell(row.starter)}</td>
                  <td className="py-3.5 px-4 text-center">{renderCell(row.pro)}</td>
                  <td className="py-3.5 px-4 text-center">{renderCell(row.business)}</td>
                  <td className="py-3.5 px-4 text-center">{renderCell(row.team)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* EVERY PLAN INCLUDES (UNIVERSAL BASELINE FEATURES) */}
      <section className="max-w-5xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Standard Baseline
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-black tracking-tight mt-3 mb-2">
            Every Plan Includes
          </h2>
          <p className="text-xs md:text-sm text-gray-600">
            Regardless of which tier you select, foundational security and compliance are never paywalled.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {universalFeatures.map((feat, idx) => (
            <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-1">
              <h3 className="font-bold text-black text-xs flex items-center gap-2">
                <span className="text-emerald-600 font-bold text-base">✓</span>
                {feat.title}
              </h3>
              <p className="text-[11px] text-gray-600 leading-relaxed font-medium pl-5">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* COMPLETE CREATOR COLLABORATION COVERAGE (VISUAL ECOSYSTEM) */}
      <section className="max-w-5xl mx-auto bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white rounded-3xl p-8 md:p-12 border border-gray-800 shadow-2xl space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-blue-400 bg-blue-950 border border-blue-800 px-3.5 py-1 rounded-full">
            Ecosystem Infrastructure
          </span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            Complete Creator Collaboration Coverage
          </h2>
          <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
            Unlike generic document tools, every SignCollab plan natively supports bidirectional agreements between all participants in influencer marketing:
          </p>
        </div>

        {/* VISUAL ECOSYSTEM DIAGRAM */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center max-w-md mx-auto">
          <div className="font-mono text-sm font-bold text-emerald-400 space-y-1">
            <p>Agency</p>
            <p className="text-xs text-gray-400">↗ &nbsp; &nbsp; ↖</p>
            <p>Brand &nbsp; &nbsp; ↔ &nbsp; &nbsp; Creator</p>
          </div>
        </div>

        {/* 6 VISUAL CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collaborationTypes.map((c, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1">
              <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-800 font-mono">FLOW</span> {c.flow}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY SIGNCOLLAB? (4-PILLAR VALUE GRID) */}
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-black tracking-tight mb-2">
            Why SignCollab?
          </h2>
          <p className="text-xs text-gray-600">
            Four simple reasons modern brands, agencies, and creators trust SignCollab.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs uppercase tracking-wider border border-blue-100">
              SPEC
            </div>
            <h3 className="font-bold text-black text-sm">Built for Creator Marketing</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Contracts designed specifically for brands, agencies, and creators—not generic business documents.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs uppercase tracking-wider border border-emerald-100">
              LAW
            </div>
            <h3 className="font-bold text-black text-sm">Global Legal Recognition</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Electronic signatures supported by major electronic signature laws worldwide (US ESIGN, UK/EU eIDAS, UAE, KSA, India, PK ETO).
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs uppercase tracking-wider border border-purple-100">
              FAST
            </div>
            <h3 className="font-bold text-black text-sm">Faster Campaign Workflows</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Create, send, sign, and verify agreements in minutes with creator-focused templates and OTP verification.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs uppercase tracking-wider border border-amber-100">
              FLAT
            </div>
            <h3 className="font-bold text-black text-sm">Transparent Pricing</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              No per-user envelope charges or hidden fees. Choose the tier that fits your campaign volume.
            </p>
          </div>
        </div>
      </section>

      {/* INTERACTIVE PRICING FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md border border-gray-200 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
            Got Questions?
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight">
            Frequently Asked Pricing Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left font-bold text-xs md:text-sm text-black bg-gray-50/50 hover:bg-gray-100/80 flex items-center justify-between transition-colors"
              >
                <span>{faq.q}</span>
                <span className="text-gray-500 font-mono text-base ml-2">
                  {openFaq === idx ? "−" : "+"}
                </span>
              </button>
              {openFaq === idx && (
                <div className="p-4 bg-white text-xs text-gray-600 leading-relaxed border-t border-gray-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="max-w-4xl mx-auto text-center">
        <div className="bg-black text-white p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <span className="inline-block text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full mb-4">
            Start Free Today
          </span>
          <h3 className="text-2xl md:text-4xl font-black tracking-tight mb-4">
            Ready to Build Stronger Collaborations?
          </h3>
          <p className="text-sm md:text-base text-gray-300 max-w-xl mx-auto leading-relaxed mb-8">
            Create your first bilaterally signed digital agreement in minutes. No credit card required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/instant"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all shadow-lg hover:shadow-emerald-500/20"
            >
              Create Free Contract
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/20"
            >
              Contact Sales Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
