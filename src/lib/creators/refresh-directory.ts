import type { CreatorItem, FlagshipRateItem } from "@/components/creators/CreatorCard";
import type { FullResolvedCreatorProfile } from "./profile-resolver";
import { resolveAudienceCountry } from "./audience-country";

/** Directory cards use the same completed sources as profiles during/after a refresh. */
export function refreshedDirectoryCard(creator: CreatorItem, profile: FullResolvedCreatorProfile): CreatorItem {
 const flagshipRates: FlagshipRateItem[] = [];
 for (const platform of ["youtube", "instagram", "tiktok"] as const) {
  const channel = profile.platforms[platform];
  if (!channel) continue;
  const formats = platform === "youtube" ? ["yt_dedicated", ...(channel.sfEr !== undefined ? ["yt_short"] : [])] : platform === "instagram" ? ["ig_reel"] : ["tiktok_video"];
  for (const rate of channel.rates.filter(rate => formats.includes(rate.format))) {
   const short = rate.format === "yt_short";
   flagshipRates.push({ ...rate, platform, erPercent: short ? channel.sfEr || 0 : channel.observedEr, erLabel: platform === "youtube" ? short ? "SF ER" : "LF ER" : "ER" });
  }
 }
 const platform = (name: "youtube" | "instagram" | "tiktok") => {
  const channel = profile.platforms[name];
  return channel ? { handle: channel.handle, followers: channel.followerCount, er: channel.observedEr, lfEr: channel.lfEr, sfEr: channel.sfEr } : null;
 };
 return { ...creator, avatarUrl: profile.avatarUrl, primaryNicheId: profile.intelligence.primaryNicheId,
  primaryNicheName: profile.intelligence.primaryNicheName, subNicheName: profile.intelligence.subNicheName,
  countryCode: profile.countryCode, countryName: profile.countryName, combinedFollowers: profile.combinedFollowers,
  primaryAudienceCountry: resolveAudienceCountry(profile.intelligence.audience?.primaryMarket),
  creatorType: profile.intelligence.creatorType,
  handles: { youtube: profile.platforms.youtube?.handle, instagram: profile.platforms.instagram?.handle, tiktok: profile.platforms.tiktok?.handle },
  platforms: { youtube: platform("youtube"), instagram: platform("instagram"), tiktok: platform("tiktok") },
  audienceFit: { demographicProfile: profile.intelligence.audience?.demographicProfile, commercialBuyerIntent: profile.intelligence.audience?.commercialBuyerIntent, interests: profile.intelligence.audience?.interests || [] },
  flagshipRates };
}
