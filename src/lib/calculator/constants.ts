import {
  DeliverableFormat,
  PlacementScope,
  RightsDuration,
  ExclusivityScope,
  ExclusivityDuration,
  RegionCode,
  NicheInfo,
} from './types';

// ==========================================
// 1. UNIFIED 16-KNOT PLATFORM MATRICES
// ==========================================

export interface PlatformKnot {
  knotId: string;
  followers: number;
  benchmarkEr: number;
  expectedViews?: number;
  rates: Record<string, number>;
}

// 1A. Instagram 16-Knot Matrix (Aspire 2026 / HypeAuditor)
export const INSTAGRAM_16_KNOTS: PlatformKnot[] = [
  { knotId: 'K01', followers: 1000, benchmarkEr: 4.50, rates: { ig_reel: 80, ig_carousel: 60, ig_static: 50, ig_story: 30 } },
  { knotId: 'K02', followers: 2500, benchmarkEr: 4.00, rates: { ig_reel: 250, ig_carousel: 200, ig_static: 150, ig_story: 95 } },
  { knotId: 'K03', followers: 5000, benchmarkEr: 3.00, rates: { ig_reel: 350, ig_carousel: 260, ig_static: 200, ig_story: 110 } },
  { knotId: 'K04', followers: 10000, benchmarkEr: 2.19, rates: { ig_reel: 480, ig_carousel: 350, ig_static: 270, ig_story: 135 } },
  { knotId: 'K05', followers: 15000, benchmarkEr: 1.70, rates: { ig_reel: 590, ig_carousel: 420, ig_static: 330, ig_story: 155 } },
  { knotId: 'K06', followers: 25000, benchmarkEr: 1.26, rates: { ig_reel: 750, ig_carousel: 500, ig_static: 400, ig_story: 180 } },
  { knotId: 'K07', followers: 40000, benchmarkEr: 0.85, rates: { ig_reel: 1200, ig_carousel: 800, ig_static: 650, ig_story: 295 } },
  { knotId: 'K08', followers: 60000, benchmarkEr: 0.65, rates: { ig_reel: 1800, ig_carousel: 1200, ig_static: 1000, ig_story: 450 } },
  { knotId: 'K09', followers: 10000, benchmarkEr: 0.55, rates: { ig_reel: 2300, ig_carousel: 1500, ig_static: 1250, ig_story: 570 } },
  { knotId: 'K10', followers: 150000, benchmarkEr: 0.50, rates: { ig_reel: 2900, ig_carousel: 1850, ig_static: 1500, ig_story: 720 } },
  { knotId: 'K11', followers: 250000, benchmarkEr: 0.48, rates: { ig_reel: 4000, ig_carousel: 2500, ig_static: 2000, ig_story: 1000 } },
  { knotId: 'K12', followers: 500000, benchmarkEr: 0.45, rates: { ig_reel: 6000, ig_carousel: 3850, ig_static: 3000, ig_story: 1500 } },
  { knotId: 'K13', followers: 750000, benchmarkEr: 0.42, rates: { ig_reel: 8000, ig_carousel: 5150, ig_static: 4000, ig_story: 2000 } },
  { knotId: 'K14', followers: 1000000, benchmarkEr: 0.40, rates: { ig_reel: 10000, ig_carousel: 6500, ig_static: 5000, ig_story: 2500 } },
  { knotId: 'K15', followers: 2500000, benchmarkEr: 0.35, rates: { ig_reel: 15625, ig_carousel: 10000, ig_static: 7650, ig_story: 3800 } },
  { knotId: 'K16', followers: 5000000, benchmarkEr: 0.30, rates: { ig_reel: 25000, ig_carousel: 16000, ig_static: 12000, ig_story: 6000 } },
];

