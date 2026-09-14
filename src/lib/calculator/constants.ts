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
  { knotId: 'K09', followers: 100000, benchmarkEr: 0.55, rates: { ig_reel: 2300, ig_carousel: 1500, ig_static: 1250, ig_story: 570 } },
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
  { knotId: 'K01', followers: 1000, benchmarkEr: 4.50, expectedViews: 300, rates: { yt_dedicated: 450, yt_integrated: 225, yt_short: 100 } },
  { knotId: 'K02', followers: 2500, benchmarkEr: 4.00, expectedViews: 750, rates: { yt_dedicated: 700, yt_integrated: 350, yt_short: 200 } },
  { knotId: 'K03', followers: 5000, benchmarkEr: 3.80, expectedViews: 1500, rates: { yt_dedicated: 750, yt_integrated: 375, yt_short: 210 } },
  { knotId: 'K04', followers: 10000, benchmarkEr: 3.50, expectedViews: 2800, rates: { yt_dedicated: 850, yt_integrated: 425, yt_short: 225 } },
  { knotId: 'K05', followers: 15000, benchmarkEr: 3.30, expectedViews: 4000, rates: { yt_dedicated: 1000, yt_integrated: 500, yt_short: 235 } },
  { knotId: 'K06', followers: 25000, benchmarkEr: 3.00, expectedViews: 6500, rates: { yt_dedicated: 1200, yt_integrated: 600, yt_short: 250 } },
  { knotId: 'K07', followers: 40000, benchmarkEr: 2.80, expectedViews: 10000, rates: { yt_dedicated: 1500, yt_integrated: 750, yt_short: 375 } },
  { knotId: 'K08', followers: 60000, benchmarkEr: 2.60, expectedViews: 15000, rates: { yt_dedicated: 2000, yt_integrated: 1000, yt_short: 500 } },
  { knotId: 'K09', followers: 100000, benchmarkEr: 2.40, expectedViews: 22000, rates: { yt_dedicated: 3000, yt_integrated: 1500, yt_short: 720 } },
  { knotId: 'K10', followers: 150000, benchmarkEr: 2.20, expectedViews: 32000, rates: { yt_dedicated: 4200, yt_integrated: 2100, yt_short: 980 } },
  { knotId: 'K11', followers: 250000, benchmarkEr: 2.00, expectedViews: 50000, rates: { yt_dedicated: 6000, yt_integrated: 3000, yt_short: 1500 } },
  { knotId: 'K12', followers: 500000, benchmarkEr: 1.80, expectedViews: 90000, rates: { yt_dedicated: 9500, yt_integrated: 4750, yt_short: 2200 } },
  { knotId: 'K13', followers: 750000, benchmarkEr: 1.60, expectedViews: 130000, rates: { yt_dedicated: 13500, yt_integrated: 6750, yt_short: 2850 } },
  { knotId: 'K14', followers: 1000000, benchmarkEr: 1.50, expectedViews: 175000, rates: { yt_dedicated: 17500, yt_integrated: 8750, yt_short: 3500 } },
  { knotId: 'K15', followers: 2500000, benchmarkEr: 1.20, expectedViews: 350000, rates: { yt_dedicated: 26000, yt_integrated: 13000, yt_short: 6000 } },
  { knotId: 'K16', followers: 5000000, benchmarkEr: 1.00, expectedViews: 600000, rates: { yt_dedicated: 38000, yt_integrated: 19000, yt_short: 10000 } },
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
    multiplier: 1.41,
    description: 'High-ticket renovation budgets, architectural fixtures, and DTC furniture staging.',
    evidenceSource: 'SignCollab / Aspire 2026 Calibrated',
  },
  {
    id: 2,
    name: 'Pets & Animals',
    multiplier: 1.12,
    description: 'Clinical veterinary authority, pet behavior training, and dedicated pet care audiences.',
    evidenceSource: 'SignCollab / Market Rate Analysis',
  },
  {
    id: 3,
    name: 'Business, Finance & SaaS',
    multiplier: 1.58,
    description: 'Highest CPMs across digital media ($40–$80+), FinTech acquisition budgets, and enterprise B2B software.',
    evidenceSource: 'SignCollab / Modash 2026',
  },
  {
    id: 4,
    name: 'Trades, DIY & Craft',
    multiplier: 1.28,
    description: 'Pro-grade tooling sponsorships, automotive restoration, CNC/3D fabrication, and jobsite craftsmanship.',
    evidenceSource: 'Collabstr Verified Deal Data',
  },
  {
    id: 5,
    name: 'Education & Careers',
    multiplier: 1.30,
    description: 'Corporate coaching, executive leadership, tech career transitions, and EdTech subscriptions.',
    evidenceSource: 'SignCollab / Collabstr Verified Deal Data',
  },
  {
    id: 6,
    name: 'Technology & Hardware',
    multiplier: 1.50,
    description: 'Flagship consumer electronics, enthusiast PC builds, developer tooling, and AI SaaS automation.',
    evidenceSource: 'SignCollab / Modash 2026',
  },
  {
    id: 7,
    name: 'Travel & Hospitality',
    multiplier: 1.10,
    description: 'Luxury resorts, rugged overlanding, airline promotions, and regional tourism boards.',
    evidenceSource: 'SignCollab / Aspire 2026 Calibrated',
  },
  {
    id: 8,
    name: 'Lifestyle & Entertainment',
    multiplier: 0.96,
    description: 'Universal general consumer benchmark, daily routines, relatable memes, and cultural commentary.',
    evidenceSource: 'Aspire 2026 Baseline Anchor (p. 14)',
  },
  {
    id: 9,
    name: 'Food & Culinary',
    multiplier: 0.99,
    description: 'Grocery retail partnerships, artisan cooking appliances, specialty coffee, and restaurant hospitality.',
    evidenceSource: 'SignCollab / Aspire 2026',
  },
  {
    id: 10,
    name: 'Family & Parenting',
    multiplier: 1.02,
    description: 'High-trust parental buying cycles, nursery essentials, family travel, and household FMCG brands.',
    evidenceSource: 'SignCollab / Aspire 2026',
  },
  {
    id: 11,
    name: 'Health & Fitness',
    multiplier: 1.19,
    description: 'High-ticket biohacking/longevity, gym hypertrophy apparel, athleisure, and endurance running gear.',
    evidenceSource: 'SignCollab / Market Rate Analysis',
  },
  {
    id: 12,
    name: 'Fashion & Apparel',
    multiplier: 0.94,
    description: 'Prestige luxury tailoring, streetwear drops, everyday outfit lookbooks, and sustainable fashion.',
    evidenceSource: 'SignCollab / Aspire 2026',
  },
  {
    id: 13,
    name: 'Beauty & Cosmetics',
    multiplier: 1.04,
    description: 'Clinical medical dermatology, designer fragrance houses, salon haircare tools, and makeup swatches.',
    evidenceSource: 'SignCollab / Aspire 2026',
  },
  {
    id: 14,
    name: 'Gaming & Esports',
    multiplier: 0.85,
    description: 'Competitive esports gameplay, studio title launch reviews, variety streaming, and mobile gaming.',
    evidenceSource: 'SignCollab / Twitch & YouTube Gaming Rates',
  },
  {
    id: 15,
    name: 'Sports & Athletics',
    multiplier: 1.16,
    description: 'Team franchise leagues, combat sports & F1, affluent country club sports (golf/tennis), and action sports.',
    evidenceSource: 'SignCollab / Athlete Deal Data',
  },
  {
    id: 16,
    name: 'News & Commentary',
    multiplier: 0.95,
    description: 'Geopolitics explainers, media literacy, investigative journalism, and brand-safety adjusted political commentary.',
    evidenceSource: 'SignCollab / Independent Journalism Rates',
  },
  {
    id: 17,
    name: 'Automotive & Mobility',
    multiplier: 1.24,
    description: 'OEM automaker ad budgets, electric vehicle charging, luxury supercars, powersports, and digital buying guides.',
    evidenceSource: 'SignCollab / Automotive Creator Ad Rates',
  },
  {
    id: 18,
    name: 'Creative Arts & Media',
    multiplier: 1.24,
    description: 'Prosumer camera/lens ecosystems, VFX and video editing SaaS, digital illustration, and traditional fine arts.',
    evidenceSource: 'SignCollab / Creative Tech Sponsor Rates',
  },
  {
    id: 19,
    name: 'Music, Audio & Performance',
    multiplier: 1.06,
    description: 'Audio interfaces, virtual instrument plugins (VSTs), instrument tutorials, DJ hardware, and viral choreography.',
    evidenceSource: 'SignCollab / Music Industry Creator Deals',
  },
  {
    id: 20,
    name: 'Literature, Books & Writing',
    multiplier: 1.04,
    description: 'BookTok fiction community, business book summaries, creative self-publishing software, and comics/manga.',
    evidenceSource: 'SignCollab / Publishing & EdTech Ad Rates',
  },
  {
    id: 21,
    name: 'Pop Culture, Fandom & Anime',
    multiplier: 0.99,
    description: 'Anime lore recaps, high-craft cosplay fabrication, film/TV breakdown integrations, and live TCG card breaks.',
    evidenceSource: 'SignCollab / Entertainment Media Rates',
  },
  {
    id: 22,
    name: 'Spirituality & Mindfulness',
    multiplier: 1.11,
    description: 'High-converting DM funnels for mindset coaching, corporate wellness apps, sound healing, and everyday stoicism.',
    evidenceSource: 'SignCollab / Digital Coaching & Wellness Rates',
  },
];

