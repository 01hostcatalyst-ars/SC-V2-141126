import { createHmac, randomUUID } from 'node:crypto';
import { isIP } from 'node:net';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProfileInputError } from './profile-input';

export class CalculatorGuardError extends Error {
  constructor(message: string, public status = 429, public retryAfter = 60) { super(message); }
}
const limit = (name: string, fallback: number) => {
  const value = Number(process.env[name]);
  return Number.isSafeInteger(value) && value > 0 ? value : fallback;
};
// PostgreSQL counters work across Vercel instances. A failed job still counts: providers may bill failures.
async function reserve(buckets: Array<{ key: string; max: number; seconds: number }>, job?: string) {
  const token = randomUUID();
  try {
    await prisma.$transaction(async tx => {
      if (job) {
        const rows = await tx.$queryRaw<Array<{ token: string }>>`
          INSERT INTO calculator_guard_job(job_key, token, expires_at) VALUES (${job}, ${token}, now() + interval '20 minutes')
          ON CONFLICT(job_key) DO UPDATE SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at
          WHERE calculator_guard_job.expires_at < now() RETURNING token`;
        if (!rows.length) throw new CalculatorGuardError('This account is already being collected. Please wait and try again shortly.', 409, 30);
      }
      // Consistent ordering prevents competing reservations deadlocking.
      for (const bucket of [...buckets].sort((a, b) => a.key.localeCompare(b.key))) {
        const rows = await tx.$queryRaw<Array<{ used: number }>>`
          INSERT INTO calculator_guard_counter(bucket, used, expires_at)
          VALUES (${bucket.key}, 1, now() + ${bucket.seconds} * interval '1 second')
          ON CONFLICT(bucket) DO UPDATE SET
            used = CASE WHEN calculator_guard_counter.expires_at <= now() THEN 1 ELSE calculator_guard_counter.used + 1 END,
            expires_at = CASE WHEN calculator_guard_counter.expires_at <= now() THEN EXCLUDED.expires_at ELSE calculator_guard_counter.expires_at END
          WHERE calculator_guard_counter.expires_at <= now() OR calculator_guard_counter.used < ${bucket.max}
          RETURNING used`;
        if (!rows.length) throw new CalculatorGuardError('The calculator usage limit has been reached. Please try again later.', 429, bucket.seconds);
      }
    });
  } catch (error) {
    if (error instanceof CalculatorGuardError) throw error;
    console.error('[Calculator guard] Database reservation unavailable');
    throw new CalculatorGuardError('The calculator is temporarily unavailable. Please try again later.', 503);
  }
  return async () => {
    // Retain a short cooldown while callers finish persisting the returned snapshot.
    if (job) await prisma.$executeRaw`UPDATE calculator_guard_job SET expires_at = now() + interval '30 seconds' WHERE job_key = ${job} AND token = ${token}`.catch(() => {});
  };
}

export async function guardCalculatorRequest(req: Request, work = false) {
  const origin = req.headers.get('origin');
  if (origin && origin !== new URL(req.url).origin) throw new CalculatorGuardError('Please use the calculator on this website.', 403);
  const secret = process.env.CALCULATOR_GUARD_SECRET;
  if (process.env.NODE_ENV === 'production' && (!secret || secret.length < 32)) throw new CalculatorGuardError('The calculator is temporarily unavailable.', 503);
  // Vercel overwrites this header. Never trust client-supplied X-Forwarded-For.
  const candidate = process.env.VERCEL === '1' ? req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() : undefined;
  const visitor = createHmac('sha256', secret || 'local-development-calculator').update(candidate && isIP(candidate) ? candidate : 'shared-visitor').digest('hex');
  await reserve([
    { key: `request:${visitor}`, max: 90, seconds: 600 },
    ...(work ? [{ key: `work:${visitor}`, max: limit('CALCULATOR_VISITOR_WORK_PER_HOUR', 18), seconds: 3600 }] : []),
  ]);
}
export async function withCalculatorWork<T>(kind: 'scrape' | 'ai', key: string, work: () => Promise<T>): Promise<T> {
  const release = await reserve([{ key: `global:${kind}`, max: limit(kind === 'ai' ? 'CALCULATOR_AI_JOBS_PER_DAY' : 'CALCULATOR_PLATFORM_SCANS_PER_DAY', kind === 'ai' ? 300 : 600), seconds: 86400 }], `${kind}:${key}`);
  try { return await work(); } finally { await release(); }
}
export async function calculatorBody(req: Request, maxBytes = 4096): Promise<Record<string, any>> {
  if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new CalculatorGuardError('Send an application/json request.', 415);
  const reader = req.body?.getReader();
  if (!reader) throw new ProfileInputError('A JSON request body is required.');
  let size = 0; const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new CalculatorGuardError('The request is too large.', 413); }
      chunks.push(value);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
    return body;
  } catch (error) { if (error instanceof CalculatorGuardError) throw error; throw new ProfileInputError('Send a valid JSON object.'); }
  finally { reader.releaseLock(); }
}
export function calculatorError(error: unknown) {
  if (error instanceof ProfileInputError) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  if (error instanceof CalculatorGuardError) return NextResponse.json({ success: false, error: error.message }, { status: error.status, headers: { 'Retry-After': String(error.retryAfter), 'Cache-Control': 'no-store' } });
  console.error('[Calculator] Request failed', error instanceof Error ? error.name : 'Unknown');
  return NextResponse.json({ success: false, error: 'We could not finish this request. Please try again later.' }, { status: 500 });
}
