import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

// 1. 16-Knot Empirical Matrices
const INSTAGRAM_16_KNOTS = [
  { knotId: 'K01', followers: 1000, benchmarkEr: 4.50, rates: { ig_reel: 80, ig_carousel: 60, ig_static: 50, ig_story: 30 }, citation: 'Collabstr Entry Floor' },
  { knotId: 'K02', followers: 2500, benchmarkEr: 4.00, rates: { ig_reel: 250, ig_carousel: 200, ig_static: 150, ig_story: 95 }, citation: 'Aspire Verified (p. 12)' },
  { knotId: 'K03', followers: 5000, benchmarkEr: 3.00, rates: { ig_reel: 350, ig_carousel: 260, ig_static: 200, ig_story: 110 }, citation: 'Continuous Progression' },
  { knotId: 'K04', followers: 10000, benchmarkEr: 2.19, rates: { ig_reel: 480, ig_carousel: 350, ig_static: 270, ig_story: 135 }, citation: 'Continuous Progression' },
  { knotId: 'K05', followers: 15000, benchmarkEr: 1.70, rates: { ig_reel: 590, ig_carousel: 420, ig_static: 330, ig_story: 155 }, citation: 'Continuous Progression' },
  { knotId: 'K06', followers: 25000, benchmarkEr: 1.26, rates: { ig_reel: 750, ig_carousel: 500, ig_static: 400, ig_story: 180 }, citation: 'Aspire Verified (p. 12)' },
  { knotId: 'K07', followers: 40000, benchmarkEr: 0.85, rates: { ig_reel: 1200, ig_carousel: 800, ig_static: 650, ig_story: 295 }, citation: 'Continuous Progression' },
  { knotId: 'K08', followers: 60000, benchmarkEr: 0.65, rates: { ig_reel: 1800, ig_carousel: 1200, ig_static: 1000, ig_story: 450 }, citation: 'Aspire Verified (p. 12)' },
  { knotId: 'K09', followers: 100000, benchmarkEr: 0.55, rates: { ig_reel: 2300, ig_carousel: 1500, ig_static: 1250, ig_story: 570 }, citation: 'Continuous Progression' },
  { knotId: 'K10', followers: 150000, benchmarkEr: 0.50, rates: { ig_reel: 2900, ig_carousel: 1850, ig_static: 1500, ig_story: 720 }, citation: 'Continuous Progression' },
  { knotId: 'K11', followers: 250000, benchmarkEr: 0.48, rates: { ig_reel: 4000, ig_carousel: 2500, ig_static: 2000, ig_story: 1000 }, citation: 'Aspire Verified (p. 12)' },
  { knotId: 'K12', followers: 500000, benchmarkEr: 0.45, rates: { ig_reel: 6000, ig_carousel: 3850, ig_static: 3000, ig_story: 1500 }, citation: 'Continuous Progression' },
  { knotId: 'K13', followers: 750000, benchmarkEr: 0.42, rates: { ig_reel: 8000, ig_carousel: 5150, ig_static: 4000, ig_story: 2000 }, citation: 'Continuous Progression' },
  { knotId: 'K14', followers: 1000000, benchmarkEr: 0.40, rates: { ig_reel: 10000, ig_carousel: 6500, ig_static: 5000, ig_story: 2500 }, citation: 'Model Extrapolation' },
  { knotId: 'K15', followers: 2500000, benchmarkEr: 0.35, rates: { ig_reel: 15625, ig_carousel: 10000, ig_static: 7650, ig_story: 3800 }, citation: 'Model Extrapolation' },
  { knotId: 'K16', followers: 5000000, benchmarkEr: 0.30, rates: { ig_reel: 25000, ig_carousel: 16000, ig_static: 12000, ig_story: 6000 }, citation: 'Model Extrapolation' },
];

