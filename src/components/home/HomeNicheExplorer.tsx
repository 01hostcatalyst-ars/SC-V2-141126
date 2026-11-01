"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, BriefcaseBusiness, Car, Clapperboard, Dumbbell, Flower2, Gamepad2, GraduationCap, Hammer, HeartHandshake, House, Monitor, Music, Newspaper, Palette, PawPrint, Plane, Shirt, Smile, Sparkles, Trophy, Utensils, type LucideIcon } from "lucide-react";
import { PRIMARY_NICHES, SUB_NICHES } from "@/lib/calculator/constants";
import styles from "./HomeNicheExplorer.module.css";

const ICONS: Record<number, LucideIcon> = {
  1: House, 2: PawPrint, 3: BriefcaseBusiness, 4: Hammer, 5: GraduationCap,
  6: Monitor, 7: Plane, 8: Smile, 9: Utensils, 10: HeartHandshake,
  11: Dumbbell, 12: Shirt, 13: Sparkles, 14: Gamepad2, 15: Trophy,
  16: Newspaper, 17: Car, 18: Palette, 19: Music, 20: BookOpen,
  21: Clapperboard, 22: Flower2,
};
const FEATURED_IDS = [6, 8, 11, 12, 9, 7, 13, 14];
// Homepage labels only; the source taxonomy and directory filters stay unchanged.
const SHORT_SUB_NICHE_NAMES: Record<number, string> = {
  101: "Architecture & Renovation", 102: "Furniture & Room Styling", 103: "Smart Homes & Lighting",
  201: "Dog & Cat Training", 202: "Veterinary Care & Nutrition", 203: "Pet Comedy & Lifestyle",
  301: "Budgeting & Credit", 302: "Stocks, Property & Crypto", 303: "B2B SaaS & Startups",
  401: "Woodworking & Furniture", 402: "Car Repair & Restoration", 403: "Home Improvement",
  501: "Coding & Tech Careers", 502: "Leadership & Coaching", 503: "Languages & Education",
  601: "Mobile Tech & Audio", 602: "PC Builds & Hardware", 603: "AI & SaaS Automation",
  701: "Luxury Resorts & Travel", 702: "Camping & Overlanding", 703: "Backpacking & Hostels",
  801: "Daily Routines & Vlogs", 802: "Comedy & Parody", 803: "Culture & Video Essays",
  901: "Meal Prep & Recipes", 902: "Cooking & Artisan Baking", 903: "Coffee, Wine & Mixology",
  1001: "Pregnancy & Newborns", 1002: "Toddler Toys & Learning", 1003: "Family Travel",
  1101: "Bodybuilding & Gym", 1102: "Yoga, Pilates & Mobility", 1103: "Longevity & Nutrition",
  1201: "Luxury Fashion & Tailoring", 1202: "Streetwear & Sneakers", 1203: "Everyday Fashion",
  1301: "Dermatology & Skincare", 1302: "Luxury Fragrance", 1303: "Makeup & Swatches",
  1401: "Competitive Esports", 1402: "Game Reviews & Guides", 1403: "Live Variety Gaming",
  1501: "Team Sports & Leagues", 1502: "Combat Sports & Racing", 1503: "Golf & Racket Sports",
  1601: "Geopolitics & History", 1602: "News & Media Literacy", 1603: "Investigative Journalism",
  1701: "Car Reviews & EVs", 1702: "Supercars & Luxury Cars", 1703: "Motorcycles & Off-Road",
  1801: "Photography & Filmmaking", 1802: "Video Editing & VFX", 1803: "Illustration & Design",
  1901: "Music Production & Audio", 1902: "Music Lessons & Covers", 1903: "Dance & Choreography",
  2001: "Fiction & BookTok", 2002: "Non-Fiction & Summaries", 2003: "Writing & Self-Publishing",
  2101: "Anime Reviews & Lore", 2102: "Cosplay & Prop Making", 2103: "Film, TV & Pop Culture",
  2201: "Manifestation & Mindset", 2202: "Astrology & Tarot", 2203: "Meditation & Breathwork",
};
// Use the same active taxonomy and IDs as the directory's niche filter.
const orderedNiches = [
  ...FEATURED_IDS.flatMap(id => PRIMARY_NICHES.filter(niche => niche.id === id)),
  ...PRIMARY_NICHES.filter(niche => !FEATURED_IDS.includes(niche.id)),
];

