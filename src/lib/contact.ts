import { createHash, createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { prisma } from '@/lib/prisma';
import { getCompanyConfig } from '@/lib/config';
import { CONTACT_CATEGORIES } from './contact-options';

export class ContactError extends Error { constructor(message: string, public status = 400) { super(message); } }
const emailPattern = /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/;
const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function validateContact(body: Record<string, unknown>) {
  const field = (name: string, max: number, required = false) => {
    const value = body[name];
    if (value !== undefined && typeof value !== 'string') throw new ContactError('Please check the form fields.');
    const text = (value as string || '').trim();
    if ((required && !text) || text.length > max || (name !== 'message' && /[\r\n\u0000-\u001f\u007f]/.test(text))) throw new ContactError(`Please check your ${name}.`);
    return text;
  };
  if (field('website', 200)) throw new ContactError('Unable to send this message.');
  const name = field('name', 100, true), email = field('email', 254, true), company = field('company', 140), subject = field('subject', 160), message = field('message', 5000, true);
  if (!emailPattern.test(email)) throw new ContactError('Enter a valid email address.');
  if (message.length < 10 || /\u0000/.test(message)) throw new ContactError('Please include a little more detail in your message.');
  const category = body.category;
  if (typeof category !== 'string' || !Object.hasOwn(CONTACT_CATEGORIES, category)) throw new ContactError('Choose a message topic.');
  const requestId = field('requestId', 36, true);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) throw new ContactError('Please reload the form and try again.');
  return { name, email, company, subject, message, category: category as keyof typeof CONTACT_CATEGORIES, requestId };
}

export async function readContactBody(req: Request): Promise<Record<string, unknown>> {
  if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new ContactError('Send a JSON request.', 415);
  const reader = req.body?.getReader(); if (!reader) throw new ContactError('The form is empty.');
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength; if (size > 16384) { await reader.cancel(); throw new ContactError('Your message is too large.', 413); } chunks.push(value); }
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
    return body;
  } catch (error) { if (error instanceof ContactError) throw error; throw new ContactError('The form could not be read. Please try again.'); }
  finally { reader.releaseLock(); }
}

export async function limitContact(req: Request) {
  const origin = req.headers.get('origin');
  if (origin && origin !== new URL(req.url).origin) throw new ContactError('Please send your message through this website.', 403);
  const key = process.env.RESEND_API_KEY;
  if (!key || key.includes('mock')) throw new ContactError('Email delivery is temporarily unavailable. Please use the email link.', 503);
  const candidate = process.env.VERCEL === '1' ? req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() : undefined;
  const visitor = createHmac('sha256', key).update(candidate && isIP(candidate) ? candidate : 'shared-local-visitor').digest('hex');
  const configuredLimit = (name: string, fallback: number) => { const value = Number(process.env[name]); return Number.isSafeInteger(value) && value > 0 ? value : fallback; };
  try {
    await prisma.$transaction(async tx => {
      for (const bucket of [{ key: 'contact:global', seconds: 86400, max: configuredLimit('CONTACT_MAX_PER_DAY', 50) }, { key: `contact:visitor:${visitor}`, seconds: 3600, max: configuredLimit('CONTACT_MAX_PER_IP_PER_HOUR', 5) }]) {
        const result = await tx.$queryRaw<Array<{ used: number }>>`
          INSERT INTO calculator_guard_counter(bucket, used, expires_at) VALUES (${bucket.key}, 1, now() + ${bucket.seconds} * interval '1 second')
          ON CONFLICT(bucket) DO UPDATE SET
            used = CASE WHEN calculator_guard_counter.expires_at <= now() THEN 1 ELSE calculator_guard_counter.used + 1 END,
            expires_at = CASE WHEN calculator_guard_counter.expires_at <= now() THEN EXCLUDED.expires_at ELSE calculator_guard_counter.expires_at END
          WHERE calculator_guard_counter.expires_at <= now() OR calculator_guard_counter.used < ${bucket.max} RETURNING used`;
        if (!result.length) throw new ContactError('Too many messages have been sent. Please try again later or email us directly.', 429);
      }
    }, { maxWait: 5000, timeout: 10000 });
  } catch (error) { if (error instanceof ContactError) throw error; console.error('[Contact guard]', error instanceof Error ? error.name : 'database_unavailable'); throw new ContactError('The contact form is temporarily unavailable. Please use the email link.', 503); }
}

export async function deliverContact(message: ReturnType<typeof validateContact>) {
  const company = getCompanyConfig();
  const to = (process.env.CONTACT_TO_EMAIL || company.supportEmail).trim();
  const domain = company.domain.replace(/^https?:\/\//i, '').split('/')[0].replace(/^www\./i, '');
  const from = (process.env.CONTACT_FROM_EMAIL || `support@${domain}`).trim();
  const key = process.env.RESEND_API_KEY;
  if (!key || key.includes('mock') || !emailPattern.test(to) || !emailPattern.test(from) || /[\r\n]/.test(to + from + company.name)) throw new ContactError('Email delivery is temporarily unavailable. Please use the email link.', 503);
  const reference = `SC-${message.requestId.slice(0, 8).toUpperCase()}`;
  const topic = CONTACT_CATEGORIES[message.category];
  const text = `${company.name} contact form\nReference: ${reference}\nTopic: ${topic}\nName: ${message.name}\nEmail: ${message.email}\nCompany: ${message.company || 'Not provided'}\nSubject: ${message.subject || topic}\n\n${message.message}`;
  const html = `<div style="max-width:640px;margin:auto;font-family:Arial,sans-serif;color:#27272a;line-height:1.7"><h2>${escape(company.name)} · New message</h2><p style="color:#a13c6d">${escape(topic)} · ${reference}</p><p><strong>From:</strong> ${escape(message.name)} &lt;${escape(message.email)}&gt;<br><strong>Company:</strong> ${escape(message.company || 'Not provided')}<br><strong>Subject:</strong> ${escape(message.subject || topic)}</p><div style="border:1px solid #efdde6;border-radius:14px;padding:20px;background:#fff8fc">${escape(message.message).replace(/\n/g, '<br>')}</div><p style="font-size:12px;color:#71717a">Reply to this email to respond to the visitor.</p></div>`;
  const payload = { from: `${company.name} <${from}>`, to: [to], reply_to: message.email, subject: `[${company.name} · ${topic}] ${message.subject || 'Website enquiry'} (${reference})`, text, html };
  const idempotencyKey = `contact-${message.requestId}-${createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0,24)}`;
  let response: Response;
  try { response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey }, body: JSON.stringify(payload), signal: AbortSignal.timeout(15000) }); }
  catch { throw new ContactError('We could not confirm delivery. Please try again or email us directly.', 502); }
  const result = await response.json().catch(() => ({}));
  if (!response.ok || typeof result.id !== 'string') { console.error('[Contact delivery]', response.status, result.name || 'provider_error', result.message || 'No delivery reference'); throw new ContactError('Your message could not be sent. Please try again or email us directly.', 502); }
  return { reference, emailId: result.id };
}
