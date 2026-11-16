import { getCalculatorDatabaseConstants } from '@/lib/calculator/db-service';
import { latestProfileRefresh } from "./refresh-records";
import { oldestSourceDate, sourcesFromSteps, ProfileFreshness, ProfileSources, RefreshAccounts, RefreshSteps } from "./refresh-policy";
import { prisma } from "@/lib/prisma";
import { Platform, DeliverableFormat, RegionCode } from "@/lib/calculator/types";
import {
  calculateInfluencerRate,
  roundCommercial,
} from "@/lib/calculator/engine";
import {
  generateOmnichannelPackages,
  GeneratedPackage,
  PlatformMetricsInput,
} from "@/lib/calculator/packages";
import { REGIONAL_CONFIG, PRIMARY_NICHES, SUB_NICHES } from "@/lib/calculator/constants";
import { CompleteCreatorIntelligence } from "@/lib/ai/types";

export interface DeliverableRateBenchmark {
  format: DeliverableFormat;
  label: string;
  recommendedAmount: number;
  formattedRecommended: string;
  lowAmount: number;
  formattedLow: string;
  highAmount: number;
  formattedHigh: string;
  currency: string;
  symbol: string;
}

export interface PlatformResolvedState {
  platform: Platform;
  handle: string;
  followerCount: number;
  formattedFollowers: string;
  observedEr: number;
  benchmarkEr: number;
  lfEr?: number;
  sfEr?: number;
  avgViews?: number;
  avgShortViews?: number;
  rates: DeliverableRateBenchmark[];
}

export interface FullResolvedCreatorProfile {
  freshness?: ProfileFreshness;
  clusterId: string;
  slug: string;
  canonicalName: string;
  brandName: string;
  avatarUrl: string | null;
  verifiedEmail: string | null;
  isClaimed: boolean;
  verificationLevel: string;
  countryCode: RegionCode;
  countryName: string;
  primaryPlatform: Platform;
  combinedFollowers: number;
  formattedCombinedFollowers: string;
  activePlatformCount: number;
  platforms: {
    youtube: PlatformResolvedState | null;
    instagram: PlatformResolvedState | null;
    tiktok: PlatformResolvedState | null;
  };
  intelligence: {
    oneLineSummary: string;
    brandSummary: string;
    detailedSummary: string;
    creatorType: string;
    profilePositioning: string;
    primaryNicheName: string;
    primaryNicheId: number;
    subNicheName?: string;
    subNicheId?: number;
    microNiches: string[];
    confidenceScore: number;
    modelConfidenceText: string;
    executiveBrief?: {
      whoTheyAre?: string;
      theSuperpower?: string;
      audiencePsychology?: string;
      theLandmine?: string;
      vanityVoucher?: string;
    };
    audience?: {
      demographicProfile?: string;
      commercialBuyerIntent?: string;
      primaryMarket?: string;
      secondaryMarkets?: string[];
      interests?: string[];
    };
    content?: {
      dominantFormat?: string;
      productionStandard?: string;
      publishingConsistency?: string;
      themes: Array<{ name: string; percentage: number }>;
    };
    brandFit?: {
      commercialIntent?: string;
      brandSuitability?: string;
      bestFitCategories?: string[];
    };
    strengths: Array<{ area: string; description: string }>;
    considerations: Array<{ area: string; description: string }>;
    brandSafety: {
      overallRisk: string;
      reviewRecommended?: boolean;
      observedRiskSignals?: string[];
    };
  };
  omnichannelPackages: GeneratedPackage[];
  recentMedia: {
    collectedAt?: Partial<Record<Platform, string>>;
    youtubeVideos: any[];
    instagramPosts: any[];
    tiktokVideos: any[];
  };
  completeIntelligence?: CompleteCreatorIntelligence | null;
}

/**
 * Formats follower counts into clean compact representations (e.g. 27.7M, 5.1M, 850K)
 */
export function formatCompactFollowers(num: number): string {
  if (!num || isNaN(num)) return "0";
  if (num >= 1_000_000_000) {
    const v = (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "");
    return `${v}B`;
  }
  if (num >= 1_000_000) {
    const v = (num / 1_000_000).toFixed(1).replace(/\.0$/, "");
    return `${v}M`;
  }
  if (num >= 1_000) {
    const v = (num / 1_000).toFixed(1).replace(/\.0$/, "");
    return `${v}K`;
  }
  return num.toLocaleString();
}

/**
 * Computes exact 16-knot deliverable benchmark rates for a specific platform and format
 */
export function computeFormat16KnotRate(params: {
  platform: Platform;
  format: DeliverableFormat;
  label: string;
  followerCount: number;
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  avgShares?: number;
  primaryNicheId: number;
  subNicheId?: number;
  secondaryNicheIds?: number[];
  productionLevel?: string;
  isLuxuryOrHighEnd?: boolean;
  regionCode: RegionCode;
  observedErOverride?: number;
}): DeliverableRateBenchmark {
  const currency = REGIONAL_CONFIG[params.regionCode]?.currency || "USD";
  const symbol = REGIONAL_CONFIG[params.regionCode]?.symbol || "$";

  const pricing = calculateInfluencerRate({
    creator: {
      primaryPlatform: params.platform,
      followerCount: params.followerCount,
      last3PostsAvgViews: params.avgViews,
      last3PostsAvgLikes: params.avgLikes,
      last3PostsAvgComments: params.avgComments,
      last3PostsAvgShares: params.avgShares || 0,
      primaryNicheId: params.primaryNicheId,
      subNicheId: params.subNicheId,
      secondaryNicheIds: params.secondaryNicheIds,
      productionLevel: params.productionLevel,
      isLuxuryOrHighEnd: params.isLuxuryOrHighEnd,
      regionCode: params.regionCode,
    },
    deliverables: [
      {
        id: "1",
        platform: params.platform,
        format: params.format,
        quantity: 1,
        isYouTubeShort: params.format === "yt_short",
      },
    ],
    commercialTerms: {
      usageRights: { scope: "organic_repost", duration: "30_days" },
    },
  });

  const rec = pricing.valuationRange.typicalMedian;
  const low = pricing.valuationRange.lowP25;
  const high = pricing.valuationRange.highP75;

  return {
    format: params.format,
    label: params.label,
    recommendedAmount: rec,
    formattedRecommended: pricing.valuationRange.formatted.typical,
    lowAmount: low,
    formattedLow: pricing.valuationRange.formatted.low,
    highAmount: high,
    formattedHigh: pricing.valuationRange.formatted.high,
    currency,
    symbol,
  };
}

