"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface CountryOption {
  name: string;
  code: string;
  currency: string;
}

const ORDERED_COUNTRIES: CountryOption[] = [
  { name: "United States", code: "US", currency: "USD" },
  { name: "United Kingdom", code: "GB", currency: "GBP" },
  { name: "European Union", code: "EU", currency: "EUR" },
  { name: "UAE / GCC", code: "AE", currency: "AED" },
  { name: "Pakistan", code: "PK", currency: "PKR" },
  { name: "India", code: "IN", currency: "INR" },
  { name: "Canada", code: "CA", currency: "CAD" },
  { name: "Australia", code: "AU", currency: "AUD" },
  { name: "Saudi Arabia", code: "SA", currency: "SAR" },
  { name: "Qatar", code: "QA", currency: "QAR" },
  { name: "Kuwait", code: "KW", currency: "KWD" },
  { name: "Bahrain", code: "BH", currency: "BHD" },
  { name: "Oman", code: "OM", currency: "OMR" },
  // Alphabetical list of other countries
  { name: "Afghanistan", code: "AF", currency: "USD" },
  { name: "Albania", code: "AL", currency: "EUR" },
  { name: "Algeria", code: "DZ", currency: "USD" },
  { name: "Argentina", code: "AR", currency: "USD" },
  { name: "Armenia", code: "AM", currency: "USD" },
  { name: "Austria", code: "AT", currency: "EUR" },
  { name: "Bangladesh", code: "BD", currency: "USD" },
  { name: "Belgium", code: "BE", currency: "EUR" },
  { name: "Brazil", code: "BR", currency: "USD" },
  { name: "Chile", code: "CL", currency: "USD" },
  { name: "China", code: "CN", currency: "USD" },
  { name: "Colombia", code: "CO", currency: "USD" },
  { name: "Denmark", code: "DK", currency: "EUR" },
  { name: "Egypt", code: "EG", currency: "USD" },
  { name: "Finland", code: "FI", currency: "EUR" },
  { name: "France", code: "FR", currency: "EUR" },
  { name: "Germany", code: "DE", currency: "EUR" },
  { name: "Greece", code: "GR", currency: "EUR" },
  { name: "Hong Kong", code: "HK", currency: "USD" },
  { name: "Indonesia", code: "ID", currency: "USD" },
  { name: "Ireland", code: "IE", currency: "EUR" },
  { name: "Italy", code: "IT", currency: "EUR" },
  { name: "Japan", code: "JP", currency: "USD" },
  { name: "Kenya", code: "KE", currency: "USD" },
  { name: "Malaysia", code: "MY", currency: "USD" },
  { name: "Mexico", code: "MX", currency: "USD" },
  { name: "Netherlands", code: "NL", currency: "EUR" },
  { name: "New Zealand", code: "NZ", currency: "AUD" },
  { name: "Nigeria", code: "NG", currency: "USD" },
  { name: "Norway", code: "NO", currency: "EUR" },
  { name: "Philippines", code: "PH", currency: "USD" },
  { name: "Poland", code: "PL", currency: "EUR" },
  { name: "Portugal", code: "PT", currency: "EUR" },
  { name: "Singapore", code: "SG", currency: "USD" },
  { name: "South Africa", code: "ZA", currency: "USD" },
  { name: "South Korea", code: "KR", currency: "USD" },
  { name: "Spain", code: "ES", currency: "EUR" },
  { name: "Sweden", code: "SE", currency: "EUR" },
  { name: "Switzerland", code: "CH", currency: "EUR" },
  { name: "Thailand", code: "TH", currency: "USD" },
  { name: "Turkey", code: "TR", currency: "USD" },
  { name: "Vietnam", code: "VN", currency: "USD" },
  { name: "Other International", code: "INT", currency: "USD" },
];

