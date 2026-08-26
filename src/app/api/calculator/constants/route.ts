import { NextResponse } from 'next/server';
import { getCalculatorDatabaseConstants } from '@/lib/calculator/db-service';

export async function GET() {
  try {
    const constants = await getCalculatorDatabaseConstants();
    return NextResponse.json(
      { success: true, constants },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch calculator constants';
    console.error('[API /api/calculator/constants] Error:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
