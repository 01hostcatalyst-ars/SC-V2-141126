"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronDown, ExternalLink, FileText, Info, Mail, ShieldCheck, ChevronLeft } from "lucide-react";
import type { FullResolvedCreatorProfile, PlatformResolvedState } from "@/lib/creators/profile-resolver";
import type { GeneratedPackage } from "@/lib/calculator/packages";
import type { Platform } from "@/lib/calculator/types";
import { resolveAudienceCountry } from "@/lib/creators/audience-country";
import { PlatformBadge } from "@/components/icons/PlatformIcons";
import { CreatorPriceRange } from "./CreatorPriceRange";
import { buildPerformanceSamples, type PerformanceSampleGroup } from "@/lib/creators/performance-samples";
import { ProfileRefreshButton } from "./ProfileRefreshButton";
import { ProfileClaimButton } from "@/app/creators/[slug]/ProfileClaimButton";
import { ExportPdfButton } from "@/app/creators/[slug]/ExportPdfButton";

const NAV = [
  ["overview", "Overview"], ["rates", "Platforms & rates"], ["audience", "Audience"],
  ["content", "Content"], ["packages", "Packages"], ["brand-fit", "Brand fit"],
];
const PLATFORM_NAMES = { youtube: "YouTube", instagram: "Instagram", tiktok: "TikTok" };
const RATE_LABELS: Record<string, string> = { yt_dedicated: "Long Form", yt_integrated: "Integration", yt_short: "Shorts", ig_reel: "Reel", ig_carousel: "Carousel", ig_static: "Static post", ig_story: "Story set", tiktok_video: "TikTok" };
const BUYER_HELP = "Indicates the audience’s likely interest in purchasing products relevant to this creator. AI analyzes the profile and available supporting data to identify audience interests and commercial signals. This is an evidence-informed assessment, not measured conversions or a guarantee of sales.";

