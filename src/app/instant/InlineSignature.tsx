"use client";

import { useEffect, useRef, useState } from "react";
import SignaturePad, { type PointGroup } from "signature_pad";
import { getJurisdiction } from "@/lib/config/jurisdictions";
import styles from "./InstantContract.module.css";

export function InlineSignature({ countryCode, value, locked, loading, onConfirm, onEdit }: {
  countryCode: string; value: string; locked: boolean; loading: boolean;
  onConfirm: (signature: string, fingerprint: string) => void; onEdit: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const [consent, setConsent] = useState(false);
  const [hasInk, setHasInk] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const source = useRef<{ data: PointGroup[]; width: number; height: number } | null>(null);
  const jur = getJurisdiction(countryCode);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pad = new SignaturePad(canvas, { backgroundColor: "#ffffff", penColor: "#18181b", minWidth: 1.3, maxWidth: 3, minDistance: 1, throttle: 8 });
    padRef.current = pad;
    const remember = () => {
      source.current = { data: pad.toData(), width: canvas.clientWidth, height: canvas.clientHeight };
      setHasInk(!pad.isEmpty());
    };
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      const ratio = Math.max(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.getContext("2d")?.setTransform(ratio, 0, 0, ratio, 0, 0);
      pad.clear();
      const saved = source.current;
      if (saved?.data.length) {
        const scale = Math.min(width / saved.width, height / saved.height);
        pad.fromData(saved.data.map(group => ({ ...group, minWidth: group.minWidth * scale, maxWidth: group.maxWidth * scale, dotSize: group.dotSize * scale,
          points: group.points.map(point => ({ ...point, x: point.x * scale, y: point.y * scale })) })));
      }
    };
    resize();
    pad.addEventListener("endStroke", remember);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener("resize", resize);
    return () => { observer.disconnect(); window.removeEventListener("resize", resize); pad.removeEventListener("endStroke", remember); pad.off(); padRef.current = null; };
  }, []);

  const confirm = () => {
    const pad = padRef.current, canvas = canvasRef.current;
    if (!pad || !canvas || pad.isEmpty() || !consent || loading || locked) return;
    const points = pad.toData().flatMap(group => group.points);
    const ratio = canvas.width / canvas.clientWidth;
    const left = Math.max(0, Math.floor((Math.min(...points.map(p => p.x)) - 16) * ratio));
    const top = Math.max(0, Math.floor((Math.min(...points.map(p => p.y)) - 16) * ratio));
    const right = Math.min(canvas.width, Math.ceil((Math.max(...points.map(p => p.x)) + 16) * ratio));
    const bottom = Math.min(canvas.height, Math.ceil((Math.max(...points.map(p => p.y)) + 16) * ratio));
    const output = document.createElement("canvas");
    output.width = Math.max(1, right - left); output.height = Math.max(1, bottom - top);
    output.getContext("2d")?.drawImage(canvas, left, top, output.width, output.height, 0, 0, output.width, output.height);
    onConfirm(output.toDataURL("image/png"), `UA-${navigator.userAgent.slice(0, 150)}-${screen.width}x${screen.height}`);
  };

  return <div className={styles.inlineSignature}>
    {value && <div className={styles.signaturePreview}><img src={value} alt="Your confirmed signature" /><span>Signature confirmed</span>{!locked && <button type="button" disabled={loading} onClick={() => { setConsent(false); onEdit(); }}>Edit signature</button>}</div>}
    <div hidden={Boolean(value)}>
      <div className={styles.signatureTools}><span>Draw with your finger, stylus, or mouse</span><div><button type="button" disabled={loading} onClick={() => { padRef.current?.clear(); source.current = null; setHasInk(false); }}>Clear</button><button type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? "Reduce" : "Expand"}</button></div></div>
      <div className={styles.signatureCanvas} data-expanded={expanded}>
        <canvas ref={canvasRef} aria-label="Draw your signature" />
        {!hasInk && <span aria-hidden="true">Draw your signature here</span>}
      </div>
      <p className={styles.legalConsent}><strong>Legal Consent:</strong> By checking the box below and drawing your signature, you confirm your consent to enter into a legally binding electronic agreement governed by <strong>{jur.governingLawName}</strong> and SignCollab&apos;s <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service &amp; Privacy Notice</a>.</p>
      <label className={styles.signatureConsent}><input type="checkbox" checked={consent} disabled={loading} onChange={e => setConsent(e.target.checked)} /><span>I agree to execute this commercial agreement electronically and certify the audit details.</span></label>
      <button type="button" className={styles.applySignature} disabled={!hasInk || !consent || loading || locked} onClick={confirm}>Use this signature</button>
    </div>
    {value && <p className={styles.legalConsent}>Electronic signing consent confirmed for {jur.governingLawName}. <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service &amp; Privacy Notice</a></p>}
  </div>;
}
