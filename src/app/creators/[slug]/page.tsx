import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveFullCreatorProfile } from "@/lib/creators/profile-resolver";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  ShieldCheck,
  ExternalLink,
  Users,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileText,
  Globe,
  Mail,
  Sparkles,
  BarChart3,
  Video,
  Eye,
  Layers,
  ChevronRight,
  ShieldAlert,
  Share2,
  Download,
  Check,
  Zap,
} from "lucide-react";
import { ProfileClaimButton } from "./ProfileClaimButton";
import { ExportPdfButton } from "./ExportPdfButton";
import {
  PlatformBadge,
  YouTubeIcon,
  InstagramIcon,
  TikTokIcon,
} from "@/components/icons/PlatformIcons";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await resolveFullCreatorProfile(slug);

  if (!profile) {
    return {
      title: "Creator Profile | SignCollab",
      description: "Empirical creator market valuations and commercial intelligence dossiers.",
    };
  }

  const name = profile.brandName || profile.canonicalName;
  const followersStr = profile.formattedCombinedFollowers;

  return {
    title: `${name} - Analytics, Commercial Rates & Media Kit | SignCollab`,
    description: `Access empirical 16-knot pricing benchmarks, audited reach (${followersStr} followers), 5 omnichannel strategy packages, and contract execution for ${name}.`,
    openGraph: {
      title: `${name} | Commercial Creator Dossier`,
      description: `Audited reach of ${followersStr} followers across ${profile.activePlatformCount} platforms. Institutional 16-Knot empirical valuation and omnichannel campaign suite.`,
      images: profile.avatarUrl ? [{ url: profile.avatarUrl }] : undefined,
    },
  };
}

