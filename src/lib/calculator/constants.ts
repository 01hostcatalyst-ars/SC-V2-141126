import {
  DeliverableFormat,
  PlacementScope,
  RightsDuration,
  ExclusivityScope,
  ExclusivityDuration,
  RegionCode,
} from './types';

// 1. Deliverable Base Knots [FollowerCount, USD Price] (Aspire 2026 / CreatorIQ)
export const ANCHOR_KNOTS: Record<DeliverableFormat, Array<[number, number]>> = {
  ig_reel: [
    [1000, 80],
    [2500, 150],
    [10000, 250],
    [25000, 500],
    [60000, 1200],
    [250000, 4000],
    [1000000, 6500],
    [5000000, 20000],
  ],
  ig_carousel: [
    [1000, 60],
    [2500, 120],
    [10000, 200],
    [25000, 400],
    [60000, 800],
    [250000, 2500],
    [1000000, 4200],
    [5000000, 14000],
  ],
  ig_static: [
    [1000, 50],
    [2500, 100],
    [10000, 150],
    [25000, 300],
    [60000, 600],
    [250000, 2000],
    [1000000, 3200],
    [5000000, 10000],
  ],
  ig_story: [
    [1000, 30],
    [2500, 50],
    [10000, 95],
    [25000, 180],
    [60000, 300],
    [250000, 1000],
    [1000000, 1600],
    [5000000, 5000],
  ],
  tiktok_video: [
    [1000, 60],
    [2500, 100],
    [10000, 150],
    [25000, 350],
    [60000, 900],
    [250000, 2250],
    [1000000, 10000],
    [5000000, 25000],
  ],
  yt_short: [
    [1000, 80],
    [2500, 150],
    [10000, 200],
    [25000, 250],
    [60000, 500],
    [250000, 1500],
    [1000000, 3500],
    [5000000, 10000],
  ],
  yt_integrated: [
    [1000, 150],
    [2500, 250],
    [10000, 400],
    [25000, 400],
    [60000, 1000],
    [250000, 3000],
    [1000000, 7000],
    [5000000, 20000],
  ],
  yt_dedicated: [
    [1000, 300],
    [2500, 500],
    [10000, 700],
    [25000, 750],
    [60000, 1750],
    [250000, 6000],
    [1000000, 11000],
    [5000000, 35000],
  ],
};

// 2. Continuous Baseline ER Knots (Followers -> Benchmark ER %) (HypeAuditor / Aspire)
export const BENCHMARK_ER_KNOTS: Array<[number, number]> = [
  [1000, 4.00],
  [2500, 2.19],
  [25000, 0.99],
  [60000, 0.68],
  [250000, 0.54],
  [1000000, 0.61],
  [5000000, 0.50],
];

// 3. Continuous Expected View Rate Knots (Followers -> Expected Views/Follower Ratio)
export const EXPECTED_VIEW_RATE_KNOTS: Array<[number, number]> = [
  [1000, 0.40],
  [10000, 0.30],
  [50000, 0.20],
  [250000, 0.10],
  [1000000, 0.06],
  [5000000, 0.04],
];

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
    multiplier: 2.00,
    description: 'High-ticket purchases, room staging, architectural lighting, elevated production.',
    evidenceSource: 'Aspire 2026',
  },
  {
    id: 2,
    name: 'Pet Care & Animals',
    multiplier: 1.70,
    description: 'Deep audience affinity, pet talent logistics, high viral share rates.',
    evidenceSource: 'Aspire 2026',
  },
  {
    id: 3,
    name: 'Business, Finance & Fintech',
    multiplier: 1.60,
    description: 'Highest CPMs across digital media, high-intent audience, regulatory compliance.',
    evidenceSource: 'CreatorIQ 2026',
  },
  {
    id: 4,
    name: 'Travel, Hospitality & Outdoors',
    multiplier: 1.50,
    description: 'On-location travel overhead, rugged shoot logistics, high booking values.',
    evidenceSource: 'Aspire 2026',
  },
  {
    id: 5,
    name: 'Technology, AI & Gaming',
    multiplier: 1.35,
    description: 'Technical review depth, software trials, high conversion consideration.',
    evidenceSource: 'Aspire / CreatorIQ 2026',
  },
  {
    id: 6,
    name: 'Lifestyle & Daily Vlogs',
    multiplier: 1.15,
    description: 'Broad mass-market appeal, native storytelling, high multi-format versatility.',
    evidenceSource: 'Aspire 2026',
  },
  {
    id: 7,
    name: 'Food, Beverage & Culinary',
    multiplier: 1.05,
    description: 'Recipe development time, kitchen styling prep, ingredient costs.',
    evidenceSource: 'Aspire 2026',
  },
  {
    id: 8,
    name: 'Family, Parenting & Kids',
    multiplier: 1.05,
    description: 'High-trust parental demographic, strong household purchasing authority.',
    evidenceSource: 'Aspire 2026',
  },
  {
    id: 9,
    name: 'Health, Fitness & Wellness',
    multiplier: 0.95,
    description: 'Active community engagement, strong DM lead funnels, workout routine demos.',
    evidenceSource: 'Aspire / HypeAuditor 2025',
  },
  {
    id: 10,
    name: 'Fashion & Apparel',
    multiplier: 0.90,
    description: 'High creator supply, gifting deals, rapid trend cycles, accessible pricing.',
    evidenceSource: 'Aspire 2026',
  },
  {
    id: 11,
    name: 'Beauty, Cosmetics & Skincare',
    multiplier: 0.75,
    description: 'Saturated creator base, routine-based short creation time, affiliate competition.',
    evidenceSource: 'Aspire 2026',
  },
  {
    id: 12,
    name: 'Education & Career Coaching',
    multiplier: 1.45,
    description: 'Instructional authority, professional audiences, high-ticket digital courses.',
    evidenceSource: 'Manychat / HypeAuditor 2025',
  },
];