const TIKTOK_16_KNOTS = [
  { knotId: 'K01', followers: 1000, benchmarkEr: 10.00, expectedViews: 400, rates: { tiktok_video: 60 }, citation: 'Entry transaction floor' },
  { knotId: 'K02', followers: 2500, benchmarkEr: 8.50, expectedViews: 875, rates: { tiktok_video: 150 }, citation: 'Aspire Verified (p. 16)' },
  { knotId: 'K03', followers: 5000, benchmarkEr: 7.00, expectedViews: 1500, rates: { tiktok_video: 200 }, citation: 'Continuous Progression' },
  { knotId: 'K04', followers: 10000, benchmarkEr: 6.00, expectedViews: 2500, rates: { tiktok_video: 260 }, citation: 'Continuous Progression' },
  { knotId: 'K05', followers: 15000, benchmarkEr: 5.50, expectedViews: 3300, rates: { tiktok_video: 305 }, citation: 'Continuous Progression' },
  { knotId: 'K06', followers: 25000, benchmarkEr: 4.80, expectedViews: 5000, rates: { tiktok_video: 350 }, citation: 'Aspire Verified (p. 16)' },
  { knotId: 'K07', followers: 40000, benchmarkEr: 4.50, expectedViews: 7200, rates: { tiktok_video: 550 }, citation: 'Continuous Progression' },
  { knotId: 'K08', followers: 60000, benchmarkEr: 4.30, expectedViews: 9000, rates: { tiktok_video: 900 }, citation: 'Aspire Verified (p. 16)' },
  { knotId: 'K09', followers: 100000, benchmarkEr: 4.00, expectedViews: 12000, rates: { tiktok_video: 1250 }, citation: 'Continuous Progression' },
  { knotId: 'K10', followers: 150000, benchmarkEr: 3.80, expectedViews: 15000, rates: { tiktok_video: 1600 }, citation: 'Continuous Progression' },
  { knotId: 'K11', followers: 250000, benchmarkEr: 3.50, expectedViews: 20000, rates: { tiktok_video: 2250 }, citation: 'Aspire Verified (p. 16)' },
  { knotId: 'K12', followers: 500000, benchmarkEr: 3.20, expectedViews: 30000, rates: { tiktok_video: 4800 }, citation: 'Continuous Progression' },
  { knotId: 'K13', followers: 750000, benchmarkEr: 3.00, expectedViews: 37500, rates: { tiktok_video: 7400 }, citation: 'Continuous Progression' },
  { knotId: 'K14', followers: 1000000, benchmarkEr: 2.80, expectedViews: 40000, rates: { tiktok_video: 10000 }, citation: 'Aspire Verified (p. 16)' },
  { knotId: 'K15', followers: 2500000, benchmarkEr: 2.50, expectedViews: 75000, rates: { tiktok_video: 15625 }, citation: 'Model Extrapolation' },
  { knotId: 'K16', followers: 5000000, benchmarkEr: 2.00, expectedViews: 100000, rates: { tiktok_video: 25000 }, citation: 'Model Extrapolation' },
];