export function HomeNicheExplorer() {
  const [range, setRange] = useState({ start: 0, end: 6 });
  const rail = useRef<HTMLDivElement>(null);
  const gridId = useId();
  const measure = useCallback(() => {
    const container = rail.current;
    if (!container?.firstElementChild) return;
    const gap = parseFloat(getComputedStyle(container).columnGap) || 0;
    const step = container.firstElementChild.getBoundingClientRect().width + gap;
    const visible = Math.max(1, Math.round((container.clientWidth + gap) / step));
    const start = Math.min(Math.max(0, orderedNiches.length - visible), Math.max(0, Math.round(container.scrollLeft / step)));
    const end = Math.min(start + visible, orderedNiches.length);
    setRange(previous => previous.start === start && previous.end === end ? previous : { start, end });
  }, []);
  useEffect(() => {
    const container = rail.current;
    if (!container) return;
    const observer = new ResizeObserver(measure);
    observer.observe(container); measure();
    return () => observer.disconnect();
  }, [measure]);
  const move = (direction: number) => {
    const container = rail.current;
    if (!container?.firstElementChild) return;
    const step = container.firstElementChild.getBoundingClientRect().width + (parseFloat(getComputedStyle(container).columnGap) || 0);
    container.scrollBy({ left: direction * step, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  return <section className={styles.section} id="explore-niches" aria-labelledby="niche-explorer-title">
    <div className={styles.heading}>
      <p className={styles.eyebrow}>Explore by niche</p>
      <h2 id="niche-explorer-title">Find your corner of the creator world.</h2>
      <p className={styles.description}>From broad categories to specialist interests, find creators relevant to your brand.</p>
    </div>
    <div className={styles.toolbar}>
      <span role="status">{range.start + 1}–{range.end} of {orderedNiches.length} niches</span>
      <div className={styles.controls}><button type="button" aria-label="Previous niches" aria-controls={gridId} disabled={range.start === 0} onClick={() => move(-1)}><ArrowLeft size={16} aria-hidden="true" /></button><button type="button" aria-label="Next niches" aria-controls={gridId} disabled={range.end === orderedNiches.length} onClick={() => move(1)}><ArrowRight size={16} aria-hidden="true" /></button></div>
    </div>
    <div className={styles.grid} id={gridId} ref={rail} onScroll={measure} tabIndex={0} role="group" aria-label="Browse niche cards" onKeyDown={event => { if (event.target !== event.currentTarget || !["ArrowLeft", "ArrowRight"].includes(event.key)) return; event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); }}>
      {orderedNiches.map(niche => {
        const Icon = ICONS[niche.id] || Sparkles;
        const subNiches = SUB_NICHES.filter(subNiche => subNiche.primaryNicheId === niche.id).slice(0, 3);
        return <article key={niche.id} className={styles.card}>
          <div className={styles.cardHeading}><div className={styles.icon}><Icon size={17} strokeWidth={1.65} aria-hidden="true" /></div><h3 title={niche.name}>{niche.name}</h3></div>
          <ul className={styles.subNiches} aria-label={`${niche.name} specialisms`}>
            {subNiches.map(subNiche => <li key={subNiche.id} title={subNiche.name}>{SHORT_SUB_NICHE_NAMES[subNiche.id] || subNiche.name}</li>)}
          </ul>
          <Link href={`/creators?nicheId=${niche.id}`} className={styles.link} aria-label={`Explore ${niche.name} creators`}><span>Explore creators</span><ArrowRight size={14} aria-hidden="true" /></Link>
        </article>;
      })}
    </div>
    <div className={styles.footer}>
      <p>Choose a niche to explore creators. Specialisms show the range within each category.</p>
    </div>
  </section>;
}
