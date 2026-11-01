"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, Check, ChevronDown, FileText, Layers, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { PlatformBadge } from "@/components/icons/PlatformIcons";
import { CreatorPriceRange } from "@/components/creators/CreatorPriceRange";
import type { HomeHeroCreator } from "@/lib/home/featured-creator";
import type { HomeSpotlightCreator } from "@/lib/home/spotlight-creators";
import styles from "./HomeExperience.module.css";
import { CreatorSpotlightSlider } from "./CreatorSpotlightSlider";
import { HomeNicheExplorer } from "./HomeNicheExplorer";

const calculator = "/influencer-rate-calculator";
const previewTabs = ["Rates", "Audience", "Content"] as const;
const faqs = [
  { question: "Does AI calculate the sponsorship prices?", answer: "No. SignCollab’s calculation engine produces the pricing estimates. Its benchmarks are calibrated using creator surveys, direct pricing research, case studies, agency deal history, and contract data. AI interprets supplied data to produce creator, audience, and content insights." },
  { question: "Are the estimated rates a creator’s confirmed quote?", answer: "No. They are negotiation benchmarks. The final price depends on the agreed deliverables, usage rights, exclusivity, and other commercial terms, and is confirmed with the creator." },
  { question: "Can I check a creator who is on just one platform?", answer: "Yes. Start with a YouTube, Instagram, or TikTok profile link or handle. SignCollab checks for linked accounts and builds a report from the available platform data. You can add another account if you know it belongs to the creator." },
  { question: "What can I do after exploring a creator?", answer: "Review their platform performance, estimated rates, audience insights, and suggested campaign packages. Download a rate card or move into the contract builder to specify the scope, usage rights, and payment terms." },
];

function ArrowLink({ href, children, secondary = false }: { href: string; children: React.ReactNode; secondary?: boolean }) {
  return <Link href={href} className={secondary ? styles.secondaryAction : styles.primaryAction}>{children}<ArrowRight size={16} aria-hidden="true" /></Link>;
}

function SectionBand({ tone, children }: { tone: "gray" | "white"; children: React.ReactNode }) {
  return <div className={styles.sectionBand} data-tone={tone}>{children}</div>;
}

