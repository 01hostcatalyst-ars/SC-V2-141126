import type { DeliverableFormat, RegionCode } from "@/lib/calculator/types";
import type { CompleteCreatorIntelligence } from "@/lib/ai/types";
import type { GeneratedPackage } from "@/lib/calculator/packages";
import type { InstagramPostItem, YouTubeVideoItem, TikTokVideoItem } from "@/lib/scrapers/types";

export interface RateCardPdfPayload {
  profile?: import("@/lib/creators/profile-resolver").FullResolvedCreatorProfile;
  creatorMeta: {
    displayName: string;
    primaryUsername: string;
    avatarUrl?: string;
    contactEmail?: string;
  };
  selectedRegion: RegionCode;
  activeNicheName?: string;
  activeSubNicheName?: string;
  totalAudienceCount: number;
  verifiedChannelsCount: number;
  platforms: {
    instagram?: {
      status: string;
      username?: string;
      followerCount?: number;
      avgLikes?: number;
      avgComments?: number;
      avgViews?: number;
      engagementRate?: number;
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
      posts?: InstagramPostItem[];
    };
    youtube?: {
      status: string;
      username?: string;
      followerCount?: number;
      avgLikes?: number;
      avgComments?: number;
      avgViews?: number;
      avgLongViews?: number;
      avgShortViews?: number;
      engagementRate?: number;
      longEngagementRate?: number;
      shortEngagementRate?: number;
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
      videos?: YouTubeVideoItem[];
    };
    tiktok?: {
      status: string;
      username?: string;
      followerCount?: number;
      avgLikes?: number;
      avgComments?: number;
      avgViews?: number;
      engagementRate?: number;
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
      videos?: TikTokVideoItem[];
    };
  };
  recommendedPackages?: GeneratedPackage[];
  completeIntelligence?: CompleteCreatorIntelligence | null;
  instantContractUrl?: string;
}

export { generateProfileRateCardPdf as generateRateCardPDF } from "./profileRateCard";
