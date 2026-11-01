import { unstable_cache } from "next/cache";
import { resolveFullCreatorProfile } from "@/lib/creators/profile-resolver";
import { resolveAudienceCountry } from "@/lib/creators/audience-country";
import type { CreatorItem } from "@/components/creators/CreatorCard";

export type HomeSpotlightCreator = Pick<CreatorItem, "slug" | "canonicalName" | "brandName" | "avatarUrl" | "primaryNicheName" | "platforms" | "flagshipRates" | "primaryAudienceCountry">;

const SPOTLIGHT_SLUGS = [
  "jason-davenport", "whealth-by-slaiman", "dr-mayim-bialik", "cybrgrl",
  "tim-dessaint", "eva-meloche", "hayls-world", "becky-excell",
] as const;

// Read the same completed snapshots and pricing engine as the profile page.
// This starts no scraping/AI jobs and keeps raw media and private fields off the wire.
export const getHomeSpotlightCreators = unstable_cache(async (): Promise<HomeSpotlightCreator[]> => {
  const profiles = await Promise.all(SPOTLIGHT_SLUGS.map(slug => resolveFullCreatorProfile(slug)));
  return profiles.flatMap(profile => {
    if (!profile) return [];
    const channels = [profile.platforms.youtube, profile.platforms.instagram, profile.platforms.tiktok].filter(channel => channel !== null);
    return [{
      slug: profile.slug, canonicalName: profile.canonicalName, brandName: profile.brandName,
      avatarUrl: profile.avatarUrl, primaryNicheName: profile.intelligence.primaryNicheName,
      primaryAudienceCountry: resolveAudienceCountry(profile.intelligence.audience?.primaryMarket),
      platforms: Object.fromEntries(channels.map(channel => [channel.platform, {
        handle: channel.handle, followers: channel.followerCount,
      }])),
      flagshipRates: channels.flatMap(channel => channel.rates.slice(0, 1).map(rate => ({
        ...rate, platform: channel.platform, erPercent: channel.observedEr, erLabel: "Engagement rate",
      }))).slice(0, 1),
    }];
  });
}, ["home-selected-spotlight-creators-v1"], { revalidate: 3600, tags: ["home-spotlight-creators"] });