// 1B. TikTok 16-Knot Matrix (Aspire 2026 / Platform Averages)
export const TIKTOK_16_KNOTS: PlatformKnot[] = [
  { knotId: 'K01', followers: 1000, benchmarkEr: 10.00, expectedViews: 400, rates: { tiktok_video: 60 } },
  { knotId: 'K02', followers: 2500, benchmarkEr: 8.50, expectedViews: 875, rates: { tiktok_video: 150 } },
  { knotId: 'K03', followers: 5000, benchmarkEr: 7.00, expectedViews: 1500, rates: { tiktok_video: 200 } },
  { knotId: 'K04', followers: 10000, benchmarkEr: 6.00, expectedViews: 2500, rates: { tiktok_video: 260 } },
  { knotId: 'K05', followers: 15000, benchmarkEr: 5.50, expectedViews: 3300, rates: { tiktok_video: 305 } },
  { knotId: 'K06', followers: 25000, benchmarkEr: 4.80, expectedViews: 5000, rates: { tiktok_video: 350 } },
  { knotId: 'K07', followers: 40000, benchmarkEr: 4.50, expectedViews: 7200, rates: { tiktok_video: 550 } },
  { knotId: 'K08', followers: 60000, benchmarkEr: 4.30, expectedViews: 9000, rates: { tiktok_video: 900 } },
  { knotId: 'K09', followers: 100000, benchmarkEr: 4.00, expectedViews: 12000, rates: { tiktok_video: 1250 } },
  { knotId: 'K10', followers: 150000, benchmarkEr: 3.80, expectedViews: 15000, rates: { tiktok_video: 1600 } },
  { knotId: 'K11', followers: 250000, benchmarkEr: 3.50, expectedViews: 20000, rates: { tiktok_video: 2250 } },
  { knotId: 'K12', followers: 500000, benchmarkEr: 3.20, expectedViews: 30000, rates: { tiktok_video: 4800 } },
  { knotId: 'K13', followers: 750000, benchmarkEr: 3.00, expectedViews: 37500, rates: { tiktok_video: 7400 } },
  { knotId: 'K14', followers: 1000000, benchmarkEr: 2.80, expectedViews: 40000, rates: { tiktok_video: 10000 } },
  { knotId: 'K15', followers: 2500000, benchmarkEr: 2.50, expectedViews: 75000, rates: { tiktok_video: 15625 } },
  { knotId: 'K16', followers: 5000000, benchmarkEr: 2.00, expectedViews: 100000, rates: { tiktok_video: 25000 } },
];

// 1C. YouTube 16-Knot Matrix (Track A: Long-Form & Track B: Shorts)
export const YOUTUBE_16_KNOTS: PlatformKnot[] = [
  { knotId: 'K01', followers: 1000, benchmarkEr: 4.50, expectedViews: 300, rates: { yt_dedicated: 450, yt_integrated: 250, yt_short: 100 } },
  { knotId: 'K02', followers: 2500, benchmarkEr: 4.00, expectedViews: 750, rates: { yt_dedicated: 700, yt_integrated: 400, yt_short: 200 } },
  { knotId: 'K03', followers: 5000, benchmarkEr: 3.80, expectedViews: 1500, rates: { yt_dedicated: 710, yt_integrated: 400, yt_short: 210 } },
  { knotId: 'K04', followers: 10000, benchmarkEr: 3.50, expectedViews: 2800, rates: { yt_dedicated: 725, yt_integrated: 400, yt_short: 225 } },
  { knotId: 'K05', followers: 15000, benchmarkEr: 3.30, expectedViews: 4000, rates: { yt_dedicated: 735, yt_integrated: 400, yt_short: 235 } },
  { knotId: 'K06', followers: 25000, benchmarkEr: 3.00, expectedViews: 6500, rates: { yt_dedicated: 750, yt_integrated: 400, yt_short: 250 } },
  { knotId: 'K07', followers: 40000, benchmarkEr: 2.80, expectedViews: 10000, rates: { yt_dedicated: 1200, yt_integrated: 700, yt_short: 375 } },
  { knotId: 'K08', followers: 60000, benchmarkEr: 2.60, expectedViews: 15000, rates: { yt_dedicated: 1750, yt_integrated: 1000, yt_short: 500 } },
  { knotId: 'K09', followers: 100000, benchmarkEr: 2.40, expectedViews: 22000, rates: { yt_dedicated: 2050, yt_integrated: 2100, yt_short: 720 } },
  { knotId: 'K10', followers: 150000, benchmarkEr: 2.20, expectedViews: 32000, rates: { yt_dedicated: 2400, yt_integrated: 3400, yt_short: 980 } },
  { knotId: 'K11', followers: 250000, benchmarkEr: 2.00, expectedViews: 50000, rates: { yt_dedicated: 3000, yt_integrated: 6000, yt_short: 1500 } },
  { knotId: 'K12', followers: 500000, benchmarkEr: 1.80, expectedViews: 90000, rates: { yt_dedicated: 6200, yt_integrated: 9000, yt_short: 2200 } },
  { knotId: 'K13', followers: 750000, benchmarkEr: 1.60, expectedViews: 130000, rates: { yt_dedicated: 9400, yt_integrated: 12000, yt_short: 2850 } },
  { knotId: 'K14', followers: 1000000, benchmarkEr: 1.50, expectedViews: 175000, rates: { yt_dedicated: 12500, yt_integrated: 15000, yt_short: 3500 } },
  { knotId: 'K15', followers: 2500000, benchmarkEr: 1.20, expectedViews: 350000, rates: { yt_dedicated: 21000, yt_integrated: 19000, yt_short: 6000 } },
  { knotId: 'K16', followers: 5000000, benchmarkEr: 1.00, expectedViews: 600000, rates: { yt_dedicated: 35000, yt_integrated: 25000, yt_short: 10000 } },
];

