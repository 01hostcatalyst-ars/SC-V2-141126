"use client";
import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { CONTACT_CATEGORIES } from '@/lib/contact-options';
import styles from '@/components/company/CompanyPages.module.css';

const empty = { name: '', email: '', company: '', category: 'general', subject: '', message: '', website: '' };
export function ContactForm({ supportEmail = 'support@signcollab.com' }: { supportEmail?: string }) {
  const [data, setData] = useState(empty);
  const [status, setStatus] = useState<'idle'|'submitting'|'success'|'error'>('idle');
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const requestId = useRef<string|null>(null);
  const change = (event: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => { requestId.current = null; setData(previous => ({ ...previous, [event.target.name]: event.target.value })); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (status === 'submitting') return;
    setStatus('submitting'); setError(''); requestId.current ||= crypto.randomUUID();
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, requestId: requestId.current }) });
      const result = await response.json();
      if (!response.ok || !result.success || !result.reference) throw new Error(result.error || 'Your message could not be sent. Please try again.');
      setReference(result.reference); setStatus('success');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'We could not send your message. Please try again.'); setStatus('error'); }
  };
  return <div className={styles.form}>
    {status === 'success' ? <div className={styles.success} role="status"><span className={styles.icon}><Check size={24} /></span><h3>Your message is on its way.</h3><p>Thank you, {data.name}. We’ll reply to <strong>{data.email}</strong>.</p><p>Your message reference</p><code>{reference}</code><div><button className={styles.pinkButton} onClick={() => { setData(empty); setStatus('idle'); setReference(''); requestId.current = null; }}>Send another message <ArrowRight size={15} /></button></div></div> : <>
      <h2>Send us a message</h2><p className={styles.formIntro}>Tell us what you need. All fields are required unless marked optional.</p>
      {error && <div className={styles.notice} role="alert">{error} <a href={`mailto:${supportEmail}`}>Email us directly</a>.</div>}
      <form onSubmit={submit} aria-busy={status === 'submitting'}>
        <fieldset disabled={status === 'submitting'} className={styles.fields}>
          <div className={styles.field}><label htmlFor="contact-name">Your name</label><input id="contact-name" name="name" autoComplete="name" maxLength={100} value={data.name} onChange={change} required placeholder="Full name" /></div>
          <div className={styles.field}><label htmlFor="contact-email">Email address</label><input id="contact-email" name="email" type="email" autoComplete="email" maxLength={254} value={data.email} onChange={change} required placeholder="you@company.com" /></div>
          <div className={styles.field}><label htmlFor="contact-company">Company <span>optional</span></label><input id="contact-company" name="company" autoComplete="organization" maxLength={140} value={data.company} onChange={change} placeholder="Company or creator name" /></div>
          <div className={styles.field}><label htmlFor="contact-category">What’s it about?</label><select id="contact-category" name="category" value={data.category} onChange={change}>{Object.entries(CONTACT_CATEGORIES).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></div>
          <div className={`${styles.field} ${styles.wide}`}><label htmlFor="contact-subject">Subject <span>optional</span></label><input id="contact-subject" name="subject" maxLength={160} value={data.subject} onChange={change} placeholder="A short summary" /></div>
          <div className={`${styles.field} ${styles.wide}`}><label htmlFor="contact-message">Your message</label><textarea id="contact-message" name="message" minLength={10} maxLength={5000} rows={5} value={data.message} onChange={change} required placeholder="How can we help?" /></div>
          <div className={styles.honeypot} aria-hidden="true"><label htmlFor="contact-website">Leave this empty</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={data.website} onChange={change} /></div>
        </fieldset>
        <div className={styles.formBottom}><p>Your details are used to respond to this enquiry. Read our <Link href="/privacy">privacy policy</Link>.</p><button className={styles.pinkButton} type="submit" disabled={status==='submitting'}>{status==='submitting' ? <><Loader2 className="animate-spin" size={15} />Sending…</> : <>Send message <ArrowRight size={16} /></>}</button></div>
      </form>
    </>}
  </div>;
}
