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
}
