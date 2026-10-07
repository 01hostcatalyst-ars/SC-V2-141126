"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface ExportPdfButtonProps {
  payload: any;
  buttonLabel?: string;
  className?: string;
}

export function ExportPdfButton({
  payload,
  buttonLabel = "Download PDF Report",
  className = "",
}: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const res = await fetch("/api/calculator/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate rate card PDF.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (
        payload.creatorMeta?.displayName ||
        payload.creatorMeta?.primaryUsername ||
        "Creator"
      ).replace(/[^a-zA-Z0-9_-]/g, "_");
      a.download = `SignCollab_RateCard_${safeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error("Export PDF error:", error);
      alert(error.message || "Failed to export PDF report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs ${className}`}
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
      ) : (
        <Download className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
      )}
      <span>{isExporting ? "Generating PDF..." : buttonLabel}</span>
    </button>
  );
}
