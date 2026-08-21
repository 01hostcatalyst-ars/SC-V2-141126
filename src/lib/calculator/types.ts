export type Platform = 'instagram' | 'tiktok' | 'youtube';

export type DeliverableFormat =
  | 'ig_reel'
  | 'ig_carousel'
  | 'ig_static'
  | 'ig_story'
  | 'tiktok_video'
  | 'yt_short'
  | 'yt_integrated'
  | 'yt_dedicated';

export type PlacementScope =
  | 'organic_repost'
  | 'paid_partnership_ads'
  | 'whitelisting'
  | 'website_pdp'
  | 'email_crm'
  | 'tv_streaming'
  | 'ooh_print'
  | 'perpetual_buyout';

export type RightsDuration =
  | '30_days'
  | '60_days'
  | '90_days'
  | '6_months'
  | '12_months'
  | 'perpetual';

export type ExclusivityScope = 'none' | 'direct_competitors' | 'full_category';

export type ExclusivityDuration =
  | '14_days'
  | '30_days'
  | '60_days'
  | '90_days'
  | '6_months'
  | '12_months';

export type TurnaroundSpeed =
  | 'standard'
  | 'expedited_72h'
  | 'rush_48h'
  | 'ultra_rush_24h';

export type RegionCode = 'US' | 'UK' | 'CA' | 'PK' | 'IN';

export interface CreatorMetrics {
  followerCount: number;
  last3PostsAvgLikes: number;
  last3PostsAvgComments: number;
  last3PostsAvgViews?: number;
  primaryPlatform?: Platform;
  primaryNicheId: number;
  subNicheId?: number;
  isLuxuryOrHighEnd?: boolean;
  regionCode?: RegionCode;
}

export interface DeliverableItem {
  id: string;
  platform: Platform;
  format: DeliverableFormat;
  quantity: number;
  isCrossPost?: boolean;
}

export interface CommercialTerms {
  usageRights?: {
    scope: PlacementScope;
    duration: RightsDuration;
  };
  exclusivity?: {
    scope: ExclusivityScope;
    duration: ExclusivityDuration;
  };
}

export interface ProductionAddons {
  turnaround?: TurnaroundSpeed;
  rawFootageBuyout?: boolean;
  extraRevisionsCount?: number;
  linkInBioDays?: number;
  pinnedHighlightMonths?: number;
  reimbursedExpenses?: number;
}

export interface PricingInput {
  creator: CreatorMetrics;
  deliverables: DeliverableItem[];
  commercialTerms?: CommercialTerms;
  productionAddons?: ProductionAddons;
}

export interface ItemizedDeliverableBreakdown {
  id: string;
  format: DeliverableFormat;
  platform: Platform;
  quantity: number;
  unitInterpolatedBaseUSD: number;
  finalDeliverableFeeUSD: number;
}

export interface CalculationResult {
  metrics: {
    followerCount: number;
    observedER: number;
    benchmarkER: number;
    performanceMultiplier: number;
    nicheMultiplier: number;
    regionApplied: RegionCode;
    currency: string;
    currencySymbol: string;
  };
  lineItems: {
    deliverables: ItemizedDeliverableBreakdown[];
    grossTotalUSD: number;
    bundleDiscountApplied: string;
    bundleDiscountAmountUSD: number;
    netContentFeeUSD: number;
    commercialRightsFeeUSD: number;
    productionAddonsFeeUSD: number;
    totalUSD: number;
  };
  valuationRange: {
    lowP25: number;
    typicalMedian: number;
    highP75: number;
    formatted: {
      low: string;
      typical: string;
      high: string;
    };
  };
}