const YOUTUBE_16_KNOTS = [
  { knotId: 'K01', followers: 1000, benchmarkEr: 4.50, expectedViews: 300, rates: { yt_dedicated: 450, yt_integrated: 250, yt_short: 100 }, citation: 'Production Floor' },
  { knotId: 'K02', followers: 2500, benchmarkEr: 4.00, expectedViews: 750, rates: { yt_dedicated: 700, yt_integrated: 400, yt_short: 200 }, citation: 'Aspire Verified (p. 18)' },
  { knotId: 'K03', followers: 5000, benchmarkEr: 3.80, expectedViews: 1500, rates: { yt_dedicated: 710, yt_integrated: 400, yt_short: 210 }, citation: 'Labor Cost Floor' },
  { knotId: 'K04', followers: 10000, benchmarkEr: 3.50, expectedViews: 2800, rates: { yt_dedicated: 725, yt_integrated: 400, yt_short: 225 }, citation: 'Labor Cost Floor' },
  { knotId: 'K05', followers: 15000, benchmarkEr: 3.30, expectedViews: 4000, rates: { yt_dedicated: 735, yt_integrated: 400, yt_short: 235 }, citation: 'Labor Cost Floor' },
  { knotId: 'K06', followers: 25000, benchmarkEr: 3.00, expectedViews: 6500, rates: { yt_dedicated: 750, yt_integrated: 400, yt_short: 250 }, citation: 'Aspire Verified (p. 18)' },
  { knotId: 'K07', followers: 40000, benchmarkEr: 2.80, expectedViews: 10000, rates: { yt_dedicated: 1200, yt_integrated: 700, yt_short: 375 }, citation: 'Media CPM Transition' },
  { knotId: 'K08', followers: 60000, benchmarkEr: 2.60, expectedViews: 15000, rates: { yt_dedicated: 1750, yt_integrated: 1000, yt_short: 500 }, citation: 'Aspire Verified (p. 18)' },
  { knotId: 'K09', followers: 100000, benchmarkEr: 2.40, expectedViews: 22000, rates: { yt_dedicated: 2050, yt_integrated: 2100, yt_short: 720 }, citation: 'Media Reach Baseline' },
  { knotId: 'K10', followers: 150000, benchmarkEr: 2.20, expectedViews: 32000, rates: { yt_dedicated: 2400, yt_integrated: 3400, yt_short: 980 }, citation: 'Media Reach Baseline' },
  { knotId: 'K11', followers: 250000, benchmarkEr: 2.00, expectedViews: 50000, rates: { yt_dedicated: 3000, yt_integrated: 6000, yt_short: 1500 }, citation: 'Aspire Verified (p. 18)' },
  { knotId: 'K12', followers: 500000, benchmarkEr: 1.80, expectedViews: 90000, rates: { yt_dedicated: 6200, yt_integrated: 9000, yt_short: 2200 }, citation: 'Continuous Progression' },
  { knotId: 'K13', followers: 750000, benchmarkEr: 1.60, expectedViews: 130000, rates: { yt_dedicated: 9400, yt_integrated: 12000, yt_short: 2850 }, citation: 'Continuous Progression' },
  { knotId: 'K14', followers: 1000000, benchmarkEr: 1.50, expectedViews: 175000, rates: { yt_dedicated: 12500, yt_integrated: 15000, yt_short: 3500 }, citation: 'Model Extrapolation' },
  { knotId: 'K15', followers: 2500000, benchmarkEr: 1.20, expectedViews: 350000, rates: { yt_dedicated: 21000, yt_integrated: 19000, yt_short: 6000 }, citation: 'Model Extrapolation' },
  { knotId: 'K16', followers: 5000000, benchmarkEr: 1.00, expectedViews: 600000, rates: { yt_dedicated: 35000, yt_integrated: 25000, yt_short: 10000 }, citation: 'Model Extrapolation' },
];

