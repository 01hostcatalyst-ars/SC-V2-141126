"use client";

import React, { useRef, useEffect } from "react";
import SignaturePad from "signature_pad";

interface SignatureCaptureProps {
  onSave: (base64Png: string) => void;
  onClear?: () => void;
}

export const SignatureCanvas: React.FC<SignatureCaptureProps> = ({ onSave, onClear }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Adjust internally for high-DPI screens
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d")?.scale(ratio, ratio);

    if (padRef.current) {
      padRef.current.clear(); // Resizing clears the canvas, so reset signaturePad
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize Signature Pad
    const signaturePad = new SignaturePad(canvas, {
      backgroundColor: "rgb(10, 10, 16)",
      penColor: "rgb(255, 255, 255)",
    });

    padRef.current = signaturePad;
    
    // Set size
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      signaturePad.off();
    };
  }, []);

  const handleSave = () => {
    if (!padRef.current || padRef.current.isEmpty()) {
      return;
    }
    const dataUrl = padRef.current.toDataURL("image/png");
    onSave(dataUrl);
  };

  const handleClear = () => {
    if (padRef.current) {
      padRef.current.clear();
      if (onClear) onClear();
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="w-full h-44 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden relative touch-none">
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-crosshair"
          style={{ touchAction: "none" }}
        />
        <div className="absolute bottom-2 right-2 flex gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1 bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-400 hover:text-white rounded border border-slate-800/80 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={handleSave}
        className="btn-primary w-full py-2.5 text-sm"
      >
        Confirm Signature
      </button>
    </div>
  );
};
