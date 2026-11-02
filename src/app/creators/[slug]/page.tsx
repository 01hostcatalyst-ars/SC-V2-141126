import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveFullCreatorProfile } from "@/lib/creators/profile-resolver";
import { buildCreatorProfileJsonLd, safeJsonLdStringify } from "@/lib/creators/schema";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { CreatorProfileView } from "@/components/creators/CreatorProfileView";

// Read the latest persisted creator snapshot on every profile request.
export const dynamic = "force-dynamic";

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
    profile,
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

  // Penalty-proof, multi-country Schema.org JSON-LD structured data graph
  const baseUrl = 'https://www.signcollab.com';
  const jsonLd = buildCreatorProfileJsonLd(profile, baseUrl);

  return (
    <div className="min-h-screen bg-canvas text-zinc-900 flex flex-col font-sans">
      <PublicHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }} />
      <CreatorProfileView profile={profile} pdfPayload={pdfPayload} />
      <PublicFooter />
    </div>
  );
}