// Helper to get platform knot array by format
export function getKnotsForFormat(format: DeliverableFormat): PlatformKnot[] {
  if (format.startsWith('ig_')) return INSTAGRAM_16_KNOTS;
  if (format === 'tiktok_video') return TIKTOK_16_KNOTS;
  if (format.startsWith('yt_')) return YOUTUBE_16_KNOTS;
  return INSTAGRAM_16_KNOTS;
}

// Legacy format map for compatibility
export const ANCHOR_KNOTS: Record<DeliverableFormat, Array<[number, number]>> = {
  ig_reel: INSTAGRAM_16_KNOTS.map(k => [k.followers, k.rates.ig_reel]),
  ig_carousel: INSTAGRAM_16_KNOTS.map(k => [k.followers, k.rates.ig_carousel]),
  ig_static: INSTAGRAM_16_KNOTS.map(k => [k.followers, k.rates.ig_static]),
  ig_story: INSTAGRAM_16_KNOTS.map(k => [k.followers, k.rates.ig_story]),
  tiktok_video: TIKTOK_16_KNOTS.map(k => [k.followers, k.rates.tiktok_video]),
  yt_short: YOUTUBE_16_KNOTS.map(k => [k.followers, k.rates.yt_short]),
  yt_integrated: YOUTUBE_16_KNOTS.map(k => [k.followers, k.rates.yt_integrated]),
  yt_dedicated: YOUTUBE_16_KNOTS.map(k => [k.followers, k.rates.yt_dedicated]),
};

// ==========================================
// 2. 12 SOURCED PRIMARY NICHES (Aspire $562 Baseline)
// ==========================================

export interface NicheDefinition {
  id: number;
  name: string;
  multiplier: number;
  description: string;
  evidenceSource: string;
}

export interface SubNicheDefinition {
  id: number;
  primaryNicheId: number;
  name: string;
  multiplier: number;
  description: string;
  keywords: string[];
}