function compact(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) return "Unavailable";
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}
function percent(value: number | undefined) {
  return value !== undefined && Number.isFinite(value) ? `${Number(value.toFixed(2))}%` : "Unavailable";
}
function platformUrl(platform: Platform, handle: string) {
  const clean = handle.replace(/^@+/, "");
  return platform === "youtube" ? `https://www.youtube.com/@${clean}` : platform === "instagram" ? `https://www.instagram.com/${clean}` : `https://www.tiktok.com/@${clean}`;
}
function Help({ text, label }: { text: string; label: string }) {
  const id = useId();
  const [dismissed, setDismissed] = useState(false);
  return <span className="profile-help" data-dismissed={dismissed} onMouseEnter={() => setDismissed(false)} onMouseLeave={() => setDismissed(false)}>
    <button type="button" aria-label={label} aria-describedby={id} onFocus={() => setDismissed(false)} onClick={() => setDismissed(false)} onKeyDown={(e) => { if (e.key === "Escape") setDismissed(true); }}><Info aria-hidden="true" size={13} /></button>
    <span id={id} role="tooltip">{text}</span>
  </span>;
}
function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return <div className="profile-section-heading"><p className="profile-eyebrow">{eyebrow}</p><h2>{title}</h2>{description && <p className="profile-muted">{description}</p>}</div>;
}
function Fact({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return <div className="profile-fact"><dt>{label}</dt><dd>{children || "Not available"}</dd></div>;
}
function Chips({ values }: { values: string[] }) {
  return <div className="profile-chips">{values.map((value, index) => <span key={`${value}-${index}`}>{value}</span>)}</div>;
}
function Country({ value }: { value?: string }) {
  const country = resolveAudienceCountry(value);
  if (!country) return <span>Not available</span>;
  return <span className="profile-country">{country.code && <img src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`} width={12} height={12} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />}{country.name}</span>;
}

function PlatformOverview({ data }: { data: PlatformResolvedState }) {
  return <article className="profile-platform-overview">
    <div className="profile-card-kicker"><PlatformBadge platform={data.platform} size="sm" /><span>{PLATFORM_NAMES[data.platform]}</span><a href={platformUrl(data.platform, data.handle)} target="_blank" rel="noopener noreferrer" aria-label={`Open ${PLATFORM_NAMES[data.platform]} account`}><ExternalLink size={13} /></a></div>
    <p className="profile-platform-audience" title={data.followerCount.toLocaleString("en-US")}>{compact(data.followerCount)} <span>{data.platform === "youtube" ? "subscribers" : "followers"}</span></p>
    <p className="profile-handle">@{data.handle.replace(/^@+/, "")}</p>
    <dl className="profile-overview-metrics">{data.platform === "youtube" ? <><Fact label="LF engagement">{percent(data.lfEr)}</Fact><Fact label="SF engagement">{percent(data.sfEr)}</Fact></> : <Fact label="Engagement rate">{percent(data.observedEr)}</Fact>}</dl>
  </article>;
}

function YoutubeComparison({ data }: { data: PlatformResolvedState }) {
  const rows = [{ name: "Long form", value: data.avgViews }, { name: "Shorts", value: data.avgShortViews }].filter((row): row is { name: string; value: number } => typeof row.value === "number" && Number.isFinite(row.value) && row.value >= 0);
  const max = Math.max(...rows.map((row) => row.value), 1);
  if (rows.length < 2) return null;
  return <details className="profile-inline-details"><summary>Compare long-form & Shorts inputs<ChevronDown size={14} aria-hidden="true" /></summary><div className="profile-comparison">
    <p className="profile-small-note">Average views used in the current profile. Existing benchmark fallbacks may apply when observed metrics are unavailable.</p>
    {rows.map((row) => <div key={row.name} className="profile-comparison-row"><span>{row.name}</span><div className="profile-comparison-track"><span style={{ width: `${row.value / max * 100}%` }} /></div><strong title={row.value.toLocaleString("en-US")}>{compact(row.value)}</strong></div>)}
  </div></details>;
}

function sampleDate(value?: string) {
  if (!value || !Number.isFinite(Date.parse(value))) return "Unavailable";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function PlatformRates({ data, profile }: { data: PlatformResolvedState; profile: FullResolvedCreatorProfile }) {
  const groups = buildPerformanceSamples(profile.recentMedia, profile.platforms).filter((group) => group.id.startsWith(data.platform));
  return <article className="profile-panel profile-rate-panel">
    <div className="profile-rate-header"><div className="profile-platform-title"><PlatformBadge platform={data.platform} size="sm" /><div><h3>{PLATFORM_NAMES[data.platform]}</h3><a className="profile-handle" href={platformUrl(data.platform, data.handle)} target="_blank" rel="noopener noreferrer">@{data.handle.replace(/^@+/, "")}<ExternalLink size={11} /></a></div></div>
      <dl className="profile-rate-facts"><Fact label={data.platform === "youtube" ? "Subscribers" : "Followers"}>{compact(data.followerCount)}</Fact>{data.platform === "youtube" ? <><Fact label="LF engagement">{percent(data.lfEr)}</Fact><Fact label="SF engagement">{percent(data.sfEr)}</Fact></> : <Fact label="Engagement rate">{percent(data.observedEr)}</Fact>}</dl>
    </div>
    <div className="profile-rate-workspace"><div className="profile-rate-estimates"><h3>Estimated rates</h3><div className="profile-rate-list">{data.rates.map((rate) => <div key={rate.format} data-format={rate.format} data-typical={rate.recommendedAmount} data-low={rate.lowAmount} data-high={rate.highAmount}><CreatorPriceRange rate={rate} label={RATE_LABELS[rate.format] || rate.label} /></div>)}</div>{data.platform === "youtube" && <YoutubeComparison data={data} />}</div>
      <PerformanceSamples groups={groups} collectedAt={profile.recentMedia.collectedAt?.[data.platform]} />
    </div>
  </article>;
}

function PerformanceSamples({ groups, collectedAt }: { groups: PerformanceSampleGroup[]; collectedAt?: string }) {
  const [format, setFormat] = useState("");
  const [selected, setSelected] = useState(0);
  const slider = useRef<HTMLDivElement>(null);
  const chartId = useId();
  const group = groups.find((tab) => tab.id === format) || groups[0];
  const select = (index: number) => {
    setSelected(index);
    const container = slider.current;
    const card = container?.children[index] as HTMLElement | undefined;
    if (container && card) container.scrollTo({ left: card.offsetLeft - (container.children[0] as HTMLElement).offsetLeft, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  return <div className="profile-performance-samples">
    <div className="profile-panel-top"><h3>Performance samples</h3><div className="profile-sample-controls"><span className="profile-small-note">{group?.items.length || 0} core samples</span><button type="button" aria-label="Previous sample" disabled={!group || selected === 0} onClick={() => select(selected - 1)}><ChevronLeft size={15} /></button><button type="button" aria-label="Next sample" disabled={!group || selected >= group.items.length - 1} onClick={() => select(selected + 1)}><ArrowRight size={15} /></button></div></div>
    {groups.length > 1 && <div className="profile-segmented profile-sample-tabs" role="group" aria-label="YouTube sample format">{groups.map((tab) => <button key={tab.id} type="button" aria-pressed={group.id === tab.id} onClick={() => { setFormat(tab.id); setSelected(0); slider.current?.scrollTo({ left: 0 }); }}>{tab.id === "youtube-long" ? "Long Form" : "Shorts"}</button>)}</div>}
    {group ? <><p className="profile-sample-context">{group.metricLabel} per {group.unit} · Collected {sampleDate(collectedAt)}</p>
      <figure className="profile-upload-chart"><svg viewBox="0 0 640 190" role="group" aria-labelledby={`${chartId}-title`}><title id={`${chartId}-title`}>{group.metricLabel} for {group.items.length} {group.label} calculation samples</title>{[0, 1, 2].map((i) => <line key={i} x1="12" x2="628" y1={30 + i * 55} y2={30 + i * 55} stroke="currentColor" className="profile-chart-grid" />)}{group.items.map((item, index) => {
        if (item.metric === undefined) return null;
        const max = Math.max(...group.items.map((sample) => sample.metric || 0), 1);
        const slot = 600 / group.items.length;
        const height = item.metric / max * 100;
        return <g key={item.id || index} role="button" tabIndex={0} aria-label={`Sample ${index + 1}: ${item.title}, ${compact(item.metric)} ${group.metricLabel.toLowerCase()}`} aria-pressed={selected === index} onClick={() => select(index)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(index); } }} className={`profile-sample-bar ${selected === index ? "is-selected" : ""}`}><title>{item.title}: {item.metric.toLocaleString("en-US")} {group.metricLabel.toLowerCase()}</title><rect x={20 + slot * index + slot * .2} y="10" width={slot * .6} height="170" fill="transparent" /><rect x={20 + slot * index + slot * .22} y={140 - height} width={slot * .56} height={Math.max(height, item.metric > 0 ? 1 : 0)} rx="4" className="profile-chart-bar" /><text x={20 + slot * (index + .5)} y={130 - height} textAnchor="middle" className="profile-chart-value">{compact(item.metric)}</text><text x={20 + slot * (index + .5)} y="165" textAnchor="middle" className="profile-chart-label">{index + 1}</text></g>;
      })}</svg><figcaption>Core calculation samples · select a bar to explore its content.</figcaption></figure>
      <div className="profile-sample-slider" ref={slider} key={group.id} onScroll={() => { const container = slider.current; if (!container) return; const first = container.children[0] as HTMLElement; let nearest = 0; let distance = Infinity; Array.from(container.children).forEach((child, index) => { const delta = Math.abs((child as HTMLElement).offsetLeft - first.offsetLeft - container.scrollLeft); if (delta < distance) { nearest = index; distance = delta; } }); setSelected(nearest); }} aria-label={`${group.label} calculation sample cards`}>
        {group.items.map((item, index) => <article key={item.id || index} className={`profile-sample-card ${selected === index ? "is-selected" : ""}`} aria-label={`Sample ${index + 1}`}><div className="profile-sample-card-title"><span>{index + 1}</span><h4 title={item.title}>{item.title}</h4>{item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`View original ${group.unit}: ${item.title}`}><ExternalLink size={13} /></a>}</div>
          <dl className="profile-sample-metrics">{([["Views", item.views], ["Likes", item.likes], ["Comments", item.comments], ["Shares", item.shares], ["ER", item.engagementRate]] as const).filter(([, value]) => value !== undefined).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{label === "ER" ? percent(value) : compact(value)}</dd></div>)}</dl>
          <p className="profile-sample-dates">Posted {sampleDate(item.publishedAt)} · Collected {sampleDate(collectedAt)}</p>
        </article>)}
      </div><div className="profile-sample-dots" role="group" aria-label="Choose a calculation sample">{group.items.map((item, index) => <button type="button" key={item.id || index} aria-label={`Go to sample ${index + 1}`} aria-pressed={selected === index} onClick={() => select(index)} />)}</div>
    </> : <p className="profile-empty">No core calculation samples available for this platform.</p>}
  </div>;
}

function PackageCard({ pkg, onCopy, copied }: { pkg: GeneratedPackage; onCopy?: (pkg: GeneratedPackage) => void; copied?: boolean }) {
  const items = pkg.calibratedDeliverables?.length ? pkg.calibratedDeliverables : pkg.deliverables.map((d) => ({ ...d, totalStandaloneFormatted: "" }));
  return <details className="profile-package" data-package={pkg.id} data-typical={pkg.pricing.typicalMedian}>
    <summary><div><div className="profile-package-title"><h3>{pkg.name}</h3>{pkg.isRecommended && <span className="profile-pink-badge">Recommended</span>}</div><p>{pkg.objective}</p><span className="profile-small-note">{items.length} deliverable {items.length === 1 ? "line" : "lines"} · {pkg.tag}</span></div><div className="profile-package-price"><strong>{pkg.pricing.recommendedBundleFormatted || pkg.pricing.typicalFormatted}</strong><span>{pkg.pricing.lowFormatted} – {pkg.pricing.highFormatted}</span></div><ChevronDown size={16} className="profile-details-chevron" aria-hidden="true" /></summary>
    <div className="profile-package-body">
      {pkg.recommendationHeadline && <p className="profile-package-recommendation">{pkg.recommendationHeadline}</p>}{pkg.recommendationReason && <p>{pkg.recommendationReason}</p>}{pkg.strategicRationale && <p>{pkg.strategicRationale}</p>}
      <dl className="profile-package-financials"><Fact label="Standalone benchmark">{pkg.pricing.standaloneBenchmarkFormatted || pkg.pricing.typicalFormatted}</Fact><Fact label="Bundle target">{pkg.pricing.recommendedBundleFormatted || pkg.pricing.typicalFormatted}</Fact><Fact label="Bundle efficiency">{pkg.discountPercentApplied}%</Fact></dl>
      <h4>Included deliverables</h4><div className="profile-package-deliverables">{items.map((item, index) => <div key={item.id || index}><p className="profile-small-note">{item.phase} · {item.platform}</p><strong>{item.quantity}× {item.title.replace(/^\d+x\s*/i, "")}</strong><p>{item.description}</p>{item.totalStandaloneFormatted && <p className="profile-item-price">Standalone: {item.totalStandaloneFormatted}</p>}</div>)}</div>
      {!!pkg.entitlements.length && <><h4>Rights & inclusions</h4><div className="profile-insight-list">{pkg.entitlements.map((item, i) => <div key={i}><strong>{item.label}</strong><p>{item.detail}</p></div>)}</div></>}
      {!!pkg.adConcepts?.length && <><h4>Creative concepts</h4><div className="profile-insight-list">{pkg.adConcepts.map((concept, i) => <div key={i}><strong>{concept.conceptName}</strong><p className="profile-small-note">{concept.suggestedPlatform}</p><blockquote>{concept.hookVerbatim}</blockquote><p>{concept.angleSummary}</p>{concept.visualDirection && <p>{concept.visualDirection}</p>}</div>)}</div></>}
      {!!pkg.concreteAssets?.length && <><h4>Asset specifications</h4><ul className="profile-bullet-list">{pkg.concreteAssets.map((asset, i) => <li key={i}>{asset.specification}</li>)}</ul></>}
      {!!pkg.collaborationGuidelines?.length && <><h4>Collaboration guidelines</h4><div className="profile-insight-list">{pkg.collaborationGuidelines.map((guide, i) => <div key={i}><strong>{guide.ruleNumber || i + 1}. {guide.ruleTitle}</strong><p>{guide.directive}</p><p className="profile-small-note">Risk: {guide.commercialRisk}</p></div>)}</div></>}
      {onCopy && <button type="button" className="profile-export-action" onClick={() => onCopy(pkg)}>{copied ? "Proposal copied" : "Copy campaign proposal"}</button>}
    </div>
  </details>;
}

export function CreatorProfileView({ profile, pdfPayload, calculator }: {
  profile: FullResolvedCreatorProfile;
  pdfPayload?: React.ComponentProps<typeof ExportPdfButton>["payload"];
  calculator?: {
    controls: React.ReactNode;
    notices?: React.ReactNode;
    contractUrl: string;
    onNewSearch: () => void;
    onExport: () => void;
    isExporting: boolean;
    onLink: () => void;
    onCopyPackage: (pkg: GeneratedPackage) => void;
    copiedPackageId: string | null;
  };
}) {
  const [activeSection, setActiveSection] = useState("overview");
  const [imageFailed, setImageFailed] = useState(false);
  const channels = ([profile.platforms.youtube, profile.platforms.instagram, profile.platforms.tiktok]).filter((item): item is PlatformResolvedState => Boolean(item));
  const intel = profile.intelligence;
  const contractUrl = calculator?.contractUrl || `/instant?creatorName=${encodeURIComponent(profile.brandName)}&platform=${profile.primaryPlatform}&followers=${profile.combinedFollowers}`;
  const name = profile.brandName || profile.canonicalName;
  const sections = NAV.filter(([id]) => id !== "packages" || profile.omnichannelPackages.length);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = "overview";
      for (const [id] of sections) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= (window.innerWidth < 900 ? 156 : 110)) current = id;
      }
      setActiveSection(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
    // Section IDs are fixed for a resolved profile.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.slug]);

  const Container = calculator ? "div" : "main";
  return <Container className={`creator-profile-page${calculator ? " calculator-profile-results" : ""}`} data-range-style="soft">
    {!calculator && <nav className="profile-breadcrumb" aria-label="Breadcrumb"><Link href="/creators"><ArrowLeft size={13} aria-hidden="true" />Creators</Link><span aria-hidden="true">/</span><span>{name}</span></nav>}
    <div className="profile-layout">
      <aside className="profile-identity-panel">
        <div className="profile-identity-top"><div className="profile-portrait">{profile.avatarUrl && !imageFailed ? <img src={profile.avatarUrl} alt={name} referrerPolicy="no-referrer" onError={() => setImageFailed(true)} /> : <span>{name.charAt(0)}</span>}</div><div><p className="profile-eyebrow">Creator profile</p><h1>{name}</h1>{profile.canonicalName !== name && <p className="profile-muted">{profile.canonicalName}</p>}</div></div>
        {profile.isClaimed && <span className="profile-claim-status"><ShieldCheck size={13} aria-hidden="true" />Profile claimed</span>}
        <div className="profile-identity-niche"><span>{intel.primaryNicheName}</span>{intel.subNicheName && <p>{intel.subNicheName}</p>}</div>
        <dl className="profile-identity-facts"><Fact label="Primary audience"><Country value={intel.audience?.primaryMarket} /></Fact><Fact label="Creator type">{intel.creatorType}</Fact></dl>
        <div className="profile-social-links">{channels.map((channel) => <a key={channel.platform} href={platformUrl(channel.platform, channel.handle)} target="_blank" rel="noopener noreferrer"><PlatformBadge platform={channel.platform} size="sm" /><span>@{channel.handle.replace(/^@+/, "")}</span><ExternalLink size={12} aria-hidden="true" /></a>)}</div>
        {intel.oneLineSummary && <><p className="profile-identity-summary">{intel.oneLineSummary}</p><details className="profile-identity-about"><summary>About this creator<ChevronDown size={13} aria-hidden="true" /></summary><p>{intel.oneLineSummary}</p></details></>}
        {!calculator && <ProfileRefreshButton slug={profile.slug} freshness={profile.freshness} />}<div className="profile-identity-actions"><Link href={contractUrl} className="profile-primary-action"><FileText size={14} aria-hidden="true" />Create contract<ArrowRight size={14} aria-hidden="true" /></Link>{calculator ? <><button type="button" className="profile-export-action" disabled={calculator.isExporting} onClick={calculator.onExport}>{calculator.isExporting ? "Generating PDF…" : "Download rate card"}</button><button type="button" className="profile-export-action" onClick={calculator.onLink}>Link another account</button></> : pdfPayload && <ExportPdfButton payload={pdfPayload} buttonLabel="Download rate card" className="profile-export-action" />}{!calculator && !profile.isClaimed && <ProfileClaimButton isClaimed={profile.isClaimed} creator={{ id: profile.clusterId, canonicalName: profile.canonicalName, brandName: profile.brandName, slug: profile.slug, verifiedEmail: profile.verifiedEmail, youtubeHandle: profile.platforms.youtube?.handle, instagramUsername: profile.platforms.instagram?.handle, tiktokUsername: profile.platforms.tiktok?.handle }} />}{profile.verifiedEmail && <a href={`mailto:${profile.verifiedEmail}`} className="profile-contact-link"><Mail size={13} aria-hidden="true" /><span>{profile.verifiedEmail}</span></a>}</div>
      </aside>
      <div className="profile-main-column">
        {calculator && <>{calculator.notices}{calculator.controls}</>}
        <div className="profile-section-jump">{calculator && <button type="button" className="calculator-nav-search" onClick={calculator.onNewSearch}>New search<ArrowRight size={13} aria-hidden="true" /></button>}<label className={calculator ? "sr-only" : undefined} htmlFor="profile-section-select">Jump to section</label><div className="profile-jump-choice"><select id="profile-section-select" value={activeSection} onChange={(event) => { const id = event.target.value; setActiveSection(id); document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }); }} >{sections.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select><ChevronDown size={14} aria-hidden="true" /></div></div>
        <section id="overview" className="profile-section"><SectionHeading eyebrow="A closer look" title={`Meet ${name}`} description="Platform performance, audience insight, and commercial possibilities in one place." />
          <div className="profile-overview-grid">{channels.map((channel) => <PlatformOverview key={channel.platform} data={channel} />)}</div>
          {!channels.length && <p className="profile-empty">No platform metrics are available yet.</p>}
          {(intel.brandSummary || intel.detailedSummary) && <article className="profile-panel profile-summary"><p className="profile-eyebrow">The creator, at a glance</p><p>{intel.brandSummary || intel.oneLineSummary}</p>{intel.detailedSummary && intel.detailedSummary !== intel.brandSummary && <details className="profile-inline-details"><summary>Read the full profile<ChevronDown size={14} aria-hidden="true" /></summary><p>{intel.detailedSummary}</p></details>}{!!intel.microNiches.length && <details className="profile-inline-details"><summary>Explore creator topics<ChevronDown size={14} aria-hidden="true" /></summary><Chips values={intel.microNiches} /></details>}</article>}
        </section>
        <section id="rates" className="profile-section"><SectionHeading eyebrow="Platform by platform" title="Performance & estimated rates" description={`Pricing market: ${profile.countryName} · ${channels[0]?.rates[0]?.currency || profile.countryCode}. These are negotiation benchmarks, not confirmed creator quotes.`} /><div className="profile-rate-panels">{channels.map((channel) => <PlatformRates key={channel.platform} data={channel} profile={profile} />)}</div><p className="profile-small-note">Each format keeps its own inputs and estimate. YouTube long-form and Shorts are priced separately. AI does not calculate these prices.</p></section>
        <section id="audience" className="profile-section"><SectionHeading eyebrow="Who they reach" title="Audience intelligence" description="Evidence-informed audience insights, inferred from the profile and supporting data." /><article className="profile-panel"><dl className="profile-audience-grid"><Fact label="Demographic profile">{intel.audience?.demographicProfile}</Fact><Fact label={<span className="profile-label-with-help">Buyer intent<Help label="About buyer intent" text={BUYER_HELP} /></span>}>{intel.audience?.commercialBuyerIntent}</Fact><Fact label="Primary audience market"><Country value={intel.audience?.primaryMarket} /></Fact><Fact label="Secondary markets">{intel.audience?.secondaryMarkets?.join(", ")}</Fact></dl>{!!intel.audience?.interests?.length && <div className="profile-field-block"><h3>Audience interests</h3><Chips values={intel.audience.interests} /></div>}</article></section>
        <section id="content" className="profile-section"><SectionHeading eyebrow="Creative identity" title="Content & themes" description="Explore the creator’s formats, creative identity, and content themes." /><div className="profile-two-up"><article className="profile-panel"><h3>Content DNA</h3><dl className="profile-stacked-facts"><Fact label="Dominant format">{intel.content?.dominantFormat}</Fact><Fact label="Production standard">{intel.content?.productionStandard}</Fact><Fact label="Publishing consistency">{intel.content?.publishingConsistency}</Fact></dl></article><article className="profile-panel"><div className="profile-panel-top"><h3>Content themes</h3><Help label="About theme strength" text="These bars show inferred theme strength on a 0–100 scale. They are not measured audience percentages or shares of published content." /></div><p className="profile-small-note">Inferred strength · 0–100</p><div className="profile-theme-list">{intel.content?.themes.map((theme, index) => <div key={`${theme.name}-${index}`}><div><span>{theme.name}</span><strong>{theme.percentage}/100</strong></div><div className="profile-theme-track" role="img" aria-label={`${theme.name}: ${theme.percentage} out of 100 inferred strength`}><span style={{ width: `${Math.min(100, Math.max(0, Number(theme.percentage) || 0))}%` }} /></div></div>)}</div></article></div></section>
        {!!profile.omnichannelPackages.length && <section id="packages" className="profile-section"><SectionHeading eyebrow="Plan a partnership" title="Campaign packages" description="Suggested scopes with engine-calculated pricing. Open a package to explore its deliverables, rights, and strategy." /><div className="profile-package-list">{profile.omnichannelPackages.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} onCopy={calculator?.onCopyPackage} copied={calculator?.copiedPackageId === pkg.id} />)}</div></section>}
        <section id="brand-fit" className="profile-section"><SectionHeading eyebrow="Before you collaborate" title="Brand fit & considerations" description="Review the supplied commercial analysis alongside your own campaign requirements." /><article className="profile-panel"><dl className="profile-brand-facts"><Fact label="Commercial intent">{intel.brandFit?.commercialIntent}</Fact><Fact label="Brand suitability">{intel.brandFit?.brandSuitability}</Fact><Fact label="Safety assessment">{intel.brandSafety.overallRisk}</Fact></dl>{!!intel.brandFit?.bestFitCategories?.length && <div className="profile-field-block"><h3>Potential sponsor categories</h3><Chips values={intel.brandFit.bestFitCategories} /></div>}<p className="profile-small-note">Profile assessments are inferred insights, not an independent safety certification.</p></article>
          <div className="profile-two-up">{([{ name: "Strengths", items: intel.strengths }, { name: "Considerations", items: intel.considerations }]).map((group) => <article key={group.name} className="profile-panel"><h3>{group.name}</h3><div className="profile-insight-list">{group.items.length ? group.items.map((item, index) => <div key={index}><strong>{typeof item === "string" ? item : item.area}</strong>{typeof item !== "string" && <p>{item.description}</p>}</div>) : <p className="profile-empty">No additional details supplied.</p>}</div></article>)}</div>
          {intel.executiveBrief && <details className="profile-panel profile-executive"><summary><div><h3>Creator strategy brief</h3><p className="profile-small-note">Positioning, audience psychology, and collaboration guidance</p></div><ChevronDown className="profile-details-chevron" size={16} /></summary><div className="profile-insight-list">{Object.entries({ "Who they are": intel.executiveBrief.whoTheyAre, "Creative strength": intel.executiveBrief.theSuperpower, "Audience psychology": intel.executiveBrief.audiencePsychology, "Watch out for": intel.executiveBrief.theLandmine }).filter(([,value]) => value).map(([key,value]) => <div key={key}><strong>{key}</strong><p>{value}</p></div>)}{intel.executiveBrief.vanityVoucher && <p className="profile-small-note">Suggested voucher: {intel.executiveBrief.vanityVoucher}10</p>}</div></details>}
          {!!intel.brandSafety.observedRiskSignals?.length && <details className="profile-panel profile-executive"><summary>Review risk signals<ChevronDown className="profile-details-chevron" size={16} /></summary><ul className="profile-bullet-list">{intel.brandSafety.observedRiskSignals.map((signal, i) => <li key={i}>{signal}</li>)}</ul></details>}
        </section>
        <div className="profile-closing-panel"><div><p className="profile-eyebrow">Turn insight into a clear agreement</p><h2>Ready to shape the partnership?</h2><p>Set the scope, usage rights, and payment terms in a creator contract.</p></div><Link href={contractUrl} className="profile-primary-action">Create contract<ArrowRight size={15} aria-hidden="true" /></Link></div>
        <p className="profile-methodology">Rates are computed by SignCollab’s existing 16-knot pricing engine using platform performance and commercial inputs. Audience, content, and partnership insights are AI-assisted analysis. Estimates are benchmarks; the final scope and price are agreed between the parties.</p>
      </div>
      <aside className="profile-page-rail"><p>On this page</p><nav aria-label="Profile sections">{sections.map(([id, label]) => <a key={id} href={`#${id}`} aria-current={activeSection === id ? "location" : undefined} onClick={() => setActiveSection(id)}>{label}</a>)}</nav>{calculator && <button type="button" className="calculator-nav-search" onClick={calculator.onNewSearch}>New search<ArrowRight size={13} aria-hidden="true" /></button>}</aside>
    </div>
  </Container>;
}