// 2. 13 Primary Sourced Niches (Aspire $562 Lifestyle Baseline)
const PRIMARY_NICHES = [
  { id: 1, name: 'Home Design & Decor', multiplier: 2.67, description: 'High-ticket room staging, architectural lighting, multi-day production ($1,500 / $562 baseline).', evidenceSource: 'Aspire 2026 (p. 14)' },
  { id: 2, name: 'Pet Care & Animals', multiplier: 1.78, description: 'Deep audience affinity, pet talent logistics, high viral share rates ($1,000 / $562 baseline).', evidenceSource: 'Aspire 2026 (p. 14)' },
  { id: 3, name: 'Business, Finance & B2B SaaS', multiplier: 1.50, description: 'Highest CPMs across digital media ($30–$60+ CPM), high-intent audience, corporate budgets.', evidenceSource: 'SignCollab Model / Modash 2026' },
  { id: 4, name: 'Skilled Trades & DIY', multiplier: 1.44, description: 'Specialized tooling, instructional fidelity, high project completion value ($309 / $214 avg).', evidenceSource: 'Collabstr Verified Deal Data' },
  { id: 5, name: 'Education & Career Coaching', multiplier: 1.43, description: 'Professional authority, high-ticket digital courses, corporate career transition audiences.', evidenceSource: 'Collabstr Verified Deal Data' },
  { id: 6, name: 'Technology, Hardware & AI', multiplier: 1.35, description: 'Technical benchmark depth, developer software trials, high hardware buyer consideration.', evidenceSource: 'SignCollab Model / Modash 2026' },
  { id: 7, name: 'Travel, Tourism & Outdoors', multiplier: 1.33, description: 'On-location filming logistics, high booking values, cinematic drone production ($750 / $562).', evidenceSource: 'Aspire 2026 (p. 14)' },
  { id: 8, name: 'Lifestyle & Daily Vlogs', multiplier: 1.00, description: 'Broad mass-market reach, native storytelling, universal baseline anchor ($562 / $562).', evidenceSource: 'Aspire 2026 Baseline Anchor (p. 14)' },
  { id: 9, name: 'Food, Culinary & Beverage', multiplier: 0.89, description: 'Recipe development time, kitchen styling prep, accessible consumer brand sponsors ($500 / $562).', evidenceSource: 'Aspire 2026 (p. 14)' },
  { id: 10, name: 'Family & Parenting', multiplier: 0.89, description: 'High-trust parental demographic, strong household purchasing authority ($500 / $562).', evidenceSource: 'Aspire 2026 (p. 14)' },
  { id: 11, name: 'Health, Wellness & Fitness', multiplier: 0.80, description: 'Active community engagement, strong DM lead funnels, workout routine demos ($450 / $562).', evidenceSource: 'Aspire 2026 (p. 14)' },
  { id: 12, name: 'Fashion & Apparel', multiplier: 0.53, description: 'High creator supply, gifting deals, rapid trend turnover hauls ($300 / $562).', evidenceSource: 'Aspire 2026 (p. 14)' },
  { id: 13, name: 'Beauty & Cosmetics', multiplier: 0.45, description: 'Highly saturated creator market, short routine creation times, affiliate deals ($250 / $562).', evidenceSource: 'Aspire 2026 (p. 14)' },
];

const SUB_NICHES = [
  { id: 101, primaryNicheId: 1, name: 'Interior Architecture & Renovations', multiplier: 2.80, description: 'Multi-day shoots, architectural lighting, luxury renovations.', keywords: ['interior', 'renovation', 'architecture', 'remodel'] },
  { id: 102, primaryNicheId: 1, name: 'Furniture Styling & Room Makeovers', multiplier: 2.67, description: 'High-ticket sponsorships, room staging.', keywords: ['furniture', 'makeover', 'decor', 'living room'] },
  { id: 103, primaryNicheId: 1, name: 'DIY Decor & Woodworking', multiplier: 2.20, description: 'Step-by-step tutorial editing, materials.', keywords: ['diy', 'woodworking', 'crafts', 'home improvement'] },

  { id: 201, primaryNicheId: 2, name: 'Dog & Cat Training / Lifestyle', multiplier: 1.78, description: 'Animal coordination, high community viral share rate.', keywords: ['dogs', 'cats', 'puppies', 'pet training'] },
  { id: 202, primaryNicheId: 2, name: 'Veterinary Advice & Nutrition', multiplier: 1.90, description: 'Certified expert credibility, health compliance.', keywords: ['veterinary', 'pet food', 'nutrition', 'animal health'] },

  { id: 301, primaryNicheId: 3, name: 'Personal Investing, Stocks & Crypto', multiplier: 1.80, description: 'Highest CPMs, strict financial disclosures.', keywords: ['stocks', 'crypto', 'investing', 'wealth', 'trading'] },
  { id: 302, primaryNicheId: 3, name: 'B2B SaaS, Startups & Tech Founders', multiplier: 1.65, description: 'B2B software purchasing power, executive lead gen.', keywords: ['startup', 'founder', 'business', 'saas', 'software'] },
  { id: 303, primaryNicheId: 3, name: 'Real Estate & Property Investing', multiplier: 1.60, description: 'High-net-worth demographic, high conversion values.', keywords: ['real estate', 'property', 'mortgages', 'rentals'] },

  { id: 601, primaryNicheId: 6, name: 'PC Hardware & Custom Builds', multiplier: 1.45, description: 'In-depth benchmarks, high enthusiast spending.', keywords: ['gpu', 'pc build', 'hardware', 'custom pc'] },
  { id: 602, primaryNicheId: 6, name: 'Consumer Tech, Smartphones & Audio', multiplier: 1.35, description: 'Rapid product cycles, high visual demo requirements.', keywords: ['smartphones', 'headphones', 'gadgets', 'apple', 'android'] },
  { id: 603, primaryNicheId: 6, name: 'AI Tools & Productivity Automations', multiplier: 1.50, description: 'High trial-to-paid conversion intent, software budgets.', keywords: ['ai tools', 'software', 'automation', 'productivity'] },

  { id: 701, primaryNicheId: 7, name: 'Luxury Resorts & First Class Travel', multiplier: 1.55, description: 'Editorial/cinematic production, luxury audience profile.', keywords: ['luxury hotel', 'resort', 'first class', 'honeymoon'] },
  { id: 702, primaryNicheId: 7, name: 'Hiking, Camping & Wilderness Adventure', multiplier: 1.35, description: 'Technical gear demonstration, rugged field filming.', keywords: ['camping', 'hiking', 'national parks', 'outdoors'] },
];

