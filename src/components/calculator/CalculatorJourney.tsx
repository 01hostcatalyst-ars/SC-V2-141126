"use client";

import { ArrowRight, Search, Check, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import type { Platform } from "@/lib/calculator/types";
import styles from "./CalculatorJourney.module.css";

type Channel = { status: "idle" | "loading" | "ready" | "error"; username?: string; error?: string };
const platformNames = { youtube: "YouTube", instagram: "Instagram", tiktok: "TikTok" };

export function CalculatorSearch({ error, query, onQuery, platform, onPlatform, showPlatforms, onSubmit }: {
  error?: string; query: string; onQuery: (value: string) => void; platform: Platform;
  onPlatform: (value: Platform) => void; showPlatforms: boolean; onSubmit: (event: React.FormEvent) => void;
}) {
  return <section className={`${styles.search} ${styles.enter}`}>
    <span className={styles.eyebrow}>Creator pricing, made clearer</span>
    <h1>What should this creator charge?</h1>
    <p className={styles.intro}>Explore estimated rates, platform performance, and audience insights. Start with one profile.</p>
    <form onSubmit={onSubmit} className={styles.form}>
      <label htmlFor="calculator-profile" className={styles.inputLabel}>Creator profile link or handle</label>
      <div className={styles.searchField}>
        <Search size={19} aria-hidden="true" />
        <input id="calculator-profile" maxLength={512} aria-invalid={Boolean(error)} aria-describedby="calculator-input-hint" value={query} onChange={event => onQuery(event.target.value)} placeholder="Paste a profile link or @handle" autoComplete="off" spellCheck={false} required />
        <button type="submit" disabled={!query.trim()}>Calculate rates <ArrowRight size={17} /></button>
      </div>
      {showPlatforms && <fieldset className={styles.platformPicker}>
        <legend>Which platform is this handle on?</legend>
        <div>{(Object.keys(platformNames) as Platform[]).map(key => <button type="button" key={key} aria-pressed={platform === key} onClick={() => onPlatform(key)}>{platformNames[key]}</button>)}</div>
      </fieldset>}
      <p id="calculator-input-hint" role={error ? "alert" : undefined} className={styles.hint} style={error ? { color: "#be185d" } : undefined}>{error || <>YouTube, Instagram & TikTok · Linked accounts are checked automatically.</>}</p>
    </form>
    <div className={styles.trust}><span>Research-backed pricing engine</span><span>Rates by content format</span><span>Audience & content insights</span></div>
    <p className={styles.disclosure}>Prices come from our calculation engine. AI helps interpret creator and audience data.</p>
  </section>;
}

export function CalculatorAnalysis({ complete = false, query, platforms, searching, resolving, synthesizing, intelligenceReady, onRetry, onNewSearch, onLink }: {
  complete?: boolean; query: string; platforms: Record<Platform, Channel>; searching: boolean; resolving: boolean;
  synthesizing: boolean; intelligenceReady: boolean; onRetry: () => void; onNewSearch: () => void; onLink: () => void;
}) {
  const channels = Object.values(platforms);
  const loading = channels.some(channel => channel.status === "loading");
  const ready = channels.filter(channel => channel.status === "ready").length;
  const failed = channels.filter(channel => channel.status === "error").length;
  const stopped = !searching && !resolving && !loading && !synthesizing && ready === 0 && failed > 0;
  const failureMessage = channels.find(channel => channel.status === 'error' && channel.error)?.error;
  const found = loading || ready > 0;
  const collected = ready > 0 && !loading && !searching && !resolving;
  const steps = [
    { label: "Find the creator & linked accounts", detail: "Checking the profile and available account links.", done: ready > 0 || complete, active: ready === 0 || resolving },
    { label: "Collect platform data", detail: "Gathering available profile and recent content metrics.", done: collected || complete, active: found && !collected },
    { label: complete && !intelligenceReady ? "Audience insights unavailable" : "Generate audience & content insights", unavailable: complete && !intelligenceReady, detail: complete && !intelligenceReady ? "Your report uses the available metrics and market settings." : "Interpreting the collected data for this creator.", done: intelligenceReady || complete, active: collected && !complete },
    { label: "Calculate rates & prepare your report", detail: "Applying our pricing engine to the available data.", done: complete, active: intelligenceReady && !complete },
  ];
  const completed = steps.filter(step => step.done).length;
  const current = steps.find(step => !step.done && step.active)?.label || "Preparing your report";
  return <section className={`${styles.analysis} ${styles.enter}`} aria-busy={!stopped && !complete}>
    <div className={styles.analysisHeading}><div><span className={styles.eyebrow}>Your creator report</span><h1>{stopped ? "We couldn’t collect this profile" : complete ? "Your report is ready." : "A clearer picture is taking shape."}</h1><p className={styles.target}>{query}</p></div><button className={styles.textButton} onClick={onNewSearch} disabled={!stopped}>New search <ArrowRight size={14} /></button></div>
    <div className={styles.analysisBody}>
      <div className={styles.visual}>
        <div className={`${styles.orbFrame} ${stopped || complete ? styles.paused : ""}`}>
          <svg viewBox="0 0 220 220" className={styles.ring} aria-hidden="true"><circle cx="110" cy="110" r="103" fill="none" stroke="#ececf0" strokeWidth="2" /><circle cx="110" cy="110" r="103" fill="none" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" strokeDasharray="647.17" strokeDashoffset={647.17 * (1 - completed / steps.length)} /></svg>
          <div className={styles.orb}><div /><i /></div>
        </div>
        <p className={styles.stageCount}>{stopped ? "Collection interrupted" : `${completed} of ${steps.length} stages complete`}</p>
        <p className={styles.visualHint}>The ring tracks completed stages.</p>
      </div>
      <ol className={styles.steps}>{steps.map((step, index) => <li key={step.label} data-state={step.unavailable ? "unavailable" : step.done ? "done" : stopped ? "waiting" : step.active ? "active" : "waiting"}>
        <span className={styles.stepIcon}>{step.unavailable ? <AlertCircle size={15} /> : step.done ? <Check size={15} /> : step.active && !stopped ? <Loader2 size={16} className={styles.spin} /> : index + 1}</span>
        <div><strong>{step.label}</strong><p>{step.detail}</p></div>
      </li>)}</ol>
    </div>
    <div className={styles.channelRow}>{(Object.keys(platformNames) as Platform[]).map(key => <span key={key} data-status={platforms[key].status} className={styles.channel}><i />{platformNames[key]}<small>{({ idle: "Not linked yet", loading: "Collecting", ready: "Data ready", error: "Unavailable" })[platforms[key].status]}</small></span>)}</div>
    <div className={styles.status} role="status" aria-live="polite">{stopped ? <><AlertCircle size={17} /><span>{failureMessage || "Check the profile link and try again. Public platform data may be temporarily unavailable."}</span><button onClick={onRetry}><RotateCcw size={14} /> Try again</button></> : <><span className={styles.liveDot} /><span>{complete ? "Analysis complete. Opening your report…" : `${current}. This can take a few minutes. Keep this page open.`}</span></>}</div>
    {failed > 0 && ready > 0 && <p className={styles.partial}>Some platform data is unavailable. Your report will use the accounts collected successfully.</p>}
    {stopped && <button className={styles.textButton} onClick={onLink}>Add another platform handle <ArrowRight size={14} /></button>}
  </section>;
}
