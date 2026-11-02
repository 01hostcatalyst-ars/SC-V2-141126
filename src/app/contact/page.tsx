import { graph, pageNode, breadcrumbs, faqNode, organizationId } from '@/lib/structured-data';
import { serializeJsonLd } from '@/lib/structured-data';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, MessageCircle, Handshake, ShieldCheck, BookOpen } from 'lucide-react';
import { getCompanyConfig } from '@/lib/config';
import { ContactForm } from '@/components/contact/ContactForm';
import { ContactFaqAccordion, CONTACT_FAQS } from '@/components/contact/ContactFaqAccordion';
import { CompanyFrame } from '@/components/company/CompanyFrame';
import styles from '@/components/company/CompanyPages.module.css';
const baseUrl='https://www.signcollab.com';
export const metadata:Metadata={title:'Contact & support',description:'Get in touch with SignCollab for product help, partnership enquiries, security reports, or feedback.',alternates:{canonical:'/contact'},openGraph:{title:'Contact SignCollab',description:'Questions, ideas, or a little help getting started? Talk to us.',url:`${baseUrl}/contact`,type:'website'}};
export default function ContactPage(){const company=getCompanyConfig();const email=company.supportEmail;const schema=graph([{...pageNode('/contact', `Contact ${company.name}`, 'Contact SignCollab for product support, partnerships, security reports, or feedback.', 'ContactPage'), mainEntity:{'@id':organizationId}}, breadcrumbs('/contact', 'Contact & support'), faqNode('/contact', CONTACT_FAQS)]);return <CompanyFrame current="/contact"><script id="contact-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(schema)}}/>
 <header className={styles.contactHero}><span className={styles.eyebrow}>Contact {company.name}</span><h1>Let’s talk about<br/>what you need.</h1><p>A question, an idea, or a little help getting started? Send us a message and tell us where we can help.</p></header>
 <section className={styles.contactLayout} aria-label="Contact options and message form"><div className={styles.contactInfo}><span className={styles.eyebrow}>Prefer email?</span><a className={styles.emailLink} href={`mailto:${email}`}>{email}<ArrowUpRight size={19}/></a><p>Use the form or email us directly. Choosing a topic helps us understand your enquiry.</p>{[
 {Icon:MessageCircle,title:'Product questions & support',copy:'Help with profiles, rate estimates, agreements, or something that isn’t working as expected.'},
 {Icon:Handshake,title:'Partnerships & sales',copy:'Tell us about your team, agency workflow, or an opportunity to work together.'},
 {Icon:ShieldCheck,title:'Security reports',copy:'Share a potential security issue privately with us using the form or email.'},
 ].map(({Icon,title,copy})=><div className={styles.channel} key={title}><span className={styles.icon}><Icon size={18}/></span><div><h3>{title}</h3><p>{copy}</p></div></div>)}<Link href="/knowledge" className={styles.helpLink}><BookOpen size={21}/><div><strong>A useful place to start</strong><span>Explore our guides to pricing, agreements, and creator partnerships.</span></div><ArrowUpRight size={16}/></Link></div><ContactForm supportEmail={email}/></section>
 <section className={styles.section} id="faq"><div className={styles.faqLayout}><div><span className={styles.eyebrow}>Before you send</span><h2>A few helpful answers.</h2><p>What to include, how we reply, and where to share your ideas.</p></div><ContactFaqAccordion/></div></section>
 </CompanyFrame>;}
