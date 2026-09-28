import { NextRequest, NextResponse } from 'next/server';
import { resolveCreatorIdentity } from '@/lib/creators/identity';
import { Platform } from '@/lib/calculator/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || searchParams.get('handle') || searchParams.get('q');
    const platform = (searchParams.get('platform') as Platform) || undefined;

    if (!query || !query.trim()) {
      return NextResponse.json({ success: false, error: 'Query parameter is required' }, { status: 400 });
    }

    const cluster = await resolveCreatorIdentity(query.trim(), platform);

    return NextResponse.json({
      success: true,
      resolved: Boolean(cluster && (cluster.accounts.youtube || cluster.accounts.instagram || cluster.accounts.tiktok)),
      cluster,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Identity resolution failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body?.query || body?.handle || body?.url;
    const platform = (body?.platform as Platform) || undefined;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ success: false, error: 'Query parameter is required' }, { status: 400 });
    }

    const cluster = await resolveCreatorIdentity(query.trim(), platform);

    return NextResponse.json({
      success: true,
      resolved: Boolean(cluster && (cluster.accounts.youtube || cluster.accounts.instagram || cluster.accounts.tiktok)),
      cluster,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Identity resolution failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
