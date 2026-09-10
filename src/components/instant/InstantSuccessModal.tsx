"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Share2,
  MessageSquare,
  Mail,
  ShieldCheck,
  ArrowRight,
  X,
} from "lucide-react";
import { CreatedContractResult, InstantContractFormState } from "./types";

interface InstantSuccessModalProps {
  result: CreatedContractResult;
  form: InstantContractFormState;
  onClose: () => void;
}

export function InstantSuccessModal({
  result,
  form,
  onClose,
}: InstantSuccessModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    if (result.shareUrl) {
      QRCode.toDataURL(result.shareUrl, {
        margin: 1,
        width: 180,
        color: {
          dark: "#09090b",
          light: "#ffffff",
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("QR generation failed", err));
    }
  }, [result.shareUrl]);

  const handleCopyLink = () => {
    if (result.shareUrl) {
      navigator.clipboard.writeText(result.shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const shareText = `Hi! I have generated our commercial campaign agreement on SignCollab. You can review all terms and counter-sign digitally here: ${result.shareUrl}`;

  const handleCopyMessage = (type: string) => {
    navigator.clipboard.writeText(shareText);
    setCopiedTemplate(type);
    setTimeout(() => setCopiedTemplate(null), 2500);
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    shareText
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-zinc-200/90 shadow-2xl p-6 sm:p-8 text-left space-y-6 my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" strokeWidth={2.2} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
              <ShieldCheck className="w-3 h-3" />
              Party A Execution Sealed
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-950 font-display tracking-tight">
              Agreement Generated &amp; Signed
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
              Ref: <span className="font-mono font-bold text-zinc-900">{result.contractNumber}</span>
            </p>
          </div>
        </div>

        {/* Shareable Link Box */}
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2.5">
          <label className="text-xs font-bold text-zinc-950 uppercase tracking-wider block">
            Counterparty Signing Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={result.shareUrl}
              className="flex-1 p-3 rounded-xl border border-zinc-300 bg-white font-mono text-xs text-zinc-900 focus:outline-none select-all truncate"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-4 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[44px] ${
                copiedLink
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-zinc-950 text-white hover:bg-zinc-900 shadow-xs"
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium">
            Send this secure link to your counterparty. They do not need an account to review and countersign.
          </p>
        </div>

        {/* QR Code & Direct Social Dispatch */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* QR Code */}
          <div className="sm:col-span-5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col items-center justify-center text-center space-y-2">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="Contract Signing QR Code"
                className="w-32 h-32 rounded-xl border border-zinc-200 bg-white p-1"
              />
            ) : (
              <div className="w-32 h-32 rounded-xl bg-zinc-200 animate-pulse" />
            )}
            <div className="flex items-center gap-1 text-[10px] font-mono font-medium text-zinc-500">
              <QrCode className="w-3 h-3 text-zinc-400" />
              <span>Scan to Sign on Mobile</span>
            </div>
          </div>

          {/* Direct Share Options */}
          <div className="sm:col-span-7 space-y-2.5">
            <span className="text-xs font-bold text-zinc-950 uppercase tracking-wider block">
              1-Click Counterparty Dispatch
            </span>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 text-xs font-bold flex items-center justify-between transition-colors min-h-[44px]"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Send via WhatsApp</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </a>

            <button
              type="button"
              onClick={() => handleCopyMessage("email")}
              className="w-full p-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 text-xs font-bold flex items-center justify-between transition-colors min-h-[44px] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-zinc-700" />
                <span>
                  {copiedTemplate === "email" ? "Email Message Copied!" : "Copy Email Invite Template"}
                </span>
              </div>
              {copiedTemplate === "email" ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleCopyMessage("dm")}
              className="w-full p-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 text-xs font-bold flex items-center justify-between transition-colors min-h-[44px] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-zinc-700" />
                <span>
                  {copiedTemplate === "dm" ? "DM Text Copied!" : "Copy Instagram / X DM Text"}
                </span>
              </div>
              {copiedTemplate === "dm" ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
              )}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href={result.shareUrl}
            target="_blank"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm min-h-[44px]"
          >
            <span>Open Signing Page</span>
            <ArrowRight className="w-4 h-4 text-zinc-400" />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-bold text-xs transition-colors min-h-[44px] cursor-pointer"
          >
            Close &amp; Create Another
          </button>
        </div>
      </div>
    </div>
  );
}
