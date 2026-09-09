"use client";

import React, { useRef, useEffect, useState } from "react";
import SignaturePad from "signature_pad";
import { X, ShieldCheck, RotateCcw } from "lucide-react";
import { getJurisdiction } from "@/lib/config/jurisdictions";

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signatureB64: string, fingerprint: string) => void;
  loading?: boolean;
  countryCode?: string;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  countryCode = "US",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const [consent, setConsent] = useState(false);

  const jur = getJurisdiction(countryCode);

  const initPad = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;

    const context = canvas.getContext("2d");
    if (context) {
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    if (padRef.current) {
      padRef.current.off();
    }

    padRef.current = new SignaturePad(canvas, {
      backgroundColor: "rgb(250, 250, 250)",
      penColor: "rgb(9, 9, 11)",
      minWidth: 1.5,
      maxWidth: 3.5,
    });
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        initPad();
      }, 150);

      const handleResize = () => initPad();
      window.addEventListener("resize", handleResize);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", handleResize);
        if (padRef.current) {
          padRef.current.off();
          padRef.current = null;
        }
      };
    }
  }, [isOpen]);

  const handleClear = () => {
    if (padRef.current) {
      padRef.current.clear();
    }
  };

  const handleSave = () => {
    if (!padRef.current || padRef.current.isEmpty()) {
      alert("Please draw your signature before confirming.");
      return;
    }
    if (!consent) {
      alert("You must consent to execute this agreement electronically.");
      return;
    }

    const dataUrl = padRef.current.toDataURL("image/png");
    const fingerprint = `UA-${navigator.userAgent.slice(0, 150)}-${screen.width}x${screen.height}`;
    
    onConfirm(dataUrl, fingerprint);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden z-10 border border-zinc-200/90 surface-elevated animate-fadeIn p-5 md:p-6 text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-4 h-4" strokeWidth={2} />
            </div>
            <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wide">Execute Digital Signature</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-zinc-950 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors focus:outline-none"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {/* Legal Consent Banner */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-800 leading-relaxed font-medium">
            <strong className="text-zinc-950 font-bold">Legal Consent:</strong> By checking the box below and drawing your signature, you confirm your consent to enter into a legally binding electronic agreement governed by <strong className="text-zinc-950 font-semibold">{jur.governingLawName}</strong> and SignCollab&apos;s <a href="/terms" target="_blank" className="underline font-semibold text-zinc-950 hover:text-black">Terms of Service &amp; Privacy Notice</a>.
          </div>

          {/* Consent Checkbox */}
          <label className="flex items-start gap-3 p-3 rounded-xl border border-zinc-200 cursor-pointer hover:bg-zinc-50/70 select-none transition-all">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="w-4 h-4 accent-zinc-950 mt-0.5"
            />
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-zinc-900 leading-tight">
                I agree to execute this commercial agreement electronically and certify the audit details.
              </span>
            </div>
          </label>

          {/* Drawing Canvas */}
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Draw Signature Inside Box
              </label>
              <span className="text-[10px] text-zinc-400 font-medium">Finger / Stylus / Mouse</span>
            </div>
            <div className="w-full h-44 sm:h-52 md:h-56 border border-zinc-300 hover:border-zinc-400 transition-all rounded-xl bg-zinc-50/50 overflow-hidden relative touch-none shadow-2xs">
              <canvas
                ref={canvasRef}
                className="w-full h-full block cursor-crosshair"
                style={{ touchAction: "none" }}
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute bottom-2.5 right-2.5 px-3 py-1 bg-white hover:bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700 rounded-lg shadow-sm focus:outline-none transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" strokeWidth={2} />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="w-full bg-zinc-950 text-white hover:bg-zinc-900 font-bold text-xs uppercase py-3 rounded-lg transition-all shadow-sm mt-3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm & Apply Signature"}
          </button>
        </div>
      </div>
    </div>
  );
};