const CURRENCY_BRACKETS: Record<string, string[]> = {
  USD: [
    "Under $50",
    "$50–$100",
    "$100–$250",
    "$250–$500",
    "$500–$1,000",
    "$1,000–$2,500",
    "$2,500–$5,000",
    "$5,000–$10,000",
    "$10,000+",
  ],
  GBP: [
    "Under £40",
    "£40–£80",
    "£80–£200",
    "£200–£400",
    "£400–£800",
    "£800–£2,000",
    "£2,000–£4,000",
    "£4,000–£8,000",
    "£8,000+",
  ],
  EUR: [
    "Under €45",
    "€45–€90",
    "€90–€225",
    "€225–€450",
    "€450–€900",
    "€900–€2,250",
    "€2,250–€4,500",
    "€4,500–€9,000",
    "€9,000+",
  ],
  AED: [
    "Under AED 200",
    "AED 200–500",
    "AED 500–1,000",
    "AED 1,000–2,500",
    "AED 2,500–5,000",
    "AED 5,000–10,000",
    "AED 10,000–25,000",
    "AED 25,000–50,000",
    "AED 50,000+",
  ],
  PKR: [
    "Under PKR 10,000",
    "PKR 10,000–25,000",
    "PKR 25,000–50,000",
    "PKR 50,000–100,000",
    "PKR 100,000–250,000",
    "PKR 250,000–500,000",
    "PKR 500,000–1,000,000",
    "PKR 1,000,000+",
  ],
  INR: [
    "Under ₹4,000",
    "₹4,000–₹10,000",
    "₹10,000–₹25,000",
    "₹25,000–₹50,000",
    "₹50,000–₹100,000",
    "₹100,000–₹250,000",
    "₹250,000–₹500,000",
    "₹500,000+",
  ],
  CAD: [
    "Under C$70",
    "C$70–C$140",
    "C$140–C$350",
    "C$350–C$700",
    "C$700–C$1,400",
    "C$1,400–C$3,500",
    "C$3,500–C$7,000",
    "C$7,000+",
  ],
  AUD: [
    "Under A$75",
    "A$75–A$150",
    "A$150–A$375",
    "A$375–A$750",
    "A$750–A$1,500",
    "A$1,500–A$3,750",
    "A$3,750–A$7,500",
    "A$7,500+",
  ],
  SAR: [
    "Under SAR 200",
    "SAR 200–500",
    "SAR 500–1,000",
    "SAR 1,000–2,500",
    "SAR 2,500–5,000",
    "SAR 5,000–10,000",
    "SAR 10,000–25,000",
    "SAR 25,000+",
  ],
};

const PLATFORMS = [
  "Instagram",
  "YouTube",
  "TikTok",
  "Facebook",
  "X (Twitter)",
  "LinkedIn",
  "Pinterest",
  "Twitch",
  "Other",
];

const PLATFORM_DELIVERABLES: Record<string, string[]> = {
  Instagram: ["Instagram Reels", "Feed Posts", "Stories", "Carousel Posts"],
  YouTube: ["Long-form Videos", "YouTube Shorts", "Community Posts"],
  TikTok: ["TikTok Videos", "Live Stream Integrations"],
  Facebook: ["Facebook Feed Posts", "Facebook Videos", "Facebook Stories"],
  "X (Twitter)": ["Posts / Threads", "Video Clips"],
  LinkedIn: ["LinkedIn Posts", "Articles / Newsletters"],
  Pinterest: ["Idea Pins", "Standard Pins"],
  Twitch: ["Stream Integration", "Panel Banners"],
  Other: ["Custom Content Deliverables"],
};

const NICHES = [
  "Beauty",
  "Fashion",
  "Tech & Software",
  "B2B & Business",
  "Finance & Investing",
  "Gaming & Esports",
  "Food & Culinary",
  "Travel & Hospitality",
  "Fitness & Health",
  "Lifestyle",
  "Parenting & Family",
  "Entertainment & Comedy",
  "Education",
  "Other",
];

