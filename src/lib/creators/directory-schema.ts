export interface DirectoryCreatorPlatformData {
  handle: string;
  url: string;
  followerCount: number;
}

export interface DirectoryCreatorItem {
  slug: string;
  name: string;
  alternateName?: string | null;
  avatarUrl?: string | null;
  creatorType?: string | null;
  primaryNiche: string;
  secondaryNiche?: string | null;
  microNiches?: string[];
  countryCode?: string | null;
  countryName?: string | null;
  combinedFollowers: number;
  formattedFollowers?: string;
  platforms: {
    youtube?: DirectoryCreatorPlatformData | null;
    instagram?: DirectoryCreatorPlatformData | null;
    tiktok?: DirectoryCreatorPlatformData | null;
  };
  sameAs?: string[];
  typicalRateMinUsd?: number | null;
  typicalRateMaxUsd?: number | null;
}

/**
 * Builds CollectionPage + ItemList structured data for the creators directory,
 * embedding comprehensive multi-platform metrics, primary & secondary niches,
 * and geographic country attribution for every featured creator.
 */
export function buildCreatorsDirectoryJsonLd(
  featuredCreators: DirectoryCreatorItem[],
  totalCount: number = 3000,
  baseUrl: string = "https://www.signcollab.com",
  queryString: string = ""
) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const pageUrl = `${normalizedBaseUrl}/creators${queryString ? `?${queryString}` : ""}`;
  const pageId = `${pageUrl}#collectionpage`;
  const breadcrumbId = `${pageUrl}#breadcrumb`;
  const itemListId = `${pageUrl}#itemlist`;

  const webPage = {
    "@type": "CollectionPage",
    "@id": pageId,
    "url": pageUrl,
    "name": "Creator Directory & Sponsorship Rate Intelligence — SignCollab",
    "description": "Discover verified content creators across YouTube, Instagram, and TikTok with data-backed sponsorship rate cards, audience metrics, and instant contract execution.",
    "isPartOf": { "@id": `${normalizedBaseUrl}/#website` },
    "about": { "@id": `${normalizedBaseUrl}/#organization` },
    "breadcrumb": { "@id": breadcrumbId },
    "mainEntity": { "@id": itemListId },
    "inLanguage": "en-US",
  };

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
        "item": pageUrl,
      },
    ],
  };

  const itemList = {
    "@type": "ItemList",
    "@id": itemListId,
    "name": "Verified Content Creators & Commercial Rate Cards",
    "description": `Institutional directory of ${totalCount > 0 ? totalCount.toLocaleString() + "+" : "verified"} multi-platform digital creators audited by SignCollab.`,
    "numberOfItems": featuredCreators.length,
    "itemListElement": featuredCreators.map((creator, index) => {
      const creatorUrl = `${normalizedBaseUrl}/creators/${creator.slug}`;
      const displayName = creator.alternateName || creator.name;
      const isStudioOrAgency =
        /\b(studios?|media|productions?|agency|team|network|collective)\b/i.test(displayName) ||
        /\b(studio|production|agency|network)\b/i.test(creator.creatorType || "");
      const entityType = isStudioOrAgency ? "Organization" : "Person";

      // Build verified social sameAs links
      const sameAs: string[] = [...(creator.sameAs || [])];
      if (creator.platforms?.youtube?.url && !sameAs.includes(creator.platforms.youtube.url)) {
        sameAs.push(creator.platforms.youtube.url);
      }
      if (creator.platforms?.instagram?.url && !sameAs.includes(creator.platforms.instagram.url)) {
        sameAs.push(creator.platforms.instagram.url);
      }
      if (creator.platforms?.tiktok?.url && !sameAs.includes(creator.platforms.tiktok.url)) {
        sameAs.push(creator.platforms.tiktok.url);
      }

      // Build multi-platform InteractionCounter metrics
      const interactionStatistic: any[] = [];

      const platformBreakdownParts: string[] = [];
      if (creator.platforms?.youtube && creator.platforms.youtube.followerCount > 0) {
        interactionStatistic.push({
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/FollowAction",
          "name": "YouTube Subscribers",
          "userInteractionCount": creator.platforms.youtube.followerCount,
        });
        platformBreakdownParts.push(`YouTube (${creator.platforms.youtube.followerCount.toLocaleString()} subs)`);
      }
      if (creator.platforms?.instagram && creator.platforms.instagram.followerCount > 0) {
        interactionStatistic.push({
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/FollowAction",
          "name": "Instagram Followers",
          "userInteractionCount": creator.platforms.instagram.followerCount,
        });
        platformBreakdownParts.push(`Instagram (${creator.platforms.instagram.followerCount.toLocaleString()} followers)`);
      }
      if (creator.platforms?.tiktok && creator.platforms.tiktok.followerCount > 0) {
        interactionStatistic.push({
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/FollowAction",
          "name": "TikTok Followers",
          "userInteractionCount": creator.platforms.tiktok.followerCount,
        });
        platformBreakdownParts.push(`TikTok (${creator.platforms.tiktok.followerCount.toLocaleString()} followers)`);
      }

      // Assemble knowledge areas (Primary niche, Secondary niche, micro-niches)
      const knowsAbout: string[] = Array.from(
        new Set(
          [
            creator.primaryNiche,
            creator.secondaryNiche,
            ...(creator.microNiches || []),
          ].filter((x): x is string => Boolean(x && x.trim()))
        )
      );

      // Construct item summary
      const descNiches = [creator.primaryNiche, creator.secondaryNiche].filter(Boolean).join(" · ");
      const platformText = platformBreakdownParts.length > 0 ? ` · ${platformBreakdownParts.join(", ")}` : "";
      const countryText = creator.countryName ? ` · ${creator.countryName}` : "";
      const itemDescription = `${descNiches}${platformText}${countryText}`;

      return {
        "@type": "ListItem",
        "position": index + 1,
        "url": creatorUrl,
        "item": {
          "@type": entityType,
          "@id": `${creatorUrl}#creator`,
          "name": creator.name,
          ...(creator.alternateName && creator.alternateName !== creator.name
            ? { "alternateName": creator.alternateName }
            : {}),
          "url": creatorUrl,
          ...(creator.avatarUrl ? { "image": creator.avatarUrl } : {}),
          "jobTitle": creator.creatorType || `${creator.primaryNiche} Creator`,
          "description": itemDescription,
          ...(creator.countryName
            ? {
                "nationality": {
                  "@type": "Country",
                  "name": creator.countryName,
                },
              }
            : {}),
          ...(knowsAbout.length > 0 ? { knowsAbout } : {}),
          ...(sameAs.length > 0 ? { sameAs } : {}),
          interactionStatistic,
        },
      };
    }),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [webPage, breadcrumbList, itemList],
  };
}

