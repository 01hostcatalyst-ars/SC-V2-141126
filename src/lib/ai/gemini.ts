import { PRIMARY_NICHES } from '../calculator/constants';
import { JWT } from 'google-auth-library';
import { CompleteCreatorIntelligence } from './types';
import { getRecentCreatorIntelligence, saveCreatorIntelligence } from './storage';

export * from './types';

export interface CreatorAIClassification {
  primaryNiche: {
    id: number;
    name: string;
    multiplier: number;
    confidence: number;
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
  const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL?.trim();
  const privateKeyRaw = process.env.GOOGLE_CLOUD_PRIVATE_KEY?.trim();
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID?.trim();

  if (!clientEmail || !privateKeyRaw || !projectId) {
    throw new Error(
      '[Gemini Vertex AI] Missing required Google Cloud environment variables: GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_CLIENT_EMAIL, or GOOGLE_CLOUD_PRIVATE_KEY.'
    );
  }

  // Use cached token if still valid for at least 5 minutes
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
  const auth = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const tokenRes = await auth.getAccessToken();
  if (!tokenRes?.token) {
    throw new Error('[Gemini Vertex AI] Failed to acquire Google Cloud OAuth access token from Service Account.');
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

  if (input.youtube) {
    const yt = input.youtube;
    const topics = yt.topicCategories?.length ? `YouTube Official Topics: ${yt.topicCategories.join(', ')}` : '';
    const keywords = yt.keywords?.length ? `Channel Keywords: ${yt.keywords.slice(0, 10).join(', ')}` : '';
    const titles = yt.recentTitles?.length ? `Recent Video Titles:\n    - ${yt.recentTitles.slice(0, 12).join('\n    - ')}` : '';
    const comments = yt.topComments?.length ? `Audience Sample Comments:\n    - "${yt.topComments.slice(0, 15).join('"\n    - "')}"` : '';

    platformDossiers.push(`  [YOUTUBE CHANNEL]
  - Channel Name: ${yt.title || 'Unknown'} (Handle: ${yt.handle || 'None'})
  - Description: ${yt.description || 'None'}
  - Official Country: ${yt.country || 'Unknown'}
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
  bypassCache = false
): Promise<CompleteCreatorIntelligence> {
  const rootHandle =
    input.youtube?.handle ||
    input.instagram?.username ||
    input.tiktok?.username ||
    input.creatorName ||
    'creator';

  // 1. Check 24-Hour PostgreSQL Cache First
  if (!bypassCache) {
    const cached = await getRecentCreatorIntelligence(rootHandle, 24);
    if (cached?.intelligence) {
      console.log(`[CreatorIntelligence Cache Hit] Returning 24h cached intelligence for @${rootHandle} (${cached.cacheAgeHours}h old).`);
      return cached.intelligence;
    }
  }

  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID?.trim();
  if (!projectId) {
    throw new Error('[Gemini Vertex AI] GOOGLE_CLOUD_PROJECT_ID is not configured in environment variables.');
  }

  const vertexToken = await getGoogleCloudAccessToken();

  const nicheOptions = PRIMARY_NICHES.map(
    (n) => `ID ${n.id}: "${n.name}" (Multiplier: ${n.multiplier}x) - ${n.description}`
  ).join('\n');

  const curatedDossier = buildCuratedPromptContext(input);

  const systemInstruction = `You are an elite influencer marketing economist, brand partnership director, and creator valuation analyst for SignCollab.
Your job is to analyze creator multi-platform data and output a strict, comprehensive 19-point Creator Intelligence dossier matching the exact required JSON schema.

Available Approved Niches (You MUST pick the Primary Niche and Secondary Niches ONLY from these exact IDs):
${nicheOptions}

Core Principles & Rules:
1. PROFILE & IDENTITY:
   - creatorType: Main professional classification (e.g. "Fashion & Style Creator", "Tech Hardware Reviewer", "Fitness Coach").
   - profilePositioning: How the creator positions their personal brand (e.g. "Affordable fashion & streetwear lookbooks").
   - primaryNiche: Approved niche object with exact { id, name, multiplier } from the list above.
   - secondaryNiches: 2-3 adjacent approved niche objects with { id, name, multiplier } from the list above.
   - microNiches: Array of 3-5 specific sub-specializations (e.g. ["Streetwear", "Capsule Wardrobes", "Thrift Flips"]).
   - creatorDescription: Short factual 1-2 sentence description.
   - confidence: Numerical score (0.0 to 1.0).

2. GEOGRAPHY INTELLIGENCE:
   - countryCode: 2-letter ISO code (e.g. "US", "GB", "PK", "IN", "CA", "AU", "AE") or null if signals are insufficient. Never force a country guess.
   - countryName, city, region, confidence, and specific evidence list.

3. AUDIENCE PERSONA (Inferred):
   - likelyAgeRange (e.g. "18-34"), genderSkew (e.g. "Female-skewed", "Male-skewed", "Balanced"). DO NOT invent fake demographic percentages like "64.2% female".
   - primaryMarket, interests[], purchaseIntent ("High" | "Moderate" | "Low"), audienceIntent[], profile explanation, confidence.

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
   - strengths: Array of 3 { area, description }.
   - considerations: Array of 2-3 { area, description }.
   - partnershipRecommendations: Array of 2-3 { campaign, fit: "Excellent" | "Good" | "Moderate", reason }.

8. 3-TIER EXECUTIVE SUMMARIES:
   - oneLine: Punchy 1-sentence summary.
   - brandSummary: 2-sentence executive summary tailored for brand sponsor decks.
   - detailedSummary: 3-4 sentence comprehensive breakdown of reach, persona, style, and commercial upside.

9. META, EVIDENCE & UNCERTAINTIES:
   - confidence: { niche, country, audience, brandFit }.
   - evidence: { classification[], geography[], audience[], commercial[] }.
   - uncertainties: Array of explicit transparency notes (e.g. "Audience demographics inferred from content signals; not verified via private analytics").

Return ONLY clean raw JSON matching this schema.`;

  const userPrompt = `Creator Omnichannel Footprint Analysis:
Creator Name: ${input.creatorName || rootHandle}
Primary Evaluation Platform: ${input.primaryPlatform || 'Cross-Platform'}

${curatedDossier}

Generate the Complete 19-Point Creator Intelligence Dossier JSON.`;

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

      const parsed = JSON.parse(candidateText) as CompleteCreatorIntelligence;

      // Validate Primary Niche against approved constants
      const primaryDef =
        PRIMARY_NICHES.find((p) => p.id === parsed.profile?.primaryNiche?.id) ||
        PRIMARY_NICHES.find((p) => p.name.toLowerCase() === (parsed.profile?.primaryNiche?.name || '').toLowerCase()) ||
        PRIMARY_NICHES[7];

      parsed.profile.primaryNiche = {
        id: primaryDef.id,
        name: primaryDef.name,
        multiplier: primaryDef.multiplier,
      };

      // Validate Secondary Niches
      const secondaryList: Array<{ id: number; name: string; multiplier: number }> = [];
      if (Array.isArray(parsed.profile?.secondaryNiches)) {
        for (const s of parsed.profile.secondaryNiches) {
          const match =
            PRIMARY_NICHES.find((p) => p.id === s.id) ||
            PRIMARY_NICHES.find((p) => p.name.toLowerCase() === (s.name || '').toLowerCase());
          if (match && match.id !== primaryDef.id && secondaryList.length < 3) {
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
      parsed.profile.secondaryNiches = secondaryList;

      // Persist to PostgreSQL with 24-hour cache timestamp
      try {
        await saveCreatorIntelligence({
          creatorHandle: rootHandle,
          creatorName: input.creatorName || rootHandle,
          primaryPlatform: input.primaryPlatform || 'instagram',
          intelligence: parsed,
          youtubeScrapeId: input.youtubeScrapeId,
          instagramScrapeId: input.instagramScrapeId,
          tiktokScrapeId: input.tiktokScrapeId,
          modelUsed: model,
        });
      } catch (saveErr) {
        console.warn('[CreatorIntelligence Database Save Warning]:', saveErr);
      }

      return parsed;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[Gemini Vertex AI] Error on ${model}:`, errMsg);
      modelErrors.push(`[${model}] Exception: ${errMsg}`);
    }
  }

  throw new Error(`[Gemini Vertex AI Failure] All models failed. Details:\n${modelErrors.join('\n')}`);
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