function ReportPreview({ creator }: { creator: HomeHeroCreator | null }) {
  const [imageFailed, setImageFailed] = useState(false);
  const name = creator?.name || "Sydnee Zora";
  const profileHref = `/creators/${creator?.slug || "sydnee-zora"}`;
  const compact = (value: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  const [tab, setTab] = useState<typeof previewTabs[number]>("Rates");
  const id = useId();
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  return <div className={styles.previewCanvas}>
    <div className={styles.previewGlow} aria-hidden="true" />
    <div className={styles.report}>
      <div className={styles.reportTop}><span><span className={styles.tinyDot} />Creator spotlight</span><Link href={profileHref}>View profile<ArrowRight size={11} aria-hidden="true" /></Link></div>
      <div className={styles.reportIdentity}>
        <div className={styles.heroPortrait}>{creator?.avatarUrl && !imageFailed ? <img src={creator.avatarUrl} alt={name} width={68} height={68} referrerPolicy="no-referrer" onError={() => setImageFailed(true)} /> : <span>{name.charAt(0)}</span>}</div>
        <div><p>{name}</p><span>{creator?.niche || "Explore the creator profile"}</span></div>
        <Link href={profileHref} className={styles.reportArrow} aria-label={`Open ${name}’s creator profile`}><ArrowRight size={18} aria-hidden="true" /></Link>
      </div>
      <div className={styles.previewMetrics}>
        {creator?.channels.map(item => <div key={item.platform}><PlatformBadge platform={item.platform} size="sm" /><strong>{compact(item.followers)}</strong><span>{item.platform === "youtube" ? "subscribers" : "followers"}</span></div>)}
      </div>
      <div className={styles.previewTabs} role="tablist" aria-label="Explore the example creator report">
        {previewTabs.map((name, index) => <button key={name} ref={node => { buttons.current[index] = node; }} type="button" role="tab" id={`${id}-${name}`} aria-selected={tab === name} aria-controls={`${id}-panel`} tabIndex={tab === name ? 0 : -1} onClick={() => setTab(name)} onKeyDown={event => {
          let next = index;
          if (event.key === "ArrowRight") next = (index + 1) % previewTabs.length;
          else if (event.key === "ArrowLeft") next = (index + previewTabs.length - 1) % previewTabs.length;
          else if (event.key === "Home") next = 0;
          else if (event.key === "End") next = previewTabs.length - 1;
          else return;
          event.preventDefault(); setTab(previewTabs[next]); buttons.current[next]?.focus();
        }}>{name}</button>)}
      </div>
      <div className={styles.previewPanel} role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${tab}`} tabIndex={0}>
        {!creator ? <div className={styles.previewUnavailable}><p>The profile preview is temporarily unavailable.</p><Link href={profileHref}>Explore Sydnee Zora’s profile<ArrowRight size={14} aria-hidden="true" /></Link></div> : <>
          {tab === "Rates" && <div className={styles.exampleRates}><div className={styles.previewPanelHeading}><h3>Estimated rates</h3><span>{creator.currency || ""} · per deliverable</span></div>{creator.rates.map(item => <CreatorPriceRange key={item.label} label={item.label} rate={item.rate} />)}{!creator.rates.length && <p className={styles.previewNote}>Open the profile for available pricing details.</p>}</div>}
          {tab === "Audience" && <div className={styles.exampleAudience}><div className={styles.previewPanelHeading}><h3>Who they reach</h3><span>Inferred insights</span></div><dl><div><dt>Demographic profile</dt><dd>{creator.audience.demographic || "Not available"}</dd></div><div><dt>Primary audience</dt><dd>{creator.audience.country || "Not available"}</dd></div><div><dt>Buyer intent</dt><dd>{creator.audience.intent || "Not available"}</dd></div><div><dt>Top interests</dt><dd>{creator.audience.interests.slice(0, 2).join(" · ") || "Not available"}</dd></div></dl><p className={styles.previewNote}>Understand the audience alongside the platform metrics.</p></div>}
          {tab === "Content" && <div className={styles.exampleContent}><div className={styles.previewPanelHeading}><h3>Content themes</h3><span>Inferred strength · 0–100</span></div><p className={styles.contentFormat}>{creator.content.format || "Explore the creator’s content"}</p><div className={styles.actualThemes}>{creator.content.themes.map(theme => <div key={theme.name}><p><span>{theme.name}</span><strong>{theme.percentage}/100</strong></p><div><span style={{ width: `${Math.max(0, Math.min(100, theme.percentage))}%` }} /></div></div>)}</div><p className={styles.previewNote}>Theme strengths are inferred insights, not measured views.</p></div>}
        </>}
      </div>
      <div className={styles.reportFoot}><span>From the creator profile</span><span>Estimates, not confirmed quotes</span></div>
    </div>
    <div className={styles.previewCaption}><Layers size={14} aria-hidden="true" /><span>One report. A more complete picture.</span></div>
  </div>;
}

function CreatorDiscovery({ creators }: { creators: HomeSpotlightCreator[] }) {
  return <section className={styles.discovery} id="discover" aria-labelledby="discovery-title">
    <div className={styles.sectionTop}><div><p className={styles.eyebrow}>Find your next collaboration</p><h2 id="discovery-title">Good partnerships start<br className={styles.desktopBreak} /> with the right creator.</h2><p className={styles.sectionDescription}>Explore their content, understand their audience, and see how a partnership could fit.</p></div><ArrowLink href="/creators" secondary>Browse creators</ArrowLink></div>
    {creators.length > 0 && <CreatorSpotlightSlider creators={creators} />}
  </section>;
}

function ContractPreview() {
  const [active, setActive] = useState("scope");
  const fields = [
    { id: "scope", title: "Define the deliverables", description: "Set the content formats, quantities, and delivery expectations." },
    { id: "rights", title: "Make the usage rights clear", description: "Specify where content can be used and for how long." },
    { id: "payment", title: "Agree the payment terms", description: "Put the amount and payment schedule into the agreement." },
  ];
  return <section className={styles.contractSection} aria-labelledby="contract-title">
    <div className={styles.contractCopy}><p className={styles.eyebrow}>From a conversation to an agreement</p><h2 id="contract-title">A good partnership<br />deserves clear terms.</h2><p className={styles.sectionDescription}>Bring the scope, usage rights, and payment terms together in a creator contract.</p><div className={styles.contractSteps} role="group" aria-label="Explore the example contract">{fields.map((field, index) => <button key={field.id} type="button" aria-pressed={active === field.id} onClick={() => setActive(field.id)}><span>{index + 1}</span><div><strong>{field.title}</strong><p>{field.description}</p></div><ArrowRight size={15} aria-hidden="true" /></button>)}</div><ArrowLink href="/instant">Create a contract</ArrowLink></div>
    <div className={styles.paperCanvas}><div className={styles.paper}><div className={styles.paperHeader}><span>SIGNCOLLAB</span><span>Draft preview</span></div><h3>Creator partnership<br />agreement</h3><p className={styles.paperIntro}>The details that put you on the same page.</p><div className={styles.parties}><span>Brand partner<strong>Your brand</strong></span><span>Creator<strong>Your creator</strong></span></div><div className={styles.paperField} data-active={active === "scope"}><span>01 / Deliverables</span><strong>1 × Instagram Reel</strong><p>Format, delivery date, and review process agreed by both parties.</p></div><div className={styles.paperField} data-active={active === "rights"}><span>02 / Usage rights</span><strong>Organic social · 30 days</strong><p>Define permitted use, duration, and any paid advertising rights.</p></div><div className={styles.paperField} data-active={active === "payment"}><span>03 / Payment</span><strong>Amount & schedule</strong><p>Agree the fee, due dates, and payment arrangements.</p></div><div className={styles.signatures}><span>Brand signature</span><span>Creator signature</span></div><p className={styles.paperDisclaimer}>Simplified example. Set and review your own terms in the contract builder.</p></div></div>
  </section>;
}

export function HomeExperience({ heroCreator, spotlightCreators }: { heroCreator: HomeHeroCreator | null; spotlightCreators: HomeSpotlightCreator[] }) {
  return <main className={styles.home}>
    <SectionBand tone="gray">
    <section className={styles.hero} aria-labelledby="home-title"><div className={styles.heroCopy}><p className={styles.eyebrow}><span className={styles.eyebrowDot} />A clearer way to collaborate</p><h1 id="home-title">Find creators.<br />Understand rates.<br /><span>Make the deal.</span></h1><p className={styles.heroDescription}>Explore creator profiles, compare estimated sponsorship rates, and turn your partnership into a clear agreement.</p><div className={styles.heroActions}><ArrowLink href={calculator}>Calculate creator rates</ArrowLink><ArrowLink href="/creators" secondary>Browse creators</ArrowLink></div><div className={styles.heroPlatforms}><span>Across</span><PlatformBadge platform="youtube" size="sm" /><span>YouTube</span><PlatformBadge platform="instagram" size="sm" /><span>Instagram</span><PlatformBadge platform="tiktok" size="sm" /><span>TikTok</span></div><a href="#how-it-works" className={styles.exploreLink}>See how it comes together<ArrowDown size={14} aria-hidden="true" /></a></div><ReportPreview creator={heroCreator} /></section>

    </SectionBand>
    <SectionBand tone="white">
    <section id="how-it-works" className={styles.journey} aria-labelledby="journey-title"><div className={styles.journeyHeading}><p className={styles.eyebrow}>Less back and forth. More clarity.</p><h2 id="journey-title">From the first look<br />to the next step.</h2></div><div className={styles.journeyCards}>{[
      { number: "01", Icon: Search, title: "Find the right fit", text: "Explore creators by platform, niche, and audience. Open a profile for a closer look.", href: "/creators", action: "Discover creators" },
      { number: "02", Icon: SlidersHorizontal, title: "Understand the numbers", text: "Compare platform performance, pricing ranges, and the content behind the metrics.", href: calculator, action: "Explore the calculator" },
      { number: "03", Icon: FileText, title: "Put the terms in place", text: "Turn the agreed scope, content rights, and payment terms into a creator agreement.", href: "/instant", action: "Build an agreement" },
    ].map(item => <article key={item.number}><div className={styles.journeyCardTop}><item.Icon size={20} aria-hidden="true" /><span>{item.number}</span></div><h3>{item.title}</h3><p>{item.text}</p><Link href={item.href}>{item.action}<ArrowRight size={14} aria-hidden="true" /></Link></article>)}</div></section>

    </SectionBand>
    <SectionBand tone="gray">
    <CreatorDiscovery creators={spotlightCreators} />
    <figure className={styles.communityBanner}>
      <div className={styles.communityBannerImage}><img src="/images/creator-community-banner-v3.webp" alt="Technology, food, fashion, and fitness creators recording with smartphones, ring lights, cameras, and studio lights." width={2172} height={362} loading="lazy" decoding="async" /></div>
      <figcaption>Different passions. The right partnership.</figcaption>
    </figure>
    </SectionBand>
    <SectionBand tone="white"><HomeNicheExplorer /></SectionBand>

    <SectionBand tone="gray">
    <section className={styles.methodSection} aria-labelledby="method-title"><div className={styles.methodIntro}><p className={styles.eyebrow}>Understand what is behind the numbers</p><h2 id="method-title">An estimate should<br />come with an explanation.</h2><p className={styles.sectionDescription}>See the pricing range, explore the performance samples, and keep the commercial context in view.</p><Link href={`${calculator}#calculator-methodology`} className={styles.inlineLink}>How our estimates work<ArrowRight size={15} aria-hidden="true" /></Link></div><div className={styles.methodCards}><article><div className={styles.methodIcon}><SlidersHorizontal size={20} aria-hidden="true" /></div><h3>A calculation engine for pricing</h3><p>Our benchmarks are calibrated using creator surveys, direct pricing research, case studies, agency deal history, and contract data.</p><div className={styles.evidenceTags}><span>Creator research</span><span>Agency deal history</span><span>Contract data</span></div><p className={styles.methodFoot}><Check size={14} aria-hidden="true" />AI does not calculate these prices.</p></article><article><div className={styles.methodIcon}><Sparkles size={20} aria-hidden="true" /></div><h3>AI for creator insights</h3><p>AI interprets supplied profile and supporting data to surface audience interests, content themes, and commercial signals.</p><div className={styles.evidenceTags}><span>Audience</span><span>Content</span><span>Brand fit</span></div><p className={styles.methodFoot}>Inferred insights, not measured conversions.</p></article></div><p className={styles.methodDisclaimer}>Estimated rates are negotiation benchmarks. Final prices and terms are agreed with the creator.</p></section>

    </SectionBand>
    <SectionBand tone="white"><ContractPreview /></SectionBand>

    <SectionBand tone="gray">
    <section className={styles.faqSection} aria-labelledby="faq-title"><div><p className={styles.eyebrow}>A few useful answers</p><h2 id="faq-title">Before you begin.</h2><p className={styles.sectionDescription}>A little context for your next collaboration.</p><div className={styles.faqImage} role="img" aria-label="A creator and brand partner reviewing a campaign brief together in a studio" /></div><div className={styles.faqList}>{faqs.map(item => <details key={item.question}><summary>{item.question}<ChevronDown size={17} aria-hidden="true" /></summary><p>{item.answer}</p></details>)}</div></section>

    </SectionBand>
    <SectionBand tone="white">
    <section className={styles.closing} aria-labelledby="closing-title"><div><p className={styles.eyebrow}>Start with a creator. See the bigger picture.</p><h2 id="closing-title">Your next collaboration,<br />with a little more clarity.</h2></div><div><ArrowLink href={calculator}>Calculate creator rates</ArrowLink><Link href="/creators" className={styles.closingSecondary}>Or explore the creator directory<ArrowRight size={14} aria-hidden="true" /></Link></div></section>
    </SectionBand>
  </main>;
}
