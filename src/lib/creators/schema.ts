import { buildPerformanceSamples } from './performance-samples';
import { serializeJsonLd } from '@/lib/structured-data';
import { FullResolvedCreatorProfile, formatCompactFollowers } from "@/lib/creators/profile-resolver";
import { prisma } from "@/lib/prisma";
import { REGIONAL_CONFIG, PRIMARY_NICHES } from "@/lib/calculator/constants";
import type { RegionCode } from "@/lib/calculator/types";

/**
 * Builds a connected JSON-LD graph
 * for any creator profile, scaling dynamically across 3,000+ creators.
 */
export function buildCreatorProfileJsonLd(
  profile: FullResolvedCreatorProfile,
  baseUrl: string = "https://www.signcollab.com"
) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const pageUrl = `${normalizedBaseUrl}/creators/${profile.slug}`;
  const creatorId = `${pageUrl}#creator`;
  const pageId = `${pageUrl}#webpage`;
  const breadcrumbId = `${pageUrl}#breadcrumb`;
  const analysisId = `${pageUrl}#commercial-analysis`;

  const displayName = profile.brandName || profile.canonicalName;
  const isStudioOrAgency =
    /\b(studios?|media|productions?|agency|team|network|collective)\b/i.test(displayName) ||
    /\b(studio|production|agency|network|music group|band|collective)\b/i.test(profile.intelligence.creatorType || "");

  const entityType = isStudioOrAgency ? "Organization" : "Person";

  // 1. Build verified social sameAs links
  const sameAs: string[] = [];
  if (profile.platforms.youtube?.handle) {
    const handle = profile.platforms.youtube.handle.replace(/^@+/, "");
    sameAs.push(`https://www.youtube.com/@${handle}`);
  }
  if (profile.platforms.instagram?.handle) {
    const handle = profile.platforms.instagram.handle.replace(/^@+/, "");
    sameAs.push(`https://www.instagram.com/${handle}`);
  }
  if (profile.platforms.tiktok?.handle) {
    const handle = profile.platforms.tiktok.handle.replace(/^@+/, "");
    sameAs.push(`https://www.tiktok.com/@${handle}`);
  }

  // 2. Build multi-platform InteractionCounter metrics
  const interactionStatistic: any[] = [];

  if (profile.platforms.youtube && profile.platforms.youtube.followerCount > 0) {
    interactionStatistic.push({
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/FollowAction",
      "name": "YouTube Subscribers",
      "userInteractionCount": profile.platforms.youtube.followerCount,
    });
  }

  if (profile.platforms.instagram && profile.platforms.instagram.followerCount > 0) {
    interactionStatistic.push({
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/FollowAction",
      "name": "Instagram Followers",
      "userInteractionCount": profile.platforms.instagram.followerCount,
    });
  }

  if (profile.platforms.tiktok && profile.platforms.tiktok.followerCount > 0) {
    interactionStatistic.push({
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/FollowAction",
      "name": "TikTok Followers",
      "userInteractionCount": profile.platforms.tiktok.followerCount,
    });
  }

  // 3. Assemble knowledge areas & micro-niches
  const knowsAbout: string[] = Array.from(
    new Set(
      [
        profile.intelligence.primaryNicheName,
        profile.intelligence.subNicheName,
        ...(profile.intelligence.microNiches || []),
        ...(profile.intelligence.audience?.interests || []),
      ].filter((x): x is string => Boolean(x && x.trim()))
    )
  );

  // 4. Creator entity (Person or Organization)
  const creatorEntity: any = {
    "@type": entityType,
    "@id": creatorId,
    "name": profile.canonicalName || displayName,
    ...(profile.brandName && profile.brandName !== profile.canonicalName
      ? { "alternateName": profile.brandName }
      : {}),
    "url": pageUrl,
    ...(profile.avatarUrl ? { "image": profile.avatarUrl } : {}),
    ...(entityType === "Person" ? {jobTitle: profile.intelligence.creatorType || "Digital Content Creator"} : {}),
    "description":
      profile.intelligence.oneLineSummary ||
      `${displayName} is an authoritative digital creator in ${profile.intelligence.primaryNicheName}.`,
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(knowsAbout.length > 0 ? { knowsAbout } : {}),
    interactionStatistic,
  };

  // 5. Build Commercial Intelligence hasPart sections
  const analysisParts: any[] = [];

  for (const [platform, channel] of Object.entries(profile.platforms)) {
    if (!channel) continue;
    const engagement = platform === 'youtube'
      ? [channel.lfEr !== undefined ? `Long-form engagement rate: ${channel.lfEr}%` : '', channel.sfEr !== undefined ? `Shorts engagement rate: ${channel.sfEr}%` : '']
      : [Number.isFinite(channel.observedEr) ? `Engagement rate: ${channel.observedEr}%` : ''];
    analysisParts.push({'@type': 'CreativeWork', '@id': `${pageUrl}#performance-${platform}`, name: `${platform}: platform performance`, description: [`${channel.followerCount} ${platform === 'youtube' ? 'subscribers' : 'followers'}`, ...engagement].filter(Boolean).join('. '), about: {'@id': creatorId}, author: {'@id': `${normalizedBaseUrl}/#organization`}});
  }

  // Part A: Creator Strategic Brief (Superpower, Buying Mindset, Landmine)
  if (profile.intelligence.executiveBrief) {
    const brief = profile.intelligence.executiveBrief;
    const partsDesc = [
      brief.theSuperpower ? `Commercial Superpower: ${brief.theSuperpower}` : null,
      brief.audiencePsychology ? `Audience Buying Mindset: ${brief.audiencePsychology}` : null,
      brief.theLandmine ? `Key Creative Landmine to Avoid: ${brief.theLandmine}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    if (partsDesc) {
      analysisParts.push({
        "@type": "CreativeWork",
        "@id": `${pageUrl}#strategic-brief`,
        "name": `${displayName}: Creator Strategic DNA & Talent Executive Brief`,
        "description": partsDesc,
        "about": { "@id": creatorId },
      });
    }
  }

  // Part B: Procurement Considerations & Safety Guidelines
  if (
    Array.isArray(profile.intelligence.considerations) &&
    profile.intelligence.considerations.length > 0
  ) {
    const safetyLevel = profile.intelligence.brandSafety?.overallRisk || "Not assessed";
    const guidanceText = profile.intelligence.considerations
      .map((c) => `${c.area}: ${c.description}`)
      .join(" | ");

    analysisParts.push({
      "@type": "CreativeWork",
      "@id": `${pageUrl}#procurement-guidance`,
      "name": `${displayName}: Procurement Considerations & Safety Guidelines`,
      "description": `Brand Safety Assessment: ${safetyLevel}. ${guidanceText}`,
      "about": { "@id": creatorId },
    });
  }

  // Part C: Itemized 16-Knot Rate Card Benchmarks (Itemized analytical benchmarks, avoiding e-commerce Offer traps)
  const allRates = [
    ...(profile.platforms.youtube?.rates.map((r) => ({ ...r, platformName: "YouTube" })) || []),
    ...(profile.platforms.instagram?.rates.map((r) => ({ ...r, platformName: "Instagram" })) || []),
    ...(profile.platforms.tiktok?.rates.map((r) => ({ ...r, platformName: "TikTok" })) || []),
  ];

  if (allRates.length > 0) {
    analysisParts.push({
      "@type": "ItemList",
      "@id": `${pageUrl}#rate-benchmarks`,
      "name": `SignCollab 16-Knot Empirical Rate Card Benchmarks (${profile.countryName})`,
      "description": `Data-informed sponsorship rate targets and estimated ranges calibrated for ${profile.countryName}.`,
      "numberOfItems": allRates.length,
      "itemListElement": allRates.map((r, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": `${r.platformName}: ${r.label}`,
        "description": `Estimated Baseline: ${r.formattedRecommended} (Estimated Range: ${r.formattedLow} – ${r.formattedHigh})`,
      })),
    });
  }

  // Part D: Omnichannel Campaign Strategy Packages
  if (
    Array.isArray(profile.omnichannelPackages) &&
    profile.omnichannelPackages.length > 0
  ) {
    analysisParts.push({
      "@type": "ItemList",
      "@id": `${pageUrl}#campaign-packages`,
      "name": `${displayName}: Suggested Campaign Packages`,
      "numberOfItems": profile.omnichannelPackages.length,
      "itemListElement": profile.omnichannelPackages.map((pkg, idx) => {
        const targetStr =
          pkg.pricing?.recommendedBundleFormatted || pkg.pricing?.typicalFormatted;
        const rangeStr =
          pkg.pricing?.lowFormatted && pkg.pricing?.highFormatted
            ? `${pkg.pricing.lowFormatted} – ${pkg.pricing.highFormatted}`
            : "";
        return {
          "@type": "ListItem",
          "position": idx + 1,
          "name": `Package ${idx + 1} (${pkg.tag}): ${pkg.name}`,
          "description": `${pkg.objective || pkg.name}. Target Budget: ${targetStr}${rangeStr ? ` (Estimated Range: ${rangeStr})` : ""}`,
        };
      }),
    });
  }

  // Same selected and ordered calculation samples as the profile UI.
  for (const group of buildPerformanceSamples(profile.recentMedia, profile.platforms)) {
    analysisParts.push({'@type': 'ItemList', '@id': `${pageUrl}#samples-${group.id}`, name: `${group.label}: calculation samples`, numberOfItems: group.items.length,
      itemListElement: group.items.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.title,...(item.url ? {url:item.url}:{}),description:[item.views !== undefined ? `${item.views} views` : '',item.likes !== undefined ? `${item.likes} likes` : '',item.comments !== undefined ? `${item.comments} comments` : '',item.shares !== undefined ? `${item.shares} shares` : ''].filter(Boolean).join('; ')}))});
  }

  // 6. Geographic & Demographic Audience Layer
  const primaryMarket =
    profile.intelligence.audience?.primaryMarket || "";
  const secondaryMarkets =
    profile.intelligence.audience?.secondaryMarkets || [];

  const geographicArea: any[] = [
    ...(primaryMarket ? [{ "@type": "Country", "name": primaryMarket }] : []),
  ];
  for (const market of secondaryMarkets) {
    if (market && market !== primaryMarket) {
      geographicArea.push({ "@type": "Country", "name": market });
    }
  }

  // Clean positioning statement to ensure measured risk claims
  const rawPositioning =
    profile.intelligence.profilePositioning ||
    profile.intelligence.brandSummary ||
    profile.intelligence.oneLineSummary || "";
  const sanitizedPositioning = rawPositioning.replace(
    /\bzero brand safety risk\b/gi,
    "assessed as low brand safety risk"
  );

  const bestFitCategories = profile.intelligence.brandFit?.bestFitCategories || [];
  const safetyRisk = profile.intelligence.brandSafety?.overallRisk;
  const safetyKeyword = safetyRisk
    ? `${safetyRisk.replace(/\s*risk/i, "").trim()} Safety Risk`
    : "";

  const buyerIntent = profile.intelligence.audience?.commercialBuyerIntent;
  const buyerIntentKeyword = buyerIntent
    ? (buyerIntent.toLowerCase().includes("intent") ? buyerIntent : `${buyerIntent} Intent`)
    : "";

  const analysisKeywords = Array.from(
    new Set([
      ...knowsAbout,
      ...bestFitCategories,
      safetyKeyword,
      buyerIntentKeyword,
    ].filter(Boolean))
  );

  // Describe inferred creator audiences as analysis, not the intended readers of this work.
  if (profile.intelligence.audience) {
    const audience = profile.intelligence.audience;
    const details = [audience.demographicProfile, audience.commercialBuyerIntent ? `Inferred buyer intent: ${audience.commercialBuyerIntent}` : '', geographicArea.length ? `Audience markets: ${geographicArea.map(area => area.name).join(', ')}` : '', audience.interests?.length ? `Audience interests: ${audience.interests.join(', ')}` : ''].filter(Boolean).join('. ');
    if (details) analysisParts.push({'@type':'CreativeWork','@id':`${pageUrl}#audience-insights`,name:'Inferred audience insights',description:details,about:{'@id':creatorId},author:{'@id':`${normalizedBaseUrl}/#organization`}});
  }
  if (profile.intelligence.content) {
    const content = profile.intelligence.content;
    const details = [content.dominantFormat ? `Dominant format: ${content.dominantFormat}` : '', content.productionStandard ? `Production standard: ${content.productionStandard}` : '', content.publishingConsistency ? `Publishing consistency: ${content.publishingConsistency}` : '', ...content.themes.map(theme => `${theme.name}: inferred strength ${theme.percentage}/100`)].filter(Boolean).join('. ');
    if (details) analysisParts.push({'@type':'CreativeWork','@id':`${pageUrl}#content-insights`,name:'Content and theme insights',description:details,about:{'@id':creatorId},author:{'@id':`${normalizedBaseUrl}/#organization`}});
  }

  // 7. Commercial Intelligence CreativeWork (Authored & Published by SignCollab)
  const commercialAnalysis: any = {
    "@type": "CreativeWork",
    "@id": analysisId,
    "name": `${displayName}: Commercial Intelligence & Brand Fit Dossier`,
    "description": `${sanitizedPositioning} Audience, content, and brand-fit assessments are inferred insights. Prices are calculated benchmarks, not confirmed creator offers.`,
    "about": { "@id": creatorId },
    "creator": { "@id": `${normalizedBaseUrl}/#organization` },
    "author": { "@id": `${normalizedBaseUrl}/#organization` },
    "isPartOf": { "@id": pageId },
    "publisher": { "@id": `${normalizedBaseUrl}/#organization` },
    "inLanguage": "en-US",
    "keywords": analysisKeywords,
    ...(analysisParts.length > 0 ? { "hasPart": analysisParts.map(part => part['@type'] === 'ItemList' ? {
      '@type': 'CreativeWork', '@id': `${part['@id']}-report`, name: part.name,
      ...(part.description ? {description: part.description} : {}),
      author: {'@id': `${normalizedBaseUrl}/#organization`}, about: {'@id': creatorId}, mainEntity: part,
    } : part) } : {}),
  };

  // 8. BreadcrumbList
  const breadcrumbList = {
    "@type": "BreadcrumbList",
    "@id": breadcrumbId,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": normalizedBaseUrl,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Creators Directory",
        "item": `${normalizedBaseUrl}/creators`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": displayName,
        "item": pageUrl,
      },
    ],
  };

  // 9. WebPage Node
  const sourceDates = Object.values(profile.recentMedia.collectedAt || {}).filter((date): date is string => Boolean(date && Number.isFinite(Date.parse(date)))).sort((a,b)=>Date.parse(b)-Date.parse(a));
  const webPage = {
    "@type": "WebPage",
    "@id": pageId,
    "url": pageUrl,
    "name": `${displayName} — Analytics, Commercial Rates & Media Kit | SignCollab`,
    "description": `Platform-specific performance, estimated sponsorship rates, and audience and content insights for ${displayName}. Platform audiences may overlap; estimates are not confirmed creator quotes.`,
    "isPartOf": { "@id": `${normalizedBaseUrl}/#website` },
    "publisher": { "@id": `${normalizedBaseUrl}/#organization` },
    "mainEntity": { "@id": creatorId },
    "hasPart": {"@id": analysisId},
    "breadcrumb": { "@id": breadcrumbId },
    "inLanguage": "en-US",
    ...(sourceDates.length ? {dateModified: sourceDates[0]} : {}),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [webPage, creatorEntity, commercialAnalysis, breadcrumbList],
  };
}