export interface FlagshipDeliverableRate {
  platform: Platform;
  format: DeliverableFormat;
  label: string;
  recommendedAmount: number;
  formattedRecommended: string;
  lowAmount: number;
  formattedLow: string;
  highAmount: number;
  formattedHigh: string;
  currency: string;
  symbol: string;
  erPercent: number;
  erLabel: string;
}

/**
 * Computes live 16-knot flagship deliverable rates for each linked platform on creator cards
 */
export function computeFlagship16KnotRates(params: {
  youtube?: {
    followers: number;
    er?: number;
    lfEr?: number;
    sfEr?: number;
    avgViews?: number;
    avgLikes?: number;
    avgComments?: number;
  } | null;
  instagram?: {
    followers: number;
    er?: number;
    avgViews?: number;
    avgLikes?: number;
    avgComments?: number;
  } | null;
  tiktok?: {
    followers: number;
    er?: number;
    avgViews?: number;
    avgLikes?: number;
    avgComments?: number;
  } | null;
  primaryNicheId?: number | null;
  subNicheId?: number | null;
  secondaryNicheIds?: number[] | null;
  productionLevel?: string | null;
  isLuxuryOrHighEnd?: boolean | null;
  regionCode?: string | null;
}): FlagshipDeliverableRate[] {
  const rates: FlagshipDeliverableRate[] = [];
  const primaryNicheId = params.primaryNicheId || 8;
  const subNicheId = params.subNicheId || undefined;
  const secondaryNicheIds = params.secondaryNicheIds || undefined;
  const productionLevel = params.productionLevel || "High";
  const isLuxuryOrHighEnd = params.isLuxuryOrHighEnd ?? undefined;
  const regionCode: RegionCode = (params.regionCode as RegionCode) || "US";

  // 1. YouTube Flagship: YouTube Dedicated Video
  if (params.youtube && params.youtube.followers > 0) {
    const subs = params.youtube.followers;
    const lfEr = Number(params.youtube.lfEr || params.youtube.er || 1.45);
    const avgViews =
      params.youtube.avgViews !== undefined && params.youtube.avgViews > 0
        ? params.youtube.avgViews
        : Math.max(1000, Math.round(subs * 0.08));
    const avgLikes =
      params.youtube.avgLikes !== undefined && params.youtube.avgLikes > 0
        ? params.youtube.avgLikes
        : Math.round(avgViews * (lfEr / 100));
    const avgComments =
      params.youtube.avgComments !== undefined && params.youtube.avgComments >= 0
        ? params.youtube.avgComments
        : Math.round(avgLikes * 0.08);

    const ytDedicated = computeFormat16KnotRate({
      platform: "youtube",
      format: "yt_dedicated",
      label: "YouTube Dedicated Video",
      followerCount: subs,
      avgViews,
      avgLikes,
      avgComments,
      primaryNicheId,
      subNicheId,
      secondaryNicheIds,
      productionLevel,
      isLuxuryOrHighEnd,
      regionCode,
      observedErOverride: lfEr,
    });

    rates.push({
      platform: "youtube",
      ...ytDedicated,
      erPercent: lfEr,
      erLabel: `${lfEr.toFixed(2).replace(/\.00$/, "")}% Long-Form Video Engagement`,
    });
  }

  // 2. Instagram Flagship: Instagram Reel (60–90s)
  if (params.instagram && params.instagram.followers > 0) {
    const followers = params.instagram.followers;
    const er = Number(params.instagram.er || 1.47);
    const avgViews =
      params.instagram.avgViews !== undefined && params.instagram.avgViews > 0
        ? params.instagram.avgViews
        : Math.round(followers * 0.12);
    const avgLikes =
      params.instagram.avgLikes !== undefined && params.instagram.avgLikes > 0
        ? params.instagram.avgLikes
        : Math.round(followers * (er / 100));
    const avgComments =
      params.instagram.avgComments !== undefined && params.instagram.avgComments >= 0
        ? params.instagram.avgComments
        : Math.round(avgLikes * 0.04);

    const igReel = computeFormat16KnotRate({
      platform: "instagram",
      format: "ig_reel",
      label: "Instagram Reel (60–90s)",
      followerCount: followers,
      avgViews,
      avgLikes,
      avgComments,
      primaryNicheId,
      subNicheId,
      secondaryNicheIds,
      productionLevel,
      isLuxuryOrHighEnd,
      regionCode,
      observedErOverride: er,
    });

    rates.push({
      platform: "instagram",
      ...igReel,
      erPercent: er,
      erLabel: `${er.toFixed(2).replace(/\.00$/, "")}% Observed Engagement Rate`,
    });
  }

  // 3. TikTok Flagship: TikTok Video (Dedicated)
  if (params.tiktok && params.tiktok.followers > 0) {
    const followers = params.tiktok.followers;
    const er = Number(params.tiktok.er || 4.24);
    const avgViews =
      params.tiktok.avgViews !== undefined && params.tiktok.avgViews > 0
        ? params.tiktok.avgViews
        : Math.round(followers * 0.18);
    const avgLikes =
      params.tiktok.avgLikes !== undefined && params.tiktok.avgLikes > 0
        ? params.tiktok.avgLikes
        : Math.round(followers * (er / 100));
    const avgComments =
      params.tiktok.avgComments !== undefined && params.tiktok.avgComments >= 0
        ? params.tiktok.avgComments
        : Math.round(avgLikes * 0.03);

    const ttDedicated = computeFormat16KnotRate({
      platform: "tiktok",
      format: "tiktok_video",
      label: "TikTok Video (Dedicated)",
      followerCount: followers,
      avgViews,
      avgLikes,
      avgComments,
      primaryNicheId,
      subNicheId,
      secondaryNicheIds,
      productionLevel,
      isLuxuryOrHighEnd,
      regionCode,
      observedErOverride: er,
    });

    rates.push({
      platform: "tiktok",
      ...ttDedicated,
      erPercent: er,
      erLabel: `${er.toFixed(2).replace(/\.00$/, "")}% Observed Engagement Rate`,
    });
  }

  return rates;
}

