"use client";



import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import { refreshFailureMessage } from "@/lib/creators/refresh-errors";

import { RefreshCw } from "lucide-react";

import { PROFILE_MAX_AGE_MS, refreshIsDue, type ProfileFreshness, type RefreshStatus } from "@/lib/creators/refresh-policy";

import { runProfileRefresh, type RefreshProgress } from "@/lib/creators/run-profile-refresh";



export function ProfileRefreshButton({ slug, freshness }: { slug: string; freshness?: ProfileFreshness }) {

 const router = useRouter();

 const [status, setStatus] = useState<RefreshStatus | null>(null);

 const [busy, setBusy] = useState(false);

 const [error, setError] = useState("");

 const [progress, setProgress] = useState<RefreshProgress | null>(null);

 const [finished, setFinished] = useState(false);

 const inFlight = useRef(false);

 const endpoint = `/api/creators/${encodeURIComponent(slug)}/refresh`;
 const oldestSourceAt = freshness?.oldestSourceAt || null;

 useEffect(() => {

  let cancelled = false;

  let timer: ReturnType<typeof setTimeout>;

  const check = async () => {

   if (inFlight.current) { timer = setTimeout(check, 5000); return; }

   try {

    const response = await fetch(endpoint, { cache: "no-store" });

    const data = await response.json();

    if (!cancelled) setStatus(data.success ? data : { available: false, eligible: refreshIsDue(oldestSourceAt), active: false, oldestSourceAt: oldestSourceAt });

    if (!cancelled && data.active) timer = setTimeout(check, 5000);

   } catch {

    if (!cancelled) setStatus({ available: false, eligible: refreshIsDue(oldestSourceAt), active: false, oldestSourceAt: oldestSourceAt });

   }

  };

  if (refreshIsDue(oldestSourceAt)) void check();

  else {

   setStatus(null);

   const remaining = new Date(oldestSourceAt!).getTime() + PROFILE_MAX_AGE_MS - Date.now() + 1000;

   timer = setTimeout(() => void check(), Math.max(1000, remaining));

  }

  return () => { cancelled = true; clearTimeout(timer); };

 }, [endpoint, oldestSourceAt]);

 useEffect(() => {

  if (!busy) return;

  const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };

  window.addEventListener("beforeunload", warn);

  return () => window.removeEventListener("beforeunload", warn);

 }, [busy]);



 const refresh = async () => {

  if (inFlight.current) return;

  inFlight.current = true;

  setBusy(true); setError("");

  try {

   await runProfileRefresh(async body => {

    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

    const result = await response.json();

    if (!response.ok) throw new Error(result.error || "The refresh could not finish.");

    return result;

   }, setProgress);

   setFinished(true);

   router.refresh();

  } catch (failure) { setError(failure instanceof Error ? failure.message : "The refresh could not finish. Please try again."); }

  finally { inFlight.current = false; setBusy(false); }

 };

 if (finished || (!busy && !status?.eligible)) return null;

 const label = busy ? progress?.stage === "analyzing" ? "Analyzing fresh data…" : progress?.stage === "starting" ? "Starting refresh…" : "Fetching platform data…" : status?.active ? "Refresh in progress…" : "Refresh profile data";

 return <div className="profile-refresh-control">

  <button type="button" className="profile-refresh-button" onClick={refresh} disabled={busy || !!status?.active || !status?.available}>

   <RefreshCw size={13} className={busy ? "profile-refresh-spin" : undefined} aria-hidden="true" />{label}

  </button>

  {!error && <p className="profile-small-note" role="status">{busy ? "Keep this page open until the refresh finishes." : status?.active ? "Another visitor is refreshing this profile. This can take a few minutes." : !status?.available ? "Refresh is temporarily unavailable." : "Fetch the latest linked platform data and profile insights."}</p>}

  {error && <p className="profile-refresh-error" role="alert">{refreshFailureMessage(error)}</p>}

 </div>;

}