export default async function CreatorProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const profile = await resolveFullCreatorProfile(slug);

  if (!profile) {
    notFound();
  }

  const {
    clusterId,
    canonicalName,
    brandName,
    avatarUrl,
    verifiedEmail,
    isClaimed,
    countryCode,
    countryName,
    primaryPlatform,
    combinedFollowers,
    formattedCombinedFollowers,
    activePlatformCount,
    platforms,
    intelligence,
    omnichannelPackages,
    recentMedia,
  } = profile;

  const primaryUsername =
    platforms.youtube?.handle ||
    platforms.instagram?.handle ||
    platforms.tiktok?.handle ||
    profile.slug;

  // Find lowest and highest pricing across all deliverables for aggregate summary
  const allRates = [
    ...(platforms.youtube?.rates || []),
    ...(platforms.instagram?.rates || []),
    ...(platforms.tiktok?.rates || []),
  ];

  const minRate = allRates.length > 0 ? Math.min(...allRates.map((r) => r.lowAmount)) : 500;
  const maxRate = allRates.length > 0 ? Math.max(...allRates.map((r) => r.highAmount)) : 25000;

  // Payload for PDF Rate Card Dossier Export
  const pdfPayload = {
    creatorMeta: {
      displayName: brandName || canonicalName,
      primaryUsername: platforms.youtube?.handle || platforms.instagram?.handle || platforms.tiktok?.handle || profile.slug,
      avatarUrl: avatarUrl || undefined,
      contactEmail: verifiedEmail || undefined,
    },
    selectedRegion: (countryCode?.toUpperCase() as any) || "US",
    activeNicheName: intelligence.primaryNicheName,
    activeSubNicheName: intelligence.subNicheName,
    totalAudienceCount: Number(combinedFollowers),
    verifiedChannelsCount: activePlatformCount,
    platforms: {
      youtube: platforms.youtube
        ? {
            status: "ready",
            username: platforms.youtube.handle,
            followerCount: platforms.youtube.followerCount,
            avgViews: platforms.youtube.avgViews,
            avgLongViews: platforms.youtube.avgViews,
            avgShortViews: platforms.youtube.avgShortViews,
            engagementRate: platforms.youtube.lfEr,
            longEngagementRate: platforms.youtube.lfEr,
            shortEngagementRate: platforms.youtube.sfEr,
            rateCardItems: platforms.youtube.rates.map((r) => ({
              format: r.format,
              amount: r.recommendedAmount,
              formattedAmount: r.formattedRecommended,
              lowAmount: r.lowAmount,
              formattedLow: r.formattedLow,
              highAmount: r.highAmount,
              formattedHigh: r.formattedHigh,
              currency: r.currency,
            })),
            videos: recentMedia.youtubeVideos,
            posts: recentMedia.youtubeVideos,
          }
        : undefined,
      instagram: platforms.instagram
        ? {
            status: "ready",
            username: platforms.instagram.handle,
            followerCount: platforms.instagram.followerCount,
            avgViews: platforms.instagram.avgViews,
            engagementRate: platforms.instagram.observedEr,
            rateCardItems: platforms.instagram.rates.map((r) => ({
              format: r.format,
              amount: r.recommendedAmount,
              formattedAmount: r.formattedRecommended,
              lowAmount: r.lowAmount,
              formattedLow: r.formattedLow,
              highAmount: r.highAmount,
              formattedHigh: r.formattedHigh,
              currency: r.currency,
            })),
            posts: recentMedia.instagramPosts,
          }
        : undefined,
      tiktok: platforms.tiktok
        ? {
            status: "ready",
            username: platforms.tiktok.handle,
            followerCount: platforms.tiktok.followerCount,
            avgViews: platforms.tiktok.avgViews,
            engagementRate: platforms.tiktok.observedEr,
            rateCardItems: platforms.tiktok.rates.map((r) => ({
              format: r.format,
              amount: r.recommendedAmount,
              formattedAmount: r.formattedRecommended,
              lowAmount: r.lowAmount,
              formattedLow: r.formattedLow,
              highAmount: r.highAmount,
              formattedHigh: r.formattedHigh,
              currency: r.currency,
            })),
            videos: recentMedia.tiktokVideos,
          }
        : undefined,
    },
    recommendedPackages: omnichannelPackages,
    completeIntelligence: profile.completeIntelligence,
    instantContractUrl: `/instant?creatorName=${encodeURIComponent(brandName)}&platform=${primaryPlatform}&followers=${combinedFollowers}`,
  };

  // Schema.org JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: canonicalName,
    alternateName: brandName || undefined,
    url: `https://signcollab.com/creators/${profile.slug}`,
    image: avatarUrl || undefined,
    jobTitle: intelligence.creatorType,
    description: intelligence.oneLineSummary,
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/FollowAction",
        userInteractionCount: combinedFollowers,
      },
    ],
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: allRates[0]?.currency || (countryCode === "PK" ? "PKR" : "USD"),
      lowPrice: minRate,
      highPrice: maxRate,
      offerCount: allRates.length.toString(),
      name: "SignCollab 16-Knot Empirical Rate Card",
    },
    dateModified: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans">
      <PublicHeader />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1 pb-24">
        {/* Top Breadcrumb & Metadata Navigation */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 sticky top-0 z-30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs">
            <nav className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              <Link href="/creators" className="hover:text-zinc-900 dark:hover:text-white transition">
                Creator Directory
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-900 dark:text-white font-medium truncate max-w-[220px]">
                {brandName}
              </span>
            </nav>

          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 1: EXECUTIVE IDENTITY & HERO BANNER                    */}
        {/* ============================================================== */}
        <section className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
            {/* Top Creator Identity & Actions Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={brandName}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700 shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700 flex items-center justify-center font-bold text-2xl text-zinc-500">
                      {brandName.charAt(0)}
                    </div>
                  )}
                  {isClaimed && (
                    <div className="absolute -bottom-1 -right-1 p-1 bg-blue-600 rounded-full text-white shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                      {brandName}
                    </h1>
                    {canonicalName !== brandName && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                        ({canonicalName})
                      </span>
                    )}
                    {isClaimed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Official Verified Creator
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                        Audited Community Profile
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="font-mono text-zinc-600 dark:text-zinc-300 font-medium">
                      @{primaryUsername.replace(/^@+/, "")}
                    </span>
                    {verifiedEmail && (
                      <>
                        <span>·</span>
                        <span className="font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-zinc-400" />
                          <a
                            href={`mailto:${verifiedEmail}`}
                            className="hover:text-zinc-900 dark:hover:text-white transition"
                          >
                            {verifiedEmail}
                          </a>
                        </span>
                      </>
                    )}
                    <span>·</span>
                    <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                      {countryName} ({countryCode})
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Claim Profile + Download PDF Report */}
              <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                <ProfileClaimButton
                  creator={{
                    id: clusterId,
                    canonicalName,
                    brandName,
                    slug: profile.slug,
                    verifiedEmail,
                    youtubeHandle: platforms.youtube?.handle,
                    instagramUsername: platforms.instagram?.handle,
                    tiktokUsername: platforms.tiktok?.handle,
                  }}
                  isClaimed={isClaimed}
                />
                <ExportPdfButton payload={pdfPayload} />
              </div>
            </div>

            {/* Creator Intelligence Dossier Card (Matching Rate Calculator) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/80 space-y-3.5">
              {/* Header Badges & Positioning Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-zinc-200/60 dark:border-zinc-700/60 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 px-2.5 py-1 rounded-lg">
                    {intelligence.creatorType || "Creator"}
                  </span>
                  <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    {intelligence.primaryNicheName}
                  </span>
                  {intelligence.subNicheName && (
                    <span className="text-xs font-medium bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 px-2.5 py-1 rounded-lg border border-indigo-200/90 dark:border-indigo-800/80">
                      {intelligence.subNicheName}
                    </span>
                  )}
                  <span className="text-xs font-medium bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{countryName} ({countryCode})</span>
                  </span>
                  {intelligence.brandSafety?.overallRisk && (
                    <span className="text-xs font-medium bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${intelligence.brandSafety.overallRisk === "Low Risk" || intelligence.brandSafety.overallRisk === "Low" ? "bg-emerald-500" : "bg-amber-500"}`} />
                      <span>Safety: {intelligence.brandSafety.overallRisk}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg font-mono font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Confidence: {intelligence.modelConfidenceText}
                  </span>
                </div>
              </div>

              {/* Headline Institutional Quote */}
              {(intelligence.brandSummary || intelligence.oneLineSummary) && (
                <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800 italic">
                  &ldquo;{intelligence.brandSummary || intelligence.oneLineSummary}&rdquo;
                </p>
              )}

              {/* Micro-Niches Tags */}
              {intelligence.microNiches && intelligence.microNiches.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider font-mono">
                    Micro-Niches:
                  </span>
                  {intelligence.microNiches.map((mn, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-2.5 py-1 rounded-lg border border-zinc-200/80 dark:border-zinc-700"
                    >
                      {mn}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Platform Channel Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* YouTube Channel */}
              <div
                className={`p-4 rounded-xl border transition ${
                  platforms.youtube
                    ? "bg-white dark:bg-zinc-800/70 border-zinc-200 dark:border-zinc-700 shadow-2xs"
                    : "bg-zinc-50/50 dark:bg-zinc-900/30 border-dashed border-zinc-200 dark:border-zinc-800 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <PlatformBadge platform="youtube" size="lg" />
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                      YouTube
                    </span>
                  </div>
                  {platforms.youtube && (
                    <a
                      href={`https://youtube.com/@${platforms.youtube.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <div className="mt-3">
                  {platforms.youtube ? (
                    <>
                      <div className="text-lg font-bold text-zinc-900 dark:text-white">
                        {platforms.youtube.formattedFollowers}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-2">
                        <span>@{platforms.youtube.handle}</span>
                        <span>·</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          {platforms.youtube.lfEr}% LF ER
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-zinc-400 dark:text-zinc-500 py-1">
                      No linked channel detected
                    </div>
                  )}
                </div>
              </div>

              {/* Instagram Channel */}
              <div
                className={`p-4 rounded-xl border transition ${
                  platforms.instagram
                    ? "bg-white dark:bg-zinc-800/70 border-zinc-200 dark:border-zinc-700 shadow-2xs"
                    : "bg-zinc-50/50 dark:bg-zinc-900/30 border-dashed border-zinc-200 dark:border-zinc-800 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <PlatformBadge platform="instagram" size="lg" />
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                      Instagram
                    </span>
                  </div>
                  {platforms.instagram && (
                    <a
                      href={`https://instagram.com/${platforms.instagram.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <div className="mt-3">
                  {platforms.instagram ? (
                    <>
                      <div className="text-lg font-bold text-zinc-900 dark:text-white">
                        {platforms.instagram.formattedFollowers}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-2">
                        <span>@{platforms.instagram.handle}</span>
                        <span>·</span>
                        <span className="font-mono text-pink-600 dark:text-pink-400 font-semibold">
                          {platforms.instagram.observedEr}% ER
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-zinc-400 dark:text-zinc-500 py-1">
                      No linked Instagram handle
                    </div>
                  )}
                </div>
              </div>

              {/* TikTok Channel */}
              <div
                className={`p-4 rounded-xl border transition ${
                  platforms.tiktok
                    ? "bg-white dark:bg-zinc-800/70 border-zinc-200 dark:border-zinc-700 shadow-2xs"
                    : "bg-zinc-50/50 dark:bg-zinc-900/30 border-dashed border-zinc-200 dark:border-zinc-800 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <PlatformBadge platform="tiktok" size="lg" />
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                      TikTok
                    </span>
                  </div>
                  {platforms.tiktok && (
                    <a
                      href={`https://tiktok.com/@${platforms.tiktok.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <div className="mt-3">
                  {platforms.tiktok ? (
                    <>
                      <div className="text-lg font-bold text-zinc-900 dark:text-white">
                        {platforms.tiktok.formattedFollowers}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-2">
                        <span>@{platforms.tiktok.handle}</span>
                        <span>·</span>
                        <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                          {platforms.tiktok.observedEr}% ER
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-zinc-400 dark:text-zinc-500 py-1">
                      No linked TikTok handle
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* MAIN INTELLIGENCE DOSSIER CONTAINER                            */}
        {/* ============================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
          {/* ============================================================ */}
          {/* SECTION 2: INFERRED AUDIENCE & CONTENT DNA                   */}
          {/* ============================================================ */}
          <div className="space-y-6">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2.5">
                <Users className="w-5 h-5 text-blue-500" />
                <span>Audience Demographics &amp; Content DNA</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Audited buyer mindset, audience geography distribution, and production standards
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Inferred Audience Box */}
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                  Inferred Audience Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-zinc-400 font-semibold block">
                      Demographic Profile
                    </span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white leading-snug">
                      {intelligence.audience?.demographicProfile}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-zinc-400 font-semibold block">
                      Commercial Buyer Intent
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 leading-snug">
                      {intelligence.audience?.commercialBuyerIntent}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-zinc-400 font-semibold block">
                      Primary Market
                    </span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white leading-snug">
                      {intelligence.audience?.primaryMarket}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-zinc-400 font-semibold block">
                      Secondary Markets
                    </span>
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 leading-snug">
                      {intelligence.audience?.secondaryMarkets?.join(", ") || "Global English"}
                    </span>
                  </div>
                </div>

                {intelligence.audience?.interests && intelligence.audience.interests.length > 0 && (
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                    <span className="text-[10px] uppercase font-mono text-zinc-400 font-semibold block">
                      Audience Interests Taxonomy
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {intelligence.audience.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Content DNA & Top Themes Box */}
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                  Content DNA &amp; Top Themes
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 text-center space-y-0.5">
                    <div className="text-[10px] uppercase font-mono text-zinc-400 font-semibold">
                      Format
                    </div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                      {intelligence.content?.dominantFormat}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 text-center space-y-0.5">
                    <div className="text-[10px] uppercase font-mono text-zinc-400 font-semibold">
                      Production
                    </div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                      {intelligence.content?.productionStandard}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 text-center space-y-0.5">
                    <div className="text-[10px] uppercase font-mono text-zinc-400 font-semibold">
                      Consistency
                    </div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                      {intelligence.content?.publishingConsistency}
                    </div>
                  </div>
                </div>

                {/* Top Content Themes Progress Bars */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 font-semibold block">
                    Top Content Themes (% Affinity)
                  </span>
                  {intelligence.content?.themes.map((theme, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        <span className="truncate pr-2">{theme.name}</span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-white shrink-0">
                          {theme.percentage}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-600 dark:bg-blue-500"
                          style={{ width: `${Math.min(100, Math.max(10, theme.percentage))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 3: LIVE 16-KNOT ITEMIZED DEFENDED PRICING            */}
          {/* ============================================================ */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2.5">
                  <DollarSign className="w-5 h-5 text-amber-500" />
                  <span>Itemized 16-Knot Defended Rate Cards</span>
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Live statutory deliverable pricing calibrated for {countryName} ({countryCode})
                </p>
              </div>
              <div className="text-[11px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                Formula Verified via 16 Empirical Knots
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* YouTube Container */}
              {platforms.youtube && (
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <PlatformBadge platform="youtube" size="lg" />
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">YouTube</h3>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          {platforms.youtube.formattedFollowers} Subscribers
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800 block">
                        LF: {platforms.youtube.lfEr}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {platforms.youtube.rates.map((rate, rIdx) => (
                      <div
                        key={rIdx}
                        className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white">
                            {rate.label}
                          </span>
                          <span className="text-xs font-extrabold font-mono text-zinc-900 dark:text-white">
                            {rate.formattedRecommended}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-200/50 dark:border-zinc-800">
                          <span className="font-mono">Defended Range</span>
                          <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
                            {rate.formattedLow} – {rate.formattedHigh}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instagram Container */}
              {platforms.instagram && (
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <PlatformBadge platform="instagram" size="lg" />
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Instagram</h3>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          {platforms.instagram.formattedFollowers} Followers
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 font-semibold border border-pink-200 dark:border-pink-800 block">
                        ER: {platforms.instagram.observedEr}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {platforms.instagram.rates.map((rate, rIdx) => (
                      <div
                        key={rIdx}
                        className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white">
                            {rate.label}
                          </span>
                          <span className="text-xs font-extrabold font-mono text-zinc-900 dark:text-white">
                            {rate.formattedRecommended}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-200/50 dark:border-zinc-800">
                          <span className="font-mono">Defended Range</span>
                          <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
                            {rate.formattedLow} – {rate.formattedHigh}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TikTok Container */}
              {platforms.tiktok && (
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <PlatformBadge platform="tiktok" size="lg" />
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">TikTok</h3>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          {platforms.tiktok.formattedFollowers} Followers
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-semibold border border-cyan-200 dark:border-cyan-800 block">
                        ER: {platforms.tiktok.observedEr}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {platforms.tiktok.rates.map((rate, rIdx) => (
                      <div
                        key={rIdx}
                        className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white">
                            {rate.label}
                          </span>
                          <span className="text-xs font-extrabold font-mono text-zinc-900 dark:text-white">
                            {rate.formattedRecommended}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-200/50 dark:border-zinc-800">
                          <span className="font-mono">Defended Range</span>
                          <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
                            {rate.formattedLow} – {rate.formattedHigh}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 4: TALENT STRATEGIC DNA & EXECUTIVE BRIEF            */}
          {/* ============================================================ */}
          {intelligence.executiveBrief && (
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border border-zinc-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                    SignCollab Talent DNA Analysis
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Creator Strategic DNA &amp; Talent Executive Brief
                  </h3>
                </div>
                {intelligence.executiveBrief.vanityVoucher && (
                  <span className="text-xs font-mono px-3 py-1 rounded-lg bg-white/10 text-zinc-200 border border-white/15 self-start sm:self-center">
                    Vanity Voucher: <strong className="text-emerald-400">{intelligence.executiveBrief.vanityVoucher}10</strong>
                  </span>
                )}
              </div>

              {intelligence.executiveBrief.whoTheyAre && (
                <div className="text-sm sm:text-base font-semibold text-zinc-200 leading-relaxed">
                  {intelligence.executiveBrief.whoTheyAre}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {intelligence.executiveBrief.theSuperpower && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
                      Commercial Superpower
                    </span>
                    <p className="text-xs text-zinc-200 leading-relaxed">
                      {intelligence.executiveBrief.theSuperpower}
                    </p>
                  </div>
                )}

                {intelligence.executiveBrief.audiencePsychology && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
                      Audience Buying Mindset
                    </span>
                    <p className="text-xs text-zinc-200 leading-relaxed">
                      {intelligence.executiveBrief.audiencePsychology}
                    </p>
                  </div>
                )}
              </div>

              {/* The #1 Creative Landmine Callout */}
              {intelligence.executiveBrief.theLandmine && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-white uppercase tracking-wider text-[11px] block font-mono">
                      The #1 Creative Landmine to Avoid
                    </span>
                    <p className="text-zinc-200 text-xs leading-relaxed">
                      {intelligence.executiveBrief.theLandmine}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION 5: OMNICHANNEL STRATEGY SUITE (5 PACKAGES)           */}
          {/* ============================================================ */}
          {omnichannelPackages.length > 0 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>Omnichannel Campaign Strategy Suite</span>
                    <span className="text-xs font-mono font-normal text-zinc-500">
                      (5 Full-Funnel Packages)
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Itemized line-item pricing, strategic angles, and contract entitlements
                  </p>
                </div>
                <div className="text-[11px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  Market Applied: {countryName} ({countryCode})
                </div>
              </div>

              <div className="space-y-6">
                {omnichannelPackages.map((pkg) => {
                  const isRec = pkg.isRecommended;

                  return (
                    <div
                      key={pkg.id}
                      className={`p-6 sm:p-7 rounded-2xl bg-zinc-950 text-white shadow-xl space-y-6 border transition-all ${
                        isRec ? "border-amber-400/40 ring-1 ring-amber-400/20" : "border-white/10"
                      }`}
                    >
                      {/* Top Header: Identity & Financials */}
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 border-b border-white/10 pb-5">
                        <div className="space-y-2 max-w-2xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                              {pkg.tag}
                            </span>
                            <h3 className="text-base sm:text-lg font-bold text-white">
                              {pkg.name}
                            </h3>
                            {isRec && (
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                <span>Top Recommendation</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {pkg.objective}
                          </p>
                          {pkg.strategicRationale && (
                            <div className="text-[11px] text-zinc-400 italic bg-white/5 p-2.5 rounded-lg border border-white/5">
                              Strategy Angle: {pkg.strategicRationale}
                            </div>
                          )}
                        </div>

                        {/* Financial Summary Box */}
                        <div className="text-left lg:text-right shrink-0 bg-white/5 p-4 rounded-xl border border-white/10 space-y-1">
                          <div className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
                            Recommended Bundle Target
                          </div>
                          <div className="text-2xl font-black font-mono text-white">
                            {pkg.pricing.recommendedBundleFormatted || pkg.pricing.typicalFormatted}
                          </div>
                          <div className="text-[11px] font-mono text-zinc-400">
                            Standalone Benchmark:{" "}
                            <span className="line-through text-zinc-500">
                              {pkg.pricing.standaloneBenchmarkFormatted || pkg.pricing.typicalFormatted}
                            </span>
                            {pkg.discountPercentApplied > 0 ? (
                              <span className="text-emerald-400 font-semibold ml-1.5">
                                (-{pkg.discountPercentApplied}% Efficiency)
                              </span>
                            ) : (
                              <span className="text-zinc-400 font-medium ml-1.5">
                                (Standard Benchmark)
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400 pt-0.5">
                            Defended Range: {pkg.pricing.lowFormatted} – {pkg.pricing.highFormatted}
                          </div>
                        </div>
                      </div>

                      {/* Itemized Deliverables */}
                      <div className="space-y-3">
                        <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center justify-between">
                          <span>Itemized Deliverables &amp; Defended Rates</span>
                          <span className="text-[10px] text-zinc-500 font-mono">16-Knot Formula Verified</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {(pkg.calibratedDeliverables && pkg.calibratedDeliverables.length > 0
                            ? pkg.calibratedDeliverables
                            : pkg.deliverables.map((d) => ({
                                id: d.id,
                                phase: d.phase,
                                platform: d.platform,
                                formatKey: d.format,
                                quantity: d.quantity,
                                title: d.title,
                                description: d.description,
                                totalStandaloneFormatted: "",
                              }))
                          ).map((item, dIdx) => (
                            <div
                              key={item.id || dIdx}
                              className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-2 flex flex-col justify-between"
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="text-[9px] font-mono uppercase text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                    {item.phase}
                                  </span>
                                  <span className="text-[9px] font-mono text-zinc-300 uppercase flex items-center gap-1.5">
                                    {item.platform?.toLowerCase() === "youtube" && (
                                      <YouTubeIcon className="w-3.5 h-3.5 shrink-0" />
                                    )}
                                    {item.platform?.toLowerCase() === "instagram" && (
                                      <InstagramIcon className="w-3.5 h-3.5 shrink-0" />
                                    )}
                                    {item.platform?.toLowerCase() === "tiktok" && (
                                      <TikTokIcon className="w-3.5 h-3.5 shrink-0" />
                                    )}
                                    <span>{item.platform}</span>
                                  </span>
                                </div>
                                <div className="text-xs font-bold text-white">
                                  {item.quantity}x {item.title.replace(/^\d+x\s*/i, "").trim()}
                                </div>
                                <div className="text-[11px] text-zinc-400 leading-snug">
                                  {item.description}
                                </div>
                              </div>

                              {item.totalStandaloneFormatted && (
                                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                                  <span className="text-[10px] font-mono uppercase text-zinc-400">Standalone Rate</span>
                                  <span className="text-xs font-bold font-mono text-emerald-400">
                                    {item.totalStandaloneFormatted}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Verbatim Spoken Ad Hooks (Package 2) */}
                      {pkg.adConcepts && pkg.adConcepts.length > 0 && (
                        <div className="space-y-3 pt-3 border-t border-white/10">
                          <div className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-semibold">
                            Verbatim Spoken Ad Hooks (Opening 3–5 Seconds)
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {pkg.adConcepts.map((concept, cIdx) => (
                              <div
                                key={cIdx}
                                className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-white">{concept.conceptName}</span>
                                  <span className="text-[9px] font-mono uppercase text-cyan-400">{concept.suggestedPlatform}</span>
                                </div>
                                <div className="text-xs text-amber-200/90 font-mono italic bg-black/40 p-3 rounded-lg border border-white/5 leading-relaxed">
                                  &quot;{concept.hookVerbatim}&quot;
                                </div>
                                <div className="text-[11px] text-zinc-400 leading-snug">
                                  {concept.angleSummary}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Digital Asset Buyout Specifications (Package 4) */}
                      {pkg.concreteAssets && pkg.concreteAssets.length > 0 && (
                        <div className="space-y-2 pt-3 border-t border-white/10">
                          <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-semibold">
                            Concrete Digital Asset Buyout Specifications
                          </div>
                          <div className="space-y-1.5">
                            {pkg.concreteAssets.map((asset, aIdx) => (
                              <div
                                key={aIdx}
                                className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-200 flex items-start gap-2"
                              >
                                <span className="font-mono text-cyan-400 shrink-0 font-bold">✓</span>
                                <span>{asset.specification}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Critical Collaboration Guidelines */}
                      {pkg.collaborationGuidelines && pkg.collaborationGuidelines.length > 0 && (
                        <div className="space-y-2.5 pt-3 border-t border-white/10">
                          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                            Critical Collaboration Guidelines (Brand Safety &amp; ROI)
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {pkg.collaborationGuidelines.map((guideline, gIdx) => (
                              <div
                                key={gIdx}
                                className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1"
                              >
                                <div className="text-xs font-bold text-white">
                                  #{guideline.ruleNumber || gIdx + 1} {guideline.ruleTitle || (guideline as any).title}
                                </div>
                                <div className="text-[11px] text-zinc-300 leading-snug">
                                  {guideline.directive || (guideline as any).rule}
                                </div>
                                <div className="text-[10px] text-amber-300/80 pt-1 font-mono">
                                  Risk: {guideline.commercialRisk || (guideline as any).risk}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION 6: BRAND FIT, STRATEGIC STRENGTHS & SAFETY           */}
          {/* ============================================================ */}
          <div className="space-y-6">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Brand Fit, Strategic Strengths &amp; Procurement Safety</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Audited commercial intent, sponsor suitability, and institutional brand safety scorecard
              </p>
            </div>

            {/* Brand Suitability & Best-Fit Categories Strip */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 font-semibold block">
                    Commercial Intent
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 leading-snug">
                    {intelligence.brandFit?.commercialIntent || "High Purchase Consideration"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 font-semibold block">
                    Brand Suitability Rating
                  </span>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white leading-snug">
                    {intelligence.brandFit?.brandSuitability || "Tier-1 Commercial Validation"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 font-semibold block">
                    Brand Safety Level
                  </span>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white leading-snug">
                    {intelligence.brandSafety.overallRisk} Risk
                  </span>
                </div>
              </div>

              {intelligence.brandFit?.bestFitCategories && intelligence.brandFit.bestFitCategories.length > 0 && (
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 font-semibold block">
                    Recommended Sponsor Categories
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {intelligence.brandFit.bestFitCategories.map((cat, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Commercial Strengths */}
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Key Strategic Strengths &amp; Brand Fit
                  </h3>
                </div>

              <div className="space-y-3">
                {intelligence.strengths.length > 0 ? (
                  intelligence.strengths.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                        • {typeof item === "string" ? item : item.area || `Strength ${idx + 1}`}
                      </div>
                      {item.description && (
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed pl-3">
                          {item.description}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    High consumer trust and buying validation within {intelligence.primaryNicheName}.
                  </p>
                )}
              </div>
            </div>

            {/* Procurement Considerations & Safety */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Procurement Considerations &amp; Safety
                  </h3>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Safety: {intelligence.brandSafety.overallRisk}
                </span>
              </div>

              <div className="space-y-3">
                {intelligence.considerations.length > 0 ? (
                  intelligence.considerations.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                        • {typeof item === "string" ? item : item.area || `Clause ${idx + 1}`}
                      </div>
                      {item.description && (
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed pl-3">
                          {item.description}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Mandatory script approval timeline and category exclusivity covenants apply.
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>

          {/* ============================================================ */}
          {/* SECTION 7: LIVE MEDIA & PERFORMANCE AUDIT FEED               */}
          {/* ============================================================ */}
          {recentMedia.youtubeVideos.length > 0 && (
            <div className="space-y-4">
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2.5">
                  <Video className="w-5 h-5 text-blue-500" />
                  <span>Recent Content &amp; Performance Audit</span>
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Audited uploads with validated view counts and engagement velocity
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentMedia.youtubeVideos.slice(0, 4).map((v: any, idx: number) => (
                  <div
                    key={`yt-${idx}`}
                    className="group rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs hover:shadow-xs transition"
                  >
                    <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      {v.thumbnailUrl || v.thumbnail ? (
                        <img
                          src={v.thumbnailUrl || v.thumbnail}
                          alt={v.title || "Video thumbnail"}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <Video className="w-8 h-8 opacity-40" />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-950/80 text-white backdrop-blur-xs font-mono flex items-center gap-1.5 shadow-xs">
                        <YouTubeIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>YouTube</span>
                      </span>
                    </div>

                    <div className="p-3.5 space-y-1.5">
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-white line-clamp-2 leading-snug">
                        {v.title || "Recent Upload"}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
                        <span className="flex items-center gap-1 font-mono">
                          <Eye className="w-3 h-3" />
                          {v.viewCount ? Number(v.viewCount).toLocaleString() : "Verified"}
                        </span>
                        {v.link && (
                          <a
                            href={v.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-medium"
                          >
                            Watch
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TRANSACTION DESK & CONTRACT EXECUTION CTA                    */}
          {/* ============================================================ */}
          <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white border border-zinc-800 shadow-2xl space-y-6">
            <div className="max-w-3xl space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-semibold">
                SignCollab Bilateral Execution Protocol
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Execute a Legally Binding Agreement with {brandName}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Generate an instant bilateral sponsorship agreement with ESIGN-compliant e-signatures,
                statutory payment escrow, milestone verification, and customized IP usage rights protection.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={`/instant?creatorName=${encodeURIComponent(brandName)}&platform=${primaryPlatform}&followers=${combinedFollowers}`}
                className="flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md hover:shadow-lg transition"
              >
                <FileText className="w-4 h-4" />
                <span>Launch Agreement Generator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {verifiedEmail && (
                <a
                  href={`mailto:${verifiedEmail}?subject=Commercial%20Partnership%20Inquiry%20via%20SignCollab`}
                  className="flex items-center gap-2 px-5 py-3 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
                >
                  <Globe className="w-4 h-4" />
                  <span>Direct Business Inquiry</span>
                </a>
              )}
            </div>
          </div>

          {/* Institutional Statutory Methodology Disclaimer */}
          <div className="p-4 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            <strong className="text-zinc-700 dark:text-zinc-300">SignCollab Methodology Notice:</strong> All deliverable
            benchmarks and campaign packages are computed through the SignCollab 16-Knot Empirical Model, incorporating
            long-form view-to-subscriber ratios (VSR), short-form velocity, audience purchasing power parity (PPP), and
            category exclusivity surcharges. Rates represent defended market targets and are subject to mutual counter-party execution.
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
