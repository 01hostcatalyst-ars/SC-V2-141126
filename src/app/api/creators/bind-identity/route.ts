import { NextRequest, NextResponse } from 'next/server';
import { upsertCreatorIdentityCluster } from '@/lib/creators/identity';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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

    const cluster = await upsertCreatorIdentityCluster({
      canonicalName,
      youtubeHandle,
      instagramUsername,
      tiktokUsername,
      primaryNicheId: typeof primaryNicheId === 'number' ? primaryNicheId : undefined,
      countryCode: typeof countryCode === 'string' ? countryCode : undefined,
    });

    return NextResponse.json({
      success: true,
      cluster,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Identity binding failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