export { buildCreatorsDirectoryJsonLd } from "./directory-schema";
export type { DirectoryCreatorPlatformData, DirectoryCreatorItem } from "./directory-schema";
import type { DirectoryCreatorItem } from "./directory-schema";

/**
 * Batch fetches top featured creators with verified scrapes, platform follower breakdowns,
 * primary and secondary niches, and regional country attribution.
 */
export async function fetchDirectoryFeaturedCreators(limit: number = 30): Promise<{
  featuredCreators: DirectoryCreatorItem[];
  totalCount: number;
}> {
  try {
    const [totalCount, clusters] = await Promise.all([
      prisma.creatorIdentityCluster.count(),
      prisma.creatorIdentityCluster.findMany({
        where: { slug: { not: null } },
        orderBy: { combinedFollowers: "desc" },
        take: limit,
      }),
    ]);

    const ytHandles = clusters.map((c) => c.youtubeHandle).filter(Boolean) as string[];
    const igHandles = clusters.map((c) => c.instagramUsername).filter(Boolean) as string[];
    const ttHandles = clusters.map((c) => c.tiktokUsername).filter(Boolean) as string[];
    const allIntelHandles = Array.from(
      new Set(
        clusters.flatMap((c) => [
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
            select: { handle: true, subscriberCount: true, avatarUrl: true },
            orderBy: { createdAt: "desc" },
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
            select: { instagramUsername: true, followerCount: true, avatarUrl: true },
            orderBy: { createdAt: "desc" },
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
            select: { tiktokUsername: true, followerCount: true, avatarUrl: true },
            orderBy: { createdAt: "desc" },
          })
        : [],
      allIntelHandles.length > 0
        ? prisma.creatorIntelligence.findMany({
            where: {
              OR: [
                ...allIntelHandles.map((h) => ({ creatorHandle: { equals: h.toLowerCase(), mode: "insensitive" as const } })),
                ...allIntelHandles.map((h) => ({ creatorHandle: { equals: `@${h.toLowerCase()}`, mode: "insensitive" as const } })),
              ],
            },
            orderBy: { createdAt: "desc" },
          })
        : [],
    ]);

    const ytMap = new Map<string, { followers: number; avatarUrl?: string | null }>();
    for (const s of ytScrapes) {
      const cleanH = (s.handle || "").toLowerCase().replace(/^@+/, "");
      if (cleanH && !ytMap.has(cleanH)) {
        ytMap.set(cleanH, { followers: Number(s.subscriberCount || 0), avatarUrl: s.avatarUrl });
      }
    }

    const igMap = new Map<string, { followers: number; avatarUrl?: string | null }>();
    for (const s of igScrapes) {
      const cleanH = (s.instagramUsername || "").toLowerCase().replace(/^@+/, "");
      if (cleanH && !igMap.has(cleanH)) {
        igMap.set(cleanH, { followers: Number(s.followerCount || 0), avatarUrl: s.avatarUrl });
      }
    }

    const ttMap = new Map<string, { followers: number; avatarUrl?: string | null }>();
    for (const s of ttScrapes) {
      const cleanH = (s.tiktokUsername || "").toLowerCase().replace(/^@+/, "");
      if (cleanH && !ttMap.has(cleanH)) {
        ttMap.set(cleanH, { followers: Number(s.followerCount || 0), avatarUrl: s.avatarUrl });
      }
    }

    const intelMap = new Map<string, any>();
    for (const intel of intelRecords) {
      const cleanH = intel.creatorHandle.toLowerCase().replace(/^@+/, "");
      if (!intelMap.has(cleanH)) {
        intelMap.set(cleanH, intel);
      }
    }

    const featuredCreators: DirectoryCreatorItem[] = clusters.map((c) => {
      const cleanYt = c.youtubeHandle ? c.youtubeHandle.toLowerCase().replace(/^@+/, "") : null;
      const cleanIg = c.instagramUsername ? c.instagramUsername.toLowerCase().replace(/^@+/, "") : null;
      const cleanTt = c.tiktokUsername ? c.tiktokUsername.toLowerCase().replace(/^@+/, "") : null;

      const ytData = cleanYt ? ytMap.get(cleanYt) : null;
      const igData = cleanIg ? igMap.get(cleanIg) : null;
      const ttData = cleanTt ? ttMap.get(cleanTt) : null;

      const candidates = [
        c.slug,
        c.youtubeHandle,
        c.instagramUsername,
        c.tiktokUsername,
        c.canonicalName,
      ].filter(Boolean) as string[];

      let foundIntel: any = null;
      for (const cand of candidates) {
        const match = intelMap.get(cand.toLowerCase().replace(/^@+/, ""));
        if (match) {
          foundIntel = match;
          break;
        }
      }

      const rawLlm: any = foundIntel?.rawLlmResponse || {};
      const subNicheName: string | null =
        rawLlm?.profile?.subNiche?.name ||
        (Array.isArray(foundIntel?.secondaryNiches) && foundIntel.secondaryNiches[0] ? String(foundIntel.secondaryNiches[0]) : null) ||
        null;

      const microNiches: string[] = Array.isArray(rawLlm?.profile?.microNiches)
        ? rawLlm.profile.microNiches
        : Array.isArray(foundIntel?.microNiches)
        ? (foundIntel.microNiches as string[])
        : [];

      const primaryNicheName: string =
        c.primaryNicheName ||
        foundIntel?.primaryNicheName ||
        PRIMARY_NICHES.find((n) => n.id === c.primaryNicheId)?.name ||
        "Lifestyle & Entertainment";

      const countryCodeKey = ((c.countryCode || foundIntel?.countryCode || "US").toUpperCase()) as RegionCode;
      const countryName = REGIONAL_CONFIG[countryCodeKey]?.name || c.countryCode || "United States";
      const followersNum = Number(c.combinedFollowers || 0);

      return {
        slug: c.slug || "",
        name: c.canonicalName,
        alternateName: c.brandName,
        avatarUrl: c.avatarUrl || ytData?.avatarUrl || igData?.avatarUrl || ttData?.avatarUrl || null,
        creatorType: rawLlm?.profile?.creatorType || foundIntel?.creatorType || null,
        primaryNiche: primaryNicheName,
        secondaryNiche: subNicheName,
        microNiches,
        countryCode: c.countryCode,
        countryName,
        combinedFollowers: followersNum,
        formattedFollowers: formatCompactFollowers(followersNum),
        platforms: {
          youtube: cleanYt
            ? {
                handle: cleanYt,
                url: `https://www.youtube.com/@${cleanYt}`,
                followerCount: ytData?.followers || (c.primaryPlatform === "youtube" ? followersNum : 0),
              }
            : null,
          instagram: cleanIg
            ? {
                handle: cleanIg,
                url: `https://www.instagram.com/${cleanIg}`,
                followerCount: igData?.followers || (c.primaryPlatform === "instagram" ? followersNum : 0),
              }
            : null,
          tiktok: cleanTt
            ? {
                handle: cleanTt,
                url: `https://www.tiktok.com/@${cleanTt}`,
                followerCount: ttData?.followers || (c.primaryPlatform === "tiktok" ? followersNum : 0),
              }
            : null,
        },
      };
    });

    return {
      featuredCreators,
      totalCount: totalCount || 3000,
    };
  } catch (error) {
    console.warn("Directory structured data unavailable: featured creator query failed.");
    return { featuredCreators: [], totalCount: 3000 };
  }
}


/**
 * Safely stringifies JSON-LD object for embedding within Next.js JSX script tag,
 * escaping HTML-sensitive angle brackets.
 */
export function safeJsonLdStringify(jsonLd: Record<string, any>): string {
  return serializeJsonLd(jsonLd);
}