export const SUB_NICHES: SubNicheDefinition[] = [
  // Home Design (1)
  { id: 101, primaryNicheId: 1, name: 'Interior Architecture & Renovations', multiplier: 2.50, description: 'Multi-day shoots, architectural lighting, luxury renovations.', keywords: ['interior', 'renovation', 'architecture', 'remodel'] },
  { id: 102, primaryNicheId: 1, name: 'Furniture Styling & Room Makeovers', multiplier: 2.00, description: 'High-ticket sponsorships, room staging.', keywords: ['furniture', 'makeover', 'decor', 'living room'] },
  { id: 103, primaryNicheId: 1, name: 'DIY Decor, Woodworking & Crafts', multiplier: 1.80, description: 'Step-by-step tutorial editing, materials.', keywords: ['diy', 'woodworking', 'crafts', 'home improvement'] },
  { id: 104, primaryNicheId: 1, name: 'Organization & Smart Home Living', multiplier: 1.70, description: 'High save rates, practical product utility.', keywords: ['organization', 'smart home', 'appliances'] },

  // Pet Care (2)
  { id: 201, primaryNicheId: 2, name: 'Dog & Cat Lifestyle / Training', multiplier: 1.70, description: 'Animal coordination, high community viral share rate.', keywords: ['dogs', 'cats', 'puppies', 'pet training'] },
  { id: 202, primaryNicheId: 2, name: 'Veterinary Advice & Pet Nutrition', multiplier: 1.80, description: 'Certified expert credibility, health compliance.', keywords: ['veterinary', 'pet food', 'nutrition', 'animal health'] },
  { id: 203, primaryNicheId: 2, name: 'Exotic Pets & Aquascaping', multiplier: 1.60, description: 'Hyper-niche dedicated audience, specialized equipment.', keywords: ['aquarium', 'reptiles', 'birds', 'exotic pets'] },

  // Business & Finance (3)
  { id: 301, primaryNicheId: 3, name: 'Personal Investing, Stocks & Crypto', multiplier: 1.80, description: 'Highest CPMs, strict financial disclosures.', keywords: ['stocks', 'crypto', 'investing', 'wealth', 'trading'] },
  { id: 302, primaryNicheId: 3, name: 'Real Estate & Property Investing', multiplier: 1.75, description: 'High-net-worth demographic, high conversion values.', keywords: ['real estate', 'property', 'mortgages', 'rentals'] },
  { id: 303, primaryNicheId: 3, name: 'Entrepreneurship & Small Business', multiplier: 1.60, description: 'B2B lead generation, software purchasing power.', keywords: ['startup', 'founder', 'business', 'ecommerce'] },
  { id: 304, primaryNicheId: 3, name: 'Career Growth & Remote Work', multiplier: 1.50, description: 'Workplace utility, corporate audience cross-pollination.', keywords: ['resume', 'jobs', 'remote work', 'career'] },

  // Travel (4)
  { id: 401, primaryNicheId: 4, name: 'Luxury Resorts & Boutique Hotels', multiplier: 1.60, description: 'Editorial/cinematic production, luxury audience profile.', keywords: ['luxury hotel', 'resort', 'first class', 'honeymoon'] },
  { id: 402, primaryNicheId: 4, name: 'Budget Travel & Destination Guides', multiplier: 1.40, description: 'High save and share metrics, itinerary downloads.', keywords: ['backpacking', 'itinerary', 'cheap travel', 'city guide'] },
  { id: 403, primaryNicheId: 4, name: 'Hiking, Camping & Outdoor Adventure', multiplier: 1.50, description: 'Technical gear demonstration, rugged field filming.', keywords: ['camping', 'hiking', 'national parks', 'outdoors'] },

  // Tech & Gaming (5)
  { id: 501, primaryNicheId: 5, name: 'PC Hardware & Custom Builds', multiplier: 1.40, description: 'In-depth benchmarks, high hardware enthusiast spending.', keywords: ['gpu', 'pc build', 'hardware', 'custom pc'] },
  { id: 502, primaryNicheId: 5, name: 'Consumer Tech, Smartphones & Audio', multiplier: 1.35, description: 'Rapid product cycles, high visual demo requirements.', keywords: ['smartphones', 'headphones', 'gadgets', 'apple', 'android'] },
  { id: 503, primaryNicheId: 5, name: 'SaaS, AI Tools & Web Automations', multiplier: 1.50, description: 'High trial-to-paid conversion intent, B2B software budgets.', keywords: ['ai tools', 'software', 'saas', 'automation', 'productivity'] },
  { id: 504, primaryNicheId: 5, name: 'Esports & Video Game Streaming', multiplier: 1.20, description: 'High livestream engagement, gaming culture.', keywords: ['gaming', 'twitch', 'esports', 'playstation', 'xbox'] },

  // Lifestyle (6)
  { id: 601, primaryNicheId: 6, name: 'Routine, Productivity & Habits', multiplier: 1.20, description: 'Relatable daily storytelling, strong affiliate links.', keywords: ['morning routine', 'day in the life', 'productivity', 'habits'] },
  { id: 602, primaryNicheId: 6, name: 'City Living & Urban Culture', multiplier: 1.15, description: 'Local discovery value, diverse brand placements.', keywords: ['city life', 'apartment', 'nyc', 'london', 'vlog'] },
  { id: 603, primaryNicheId: 6, name: 'Student & Campus Life', multiplier: 1.05, description: 'Gen Z target demographic, high short-form velocity.', keywords: ['college', 'university', 'study', 'dorm'] },

  // Food & Beverage (7)
  { id: 701, primaryNicheId: 7, name: 'Gourmet Recipe Development & Baking', multiplier: 1.15, description: 'Detailed ingredient testing, professional studio lighting.', keywords: ['baking', 'gourmet', 'recipe', 'pastry', 'chef'] },
  { id: 702, primaryNicheId: 7, name: 'Healthy Meal Prep & Special Diets', multiplier: 1.10, description: 'High save rates, strong wellness crossover.', keywords: ['meal prep', 'vegan', 'keto', 'healthy food', 'clean eating'] },
  { id: 703, primaryNicheId: 7, name: 'Restaurant Reviews & Street Food', multiplier: 1.00, description: 'On-site filming, high local discovery reach.', keywords: ['food review', 'street food', 'restaurants', 'cafes'] },

  // Family & Parenting (8)
  { id: 801, primaryNicheId: 8, name: 'Baby & Toddler Care / Nursery', multiplier: 1.15, description: 'High safety sensitivity, essential household spending.', keywords: ['baby gear', 'strollers', 'nursery', 'toddler'] },
  { id: 802, primaryNicheId: 8, name: 'Family Lifestyle & Homeschooling', multiplier: 1.05, description: 'Broad parenting relatability, long-term brand retention.', keywords: ['family vlogs', 'homeschool', 'parenting hacks'] },
  { id: 803, primaryNicheId: 8, name: 'Pregnancy, Maternity & Postpartum', multiplier: 1.15, description: 'High trust community, strong lifecycle purchasing.', keywords: ['pregnancy', 'maternity', 'postpartum', 'new mom'] },

  // Health & Fitness (9)
  { id: 901, primaryNicheId: 9, name: 'Gym Workouts, Lifting & Bodybuilding', multiplier: 1.00, description: 'High visual proof, workout plan downloads.', keywords: ['gym', 'lifting', 'bodybuilding', 'hypertrophy', 'strength'] },
  { id: 902, primaryNicheId: 9, name: 'Yoga, Mobility & Mental Wellness', multiplier: 0.95, description: 'Calmer aesthetic, strong app/subscription integration.', keywords: ['yoga', 'pilates', 'mobility', 'meditation', 'mental health'] },
  { id: 903, primaryNicheId: 9, name: 'Nutrition, Supplements & Biohacking', multiplier: 1.05, description: 'Ingestible product trust requirements, repeat DTC orders.', keywords: ['supplements', 'protein', 'vitamins', 'biohacking', 'creatine'] },

  // Fashion & Apparel (10)
  { id: 1001, primaryNicheId: 10, name: "Women's Ready-to-Wear & Dresses", multiplier: 0.90, description: 'High volume try-on hauls, accessible mass pricing.', keywords: ['dresses', 'womenswear', 'try on haul', 'outfits', 'styling'] },
  { id: 1002, primaryNicheId: 10, name: 'Luxury Couture, Bridal & Evening Gowns', multiplier: 1.25, description: 'Editorial high-fashion aesthetic, luxury styling.', keywords: ['luxury fashion', 'bridal', 'couture', 'designer', 'evening gown'] },
  { id: 1003, primaryNicheId: 10, name: 'Streetwear, Sneakers & Urban Style', multiplier: 1.00, description: 'Hype release culture, strong Gen Z community.', keywords: ['streetwear', 'sneakers', 'kicks', 'hoodies', 'skate'] },
  { id: 1004, primaryNicheId: 10, name: 'Modest & Traditional Apparel', multiplier: 0.95, description: 'Dedicated cultural audience, seasonal festival demand.', keywords: ['modest fashion', 'abayas', 'traditional', 'ethnic wear'] },
  { id: 1005, primaryNicheId: 10, name: 'Sustainable & Vintage / Thrift Fashion', multiplier: 0.90, description: 'High authenticity, community-led values alignment.', keywords: ['thrift', 'vintage', 'sustainable fashion', 'slow fashion'] },

  // Beauty & Cosmetics (11)
  { id: 1101, primaryNicheId: 11, name: 'Skincare Science, Serums & Anti-Aging', multiplier: 0.85, description: 'High ingredient scrutiny, repeat DTC purchases.', keywords: ['skincare', 'serums', 'sunscreen', 'anti aging', 'dermatology'] },
  { id: 1102, primaryNicheId: 11, name: 'Makeup Tutorials, Glam & Swatches', multiplier: 0.75, description: 'Fast content turnover, highly saturated market supply.', keywords: ['makeup', 'cosmetics', 'lipstick', 'glam', 'swatches'] },
  { id: 1103, primaryNicheId: 11, name: 'Haircare, Styling & Texture Treatments', multiplier: 0.80, description: 'High before-and-after demo impact, routine integration.', keywords: ['haircare', 'curly hair', 'shampoo', 'hair styling', 'blowout'] },
  { id: 1104, primaryNicheId: 11, name: 'Fragrance & Luxury Perfumery', multiplier: 0.90, description: 'Sensory storytelling, elevated luxury packaging showcase.', keywords: ['perfume', 'cologne', 'fragrance', 'scents'] },

  // Education (12)
  { id: 1201, primaryNicheId: 12, name: 'Tech, Coding & Software Development', multiplier: 1.50, description: 'Step-by-step screen recordings, high professional utility.', keywords: ['coding', 'programming', 'software engineering', 'web dev'] },
  { id: 1202, primaryNicheId: 12, name: 'Language Learning & Academic Prep', multiplier: 1.35, description: 'High comment and DM engagement for lead magnets.', keywords: ['languages', 'ielts', 'toefl', 'study abroad', 'grammar'] },
  { id: 1203, primaryNicheId: 12, name: 'Executive Leadership & Sales Skills', multiplier: 1.60, description: 'High-ticket course sales, professional coaching packages.', keywords: ['leadership', 'sales', 'executive coach', 'public speaking'] },
];

