"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Search, X, TrendingUp, FileText, Sparkles, ShieldCheck, Columns3, Clock3 } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PILLARS, LEARNING_JOURNEYS, getClusterById, getPillarForCluster, AUDIENCE_TAGS } from "@/lib/academy-data";
import type { ArticleSummary } from "@/lib/gdocs";
import styles from "./Knowledge.module.css";

const icons = [TrendingUp, FileText, Sparkles, ShieldCheck, Columns3];
const matchesJourney = (article: ArticleSummary, steps: string[]) => steps.some(step => `${article.title} ${article.excerpt}`.toLowerCase().includes(step.toLowerCase()));

export default function AcademyClientPage({ initialArticles, companyName }: { initialArticles: ArticleSummary[]; companyName: string }) {
  const [topic, setTopic] = useState("all");
  const [query, setQuery] = useState("");
  const [journey, setJourney] = useState("");
  const topics = useMemo(() => PILLARS.map((pillar, index) => ({ ...pillar, Icon: icons[index], count: initialArticles.filter(article => getPillarForCluster(article.clusterId)?.id === pillar.id).length })).filter(pillar => pillar.count > 0), [initialArticles]);
  const journeys = useMemo(() => LEARNING_JOURNEYS.filter(path => initialArticles.some(article => matchesJourney(article, path.steps))), [initialArticles]);
  const selectedPath = journeys.find(path => path.id === journey);
  const filtered = useMemo(() => initialArticles.filter(article => {
    const needle = query.trim().toLowerCase();
    const text = `${article.title} ${article.excerpt} ${getClusterById(article.clusterId)?.name || ""} ${getPillarForCluster(article.clusterId)?.shortName || ""} ${article.audience}`.toLowerCase();
    return (!needle || text.includes(needle)) && (topic === "all" || getPillarForCluster(article.clusterId)?.id === topic) && (!selectedPath || matchesJourney(article, selectedPath.steps));
  }), [initialArticles, topic, query, selectedPath]);
  const reset = () => { setTopic("all"); setQuery(""); setJourney(""); };
  const featured = initialArticles[0];
  const active = topic !== "all" || Boolean(query.trim()) || Boolean(journey);

  return <div className={styles.page}>
    <PublicHeader activeRoute="/knowledge" />
    <main className={styles.library}>
      <section className={styles.hero} aria-labelledby="academy-title">
        <div>
          <span className={styles.eyebrow}>{companyName} Academy</span>
          <h1 id="academy-title">Know more.<br />Collaborate better.</h1>
          <p>Practical guides to creator pricing, contracts, and the business of working together.</p>
          <form className={styles.search} onSubmit={event => { event.preventDefault(); document.getElementById('guides')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }}>
            <Search size={19} aria-hidden="true" />
            <label htmlFor="knowledge-search" className="sr-only">Search guides</label>
            <input id="knowledge-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search a topic, question, or keyword" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={17} /></button>}
          </form>
          <span className={styles.heroHint}>{query.trim() ? <>{filtered.length} matching {filtered.length === 1 ? 'guide' : 'guides'} · <a href="#guides">View results →</a></> : <>{initialArticles.length} {initialArticles.length === 1 ? "guide" : "guides"} to explore · For creators, brands & agencies</>}</span>
        </div>
        {featured && <Link href={`/knowledge/${featured.slug}`} className={styles.featured}>
          <span className={styles.featuredTop}><span className={styles.icon}><BookOpen size={23} /></span><span>A useful place to start</span></span>
          <span className={styles.category}>{getClusterById(featured.clusterId)?.name || "Creator partnerships"}</span>
          <h2>{featured.title}</h2>
          <span className={styles.featuredBottom}><span><Clock3 size={14} /> {featured.readingTime || 5} min read</span><span className={styles.circleArrow}><ArrowRight size={19} /></span></span>
        </Link>}
      </section>

      {topics.length > 0 && <section className={styles.topicSection} aria-labelledby="topics-title">
        <div className={styles.sectionTop}><div><span className={styles.eyebrow}>Find your starting point</span><h2 id="topics-title">Explore by topic</h2></div><button className={styles.textButton} onClick={reset}>View all guides <ArrowRight size={16} /></button></div>
        <div className={styles.topics}>
          {topics.map(({ id, shortName, count, Icon }) => <button key={id} className={styles.topic} aria-pressed={topic === id} onClick={() => setTopic(topic === id ? "all" : id)}>
            <span className={styles.icon}><Icon size={21} /></span><strong>{shortName}</strong><span>{count} {count === 1 ? "guide" : "guides"}<ArrowRight size={15} /></span>
          </button>)}
        </div>
      </section>}

      <section id="guides" className={styles.guides} aria-labelledby="guides-title">
        <div className={styles.sectionTop}>
          <div><span className={styles.eyebrow}>The guide library</span><h2 id="guides-title">{topic === "all" ? "A little clarity goes a long way." : topics.find(item => item.id === topic)?.shortName}</h2></div>
          {journeys.length > 0 && <div className={styles.pathSelect}><label htmlFor="learning-path">Learning path</label><select id="learning-path" value={journey} onChange={event => setJourney(event.target.value)}><option value="">All learning paths</option>{journeys.map(path => <option key={path.id} value={path.id}>{path.name}</option>)}</select></div>}
        </div>
        <div className={styles.resultsBar}><p role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? "guide" : "guides"}{query.trim() ? ` matching “${query.trim()}”` : " to explore"}</p>{active && <button className={styles.textButton} onClick={reset}>Clear filters <X size={14} /></button>}</div>
        {selectedPath && <div className={styles.pathSummary}><BookOpen size={18} /><p><strong>{selectedPath.name}</strong><span>{selectedPath.steps.join(" · ")}</span></p></div>}
        {filtered.length ? <div className={styles.cards}>{filtered.map(article => <Link key={article.id} href={`/knowledge/${article.slug}`} className={styles.card}>
          <span className={styles.category}>{getClusterById(article.clusterId)?.name || "Creator partnerships"}</span>
          <h3>{article.title}</h3><p>{article.excerpt}</p>
          <div className={styles.cardAudience}>{AUDIENCE_TAGS[article.audience]?.label || article.audience || "Everyone"}</div>
          <div className={styles.cardBottom}><span><Clock3 size={14} />{article.readingTime || 5} min read</span><span>Read guide <ArrowRight size={16} /></span></div>
        </Link>)}</div> : <div className={styles.empty}><Search size={27} /><h3>{initialArticles.length ? "No guides found just yet." : "New guides are on their way."}</h3><p>Try another keyword or explore all available topics.</p>{active && <button className={styles.pinkButton} onClick={reset}>Clear filters <ArrowRight size={16} /></button>}</div>}
      </section>
      <section className={styles.cta}><div><span className={styles.eyebrow}>From reading to doing</span><h2>Put your next partnership in motion.</h2><p>Explore creator rates or turn your agreed terms into a contract.</p></div><div className={styles.ctaActions}><Link href="/influencer-rate-calculator" className={styles.pinkButton}>Explore rates <ArrowRight size={16} /></Link><Link href="/instant" className={styles.textButton}>Create a contract <ArrowRight size={16} /></Link></div></section>
    </main>
    <PublicFooter />
  </div>;
}