export const PRIMARY_NICHES: NicheDefinition[] = [
  {
    id: 1,
    name: 'Home Design & Decor',
    multiplier: 2.67,
    description: 'High-ticket room staging, architectural lighting, multi-day production ($1,500 / $562 baseline).',
    evidenceSource: 'Aspire 2026 (p. 14)',
  },
  {
    id: 2,
    name: 'Pet Care & Animals',
    multiplier: 1.78,
    description: 'Deep audience affinity, pet talent logistics, high viral share rates ($1,000 / $562 baseline).',
    evidenceSource: 'Aspire 2026 (p. 14)',
  },
  {
    id: 3,
    name: 'Business, Finance & B2B SaaS',
    multiplier: 1.50,
    description: 'Highest CPMs across digital media ($30–$60+ CPM), high-intent audience, corporate budgets.',
    evidenceSource: 'SignCollab Model / Modash 2026',
  },
  {
    id: 4,
    name: 'Skilled Trades & DIY',
    multiplier: 1.44,
    description: 'Specialized tooling, instructional fidelity, high project completion value ($309 / $214 avg).',
    evidenceSource: 'Collabstr Verified Deal Data',
  },
  {
    id: 5,
    name: 'Education & Career Coaching',
    multiplier: 1.43,
    description: 'Professional authority, high-ticket digital courses, corporate career transition audiences.',
    evidenceSource: 'Collabstr Verified Deal Data',
  },
  {
    id: 6,
    name: 'Technology, Hardware & AI',
    multiplier: 1.35,
    description: 'Technical benchmark depth, developer software trials, high hardware buyer consideration.',
    evidenceSource: 'SignCollab Model / Modash 2026',
  },
  {
    id: 7,
    name: 'Travel, Tourism & Outdoors',
    multiplier: 1.33,
    description: 'On-location filming logistics, high booking values, cinematic drone production ($750 / $562).',
    evidenceSource: 'Aspire 2026 (p. 14)',
  },
  {
    id: 8,
    name: 'Lifestyle & Daily Vlogs',
    multiplier: 1.00,
    description: 'Broad mass-market reach, native storytelling, universal baseline anchor ($562 / $562).',
    evidenceSource: 'Aspire 2026 Baseline Anchor (p. 14)',
  },
  {
    id: 9,
    name: 'Food, Culinary & Beverage',
    multiplier: 0.89,
    description: 'Recipe development time, kitchen styling prep, accessible consumer brand sponsors ($500 / $562).',
    evidenceSource: 'Aspire 2026 (p. 14)',
  },
  {
    id: 10,
    name: 'Family & Parenting',
    multiplier: 0.89,
    description: 'High-trust parental demographic, strong household purchasing authority ($500 / $562).',
    evidenceSource: 'Aspire 2026 (p. 14)',
  },
  {
    id: 11,
    name: 'Health, Wellness & Fitness',
    multiplier: 0.80,
    description: 'Active community engagement, strong DM lead funnels, workout routine demos ($450 / $562).',
    evidenceSource: 'Aspire 2026 (p. 14)',
  },
  {
    id: 12,
    name: 'Fashion & Apparel',
    multiplier: 0.53,
    description: 'High creator supply, gifting deals, rapid trend turnover hauls ($300 / $562).',
    evidenceSource: 'Aspire 2026 (p. 14)',
  },
  {
    id: 13,
    name: 'Beauty & Cosmetics',
    multiplier: 0.45,
    description: 'Highly saturated creator market, short routine creation times, affiliate deals ($250 / $562).',
    evidenceSource: 'Aspire 2026 (p. 14)',
  },
];

// Sub-Niches mapped to Primary Niches
export const SUB_NICHES: SubNicheDefinition[] = [
  // Home Design (1)
  { id: 101, primaryNicheId: 1, name: 'Interior Architecture & Renovations', multiplier: 2.80, description: 'Multi-day shoots, architectural lighting, luxury renovations.', keywords: ['interior', 'renovation', 'architecture', 'remodel'] },
  { id: 102, primaryNicheId: 1, name: 'Furniture Styling & Room Makeovers', multiplier: 2.67, description: 'High-ticket sponsorships, room staging.', keywords: ['furniture', 'makeover', 'decor', 'living room'] },
  { id: 103, primaryNicheId: 1, name: 'DIY Decor & Woodworking', multiplier: 2.20, description: 'Step-by-step tutorial editing, materials.', keywords: ['diy', 'woodworking', 'crafts', 'home improvement'] },

  // Pet Care (2)
  { id: 201, primaryNicheId: 2, name: 'Dog & Cat Training / Lifestyle', multiplier: 1.78, description: 'Animal coordination, high community viral share rate.', keywords: ['dogs', 'cats', 'puppies', 'pet training'] },
  { id: 202, primaryNicheId: 2, name: 'Veterinary Advice & Nutrition', multiplier: 1.90, description: 'Certified expert credibility, health compliance.', keywords: ['veterinary', 'pet food', 'nutrition', 'animal health'] },

  // Business & Finance (3)
  { id: 301, primaryNicheId: 3, name: 'Personal Investing, Stocks & Crypto', multiplier: 1.80, description: 'Highest CPMs, strict financial disclosures.', keywords: ['stocks', 'crypto', 'investing', 'wealth', 'trading'] },
  { id: 302, primaryNicheId: 3, name: 'B2B SaaS, Startups & Tech Founders', multiplier: 1.65, description: 'B2B software purchasing power, executive lead gen.', keywords: ['startup', 'founder', 'business', 'saas', 'software'] },
  { id: 303, primaryNicheId: 3, name: 'Real Estate & Property Investing', multiplier: 1.60, description: 'High-net-worth demographic, high conversion values.', keywords: ['real estate', 'property', 'mortgages', 'rentals'] },

  // Tech (6)
  { id: 601, primaryNicheId: 6, name: 'PC Hardware & Custom Builds', multiplier: 1.45, description: 'In-depth benchmarks, high enthusiast spending.', keywords: ['gpu', 'pc build', 'hardware', 'custom pc'] },
  { id: 602, primaryNicheId: 6, name: 'Consumer Tech, Smartphones & Audio', multiplier: 1.35, description: 'Rapid product cycles, high visual demo requirements.', keywords: ['smartphones', 'headphones', 'gadgets', 'apple', 'android'] },
  { id: 603, primaryNicheId: 6, name: 'AI Tools & Productivity Automations', multiplier: 1.50, description: 'High trial-to-paid conversion intent, software budgets.', keywords: ['ai tools', 'software', 'automation', 'productivity'] },

  // Travel (7)
  { id: 701, primaryNicheId: 7, name: 'Luxury Resorts & First Class Travel', multiplier: 1.55, description: 'Editorial/cinematic production, luxury audience profile.', keywords: ['luxury hotel', 'resort', 'first class', 'honeymoon'] },
  { id: 702, primaryNicheId: 7, name: 'Hiking, Camping & Wilderness Adventure', multiplier: 1.35, description: 'Technical gear demonstration, rugged field filming.', keywords: ['camping', 'hiking', 'national parks', 'outdoors'] },
];

