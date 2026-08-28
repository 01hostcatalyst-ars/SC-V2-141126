import { PRIMARY_NICHES } from '../calculator/constants';
import { JWT } from 'google-auth-library';

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
  youtube?: {
    handle?: string;
    title?: string;
    description?: string;
    country?: string;
    topicCategories?: string[];
    keywords?: string[];
    recentTitles?: string[];
    subscriberCount?: number;
    avgViews?: number;
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
    followerCount?: number;
    avgLikes?: number;
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
 * Retrieves historical AI classification from the database as a safe fallback
 */
async function getHistoricalAIEnrichmentFromDB(
  platform: 'youtube' | 'instagram' | 'tiktok',
  username: string
): Promise<CreatorAIClassification | null> {
  const cleanUsername = username.trim().replace(/^@/, '');
  if (!cleanUsername) return null;

  try {
    const { prisma } = await import('@/lib/prisma');

    if (platform === 'youtube') {
      const record = await prisma.youTubeScrape.findFirst({
        where: {
          OR: [
            { handle: `@${cleanUsername}` },
            { handle: cleanUsername },
            { customUrl: `@${cleanUsername}` },
            { youtubeChannelId: cleanUsername },
            { title: { equals: cleanUsername, mode: 'insensitive' } },
          ],
          primaryNicheId: { not: null },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (record?.primaryNicheId) {
        const primaryDef = PRIMARY_NICHES.find((p) => p.id === record.primaryNicheId) || PRIMARY_NICHES[7];
        const secondaryList: Array<{ id: number; name: string; multiplier: number }> = Array.isArray(record.secondaryNiches)
          ? (record.secondaryNiches as Array<{ id: number; name: string; multiplier: number }>)
          : [];

        return {
          primaryNiche: {
            id: primaryDef.id,
            name: record.primaryNicheName || primaryDef.name,
            multiplier: primaryDef.multiplier,
            confidence: 0.95,
          },
          secondaryNiches: secondaryList,
          detectedCountry: record.detectedCountry || 'US',
          creatorSummary: record.aiCreatorSummary || `${primaryDef.name} creator sharing high-engagement content on YouTube.`,
        };
      }
    } else if (platform === 'instagram') {
      const record = await prisma.instagramScrape.findFirst({
        where: {
          instagramUsername: { equals: cleanUsername, mode: 'insensitive' },
          primaryNicheId: { not: null },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (record?.primaryNicheId) {
        const primaryDef = PRIMARY_NICHES.find((p) => p.id === record.primaryNicheId) || PRIMARY_NICHES[7];
        const secondaryList: Array<{ id: number; name: string; multiplier: number }> = Array.isArray(record.secondaryNiches)
          ? (record.secondaryNiches as Array<{ id: number; name: string; multiplier: number }>)
          : [];

        return {
          primaryNiche: {
            id: primaryDef.id,
            name: record.primaryNicheName || primaryDef.name,
            multiplier: primaryDef.multiplier,
            confidence: 0.95,
          },
          secondaryNiches: secondaryList,
          detectedCountry: record.detectedCountry || 'US',
          creatorSummary: record.aiCreatorSummary || `${primaryDef.name} creator sharing high-engagement content on Instagram.`,
        };
      }
    } else if (platform === 'tiktok') {
      const record = await prisma.tikTokScrape.findFirst({
        where: {
          tiktokUsername: { equals: cleanUsername, mode: 'insensitive' },
          primaryNicheId: { not: null },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (record?.primaryNicheId) {
        const primaryDef = PRIMARY_NICHES.find((p) => p.id === record.primaryNicheId) || PRIMARY_NICHES[7];
        const secondaryList: Array<{ id: number; name: string; multiplier: number }> = Array.isArray(record.secondaryNiches)
          ? (record.secondaryNiches as Array<{ id: number; name: string; multiplier: number }>)
          : [];

        return {
          primaryNiche: {
            id: primaryDef.id,
            name: record.primaryNicheName || primaryDef.name,
            multiplier: primaryDef.multiplier,
            confidence: 0.95,
          },
          secondaryNiches: secondaryList,
          detectedCountry: record.detectedCountry || 'US',
          creatorSummary: record.aiCreatorSummary || `${primaryDef.name} creator sharing high-engagement content on TikTok.`,
        };
      }
    }
  } catch (dbErr) {
    console.warn('[DB Historical AI Fetch Error]:', dbErr);
  }

  return null;
}

/**
 * Unified Multi-Platform AI Enrichment via Google Cloud Vertex AI (Gemini 3.7 Flash)
 * Analyzes YouTube, Instagram, and TikTok together in a single holistic prompt.
 */
export async function enrichMultiPlatformCreatorWithAI(
  input: MultiPlatformCreatorInput
): Promise<CreatorAIClassification> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID?.trim();
  if (!projectId) {
    throw new Error('[Gemini Vertex AI] GOOGLE_CLOUD_PROJECT_ID is not configured in environment variables.');
  }

  let vertexToken: string | null = null;
  try {
    vertexToken = await getGoogleCloudAccessToken();
  } catch (tokenErr) {
    console.warn('[Gemini Vertex AI] Token error, will check historical DB fallback:', tokenErr);
  }

  const nicheOptions = PRIMARY_NICHES.map(
    (n) => `ID ${n.id}: "${n.name}" (Multiplier: ${n.multiplier}x) - ${n.description}`
  ).join('\n');

  // Build structured cross-platform dossier
  const platformDossiers: string[] = [];

  if (input.youtube) {
    const yt = input.youtube;
    const topics = yt.topicCategories?.length ? `YouTube Official Topics: ${yt.topicCategories.join(', ')}` : '';
    const keywords = yt.keywords?.length ? `Channel Keywords: ${yt.keywords.slice(0, 10).join(', ')}` : '';
    const titles = yt.recentTitles?.length ? `Recent Video Titles:\n    - ${yt.recentTitles.slice(0, 10).join('\n    - ')}` : '';
    platformDossiers.push(`  [YOUTUBE CHANNEL]
  - Channel Name: ${yt.title || 'Unknown'} (Handle: ${yt.handle || 'None'})
  - Description: ${yt.description || 'None'}
  - Official Country Code: ${yt.country || 'Unknown'}
  - Scale: ${(yt.subscriberCount || 0).toLocaleString()} subscribers | ${(yt.avgViews || 0).toLocaleString()} avg views
  ${topics ? `- ${topics}\n  ` : ''}${keywords ? `- ${keywords}\n  ` : ''}${titles ? `- ${titles}` : ''}`);
  }

  if (input.instagram) {
    const ig = input.instagram;
    const location = [ig.city, ig.businessAddress].filter(Boolean).join(', ');
    const tags = ig.hashtags?.length ? `Top Hashtags: #${ig.hashtags.slice(0, 10).join(', #')}` : '';
    const captions = ig.recentCaptions?.length ? `Recent Post Captions:\n    - ${ig.recentCaptions.slice(0, 8).join('\n    - ')}` : '';
    platformDossiers.push(`  [INSTAGRAM PROFILE]
  - Account: @${ig.username} (${ig.fullName || ig.username})
  - Native Business Category: ${ig.categoryName || 'Not specified'}
  - Bio: ${ig.biography || 'None'}
  - Verified Location: ${location || 'None'}
  - Scale: ${(ig.followerCount || 0).toLocaleString()} followers | ${(ig.avgLikes || 0).toLocaleString()} avg likes
  ${tags ? `- ${tags}\n  ` : ''}${captions ? `- ${captions}` : ''}`);
  }

  if (input.tiktok) {
    const tt = input.tiktok;
    const desc = tt.recentDescriptions?.length ? `Recent Video Descriptions:\n    - ${tt.recentDescriptions.slice(0, 8).join('\n    - ')}` : '';
    const comments = tt.topComments?.length ? `Audience Sample Comments (Top Unpinned Videos):\n    - "${tt.topComments.slice(0, 15).join('"\n    - "')}"` : '';
    platformDossiers.push(`  [TIKTOK PROFILE]
  - Account: @${tt.username} (${tt.nickname || tt.username})
  - Bio: ${tt.biography || 'None'}
  - TikTok Shop / Commerce Account: ${tt.isCommerceUser ? 'Yes' : 'No'}
  - Scale: ${(tt.followerCount || 0).toLocaleString()} followers | ${(tt.avgViews || 0).toLocaleString()} avg views
  ${desc ? `- ${desc}\n  ` : ''}${comments ? `- ${comments}` : ''}`);
  }

  const systemInstruction = `You are an elite influencer marketing economist and cross-platform brand partnership analyst for SignCollab.
Your job is to analyze this creator's complete multi-platform social footprint and output a strict structured JSON classification.

Available Niches (You MUST select only from these exact IDs):
${nicheOptions}

Rules:
1. Select 1 Primary Niche (the main vertical they monetize across all platforms).
2. Select 2 Secondary Niches (adjacent categories they create content for).
3. Detect the Creator's Country Code in 2-letter ISO (e.g. US, GB, IN, CA, AU, AE, PK, BR, etc.). Combine official YouTube country, Instagram city/address, and linguistic/currency clues. If completely unknown, default to "US".
4. Write a punchy 2-sentence Brand Executive Summary highlighting their content focus, cross-channel reach, production quality, and sponsor appeal.
5. Return ONLY clean raw JSON matching the required schema.`;

  const userPrompt = `Creator Omnichannel Profile Analysis:
Creator Name: ${input.creatorName || 'Unknown Creator'}
Active Platforms Evaluated: ${[input.youtube ? 'YouTube' : '', input.instagram ? 'Instagram' : '', input.tiktok ? 'TikTok' : ''].filter(Boolean).join(', ')}

${platformDossiers.join('\n\n')}

Analyze this creator across all connected platforms and return the exact structured JSON with primaryNiche, secondaryNiches, detectedCountry, and creatorSummary.`;

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

  if (vertexToken) {
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

        const parsed = JSON.parse(candidateText);

        const primaryDef = PRIMARY_NICHES.find((p) => p.id === parsed.primaryNiche?.id) || PRIMARY_NICHES[7];
        const secondaryList: Array<{ id: number; name: string; multiplier: number }> = [];

        if (Array.isArray(parsed.secondaryNiches)) {
          for (const s of parsed.secondaryNiches) {
            const match = PRIMARY_NICHES.find((p) => p.id === s.id);
            if (match && match.id !== primaryDef.id && secondaryList.length < 2) {
              secondaryList.push({
                id: match.id,
                name: match.name,
                multiplier: match.multiplier,
              });
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

        return {
          primaryNiche: {
            id: primaryDef.id,
            name: primaryDef.name,
            multiplier: primaryDef.multiplier,
            confidence: typeof parsed.primaryNiche?.confidence === 'number' ? parsed.primaryNiche.confidence : 0.95,
          },
          secondaryNiches: secondaryList,
          detectedCountry: String(parsed.detectedCountry || input.reportedCountry || input.youtube?.country || 'US').toUpperCase().slice(0, 2),
          creatorSummary: String(
            parsed.creatorSummary || `${primaryDef.name} creator creating engaging cross-platform content.`
          ),
        };
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.warn(`[Gemini Vertex AI] Network issue on ${model}:`, errMsg);
        modelErrors.push(`[${model}] Exception: ${errMsg}`);
      }
    }
  }

  // Fallback to database
  const fallbackHandle = input.youtube?.handle || input.instagram?.username || input.tiktok?.username || '';
  const fallbackPlatform = input.primaryPlatform || (input.youtube ? 'youtube' : input.instagram ? 'instagram' : 'tiktok');

  if (fallbackHandle) {
    const historicalData = await getHistoricalAIEnrichmentFromDB(fallbackPlatform, fallbackHandle);
    if (historicalData) {
      return historicalData;
    }
  }

  throw new Error(
    `[Gemini Vertex AI Failure] All AI models (${PRIMARY_MODELS.join(', ')}) failed. Details:\n${modelErrors.join('\n')}`
  );
}

/**
 * Backward-compatible single-platform wrapper for individual scraper pages
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
