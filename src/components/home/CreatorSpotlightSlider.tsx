"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { HomeSpotlightCreator } from "@/lib/home/spotlight-creators";
import { PlatformBadge } from "@/components/icons/PlatformIcons";
import { CreatorPriceRange } from "@/components/creators/CreatorPriceRange";
import styles from "./CreatorSpotlightSlider.module.css";

function SpotlightCard({ creator }: { creator: HomeSpotlightCreator }) {
  const [failed, setFailed] = useState(false);
  const name = creator.brandName || creator.canonicalName;
  const href = `/creators/${encodeURIComponent(creator.slug)}`;
  const rate = creator.flagshipRates?.[0];
  const rateLabel = rate && ({ yt_dedicated: "Long Form", yt_integrated: "Integration", yt_short: "Shorts", ig_reel: "Reel", ig_carousel: "Carousel", ig_static: "Static post", ig_story: "Story set", tiktok_video: "TikTok" } as Record<string, string>)[rate.format];
  const compact = (value: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  return <article className={styles.card}>
    <Link href={href} className={styles.identity}>
      <span className={styles.portrait}>{creator.avatarUrl && !failed ? <img src={creator.avatarUrl} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} /> : name.charAt(0)}</span>
      <span><h3>{name}</h3><span className={styles.niche}>{creator.primaryNicheName || "Creator profile"}</span></span>
    </Link>
    <div className={styles.metrics}>{(["youtube", "instagram", "tiktok"] as const).map(platform => {
      const metric = creator.platforms?.[platform];
      return metric ? <div key={platform}><PlatformBadge platform={platform} size="sm" /><strong>{compact(metric.followers)}</strong><span>{platform === "youtube" ? "subscribers" : "followers"}</span></div> : null;
    })}</div>
    <div className={styles.rate}>{rate ? <><span className={styles.label}>Estimated rate · {rate.currency}</span><CreatorPriceRange label={rateLabel || rate.label} rate={rate} /></> : <p>Explore available rates on the creator profile.</p>}</div>
    <div className={styles.audience}><span>Primary audience</span><strong>{creator.primaryAudienceCountry?.name || "Not available"}</strong></div>
    <Link href={href} className={styles.profileLink}>View profile<ArrowRight size={14} aria-hidden="true" /></Link>
  </article>;
}

export function CreatorSpotlightSlider({ creators }: { creators: HomeSpotlightCreator[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const railId = useId();
  const [controls, setControls] = useState({ previous: false, next: creators.length > 4 });
  const measure = useCallback(() => {
    const container = rail.current;
    if (!container) return;
    const previous = container.scrollLeft > 1;
    const next = container.scrollLeft < container.scrollWidth - container.clientWidth - 1;
    setControls(value => value.previous === previous && value.next === next ? value : { previous, next });
  }, []);
  useEffect(() => {
    const container = rail.current;
    if (!container) return;
    const observer = new ResizeObserver(measure);
    observer.observe(container); measure();
    return () => observer.disconnect();
  }, [measure, creators.length]);
  const move = (direction: number) => {
    const container = rail.current;
    if (!container?.firstElementChild) return;
    const step = container.firstElementChild.getBoundingClientRect().width + (parseFloat(getComputedStyle(container).columnGap) || 0);
    container.scrollBy({ left: direction * step, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  return <div className={styles.slider} role="region" aria-label="Creator spotlights" aria-roledescription="carousel">
    <div className={styles.toolbar}><span>Meet creators from the directory</span><div className={styles.controls}><button type="button" aria-label="Previous creators" aria-controls={railId} disabled={!controls.previous} onClick={() => move(-1)}><ArrowLeft size={16} aria-hidden="true" /></button><button type="button" aria-label="Next creators" aria-controls={railId} disabled={!controls.next} onClick={() => move(1)}><ArrowRight size={16} aria-hidden="true" /></button></div></div>
    <div className={styles.viewport} ref={rail} id={railId} onScroll={measure} tabIndex={0} role="group" aria-label="Browse creator profiles" onKeyDown={event => { if (event.target !== event.currentTarget || !["ArrowLeft", "ArrowRight"].includes(event.key)) return; event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); }}>
      {creators.map(creator => <div className={styles.slide} key={creator.slug}><SpotlightCard creator={creator} /></div>)}
    </div>
    <p className={styles.note}>Stored creator profiles · separate platform audiences · estimates, not confirmed quotes</p>
  </div>;
}
