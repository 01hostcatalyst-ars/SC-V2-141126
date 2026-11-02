import { refreshedDirectoryCard } from "@/lib/creators/refresh-directory";
import { refreshSchemaMissing } from "@/lib/creators/refresh-records";
import { resolveFullCreatorProfile } from "@/lib/creators/profile-resolver";
import { resolveAudienceCountry } from "@/lib/creators/audience-country";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { computeFlagship16KnotRates, computeFormat16KnotRate } from '@/lib/creators/profile-resolver';
import { REGIONAL_CONFIG, PRIMARY_NICHES } from '@/lib/calculator/constants';
import type { RegionCode } from '@/lib/calculator/types';

// Force dynamic SSR with live 16-knot rates
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || searchParams.get('q') || '';
    const platform = searchParams.get('platform')?.toLowerCase() || 'all';
    const country = searchParams.get('country')?.toUpperCase() || '';
    const nicheId = searchParams.get('nicheId');
    const followerTier = searchParams.get('tier')?.toLowerCase();
    const minFollowersParam = searchParams.get('minFollowers');
    const maxFollowersParam = searchParams.get('maxFollowers');
    const minRateParam = searchParams.get('minRate');
    const maxRateParam = searchParams.get('maxRate');
    const hasEmail = searchParams.get('hasEmail') === 'true';
    const isClaimedParam = searchParams.get('isClaimed');
    const sort = searchParams.get('sort') || 'followers_desc';

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(60, Math.max(1, parseInt(searchParams.get('limit') || '24', 10)));
    const skip = (page - 1) * limit;

    // Build Prisma where conditions
    const where: Prisma.CreatorIdentityClusterWhereInput = {};

    // 1. Search Query
    if (search.trim()) {
      const cleanSearch = search.trim().replace(/^@+/, '');
      where.OR = [
        { canonicalName: { contains: cleanSearch, mode: 'insensitive' } },
        { brandName: { contains: cleanSearch, mode: 'insensitive' } },
        { youtubeHandle: { contains: cleanSearch, mode: 'insensitive' } },
        { instagramUsername: { contains: cleanSearch, mode: 'insensitive' } },
        { tiktokUsername: { contains: cleanSearch, mode: 'insensitive' } },
        { slug: { contains: cleanSearch, mode: 'insensitive' } },
      ];
    }

    // 2. Platform Filter
    if (platform === 'youtube') {
      where.youtubeHandle = { not: null };
    } else if (platform === 'instagram') {
      where.instagramUsername = { not: null };
    } else if (platform === 'tiktok') {
      where.tiktokUsername = { not: null };
    }

    // 3. Country Filter
    if (country && country !== 'ALL') {
      where.countryCode = country;
    }

    // 4. Primary Niche Filter
    if (nicheId && !isNaN(parseInt(nicheId, 10))) {
      where.primaryNicheId = parseInt(nicheId, 10);
    }

    // 5. Follower Tiers / Range
    let minFollowers: bigint | undefined;
    let maxFollowers: bigint | undefined;

    if (followerTier) {
      switch (followerTier) {
        case 'nano':
          minFollowers = BigInt(0);
          maxFollowers = BigInt(10000);
          break;
        case 'micro':
          minFollowers = BigInt(10000);
          maxFollowers = BigInt(50000);
          break;
        case 'mid':
          minFollowers = BigInt(50000);
          maxFollowers = BigInt(250000);
          break;
        case 'macro':
          minFollowers = BigInt(250000);
          maxFollowers = BigInt(1000000);
          break;
        case 'mega':
          minFollowers = BigInt(1000000);
          break;
      }
    } else {
      if (minFollowersParam && !isNaN(parseInt(minFollowersParam, 10))) {
        minFollowers = BigInt(parseInt(minFollowersParam, 10));
      }
      if (maxFollowersParam && !isNaN(parseInt(maxFollowersParam, 10))) {
        maxFollowers = BigInt(parseInt(maxFollowersParam, 10));
      }
    }

    if (minFollowers !== undefined || maxFollowers !== undefined) {
      where.combinedFollowers = {};
      if (minFollowers !== undefined) where.combinedFollowers.gte = minFollowers;
      if (maxFollowers !== undefined) where.combinedFollowers.lte = maxFollowers;
    }

    // 6. Pricing Range Filter
    if (minRateParam && !isNaN(parseInt(minRateParam, 10))) {
      where.typicalRateMaxUsd = { gte: parseInt(minRateParam, 10) };
    }
    if (maxRateParam && !isNaN(parseInt(maxRateParam, 10))) {
      where.typicalRateMinUsd = { lte: parseInt(maxRateParam, 10) };
    }

    // 7. Verified Commercial Contact
    if (hasEmail) {
      where.verifiedEmail = { not: null };
    }

    // 8. Claimed Status
    if (isClaimedParam === 'true') {
      where.isClaimed = true;
    } else if (isClaimedParam === 'false') {
      where.isClaimed = false;
    }

    // 9. Sorting
    let orderBy: Prisma.CreatorIdentityClusterOrderByWithRelationInput = { combinedFollowers: 'desc' };
    switch (sort) {
      case 'followers_asc':
        orderBy = { combinedFollowers: 'asc' };
        break;
      case 'rate_desc':
        orderBy = { typicalRateMaxUsd: 'desc' };
        break;
      case 'rate_asc':
        orderBy = { typicalRateMinUsd: 'asc' };
        break;
      case 'name_asc':
        orderBy = { canonicalName: 'asc' };
        break;
      case 'recent':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { combinedFollowers: 'desc' };
    }

    // Execute queries in parallel
    const [totalCount, creators] = await Promise.all([
      prisma.creatorIdentityCluster.count({ where }),
      prisma.creatorIdentityCluster.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          canonicalName: true,
          brandName: true,
          primaryNicheId: true,
          primaryNicheName: true,
          countryCode: true,
          youtubeHandle: true,
          instagramUsername: true,
          tiktokUsername: true,
          combinedFollowers: true,
          primaryPlatform: true,
          avatarUrl: true,
          verifiedEmail: true,
          typicalRateMinUsd: true,
          typicalRateMaxUsd: true,
          avgEngagementRate: true,
          isClaimed: true,
          verificationLevel: true,
          createdAt: true,
        },
      }),
    ]);

    // Batch fetch latest platform metrics & AI intelligence for returned creators
    const ytHandles = creators.map((c) => c.youtubeHandle).filter(Boolean) as string[];
    const igHandles = creators.map((c) => c.instagramUsername).filter(Boolean) as string[];
    const ttHandles = creators.map((c) => c.tiktokUsername).filter(Boolean) as string[];
    const allIntelHandles = Array.from(
      new Set(
        creators.flatMap((c) => [
          c.youtubeHandle,
          c.instagramUsername,
          c.tiktokUsername,
          c.canonicalName,
          c.slug,
        ]).filter(Boolean) as string[]
      )
    );

    const [ytScrapes, igScrapes, ttScrapes, intelRecords] = await Promise.all([
      ytHandles.length > 0
        ? prisma.youTubeScrape.findMany({
            where: {
              OR: [
                ...ytHandles.map((h) => ({ handle: h })),
                ...ytHandles.map((h) => ({ handle: `@${h}` })),
              ],
            },
            select: {
              handle: true,
              subscriberCount: true,
              stats: true,
              avgViewsPerVideo: true,
              longVideos: true,
              shortVideos: true,
              avatarUrl: true,
            },
            orderBy: { createdAt: 'desc' },
          })
        : [],
      igHandles.length > 0
        ? prisma.instagramScrape.findMany({
            where: {
              OR: [
                ...igHandles.map((h) => ({ instagramUsername: h })),
                ...igHandles.map((h) => ({ instagramUsername: `@${h}` })),
              ],
            },
            select: {
              instagramUsername: true,
              followerCount: true,
              avgEngagementRate: true,
              stats: true,
              avatarUrl: true,
            },
            orderBy: { createdAt: 'desc' },
          })
        : [],
      ttHandles.length > 0
        ? prisma.tikTokScrape.findMany({
            where: {
              OR: [
                ...ttHandles.map((h) => ({ tiktokUsername: h })),
                ...ttHandles.map((h) => ({ tiktokUsername: `@${h}` })),
              ],
            },
            select: {
              tiktokUsername: true,
              followerCount: true,
              avgEngagementRate: true,
              stats: true,
              avatarUrl: true,
            },
            orderBy: { createdAt: 'desc' },
          })
        : [],
      allIntelHandles.length > 0
        ? prisma.creatorIntelligence.findMany({
            where: {
              OR: [
                ...allIntelHandles.map((h) => ({ creatorHandle: { equals: h.toLowerCase(), mode: 'insensitive' as const } })),
                ...allIntelHandles.map((h) => ({ creatorHandle: { equals: `@${h.toLowerCase()}`, mode: 'insensitive' as const } })),
              ],
            },
            orderBy: { createdAt: 'desc' },
          })
        : [],
    ]);

    // Build lookup maps by clean handle
    const ytMap = new Map<string, {
      followers: number;
      er: number;
      lfEr: number;
      sfEr: number;
      hasActualShorts: boolean;
      avgShortViews: number;
      avgShortLikes: number;
      avgShortComments: number;
      avgViews?: number;
      avgLikes?: number;
      avgComments?: number;
      avatarUrl?: string | null;
    }>();
    for (const s of ytScrapes) {
      const cleanH = (s.handle || '').toLowerCase().replace(/^@+/, '');
      if (cleanH) {
        const stats: any = s.stats || {};
        const lf = stats?.avgLongEngagementRate ? Number(stats.avgLongEngagementRate) : (stats?.lfEr ? Number(stats.lfEr) : 1.8);
        const sf = stats?.avgShortEngagementRate ? Number(stats.avgShortEngagementRate) : (stats?.sfEr ? Number(stats.sfEr) : 2.5);
        const subs = Number(s.subscriberCount || 0);
        const avgViews = Number(stats?.avgLongVideoViews || s.avgViewsPerVideo || 0) || Math.max(1000, Math.round(subs * 0.08));

        const longVideosList = Array.isArray(s.longVideos) ? (s.longVideos as any[]) : [];
        const sampleLongVids = longVideosList.filter((v: any) => v.isErSample);
        const targetLongVids = sampleLongVids.length > 0 ? sampleLongVids : longVideosList;

        let avgLikes = 0;
        let avgComments = 0;
        if (targetLongVids.length > 0) {
          avgLikes = Math.round(targetLongVids.reduce((sum: number, v: any) => sum + Number(v.likeCount || 0), 0) / targetLongVids.length);
          avgComments = Math.round(targetLongVids.reduce((sum: number, v: any) => sum + Number(v.commentCount || 0), 0) / targetLongVids.length);
        } else {
          avgLikes = Math.round(avgViews * (lf / 100));
          avgComments = Math.round(avgLikes * 0.08);
        }

        // Match the profile resolver's Shorts sampling and input preparation.
        const shortVideosList = Array.isArray(s.shortVideos) ? (s.shortVideos as any[]) : [];
        const hasActualShorts = shortVideosList.length > 0 || Number(stats?.totalShortVideosFetched || 0) > 0;
        const avgShortViews = hasActualShorts && Number(stats?.avgShortVideoViews || 0) > 0
          ? Number(stats.avgShortVideoViews) : 0;
        const sampleShortVids = shortVideosList.filter((v: any) => v.isErSample);
        const targetShortVids = sampleShortVids.length > 0 ? sampleShortVids : shortVideosList;
        let avgShortLikes = 0;
        let avgShortComments = 0;
        if (targetShortVids.length > 0) {
          avgShortLikes = Math.round(targetShortVids.reduce((sum: number, v: any) => sum + Number(v.likeCount || 0), 0) / targetShortVids.length);
          avgShortComments = Math.round(targetShortVids.reduce((sum: number, v: any) => sum + Number(v.commentCount || 0), 0) / targetShortVids.length);
        } else if (hasActualShorts && Number(stats?.avgShortEngagementRate || 0) > 0 && avgShortViews > 0) {
          avgShortLikes = Math.round(avgShortViews * (Number(stats.avgShortEngagementRate) / 100));
          avgShortComments = Math.round(avgShortLikes * 0.05);
        }

        const existing = ytMap.get(cleanH);
        if (!existing) {
          ytMap.set(cleanH, {
            followers: subs,
            er: lf,
            lfEr: lf,
            sfEr: sf,
            hasActualShorts,
            avgShortViews,
            avgShortLikes,
            avgShortComments,
            avgViews,
            avgLikes,
            avgComments,
            avatarUrl: s.avatarUrl || null,
          });
        } else if (!existing.avatarUrl && s.avatarUrl) {
          existing.avatarUrl = s.avatarUrl;
        }
      }
    }

    const igMap = new Map<string, {
      followers: number;
      er: number;
      avgViews?: number;
      avgLikes?: number;
      avgComments?: number;
      avatarUrl?: string | null;
    }>();
    for (const s of igScrapes) {
      const cleanH = s.instagramUsername.toLowerCase().replace(/^@+/, '');
      if (cleanH) {
        const stats: any = s.stats || {};
        const er = s.avgEngagementRate ? Number(Number(s.avgEngagementRate).toFixed(2)) : (stats?.avgEngagementRate ? Number(stats.avgEngagementRate) : 3.2);
        const followers = Number(s.followerCount || 0);
        const avgLikes = Number(stats?.avgLikesPerPost || stats?.avgLikes || Math.round(followers * (er / 100)));
        const avgComments = Number(stats?.avgCommentsPerPost || stats?.avgComments || Math.round(avgLikes * 0.04));
        const avgViews = Number(stats?.avgViewsPerPost || stats?.avgViews || Math.round(followers * 0.12));

        const existing = igMap.get(cleanH);
        if (!existing) {
          igMap.set(cleanH, {
            followers,
            er,
            avgViews,
            avgLikes,
            avgComments,
            avatarUrl: s.avatarUrl || null,
          });
        } else if (!existing.avatarUrl && s.avatarUrl) {
          existing.avatarUrl = s.avatarUrl;
        }
      }
    }

    const ttMap = new Map<string, {
      followers: number;
      er: number;
      avgViews?: number;
      avgLikes?: number;
      avgComments?: number;
      avatarUrl?: string | null;
    }>();
    for (const s of ttScrapes) {
      const cleanH = s.tiktokUsername.toLowerCase().replace(/^@+/, '');
      if (cleanH) {
        const stats: any = s.stats || {};
        const er = s.avgEngagementRate ? Number(Number(s.avgEngagementRate).toFixed(2)) : (stats?.avgEngagementRate ? Number(stats.avgEngagementRate) : 4.5);
        const followers = Number(s.followerCount || 0);
        const avgLikes = Number(stats?.avgLikesPerVideo || stats?.avgLikes || Math.round(followers * (er / 100)));
        const avgComments = Number(stats?.avgCommentsPerVideo || stats?.avgComments || Math.round(avgLikes * 0.03));
        const avgViews = Number(stats?.avgViewsPerVideo || stats?.avgViews || Math.round(followers * 0.18));

        const existing = ttMap.get(cleanH);
        if (!existing) {
          ttMap.set(cleanH, {
            followers,
            er,
            avgViews,
            avgLikes,
            avgComments,
            avatarUrl: s.avatarUrl || null,
          });
        } else if (!existing.avatarUrl && s.avatarUrl) {
          existing.avatarUrl = s.avatarUrl;
        }
      }
    }

    const intelMap = new Map<string, any>();
    for (const intel of intelRecords) {
      const cleanH = intel.creatorHandle.toLowerCase().replace(/^@+/, '');
      if (!intelMap.has(cleanH)) {
        intelMap.set(cleanH, intel);
      }
    }

    // Format safe response with BigInt serialization & platform breakdowns
    const formattedCreators = creators.map((c) => {
      const cleanYt = c.youtubeHandle ? c.youtubeHandle.toLowerCase().replace(/^@+/, '') : null;
      const cleanIg = c.instagramUsername ? c.instagramUsername.toLowerCase().replace(/^@+/, '') : null;
      const cleanTt = c.tiktokUsername ? c.tiktokUsername.toLowerCase().replace(/^@+/, '') : null;

      const ytData = cleanYt ? ytMap.get(cleanYt) : null;
      const igData = cleanIg ? igMap.get(cleanIg) : null;
      const ttData = cleanTt ? ttMap.get(cleanTt) : null;

      // Find matching intelligence dossier
      const candidates = [
        c.slug,
        c.youtubeHandle,
        c.instagramUsername,
        c.tiktokUsername,
        c.canonicalName,
      ].filter(Boolean) as string[];

      // Aliases identify one creator; select by freshness, not alias priority.
      const foundIntel = candidates
        .map((cand) => intelMap.get(cand.toLowerCase().replace(/^@+/, '')))
        .filter(Boolean)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;

      const rawLlm: any = foundIntel?.rawLlmResponse || {};
      const rawAudience = rawLlm?.audience || foundIntel?.audienceIntelligence || {};
      const audienceText = (value: unknown): string | undefined =>
        typeof value === "string" && value.trim() ? value.trim() : undefined;
      const audienceFit = {
        demographicProfile: audienceText(rawAudience.genderSkew)
          ? [audienceText(rawAudience.genderSkew), audienceText(rawAudience.likelyAgeRange)].filter(Boolean).join(" · ")
          : audienceText(rawAudience.demographicProfile) || audienceText(rawAudience.profile),
        commercialBuyerIntent: audienceText(rawAudience.purchaseIntent)
          ? `${audienceText(rawAudience.purchaseIntent)} Intent`
          : audienceText(rawAudience.audienceIntent),
        interests: Array.isArray(rawAudience.interests)
          ? rawAudience.interests.filter((item: unknown): item is string => typeof item === "string" && item.trim().length > 0)
          : [],
      };
      const subNicheName: string | null =
        rawLlm?.profile?.subNiche?.name ||
        (Array.isArray(foundIntel?.secondaryNiches) && foundIntel.secondaryNiches[0] ? String(foundIntel.secondaryNiches[0]) : null) ||
        null;
      const subNicheId: number | undefined = rawLlm?.profile?.subNiche?.id || undefined;
      const secondaryNicheIds: number[] | undefined =
        rawLlm?.profile?.secondaryNiches?.map((s: any) => s.id) ||
        (Array.isArray(foundIntel?.secondaryNiches)
          ? (foundIntel.secondaryNiches as any[]).map((n) => typeof n === "object" && n?.id ? n.id : Number(n)).filter(Boolean)
          : undefined);
      const productionLevel: string =
        rawLlm?.content?.productionLevel ||
        rawLlm?.content?.productionStandard ||
        (foundIntel?.contentIntelligence as any)?.productionStandard ||
        "High";
      const isLuxuryOrHighEnd: boolean | undefined = rawLlm?.profile?.isLuxuryOrHighEnd;

      const primaryNicheName: string =
        c.primaryNicheName ||
        foundIntel?.primaryNicheName ||
        PRIMARY_NICHES.find((n) => n.id === c.primaryNicheId)?.name ||
        'Lifestyle & Entertainment';

      const auditedCountry = ((foundIntel?.countryCode || c.countryCode || 'US').toUpperCase()) as RegionCode;
      const regionCode: RegionCode = REGIONAL_CONFIG[auditedCountry as keyof typeof REGIONAL_CONFIG] ? auditedCountry : 'US';
      const configItem = REGIONAL_CONFIG[regionCode as keyof typeof REGIONAL_CONFIG];
      const countryName: string =
        foundIntel?.countryName ||
        configItem?.name ||
        c.countryCode ||
        'United States';

      const ytFollowers = ytData?.followers || (c.primaryPlatform === 'youtube' ? Number(c.combinedFollowers) : 0);
      const ytObj = cleanYt && ytFollowers >= 5000
        ? {
            handle: cleanYt,
            followers: ytFollowers,
            er: ytData?.er || 1.8,
            lfEr: ytData?.lfEr || 1.8,
            sfEr: ytData?.sfEr || 2.5,
            avgViews: ytData?.avgViews,
            avgLikes: ytData?.avgLikes,
            avgComments: ytData?.avgComments,
          }
        : null;

      const igFollowers = igData?.followers || (c.primaryPlatform === 'instagram' ? Number(c.combinedFollowers) : 0);
      const igObj = cleanIg && igFollowers >= 5000
        ? {
            handle: cleanIg,
            followers: igFollowers,
            er: igData?.er || (c.avgEngagementRate ? Number(c.avgEngagementRate) : 3.2),
            avgViews: igData?.avgViews,
            avgLikes: igData?.avgLikes,
            avgComments: igData?.avgComments,
          }
        : null;

      const ttFollowers = ttData?.followers || (c.primaryPlatform === 'tiktok' ? Number(c.combinedFollowers) : 0);
      const ttObj = cleanTt && ttFollowers >= 5000
        ? {
            handle: cleanTt,
            followers: ttFollowers,
            er: ttData?.er || 4.5,
            avgViews: ttData?.avgViews,
            avgLikes: ttData?.avgLikes,
            avgComments: ttData?.avgComments,
          }
        : null;

      // Calculate live 16-knot flagship deliverable rates
      const flagshipRates = computeFlagship16KnotRates({
        youtube: ytObj,
        instagram: igObj,
        tiktok: ttObj,
        primaryNicheId: c.primaryNicheId || foundIntel?.primaryNicheId,
        subNicheId,
        secondaryNicheIds,
        productionLevel,
        isLuxuryOrHighEnd,
        regionCode,
      });

      if (ytObj && ytData?.hasActualShorts) {
        const shortRate = computeFormat16KnotRate({
          platform: "youtube",
          format: "yt_short",
          label: "YouTube Short",
          followerCount: ytObj.followers,
          avgViews: ytData.avgShortViews,
          avgLikes: ytData.avgShortLikes,
          avgComments: ytData.avgShortComments,
          primaryNicheId: c.primaryNicheId || foundIntel?.primaryNicheId || 8,
          subNicheId,
          secondaryNicheIds,
          productionLevel,
          isLuxuryOrHighEnd,
          regionCode,
          observedErOverride: ytData.sfEr,
        });
        flagshipRates.push({
          platform: "youtube",
          ...shortRate,
          erPercent: ytData.sfEr,
          erLabel: `${ytData.sfEr}% Shorts Engagement`,
        });
      }

      // Platform avatar priority: YouTube -> TikTok -> Instagram -> Cluster fallback -> null
      const resolvedAvatarUrl =
        ytData?.avatarUrl ||
        ttData?.avatarUrl ||
        igData?.avatarUrl ||
        c.avatarUrl ||
        null;

      return {
        ...c,
        avatarUrl: resolvedAvatarUrl,
        primaryNicheName,
        subNicheName,
        countryName,
        countryCode: regionCode,
        combinedFollowers: Number(c.combinedFollowers),
        avgEngagementRate: c.avgEngagementRate ? Number(c.avgEngagementRate) : null,
        handles: {
          youtube: ytObj ? cleanYt : null,
          instagram: igObj ? cleanIg : null,
          tiktok: ttObj ? cleanTt : null,
        },
        platforms: {
          youtube: ytObj,
          instagram: igObj,
          tiktok: ttObj,
        },
        flagshipRates,
        audienceFit,
        creatorType: typeof rawLlm?.profile?.creatorType === 'string' ? rawLlm.profile.creatorType : foundIntel?.creatorType || null,
        primaryAudienceCountry: resolveAudienceCountry(rawAudience.primaryMarket),
      };
    });

    let completedCreators: Array<(typeof formattedCreators)[number] | import("@/components/creators/CreatorCard").CreatorItem> = formattedCreators;
    try {
      const refreshes = await prisma.creatorProfileRefresh.findMany({ where: { clusterId: { in: creators.map(creator => creator.id) } }, select: { clusterId: true }, distinct: ["clusterId"] });
      const refreshedIds = new Set(refreshes.map(refresh => refresh.clusterId));
      completedCreators = await Promise.all(formattedCreators.map(async creator => {
        if (!refreshedIds.has(creator.id) || !creator.slug) return creator;
        const profile = await resolveFullCreatorProfile(creator.slug);
        return profile ? { ...creator, ...refreshedDirectoryCard({ ...creator, slug: creator.slug }, profile) } : creator;
      }));
    } catch (error) {
      if (!refreshSchemaMissing(error)) throw error;
    }

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      creators: completedCreators,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        search,
        platform,
        country,
        nicheId: nicheId ? parseInt(nicheId, 10) : null,
        tier: followerTier || null,
        sort,
      },
    });
  } catch (error) {
    console.error('[API /creators] Query error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to query creator directory',
      },
      { status: 500 }
    );
  }
}