/**
 * Resolves full 16-knot multi-factor intelligence dossier for a creator by slug or handle
 */
export async function resolveFullCreatorProfile(
  slugOrHandle: string,
  options: { sources?: ProfileSources; accounts?: RefreshAccounts } = {}
): Promise<FullResolvedCreatorProfile | null> {
  const clean = decodeURIComponent(slugOrHandle).toLowerCase().trim().replace(/^@+/, "");

  // 1. Resolve Identity Cluster
  const savedCluster = await prisma.creatorIdentityCluster.findFirst({
    where: {
      OR: [
        { slug: clean },
        { youtubeHandle: clean },
        { instagramUsername: clean },
        { tiktokUsername: clean },
      ],
    },
  });

  if (!savedCluster) return null;
  const cluster = options.accounts ? { ...savedCluster,
    youtubeHandle: options.accounts.youtube || savedCluster.youtubeHandle,
    instagramUsername: options.accounts.instagram || savedCluster.instagramUsername,
    tiktokUsername: options.accounts.tiktok || savedCluster.tiktokUsername } : savedCluster;
  const refresh = options.sources ? null : await latestProfileRefresh(cluster.id);

  // 2. Fetch Latest Creator Intelligence Dossier
  const handlesToSearch = [
    cluster.youtubeHandle,
    cluster.instagramUsername,
    cluster.tiktokUsername,
    cluster.canonicalName,
  ].filter(Boolean) as string[];

  const latestIntel = await prisma.creatorIntelligence.findFirst({
    where: {
      OR: [
        ...handlesToSearch.map((h) => ({ creatorHandle: { equals: h, mode: "insensitive" as const } })),
        ...handlesToSearch.map((h) => ({ creatorHandle: { equals: `@${h}`, mode: "insensitive" as const } })),
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  const newerOrdinaryAnalysis = refresh && latestIntel && !latestIntel.youtubeScrapeId && !latestIntel.instagramScrapeId && !latestIntel.tiktokScrapeId && latestIntel.id !== refresh.intelligenceId
    && latestIntel.createdAt.getTime() > (refresh.completedAt || refresh.createdAt).getTime();
  const refreshStillActive = refresh && ["collecting", "analyzing"].includes(refresh.status) && refresh.expiresAt.getTime() > Date.now();
  if (refresh && refresh.status !== "completed" && (refreshStillActive || !newerOrdinaryAnalysis)) {
    const baseline = refresh.baselineProfile as unknown as FullResolvedCreatorProfile;
    return { ...baseline, isClaimed: cluster.isClaimed, verifiedEmail: cluster.verifiedEmail, verificationLevel: cluster.verificationLevel };
  }
  const sources = options.sources || (refresh?.status === "completed" && !newerOrdinaryAnalysis
    ? sourcesFromSteps(refresh.steps as RefreshSteps, refresh.intelligenceId) : undefined);
  const intel = sources ? (sources.intelligence ? await prisma.creatorIntelligence.findUnique({ where: { id: sources.intelligence } }) : null) : latestIntel;

  // 3. Fetch Raw Scrapes for All Three Platforms
  const [ytScrape, igScrape, ttScrape] = await Promise.all([
    cluster.youtubeHandle
      ? sources ? (sources.youtube ? prisma.youTubeScrape.findUnique({ where: { id: sources.youtube } }) : null) : prisma.youTubeScrape.findFirst({
          where: {
            OR: [
              { handle: cluster.youtubeHandle },
              { handle: `@${cluster.youtubeHandle}` },
            ],
          },
          orderBy: { createdAt: "desc" },
        })
      : null,
    cluster.instagramUsername
      ? sources ? (sources.instagram ? prisma.instagramScrape.findUnique({ where: { id: sources.instagram } }) : null) : prisma.instagramScrape.findFirst({
          where: {
            OR: [
              { instagramUsername: cluster.instagramUsername },
              { instagramUsername: `@${cluster.instagramUsername}` },
            ],
          },
          orderBy: { createdAt: "desc" },
        })
      : null,
    cluster.tiktokUsername
      ? sources ? (sources.tiktok ? prisma.tikTokScrape.findUnique({ where: { id: sources.tiktok } }) : null) : prisma.tikTokScrape.findFirst({
          where: {
            OR: [
              { tiktokUsername: cluster.tiktokUsername },
              { tiktokUsername: `@${cluster.tiktokUsername}` },
            ],
          },
          orderBy: { createdAt: "desc" },
        })
      : null,
  ]);

  const rawLlm: any = intel?.rawLlmResponse || {};
  const completeIntel: CompleteCreatorIntelligence | undefined = rawLlm?.profile
    ? (rawLlm as CompleteCreatorIntelligence)
    : undefined;

  const primaryNicheId = (sources ? intel?.primaryNicheId : cluster.primaryNicheId) || intel?.primaryNicheId || 8;
  const primaryNicheName =
    (sources ? intel?.primaryNicheName : cluster.primaryNicheName) ||
    intel?.primaryNicheName ||
    PRIMARY_NICHES.find((n) => n.id === primaryNicheId)?.name ||
    "Lifestyle & Entertainment";

  const subNicheId = completeIntel?.profile?.subNiche?.id || undefined;
  const subNicheName = completeIntel?.profile?.subNiche?.name || undefined;

  const secondaryNicheIds: number[] | undefined =
    completeIntel?.profile?.secondaryNiches?.map((s) => s.id) ||
    (Array.isArray(intel?.secondaryNiches)
      ? (intel.secondaryNiches as any[]).map((n) => (typeof n === "object" && n?.id ? n.id : Number(n))).filter(Boolean)
      : undefined);

  const rawContent = rawLlm?.content || (intel?.contentIntelligence as any) || {};
  const rawProfile = rawLlm?.profile || {};
  const productionLevel: string =
    completeIntel?.content?.productionLevel ||
    rawContent?.productionLevel ||
    rawContent?.productionStandard ||
    (intel?.contentIntelligence as any)?.productionStandard ||
    "Medium-High";

  const isLuxuryOrHighEnd: boolean | undefined =
    rawProfile?.isLuxuryOrHighEnd !== undefined
      ? rawProfile.isLuxuryOrHighEnd
      : undefined;

  const auditedCountry = (intel?.countryCode || cluster.countryCode || "US").toUpperCase() as RegionCode;
  const regionCode: RegionCode = REGIONAL_CONFIG[auditedCountry] ? auditedCountry : "US";
  const regionConfig = REGIONAL_CONFIG[regionCode] || REGIONAL_CONFIG.US;

  // 4. Resolve Platform Metrics and 16-Knot Itemized Rates
  const platformInputs: Record<Platform, PlatformMetricsInput> = {
    youtube: { status: "idle", followerCount: 0, engagementRate: 0, avgViews: 0, avgLikes: 0, avgComments: 0 },
    instagram: { status: "idle", followerCount: 0, engagementRate: 0, avgViews: 0, avgLikes: 0, avgComments: 0 },
    tiktok: { status: "idle", followerCount: 0, engagementRate: 0, avgViews: 0, avgLikes: 0, avgComments: 0 },
  };

  let resolvedYoutube: PlatformResolvedState | null = null;
  let resolvedInstagram: PlatformResolvedState | null = null;
  let resolvedTiktok: PlatformResolvedState | null = null;

  // A. YouTube Resolution
  if (cluster.youtubeHandle && (Number(ytScrape?.subscriberCount || 0) > 0 || ytScrape)) {
    const subs = Number(ytScrape?.subscriberCount || 0);
    const ytStats = ytScrape?.stats as any;
    const avgViews = Number(ytStats?.avgLongVideoViews || ytScrape?.avgViewsPerVideo || 0) || Math.max(1000, Math.round(subs * 0.08));
    const lfEr = Number(ytStats?.avgLongEngagementRate || ytStats?.lfEr || ytStats?.engagementRate || 1.45);
    const sfEr = Number(ytStats?.avgShortEngagementRate || ytStats?.sfEr || 2.73);

    const longVideosList = Array.isArray(ytScrape?.longVideos) ? (ytScrape.longVideos as any[]) : [];
    const sampleLongVids = longVideosList.filter((v: any) => v.isErSample);
    const targetLongVids = sampleLongVids.length > 0 ? sampleLongVids : longVideosList;

    let avgLikes = 0;
    let avgComments = 0;
    if (targetLongVids.length > 0) {
      avgLikes = Math.round(targetLongVids.reduce((s: number, v: any) => s + Number(v.likeCount || 0), 0) / targetLongVids.length);
      avgComments = Math.round(targetLongVids.reduce((s: number, v: any) => s + Number(v.commentCount || 0), 0) / targetLongVids.length);
    } else {
      avgLikes = Math.round(avgViews * (lfEr / 100));
      avgComments = Math.round(avgLikes * 0.08);
    }

    const shortVideosList = Array.isArray(ytScrape?.shortVideos) ? (ytScrape.shortVideos as any[]) : [];
    const hasActualShorts = shortVideosList.length > 0 || Number(ytStats?.totalShortVideosFetched || 0) > 0;
    const avgShortViews = hasActualShorts && Number(ytStats?.avgShortVideoViews || 0) > 0
      ? Number(ytStats.avgShortVideoViews)
      : 0;
    const sampleShortVids = shortVideosList.filter((v: any) => v.isErSample);
    const targetShortVids = sampleShortVids.length > 0 ? sampleShortVids : shortVideosList;
    let avgShortLikes = 0;
    let avgShortComments = 0;
    if (targetShortVids.length > 0) {
      avgShortLikes = Math.round(targetShortVids.reduce((s: number, v: any) => s + Number(v.likeCount || 0), 0) / targetShortVids.length);
      avgShortComments = Math.round(targetShortVids.reduce((s: number, v: any) => s + Number(v.commentCount || 0), 0) / targetShortVids.length);
    } else if (hasActualShorts && Number(ytStats?.avgShortEngagementRate || 0) > 0 && avgShortViews > 0) {
      avgShortLikes = Math.round(avgShortViews * (Number(ytStats.avgShortEngagementRate) / 100));
      avgShortComments = Math.round(avgShortLikes * 0.05);
    }

    platformInputs.youtube = {
      status: "ready",
      username: cluster.youtubeHandle,
      followerCount: subs,
      engagementRate: lfEr,
      longEngagementRate: lfEr,
      shortEngagementRate: hasActualShorts ? sfEr : undefined,
      avgViews,
      avgLikes,
      avgComments,
      avgShortViews,
      avgShortLikes,
      avgShortComments,
    };

    const dedicatedRate = computeFormat16KnotRate({
      platform: "youtube",
      format: "yt_dedicated",
      label: "YouTube Dedicated Video",
      followerCount: subs,
      avgViews,
      avgLikes,
      avgComments,
      primaryNicheId,
      subNicheId,
      secondaryNicheIds,
      productionLevel,
      isLuxuryOrHighEnd,
      regionCode,
      observedErOverride: lfEr,
    });

    const integrationRate = computeFormat16KnotRate({
      platform: "youtube",
      format: "yt_integrated",
      label: "YouTube 60s Integration",
      followerCount: subs,
      avgViews,
      avgLikes,
      avgComments,
      primaryNicheId,
      subNicheId,
      secondaryNicheIds,
      productionLevel,
      isLuxuryOrHighEnd,
      regionCode,
      observedErOverride: lfEr,
    });

    const shortRate = computeFormat16KnotRate({
      platform: "youtube",
      format: "yt_short",
      label: "YouTube Short",
      followerCount: subs,
      avgViews: avgShortViews,
      avgLikes: avgShortLikes,
      avgComments: avgShortComments,
      primaryNicheId,
      subNicheId,
      secondaryNicheIds,
      productionLevel,
      isLuxuryOrHighEnd,
      regionCode,
      observedErOverride: hasActualShorts ? sfEr : undefined,
    });

    resolvedYoutube = {
      platform: "youtube",
      handle: cluster.youtubeHandle,
      followerCount: subs,
      formattedFollowers: formatCompactFollowers(subs),
      observedEr: lfEr,
      benchmarkEr: 1.5,
      lfEr,
      sfEr: hasActualShorts ? sfEr : undefined,
      avgViews,
      avgShortViews,
      rates: [dedicatedRate, integrationRate, shortRate],
    };
  }

  // B. Instagram Resolution
  if (cluster.instagramUsername && (Number(igScrape?.followerCount || 0) > 0 || igScrape)) {
    const igFollowers = Number(igScrape?.followerCount || 0);
    const igStats = igScrape?.stats as any;
    const igEr = Number(igScrape?.avgEngagementRate || igStats?.avgEngagementRate || igStats?.engagementRate || 2.15);
    const avgLikes = Number(igStats?.avgLikesPerPost || igStats?.avgLikes || Math.round(igFollowers * (igEr / 100)));
    const avgComments = Number(igStats?.avgCommentsPerPost || igStats?.avgComments || Math.round(avgLikes * 0.04));
    const avgViews = Number(igStats?.avgViewsPerPost || igStats?.avgViews || Math.round(igFollowers * 0.12));

    platformInputs.instagram = {
      status: "ready",
      username: cluster.instagramUsername,
      followerCount: igFollowers,
      engagementRate: igEr,
      avgViews,
      avgLikes,
      avgComments,
    };

    const reelRate = computeFormat16KnotRate({
      platform: "instagram",
      format: "ig_reel",
      label: "Instagram Reel (60-90s)",
      followerCount: igFollowers,
      avgViews,
      avgLikes,
      avgComments,
      primaryNicheId,
      subNicheId,
      secondaryNicheIds,
      productionLevel,
      isLuxuryOrHighEnd,
      regionCode,
      observedErOverride: igEr,
    });

    const carouselRate = computeFormat16KnotRate({
      platform: "instagram",
      format: "ig_carousel",
      label: "Instagram Carousel (3-5 Slides)",
      followerCount: igFollowers,
      avgViews,
      avgLikes,
      avgComments,
      primaryNicheId,
      subNicheId,
      secondaryNicheIds,
      productionLevel,
      isLuxuryOrHighEnd,
      regionCode,
      observedErOverride: igEr,
    });

    const staticRate = computeFormat16KnotRate({
      platform: "instagram",
      format: "ig_static",
      label: "Instagram Static Post",
      followerCount: igFollowers,
      avgViews,
      avgLikes,
      avgComments,
      primaryNicheId,
      subNicheId,
      secondaryNicheIds,
      productionLevel,
      isLuxuryOrHighEnd,
      regionCode,
      observedErOverride: igEr,
    });

    const storyRate = computeFormat16KnotRate({
      platform: "instagram",
      format: "ig_story",
      label: "Instagram Story (3-Frame Set)",
      followerCount: igFollowers,
      avgViews,
      avgLikes,
      avgComments,
      primaryNicheId,
      subNicheId,
      secondaryNicheIds,
      productionLevel,
      isLuxuryOrHighEnd,
      regionCode,
      observedErOverride: igEr,
    });

    resolvedInstagram = {
      platform: "instagram",
      handle: cluster.instagramUsername,
      followerCount: igFollowers,
      formattedFollowers: formatCompactFollowers(igFollowers),
      observedEr: igEr,
      benchmarkEr: 1.8,
      avgViews,
      rates: [reelRate, carouselRate, staticRate, storyRate],
    };
  }

  // C. TikTok Resolution
  if (cluster.tiktokUsername && (Number(ttScrape?.followerCount || 0) > 0 || ttScrape)) {
    const ttFollowers = Number(ttScrape?.followerCount || 0);
    const ttStats = ttScrape?.stats as any;
    const ttEr = Number(ttScrape?.avgEngagementRate || ttStats?.avgEngagementRate || ttStats?.engagementRate || 4.5);
    const avgViews = Number(ttStats?.avgViewsPerVideo || ttStats?.avgViews || Math.round(ttFollowers * 0.18));
    const avgLikes = Number(ttStats?.avgLikesPerVideo || ttStats?.avgLikes || Math.round(avgViews * (ttEr / 100)));
    const avgComments = Number(ttStats?.avgCommentsPerVideo || ttStats?.avgComments || Math.round(avgLikes * 0.05));
    const avgShares = Number(ttStats?.avgSharesPerVideo || ttStats?.avgShares || 0);

    platformInputs.tiktok = {
      status: "ready",
      username: cluster.tiktokUsername,
      followerCount: ttFollowers,
      engagementRate: ttEr,
      avgViews,
      avgLikes,
      avgComments,
    };

    const ttRate = computeFormat16KnotRate({
      platform: "tiktok",
      format: "tiktok_video",
      label: "TikTok Video (Dedicated)",
      followerCount: ttFollowers,
      avgViews,
      avgLikes,
      avgComments,
      avgShares: 0,
      primaryNicheId,
      subNicheId,
      secondaryNicheIds,
      productionLevel,
      isLuxuryOrHighEnd,
      regionCode,
      observedErOverride: ttEr,
    });

    resolvedTiktok = {
      platform: "tiktok",
      handle: cluster.tiktokUsername,
      followerCount: ttFollowers,
      formattedFollowers: formatCompactFollowers(ttFollowers),
      observedEr: ttEr,
      benchmarkEr: 4.0,
      avgViews,
      rates: [ttRate],
    };
  }

  // 5. Generate 5 Omnichannel Strategy Packages
  if (completeIntel && completeIntel.content) {
    completeIntel.content.productionLevel = completeIntel.content.productionLevel || productionLevel;
  }

  const omnichannelPackages = generateOmnichannelPackages(
    platformInputs,
    cluster.brandName || cluster.canonicalName,
    primaryNicheId,
    subNicheId,
    regionCode,
    completeIntel,
    {
      constants: await getCalculatorDatabaseConstants(),
      contentRates: {
        instagram: Object.fromEntries((resolvedInstagram?.rates ?? []).map(rate => [rate.format, rate.recommendedAmount])),
        youtube: Object.fromEntries((resolvedYoutube?.rates ?? []).map(rate => [rate.format, rate.recommendedAmount])),
        tiktok: Object.fromEntries((resolvedTiktok?.rates ?? []).map(rate => [rate.format, rate.recommendedAmount])),
      },
    }
  );

  const rawExecutiveBrief = rawLlm?.omnichannelStrategySuite?.creatorExecutiveBrief;
  const rawAudience = rawLlm?.audience || (intel?.audienceIntelligence as any) || {};
  // Reuse rawContent declared in step 4
  const rawCommercial = rawLlm?.commercialIntelligence || rawLlm?.commercial || (intel?.commercialIntel as any) || {};
  const rawBrandFit = rawLlm?.brandFit || (intel?.brandFit as any) || {};
  const rawSafety = rawLlm?.brandSafety || (intel?.brandSafety as any) || { overallRisk: "Low" };

  // Parse Content Themes with percentages
  let parsedThemes: Array<{ name: string; percentage: number }> = [];
  if (Array.isArray(rawLlm?.contentThemes) && rawLlm.contentThemes.length > 0) {
    parsedThemes = rawLlm.contentThemes.map((t: any) => ({
      name: t.theme || t.name || "Content Focus",
      percentage: typeof t.strength === "number" ? Math.round(t.strength * 100) : (t.percentage || 85),
    }));
  } else if (Array.isArray(intel?.contentThemes) && (intel.contentThemes as any[]).length > 0) {
    parsedThemes = (intel.contentThemes as any[]).map((t: any) => ({
      name: typeof t === "string" ? t : t.name || t.theme || "Content Focus",
      percentage: typeof t === "object" && t.percentage ? t.percentage : (typeof t === "object" && t.strength ? Math.round(t.strength * 100) : 85),
    }));
  } else if (rawContent?.topThemes && Array.isArray(rawContent.topThemes)) {
    parsedThemes = rawContent.topThemes.map((t: any) => ({
      name: typeof t === "string" ? t : t.name || t.theme || "Content Focus",
      percentage: typeof t === "object" && t.percentage ? t.percentage : 85,
    }));
  }

  if (parsedThemes.length === 0) {
    parsedThemes = [
      { name: `${primaryNicheName} Demonstrations`, percentage: 92 },
      { name: "Industry Reviews & Comparisons", percentage: 84 },
      { name: "Everyday Workflow & Highlights", percentage: 76 },
    ];
  }

  const activePlatformCount = [resolvedYoutube, resolvedInstagram, resolvedTiktok].filter(Boolean).length;
  const totalCombinedFollowers =
    (resolvedYoutube?.followerCount || 0) +
    (resolvedInstagram?.followerCount || 0) +
    (resolvedTiktok?.followerCount || 0) || Number(cluster.combinedFollowers);

  return {
    freshness: {
      oldestSourceAt: oldestSourceDate([
        ...(cluster.youtubeHandle ? [ytScrape?.lastScrapedAt || ytScrape?.createdAt] : []),
        ...(cluster.instagramUsername ? [igScrape?.lastScrapedAt || igScrape?.createdAt] : []),
        ...(cluster.tiktokUsername ? [ttScrape?.lastScrapedAt || ttScrape?.createdAt] : []),
        intel?.createdAt,
      ]),
      sources: { youtube: ytScrape?.id, instagram: igScrape?.id, tiktok: ttScrape?.id, intelligence: intel?.id },
    },
    clusterId: cluster.id,
    slug: cluster.slug || clean,
    canonicalName: cluster.canonicalName,
    brandName: cluster.brandName || cluster.canonicalName,
    avatarUrl:
      ytScrape?.avatarUrl ||
      ttScrape?.avatarUrl ||
      igScrape?.avatarUrl ||
      cluster.avatarUrl ||
      null,
    verifiedEmail: cluster.verifiedEmail,
    isClaimed: cluster.isClaimed,
    verificationLevel: cluster.verificationLevel,
    countryCode: regionCode,
    countryName: regionConfig.name,
    primaryPlatform: (cluster.primaryPlatform as Platform) || "youtube",
    combinedFollowers: totalCombinedFollowers,
    formattedCombinedFollowers: totalCombinedFollowers.toLocaleString(),
    activePlatformCount,
    platforms: {
      youtube: resolvedYoutube,
      instagram: resolvedInstagram,
      tiktok: resolvedTiktok,
    },
    intelligence: {
      oneLineSummary:
        rawLlm?.summary?.oneLine ||
        intel?.oneLineSummary ||
        `${cluster.brandName || cluster.canonicalName} is an authoritative digital creator in ${primaryNicheName}.`,
      brandSummary: rawLlm?.summary?.brandSummary || intel?.brandSummary || "",
      detailedSummary: rawLlm?.summary?.detailedSummary || intel?.detailedSummary || "",
      creatorType: rawLlm?.profile?.creatorType || intel?.creatorType || "Digital Content Creator",
      profilePositioning:
        rawLlm?.profile?.profilePositioning ||
        intel?.profilePositioning ||
        `Authoritative editorial content and commercial sponsor activations across ${primaryNicheName}.`,
      primaryNicheName,
      primaryNicheId,
      subNicheName,
      subNicheId,
      microNiches: Array.isArray(rawLlm?.profile?.microNiches) && rawLlm.profile.microNiches.length > 0
        ? rawLlm.profile.microNiches
        : Array.isArray(intel?.microNiches) ? intel.microNiches : [],
      confidenceScore: completeIntel?.confidence?.audience ? completeIntel.confidence.audience : (intel?.identityConfidence || 0.88),
      modelConfidenceText: `High (${Math.round((completeIntel?.confidence?.audience || intel?.identityConfidence || 0.88) * 100)}%)`,
      executiveBrief: rawExecutiveBrief
        ? {
            whoTheyAre: rawExecutiveBrief.whoTheyAre,
            theSuperpower: rawExecutiveBrief.theSuperpower,
            audiencePsychology: rawExecutiveBrief.audiencePsychology,
            theLandmine: rawExecutiveBrief.theLandmine,
            vanityVoucher: rawExecutiveBrief.recommendedVoucherPrefix,
          }
        : undefined,
      audience: {
        demographicProfile:
          rawAudience?.genderSkew
            ? `${rawAudience.genderSkew}, ${rawAudience.likelyAgeRange || "18-34"}`
            : (rawAudience?.demographicProfile || rawAudience?.profile || "18-34 demographic, high purchase intent"),
        commercialBuyerIntent: rawAudience?.purchaseIntent ? `${rawAudience.purchaseIntent} Intent` : (rawAudience?.audienceIntent || "High Intent"),
        primaryMarket: rawAudience?.primaryMarket || regionConfig.name,
        secondaryMarkets: Array.isArray(rawAudience?.secondaryMarkets) && rawAudience.secondaryMarkets.length > 0
          ? rawAudience.secondaryMarkets
          : ["United Arab Emirates", "Saudi Arabia", "United Kingdom"],
        interests: Array.isArray(rawAudience?.interests) ? rawAudience.interests : [],
      },
      content: {
        dominantFormat: rawContent?.dominantFormat || "Long-form video",
        productionStandard: rawContent?.productionLevel || "High / Studio Grade",
        publishingConsistency: rawContent?.contentConsistency || rawContent?.publishingConsistency || "High",
        themes: parsedThemes,
      },
      brandFit: {
        commercialIntent: rawCommercial?.commercialIntent || "High Purchase Consideration",
        brandSuitability: rawBrandFit?.brandSuitability || "High",
        bestFitCategories: Array.isArray(rawBrandFit?.bestFitCategories) && rawBrandFit.bestFitCategories.length > 0
          ? rawBrandFit.bestFitCategories
          : Array.isArray(rawCommercial?.bestFitCategories) && rawCommercial.bestFitCategories.length > 0
          ? rawCommercial.bestFitCategories
          : [primaryNicheName],
      },
      strengths: Array.isArray(rawLlm?.strengths) && rawLlm.strengths.length > 0
        ? (rawLlm.strengths as any[])
        : Array.isArray(intel?.strengths) ? (intel.strengths as any[]) : [],
      considerations: Array.isArray(rawLlm?.considerations) && rawLlm.considerations.length > 0
        ? (rawLlm.considerations as any[])
        : Array.isArray(intel?.considerations) ? (intel.considerations as any[]) : [],
      brandSafety: {
        overallRisk: rawSafety?.overallRisk || "Low Risk",
        reviewRecommended: rawSafety?.reviewRecommended || false,
        observedRiskSignals: Array.isArray(rawSafety?.observedRiskSignals) ? rawSafety.observedRiskSignals : [],
      },
    },
    omnichannelPackages,
    recentMedia: {
      collectedAt: Object.fromEntries(Object.entries({ youtube: ytScrape, instagram: igScrape, tiktok: ttScrape }).flatMap(([platform, scrape]) => {
        const date = scrape?.lastScrapedAt || scrape?.createdAt;
        return date ? [[platform, new Date(date).toISOString()]] : [];
      })),
      youtubeVideos: [
        ...(Array.isArray(ytScrape?.longVideos) ? (ytScrape.longVideos as any[]) : []),
        ...(Array.isArray(ytScrape?.shortVideos) ? (ytScrape.shortVideos as any[]) : []),
      ],
      instagramPosts: Array.isArray(igScrape?.posts) ? (igScrape.posts as any[]) : [],
      tiktokVideos: Array.isArray(ttScrape?.videos) ? (ttScrape.videos as any[]) : [],
    },
    completeIntelligence: completeIntel || {
      profile: {
        creatorType: rawLlm?.profile?.creatorType || intel?.creatorType || "Digital Content Creator",
        profilePositioning: rawLlm?.profile?.profilePositioning || intel?.profilePositioning || "",
        primaryNiche: { id: primaryNicheId, name: primaryNicheName, multiplier: 1.0 },
        subNiche: subNicheId ? { id: subNicheId, name: subNicheName || "", multiplier: 1.0 } : undefined,
        secondaryNiches: [],
        microNiches: Array.isArray(rawLlm?.profile?.microNiches) && rawLlm.profile.microNiches.length > 0
          ? rawLlm.profile.microNiches
          : Array.isArray(intel?.microNiches) ? (intel.microNiches as string[]) : [],
        creatorDescription: rawLlm?.profile?.creatorDescription || intel?.creatorDescription || "",
        confidence: intel?.identityConfidence || 0.95,
      },
      geography: {
        countryCode: regionCode,
        countryName: regionConfig.name,
        city: null,
        region: null,
        confidence: 0.95,
        evidence: [],
      },
      audience: {
        likelyAgeRange: rawAudience?.likelyAgeRange || "18-34",
        genderSkew: rawAudience?.genderSkew || "Balanced",
        primaryMarket: rawAudience?.primaryMarket || regionConfig.name,
        secondaryMarkets: Array.isArray(rawAudience?.secondaryMarkets) ? rawAudience.secondaryMarkets : ["United Arab Emirates", "Saudi Arabia", "United Kingdom"],
        interests: Array.isArray(rawAudience?.interests) ? rawAudience.interests : [primaryNicheName],
        purchaseIntent: rawAudience?.purchaseIntent || "High",
        audienceIntent: [],
        profile: rawAudience?.profile || "18-34 demographic, high purchase intent",
        confidence: 0.9,
      },
      content: {
        themes: parsedThemes.map((t) => t.name),
        dominantFormat: rawContent?.dominantFormat || "Long-form video",
        formats: [],
        style: [],
        tone: [],
        productionLevel: rawContent?.productionLevel || "High / Studio Grade",
        contentConsistency: rawContent?.contentConsistency || "High",
        promotionalContentLevel: "Moderate",
      },
      contentThemes: parsedThemes.map((t) => ({ theme: t.name, strength: t.percentage })),
      performanceIntelligence: {
        reachLevel: "High",
        engagementQuality: "High",
        audienceResponse: "High",
        performancePattern: "Consistent",
        summary: "",
      },
      engagementIntelligence: {
        conversationLevel: "High",
        sharingPotential: "High",
        purchaseIntentSignals: "High",
        audienceBehavior: [],
      },
      commercialIntelligence: {
        commercialIntent: "High",
        brandCollaborationLikelihood: "High",
        affiliateSignals: false,
        productPromotionLevel: "Moderate",
        sponsorshipSignals: [],
      },
      brandFit: {
        bestFitCategories: Array.isArray(rawBrandFit?.bestFitCategories) && rawBrandFit.bestFitCategories.length > 0
          ? rawBrandFit.bestFitCategories
          : [primaryNicheName],
        campaignTypes: [],
        strongestPartnershipAngle: "",
        brandSuitability: "High",
      },
      brandSafety: {
        overallRisk: rawSafety?.overallRisk || "Low Risk",
        reviewRecommended: rawSafety?.reviewRecommended || false,
        observedRiskSignals: Array.isArray(rawSafety?.observedRiskSignals) ? rawSafety.observedRiskSignals : [],
      },
      strengths: Array.isArray(rawLlm?.strengths) && rawLlm.strengths.length > 0
        ? (rawLlm.strengths as any[])
        : Array.isArray(intel?.strengths) ? (intel.strengths as any[]) : [],
      considerations: Array.isArray(rawLlm?.considerations) && rawLlm.considerations.length > 0
        ? (rawLlm.considerations as any[])
        : Array.isArray(intel?.considerations) ? (intel.considerations as any[]) : [],
      partnershipRecommendations: [],
      summary: {
        oneLine: rawLlm?.summary?.oneLine || intel?.oneLineSummary || `${cluster.brandName || cluster.canonicalName} is an authoritative digital creator in ${primaryNicheName}.`,
        brandSummary: rawLlm?.summary?.brandSummary || intel?.brandSummary || "",
        detailedSummary: rawLlm?.summary?.detailedSummary || intel?.detailedSummary || "",
      },
      confidence: {
        niche: 0.95,
        country: 0.95,
        audience: 0.95,
        brandFit: 0.95,
      },
      evidence: {
        classification: [],
        geography: [],
        audience: [],
        commercial: [],
      },
      uncertainties: [],
      omnichannelStrategySuite: rawLlm?.omnichannelStrategySuite || (rawExecutiveBrief ? {
        creatorExecutiveBrief: rawExecutiveBrief,
        packages: [],
      } : undefined),
    },
  };
}
