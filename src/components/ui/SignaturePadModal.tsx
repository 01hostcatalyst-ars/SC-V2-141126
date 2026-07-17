"use client";

import React, { useRef, useEffect, useState } from "react";
import SignaturePad from "signature_pad";

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signatureB64: string, fingerprint: string) => void;
  loading?: boolean;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const [consent, setConsent] = useState(false);

  const initPad = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Adjust canvas internally for high-DPI touch devices
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    const context = canvas.getContext("2d");
    if (context) {
      context.scale(ratio, ratio);
    }

    if (padRef.current) {
      padRef.current.clear();
    } else {
      padRef.current = new SignaturePad(canvas, {
        backgroundColor: "rgb(250, 250, 250)",
        penColor: "rgb(0, 0, 0)",
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow Modal transition / display block first
      setTimeout(() => {
        initPad();
      }, 200);

      const handleResize = () => initPad();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
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
    // Capture user fingerprint using client specifications
    const fingerprint = `UA-${navigator.userAgent.slice(0, 150)}-${screen.width}x${screen.height}`;
    
    onConfirm(dataUrl, fingerprint);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden z-10 border border-gray-200 animate-slide-in p-5 md:p-7 text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3 shrink-0">
          <h3 className="text-sm md:text-base font-black text-black uppercase tracking-wider">Execute Digital Signature</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black font-bold text-xl focus:outline-none">
            ×
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto space-y-4 pr-1.5 flex-1 custom-scrollbar">
          {/* ETO 2002 Legal Warning */}
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed font-semibold">
            <strong>Legal Consent:</strong> By checking the box below and drawing your signature, you confirm your consent to enter into a legally binding electronic agreement governed by Pakistan&apos;s Electronic Transactions Ordinance (ETO 2002) and SignCollab&apos;s <a href="/terms" target="_blank" className="underline font-bold text-blue-950 hover:text-black">Terms of Service &amp; Privacy Notice</a>.
          </div>

          {/* Consent Checkbox */}
          <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-gray-200 cursor-pointer hover:bg-gray-50 select-none transition-all">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="w-4 h-4 accent-black mt-0.5"
            />
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-black leading-tight">
                I agree to execute this agreement electronically and verify the details.
              </span>
            </div>
          </label>

          {/* Drawing Canvas */}
          <div className="flex flex-col gap-1.5 mt-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Draw Signature Inside Box
            </label>
            <div className="w-full h-44 sm:h-52 md:h-60 border-2 border-gray-200 hover:border-gray-400 transition-all rounded-2xl bg-gray-50/50 overflow-hidden relative touch-none shadow-inner">
              <canvas
                ref={canvasRef}
                className="w-full h-full block cursor-crosshair"
                style={{ touchAction: "none" }}
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute bottom-2.5 right-2.5 px-3.5 py-1 bg-white hover:bg-gray-100 border border-gray-300 text-xs font-bold text-gray-700 rounded-xl shadow-md focus:outline-none transition-all"
              >
                Clear Drawing
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="w-full bg-black text-white hover:bg-black/90 font-bold text-xs uppercase py-3 rounded-xl transition-all shadow-md mt-4"
          >
            {loading ? "Processing..." : "Confirm & Apply Signature"}
          </button>
        </div>
      </div>
    </div>
  );
};