// 3. Commercial Rights & Exclusivity Surcharges
const USAGE_SCHEDULE = [
  { scope: 'organic_repost', duration: '30_days', surchargePct: 0.00, desc: 'Organic social reposting on owned channels' },
  { scope: 'organic_repost', duration: '60_days', surchargePct: 0.05, desc: 'Organic social reposting 60 days' },
  { scope: 'organic_repost', duration: '90_days', surchargePct: 0.10, desc: 'Organic social reposting 90 days' },
  { scope: 'organic_repost', duration: '6_months', surchargePct: 0.15, desc: 'Organic social reposting 6 months' },
  { scope: 'organic_repost', duration: '12_months', surchargePct: 0.20, desc: 'Organic social reposting 12 months' },
  { scope: 'organic_repost', duration: 'perpetual', surchargePct: 0.30, desc: 'Organic social reposting perpetual' },

  { scope: 'paid_partnership_ads', duration: '30_days', surchargePct: 0.25, desc: '30-day paid partnership ads / dark posting' },
  { scope: 'paid_partnership_ads', duration: '60_days', surchargePct: 0.35, desc: '60-day paid partnership ads' },
  { scope: 'paid_partnership_ads', duration: '90_days', surchargePct: 0.50, desc: '90-day seasonal campaign advertising' },
  { scope: 'paid_partnership_ads', duration: '6_months', surchargePct: 0.70, desc: '6-month multi-quarter paid advertising' },
  { scope: 'paid_partnership_ads', duration: '12_months', surchargePct: 1.00, desc: 'Annual paid advertising license' },
  { scope: 'paid_partnership_ads', duration: 'perpetual', surchargePct: 1.00, desc: 'Perpetual paid advertising license' },

  { scope: 'whitelisting', duration: '30_days', surchargePct: 0.30, desc: 'Creator Ad Handle permission / whitelisting' },
  { scope: 'whitelisting', duration: '60_days', surchargePct: 0.40, desc: 'Creator Ad Handle permission 60 days' },
  { scope: 'whitelisting', duration: '90_days', surchargePct: 0.50, desc: 'Creator Ad Handle permission 90 days' },
  { scope: 'whitelisting', duration: '6_months', surchargePct: 0.70, desc: 'Creator Ad Handle permission 6 months' },
  { scope: 'whitelisting', duration: '12_months', surchargePct: 0.90, desc: 'Creator Ad Handle permission 12 months' },
  { scope: 'whitelisting', duration: 'perpetual', surchargePct: 1.20, desc: 'Creator Ad Handle permission perpetual' },

  { scope: 'website_pdp', duration: '30_days', surchargePct: 0.15, desc: 'E-commerce storefront and PDP embeds' },
  { scope: 'website_pdp', duration: '60_days', surchargePct: 0.20, desc: 'E-commerce storefront embeds 60 days' },
  { scope: 'website_pdp', duration: '90_days', surchargePct: 0.25, desc: 'E-commerce storefront embeds 90 days' },
  { scope: 'website_pdp', duration: '6_months', surchargePct: 0.35, desc: 'E-commerce storefront embeds 6 months' },
  { scope: 'website_pdp', duration: '12_months', surchargePct: 0.50, desc: 'E-commerce storefront embeds 12 months' },
  { scope: 'website_pdp', duration: 'perpetual', surchargePct: 0.75, desc: 'E-commerce storefront embeds perpetual' },

  { scope: 'tv_streaming', duration: '30_days', surchargePct: 0.50, desc: 'Broadcast television & CTV streaming' },
  { scope: 'tv_streaming', duration: '60_days', surchargePct: 0.65, desc: 'Broadcast television 60 days' },
  { scope: 'tv_streaming', duration: '90_days', surchargePct: 0.75, desc: 'Broadcast television 90 days' },
  { scope: 'tv_streaming', duration: '6_months', surchargePct: 1.00, desc: 'Broadcast television 6 months' },
  { scope: 'tv_streaming', duration: '12_months', surchargePct: 1.50, desc: 'Broadcast television 12 months' },
  { scope: 'tv_streaming', duration: 'perpetual', surchargePct: 2.00, desc: 'Broadcast television perpetual' },
];

