"use client";
import { useEffect, useState } from "react";
import styles from "./Knowledge.module.css";

type Entry = { id: string; text: string; level: number };
export default function ArticleContents({ entries }: { entries: Entry[] }) {
  const [active, setActive] = useState(entries[0]?.id || "");
  useEffect(() => {
    const update = () => {
      let current = entries[0]?.id || "";
      for (const entry of entries) {
        const element = document.getElementById(entry.id);
        if (element && element.getBoundingClientRect().top <= 160) current = entry.id;
      }
      setActive(current);
    };
    let frame = 0;
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    update(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); };
  }, [entries]);
  if (!entries.length) return null;
  const list = <ul className={styles.contentsList}>{entries.map(entry => <li key={entry.id} data-level={entry.level}><a href={`#${entry.id}`} aria-current={active === entry.id ? "location" : undefined}>{entry.text}</a></li>)}</ul>;
  return <aside className={styles.contents}><nav aria-label="Article contents" className={styles.contentsPanel}><h2>On this page</h2>{list}</nav></aside>;
}
export function MobileArticleContents({ entries }: { entries: Entry[] }) {
  if (!entries.length) return null;
  return <details className={styles.mobileContents}><summary>In this guide</summary><nav aria-label="Mobile article contents"><ul className={styles.contentsList}>{entries.map(entry => <li key={entry.id} data-level={entry.level}><a href={`#${entry.id}`}>{entry.text}</a></li>)}</ul></nav></details>;
}