// ==========================================
// 3. SOURCED COMMERCIAL RIGHTS & EXCLUSIVITY (Aspire 2026)
// ==========================================

export const USAGE_RATES: Record<PlacementScope, Record<RightsDuration, number>> = {
  organic_repost: {
    '30_days': 0.00,
    '60_days': 0.05,
    '90_days': 0.10,
    '6_months': 0.15,
    '12_months': 0.20,
    perpetual: 0.30,
  },
  paid_partnership_ads: {
    '30_days': 0.25,
    '60_days': 0.35,
    '90_days': 0.50,
    '6_months': 0.70,
    '12_months': 1.00,
    perpetual: 1.00,
  },
  whitelisting: {
    '30_days': 0.30,
    '60_days': 0.40,
    '90_days': 0.50,
    '6_months': 0.70,
    '12_months': 0.90,
    perpetual: 1.20,
  },
  website_pdp: {
    '30_days': 0.15,
    '60_days': 0.20,
    '90_days': 0.25,
    '6_months': 0.35,
    '12_months': 0.50,
    perpetual: 0.75,
  },
  email_crm: {
    '30_days': 0.10,
    '60_days': 0.12,
    '90_days': 0.15,
    '6_months': 0.20,
    '12_months': 0.30,
    perpetual: 0.50,
  },
  tv_streaming: {
    '30_days': 0.50,
    '60_days': 0.65,
    '90_days': 0.75,
    '6_months': 1.00,
    '12_months': 1.50,
    perpetual: 2.00,
  },
  ooh_print: {
    '30_days': 0.60,
    '60_days': 0.75,
    '90_days': 0.85,
    '6_months': 1.10,
    '12_months': 1.60,
    perpetual: 2.20,
  },
  perpetual_buyout: {
    '30_days': 0.60,
    '60_days': 0.60,
    '90_days': 0.75,
    '6_months': 0.75,
    '12_months': 1.00,
    perpetual: 1.00,
  },
};

export const EXCLUSIVITY_RATES: Record<ExclusivityScope, Record<ExclusivityDuration, number>> = {
  none: {
    '14_days': 0.00,
    '30_days': 0.00,
    '60_days': 0.00,
    '90_days': 0.00,
    '6_months': 0.00,
    '12_months': 0.00,
  },
  direct_competitors: {
    '14_days': 0.25,
    '30_days': 0.35,
    '60_days': 0.50,
    '90_days': 0.75,
    '6_months': 1.00,
    '12_months': 1.50,
  },
  full_category: {
    '14_days': 0.35,
    '30_days': 0.50,
    '60_days': 0.75,
    '90_days': 1.00,
    '6_months': 1.50,
    '12_months': 2.00,
  },
};

// ==========================================
// 4. 20-COUNTRY GLOBAL GDP PPP & FX CALIBRATION MATRIX
// ==========================================