// 88 Sub-Niches mapped to 22 Primary Niches (4 per Primary)
export const SUB_NICHES: SubNicheDefinition[] = [
  // 1. Home Design & Decor (1)
  { id: 101, primaryNicheId: 1, name: 'Interior Architecture & Renovations', multiplier: 1.65, description: 'High-ticket renovation budgets and premium architectural fixtures; calibrated to isolate media value.', keywords: ['interior architecture', 'renovation', 'remodel', 'architectural lighting', 'luxury interior', 'home restoration'] },
  { id: 102, primaryNicheId: 1, name: 'Furniture Styling & Room Makeovers', multiplier: 1.45, description: 'High average order value (AOV) direct-to-consumer furniture, rug, and lighting partnerships.', keywords: ['furniture', 'room makeover', 'room transformation', 'living room styling', 'rugs', 'home styling'] },
  { id: 103, primaryNicheId: 1, name: 'Smart Home & Ambient Lighting', multiplier: 1.35, description: 'Consumer IoT hardware spend paired with affluent homeowner demographics.', keywords: ['smart home', 'ambient lighting', 'home automation', 'iot', 'philips hue', 'home tech'] },
  { id: 104, primaryNicheId: 1, name: 'Small Space Living & Organization', multiplier: 1.20, description: 'High retail affiliate velocity (Amazon, Target) and practical home storage conversion.', keywords: ['small space', 'home organization', 'declutter', 'storage', 'restock', 'aesthetic pantry'] },

  // 2. Pets & Animals (2)
  { id: 201, primaryNicheId: 2, name: 'Dog & Cat Training / Behavior', multiplier: 1.10, description: 'High-trust instructional advice driving digital courses, gear, and behavioral service conversions.', keywords: ['dog training', 'cat training', 'pet behavior', 'puppy training', 'obedience', 'leash reactivity'] },
  { id: 202, primaryNicheId: 2, name: 'Veterinary Medicine & Clinical Pet Nutrition', multiplier: 1.40, description: 'Regulated medical authority commanding top rates for clinical diets, prescription medications, and pet insurance.', keywords: ['veterinary', 'vet', 'pet nutrition', 'clinical diet', 'pet health', 'animal medicine', 'pet insurance'] },
  { id: 203, primaryNicheId: 2, name: 'Pet Comedy / Viral / Lifestyle', multiplier: 0.90, description: 'Massive organic reach, but passive viewing intent and lower direct conversion to high-ticket sales.', keywords: ['pet comedy', 'viral pets', 'funny animals', 'dog lifestyle', 'cat reels', 'cute pets'] },
  { id: 204, primaryNicheId: 2, name: 'Exotic Pets / Aquariums / Herpetology', multiplier: 1.10, description: 'High-barrier hobbyists spending heavily on specialized climate control, filtration, and terrarium gear.', keywords: ['exotic pets', 'aquarium', 'herpetology', 'reptiles', 'terrarium', 'fishkeeping', 'snakes'] },

  // 3. Business, Finance & SaaS (3)
  { id: 301, primaryNicheId: 3, name: 'Budgeting / Savings / Credit Cards', multiplier: 1.45, description: 'FinTech customer acquisition cost (CAC) budgets with high-payout credit card sign-up and banking affiliate commissions.', keywords: ['budgeting', 'saving', 'credit cards', 'frugal', 'banking', 'personal finance'] },
  { id: 302, primaryNicheId: 3, name: 'Stock / Real Estate / Crypto Investing', multiplier: 1.70, description: 'High-net-worth investor audience; brokerages and prop firms tolerate CACs exceeding $200–$400.', keywords: ['stocks', 'crypto', 'investing', 'real estate', 'trading', 'wealth', 'portfolio'] },
  { id: 303, primaryNicheId: 3, name: 'B2B SaaS / Startups / VC', multiplier: 1.75, description: 'High customer lifetime value (LTV); enterprise software brands fund premium flat fees.', keywords: ['b2b', 'saas', 'startup', 'venture capital', 'founder', 'enterprise software', 'tech sales'] },
  { id: 304, primaryNicheId: 3, name: 'Freelancing / Solopreneurship / Agency', multiplier: 1.40, description: 'High comment-to-DM conversion for project management, invoice tools, and workflow subscriptions.', keywords: ['freelancing', 'solopreneur', 'agency', 'client acquisition', 'remote work', 'consulting'] },

  // 4. Trades, DIY & Craft (4)
  { id: 401, primaryNicheId: 4, name: 'Custom Woodworking / Furniture Craft', multiplier: 1.20, description: 'Dedicated toolmaker sponsorships (DeWalt, Festool) and loyal artisan maker audiences.', keywords: ['woodworking', 'carpentry', 'epoxy', 'custom furniture', 'joinery', 'timber'] },
  { id: 402, primaryNicheId: 4, name: 'Automotive Repair / Tuning / Restoration', multiplier: 1.30, description: 'High aftermarket parts spend, durable mechanical hand tools, and specialized chemical sponsors.', keywords: ['auto repair', 'car tuning', 'mechanic', 'restoration', 'engine rebuild', 'wrenching'] },
  { id: 403, primaryNicheId: 4, name: 'Home Improvement / Construction', multiplier: 1.25, description: 'Pro-grade building materials, contractor tool deals, and hardware retail chain integrations.', keywords: ['home improvement', 'construction', 'drywall', 'plumbing', 'electrical', 'masonry', 'contractor'] },
  { id: 404, primaryNicheId: 4, name: '3D Printing / CNC / Metal Fabrication', multiplier: 1.35, description: 'Prosumer desktop manufacturing equipment, high raw-material reorders, and CAD/CAM software.', keywords: ['3d printing', 'cnc', 'metal fabrication', 'machining', 'cad', 'welding', 'additive manufacturing'] },

  // 5. Education & Careers (5)
  { id: 501, primaryNicheId: 5, name: 'Tech Careers / Coding / Data Science', multiplier: 1.45, description: 'High-intent adult learners targeting high-paying career transitions and accredited online degrees.', keywords: ['coding', 'tech careers', 'data science', 'software engineering', 'bootcamp', 'python', 'learn to code'] },
  { id: 502, primaryNicheId: 5, name: 'Executive Leadership / Corporate Coaching', multiplier: 1.55, description: 'Corporate B2B professional development budgets and high-ticket mastermind offerings.', keywords: ['leadership', 'executive coaching', 'management', 'corporate career', 'career advancement', 'interview prep'] },
  { id: 503, primaryNicheId: 5, name: 'Language Learning / Global Education', multiplier: 1.20, description: 'High-LTV recurring subscription apps (Duolingo, Babbel) and foreign exchange study programs.', keywords: ['language learning', 'study abroad', 'polyglot', 'english learning', 'spanish', 'babbel', 'duolingo'] },
  { id: 504, primaryNicheId: 5, name: 'Student Productivity / Study', multiplier: 1.00, description: 'High app-install volume for digital note-taking, offset by the lower spending power of students.', keywords: ['study with me', 'student productivity', 'notion', 'med student', 'exam prep', 'study tips'] },

  // 6. Technology & Hardware (6)
  { id: 601, primaryNicheId: 6, name: 'Consumer Mobile Tech / Audio', multiplier: 1.35, description: 'High consumer electronics marketing budgets; strong conversion on smartphones, earbuds, and accessories.', keywords: ['smartphones', 'headphones', 'earbuds', 'apple', 'android', 'gadgets', 'unboxing'] },
  { id: 602, primaryNicheId: 6, name: 'PC Hardware / Custom Builds / GPUs', multiplier: 1.40, description: 'High-discretionary-income PC enthusiasts buying motherboards, GPUs, displays, and custom cooling.', keywords: ['pc hardware', 'custom pc', 'gpu', 'graphics card', 'motherboard', 'intel', 'nvidia', 'amd'] },
  { id: 603, primaryNicheId: 6, name: 'AI Productivity / SaaS Automation', multiplier: 1.60, description: 'Exceptional comment-to-DM conversion for software tools, free prompts, and affiliate SaaS funnels.', keywords: ['ai tools', 'chatgpt', 'automation', 'productivity software', 'workflow', 'prompt engineering'] },
  { id: 604, primaryNicheId: 6, name: 'Developer Software / Cloud / Cybersecurity', multiplier: 1.65, description: 'High enterprise CACs; cloud platforms and developer tooling brands compete for scarce technical talent.', keywords: ['developer tools', 'cloud', 'cybersecurity', 'devops', 'linux', 'api', 'docker'] },

  // 7. Travel & Hospitality (7)
  { id: 701, primaryNicheId: 7, name: 'Luxury Resorts / 5-Star / First Class', multiplier: 1.30, description: 'Affluent traveler demographics; calibrated down to account for heavy barter and complimentary stay norms.', keywords: ['luxury hotel', 'resort', 'first class', 'honeymoon', '5 star', 'luxury travel'] },
  { id: 702, primaryNicheId: 7, name: 'Overlanding / Camping / Wilderness', multiplier: 1.15, description: 'High-cost outdoor gear, vehicle outfitting, satellite communicators, and technical outerwear.', keywords: ['overlanding', 'camping', 'wilderness', 'hiking', 'national parks', 'off road camping'] },
  { id: 703, primaryNicheId: 7, name: 'Budget Backpacking / Hostel Travel', multiplier: 0.90, description: 'Price-conscious audience; heavily monetized through budget booking affiliate links and e-SIMs.', keywords: ['backpacking', 'hostels', 'budget travel', 'solo travel', 'cheap travel', 'esim'] },
  { id: 704, primaryNicheId: 7, name: 'City Guides / Food Crawls / Expat', multiplier: 1.05, description: 'Regional tourism boards, domestic airline promotions, and localized leisure hospitality.', keywords: ['city guide', 'expat', 'food crawl', 'walking tour', 'neighborhood guide', 'relocation'] },

  // 8. Lifestyle & Entertainment (8 - Engine Baseline Anchor)
  { id: 801, primaryNicheId: 8, name: 'Daily Routine / Day-in-Life', multiplier: 1.00, description: 'Engine Baseline (1.00x): Standard general consumer benchmark across all formats and platforms.', keywords: ['day in the life', 'daily vlog', 'routine', 'lifestyle vlog', 'weekly vlog', 'realistic day'] },
  { id: 802, primaryNicheId: 8, name: 'Comedy / Parody / Relatable Memes', multiplier: 0.85, description: 'Viral view counts with low purchase intent; broad consumer brands buy awareness at lower CPMs.', keywords: ['comedy', 'skits', 'funny', 'parody', 'memes', 'relatable', 'humor'] },
  { id: 803, primaryNicheId: 8, name: 'Cultural Commentary / Video Essays', multiplier: 1.10, description: 'High YouTube watch time, strong community retention, and dedicated long-form sponsor integrations.', keywords: ['video essay', 'commentary', 'pop culture analysis', 'critique', 'cultural deep dive'] },
  { id: 804, primaryNicheId: 8, name: 'University / Young Adult Lifestyle', multiplier: 0.90, description: 'Younger demographic with limited personal disposable income; reliant on low-AOV lifestyle gifting.', keywords: ['college life', 'university', 'dorm', 'young adult', 'apartment tour', 'college routine'] },

  // 9. Food & Culinary (9)
  { id: 901, primaryNicheId: 9, name: 'Weeknight Meals / Meal Prep', multiplier: 0.90, description: 'High creator competition; heavy grocery retail partnerships, kitchen staples, and meal kits.', keywords: ['meal prep', 'weeknight meals', 'easy dinner', 'budget meals', 'air fryer recipes', 'quick recipes'] },
  { id: 902, primaryNicheId: 9, name: 'Gourmet / Culinary / Artisan Baking', multiplier: 1.05, description: 'Premium kitchen appliances, specialty pantry ingredients, cookware sets, and cutlery deals.', keywords: ['gourmet', 'culinary technique', 'artisan baking', 'sourdough', 'pastry', 'chef'] },
  { id: 903, primaryNicheId: 9, name: 'Specialty Coffee / Wine / Mixology', multiplier: 1.10, description: 'Discretionary luxury consumption, boutique roasters, wine clubs, and premium barware subscriptions.', keywords: ['specialty coffee', 'espresso', 'wine', 'cocktails', 'mixology', 'barista', 'spirits'] },
  { id: 904, primaryNicheId: 9, name: 'Restaurant Reviews / Street Food', multiplier: 0.90, description: 'Localized geographic appeal with limited access to national brand ad budgets.', keywords: ['restaurant review', 'street food', 'food tour', 'food critique', 'hidden gems'] },

  // 10. Family & Parenting (10)
  { id: 1001, primaryNicheId: 10, name: 'Newborn / Infant / Pregnancy', multiplier: 1.15, description: 'Urgent parental buying cycles, non-discretionary needs, and high-ticket nursery/stroller gear.', keywords: ['newborn', 'infant', 'pregnancy', 'maternity', 'postpartum', 'baby essentials', 'nursery'] },
  { id: 1002, primaryNicheId: 10, name: 'Toddler / Toys / Learning', multiplier: 0.95, description: 'High toy brand ad budgets, but heavily offset by aggressive free product gifting practices.', keywords: ['toddler', 'toys', 'kids activities', 'sensory play', 'montessori', 'learning toys'] },
  { id: 1003, primaryNicheId: 10, name: 'Family Travel / Large Household', multiplier: 1.00, description: 'Multi-passenger travel, minivans, household appliances, and bulk FMCG consumer goods.', keywords: ['family travel', 'large household', 'family vlog', 'mom life', 'household routines'] },
  { id: 1004, primaryNicheId: 10, name: 'Parenting / Co-Parenting Advice', multiplier: 1.00, description: 'High community trust; balanced between digital services, counseling apps, and family software.', keywords: ['parenting advice', 'co parenting', 'gentle parenting', 'child development', 'family counseling'] },

  // 11. Health & Fitness (11)
  { id: 1101, primaryNicheId: 11, name: 'Bodybuilding / Hypertrophy / Gym', multiplier: 1.10, description: 'Consistent fitness apparel ambassadorships, creatine/protein supplements, and lifting gear.', keywords: ['bodybuilding', 'hypertrophy', 'gym workout', 'lifting', 'muscle growth', 'protein'] },
  { id: 1102, primaryNicheId: 11, name: 'Yoga / Pilates / Mindful Mobility', multiplier: 1.05, description: 'Boutique athleisure apparel, wellness retreat packages, and subscription mobility apps.', keywords: ['yoga', 'pilates', 'mobility', 'stretching', 'mindful movement', 'somatic'] },
  { id: 1103, primaryNicheId: 11, name: 'Biohacking / Longevity / Nutrition', multiplier: 1.45, description: 'High-growth medical education space; high-ticket diagnostic tests, nootropics, and longevity supplements.', keywords: ['biohacking', 'longevity', 'nutrition', 'supplements', 'fasting', 'cgm', 'blood work'] },
  { id: 1104, primaryNicheId: 11, name: 'Running / Marathon / Endurance', multiplier: 1.15, description: 'High gear turnover (shoes, GPS smartwatches, hydration packs) and affluent amateur athlete demographics.', keywords: ['running', 'marathon', 'triathlon', 'running shoes', 'endurance', 'half marathon'] },

  // 12. Fashion & Apparel (12)
  { id: 1201, primaryNicheId: 12, name: 'Luxury Fashion / Tailoring / Editorial', multiplier: 1.15, description: 'Prestige brand equity, high retail AOVs, and strict category exclusivity riders.', keywords: ['luxury fashion', 'tailoring', 'editorial', 'designer', 'haute couture', 'menswear'] },
  { id: 1202, primaryNicheId: 12, name: 'Streetwear / Sneakers / Vintage', multiplier: 0.90, description: 'Highly influential, but heavily impacted by product seeding and sneaker gifting norms.', keywords: ['streetwear', 'sneakers', 'vintage', 'thrift', 'hypebeast', 'drop culture'] },
  { id: 1203, primaryNicheId: 12, name: 'Fast Fashion / Everyday Outfits', multiplier: 0.75, description: 'Extreme creator saturation and heavy reliance on affiliate discount codes and unpaid PR gifting.', keywords: ['fast fashion', 'outfit ideas', 'lookbook', 'try on haul', 'zara haul', 'shein haul'] },
  { id: 1204, primaryNicheId: 12, name: 'Sustainable Fashion / Capsule Wardrobe', multiplier: 0.95, description: 'High audience trust and ethical alignment, but bounded by smaller independent brand ad budgets.', keywords: ['sustainable fashion', 'capsule wardrobe', 'slow fashion', 'ethical fashion', 'minimalist style'] },

  // 13. Beauty & Cosmetics (13)
  { id: 1301, primaryNicheId: 13, name: 'Dermatology / Medical Skincare', multiplier: 1.35, description: 'Clinical board certifications command top pharma and dermo-cosmetic cash budgets.', keywords: ['dermatology', 'medical skincare', 'sunscreen', 'retinol', 'acne', 'clinical skincare'] },
  { id: 1302, primaryNicheId: 13, name: 'High Perfumery / Luxury Fragrance', multiplier: 1.10, description: 'High-margin luxury gift market; designer houses pay cash retainers to preserve brand prestige.', keywords: ['perfume', 'luxury fragrance', 'cologne', 'scent review', 'niche perfumery'] },
  { id: 1303, primaryNicheId: 13, name: 'Drugstore Makeup / Cosmetic Swatches', multiplier: 0.75, description: 'High creator supply and heavy PR box gifting; lowest flat-fee median in creator surveys ($250).', keywords: ['drugstore makeup', 'cosmetic swatches', 'makeup tutorial', 'lip swatch', 'affordable beauty'] },
  { id: 1304, primaryNicheId: 13, name: 'Haircare / Salon Color / Styling Tools', multiplier: 0.95, description: 'Blends everyday PR product gifting with high-ticket electrical styling appliance campaigns.', keywords: ['haircare', 'salon color', 'styling tools', 'curly hair', 'hair blowout', 'dyson airwrap'] },

  // 14. Gaming & Esports (14)
  { id: 1401, primaryNicheId: 14, name: 'Competitive Esports / Ranked Gameplay', multiplier: 0.85, description: 'High streaming hours, but lower viewer intent to purchase non-endemic commercial products.', keywords: ['esports', 'ranked gameplay', 'valorant', 'cs2', 'apex legends', 'league of legends'] },
  { id: 1402, primaryNicheId: 14, name: 'Game Reviews / Lore / Guides', multiplier: 1.00, description: 'Highest commercial intent in gaming; primary vehicle for paid studio title launch integrations.', keywords: ['game reviews', 'game lore', 'gaming guides', 'walkthrough', 'deep dive', 'game analysis'] },
  { id: 1403, primaryNicheId: 14, name: 'Live Variety Gaming', multiplier: 0.80, description: 'Massive watch-time, but dominated by energy drinks, snacks, and low-CPM digital inventory.', keywords: ['variety gaming', 'twitch streamer', 'live stream', 'kick', 'gaming highlights', 'funny gaming'] },
  { id: 1404, primaryNicheId: 14, name: 'Casual / Sandbox / Mobile Gaming', multiplier: 0.75, description: 'Younger demographic, high ad-blocker usage, and lowest baseline media CPMs ($2–$5).', keywords: ['mobile gaming', 'minecraft', 'roblox', 'sandbox', 'casual gaming', 'cozy gaming'] },

  // 15. Sports & Athletics (15)
  { id: 1501, primaryNicheId: 15, name: 'Team Sports / League Analysis', multiplier: 1.05, description: 'High audience passion, supported by sports betting apps, fan merchandise, and broadcast partners.', keywords: ['team sports', 'football', 'soccer', 'nba', 'nfl', 'cricket', 'league analysis', 'premier league'] },
  { id: 1502, primaryNicheId: 15, name: 'Combat Sports / Motorsports / F1', multiplier: 1.20, description: 'High-investment lifestyle brands, energy drinks, luxury watches, and automotive sponsorships.', keywords: ['combat sports', 'ufc', 'boxing', 'mma', 'motorsports', 'f1', 'formula 1', 'racing'] },
  { id: 1503, primaryNicheId: 15, name: 'Golf / Tennis / Racket Sports', multiplier: 1.30, description: 'Affluent participation demographic; high equipment costs, club memberships, and luxury apparel.', keywords: ['golf', 'tennis', 'pickleball', 'racket sports', 'golf swing', 'country club', 'padel'] },
  { id: 1504, primaryNicheId: 15, name: 'Action Sports / Athlete Entertainment', multiplier: 1.10, description: 'Top organic Instagram engagement rates (3.9%–4.2%) with strong athletic shoe and camera deals.', keywords: ['action sports', 'skateboarding', 'surfing', 'snowboarding', 'trick shots', 'extreme sports'] },

  // 16. News & Commentary (16)
  { id: 1601, primaryNicheId: 16, name: 'Geopolitics / History / Documentaries', multiplier: 1.10, description: 'High YouTube retention and watch-time; strong fit for VPNs, audiobooks, and meal services.', keywords: ['geopolitics', 'history', 'documentaries', 'global affairs', 'international relations'] },
  { id: 1602, primaryNicheId: 16, name: 'Independent News / Media Literacy', multiplier: 0.95, description: 'Highly educated audience, but limited by moderate corporate brand-safety restrictions.', keywords: ['independent news', 'media literacy', 'daily news', 'current affairs', 'fact checking'] },
  { id: 1603, primaryNicheId: 16, name: 'Investigative Journalism / Social Issues', multiplier: 1.00, description: 'High journalistic credibility; selective brand alignment with mission-driven corporate sponsors.', keywords: ['investigative journalism', 'social issues', 'in depth reporting', 'social impact'] },
  { id: 1604, primaryNicheId: 16, name: 'Political Commentary / Elections / Policy', multiplier: 0.75, description: 'Severe corporate brand-safety blacklists limit monetization to political PACs and niche direct-response ads.', keywords: ['political commentary', 'elections', 'policy', 'politics', 'government', 'debates'] },

  // 17. Automotive & Mobility (17)
  { id: 1701, primaryNicheId: 17, name: 'New Car Reviews & EV Technology', multiplier: 1.40, description: 'Large OEM automaker ad budgets, electric vehicle charging networks, auto insurance apps, and dashcam deals.', keywords: ['new car reviews', 'ev technology', 'electric vehicles', 'tesla', 'car review', 'oem automotive'] },
  { id: 1702, primaryNicheId: 17, name: 'Supercars, Exotics & Luxury Auto', multiplier: 1.30, description: 'Affluent viewership overlapping with luxury watches and financial services; slightly reduced as vehicle sales are aspirational.', keywords: ['supercars', 'exotic cars', 'luxury auto', 'ferrari', 'porsche', 'lamborghini', 'hypercars'] },
  { id: 1703, primaryNicheId: 17, name: 'Motorcycles, Powersports & Off-Road', multiplier: 1.15, description: 'High-ticket enthusiast protection gear (helmets, leathers, comms headsets) and high brand loyalty.', keywords: ['motorcycles', 'powersports', 'off-road', 'atv', 'dirt bike', 'harley', 'helmets'] },
  { id: 1704, primaryNicheId: 17, name: 'Car Buying Guides & Commuter Advice', multiplier: 1.10, description: 'High conversion for digital used-car marketplaces, auto-refinance platforms, and aftermarket warranties.', keywords: ['car buying guide', 'used cars', 'commuter advice', 'car financing', 'auto insurance'] },

  // 18. Creative Arts & Media (18)
  { id: 1801, primaryNicheId: 18, name: 'Photography & Filmmaking Gear', multiplier: 1.35, description: 'Prosumer hardware ecosystems (Sony, Canon, DJI, Aputure); high-AOV cinema lenses and studio lights.', keywords: ['photography gear', 'filmmaking', 'cameras', 'lenses', 'cinematography', 'sony alpha', 'lighting'] },
  { id: 1802, primaryNicheId: 18, name: 'Video Editing, VFX & Motion Design', multiplier: 1.45, description: 'B2B/Prosumer recurring SaaS models (Adobe, DaVinci Resolve, Epidemic Sound, stock footage platforms).', keywords: ['video editing', 'vfx', 'motion design', 'premiere pro', 'davinci resolve', 'after effects', 'plugins'] },
  { id: 1803, primaryNicheId: 18, name: 'Digital Illustration & Graphic Design', multiplier: 1.15, description: 'Graphics tablets, stylus accessories, design marketplaces, and portfolio site builder sponsorships.', keywords: ['digital illustration', 'graphic design', 'procreate', 'photoshop', 'drawing tablet', 'typography'] },
  { id: 1804, primaryNicheId: 18, name: 'Traditional Fine Arts, Pottery & Crafts', multiplier: 1.00, description: 'Fast-growing organic trends on social (+16% yearly growth); monetized via branded art supplies and direct sales.', keywords: ['fine arts', 'pottery', 'ceramics', 'oil painting', 'watercolor', 'crafts', 'sketching'] },

  // 19. Music, Audio & Performance (19)
  { id: 1901, primaryNicheId: 19, name: 'Music Production & Audio Engineering', multiplier: 1.30, description: 'Audio interfaces, studio monitors, high-margin virtual instrument plugins (VSTs), and DAW licenses.', keywords: ['music production', 'audio engineering', 'beatmaking', 'daw', 'vst', 'studio monitors', 'mixing'] },
  { id: 1902, primaryNicheId: 19, name: 'Instrument Instruction & Covers', multiplier: 1.05, description: 'Musical instrument manufacturers (Fender, Yamaha), interactive lesson apps, and sheet music libraries.', keywords: ['instrument instruction', 'guitar tutorial', 'piano covers', 'violin', 'music lessons'] },
  { id: 1903, primaryNicheId: 19, name: 'Dance, Choreography & Viral Performance', multiplier: 0.85, description: 'High organic reach, but heavily dominated by low fixed-fee label sound campaigns rather than high-ticket brands.', keywords: ['dance', 'choreography', 'viral dance', 'hip hop dance', 'ballet', 'dance challenge'] },
  { id: 1904, primaryNicheId: 19, name: 'DJing & Electronic Audio Equipment', multiplier: 1.05, description: 'Standalone DJ controllers, live sound equipment, festival lifestyle sponsors, and track distribution tools.', keywords: ['djing', 'dj controller', 'pioneer dj', 'electronic music', 'edm', 'club audio'] },

  // 20. Literature, Books & Writing (20)
  { id: 2001, primaryNicheId: 20, name: 'Fiction, Fantasy & "BookTok"', multiplier: 0.90, description: 'High organic community passion, but major publishers rely heavily on free advance reader copy (ARC) gifting.', keywords: ['booktok', 'fiction', 'fantasy books', 'romance novels', 'book review', 'reading vlog'] },
  { id: 2002, primaryNicheId: 20, name: 'Non-Fiction & Business Summaries', multiplier: 1.25, description: 'Career-focused readers; high commercial conversion for audiobooks, summaries (Blinkist), and newsletters.', keywords: ['non fiction', 'business book', 'book summary', 'reading notes', 'self development books'] },
  { id: 2003, primaryNicheId: 20, name: 'Creative Writing & Self-Publishing', multiplier: 1.15, description: 'Manuscript software, author distribution tools, online writing cohorts, and editorial services.', keywords: ['creative writing', 'self publishing', 'author', 'novel writing', 'indie author', 'manuscript'] },
  { id: 2004, primaryNicheId: 20, name: 'Manga, Comics & Graphic Novels', multiplier: 0.85, description: 'Younger demographic with limited personal spending power; monetized via reader apps and convention events.', keywords: ['manga', 'comics', 'graphic novels', 'manhwa', 'comic haul', 'webtoon'] },

  // 21. Pop Culture, Fandom & Anime (21)
  { id: 2101, primaryNicheId: 21, name: 'Anime Reviews, Lore & Recaps', multiplier: 0.85, description: 'Engaged fan communities, but non-endemic brand adoption is low; relies on streaming platforms and mobile games.', keywords: ['anime review', 'anime lore', 'anime recaps', 'manga discussion', 'shonen', 'anime breakdown'] },
  { id: 2102, primaryNicheId: 21, name: 'Cosplay & Prop Fabrication', multiplier: 1.00, description: 'High craftsmanship requiring thermal plastics, 3D printing filaments, contact lenses, and wig-styling tools.', keywords: ['cosplay', 'prop fabrication', 'costume design', 'worbla', 'wigs', 'conventions'] },
  { id: 2103, primaryNicheId: 21, name: 'Film & TV Breakdown / Pop Culture', multiplier: 1.00, description: 'Streaming platform integrations (Netflix, Disney+), studio junkets, home theater projectors, and VPN deals.', keywords: ['film breakdown', 'movie review', 'tv show recap', 'easter eggs', 'pop culture', 'cinema analysis'] },
  { id: 2104, primaryNicheId: 21, name: 'Trading Cards & Collectibles (TCG)', multiplier: 1.10, description: 'Active collector capital; high transaction volume on live auction apps (Whatnot), card grading, and protective cases.', keywords: ['trading cards', 'tcg', 'pokemon cards', 'magic the gathering', 'card grading', 'whatnot', 'box break'] },

  // 22. Spirituality & Mindfulness (22)
  { id: 2201, primaryNicheId: 22, name: 'Manifestation & Mindset Coaching', multiplier: 1.30, description: 'Dominant niche for automated DM funnels converting comment volume into high-ticket course leads.', keywords: ['manifestation', 'mindset coaching', 'law of attraction', 'abundance mindset', 'subconscious mind'] },
  { id: 2202, primaryNicheId: 22, name: 'Astrology, Crystals & Tarot', multiplier: 0.90, description: 'Active lifestyle following, but bounded corporate brand adoption; monetizes primarily through private client readings.', keywords: ['astrology', 'tarot reading', 'crystals', 'horoscope', 'zodiac', 'birth chart'] },
  { id: 2203, primaryNicheId: 22, name: 'Meditation, Breathwork & Sound Healing', multiplier: 1.10, description: 'Corporate wellness partnerships, mindfulness apps (Calm, Headspace), and ergonomic lifestyle products.', keywords: ['meditation', 'breathwork', 'sound healing', 'sound bath', 'mindfulness practice', 'pranayama'] },
  { id: 2204, primaryNicheId: 22, name: 'Philosophy & Everyday Stoicism', multiplier: 1.15, description: 'High watch-time retention on YouTube, strong direct-response sales for journals, and high productivity sponsor fit.', keywords: ['stoicism', 'philosophy', 'marcus aurelius', 'everyday stoic', 'wisdom', 'mindset journal'] },
];

/**
 * Returns all sub-niches associated with a specific primary niche ID.
 */
export function getSubNichesByPrimaryId(primaryId: number): SubNicheDefinition[] {
  return SUB_NICHES.filter((s) => s.primaryNicheId === primaryId);
}

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
