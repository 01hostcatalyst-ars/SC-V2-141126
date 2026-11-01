"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
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

function SliderRow({ creators, visible, reverse = false, paused, step }: { creators: HomeSpotlightCreator[]; visible: number; reverse?: boolean; paused: boolean; step: { id: number; delta: number } }) {
  const count = creators.length;
  const canSlide = count > visible;
  const [index, setIndex] = useState(reverse && canSlide ? count : 0);
  const [animate, setAnimate] = useState(true);
  useEffect(() => {
    if (!step.id || !canSlide) return;
    setAnimate(false);
    setIndex(value => (value + step.delta * (reverse ? -1 : 1) + count) % count);
  }, [step, canSlide, count, reverse]);
  useEffect(() => {
    if (paused || !canSlide) return;
    const timer = setInterval(() => { setAnimate(true); setIndex(value => value + (reverse ? -1 : 1)); }, 4500);
    return () => clearInterval(timer);
  }, [paused, reverse, canSlide]);
  const cards = canSlide ? [...creators, ...creators] : creators;
  return <div className={styles.viewport}>
    <div className={styles.track} style={{ "--visible": visible, transform: `translateX(calc(${index} * -1 * (100% + 16px) / ${visible}))`, transition: animate ? undefined : "none" } as React.CSSProperties} onTransitionEnd={event => {
      if (event.target !== event.currentTarget || event.propertyName !== "transform") return;
      if ((!reverse && index === count) || (reverse && index === 0)) { setAnimate(false); setIndex(reverse ? count : 0); }
    }}>
      {cards.map((creator, position) => <div className={styles.slide} key={`${creator.slug}-${position}`} inert={position < index || position >= index + visible} aria-hidden={position < index || position >= index + visible}><SpotlightCard creator={creator} /></div>)}
    </div>
  </div>;
}

export function CreatorSpotlightSlider({ creators }: { creators: HomeSpotlightCreator[] }) {
  const [mobile, setMobile] = useState(false);
  const [manualPause, setManualPause] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [step, setStep] = useState({ id: 0, delta: 1 });
  useEffect(() => {
    const screen = matchMedia("(max-width: 800px)");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setMobile(screen.matches); setReducedMotion(motion.matches); };
    update(); screen.addEventListener("change", update); motion.addEventListener("change", update);
    return () => { screen.removeEventListener("change", update); motion.removeEventListener("change", update); };
  }, []);
  const paused = manualPause || hovered || focused || reducedMotion;
  const move = (delta: number) => { setManualPause(true); setStep(value => ({ id: value.id + 1, delta })); };
  return <div className={styles.slider} role="region" aria-label="Creator spotlights" aria-roledescription="carousel">
    <div className={styles.toolbar}><span>Meet creators from the directory</span><div className={styles.controls}><button type="button" aria-label="Previous creators" onClick={() => move(-1)}><ArrowLeft size={12} /></button><button type="button" aria-pressed={manualPause} disabled={reducedMotion} onClick={() => setManualPause(value => !value)}>{manualPause || reducedMotion ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}{manualPause || reducedMotion ? "Resume" : "Pause"}</button><button type="button" aria-label="Next creators" onClick={() => move(1)}><ArrowRight size={12} /></button></div></div>
    <div className={styles.rows} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }} onPointerDown={event => { if (event.pointerType === "touch") setManualPause(true); }}>
      {mobile ? <><SliderRow key="mobile-first" creators={creators.slice(0, 4)} visible={2} paused={paused} step={step} />{creators.length > 4 && <SliderRow key="mobile-second" creators={creators.slice(4, 8)} visible={2} reverse paused={paused} step={step} />}</> : <SliderRow key="desktop" creators={creators} visible={4} paused={paused} step={step} />}
    </div>
    <p className={styles.note}>Stored creator profiles · separate platform audiences · estimates, not confirmed quotes</p>
  </div>;
}
