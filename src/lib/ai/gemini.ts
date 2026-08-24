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
 * Enriches creator profile using Google Cloud Vertex AI (Primary: gemini-3.7-flash, Secondary: gemini-3.6-flash)
 */
export async function enrichCreatorWithAI(
  input: CreatorContextInput
): Promise<CreatorAIClassification> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID?.trim();
  if (!projectId) {
    throw new Error('[Gemini Vertex AI] GOOGLE_CLOUD_PROJECT_ID is not configured in environment variables.');
  }

  const vertexToken = await getGoogleCloudAccessToken();

  const nicheOptions = PRIMARY_NICHES.map(
    (n) => `ID ${n.id}: "${n.name}" (Multiplier: ${n.multiplier}x) - ${n.description}`
  ).join('\n');

  const titles = (input.recentVideoTitles || input.recentCaptions || []).slice(0, 15).join('\n- ');
  const tags = (input.hashtags || []).slice(0, 15).join(', ');

  const systemInstruction = `You are an elite influencer marketing economist and brand partnership analyst for SignCollab.
Your job is to analyze creator social data and output a strict structured JSON classification.

Available Niches (You MUST select only from these IDs):
${nicheOptions}

Rules:
1. Select 1 Primary Niche (the main topic they monetize).
2. Select 2 Secondary Niches (adjacent categories they create content for).
3. Detect the Creator's Country Code in 2-letter ISO (e.g. US, PK, IN, GB, CA, AU, AE, etc.). If unknown, infer from language/currency/locations or default to "US".
4. Write a punchy 2-sentence Brand Executive Summary highlighting their content focus, production style, and brand collaboration value.
5. Return ONLY clean raw JSON matching the required schema.`;

  const userPrompt = `Creator Profile Analysis:
Platform: ${input.platform}
Handle: @${input.username}
Display Name: ${input.name || input.username}
Biography: ${input.biography || 'None'}
Website/Bio Link: ${input.bioLink || 'None'}
Language: ${input.detectedLanguage || 'Unknown'}
Location Hint: ${input.reportedCountry || 'Unknown'}
Hashtags: ${tags || 'None'}

Recent 15 Video Titles / Captions:
- ${titles || 'No recent titles available'}

Analyze this creator and return the exact structured JSON with primaryNiche, secondaryNiches, detectedCountry, and creatorSummary.`;

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

  // Try Primary Model (gemini-3.7-flash), then fallback to Tier 2 (gemini-3.6-flash)
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

      // Validate and resolve niches
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
        detectedCountry: String(parsed.detectedCountry || input.reportedCountry || 'US').toUpperCase().slice(0, 2),
        creatorSummary: String(
          parsed.creatorSummary || `${primaryDef.name} creator sharing high-engagement content on ${input.platform}.`
        ),
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[Gemini Vertex AI] Network issue on ${model}:`, errMsg);
      modelErrors.push(`[${model}] Exception: ${errMsg}`);
    }
  }

  // If both Primary and Secondary models fail, throw an explicit error
  throw new Error(
    `[Gemini Vertex AI Failure] All AI models (${PRIMARY_MODELS.join(', ')}) failed to respond. Details:\n${modelErrors.join('\n')}`
  );
}