const EXCLUSIVITY_SCHEDULE = [
  { scope: 'none', duration: '14_days', surchargePct: 0.00, desc: 'Non-exclusive collaboration' },
  { scope: 'none', duration: '30_days', surchargePct: 0.00, desc: 'Non-exclusive collaboration' },
  { scope: 'none', duration: '60_days', surchargePct: 0.00, desc: 'Non-exclusive collaboration' },
  { scope: 'none', duration: '90_days', surchargePct: 0.00, desc: 'Non-exclusive collaboration' },
  { scope: 'none', duration: '6_months', surchargePct: 0.00, desc: 'Non-exclusive collaboration' },
  { scope: 'none', duration: '12_months', surchargePct: 0.00, desc: 'Non-exclusive collaboration' },

  { scope: 'direct_competitors', duration: '14_days', surchargePct: 0.25, desc: '14-day direct competitor lockout' },
  { scope: 'direct_competitors', duration: '30_days', surchargePct: 0.35, desc: '30-day direct competitor lockout' },
  { scope: 'direct_competitors', duration: '60_days', surchargePct: 0.50, desc: '60-day direct competitor lockout' },
  { scope: 'direct_competitors', duration: '90_days', surchargePct: 0.75, desc: '90-day direct competitor lockout' },
  { scope: 'direct_competitors', duration: '6_months', surchargePct: 1.00, desc: '6-month direct competitor lockout' },
  { scope: 'direct_competitors', duration: '12_months', surchargePct: 1.50, desc: '12-month direct competitor lockout' },

  { scope: 'full_category', duration: '14_days', surchargePct: 0.35, desc: '14-day full vertical category lockout' },
  { scope: 'full_category', duration: '30_days', surchargePct: 0.50, desc: '30-day full vertical category lockout' },
  { scope: 'full_category', duration: '60_days', surchargePct: 0.75, desc: '60-day full vertical category lockout' },
  { scope: 'full_category', duration: '90_days', surchargePct: 1.00, desc: '90-day full vertical category lockout' },
  { scope: 'full_category', duration: '6_months', surchargePct: 1.50, desc: '6-month full vertical category lockout' },
  { scope: 'full_category', duration: '12_months', surchargePct: 2.00, desc: 'Full annual brand ambassadorship lockout' },
];

