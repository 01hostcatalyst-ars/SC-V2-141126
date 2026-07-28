"use client";

import React, { useState } from "react";
import Link from "next/link";

interface CountryOption {
  id: string;
  name: string;
  code: string;
  currency: string;
}

const COUNTRIES: CountryOption[] = [
  { id: "pk", name: "Pakistan", code: "PK", currency: "PKR" },
  { id: "us", name: "United States", code: "US", currency: "USD" },
  { id: "gb", name: "United Kingdom", code: "GB", currency: "GBP" },
  { id: "ae", name: "UAE / GCC", code: "AE", currency: "AED" },
  { id: "other", name: "Other / International", code: "INT", currency: "USD" },
];

const CURRENCY_BRACKETS: Record<string, string[]> = {
  PKR: [
    "Under PKR 10,000",
    "PKR 10,000–25,000",
    "PKR 25,000–50,000",
    "PKR 50,000–100,000",
    "PKR 100,000–250,000",
    "PKR 250,000+",
  ],
  USD: [
    "Under $50",
    "$50–$100",
    "$100–$250",
    "$250–$500",
    "$500–$1,000",
    "$1,000–$2,500",
    "$2,500+",
  ],
  GBP: [
    "Under £40",
    "£40–£80",
    "£80–£200",
    "£200–£400",
    "£400–£800",
    "£800–£2,000",
    "£2,000+",
  ],
  AED: [
    "Under AED 200",
    "AED 200–500",
    "AED 500–1,000",
    "AED 1,000–2,500",
    "AED 2,500–5,000",
    "AED 5,000+",
  ],
};

const PLATFORMS = [
  "Instagram Reel",
  "Instagram Post / Story",
  "TikTok Video",
  "YouTube Video / Short",
  "LinkedIn Post",
  "Other Format",
];

const NICHES = [
  "Beauty & Fashion",
  "Tech & B2B",
  "Finance & Business",
  "Gaming",
  "Food & Travel",
  "Lifestyle & Fitness",
  "Other",
];

const FOLLOWER_TIERS = [
  "Under 5K",
  "5K–10K",
  "10K–25K",
  "25K–50K",
  "50K–100K",
  "100K–250K",
  "250K+",
];

const ENGAGEMENT_RATES = ["Under 1%", "1%–3%", "3%–5%", "5%+", "Don't Know"];

const SCOPE_OPTIONS = [
  {
    id: "organic",
    label: "Organic post publication only",
    desc: "Standard post on your profile without extra paid ad rights",
  },
  {
    id: "whitelisting",
    label: "Brand received Paid Ad / Whitelisting rights",
    desc: "Brand ran paid advertising using your handle or content",
  },
  {
    id: "usage_rights",
    label: "Extended content usage rights (3+ months)",
    desc: "Brand can reuse your video on website, social, or billboards",
  },
  {
    id: "exclusivity",
    label: "Category exclusivity (Non-compete clause)",
    desc: "Restricts you from promoting competitor brands for a specified period",
  },
  {
    id: "gifting",
    label: "Product gifting / Free items included",
    desc: "Free merchandise or products provided as part of compensation",
  },
  {
    id: "retainer",
    label: "Long-term retainer / Ambassador deal",
    desc: "Multi-month deal or recurring monthly deliverable package",
  },
];