// 4. Commercial Rights Rates (% Multiplier on discounted deliverable base)
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
    '90_days': 0.45,
    '6_months': 0.60,
    '12_months': 0.80,
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

// 5. Exclusivity Upcharge Rates (% Multiplier on discounted deliverable base)
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
    '14_days': 0.20,
    '30_days': 0.25,
    '60_days': 0.40,
    '90_days': 0.55,
    '6_months': 1.00,
    '12_months': 1.50,
  },
  full_category: {
    '14_days': 0.25,
    '30_days': 0.35,
    '60_days': 0.50,
    '90_days': 0.75,
    '6_months': 1.25,
    '12_months': 2.00,
  },
};

// 6. Regional Purchasing Power Parity (PPP) & FX Calibration
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
  UK: { name: 'United Kingdom', pppIndex: 0.85, currency: 'GBP', fxRateToUSD: 0.79, symbol: '£' },
  CA: { name: 'Canada', pppIndex: 0.90, currency: 'CAD', fxRateToUSD: 1.36, symbol: 'CA$' },
  PK: { name: 'Pakistan', pppIndex: 0.18, currency: 'PKR', fxRateToUSD: 278.50, symbol: 'Rs. ' },
  IN: { name: 'India', pppIndex: 0.24, currency: 'INR', fxRateToUSD: 83.50, symbol: '₹' },
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