// 4. Regional PPP & Live FX Configurations (20 Countries)
const REGIONAL_CONFIGS = [
  { countryCode: 'US', name: 'United States', currency: 'USD' as const, pppIndex: 1.00, fxRateToUSD: 1.00, symbol: '$' },
  { countryCode: 'GB', name: 'United Kingdom', currency: 'GBP' as const, pppIndex: 0.85, fxRateToUSD: 0.79, symbol: '£' },
  { countryCode: 'CA', name: 'Canada', currency: 'CAD' as const, pppIndex: 0.90, fxRateToUSD: 1.36, symbol: 'CA$' },
  { countryCode: 'AU', name: 'Australia', currency: 'AUD' as const, pppIndex: 0.88, fxRateToUSD: 1.52, symbol: 'AU$' },
  { countryCode: 'DE', name: 'Germany', currency: 'EUR' as const, pppIndex: 0.85, fxRateToUSD: 0.92, symbol: '€' },
  { countryCode: 'FR', name: 'France', currency: 'EUR' as const, pppIndex: 0.84, fxRateToUSD: 0.92, symbol: '€' },
  { countryCode: 'NL', name: 'Netherlands', currency: 'EUR' as const, pppIndex: 0.86, fxRateToUSD: 0.92, symbol: '€' },
  { countryCode: 'AE', name: 'United Arab Emirates', currency: 'AED' as const, pppIndex: 0.68, fxRateToUSD: 3.673, symbol: 'AED ' },
  { countryCode: 'SA', name: 'Saudi Arabia', currency: 'SAR' as const, pppIndex: 0.62, fxRateToUSD: 3.75, symbol: 'SAR ' },
  { countryCode: 'SG', name: 'Singapore', currency: 'SGD' as const, pppIndex: 0.82, fxRateToUSD: 1.34, symbol: 'SG$' },
  { countryCode: 'JP', name: 'Japan', currency: 'USD' as const, pppIndex: 0.72, fxRateToUSD: 154.00, symbol: '¥' },
  { countryCode: 'BR', name: 'Brazil', currency: 'BRL' as const, pppIndex: 0.36, fxRateToUSD: 5.45, symbol: 'R$ ' },
  { countryCode: 'MX', name: 'Mexico', currency: 'MXN' as const, pppIndex: 0.40, fxRateToUSD: 18.20, symbol: 'Mex$ ' },
  { countryCode: 'IN', name: 'India', currency: 'INR' as const, pppIndex: 0.24, fxRateToUSD: 83.50, symbol: '₹' },
  { countryCode: 'PK', name: 'Pakistan', currency: 'PKR' as const, pppIndex: 0.18, fxRateToUSD: 278.50, symbol: 'Rs. ' },
  { countryCode: 'BD', name: 'Bangladesh', currency: 'USD' as const, pppIndex: 0.20, fxRateToUSD: 117.00, symbol: '৳' },
  { countryCode: 'NG', name: 'Nigeria', currency: 'NGN' as const, pppIndex: 0.16, fxRateToUSD: 1550.00, symbol: '₦' },
  { countryCode: 'EG', name: 'Egypt', currency: 'EGP' as const, pppIndex: 0.17, fxRateToUSD: 48.20, symbol: 'E£ ' },
  { countryCode: 'TR', name: 'Turkey', currency: 'USD' as const, pppIndex: 0.32, fxRateToUSD: 33.50, symbol: '₺' },
  { countryCode: 'ZA', name: 'South Africa', currency: 'ZAR' as const, pppIndex: 0.38, fxRateToUSD: 18.10, symbol: 'R ' },
];

