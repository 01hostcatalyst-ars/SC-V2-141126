import { withCalculatorWork } from '@/lib/calculator/request-guard';
import { PRIMARY_NICHES, SUB_NICHES, REGIONAL_CONFIG } from '../calculator/constants';
import { RegionCode } from '../calculator/types';
import { JWT } from 'google-auth-library';
import {
  CompleteCreatorIntelligence,
  OmnichannelStrategySuite,
  CreatorExecutiveBrief,
  BespokeStrategyPackage,
  BespokeDeliverableItem,
  StrategicCommercialEntitlement,
  BespokeAdConcept,
  ConcreteAssetDeliverable,
  CriticalCollaborationGuideline,
} from './types';
import { getRecentCreatorIntelligence, saveCreatorIntelligence } from './storage';

export * from './types';

export interface CreatorAIClassification {
  primaryNiche: {
    id: number;
    name: string;
    multiplier: number;
    confidence: number;
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
  detectedCountry: string;
  creatorSummary: string;
}

export interface MultiPlatformCreatorInput {
  creatorName?: string;
  primaryPlatform?: 'youtube' | 'instagram' | 'tiktok';
  reportedCountry?: string;
  youtubeScrapeId?: string;
  instagramScrapeId?: string;
  tiktokScrapeId?: string;
  youtube?: {
    handle?: string;
    title?: string;
    description?: string;
    country?: string;
    topicCategories?: string[];
    keywords?: string[];
    recentTitles?: string[];
    topComments?: string[];
    subscriberCount?: number;
    avgViews?: number;
    avgLikes?: number;
    avgComments?: number;
    observedEr?: number;
  };
  instagram?: {
    username: string;
    fullName?: string;
    biography?: string;
    categoryName?: string;
    city?: string;
    businessAddress?: string;
    recentCaptions?: string[];
    hashtags?: string[];
    topComments?: string[];
    followerCount?: number;
    avgLikes?: number;
    avgComments?: number;
    observedEr?: number;
    taggedBrands?: string[];
  };
  tiktok?: {
    username: string;
    nickname?: string;
    biography?: string;
    isCommerceUser?: boolean;
    recentDescriptions?: string[];
    topComments?: string[];
    followerCount?: number;
    avgViews?: number;
    avgLikes?: number;
    avgComments?: number;
    avgShares?: number;
    observedEr?: number;
  };
}

export interface CreatorContextInput {
  platform: 'youtube' | 'instagram' | 'tiktok';
  username: string;
  name?: string;
  biography?: string;
  recentVideoTitles?: string[];
  recentCaptions?: string[];
  hashtags?: string[];
  bioLink?: string;
  detectedLanguage?: string;
  reportedCountry?: string;
}

const PRIMARY_MODELS = [
  'gemini-3.7-flash', // Tier 1: Primary Model
  'gemini-3.6-flash', // Tier 2: Secondary Model
];

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Generates and caches an OAuth2 Bearer token using Google Cloud Service Account credentials
 */
async function getGoogleCloudAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL?.trim();
  const privateKeyRaw = process.env.GOOGLE_CLOUD_PRIVATE_KEY?.trim();

