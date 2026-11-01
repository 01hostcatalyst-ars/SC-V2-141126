import { NextRequest, NextResponse } from 'next/server';
import { upsertCreatorIdentityCluster } from '@/lib/creators/identity';
import { parseProfileInput, ProfileInputError } from '@/lib/calculator/profile-input';
import { calculatorBody, guardCalculatorRequest, calculatorError } from '@/lib/calculator/request-guard';

export async function POST(req: NextRequest) {
  try {
    const body = await calculatorBody(req);
    const {
      canonicalName,
      youtubeHandle,
      instagramUsername,
      tiktokUsername,
      primaryNicheId,
      countryCode,
    } = body;

    if (!youtubeHandle && !instagramUsername && !tiktokUsername) {
      return NextResponse.json(
        { success: false, error: 'At least one platform handle is required to bind identity.' },
        { status: 400 }
      );
    }

    if (canonicalName !== undefined && (typeof canonicalName !== 'string' || canonicalName.length > 200)) throw new ProfileInputError('Invalid creator name.');
    const youtube = youtubeHandle ? parseProfileInput(youtubeHandle, 'youtube') : undefined;
    const instagram = instagramUsername ? parseProfileInput(instagramUsername, 'instagram') : undefined;
    const tiktok = tiktokUsername ? parseProfileInput(tiktokUsername, 'tiktok') : undefined;
    if (youtube?.kind === 'videoId') throw new ProfileInputError('Use a channel handle to link an account.');
    await guardCalculatorRequest(req);
    const cluster = await upsertCreatorIdentityCluster({
      canonicalName,
      youtubeHandle: youtube?.canonical,
      instagramUsername: instagram?.identifier,
      tiktokUsername: tiktok?.identifier,
      primaryNicheId: typeof primaryNicheId === 'number' ? primaryNicheId : undefined,
      countryCode: typeof countryCode === 'string' ? countryCode : undefined,
    });

    return NextResponse.json({
      success: true,
      cluster,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Identity binding failed';
    return calculatorError(err);
  }
}