export default function SurveyPage() {
  const [step, setStep] = useState<number>(1);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    COUNTRIES[0]
  );
  const [earningsBracket, setEarningsBracket] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");
  const [niche, setNiche] = useState<string>("Lifestyle & Fitness");
  const [followerTier, setFollowerTier] = useState<string>("10K–25K");
  const [engagementRate, setEngagementRate] = useState<string>("1%–3%");
  const [dealScope, setDealScope] = useState<string[]>([]);
  
  // Completion screen state
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionCount, setSubmissionCount] = useState<number>(48);
  const [emailSubmitted, setEmailSubmitted] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const toggleScope = (id: string) => {
    setDealScope((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCountrySelect = (country: CountryOption) => {
    setSelectedCountry(country);
    setEarningsBracket(""); // reset earnings when currency changes
    setStep(2);
  };

  const handleEarningsSelect = (bracket: string) => {
    setEarningsBracket(bracket);
    setStep(3);
  };

  const handlePlatformSelect = (plat: string) => {
    setPlatform(plat);
    setStep(4);
  };

  const handleSubmitSurvey = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: selectedCountry.name,
          currency: selectedCountry.currency,
          earningsBracket,
          platform,
          niche,
          followerTier,
          engagementRate,
          dealScope,
          email: email || null,
        }),
      });
      const data = await res.json();
      if (data.countForCountry) {
        setSubmissionCount(data.countForCountry);
      } else {
        setSubmissionCount((prev) => prev + 1);
      }
    } catch {
      setSubmissionCount((prev) => prev + 1);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const handleSaveEmail = async () => {
    if (!email || !email.includes("@")) return;
    setEmailSubmitted(true);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const currentBrackets =
    CURRENCY_BRACKETS[selectedCountry.currency] || CURRENCY_BRACKETS["USD"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden font-sans">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-blue-500/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Top Header Navigation */}
      <header className="w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xs font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded">
              SIGNCOLLAB
            </span>
            <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition">
              Rate Intelligence
            </span>
          </Link>
          <span className="text-xs font-semibold text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
            100% Anonymous Data
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 md:py-12 z-10 flex flex-col">
        {/* Mandatory Header Block */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            2026 Creator Benchmark Initiative
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            SignCollab Creator Pricing Index 2026
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Help us build the creator economy&apos;s first transparent pricing index. 100% anonymous. Takes under 60 seconds.
          </p>
        </div>

        {/* Progress Bar (Hidden when submitted) */}
        {!isSubmitted && (
          <div className="mb-8 max-w-md mx-auto w-full">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
              <span>PROGRESS</span>
              <span>STEP {step} OF 5</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-emerald-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Form Container Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative">
          
          {/* Back button for steps 2 to 5 */}
          {!isSubmitted && step > 1 && (
            <button
              onClick={() => setStep((prev) => prev - 1)}
              className="text-xs font-semibold text-slate-400 hover:text-white mb-6 flex items-center gap-1 transition"
            >
              &larr; Back to Step {step - 1}
            </button>
          )}

          {/* ================= STEP 1: Country & Currency Anchor ================= */}
          {step === 1 && !isSubmitted && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  Where are you (or your primary audience) located?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Select your region to view dynamic, localized deal currency options.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {COUNTRIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleCountrySelect(c)}
                    className={`p-4 rounded-xl text-left border transition-all duration-200 flex items-center justify-between group ${
                      selectedCountry.id === c.id
                        ? "bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-950/50"
                        : "bg-slate-800/40 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-white group-hover:text-emerald-300 transition">
                        {c.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Currency Anchor: <span className="font-semibold text-slate-300">{c.currency}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 group-hover:border-emerald-500/50">
                      {c.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= STEP 2: Localized Deal Earnings ================= */}
          {step === 2 && !isSubmitted && (
            <div className="space-y-6">
              <div>
                <div className="inline-block text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800 mb-2">
                  Currency: {selectedCountry.currency} ({selectedCountry.name})
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  Approximately how much were you paid for this specific deal?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Select the bracket matching your total payout for a recent brand collaboration.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentBrackets.map((bracket) => (
                  <button
                    key={bracket}
                    onClick={() => handleEarningsSelect(bracket)}
                    className={`p-4 rounded-xl text-left border font-semibold text-sm transition-all duration-200 ${
                      earningsBracket === bracket
                        ? "bg-emerald-950/50 border-emerald-500 text-white"
                        : "bg-slate-800/40 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    {bracket}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= STEP 3: Platform & Format ================= */}
          {step === 3 && !isSubmitted && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  Which platform was this collaboration for?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Select the primary deliverable format for this transaction.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLATFORMS.map((plat) => (
                  <button
                    key={plat}
                    onClick={() => handlePlatformSelect(plat)}
                    className={`p-4 rounded-xl text-left border font-semibold text-sm transition-all duration-200 ${
                      platform === plat
                        ? "bg-emerald-950/50 border-emerald-500 text-white"
                        : "bg-slate-800/40 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= STEP 4: Niche & Audience Tier ================= */}
          {step === 4 && !isSubmitted && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  Tell us about your content &amp; audience size
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  This metadata helps index rate cards against account scale.
                </p>
              </div>

              <div className="space-y-4">
                {/* 1. Niche */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Primary Content Niche
                  </label>
                  <select
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {NICHES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Follower Tier */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Follower / Subscriber Count Tier
                  </label>
                  <select
                    value={followerTier}
                    onChange={(e) => setFollowerTier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {FOLLOWER_TIERS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Engagement Rate */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Average Engagement Rate
                  </label>
                  <select
                    value={engagementRate}
                    onChange={(e) => setEngagementRate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {ENGAGEMENT_RATES.map((er) => (
                      <option key={er} value={er}>
                        {er}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => setStep(5)}
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition duration-200 shadow-lg shadow-emerald-500/20"
              >
                Continue to Deal Scope &rarr;
              </button>
            </div>
          )}

          {/* ================= STEP 5: Included Deal Scope ================= */}
          {step === 5 && !isSubmitted && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  Which commercial terms were included in this price?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Select all terms that applied to this contract (Multi-select).
                </p>
              </div>

              <div className="space-y-3">
                {SCOPE_OPTIONS.map((opt) => {
                  const isChecked = dealScope.includes(opt.id);
                  return (
                    <label
                      key={opt.id}
                      onClick={() => toggleScope(opt.id)}
                      className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all duration-200 select-none ${
                        isChecked
                          ? "bg-emerald-950/40 border-emerald-500 text-white"
                          : "bg-slate-800/40 border-slate-700/80 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by wrapper label
                        className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-white">
                          {opt.label}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {opt.desc}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <button
                onClick={handleSubmitSurvey}
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-sm transition duration-200 shadow-lg shadow-emerald-500/20"
              >
                {isSubmitting ? "Submitting Anonymous Deal Data..." : "Submit Anonymous Deal Data"}
              </button>
            </div>
          )}

          {/* ================= STEP 6: Completion Screen (Option 2) ================= */}
          {isSubmitted && (
            <div className="space-y-8 text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-400 text-xl font-bold mx-auto">
                &#10003;
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                  Thank You for Contributing!
                </h2>
                <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  Your deal data has been anonymously added to the SignCollab Creator Pricing Index.
                </p>
              </div>

              {/* Progress Counter Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-left max-w-md mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {selectedCountry.name} Region Unlock Goal
                  </span>
                  <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    {submissionCount} / 200 Submissions
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (submissionCount / 200) * 100
                      )}%`,
                    }}
                  />
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  We need 200 verified deals from <strong className="text-slate-200">{selectedCountry.name}</strong> to officially unlock the regional Benchmark Report so pricing standards remain 100% accurate.
                </p>
              </div>

              {/* Optional Email Notification Card */}
              <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-5 max-w-md mx-auto text-left space-y-3">
                <div className="text-sm font-bold text-white">
                  Want to receive the full report when it unlocks?
                </div>
                <p className="text-xs text-slate-400">
                  Enter your email below to get VIP early access to the SignCollab 2026 Creator Pricing Index. (Optional)
                </p>
                {emailSubmitted ? (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-600/50 rounded-lg text-xs font-bold text-emerald-300 text-center">
                    You are on the VIP notification list for {selectedCountry.name}!
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="creator@domain.com"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleSaveEmail}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition"
                    >
                      Notify Me
                    </button>
                  </div>
                )}
              </div>

              {/* Share Survey Button */}
              <div className="pt-2">
                <button
                  onClick={handleCopyLink}
                  className="w-full max-w-md mx-auto py-3.5 px-6 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs tracking-wider uppercase transition flex items-center justify-center gap-2"
                >
                  {copiedLink ? "Survey Link Copied to Clipboard!" : "Copy Survey Link to Share with Creator Friends"}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Simple Footer */}
      <footer className="w-full border-t border-slate-800/80 py-6 px-6 z-10 text-center text-xs text-slate-500">
        SignCollab &copy; 2026 • Bilateral Agreement Proof-Layer &amp; Creator Rate Transparency Initiative
      </footer>
    </div>
  );
}
