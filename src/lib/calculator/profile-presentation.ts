import type { FullResolvedCreatorProfile, PlatformResolvedState } from "@/lib/creators/profile-resolver";
import type { CompleteCreatorIntelligence } from "@/lib/ai/types";
import type { GeneratedPackage } from "./packages";
import type { Platform, RegionCode, DeliverableFormat } from "./types";
import type { InstagramPostItem } from "@/lib/scrapers/types";
import { FORMAT_LABELS, PRIMARY_NICHES, SUB_NICHES, REGIONAL_CONFIG } from "./constants";

export interface CalculatorPlatformData {
  status: "idle" | "loading" | "ready" | "error";
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  country?: string;
  followerCount?: number;
  avgLikes?: number;
  avgComments?: number;
  avgViews?: number;
  engagementRate?: number;
  longEngagementRate?: number;
  shortEngagementRate?: number;
  avgLongViews?: number;
  avgShortViews?: number;
  avgShortLikes?: number;
  avgShortComments?: number;
  posts?: InstagramPostItem[];
  videos?: Array<Record<string, unknown>>;
  rateCardItems?: Array<{
    format: DeliverableFormat;
    amount: number;
    formattedAmount: string;
    lowAmount: number;
    formattedLow: string;
    highAmount: number;
    formattedHigh: string;
    currency: string;
    usdEquivalentFormatted?: string;
  }>;
  error?: string;
  sourceNote?: string;
  retryInput?: string;
  extractedEmail?: string;
  collectedAt?: string;
}

// Presentation adapter only: retain the calculator's amounts, metrics and sample flags.
// No database lookup, scraping, insight generation, or rate calculation occurs here.
export function buildCalculatorProfile(input: {
  creator: { displayName: string; primaryUsername: string; primaryPlatform: Platform; avatarUrl?: string; contactEmail?: string };
  platforms: Record<Platform, CalculatorPlatformData>;
  intelligence: CompleteCreatorIntelligence | null;
  packages: GeneratedPackage[];
  region: RegionCode;
  nicheId: number;
  subNicheId?: number;
}): FullResolvedCreatorProfile {
  const { creator, platforms, intelligence: intel } = input;
  const market = REGIONAL_CONFIG[input.region];
  const convert = (platform: Platform): PlatformResolvedState | null => {
    const data = platforms[platform];
    if (data.status !== "ready") return null;
    return {
      platform, handle: data.username || "", followerCount: data.followerCount || 0,
      formattedFollowers: String(data.followerCount || 0), observedEr: data.engagementRate || 0,
      benchmarkEr: data.engagementRate || 0, lfEr: data.longEngagementRate, sfEr: data.shortEngagementRate,
      avgViews: data.avgLongViews ?? data.avgViews, avgShortViews: data.avgShortViews,
      rates: (data.rateCardItems || []).map(rate => ({
        format: rate.format, label: FORMAT_LABELS[rate.format]?.label || rate.format,
        recommendedAmount: rate.amount, formattedRecommended: rate.formattedAmount,
        lowAmount: rate.lowAmount, formattedLow: rate.formattedLow,
        highAmount: rate.highAmount, formattedHigh: rate.formattedHigh,
        currency: rate.currency, symbol: market.symbol,
      })),
    };
  };
  const channels = { youtube: convert("youtube"), instagram: convert("instagram"), tiktok: convert("tiktok") };
  const audience = intel?.audience;
  const intent = audience?.purchaseIntent;
  const brief = intel?.omnichannelStrategySuite?.creatorExecutiveBrief;
  const combined = Object.values(channels).reduce((sum, data) => sum + (data?.followerCount || 0), 0);
  const collectedAt = Object.fromEntries((Object.keys(platforms) as Platform[]).flatMap(key => {
    const value = platforms[key].collectedAt;
    return channels[key] && value && Number.isFinite(Date.parse(value)) ? [[key, value]] : [];
  }));
  return {
    clusterId: "", slug: `calculator-${creator.primaryPlatform}-${creator.primaryUsername}`,
    canonicalName: creator.displayName, brandName: creator.displayName, avatarUrl: creator.avatarUrl || null,
    verifiedEmail: creator.contactEmail || null, isClaimed: false, verificationLevel: "unclaimed",
    countryCode: input.region, countryName: market.name, primaryPlatform: creator.primaryPlatform,
    combinedFollowers: combined, formattedCombinedFollowers: String(combined),
    activePlatformCount: Object.values(channels).filter(Boolean).length, platforms: channels,
    intelligence: {
      oneLineSummary: intel?.summary?.oneLine || "", brandSummary: intel?.summary?.brandSummary || "",
      detailedSummary: intel?.summary?.detailedSummary || "", creatorType: intel?.profile?.creatorType || "",
      profilePositioning: intel?.profile?.profilePositioning || "",
      primaryNicheName: PRIMARY_NICHES.find(niche => niche.id === input.nicheId)?.name || "",
      primaryNicheId: input.nicheId, subNicheName: SUB_NICHES.find(niche => niche.id === input.subNicheId)?.name,
      subNicheId: input.subNicheId, microNiches: intel?.profile?.microNiches || [],
      confidenceScore: intel?.confidence?.audience ?? 0, modelConfidenceText: "",
      executiveBrief: brief ? { ...brief, vanityVoucher: brief.recommendedVoucherPrefix } : undefined,
      audience: {
        demographicProfile: [audience?.genderSkew, audience?.likelyAgeRange].filter(Boolean).join(", "),
        commercialBuyerIntent: intent ? /intent/i.test(intent) ? intent : `${intent} Intent` : undefined,
        primaryMarket: audience?.primaryMarket, secondaryMarkets: audience?.secondaryMarkets || [],
        interests: audience?.interests || [],
      },
      content: {
        dominantFormat: intel?.content?.dominantFormat, productionStandard: intel?.content?.productionLevel,
        publishingConsistency: intel?.content?.contentConsistency,
        themes: (intel?.contentThemes || []).map(theme => ({ name: theme.theme, percentage: theme.strength })),
      },
      brandFit: { commercialIntent: intel?.commercialIntelligence?.commercialIntent,
        brandSuitability: intel?.brandFit?.brandSuitability, bestFitCategories: intel?.brandFit?.bestFitCategories || [] },
      strengths: intel?.strengths || [], considerations: intel?.considerations || [],
      brandSafety: { overallRisk: intel?.brandSafety?.overallRisk || "Not available",
        reviewRecommended: intel?.brandSafety?.reviewRecommended, observedRiskSignals: intel?.brandSafety?.observedRiskSignals || [] },
    },
    omnichannelPackages: input.packages,
    recentMedia: { collectedAt, youtubeVideos: platforms.youtube.status === "ready" ? platforms.youtube.videos || [] : [],
      instagramPosts: platforms.instagram.status === "ready" ? platforms.instagram.posts || [] : [],
      tiktokVideos: platforms.tiktok.status === "ready" ? platforms.tiktok.videos || [] : [] },
    completeIntelligence: intel,
  };
}