export async function seedCalculatorConstants() {
  console.log('🌱 [Seeding] Starting Influencer Rate Calculator Database Seed...');

  // 1. Seed Knots
  console.log('Inserting Instagram 16-knots...');
  for (const knot of INSTAGRAM_16_KNOTS) {
    await prisma.calculatorPlatformKnot.upsert({
      where: { platform_knotId: { platform: 'instagram', knotId: knot.knotId } },
      update: {
        followers: knot.followers,
        benchmarkEr: knot.benchmarkEr,
        rates: knot.rates,
        statusCitation: knot.citation,
      },
      create: {
        platform: 'instagram',
        knotId: knot.knotId,
        followers: knot.followers,
        benchmarkEr: knot.benchmarkEr,
        rates: knot.rates,
        statusCitation: knot.citation,
      },
    });
  }

  console.log('Inserting TikTok 16-knots...');
  for (const knot of TIKTOK_16_KNOTS) {
    await prisma.calculatorPlatformKnot.upsert({
      where: { platform_knotId: { platform: 'tiktok', knotId: knot.knotId } },
      update: {
        followers: knot.followers,
        benchmarkEr: knot.benchmarkEr,
        expectedViews: knot.expectedViews,
        rates: knot.rates,
        statusCitation: knot.citation,
      },
      create: {
        platform: 'tiktok',
        knotId: knot.knotId,
        followers: knot.followers,
        benchmarkEr: knot.benchmarkEr,
        expectedViews: knot.expectedViews,
        rates: knot.rates,
        statusCitation: knot.citation,
      },
    });
  }

  console.log('Inserting YouTube 16-knots...');
  for (const knot of YOUTUBE_16_KNOTS) {
    await prisma.calculatorPlatformKnot.upsert({
      where: { platform_knotId: { platform: 'youtube', knotId: knot.knotId } },
      update: {
        followers: knot.followers,
        benchmarkEr: knot.benchmarkEr,
        expectedViews: knot.expectedViews,
        rates: knot.rates,
        statusCitation: knot.citation,
      },
      create: {
        platform: 'youtube',
        knotId: knot.knotId,
        followers: knot.followers,
        benchmarkEr: knot.benchmarkEr,
        expectedViews: knot.expectedViews,
        rates: knot.rates,
        statusCitation: knot.citation,
      },
    });
  }

  // 2. Seed Niches
  console.log('Inserting Primary Niches...');
  for (const niche of PRIMARY_NICHES) {
    await prisma.calculatorNiche.upsert({
      where: { id: niche.id },
      update: {
        name: niche.name,
        multiplier: niche.multiplier,
        description: niche.description,
        evidenceSource: niche.evidenceSource,
      },
      create: {
        id: niche.id,
        name: niche.name,
        multiplier: niche.multiplier,
        description: niche.description,
        evidenceSource: niche.evidenceSource,
      },
    });
  }

  console.log('Inserting Sub-Niches...');
  for (const sub of SUB_NICHES) {
    await prisma.calculatorSubNiche.upsert({
      where: { id: sub.id },
      update: {
        primaryNicheId: sub.primaryNicheId,
        name: sub.name,
        multiplier: sub.multiplier,
        description: sub.description,
        keywords: sub.keywords,
      },
      create: {
        id: sub.id,
        primaryNicheId: sub.primaryNicheId,
        name: sub.name,
        multiplier: sub.multiplier,
        description: sub.description,
        keywords: sub.keywords,
      },
    });
  }

  // 3. Seed Commercial Rates
  console.log('Inserting Commercial Usage & Exclusivity Rates...');
  for (const item of USAGE_SCHEDULE) {
    await prisma.calculatorCommercialRate.upsert({
      where: { rateType_scope_duration: { rateType: 'USAGE', scope: item.scope, duration: item.duration } },
      update: { surchargePct: item.surchargePct, description: item.desc },
      create: { rateType: 'USAGE', scope: item.scope, duration: item.duration, surchargePct: item.surchargePct, description: item.desc },
    });
  }

  for (const item of EXCLUSIVITY_SCHEDULE) {
    await prisma.calculatorCommercialRate.upsert({
      where: { rateType_scope_duration: { rateType: 'EXCLUSIVITY', scope: item.scope, duration: item.duration } },
      update: { surchargePct: item.surchargePct, description: item.desc },
      create: { rateType: 'EXCLUSIVITY', scope: item.scope, duration: item.duration, surchargePct: item.surchargePct, description: item.desc },
    });
  }

  // 4. Seed Regional Configurations
  console.log('Inserting 20-Country Regional Calibration Matrix...');
  for (const reg of REGIONAL_CONFIGS) {
    await prisma.calculatorRegionalConfig.upsert({
      where: { countryCode: reg.countryCode },
      update: {
        name: reg.name,
        currency: reg.currency,
        pppIndex: reg.pppIndex,
        fxRateToUSD: reg.fxRateToUSD,
        symbol: reg.symbol,
      },
      create: {
        countryCode: reg.countryCode,
        name: reg.name,
        currency: reg.currency,
        pppIndex: reg.pppIndex,
        fxRateToUSD: reg.fxRateToUSD,
        symbol: reg.symbol,
      },
    });
  }

  console.log('✅ [Seeding Complete] All calculator database constants successfully seeded into PostgreSQL.');
}

if (require.main === module) {
  seedCalculatorConstants()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
