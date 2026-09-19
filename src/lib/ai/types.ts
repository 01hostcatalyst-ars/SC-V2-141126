export interface CompleteCreatorIntelligence {
  profile: {
    creatorType: string;
    profilePositioning: string;
    primaryNiche: {
      id: number;
      name: string;
      multiplier: number;
    };
    subNiche?: {
      id: number;
      name: string;
      multiplier: number;
    };
    secondaryNiches: Array<{
      id: number;
      name: string;
      multiplier: number;
    }>;
    isLuxuryOrHighEnd?: boolean;
    microNiches: string[];
    creatorDescription: string;
    confidence: number;
  };

  geography: {
    countryCode: string | null;
    countryName: string | null;
    city: string | null;
    region: string | null;
    confidence: number;
    evidence: string[];
  };

  audience: {
    likelyAgeRange: string;
    genderSkew: string;
    primaryMarket: string;
    secondaryMarkets?: string[];
    interests: string[];
    purchaseIntent: string;
    audienceIntent: string[];
    profile: string;
    confidence: number;
  };

  content: {
    themes: string[];
    dominantFormat: string;
    formats: string[];
    style: string[];
    tone: string[];
    productionLevel: string;
    contentConsistency: string;
    promotionalContentLevel: string;
  };

  contentThemes: Array<{
    theme: string;
    strength: number;
  }>;

  contentFormatIntelligence?: {
    primaryFormat: string;
    strongestFormatForCreator: string;
    formatDescription: string;
  };

  performanceIntelligence: {
    reachLevel: string;
    engagementQuality: string;
    audienceResponse: string;
    performancePattern: string;
    summary: string;
  };

  engagementIntelligence: {
    conversationLevel: string;
    sharingPotential: string;
    purchaseIntentSignals: string;
    audienceBehavior: string[];
  };

  commercialIntelligence: {
    commercialIntent: string;
    brandCollaborationLikelihood: string;
    affiliateSignals: boolean;
    productPromotionLevel: string;
    sponsorshipSignals: string[];
  };

  brandFit: {
    bestFitCategories: string[];
    campaignTypes: string[];
    strongestPartnershipAngle: string;
    brandSuitability: string;
  };

  brandSafety: {
    overallRisk: 'Low' | 'Moderate' | 'High' | string;
    observedRiskSignals: string[];
    reviewRecommended: boolean;
  };

  strengths: Array<{
    area: string;
    description: string;
  }>;

  considerations: Array<{
    area: string;
    description: string;
  }>;

  partnershipRecommendations: Array<{
    campaign: string;
    fit: 'Excellent' | 'Good' | 'Moderate' | string;
    reason: string;
  }>;

  summary: {
    oneLine: string;
    brandSummary: string;
    detailedSummary: string;
  };

  confidence: {
    niche: number;
    country: number;
    audience: number;
    brandFit: number;
  };

  evidence: {
    classification: string[];
    geography: string[];
    audience: string[];
    commercial: string[];
  };

  uncertainties: string[];
  omnichannelStrategySuite?: OmnichannelStrategySuite;
}

// ============================================================================
// Omnichannel Strategy Suite Types (Agency-Grade Creator Strategy)
// ============================================================================

export type StrategyDeliverableFormat =
  | 'yt_dedicated'
  | 'yt_integrated'
  | 'yt_short'
  | 'ig_reel'
  | 'ig_story_sequence'
  | 'ig_carousel'
  | 'ig_static'
  | 'tiktok_video'
  | 'meta_whitelisting_30d'
  | 'meta_whitelisting_60d'
  | 'pdp_website_rights_90d'
  | 'category_exclusivity_30d'
  | 'raw_b_roll_buyout'
  | 'pinned_placement_14d';

export interface CreatorExecutiveBrief {
  whoTheyAre: string;
  audiencePsychology: string;
  theSuperpower: string;
  theLandmine: string;
  recommendedVoucherPrefix?: string;
}

export interface BespokeAdConcept {
  conceptName: string;
  hookVerbatim: string;
  angleSummary: string;
  suggestedPlatform: 'youtube' | 'instagram' | 'tiktok';
  visualDirection?: string;
}

export interface BespokeDeliverableItem {
  id: string;
  phase: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'cross_platform';
  formatKey: StrategyDeliverableFormat;
  quantity: number;
  title: string;
  strategicDetail: string;
}

export interface StrategicCommercialEntitlement {
  type: 'whitelisting' | 'raw_footage' | 'repurposing' | 'profile_placement' | 'exclusivity';
  title: string;
  detail: string;
}

export interface ConcreteAssetDeliverable {
  assetType: 'macro_photography' | 'raw_b_roll' | 'audio_jingle_stems' | 'blooper_cuts' | 'cutdown_ads' | string;
  specification: string;
}

export interface CriticalCollaborationGuideline {
  ruleNumber: 1 | 2 | 3;
  ruleTitle: string;
  directive: string;
  commercialRisk: string;
}

export interface BespokeStrategyPackage {
  packageId: 'reach' | 'paid_creative' | 'conversion' | 'content_library' | 'launch';
  packageName: string;
  packageTag: '[ Reach ]' | '[ Paid Creative ]' | '[ Conversion ]' | '[ Content Library ]' | '[ Full-Funnel ]';
  campaignObjective: string;
  strategicRationale: string;
  isRecommended: boolean;
  deliverables: BespokeDeliverableItem[];
  entitlements: StrategicCommercialEntitlement[];
  adConcepts?: BespokeAdConcept[];
  concreteAssets?: ConcreteAssetDeliverable[];
  collaborationGuidelines: [
    CriticalCollaborationGuideline,
    CriticalCollaborationGuideline,
    CriticalCollaborationGuideline
  ];
}

export interface OmnichannelStrategySuite {
  creatorExecutiveBrief: CreatorExecutiveBrief;
  packages: BespokeStrategyPackage[];
  collaborationRules?: string[];
}