export const REGIONAL_CONFIG: Record<
  RegionCode,
  {
    name: string;
    pppIndex: number;
    currency: string;
    fxRateToUSD: number;
    symbol: string;
  }
> = {
  US: { name: 'United States', pppIndex: 1.00, currency: 'USD', fxRateToUSD: 1.00, symbol: '$' },
  GB: { name: 'United Kingdom', pppIndex: 0.85, currency: 'GBP', fxRateToUSD: 0.79, symbol: '£' },
  UK: { name: 'United Kingdom', pppIndex: 0.85, currency: 'GBP', fxRateToUSD: 0.79, symbol: '£' },
  CA: { name: 'Canada', pppIndex: 0.90, currency: 'CAD', fxRateToUSD: 1.36, symbol: 'CA$' },
  AU: { name: 'Australia', pppIndex: 0.88, currency: 'AUD', fxRateToUSD: 1.52, symbol: 'AU$' },
  DE: { name: 'Germany', pppIndex: 0.85, currency: 'EUR', fxRateToUSD: 0.92, symbol: '€' },
  FR: { name: 'France', pppIndex: 0.84, currency: 'EUR', fxRateToUSD: 0.92, symbol: '€' },
  NL: { name: 'Netherlands', pppIndex: 0.86, currency: 'EUR', fxRateToUSD: 0.92, symbol: '€' },
  AE: { name: 'United Arab Emirates', pppIndex: 0.68, currency: 'AED', fxRateToUSD: 3.673, symbol: 'AED ' },
  SA: { name: 'Saudi Arabia', pppIndex: 0.62, currency: 'SAR', fxRateToUSD: 3.75, symbol: 'SAR ' },
  SG: { name: 'Singapore', pppIndex: 0.82, currency: 'SGD', fxRateToUSD: 1.34, symbol: 'SG$' },
  JP: { name: 'Japan', pppIndex: 0.72, currency: 'JPY', fxRateToUSD: 154.00, symbol: '¥' },
  BR: { name: 'Brazil', pppIndex: 0.36, currency: 'BRL', fxRateToUSD: 5.45, symbol: 'R$ ' },
  MX: { name: 'Mexico', pppIndex: 0.40, currency: 'MXN', fxRateToUSD: 18.20, symbol: 'Mex$ ' },
  IN: { name: 'India', pppIndex: 0.24, currency: 'INR', fxRateToUSD: 83.50, symbol: '₹' },
  PK: { name: 'Pakistan', pppIndex: 0.18, currency: 'PKR', fxRateToUSD: 278.50, symbol: 'Rs. ' },
  BD: { name: 'Bangladesh', pppIndex: 0.20, currency: 'BDT', fxRateToUSD: 117.00, symbol: '৳' },
  NG: { name: 'Nigeria', pppIndex: 0.16, currency: 'NGN', fxRateToUSD: 1550.00, symbol: '₦' },
  EG: { name: 'Egypt', pppIndex: 0.17, currency: 'EGP', fxRateToUSD: 48.20, symbol: 'E£ ' },
  TR: { name: 'Turkey', pppIndex: 0.32, currency: 'TRY', fxRateToUSD: 33.50, symbol: '₺' },
  ZA: { name: 'South Africa', pppIndex: 0.38, currency: 'ZAR', fxRateToUSD: 18.10, symbol: 'R ' },
};

export const FORMAT_LABELS: Record<DeliverableFormat, { label: string; platform: string; tag: string }> = {
  ig_reel: { label: 'Instagram Reel (60-90s)', platform: 'Instagram', tag: 'Reel' },
  ig_carousel: { label: 'Instagram Carousel (3-5 Slides)', platform: 'Instagram', tag: 'Carousel' },
  ig_static: { label: 'Instagram Static Post', platform: 'Instagram', tag: 'Post' },
  ig_story: { label: 'Instagram Story (3-Frame Set)', platform: 'Instagram', tag: 'Story' },
  tiktok_video: { label: 'TikTok Video (Dedicated)', platform: 'TikTok', tag: 'TikTok' },
  yt_short: { label: 'YouTube Short', platform: 'YouTube', tag: 'Short' },
  yt_integrated: { label: 'YouTube 60s Integration', platform: 'YouTube', tag: 'Integration' },
  yt_dedicated: { label: 'YouTube Dedicated Video', platform: 'YouTube', tag: 'Dedicated' },
};
