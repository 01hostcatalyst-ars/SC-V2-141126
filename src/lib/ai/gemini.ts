import { PRIMARY_NICHES, NicheDefinition } from '../calculator/constants';

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

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.7-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Enriches creator profile using Gemini AI with structured 3-niche classification
 */
export async function enrichCreatorWithAI(
  input: CreatorContextInput
): Promise<CreatorAIClassification> {
  const apiKey =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.YOUTUBE_API_KEY?.trim();

  // If no API key available, fallback to deterministic heuristic classifier
  if (!apiKey) {
    console.warn('[AI Enrichment] No GEMINI_API_KEY found, using heuristic fallback.');
    return fallbackHeuristicClassifier(input);
  }

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

  try {
    const url = `${GEMINI_API_URL}?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Gemini API] Request failed (${res.status}): ${errText.slice(0, 150)}. Using fallback.`);
      return fallbackHeuristicClassifier(input);
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return fallbackHeuristicClassifier(input);
    }

    const parsed = JSON.parse(candidateText);

    // Validate and resolve niches
    const primaryDef = PRIMARY_NICHES.find((p) => p.id === parsed.primaryNiche?.id) || PRIMARY_NICHES[7]; // Default Lifestyle
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

    // Ensure 2 secondary niches
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
      creatorSummary: String(parsed.creatorSummary || `${primaryDef.name} creator sharing high-engagement content on ${input.platform}.`),
    };
  } catch (err: unknown) {
    console.error('[Gemini AI] Error in classification:', err);
    return fallbackHeuristicClassifier(input);
  }
}

/**
 * Deterministic Heuristic Fallback Classifier (Zero external dependencies)
 */
export function fallbackHeuristicClassifier(input: CreatorContextInput): CreatorAIClassification {
  const combinedText = `
    ${input.username} ${input.name || ''} ${input.biography || ''} 
    ${(input.recentVideoTitles || []).join(' ')} 
    ${(input.hashtags || []).join(' ')}
  `.toLowerCase();

  const scores: Record<number, number> = {};
  PRIMARY_NICHES.forEach((n) => (scores[n.id] = 0));

  const keywordMap: Record<number, string[]> = {
    1: ['decor', 'interior', 'furniture', 'architecture', 'room', 'renovation', 'home', 'makeover'],
    2: ['dog', 'cat', 'puppy', 'pet', 'animal', 'vet', 'aquarium', 'kitten'],
    3: ['finance', 'money', 'crypto', 'invest', 'business', 'stocks', 'saas', 'startup', 'wealth', 'founder'],
    4: ['diy', 'woodworking', 'tools', 'craft', 'build', 'repair', 'mechanic'],
    5: ['career', 'learn', 'education', 'study', 'course', 'coaching', 'skills', 'leadership', 'english'],
    6: ['tech', 'gadget', 'apple', 'smartphone', 'pc', 'code', 'software', 'ai', 'hardware', 'laptop', 'review'],
    7: ['travel', 'hotel', 'flight', 'resort', 'explore', 'vacation', 'trip', 'outdoors', 'hiking'],
    8: ['vlog', 'daily', 'routine', 'lifestyle', 'life', 'grwm', 'story'],
    9: ['food', 'recipe', 'cooking', 'chef', 'bake', 'restaurant', 'eat', 'dish', 'culinary'],
    10: ['family', 'mom', 'dad', 'parenting', 'kids', 'baby', 'toddler', 'motherhood'],
    11: ['gym', 'fitness', 'workout', 'wellness', 'health', 'lifting', 'muscle', 'yoga', 'protein'],
    12: ['fashion', 'outfit', 'style', 'clothes', 'dresses', 'wear', 'shoes', 'haul'],
    13: ['makeup', 'beauty', 'skincare', 'cosmetics', 'lipstick', 'glam', 'serum', 'hair'],
  };

  for (const [idStr, words] of Object.entries(keywordMap)) {
    const id = Number(idStr);
    for (const w of words) {
      if (combinedText.includes(w)) {
        scores[id] = (scores[id] || 0) + 1;
      }
    }
  }

  const sortedNiches = [...PRIMARY_NICHES].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
  const primary = sortedNiches[0] || PRIMARY_NICHES[7]; // Lifestyle fallback
  const secondary = [sortedNiches[1] || PRIMARY_NICHES[5], sortedNiches[2] || PRIMARY_NICHES[2]].map((n) => ({
    id: n.id,
    name: n.name,
    multiplier: n.multiplier,
  }));

  const country = input.reportedCountry || (input.detectedLanguage === 'ur' ? 'PK' : input.detectedLanguage === 'hi' ? 'IN' : 'US');

  return {
    primaryNiche: {
      id: primary.id,
      name: primary.name,
      multiplier: primary.multiplier,
      confidence: 0.85,
    },
    secondaryNiches: secondary,
    detectedCountry: country,
    creatorSummary: `${primary.name} creator publishing popular content on ${input.platform} with an active, dedicated following.`,
  };
}