const FOLLOWER_TIERS = [
  "Under 5K",
  "5K–10K",
  "10K–25K",
  "25K–50K",
  "50K–100K",
  "100K–250K",
  "250K–500K",
  "500K–1M",
  "1M+",
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

const TARGET_GOAL = 500;

export default function SurveyPage() {
  const [step, setStep] = useState<number>(1);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    ORDERED_COUNTRIES[0]
  );
  const [earningsBracket, setEarningsBracket] = useState<string>("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "Instagram",
  ]);
  const [deliverablesCount, setDeliverablesCount] = useState<
    Record<string, number>
  >({});
  const [niche, setNiche] = useState<string>("Lifestyle");
  const [followerTier, setFollowerTier] = useState<string>("10K–25K");
  const [engagementRate, setEngagementRate] = useState<string>("1%–3%");
  const [dealScope, setDealScope] = useState<string[]>([]);

  // Completion screen state
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionCount, setSubmissionCount] = useState<number>(213);
  const [emailSubmitted, setEmailSubmitted] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Smooth scroll to top on step changes & submission
  const changeStep = (newStep: number) => {
    setStep(newStep);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    // Fetch dynamic country count on country change with local fallback
    fetch(`/api/survey?country=${encodeURIComponent(selectedCountry.name)}`)
      .then((res) => res.json())
      .then((data) => {
        let count = data.countForCountry || 213;
        if (typeof window !== "undefined") {
          try {
            const localVal = localStorage.getItem(
              `sc_survey_count_${selectedCountry.name}`
            );
            if (localVal) {
              count = Math.max(count, parseInt(localVal, 10));
            }
          } catch {}
        }
        setSubmissionCount(count);
      })
      .catch(() => {
        if (typeof window !== "undefined") {
          try {
            const localVal = localStorage.getItem(
              `sc_survey_count_${selectedCountry.name}`
            );
            if (localVal) {
              setSubmissionCount(parseInt(localVal, 10));
            }
          } catch {}
        }
      });
  }, [selectedCountry]);

  const togglePlatform = (plat: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(plat)
        ? prev.length > 1
          ? prev.filter((p) => p !== plat)
          : prev
        : [...prev, plat]
    );
  };

  const updateDeliverableQuantity = (item: string, delta: number) => {
    setDeliverablesCount((prev) => {
      const current = prev[item] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [item]: next };
    });
  };

  const toggleScope = (id: string) => {
    setDealScope((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCountryChange = (countryName: string) => {
    const found = ORDERED_COUNTRIES.find((c) => c.name === countryName);
    if (found) {
      setSelectedCountry(found);
      setEarningsBracket("");
    }
  };

  const handleEarningsSelect = (bracket: string) => {
    setEarningsBracket(bracket);
    changeStep(3);
  };

  const handleSubmitSurvey = async () => {
    setIsSubmitting(true);
    let nextCount = (submissionCount || 213) + 1;
    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: selectedCountry.name,
          currency: selectedCountry.currency,
          earningsBracket,
          platform: selectedPlatforms[0],
          platforms: selectedPlatforms,
          deliverables: deliverablesCount,
          niche,
          followerTier,
          engagementRate,
          dealScope,
          email: email || null,
        }),
      });
      const data = await res.json();
      if (data.countForCountry) {
        nextCount = Math.max(submissionCount + 1, data.countForCountry);
      }
    } catch {
      nextCount = (submissionCount || 213) + 1;
    } finally {
      setSubmissionCount(nextCount);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            `sc_survey_count_${selectedCountry.name}`,
            String(nextCount)
          );
        } catch {}
      }
      setIsSubmitting(false);
      setIsSubmitted(true);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
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

  const TOTAL_STEPS = 6;

  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-x-hidden text-slate-900 font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-[10%] left-[-5%] w-[70%] h-[40%] rounded-full ambient-glow-purple pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-5%] w-[70%] h-[40%] rounded-full ambient-glow-blue pointer-events-none z-0" />

      {/* Header */}
      <header className="w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-md px-6 py-4 z-20 sticky top-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-[11px] font-semibold uppercase tracking-widest bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded">
              SIGNCOLLAB
            </span>
            <span className="text-sm font-bold text-slate-700 group-hover:text-black transition">
              Pricing Index
            </span>
          </Link>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            100% Anonymous Survey
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 md:py-12 z-10 flex flex-col">
        {/* Top Header Banner */}
        <div className="text-center mb-8 space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            SignCollab Creator Pricing Index 2026
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            SignCollab Creator Pricing Index 2026
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Help us build the creator economy&apos;s first transparent pricing index. 100% anonymous. Takes under 60 seconds.
          </p>
        </div>

        {/* Progress Bar */}
        {!isSubmitted && (
          <div className="mb-8 max-w-md mx-auto w-full">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
              <span>Progress</span>
              <span>Step {step} of {TOTAL_STEPS}</span>
            </div>
            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden border border-gray-300">
              <div
                className="bg-emerald-600 h-full transition-all duration-300 ease-out shadow-sm"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* White Card Container */}
        <div className="bg-white/95 border border-gray-200/90 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-xl relative">
          
          {/* Back button */}
          {!isSubmitted && step > 1 && (
            <button
              onClick={() => changeStep(step - 1)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 flex items-center gap-1 transition"
            >
              &larr; Back to Step {step - 1}
            </button>
          )}

          {/* ================= STEP 1: Location Dropdown ================= */}
          {step === 1 && !isSubmitted && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  Where are you (or your primary audience) located?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select your country to set dynamic local deal currency options.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Select Country / Region
                </label>
                <select
                  value={selectedCountry.name}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-4 text-base font-bold text-slate-900 focus:outline-none focus:border-emerald-600 shadow-sm"
                >
                  {ORDERED_COUNTRIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.currency})
                    </option>
                  ))}
                </select>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-emerald-950">
                      Currency Anchor:
                    </span>{" "}
                    <span className="font-bold text-emerald-800">
                      {selectedCountry.currency}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-950 font-semibold">
                    {selectedCountry.code}
                  </span>
                </div>
              </div>

              <button
                onClick={() => changeStep(2)}
                className="w-full py-4 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-sm transition shadow-lg"
              >
                Continue to Earnings &rarr;
              </button>
            </div>
          )}

          {/* ================= STEP 2: Localized Earnings ================= */}
          {step === 2 && !isSubmitted && (
            <div className="space-y-6">
              <div>
                <div className="inline-block text-xs font-semibold text-emerald-900 bg-emerald-100 px-3 py-1 rounded border border-emerald-300 mb-2">
                  Currency: {selectedCountry.currency} ({selectedCountry.name})
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  Approximately how much were you paid for the last deal?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select the bracket corresponding to your total payout.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {currentBrackets.map((bracket) => (
                  <button
                    key={bracket}
                    onClick={() => handleEarningsSelect(bracket)}
                    className={`p-4 rounded-xl text-left border-2 font-bold text-xs transition duration-150 ${
                      earningsBracket === bracket
                        ? "bg-emerald-50 border-emerald-600 text-emerald-950 shadow-md"
                        : "bg-slate-50/80 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    {bracket}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= STEP 3: Multi-Select Platforms ================= */}
          {step === 3 && !isSubmitted && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  Which platform was this collaboration for?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select all platforms included in this deal (Multi-select).
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PLATFORMS.map((plat) => {
                  const isSelected = selectedPlatforms.includes(plat);
                  return (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => togglePlatform(plat)}
                      className={`p-4 rounded-xl text-left border-2 font-bold text-sm transition duration-150 flex items-center justify-between ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-600 text-emerald-950 shadow-md"
                          : "bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{plat}</span>
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center text-xs font-semibold ${
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected ? "✓" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => changeStep(4)}
                className="w-full py-4 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-sm transition shadow-lg"
              >
                Continue to Content Deliverables &rarr;
              </button>
            </div>
          )}

          {/* ================= STEP 4: Deliverables & Quantities ================= */}
          {step === 4 && !isSubmitted && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  What content items were included in the deal?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Specify quantities for deliverables across your selected platforms.
                </p>
              </div>

              <div className="space-y-4">
                {selectedPlatforms.map((plat) => {
                  const items = PLATFORM_DELIVERABLES[plat] || [plat + " Content"];
                  return (
                    <div
                      key={plat}
                      className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3"
                    >
                      <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                        {plat} Deliverables
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {items.map((item) => {
                          const count = deliverablesCount[item] || 0;
                          return (
                            <div
                              key={item}
                              className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between"
                            >
                              <span className="text-xs font-semibold text-slate-800">
                                {item}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateDeliverableQuantity(item, -1)}
                                  className="w-7 h-7 rounded bg-slate-200 hover:bg-slate-300 font-bold text-slate-800 flex items-center justify-center text-sm"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center text-xs font-semibold text-slate-900">
                                  {count}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateDeliverableQuantity(item, 1)}
                                  className="w-7 h-7 rounded bg-emerald-600 hover:bg-emerald-700 font-bold text-white flex items-center justify-center text-sm"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => changeStep(5)}
                className="w-full py-4 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-sm transition shadow-lg"
              >
                Continue to Creator Profile &rarr;
              </button>
            </div>
          )}

          {/* ================= STEP 5: Creator Profile ================= */}
          {step === 5 && !isSubmitted && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  Tell us about your content &amp; audience size
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Helps index rate benchmarks against account scale and niche.
                </p>
              </div>

              <div className="space-y-4">
                {/* Primary Content Niche */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Primary Content Niche
                  </label>
                  <select
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    {NICHES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Your Followers */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Your Followers
                  </label>
                  <select
                    value={followerTier}
                    onChange={(e) => setFollowerTier(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    {FOLLOWER_TIERS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Engagement Rate */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Average Engagement Rate
                  </label>
                  <select
                    value={engagementRate}
                    onChange={(e) => setEngagementRate(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
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
                onClick={() => changeStep(6)}
                className="w-full py-4 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-sm transition shadow-lg"
              >
                Continue to Deal Terms &rarr;
              </button>
            </div>
          )}

          {/* ================= STEP 6: Commercial Scope ================= */}
          {step === 6 && !isSubmitted && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  Which commercial terms were included in this price?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Click anywhere on a line to check/uncheck (Multi-select).
                </p>
              </div>

              <div className="space-y-3">
                {SCOPE_OPTIONS.map((opt) => {
                  const isChecked = dealScope.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => toggleScope(opt.id)}
                      className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all duration-150 select-none ${
                        isChecked
                          ? "bg-emerald-50 border-emerald-600 text-emerald-950 shadow-sm"
                          : "bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="mt-0.5">
                        <span
                          className={`w-5 h-5 rounded border flex items-center justify-center text-xs font-semibold ${
                            isChecked
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "border-slate-400 bg-white"
                          }`}
                        >
                          {isChecked ? "✓" : ""}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-extrabold text-sm text-slate-900">
                          {opt.label}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {opt.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleSubmitSurvey}
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm transition shadow-lg shadow-emerald-600/30"
              >
                {isSubmitting
                  ? "Submitting Anonymous Deal Data..."
                  : "Submit Anonymous Deal Data"}
              </button>
            </div>
          )}

          {/* ================= STEP 7: Completion Screen ================= */}
          {isSubmitted && (
            <div className="space-y-8 text-center py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-700 text-2xl font-bold mx-auto shadow-sm">
                ✓
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">
                  Thank You for Contributing!
                </h2>
                <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed font-medium">
                  Your deal data has been anonymously added to the SignCollab Creator Pricing Index.
                </p>
              </div>

              {/* Dynamic Progress Box per Country */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 text-left max-w-md mx-auto space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    {selectedCountry.name} Benchmark Goal
                  </span>
                  <span className="text-xs font-semibold text-emerald-950 bg-emerald-200 px-3 py-1 rounded-full border border-emerald-400">
                    {submissionCount} / {TARGET_GOAL} Submissions
                  </span>
                </div>

                {/* Progress Bar (Target 500) */}
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden border border-slate-300">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-700 shadow-sm"
                    style={{
                      width: `${Math.min(
                        100,
                        (submissionCount / TARGET_GOAL) * 100
                      )}%`,
                    }}
                  />
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  We need {TARGET_GOAL} verified deals from <strong className="text-slate-900">{selectedCountry.name}</strong> to officially unlock the regional Benchmark Report so pricing standards remain 100% accurate.
                </p>
              </div>

              {/* SignCollab Free Product Marketing Card */}
              <div className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white rounded-2xl p-6 max-w-md mx-auto text-left space-y-4 shadow-xl border border-emerald-800">
                <div className="inline-block text-[10px] font-semibold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded border border-emerald-500/30">
                  SignCollab Instant Contracts
                </div>
                <h3 className="text-lg font-black leading-tight text-white">
                  Protect Your Next Brand Collaboration for Free
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Stop executing commercial social media partnerships over transient DMs or chat logs. Generate bilaterally signed digital contracts on SignCollab with tamper-proof audit trails for free.
                </p>
                <Link
                  href="/instant"
                  className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg"
                >
                  Create Free Contract Now &rarr;
                </Link>
              </div>

              {/* Optional Email Notification Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 max-w-md mx-auto text-left space-y-3">
                <div className="text-sm font-bold text-slate-900">
                  Want to receive the full report when it unlocks?
                </div>
                <p className="text-xs text-slate-600 font-normal">
                  Enter your email below to get VIP early access to the SignCollab 2026 Creator Pricing Index for {selectedCountry.name}. (Optional)
                </p>
                {emailSubmitted ? (
                  <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-900 text-center">
                    You are on the VIP notification list for {selectedCountry.name}!
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="creator@domain.com"
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      onClick={handleSaveEmail}
                      className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-lg transition"
                    >
                      Notify Me
                    </button>
                  </div>
                )}
              </div>

              {/* Share Survey Link Button */}
              <div className="pt-2">
                <button
                  onClick={handleCopyLink}
                  className="w-full max-w-md mx-auto py-3.5 px-6 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs tracking-wider uppercase transition shadow-sm"
                >
                  {copiedLink
                    ? "Survey Link Copied to Clipboard!"
                    : "Copy Survey Link to Share with Creator Friends"}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/80 bg-white/80 backdrop-blur-md py-6 px-6 z-10 text-center text-xs text-slate-500 font-medium">
        SignCollab &copy; 2026 • Bilateral Agreement Proof-Layer &amp; Creator Rate Transparency Initiative
      </footer>
    </div>
  );
}
