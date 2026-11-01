import { unstable_cache } from "next/cache";
import { resolveFullCreatorProfile } from "@/lib/creators/profile-resolver";
import type { Platform } from "@/lib/calculator/types";
import type { PriceRangeRate } from "@/components/creators/CreatorPriceRange";

export interface HomeHeroCreator {
  name: string;
  slug: string;
  avatarUrl: string | null;
  niche: string;
  currency?: string;
  channels: Array<{ platform: Platform; followers: number }>;
  rates: Array<{ label: string; rate: PriceRangeRate }>;
  audience: { demographic?: string; country?: string; intent?: string; interests: string[] };
  content: { format?: string; themes: Array<{ name: string; percentage: number }> };
}

const labels: Record<string, string> = { yt_dedicated: "Long Form", yt_integrated: "Integration", yt_short: "Shorts", ig_reel: "Reel", ig_carousel: "Carousel", ig_static: "Static post", ig_story: "Story set", tiktok_video: "TikTok" };

// Reuse stored profile results. No scraper or insight-generation jobs are started.
const readHeroCreator = unstable_cache(async (): Promise<HomeHeroCreator | null> => {
  const profile = await resolveFullCreatorProfile("sydnee-zora");
  if (!profile) return null;
  const channels = [profile.platforms.youtube, profile.platforms.instagram, profile.platforms.tiktok].filter(channel => channel !== null);
  const allRates = channels.flatMap(channel => channel.rates);
  // Prefer one format per platform; fill from remaining formats for a single-platform creator.
  const selected = channels.flatMap(channel => channel.rates.slice(0, 1));
  const rates = [...selected, ...allRates.filter(rate => !selected.includes(rate))].slice(0, 2);
  return {
    name: profile.brandName || profile.canonicalName, slug: profile.slug,
    avatarUrl: profile.avatarUrl, niche: profile.intelligence.primaryNicheName,
    currency: allRates[0]?.currency,
    channels: channels.map(channel => ({ platform: channel.platform, followers: channel.followerCount })),
    rates: rates.map(rate => ({ label: labels[rate.format] || rate.label, rate })),
    audience: { demographic: profile.intelligence.audience?.demographicProfile,
      country: profile.intelligence.audience?.primaryMarket,
      intent: profile.intelligence.audience?.commercialBuyerIntent,
      interests: profile.intelligence.audience?.interests || [] },
    content: { format: profile.intelligence.content?.dominantFormat,
      themes: profile.intelligence.content?.themes.slice(0, 3) || [] },
  };
}, ["home-hero-sydnee-zora"], { revalidate: 300 });

export async function getHomeHeroCreator() {
  try { return await readHeroCreator(); }
  catch { return null; }
}