  if (!clientEmail || !privateKeyRaw) {
    throw new Error('[Gemini Vertex AI] Google Cloud credentials missing in environment variables.');
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

  const jwtClient = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const tokenRes = await jwtClient.getAccessToken();
  if (!tokenRes.token) {
    throw new Error('[Gemini Vertex AI] Failed to obtain OAuth2 token from Google Cloud.');
  }

  cachedToken = {
    token: tokenRes.token,
    expiresAt: Date.now() + 55 * 60 * 1000,
  };

  return tokenRes.token;
}

/**
 * Builds the curated prompt context from available multi-platform signals
 */
function buildCuratedPromptContext(input: MultiPlatformCreatorInput): string {
  const platformDossiers: string[] = [];

  const activePlatforms: string[] = [];
  const inactivePlatforms: string[] = [];

  if (input.youtube && ((input.youtube.subscriberCount || 0) > 0 || input.youtube.handle)) {
    activePlatforms.push('YouTube');
  } else {
    inactivePlatforms.push('YouTube');
  }

  if (input.instagram && ((input.instagram.followerCount || 0) > 0 || input.instagram.username)) {
    activePlatforms.push('Instagram');
  } else {
    inactivePlatforms.push('Instagram');
  }

  if (input.tiktok && ((input.tiktok.followerCount || 0) > 0 || input.tiktok.username)) {
    activePlatforms.push('TikTok');
  } else {
    inactivePlatforms.push('TikTok');
  }

  platformDossiers.push(`  [PLATFORM AVAILABILITY & APPROVED CATALOG CONSTRAINTS]
  - ACTIVE VERIFIED PLATFORMS FOR THIS CREATOR: ${activePlatforms.length > 0 ? activePlatforms.join(', ') : 'Cross-Platform'}
  - INACTIVE / UNVERIFIED PLATFORMS: ${inactivePlatforms.length > 0 ? inactivePlatforms.join(', ') : 'None'}
  * STRICT RULE: You MUST ONLY propose deliverables for ACTIVE platforms (${activePlatforms.join(', ')}). Proposing deliverables for inactive platforms (${inactivePlatforms.join(', ')}) is STRICTLY FORBIDDEN.
  * MULTI-PLATFORM SYNERGY MANDATE: When multiple platforms are ACTIVE (${activePlatforms.join(', ')}), EVERY single active platform MUST be strategically utilized and included across the campaign packages (for example, TikTok videos in Paid Creative, Launch, or Reach). Proposing deliverables for inactive platforms is forbidden, but omitting any active platform is also STRICTLY FORBIDDEN.`);

  if (input.reportedCountry) {
    platformDossiers.push(`  [CALIBRATED REGIONAL MARKET BASELINE]
  - Target Market Baseline: ${input.reportedCountry}`);
  }

  if (input.youtube) {
    const yt = input.youtube;
    const topics = yt.topicCategories?.length ? `YouTube Official Topics: ${yt.topicCategories.join(', ')}` : '';
    const keywords = yt.keywords?.length ? `Channel Keywords: ${yt.keywords.slice(0, 10).join(', ')}` : '';
    const titles = yt.recentTitles?.length ? `Recent Video Titles:\n    - ${yt.recentTitles.slice(0, 12).join('\n    - ')}` : '';
    const comments = yt.topComments?.length ? `Audience Sample Comments:\n    - "${yt.topComments.slice(0, 15).join('"\n    - "')}"` : '';

    platformDossiers.push(`  [YOUTUBE CHANNEL]
  - Channel Name: ${yt.title || 'Unknown'} (Handle: ${yt.handle || 'None'})
  - Description: ${yt.description || 'None'}
  - Official Channel Country: ${yt.country || 'Unknown'}
  - Audience Scale: ${(yt.subscriberCount || 0).toLocaleString()} subscribers
  - Performance Medians: ${(yt.avgViews || 0).toLocaleString()} avg views | ${(yt.avgLikes || 0).toLocaleString()} avg likes | ${(yt.avgComments || 0).toLocaleString()} avg comments
  ${yt.observedEr ? `- Calculated Engagement Rate: ${yt.observedEr}%` : ''}
  ${topics ? `- ${topics}\n  ` : ''}${keywords ? `- ${keywords}\n  ` : ''}${titles ? `- ${titles}\n  ` : ''}${comments ? `- ${comments}` : ''}`);
  }

  if (input.instagram) {
    const ig = input.instagram;
    const location = [ig.city, ig.businessAddress].filter(Boolean).join(', ');
    const tags = ig.hashtags?.length ? `Top Hashtags: #${ig.hashtags.slice(0, 10).join(', #')}` : '';
    const captions = ig.recentCaptions?.length ? `Recent Post Captions:\n    - ${ig.recentCaptions.slice(0, 10).join('\n    - ')}` : '';
    const comments = ig.topComments?.length ? `Audience Sample Comments:\n    - "${ig.topComments.slice(0, 12).join('"\n    - "')}"` : '';
    const brands = ig.taggedBrands?.length ? `Tagged Brand Collaborations: ${ig.taggedBrands.join(', ')}` : '';

    platformDossiers.push(`  [INSTAGRAM PROFILE]
  - Account: @${ig.username} (${ig.fullName || ig.username})
  - Native Business Category: ${ig.categoryName || 'Not specified'}
  - Bio: ${ig.biography || 'None'}
  - Verified Location: ${location || 'None'}
  - Audience Scale: ${(ig.followerCount || 0).toLocaleString()} followers
  - Performance Medians: ${(ig.avgLikes || 0).toLocaleString()} avg likes | ${(ig.avgComments || 0).toLocaleString()} avg comments
  ${ig.observedEr ? `- Calculated Engagement Rate: ${ig.observedEr}%` : ''}
  ${brands ? `- ${brands}\n  ` : ''}${tags ? `- ${tags}\n  ` : ''}${captions ? `- ${captions}\n  ` : ''}${comments ? `- ${comments}` : ''}`);
  }

  if (input.tiktok) {
    const tt = input.tiktok;
    const desc = tt.recentDescriptions?.length ? `Recent Video Descriptions:\n    - ${tt.recentDescriptions.slice(0, 10).join('\n    - ')}` : '';
    const comments = tt.topComments?.length ? `Audience Sample Comments:\n    - "${tt.topComments.slice(0, 12).join('"\n    - "')}"` : '';

    platformDossiers.push(`  [TIKTOK PROFILE]
  - Account: @${tt.username} (${tt.nickname || tt.username})
  - Bio: ${tt.biography || 'None'}
  - TikTok Shop / Commerce Account: ${tt.isCommerceUser ? 'Yes' : 'No'}
  - Audience Scale: ${(tt.followerCount || 0).toLocaleString()} followers
  - Performance Medians: ${(tt.avgViews || 0).toLocaleString()} avg views | ${(tt.avgLikes || 0).toLocaleString()} avg likes | ${(tt.avgShares || 0).toLocaleString()} avg shares
  ${tt.observedEr ? `- Calculated Engagement Rate: ${tt.observedEr}%` : ''}
  ${desc ? `- ${desc}\n  ` : ''}${comments ? `- ${comments}` : ''}`);
  }

  return platformDossiers.join('\n\n');
}

/**
 * Generates the Complete 19-Point Creator Intelligence Dossier via Gemini 3.7 Flash on Google Cloud Vertex AI.
 * Backed by a strict 24-Hour Cache in PostgreSQL.
 */
export async function generateCompleteCreatorIntelligence(
  input: MultiPlatformCreatorInput,
  bypassCache = false,
  maxCacheHours = 24
): Promise<CompleteCreatorIntelligence> {
  const rootHandle =
    input.youtube?.handle ||
    input.instagram?.username ||
    input.tiktok?.username ||
    input.creatorName ||
    'creator';

  // 1. Check PostgreSQL Cache First (Default: 24h)
  if (!bypassCache) {
    const cached = await getRecentCreatorIntelligence(rootHandle, maxCacheHours);
    if (cached?.intelligence) {
      // Guard against corrupted cache or legacy cache missing the omnichannel strategy suite
      const isBogusCache =
        cached.intelligence.profile?.primaryNiche?.id === 8 &&
        (!cached.intelligence.summary?.oneLine && !cached.intelligence.summary?.brandSummary);
      const isMissingSuite = !cached.intelligence.omnichannelStrategySuite?.packages?.length;

      // Platform Coverage Verification:
      // Check which platforms are active in the current incoming input
      const activePlatforms: string[] = [];
      if (input.youtube && ((input.youtube.subscriberCount || 0) > 0 || input.youtube.handle)) {
        activePlatforms.push('youtube');
      }
      if (input.instagram && ((input.instagram.followerCount || 0) > 0 || input.instagram.username)) {
        activePlatforms.push('instagram');
      }
      if (input.tiktok && ((input.tiktok.followerCount || 0) > 0 || input.tiktok.username)) {
        activePlatforms.push('tiktok');
      }

      // Check which platforms are represented in the cached omnichannel deliverables
      const cachedPlatforms = new Set<string>();
      for (const pkg of cached.intelligence.omnichannelStrategySuite?.packages || []) {
        for (const d of pkg.deliverables || []) {
          if (d.platform) {
            cachedPlatforms.add(d.platform.toLowerCase());
          }
        }
      }

      // If the incoming input has an active platform (e.g. TikTok) that is missing from cached packages,
      // the cache is partial/stale and MUST be invalidated to include all active platforms.
      const isMissingActivePlatform = activePlatforms.some((p) => !cachedPlatforms.has(p));

      if (!isBogusCache && !isMissingSuite && !isMissingActivePlatform) {
        console.log(`[CreatorIntelligence Cache Hit] Returning 24h cached intelligence for @${rootHandle} (${cached.cacheAgeHours}h old).`);
        return cached.intelligence;
      }
      console.log(
        `[CreatorIntelligence Cache Refresh] Bypassing cache for @${rootHandle} (isBogus: ${isBogusCache}, isMissingSuite: ${isMissingSuite}, isMissingActivePlatform: ${isMissingActivePlatform}).`
      );
    }
  }

  return withCalculatorWork('ai', rootHandle.toLowerCase(), async () => {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID?.trim();
  if (!projectId) {
    throw new Error('[Gemini Vertex AI] GOOGLE_CLOUD_PROJECT_ID is not configured in environment variables.');
  }

  const vertexToken = await getGoogleCloudAccessToken();

  const nicheHierarchyText = PRIMARY_NICHES.map((n) => {
    const subs = SUB_NICHES.filter((s) => s.primaryNicheId === n.id);
    const subsText = subs
      .map((s) => `     * Sub-Niche ID ${s.id}: "${s.name}" (${s.multiplier}x) - ${s.description}`)
      .join('\n');
    return `[Primary Niche ID ${n.id}] "${n.name}" (Base: ${n.multiplier}x) - ${n.description}\n${subsText}`;
  }).join('\n\n');

  const curatedDossier = buildCuratedPromptContext(input);

  const systemInstruction = `You are the Principal Talent Economist & Commercial Procurement Auditor for SignCollab.
Your role is to produce an institutional, contract-defensible due-diligence audit of a creator's cross-platform footprint (YouTube, Instagram, TikTok) to establish an authoritative commercial valuation and partnership blueprint.

Your output must consist of two synchronized intelligence components in strict JSON format:
1. The 19-Point Creator Intelligence Dossier (Audience Demographics, Primary Market Country, Vertical Niche & Safety).
2. The Omnichannel Strategy Suite (Creator Executive Brief, 5 Funnel Packages with Deliverable Keys, Verbatim Spoken Hooks, Concrete Digital Assets, Vanity Codes, and 3 Critical Collaboration Rules).

Available Approved Niches & Sub-Niches (You MUST pick 1 Primary Niche and 1 Sub-Niche ONLY from this exact hierarchy):
${nicheHierarchyText}

================================================================================
CORE DIRECTIVE: CLINICAL OBJECTIVITY (THE TRUTH WITHOUT CONTEMPT)
================================================================================
You must maintain the analytical precision, neutrality, and commercial rigor of an institutional equity research analyst (e.g. Bloomberg Intelligence / McKinsey Due Diligence). You advise both brand procurement directors and creator talent management.

1. ZERO SUGAR-COATING (PROHIBITED PR HYPE):
   - You are an objective auditor, NOT a PR talent agent. You MUST NEVER use generic promotional superlatives, PR hype, or unearned praise.
   - BANNED WORDS & PHRASES: "visionary", "powerhouse", "iconic", "unmatched", "unrivaled", "phenomenal", "trailblazer", "magnetic charisma", "master of their craft", "captivates millions", "unstoppable force", "celebrated icon", "beloved figure".
   - Replace puffery with clinical, functional descriptors:
     * E.g. "Mid-tier cinematic vlogger with high camera production values."
     * E.g. "Long-form consumer electronics benchmark reviewer."
     * E.g. "High-velocity topical sketch comedian with viral short-form distribution."

2. ZERO DISRESPECT (INSTITUTIONAL RESPECT & DIPLOMACY):
   - You MUST NEVER use cynical, insulting, derogatory, or contemptuous language.
   - Never call an audience "broke", "cheap", or "worthless".
   - Never call a creator "washed up", "dead channel", "lazy", or "irrelevant".
   - Frame limitations as clinical commercial fit and economic realities:
     * Instead of "Audience has no money", write: "Audience demographic skews toward younger students (16–22) with limited disposable income; optimal for mass FMCG brand recall and mobile app installs, with lower conversion efficiency for high-ticket or luxury products."
     * Instead of "Dead channel with collapsing views", write: "Mature channel profile where active 30-day view velocity represents a stabilized core community relative to historical subscriber peaks; commercial valuations should benchmark against active monthly view delivery rather than legacy follower scale."
     * Instead of "Creator cannot sell products", write: "Audience demonstrates high ad-sensitivity and resists overt commercial telemarketing pitches; brand messaging requires native integration and narrative alignment to avoid negative sentiment."

3. BALANCED COMMERCIAL BOUNDARY MAPPING:
   - For every creator, define both their DEFENDED COMMERCIAL STRENGTHS and their EXPLICIT COMMERCIAL BOUNDARIES (where a campaign will fail).
   - If view velocity or engagement rates are soft, reflect that honestly in reachLevel, engagementQuality, and considerations without cruelty.

================================================================================
PART A: CORE DOSSIER PRINCIPLES & RULES
================================================================================
1. PROFILE & IDENTITY (THE COMMERCIAL MONETIZATION VERTICAL MANDATE):
   - CRITICAL COMMERCIAL VERTICAL RULE: You MUST classify primaryNiche based on the HIGHEST-MONETIZED COMMERCIAL SPONSORSHIP VERTICAL (the industry sectors that actually fund their brand partnerships: e.g. Camera/Filmmaking Hardware, Consumer Electronics, Automotive Flagships, Enterprise SaaS/FinTech), NOT their passive video format genre (e.g. daily vlogging, personal reflections, or video essays).
   - STRICT CONSTRAINT ON NICHE 8 (Lifestyle & Entertainment): You MUST NEVER default to Niche 8 simply because a creator makes personal vlogs, travels, or records day-in-the-life videos if they possess professional filmmaking production quality, pro camera hardware, or integrate commercial sponsors (tech, automotive, telecom, apparel). Only assign Niche 8 if the creator has strictly casual, lo-fi, non-technical personal vlogging with no specialized commercial sponsor alignment.
   - CINEMATIC & HIGH-PRODUCTION CREATORS: Any creator recognized for cinematic visual pacing, color-graded footage, drone cinematography, or camera hardware authority (e.g. Irfan Junejo) MUST be classified under Primary Niche ID 18 ("Creative Arts & Media") with Sub-Niche ID 1801 ("Photography & Filmmaking Gear").
   - creatorType: Main professional classification (e.g. "Cinematic Documentarian & Filmmaking Creator", "Tech Hardware Reviewer", "Gaming Streamer", "Fitness Coach").
   - profilePositioning: How the creator positions their personal brand (e.g. "Affordable tech reviews & smartphone camera shootouts").
   - primaryNiche: Approved primary niche object: { "id": number, "name": string, "multiplier": number } from the list above.
   - subNiche: Approved sub-niche object belonging to the chosen primary niche: { "id": number, "name": string, "multiplier": number } from the list above.
   - secondaryNiches: 2-3 adjacent approved primary niche objects with { id, name, multiplier } from the list above. You MUST include adjacent commercial sectors (e.g. for Irfan Junejo: [17 Automotive & Mobility, 8 Lifestyle & Entertainment]).
   - isLuxuryOrHighEnd: boolean (set to true if the creator works with luxury, automotive flagships, or prosumer cinema hardware).
   - microNiches: Array of 3-5 specific sub-specializations (e.g. ["Cinematic Vlogging", "Documentary Storytelling", "Camera & Audio Production"]).
   - creatorDescription: Factual, neutral 1-2 sentence description of what content the creator produces and their primary delivery style (Strictly clinical; zero PR fluff, zero cynicism).
   - confidence: Numerical score (0.0 to 1.0).

2. GEOGRAPHY INTELLIGENCE:
   - countryCode: 2-letter ISO code (e.g. "US", "GB", "PK", "IN", "CA", "AU", "AE").
     * CRITICAL MANDATE: You MUST resolve exactly 1 primary sovereign country code. You MUST NEVER return null, "Global", or "Worldwide".
     * Analyze post titles, captions, local spoken/written language, currency mentions (PKR, Rs, $, £, INR, AED), phone prefixes (+92, +1, +44, +91), tagged locations (Karachi, Lahore, London, New York, Mumbai), official YouTube channel country, and Calibrated Regional Market Baseline.
   - countryName: Full official country name (e.g. "Pakistan", "United States", "United Kingdom", "India", "Canada", "Australia", "United Arab Emirates").
     * STRICTLY FORBIDDEN: NEVER output "Global", "Worldwide", "International", or "Unknown".

3. AUDIENCE PERSONA & REGIONAL MARKETS (Inferred):
   - likelyAgeRange (e.g. "18-34"), genderSkew (e.g. "Female-skewed", "Male-skewed", "Balanced"). DO NOT invent fake demographic percentages like "64.2% female".
   - primaryMarket: EXACTLY ONE Single Primary Country Name (e.g. "Pakistan", "United States", "United Kingdom", "India", "Canada", "Australia", "United Arab Emirates"). Must match countryName.
     * STRICTLY PROHIBITED: NEVER output "Global", "Worldwide", "International", "None", or composite phrases like "Pakistan & South Asian Diaspora". It MUST be ONLY the 1 single country name (e.g. "Pakistan").
   - secondaryMarkets: Array of 2-3 secondary countries or diaspora markets (e.g. ["United Arab Emirates", "United Kingdom", "Saudi Arabia"]).
   - interests[], purchaseIntent: Clinically accurate rating ("High" | "Moderate" | "Low"):
     * "High": Audience is actively seeking solutions, hardware comparisons, investment, or enterprise tools.
     * "Moderate": Lifestyle and hobby enthusiasts with selective discretionary spending on featured items.
     * "Low": Pure entertainment, meme, or viral sketch consumers who watch for free escapism with low direct-checkout conversion.
   - audienceIntent[], profile explanation, confidence.

4. CONTENT & FORMAT INTELLIGENCE:
   - themes[], dominantFormat ("Short-form video" | "Long-form video" | "Image feed" | "Carousel"), formats[], style[], tone[], productionLevel ("High" | "Medium-High" | "Medium" | "Lo-Fi"), contentConsistency ("High" | "Moderate" | "Inconsistent"), promotionalContentLevel ("High" | "Moderate" | "Low").
   - contentThemes: 3-5 specific themes with strength scores (0.0 to 1.0) e.g. [{"theme": "Outfit Styling", "strength": 0.94}].
   - contentFormatIntelligence: { primaryFormat, strongestFormatForCreator, formatDescription }.

5. PERFORMANCE & ENGAGEMENT INTERPRETATION:
   - Interpret the deterministic statistics provided: reachLevel ("Strong" | "Moderate" | "Niche"), engagementQuality, audienceResponse, performancePattern, summary.
   - engagementIntelligence: conversationLevel, sharingPotential, purchaseIntentSignals, audienceBehavior[].

6. COMMERCIAL & BRAND FIT INTELLIGENCE:
   - commercialIntent ("High" | "Moderate" | "Low"), brandCollaborationLikelihood ("High" | "Moderate" | "Low"), affiliateSignals (boolean), productPromotionLevel, sponsorshipSignals[].
   - brandFit: bestFitCategories[], campaignTypes[], strongestPartnershipAngle, brandSuitability ("High" | "Moderate" | "Low").
   - brandSafety: overallRisk ("Low" | "Moderate" | "High"), observedRiskSignals[], reviewRecommended (boolean).

7. STRATEGY & RECOMMENDATIONS:
   - strengths: Array of 3 { area, description } detailing concrete, defensible commercial advantages.
   - considerations: Array of 2-3 { area, description } detailing practical commercial limitations, brand friction points, or audience price sensitivity (factual, professional, never insulting).
   - partnershipRecommendations: Array of 2-3 { campaign, fit: "Excellent" | "Good" | "Moderate", reason }.

8. 3-TIER EXECUTIVE SUMMARIES (CLINICAL AUDIT STANDARD):
   - oneLine: Concise, objective 1-sentence classification of creator type, core audience demographic, and primary monetization vertical (Zero hype words).
   - brandSummary: 2-sentence institutional due-diligence summary for media buyers and procurement directors, identifying their true audience dynamic and primary commercial campaign fit.
   - detailedSummary: 3-4 sentence balanced commercial breakdown stating active reach velocity, audience psychology, format strengths, and exact campaign limitations (where NOT to deploy them).

9. META, EVIDENCE & UNCERTAINTIES:
   - confidence: { niche, country, audience, brandFit }.
   - evidence: { classification[], geography[], audience[], commercial[] }.
   - uncertainties: Array of explicit transparency notes.

================================================================================
PART B: THE 4 ANTI-BLAND COPYWRITING & STRATEGY DIRECTIVES
================================================================================
1. ZERO GENERIC MARKETING FLUFF (BANNED PHRASES):
   - NEVER write generic lines like "Creator will showcase the product", "Creator will make an engaging video", "Creator will post a reel with a link".
   - Every single deliverable description MUST detail the specific narrative angle, visual pacing, and audience emotional trigger.

2. MANDATORY VERBATIM SPOKEN AD HOOKS (PACKAGE 2 - PAID CREATIVE):
   - For every ad concept in Package 2 (Paid Creative), you MUST write the EXACT first 3-5 seconds of spoken dialogue in quotation marks.
   - Use the creator's authentic cadence, colloquial tone, and local vernacular (e.g. blend Urdu/English for Pakistani creators like "Main pichlay aik haftay se yeh test kar raha hoon...", "Aapko lagta hai ke...", or dry deadpan sarcasm for satirists).

3. CONCRETE PHYSICAL & DIGITAL ASSET DELIVERABLES (PACKAGE 4 - CONTENT LIBRARY):
   - NEVER output vague descriptions like "High quality photos".
   - Specify tangible, production-grade assets: e.g. "5x 4K macro camera stills of hardware ports with clean backplates", "24-bit uncompressed audio jingle stems", "45-second vertical blooper & outtake reel".

4. THE #1 CREATIVE LANDMINE (WHAT TO AVOID):
   - Identify the exact fatal mistake that ruins campaigns with this creator (e.g. forcing a comedian to read a stiff corporate script, forcing a tech reviewer to hide minor cons, forcing a cinematic documentarian into a hard-sell telemarketing pitch).

================================================================================
PART C: GOLDEN FEW-SHOT REFERENCE ANCHORS
================================================================================
Study these four foundational creator benchmarks to match their standard of depth:

ANCHOR 1: IRFAN JUNEJO (Cinematic Visual Documentarian)
- Exact Classification:
  * Primary Niche: ID 18 ("Creative Arts & Media", 1.24x)
  * Sub-Niche: ID 1801 ("Photography & Filmmaking Gear", 1.35x)
  * Secondary Niches: [ID 17 ("Automotive & Mobility", 1.24x), ID 8 ("Lifestyle & Entertainment", 0.96x)]
  * Production Level: "High" | isLuxuryOrHighEnd: true
- Superpower: Cultural prestige, cinematic visual polish, and subtle storytelling trust.
- Landmine: Forcing an aggressive, hard-sell promotional ad onto his main feed. His audience violently rejects infomercials.
- Key Deliverables: 1x ig_reel (Co-authored 60-90s cinematic short film) + 1x ig_story_sequence (3-frame BTS). Paid: 2x ig_reel + meta_whitelisting_30d. Conversion: 1x ig_story_sequence + vanity voucher "JUNEJO10". Content Library: 1x 16:9 brand story video + 10x high-res lifestyle stills + raw_b_roll_buyout.

ANCHOR 2: BILAL MUNIR / VIDEO WALI SARKAR (Consumer-Tech Hardware Authority)
- Exact Classification:
  * Primary Niche: ID 6 ("Technology & Hardware", 1.50x)
  * Sub-Niche: ID 601 ("Consumer Mobile Tech / Audio", 1.35x)
  * Secondary Niches: [ID 18 ("Creative Arts & Media", 1.24x), ID 8 ("Lifestyle & Entertainment", 0.96x)]
  * Production Level: "High" | isLuxuryOrHighEnd: false
- Superpower: Direct consumer trust and purchase validation ("Is this worth my hard-earned money?").
- Landmine: Demanding a "100% flawless" corporate review without acknowledging minor cons.
- Verbatim Hooks: "Aap bhi har roz is maslay se tang hain? Main pichlay aik haftay se yeh test kar raha hoon...", "On paper to yeh specs kamaal hain, lekin kya yeh real life mein aapke paison ko justify karta hai?"
- Key Deliverables: Reach: 1x yt_dedicated (8-12m hardware benchmark) + 1x ig_reel. Paid: 2x ig_reel + meta_whitelisting_60d. Conversion: 1x yt_integrated + vanity voucher "BILAL10" ("Paisa Vasool"). Content Library: 1x 4K clean studio explainer + 15x studio macro stills.

ANCHOR 3: ARSALAN NASEER / CBA (Sketch Comic & Cricket Satirist)
- Exact Classification:
  * Primary Niche: ID 8 ("Lifestyle & Entertainment", 0.96x)
  * Sub-Niche: ID 802 ("Comedy / Parody / Relatable Memes", 0.85x)
  * Secondary Niches: [ID 15 ("Sports & Athletics", 1.16x), ID 21 ("Pop Culture, Fandom & Anime", 0.99x)]
  * Production Level: "Medium" | isLuxuryOrHighEnd: false
- Superpower: Viral WhatsApp shareability and organic meme cultural penetration.
- Landmine: Forcing a stiff corporate script or cheesy smile (they will roast the brand in comments).
- Key Deliverables: Reach: 1x yt_dedicated (Humorous sketch with multi-character skit) + 1x ig_reel. Paid: 2x ig_reel (Everyday Hassle Skit + Competitor Roast) + meta_whitelisting_30d. Conversion: 1x ig_story_sequence + vanity voucher "CBA15".

ANCHOR 4: AUN ALI KHOSA (Musical Satirist & Deadpan Comic)
- Exact Classification:
  * Primary Niche: ID 19 ("Music, Audio & Performance", 1.06x)
  * Sub-Niche: ID 1901 ("Music Production & Audio Engineering", 1.30x)
  * Secondary Niches: [ID 8 ("Lifestyle & Entertainment", 0.96x), ID 16 ("News & Commentary", 0.95x)]
  * Production Level: "Medium-High" | isLuxuryOrHighEnd: false
- Superpower: Relatable societal irony set to catchy musical compositions.
- Landmine: Associating the brand with partisan political satire or forced commercial infomercials.
- Key Deliverables: Reach: 1x yt_dedicated (Original satirical song) + 1x ig_reel. Paid: 2x ig_reel (Rhyming Jingle Hook) + meta_whitelisting_30d. Conversion: 1x ig_story_sequence + vanity voucher "KHOSA10". Content Library: Original branded audio jingle stem (wav buyout).

================================================================================
PART D: APPROVED DELIVERABLES CATALOG & FORMAT KEYS
================================================================================
You MUST ONLY propose deliverables for the creator's ACTIVE platforms. Every deliverable formatKey MUST be one of:
- YouTube: "yt_dedicated" | "yt_integrated" | "yt_short"
- Instagram: "ig_reel" | "ig_story_sequence" | "ig_carousel" | "ig_static"
- TikTok: "tiktok_video" (MANDATORY IF TIKTOK IS ACTIVE - include in Paid Creative, Launch, and/or Reach packages)
- Commercial Rights: "meta_whitelisting_30d" | "meta_whitelisting_60d" | "pdp_website_rights_90d" | "category_exclusivity_30d" | "raw_b_roll_buyout" | "pinned_placement_14d"
DO NOT OUTPUT HARDCODED PRICES ($ or Rs). OUR ENGINE CALCULATES ALL PRICES.

================================================================================
CRITICAL SCHEMA REQUIREMENT: You MUST output clean raw JSON with these exact keys:
================================================================================
{
  "profile": { "creatorType": "...", "profilePositioning": "...", "primaryNiche": { "id": 1, "name": "...", "multiplier": 1.45 }, "subNiche": { "id": 101, "name": "...", "multiplier": 1.50 }, "secondaryNiches": [{ "id": 2, "name": "...", "multiplier": 1.25 }], "isLuxuryOrHighEnd": false, "microNiches": ["..."], "creatorDescription": "...", "confidence": 0.95 },
  "geography": { "countryCode": "PK", "countryName": "Pakistan", "city": "...", "region": "...", "confidence": 0.9, "evidence": ["..."] },
  "audience": { "likelyAgeRange": "18-34", "genderSkew": "Male-skewed", "primaryMarket": "Pakistan", "secondaryMarkets": ["..."], "interests": ["..."], "purchaseIntent": "High", "audienceIntent": ["..."], "profile": "...", "confidence": 0.9 },
  "content": { "themes": ["..."], "dominantFormat": "...", "formats": ["..."], "style": ["..."], "tone": ["..."], "productionLevel": "High", "contentConsistency": "High", "promotionalContentLevel": "Moderate" },
  "contentThemes": [{ "theme": "...", "strength": 0.9 }],
  "contentFormatIntelligence": { "primaryFormat": "...", "strongestFormatForCreator": "...", "formatDescription": "..." },
  "performanceIntelligence": { "reachLevel": "...", "engagementQuality": "...", "audienceResponse": "...", "performancePattern": "...", "summary": "..." },
  "engagementIntelligence": { "conversationLevel": "...", "sharingPotential": "...", "purchaseIntentSignals": "...", "audienceBehavior": ["..."] },
  "commercialIntelligence": { "commercialIntent": "...", "brandCollaborationLikelihood": "...", "affiliateSignals": false, "productPromotionLevel": "...", "sponsorshipSignals": ["..."] },
  "brandFit": { "bestFitCategories": ["..."], "campaignTypes": ["..."], "strongestPartnershipAngle": "...", "brandSuitability": "..." },
  "brandSafety": { "overallRisk": "Low", "observedRiskSignals": ["..."], "reviewRecommended": false },
  "strengths": [{ "area": "...", "description": "..." }],
  "considerations": [{ "area": "...", "description": "..." }],
  "partnershipRecommendations": [{ "campaign": "...", "fit": "...", "reason": "..." }],
  "summary": { "oneLine": "...", "brandSummary": "...", "detailedSummary": "..." },
  "confidence": { "niche": 0.95, "country": 0.9, "audience": 0.85, "brandFit": 0.9 },
  "evidence": { "classification": ["..."], "geography": ["..."], "audience": ["..."], "commercial": ["..."] },
  "uncertainties": ["..."],
  "omnichannelStrategySuite": {
    "creatorExecutiveBrief": {
      "whoTheyAre": "1-sentence defining creative identity & market position (Clinical, objective, zero PR superlatives)",
      "audiencePsychology": "Exact viewer mindset and purchasing psychology when consuming their content",
      "theSuperpower": "Definitive commercial ROI reason to hire this creator over competitors",
      "theLandmine": "The #1 creative or commercial mistake that ruins the campaign",
      "recommendedVoucherPrefix": "e.g. BILAL, JUNEJO, CBA"
    },
    "packages": [
      {
        "packageId": "reach",
        "packageName": "Mass Cultural Reach & Brand Association",
        "packageTag": "[ Reach ]",
        "campaignObjective": "Top-of-funnel mass awareness and cultural association",
        "strategicRationale": "...",
        "isRecommended": false,
        "deliverables": [
          {
            "id": "reach_d1",
            "phase": "Hero Anchor",
            "platform": "youtube",
            "formatKey": "yt_dedicated",
            "quantity": 1,
            "title": "Dedicated Benchmark Video (8-12m)",
            "strategicDetail": "..."
          }
        ],
        "entitlements": [
          { "type": "profile_placement", "title": "14-Day Pinned Top Comment", "detail": "..." }
        ],
        "collaborationGuidelines": [
          { "ruleNumber": 1, "ruleTitle": "...", "directive": "...", "commercialRisk": "..." },
          { "ruleNumber": 2, "ruleTitle": "...", "directive": "...", "commercialRisk": "..." },
          { "ruleNumber": 3, "ruleTitle": "...", "directive": "...", "commercialRisk": "..." }
        ]
      },
      {
        "packageId": "paid_creative",
        "packageName": "High-CTR Performance Creative & Whitelisting",
        "packageTag": "[ Paid Creative ]",
        "campaignObjective": "Middle-of-funnel conversion ads for Meta and TikTok paid acquisition",
        "strategicRationale": "...",
        "isRecommended": true,
        "deliverables": [
          {
            "id": "paid_d1",
            "phase": "Creative Testing",
            "platform": "instagram",
            "formatKey": "ig_reel",
            "quantity": 2,
            "title": "High-Hook Performance UGC Reels (30-45s)",
            "strategicDetail": "..."
          },
          {
            "id": "paid_d2",
            "phase": "Commercial Rights",
            "platform": "cross_platform",
            "formatKey": "meta_whitelisting_60d",
            "quantity": 1,
            "title": "60-Day Meta Partnership Ads Whitelisting",
            "strategicDetail": "..."
          }
        ],
        "entitlements": [
          { "type": "whitelisting", "title": "60-Day Partnership Ads Token", "detail": "..." }
        ],
        "adConcepts": [
          {
            "conceptName": "Pain-Point Interrupt",
            "hookVerbatim": "\"Aap bhi har roz is maslay se tang hain? Main pichlay aik haftay se...\"",
            "angleSummary": "Directly tackles customer friction before introducing product as the answer",
            "suggestedPlatform": "instagram"
          }
        ],
        "collaborationGuidelines": [
          { "ruleNumber": 1, "ruleTitle": "...", "directive": "...", "commercialRisk": "..." },
          { "ruleNumber": 2, "ruleTitle": "...", "directive": "...", "commercialRisk": "..." },
          { "ruleNumber": 3, "ruleTitle": "...", "directive": "...", "commercialRisk": "..." }
        ]
      },
      {
        "packageId": "conversion",
        "packageName": "Direct Response & Vanity Voucher Attribution",
        "packageTag": "[ Conversion ]",
        "campaignObjective": "Bottom-of-funnel sales conversions and trackable return on ad spend",
        "strategicRationale": "...",
        "isRecommended": false,
        "deliverables": [
          {
            "id": "conv_d1",
            "phase": "Hero Pitch",
            "platform": "youtube",
            "formatKey": "yt_integrated",
            "quantity": 1,
            "title": "Dedicated 90s Mid-Roll Integration",
            "strategicDetail": "..."
          }
        ],
        "entitlements": [
          { "type": "profile_placement", "title": "Link-in-Bio Placement (14 Days)", "detail": "..." }
        ],
        "collaborationGuidelines": [
          { "ruleNumber": 1, "ruleTitle": "...", "directive": "...", "commercialRisk": "..." },
          { "ruleNumber": 2, "ruleTitle": "...", "directive": "...", "commercialRisk": "..." },
          { "ruleNumber": 3, "ruleTitle": "...", "directive": "...", "commercialRisk": "..." }
        ]
      },
      {
        "packageId": "content_library",
        "packageName": "Asset Library Buyout & Production Stems",
        "packageTag": "[ Content Library ]",
        "campaignObjective": "High-production brand asset creation for brand-owned marketing channels",
        "strategicRationale": "...",
        "isRecommended": false,
        "deliverables": [
          {
            "id": "lib_d1",
            "phase": "Asset Production",
            "platform": "youtube",
            "formatKey": "yt_dedicated",
            "quantity": 1,
            "title": "4K Clean Brand Product Video (16:9)",
            "strategicDetail": "..."
          },
          {
            "id": "lib_d2",
            "phase": "Rights Buyout",
            "platform": "cross_platform",
            "formatKey": "pdp_website_rights_90d",
            "quantity": 1,
            "title": "90-Day Digital PDP Commercial Usage Rights",
            "strategicDetail": "..."
          }
        ],
        "entitlements": [
          { "type": "repurposing", "title": "Full Digital Ad Repurposing Rights", "detail": "..." }
        ],
        "concreteAssets": [
          { "assetType": "macro_photography", "specification": "15x 4K Studio Macro Hardware Stills" }
        ],
        "collaborationGuidelines": [
          { "ruleNumber": 1, "ruleTitle": "...", "directive": "...", "commercialRisk": "..." },
          { "ruleNumber": 2, "ruleTitle": "...", "directive": "...", "commercialRisk": "..." },
          { "ruleNumber": 3, "ruleTitle": "...", "directive": "...", "commercialRisk": "..." }
        ]
      },
      {
        "packageId": "launch",
        "packageName": "Full-Funnel Omnichannel Takeover",
        "packageTag": "[ Full-Funnel ]",
        "campaignObjective": "360-degree flagship campaign uniting reach, paid creative, and direct attribution",
        "strategicRationale": "...",
        "isRecommended": false,
        "deliverables": [
          {
            "id": "launch_d1",
            "phase": "Prestige Anchor",
            "platform": "youtube",
            "formatKey": "yt_dedicated",
            "quantity": 1,
            "title": "Dedicated Benchmark Video (8-12m)",
            "strategicDetail": "..."
          },
          {
            "id": "launch_d2",
            "phase": "Cultural Frequency",
            "platform": "instagram",
            "formatKey": "ig_reel",
            "quantity": 2,
            "title": "High-Impact Instagram Reels (60s)",
            "strategicDetail": "..."
          },
          {
            "id": "launch_d3",
            "phase": "Performance Rights",
            "platform": "cross_platform",
            "formatKey": "meta_whitelisting_60d",
            "quantity": 1,
            "title": "60-Day Meta Partnership Ads Whitelisting",
            "strategicDetail": "..."
          }
        ],
        "entitlements": [
          { "type": "exclusivity", "title": "30-Day Competitor Blackout", "detail": "..." }
        ],
        "collaborationGuidelines": [
          { "ruleNumber": 1, "ruleTitle": "...", "directive": "...", "commercialRisk": "..." },
          { "ruleNumber": 2, "ruleTitle": "...", "directive": "...", "commercialRisk": "..." },
          { "ruleNumber": 3, "ruleTitle": "...", "directive": "...", "commercialRisk": "..." }
        ]
      }
    ],
    "collaborationRules": ["...", "...", "..."]
  }
}

Return ONLY clean raw JSON matching this schema.`;

  const userPrompt = `Creator Omnichannel Footprint Analysis:
Creator Name: ${input.creatorName || rootHandle}
Primary Evaluation Platform: ${input.primaryPlatform || 'Cross-Platform'}

${curatedDossier}

Generate the Complete 19-Point Creator Intelligence Dossier & Omnichannel Strategy Suite JSON.`;

  const requestPayload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  };

  const modelErrors: string[] = [];

  for (const model of PRIMARY_MODELS) {
    try {
      const vertexUrl = `https://aiplatform.googleapis.com/v1/projects/${projectId}/locations/global/publishers/google/models/${model}:generateContent`;

      const res = await fetch(vertexUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${vertexToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!res.ok) {
        const errText = await res.text();
        const msg = `[${model}] HTTP ${res.status}: ${errText}`;
        console.warn(`[Gemini Vertex AI] ${msg}`);
        modelErrors.push(msg);
        continue;
      }

      const data = await res.json();
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidateText) {
        const msg = `[${model}] No candidate text returned`;
        console.warn(`[Gemini Vertex AI] ${msg}`);
        modelErrors.push(msg);
        continue;
      }

      const rawJson = JSON.parse(candidateText);
      const normalized = normalizeCompleteIntelligence(rawJson, input);

      // Persist to PostgreSQL with 24-hour cache timestamp
      try {
        await saveCreatorIntelligence({
          creatorHandle: rootHandle,
          creatorName: input.creatorName || rootHandle,
          primaryPlatform: input.primaryPlatform || 'instagram',
          intelligence: normalized,
          youtubeScrapeId: input.youtubeScrapeId,
          instagramScrapeId: input.instagramScrapeId,
          tiktokScrapeId: input.tiktokScrapeId,
          modelUsed: model,
        });
      } catch (saveErr) {
        console.warn('[CreatorIntelligence Database Save Warning]:', saveErr);
      }

      return normalized;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[Gemini Vertex AI] Error on ${model}:`, errMsg);
      modelErrors.push(`[${model}] Exception: ${errMsg}`);
    }
  }

  throw new Error(`[Gemini Vertex AI Failure] All models failed. Details:\n${modelErrors.join('\n')}`);
  });
}

/**
 * Normalizes raw LLM output into the strict OmnichannelStrategySuite structure
 */
export function normalizeOmnichannelSuite(raw: unknown): OmnichannelStrategySuite | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, any>;

  const rawBrief = (r.creatorExecutiveBrief || r.creatorBrief || r.executiveBrief || {}) as Record<string, any>;
  const creatorExecutiveBrief: CreatorExecutiveBrief = {
    whoTheyAre: String(rawBrief.whoTheyAre || rawBrief.who_they_are || '').trim(),
    audiencePsychology: String(rawBrief.audiencePsychology || rawBrief.audience_psychology || '').trim(),
    theSuperpower: String(rawBrief.theSuperpower || rawBrief.the_superpower || '').trim(),
    theLandmine: String(rawBrief.theLandmine || rawBrief.the_landmine || '').trim(),
    recommendedVoucherPrefix: rawBrief.recommendedVoucherPrefix ? String(rawBrief.recommendedVoucherPrefix).trim() : undefined,
  };

  const rawPackages = Array.isArray(r.packages) ? r.packages : [];
  if (rawPackages.length === 0 && !creatorExecutiveBrief.whoTheyAre && !creatorExecutiveBrief.theSuperpower) {
    return undefined;
  }

  const validPackageIds = ['reach', 'paid_creative', 'conversion', 'content_library', 'launch'] as const;

  const packages: BespokeStrategyPackage[] = rawPackages.map((pkgRaw: any, idx: number) => {
    const pkg = (typeof pkgRaw === 'object' && pkgRaw !== null ? pkgRaw : {}) as Record<string, any>;
    const defaultId = validPackageIds[idx % validPackageIds.length];
    const rawId = String(pkg.packageId || pkg.id || defaultId).toLowerCase();
    const packageId = (validPackageIds.includes(rawId as any) ? rawId : defaultId) as typeof validPackageIds[number];

    const packageTags: Record<string, BespokeStrategyPackage['packageTag']> = {
      reach: '[ Reach ]',
      paid_creative: '[ Paid Creative ]',
      conversion: '[ Conversion ]',
      content_library: '[ Content Library ]',
      launch: '[ Full-Funnel ]',
    };

    const deliverables: BespokeDeliverableItem[] = (Array.isArray(pkg.deliverables) ? pkg.deliverables : []).map((dRaw: any, dIdx: number) => {
      const d = (typeof dRaw === 'object' && dRaw !== null ? dRaw : {}) as Record<string, any>;
      return {
        id: String(d.id || `d_${dIdx + 1}`),
        phase: String(d.phase || 'Campaign Deliverable'),
        platform: (['youtube', 'instagram', 'tiktok', 'cross_platform'].includes(d.platform) ? d.platform : 'cross_platform'),
        formatKey: String(d.formatKey || d.format_key || d.format || 'ig_reel') as any,
        quantity: typeof d.quantity === 'number' && d.quantity > 0 ? d.quantity : 1,
        title: String(d.title || 'Deliverable').replace(/^\d+x\s*/i, '').trim(),
        strategicDetail: String(d.strategicDetail || d.strategic_detail || d.description || ''),
      };
    });

    const entitlements: StrategicCommercialEntitlement[] = (Array.isArray(pkg.entitlements) ? pkg.entitlements : []).map((eRaw: any) => {
      const e = (typeof eRaw === 'object' && eRaw !== null ? eRaw : {}) as Record<string, any>;
      return {
        type: e.type || 'profile_placement',
        title: String(e.title || 'Commercial Entitlement'),
        detail: String(e.detail || ''),
      };
    });

    const adConcepts: BespokeAdConcept[] | undefined = Array.isArray(pkg.adConcepts)
      ? pkg.adConcepts.map((cRaw: any) => {
          const c = (typeof cRaw === 'object' && cRaw !== null ? cRaw : {}) as Record<string, any>;
          return {
            conceptName: String(c.conceptName || c.concept_name || 'Ad Concept'),
            hookVerbatim: String(c.hookVerbatim || c.hook_verbatim || c.openingHookScript || ''),
            angleSummary: String(c.angleSummary || c.angle_summary || ''),
            suggestedPlatform: (['youtube', 'instagram', 'tiktok'].includes(c.suggestedPlatform) ? c.suggestedPlatform : 'instagram'),
            visualDirection: c.visualDirection ? String(c.visualDirection) : undefined,
          };
        })
      : undefined;

    const concreteAssets: ConcreteAssetDeliverable[] | undefined = Array.isArray(pkg.concreteAssets)
      ? pkg.concreteAssets.map((aRaw: any) => {
          if (typeof aRaw === 'string') return { assetType: 'digital_asset', specification: aRaw };
          const a = (typeof aRaw === 'object' && aRaw !== null ? aRaw : {}) as Record<string, any>;
          return {
            assetType: String(a.assetType || a.asset_type || 'digital_asset'),
            specification: String(a.specification || a.spec || ''),
          };
        })
      : undefined;

    const rawGuidelines = Array.isArray(pkg.collaborationGuidelines) ? pkg.collaborationGuidelines : [];
    const collaborationGuidelines: [CriticalCollaborationGuideline, CriticalCollaborationGuideline, CriticalCollaborationGuideline] = [
      {
        ruleNumber: 1,
        ruleTitle: String(rawGuidelines[0]?.ruleTitle || 'Creative Freedom & Authentic Delivery'),
        directive: String(rawGuidelines[0]?.directive || 'Creator must retain natural voice and creative framing.'),
        commercialRisk: String(rawGuidelines[0]?.commercialRisk || 'Forced scripts alienate audience and hurt engagement.'),
      },
      {
        ruleNumber: 2,
        ruleTitle: String(rawGuidelines[1]?.ruleTitle || 'Objective Balance & Honesty'),
        directive: String(rawGuidelines[1]?.directive || 'Allow creator to mention minor trade-offs to protect buyer trust.'),
        commercialRisk: String(rawGuidelines[1]?.commercialRisk || 'Unrealistic claims destroy audience purchase validation.'),
      },
      {
        ruleNumber: 3,
        ruleTitle: String(rawGuidelines[2]?.ruleTitle || 'Production Lead Time & Seeding'),
        directive: String(rawGuidelines[2]?.directive || 'Provide product seeding 5-7 days before review shoot.'),
        commercialRisk: String(rawGuidelines[2]?.commercialRisk || 'Rushed turnaround results in superficial coverage.'),
      },
    ];

    return {
      packageId,
      packageName: String(pkg.packageName || pkg.title || `${packageTags[packageId]} Strategy`),
      packageTag: packageTags[packageId],
      campaignObjective: String(pkg.campaignObjective || pkg.objective || ''),
      strategicRationale: String(pkg.strategicRationale || pkg.strategicAngle || ''),
      isRecommended: Boolean(pkg.isRecommended || packageId === 'paid_creative'),
      deliverables,
      entitlements,
      adConcepts,
      concreteAssets,
      collaborationGuidelines,
    };
  });

  const collaborationRules = Array.isArray(r.collaborationRules)
    ? r.collaborationRules.map((rule: any) => String(rule))
    : undefined;

  return {
    creatorExecutiveBrief,
    packages,
    collaborationRules,
  };
}

/**
 * Robust Normalizer that maps both snake_case, camelCase, and grouped Gemini JSON structures
 * into the strict CompleteCreatorIntelligence interface.
 */
export function normalizeCompleteIntelligence(raw: unknown, input?: MultiPlatformCreatorInput): CompleteCreatorIntelligence {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, any>;

  const profile = (
    (r.profile && typeof r.profile === 'object' ? r.profile : null) ||
    (r.creatorProfile && typeof r.creatorProfile === 'object' ? r.creatorProfile : null) ||
    (r.profileAndIdentity && typeof r.profileAndIdentity === 'object' ? r.profileAndIdentity : null) ||
    r
  ) as Record<string, any>;

  const geography = (
    (r.geography && typeof r.geography === 'object' ? r.geography : null) ||
    (r.geographyIntelligence && typeof r.geographyIntelligence === 'object' ? r.geographyIntelligence : null) ||
    r
  ) as Record<string, any>;

  const audience = (
    (r.audience && typeof r.audience === 'object' ? r.audience : null) ||
    (r.audienceIntelligence && typeof r.audienceIntelligence === 'object' ? r.audienceIntelligence : null) ||
    (r.audiencePersona && typeof r.audiencePersona === 'object' ? r.audiencePersona : null) ||
    r
  ) as Record<string, any>;

  const contentAndFormat = (
    (r.contentAndFormat && typeof r.contentAndFormat === 'object' ? r.contentAndFormat : null) ||
    (r.contentIntelligence && typeof r.contentIntelligence === 'object' ? r.contentIntelligence : null) ||
    {}
  ) as Record<string, any>;

  const content = (
    (r.content && typeof r.content === 'object' ? r.content : null) ||
    (r.contentIntelligence && typeof r.contentIntelligence === 'object' ? r.contentIntelligence : null) ||
    contentAndFormat ||
    r
  ) as Record<string, any>;

  const performanceIntelligence = (
    (r.performanceIntelligence && typeof r.performanceIntelligence === 'object' ? r.performanceIntelligence : null) ||
    (r.performance && typeof r.performance === 'object' ? r.performance : null) ||
    (r.performanceAndEngagement && typeof r.performanceAndEngagement === 'object' ? r.performanceAndEngagement : null) ||
    {}
  ) as Record<string, any>;

  const engagementIntelligence = (
    (r.engagementIntelligence && typeof r.engagementIntelligence === 'object' ? r.engagementIntelligence : null) ||
    (performanceIntelligence.engagementIntelligence && typeof performanceIntelligence.engagementIntelligence === 'object' ? performanceIntelligence.engagementIntelligence : null) ||
    (r.engagement && typeof r.engagement === 'object' ? r.engagement : null) ||
    {}
  ) as Record<string, any>;

  const commercialAndBrandFit = (
    (r.commercialAndBrandFit && typeof r.commercialAndBrandFit === 'object' ? r.commercialAndBrandFit : null) ||
    {}
  ) as Record<string, any>;

  const commercialIntelligence = (
    (r.commercialIntelligence && typeof r.commercialIntelligence === 'object' ? r.commercialIntelligence : null) ||
    commercialAndBrandFit ||
    (r.commercial && typeof r.commercial === 'object' ? r.commercial : null) ||
    {}
  ) as Record<string, any>;

  const brandFit = (
    (r.brandFit && typeof r.brandFit === 'object' ? r.brandFit : null) ||
    (commercialIntelligence.brandFit && typeof commercialIntelligence.brandFit === 'object' ? commercialIntelligence.brandFit : null) ||
    (commercialAndBrandFit.brandFit && typeof commercialAndBrandFit.brandFit === 'object' ? commercialAndBrandFit.brandFit : null) ||
    {}
  ) as Record<string, any>;

  const brandSafety = (
    (r.brandSafety && typeof r.brandSafety === 'object' ? r.brandSafety : null) ||
    (commercialIntelligence.brandSafety && typeof commercialIntelligence.brandSafety === 'object' ? commercialIntelligence.brandSafety : null) ||
    (commercialAndBrandFit.brandSafety && typeof commercialAndBrandFit.brandSafety === 'object' ? commercialAndBrandFit.brandSafety : null) ||
    {}
  ) as Record<string, any>;

  const strategyAndRecommendations = (
    (r.strategyAndRecommendations && typeof r.strategyAndRecommendations === 'object' ? r.strategyAndRecommendations : null) ||
    (r.strategicRecommendations && typeof r.strategicRecommendations === 'object' ? r.strategicRecommendations : null) ||
    (r.strategy && typeof r.strategy === 'object' ? r.strategy : null) ||
    r
  ) as Record<string, any>;

  const strengths = (
    Array.isArray(r.strengths) ? r.strengths :
    Array.isArray(strategyAndRecommendations.strengths) ? strategyAndRecommendations.strengths :
    []
  ) as Array<{ area: string; description: string }>;

  const considerations = (
    Array.isArray(r.considerations) ? r.considerations :
    Array.isArray(strategyAndRecommendations.considerations) ? strategyAndRecommendations.considerations :
    []
  ) as Array<{ area: string; description: string }>;

  const partnershipRecommendations = (
    Array.isArray(r.partnershipRecommendations) ? r.partnershipRecommendations :
    Array.isArray(strategyAndRecommendations.partnershipRecommendations) ? strategyAndRecommendations.partnershipRecommendations :
    []
  ) as Array<{ campaign: string; fit: string; reason: string }>;

  const summaries = (
    (r.summary && typeof r.summary === 'object' ? r.summary : null) ||
    (r.summaries && typeof r.summaries === 'object' ? r.summaries : null) ||
    (r.executiveSummaries && typeof r.executiveSummaries === 'object' ? r.executiveSummaries : null) ||
    r
  ) as Record<string, any>;

  const metaAndEvidence = (
    (r.metaAndEvidence && typeof r.metaAndEvidence === 'object' ? r.metaAndEvidence : null) ||
    (r.metaIntelligence && typeof r.metaIntelligence === 'object' ? r.metaIntelligence : null) ||
    (r.metadata && typeof r.metadata === 'object' ? r.metadata : null) ||
    r
  ) as Record<string, any>;

  const confidence = (
    (r.confidence && typeof r.confidence === 'object' ? r.confidence : null) ||
    (metaAndEvidence.confidence && typeof metaAndEvidence.confidence === 'object' ? metaAndEvidence.confidence : null) ||
    {}
  ) as Record<string, any>;

  const evidence = (
    (r.evidence && typeof r.evidence === 'object' ? r.evidence : null) ||
    (metaAndEvidence.evidence && typeof metaAndEvidence.evidence === 'object' ? metaAndEvidence.evidence : null) ||
    {}
  ) as Record<string, any>;

  const uncertainties = (
    Array.isArray(r.uncertainties) ? r.uncertainties :
    Array.isArray(metaAndEvidence.uncertainties) ? metaAndEvidence.uncertainties :
    []
  ) as string[];

  // 1. Resilient Sub-Niche Resolution from raw Gemini response
  const subNicheRaw =
    profile.subNiche ||
    profile.sub_niche ||
    profile.subNicheId ||
    r.subNiche ||
    r.sub_niche ||
    r.subNicheId;
  let resolvedSubNiche: typeof SUB_NICHES[0] | undefined = undefined;

  if (subNicheRaw) {
    const rawSubId =
      typeof subNicheRaw === 'object' && subNicheRaw !== null
        ? Number(subNicheRaw.id)
        : typeof subNicheRaw === 'number'
        ? subNicheRaw
        : !isNaN(Number(subNicheRaw))
        ? Number(subNicheRaw)
        : NaN;

    const rawSubName =
      typeof subNicheRaw === 'object' && subNicheRaw !== null
        ? String(subNicheRaw.name || '').trim().toLowerCase()
        : typeof subNicheRaw === 'string'
        ? subNicheRaw.trim().toLowerCase()
        : '';

    if (!isNaN(rawSubId) && rawSubId > 0) {
      resolvedSubNiche = SUB_NICHES.find((s) => s.id === rawSubId);
    }

    if (!resolvedSubNiche && rawSubName) {
      resolvedSubNiche =
        SUB_NICHES.find((s) => s.name.toLowerCase() === rawSubName) ||
        SUB_NICHES.find((s) => s.name.toLowerCase().includes(rawSubName) || rawSubName.includes(s.name.toLowerCase())) ||
        SUB_NICHES.find((s) => s.keywords.some((kw) => rawSubName.includes(kw.toLowerCase())));
    }
  }

  // 2. Resilient Primary Niche Resolution from raw Gemini response
  const primaryNicheRaw =
    profile.primaryNiche ||
    profile.primary_niche ||
    profile.primaryNicheId ||
    profile.niche ||
    r.primaryNiche ||
    r.primary_niche ||
    r.primaryNicheId ||
    r.niche;
  let resolvedPrimary: typeof PRIMARY_NICHES[0] | undefined = undefined;

  if (primaryNicheRaw) {
    const rawId =
      typeof primaryNicheRaw === 'object' && primaryNicheRaw !== null
        ? Number(primaryNicheRaw.id)
        : typeof primaryNicheRaw === 'number'
        ? primaryNicheRaw
        : !isNaN(Number(primaryNicheRaw))
        ? Number(primaryNicheRaw)
        : NaN;

    const rawName =
      typeof primaryNicheRaw === 'object' && primaryNicheRaw !== null
        ? String(primaryNicheRaw.name || '').trim().toLowerCase()
        : typeof primaryNicheRaw === 'string'
        ? primaryNicheRaw.trim().toLowerCase()
        : '';

    if (!isNaN(rawId) && rawId > 0) {
      resolvedPrimary = PRIMARY_NICHES.find((p) => p.id === rawId);
    }

    if (!resolvedPrimary && rawName) {
      resolvedPrimary =
        PRIMARY_NICHES.find((p) => p.name.toLowerCase() === rawName) ||
        PRIMARY_NICHES.find((p) => p.name.toLowerCase().includes(rawName) || rawName.includes(p.name.toLowerCase())) ||
        PRIMARY_NICHES.find((p) => {
          const cleanP = p.name.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/);
          const cleanRaw = rawName.replace(/[^a-z0-9 ]/g, ' ').split(/\s+/);
          return cleanRaw.some((token) => token.length >= 4 && cleanP.some((pt) => pt.startsWith(token) || token.startsWith(pt)));
        });
    }
  }

  // If primary niche wasn't resolved directly, but sub-niche was, infer primary from sub-niche
  if (!resolvedPrimary && resolvedSubNiche) {
    resolvedPrimary = PRIMARY_NICHES.find((p) => p.id === resolvedSubNiche!.primaryNicheId);
  }

  // If still not resolved, check text content signals (creatorType, microNiches, bio)
  if (!resolvedPrimary) {
    const combinedSignals = [
      profile.creatorType,
      profile.profilePositioning,
      Array.isArray(profile.microNiches) ? profile.microNiches.join(' ') : '',
      profile.creatorDescription,
    ].filter(Boolean).join(' ').toLowerCase();

    if (combinedSignals) {
      const matchedSub = SUB_NICHES.find((s) => s.keywords.some((kw) => combinedSignals.includes(kw.toLowerCase())));
      if (matchedSub) {
        resolvedSubNiche = matchedSub;
        resolvedPrimary = PRIMARY_NICHES.find((p) => p.id === matchedSub.primaryNicheId);
      }
    }
  }

  // Default fallback: ID 8 (Lifestyle & Daily Vlogs, 1.00x)
  const primaryDef = resolvedPrimary || PRIMARY_NICHES.find((p) => p.id === 8) || PRIMARY_NICHES[7];

  // If sub-niche is missing or belongs to a different primary niche, ensure sub-niche matches primary
  if (!resolvedSubNiche || resolvedSubNiche.primaryNicheId !== primaryDef.id) {
    const primarySubs = SUB_NICHES.filter((s) => s.primaryNicheId === primaryDef.id);
    const combinedSignals = [
      profile.creatorType,
      Array.isArray(profile.microNiches) ? profile.microNiches.join(' ') : '',
      profile.profilePositioning,
    ].filter(Boolean).join(' ').toLowerCase();

    resolvedSubNiche =
      primarySubs.find((s) => s.keywords.some((kw) => combinedSignals.includes(kw.toLowerCase()))) ||
      primarySubs[0];
  }

  // Secondary niches resolution
  const secondaryList: Array<{ id: number; name: string; multiplier: number }> = [];
  if (Array.isArray(profile.secondaryNiches)) {
    for (const s of profile.secondaryNiches) {
      const sId = typeof s === 'object' && s !== null ? Number(s.id) : Number(s);
      const sName = typeof s === 'object' && s !== null ? String(s.name || '').toLowerCase() : typeof s === 'string' ? s.toLowerCase() : '';
      const match =
        (!isNaN(sId) && PRIMARY_NICHES.find((p) => p.id === sId)) ||
        (sName && PRIMARY_NICHES.find((p) => p.name.toLowerCase() === sName || p.name.toLowerCase().includes(sName)));
      if (match && match.id !== primaryDef.id && !secondaryList.some((existing) => existing.id === match.id) && secondaryList.length < 3) {
        secondaryList.push({ id: match.id, name: match.name, multiplier: match.multiplier });
      }
    }
  }
  if (secondaryList.length < 2) {
    for (const p of PRIMARY_NICHES) {
      if (p.id !== primaryDef.id && !secondaryList.some((s) => s.id === p.id)) {
        secondaryList.push({ id: p.id, name: p.name, multiplier: p.multiplier });
        if (secondaryList.length === 2) break;
      }
    }
  }

  const isInvalidCountry = (val: string | null | undefined): boolean => {
    if (!val) return true;
    const v = val.trim().toLowerCase();
    return (
      v === 'global' ||
      v === 'worldwide' ||
      v === 'international' ||
      v === 'none' ||
      v === 'unknown' ||
      v === 'null' ||
      v === 'n/a'
    );
  };

  let rawPrimaryMarket = (audience.primaryMarket || geography.countryName || '').trim();
  let secondaryMarketsList: string[] = Array.isArray(audience.secondaryMarkets)
    ? audience.secondaryMarkets.map((s: any) => String(s).trim()).filter(Boolean)
    : [];

  // If primaryMarket contains composite strings (e.g. "Pakistan & South Asian Global Diaspora (UAE, UK, US)")
  if (
    rawPrimaryMarket.includes('&') ||
    rawPrimaryMarket.includes('/') ||
    rawPrimaryMarket.toLowerCase().includes('diaspora') ||
    rawPrimaryMarket.includes('(')
  ) {
    const splitParts = rawPrimaryMarket.split(/\s*&\s*|\s*\/\s*|\s*,\s*(?=[A-Z])/);
    if (splitParts.length > 1) {
      rawPrimaryMarket = splitParts[0].replace(/\s*\(.*?\)/g, '').trim();
      for (let i = 1; i < splitParts.length; i++) {
        const sec = splitParts[i].trim();
        if (sec && !secondaryMarketsList.includes(sec)) {
          secondaryMarketsList.push(sec);
        }
      }
    } else if (rawPrimaryMarket.includes('(')) {
      const match = rawPrimaryMarket.match(/^([^(]+)\s*\((.*?)\)$/);
      if (match) {
        rawPrimaryMarket = match[1].trim();
        const sec = match[2].trim();
        if (sec && !secondaryMarketsList.includes(sec)) {
          secondaryMarketsList.push(sec);
        }
      }
    }
  }

  // If rawPrimaryMarket is invalid ("Global", "Worldwide", etc.), resolve from available signals:
  if (isInvalidCountry(rawPrimaryMarket)) {
    if (!isInvalidCountry(geography.countryName)) {
      rawPrimaryMarket = geography.countryName;
    } else if (geography.countryCode && REGIONAL_CONFIG[geography.countryCode.toUpperCase() as RegionCode]) {
      rawPrimaryMarket = REGIONAL_CONFIG[geography.countryCode.toUpperCase() as RegionCode].name;
    } else if (input?.youtube?.country && REGIONAL_CONFIG[input.youtube.country.toUpperCase() as RegionCode]) {
      rawPrimaryMarket = REGIONAL_CONFIG[input.youtube.country.toUpperCase() as RegionCode].name;
    } else if (input?.reportedCountry && !isInvalidCountry(input.reportedCountry)) {
      rawPrimaryMarket = REGIONAL_CONFIG[input.reportedCountry.toUpperCase() as RegionCode]?.name || input.reportedCountry;
    } else {
      // Contextual text analysis fallback
      const textCorpus = [
        input?.creatorName,
        input?.youtube?.title,
        input?.youtube?.description,
        input?.instagram?.biography,
        input?.instagram?.city,
        input?.instagram?.businessAddress,
        ...(input?.youtube?.recentTitles || []),
        ...(input?.instagram?.recentCaptions || []),
      ].join(' ').toLowerCase();

      if (textCorpus.includes('pakistan') || textCorpus.includes('karachi') || textCorpus.includes('lahore') || textCorpus.includes('islamabad') || textCorpus.includes('pkr') || textCorpus.includes('pakistani')) {
        rawPrimaryMarket = 'Pakistan';
      } else if (textCorpus.includes('india') || textCorpus.includes('mumbai') || textCorpus.includes('delhi') || textCorpus.includes('bengaluru') || textCorpus.includes('inr') || textCorpus.includes('indian')) {
        rawPrimaryMarket = 'India';
      } else if (textCorpus.includes('london') || textCorpus.includes('manchester') || textCorpus.includes('uk') || textCorpus.includes('britain') || textCorpus.includes('england')) {
        rawPrimaryMarket = 'United Kingdom';
      } else if (textCorpus.includes('canada') || textCorpus.includes('toronto') || textCorpus.includes('vancouver')) {
        rawPrimaryMarket = 'Canada';
      } else if (textCorpus.includes('dubai') || textCorpus.includes('uae') || textCorpus.includes('abu dhabi')) {
        rawPrimaryMarket = 'United Arab Emirates';
      } else if (textCorpus.includes('australia') || textCorpus.includes('sydney') || textCorpus.includes('melbourne')) {
        rawPrimaryMarket = 'Australia';
      } else {
        rawPrimaryMarket = 'United States';
      }
    }
  }

  // Ensure geography matches the resolved sovereign country
  const resolvedCountryName = isInvalidCountry(geography.countryName) ? rawPrimaryMarket : geography.countryName;
  let resolvedCountryCode = geography.countryCode || null;
  if (!resolvedCountryCode) {
    const foundEntry = Object.entries(REGIONAL_CONFIG).find(([_, cfg]) => cfg.name.toLowerCase() === rawPrimaryMarket.toLowerCase());
    if (foundEntry) {
      resolvedCountryCode = foundEntry[0];
    }
  }

  return {
    profile: {
      creatorType: profile.creatorType || 'Content Creator',
      profilePositioning: profile.profilePositioning || '',
      primaryNiche: {
        id: primaryDef.id,
        name: primaryDef.name,
        multiplier: primaryDef.multiplier,
      },
      subNiche: resolvedSubNiche
        ? {
            id: resolvedSubNiche.id,
            name: resolvedSubNiche.name,
            multiplier: resolvedSubNiche.multiplier,
          }
        : undefined,
      secondaryNiches: secondaryList,
      isLuxuryOrHighEnd: Boolean(profile.isLuxuryOrHighEnd),
      microNiches: Array.isArray(profile.microNiches) ? profile.microNiches : [],
      creatorDescription: profile.creatorDescription || '',
      confidence: typeof profile.confidence === 'number' ? profile.confidence : 0.95,
    },
    geography: {
      countryCode: resolvedCountryCode,
      countryName: resolvedCountryName,
      city: geography.city || null,
      region: geography.region || null,
      confidence: typeof geography.confidence === 'number' ? geography.confidence : 0.8,
      evidence: Array.isArray(geography.evidence) ? geography.evidence : [],
    },
    audience: {
      likelyAgeRange: audience.likelyAgeRange || '18-34',
      genderSkew: audience.genderSkew || 'Balanced',
      primaryMarket: rawPrimaryMarket,
      secondaryMarkets: secondaryMarketsList,
      interests: Array.isArray(audience.interests) ? audience.interests : [],
      purchaseIntent: audience.purchaseIntent || 'Moderate',
      audienceIntent: Array.isArray(audience.audienceIntent) ? audience.audienceIntent : [],
      profile: audience.profileDescription || audience.profile || '',
      confidence: typeof audience.confidence === 'number' ? audience.confidence : 0.85,
    },
    content: {
      themes: Array.isArray(content.themes) ? content.themes : Array.isArray(contentAndFormat.themes) ? contentAndFormat.themes : [],
      dominantFormat: content.dominantFormat || contentAndFormat.dominantFormat || 'Video',
      formats: Array.isArray(content.formats) ? content.formats : Array.isArray(contentAndFormat.formats) ? contentAndFormat.formats : [],
      style: Array.isArray(content.style) ? content.style : Array.isArray(contentAndFormat.style) ? contentAndFormat.style : [],
      tone: Array.isArray(content.tone) ? content.tone : Array.isArray(contentAndFormat.tone) ? contentAndFormat.tone : [],
      productionLevel: content.productionLevel || contentAndFormat.productionLevel || 'High',
      contentConsistency: content.contentConsistency || contentAndFormat.contentConsistency || 'High',
      promotionalContentLevel: content.promotionalContentLevel || contentAndFormat.promotionalContentLevel || 'Moderate',
    },
    contentThemes: (
      (Array.isArray(r.contentThemes) && r.contentThemes.length ? r.contentThemes : null) ||
      (Array.isArray(content.contentThemes) && content.contentThemes.length ? content.contentThemes : null) ||
      (Array.isArray(contentAndFormat.contentThemes) && contentAndFormat.contentThemes.length ? contentAndFormat.contentThemes : null) ||
      []
    ),
    contentFormatIntelligence:
      r.contentFormatIntelligence ||
      content.contentFormatIntelligence ||
      contentAndFormat.contentFormatIntelligence || {
        primaryFormat: 'Video',
        strongestFormatForCreator: 'Video',
        formatDescription: '',
      },
    performanceIntelligence: {
      reachLevel: performanceIntelligence.reachLevel || 'Strong',
      engagementQuality: performanceIntelligence.engagementQuality || 'High',
      audienceResponse: performanceIntelligence.audienceResponse || '',
      performancePattern: performanceIntelligence.performancePattern || '',
      summary: performanceIntelligence.summary || '',
    },
    engagementIntelligence: {
      conversationLevel: engagementIntelligence.conversationLevel || 'High',
      sharingPotential: engagementIntelligence.sharingPotential || 'High',
      purchaseIntentSignals: engagementIntelligence.purchaseIntentSignals || '',
      audienceBehavior: Array.isArray(engagementIntelligence.audienceBehavior) ? engagementIntelligence.audienceBehavior : [],
    },
    commercialIntelligence: {
      commercialIntent: commercialIntelligence.commercialIntent || 'High',
      brandCollaborationLikelihood: commercialIntelligence.brandCollaborationLikelihood || 'High',
      affiliateSignals: Boolean(commercialIntelligence.affiliateSignals),
      productPromotionLevel: commercialIntelligence.productPromotionLevel || 'Moderate',
      sponsorshipSignals: Array.isArray(commercialIntelligence.sponsorshipSignals) ? commercialIntelligence.sponsorshipSignals : [],
    },
    brandFit: {
      bestFitCategories: Array.isArray(brandFit.bestFitCategories) ? brandFit.bestFitCategories : [],
      campaignTypes: Array.isArray(brandFit.campaignTypes) ? brandFit.campaignTypes : [],
      strongestPartnershipAngle: brandFit.strongestPartnershipAngle || '',
      brandSuitability: brandFit.brandSuitability || 'High',
    },
    brandSafety: {
      overallRisk: brandSafety.overallRisk || 'Low',
      observedRiskSignals: Array.isArray(brandSafety.observedRiskSignals) ? brandSafety.observedRiskSignals : [],
      reviewRecommended: Boolean(brandSafety.reviewRecommended),
    },
    strengths,
    considerations,
    partnershipRecommendations,
    summary: {
      oneLine: summaries.oneLine || r.oneLine || '',
      brandSummary: summaries.brandSummary || r.brandSummary || '',
      detailedSummary: summaries.detailedSummary || r.detailedSummary || '',
    },
    confidence: {
      niche: typeof confidence.niche === 'number' ? confidence.niche : 0.95,
      country: typeof confidence.country === 'number' ? confidence.country : 0.8,
      audience: typeof confidence.audience === 'number' ? confidence.audience : 0.85,
      brandFit: typeof confidence.brandFit === 'number' ? confidence.brandFit : 0.9,
    },
    evidence: {
      classification: Array.isArray(evidence.classification) ? evidence.classification : [],
      geography: Array.isArray(evidence.geography) ? evidence.geography : [],
      audience: Array.isArray(evidence.audience) ? evidence.audience : [],
      commercial: Array.isArray(evidence.commercial) ? evidence.commercial : [],
    },
    uncertainties,
    omnichannelStrategySuite: normalizeOmnichannelSuite(
      r.omnichannelStrategySuite ||
      r.omnichannel_strategy_suite ||
      r.commercialPackagesSuite ||
      r.strategySuite
    ),
  };
}

/**
 * Unified Multi-Platform AI Enrichment (Maps CompleteCreatorIntelligence to CreatorAIClassification)
 */
export async function enrichMultiPlatformCreatorWithAI(
  input: MultiPlatformCreatorInput
): Promise<CreatorAIClassification> {
  const completeIntel = await generateCompleteCreatorIntelligence(input);

  return {
    primaryNiche: {
      id: completeIntel.profile.primaryNiche.id,
      name: completeIntel.profile.primaryNiche.name,
      multiplier: completeIntel.profile.primaryNiche.multiplier,
      confidence: completeIntel.profile.confidence || 0.95,
    },
    subNiche: completeIntel.profile.subNiche
      ? {
          id: completeIntel.profile.subNiche.id,
          name: completeIntel.profile.subNiche.name,
          multiplier: completeIntel.profile.subNiche.multiplier,
        }
      : undefined,
    secondaryNiches: completeIntel.profile.secondaryNiches,
    detectedCountry: completeIntel.geography?.countryCode || 'US',
    creatorSummary: completeIntel.summary?.brandSummary || completeIntel.summary?.oneLine || '',
  };
}

/**
 * Single-Platform Wrapper for Individual Scraper Pages
 */
export async function enrichCreatorWithAI(
  input: CreatorContextInput
): Promise<CreatorAIClassification> {
  const multiInput: MultiPlatformCreatorInput = {
    creatorName: input.name || input.username,
    primaryPlatform: input.platform,
    reportedCountry: input.reportedCountry,
  };

  if (input.platform === 'youtube') {
    multiInput.youtube = {
      handle: input.username,
      title: input.name || input.username,
      description: input.biography,
      country: input.reportedCountry,
      recentTitles: input.recentVideoTitles || input.recentCaptions,
      keywords: input.hashtags,
    };
  } else if (input.platform === 'instagram') {
    multiInput.instagram = {
      username: input.username,
      fullName: input.name,
      biography: input.biography,
      recentCaptions: input.recentCaptions || input.recentVideoTitles,
      hashtags: input.hashtags,
    };
  } else if (input.platform === 'tiktok') {
    multiInput.tiktok = {
      username: input.username,
      nickname: input.name,
      biography: input.biography,
      recentDescriptions: input.recentCaptions || input.recentVideoTitles,
    };
  }

  return enrichMultiPlatformCreatorWithAI(multiInput);
}
