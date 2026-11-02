import { NextResponse } from 'next/server';
import { ContactError, deliverContact, limitContact, readContactBody, validateContact } from '@/lib/contact';

export const runtime = 'nodejs';
export const maxDuration = 30;
export async function POST(req: Request) {
  try {
    const message = validateContact(await readContactBody(req));
    await limitContact(req);
    const result = await deliverContact(message);
    return NextResponse.json({ success: true, reference: result.reference }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const known = error instanceof ContactError;
    return NextResponse.json({ success: false, error: known ? error.message : 'Your message could not be sent. Please try again.' }, { status: known ? error.status : 500, headers: { 'Cache-Control': 'no-store', ...(known && error.status === 429 ? { 'Retry-After': '3600' } : {}) } });
  }
}
