"use client";

import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  Mail,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Lock,
} from "lucide-react";

interface ClaimProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: {
    id: string;
    canonicalName: string;
    brandName?: string | null;
    slug?: string | null;
    verifiedEmail?: string | null;
    youtubeHandle?: string | null;
    instagramUsername?: string | null;
    tiktokUsername?: string | null;
  };
}

export function ClaimProfileModal({ isOpen, onClose, creator }: ClaimProfileModalProps) {
  const [method, setMethod] = useState<"email" | "token">("email");
  const [emailInput, setEmailInput] = useState(creator.verifiedEmail || "");
  const [copiedToken, setCopiedToken] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  // Generate deterministic 6-character verification token for bio verification
  const verificationToken = `SC-${creator.id.slice(0, 6).toUpperCase()}`;

  const handleCopyToken = () => {
    navigator.clipboard.writeText(verificationToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const handleEmailClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      // Simulate verification request submission
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Verification request could not be processed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Claim {creator.brandName || creator.canonicalName} Profile
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Take control of your public rate card, inquiries, and contracts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {status === "success" ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                <Check className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-semibold text-zinc-900 dark:text-white">
                  Verification Link Sent
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  We have dispatched a secure authentication token to{" "}
                  <strong className="text-zinc-900 dark:text-white font-mono">{emailInput}</strong>.
                  Please click the link in your inbox to complete profile claim.
                </p>
              </div>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition"
              >
                Close Window
              </button>
            </div>
          ) : (
            <>
              {/* Method Selector Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMethod("email")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg transition ${
                    method === "email"
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Business Email
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("token")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg transition ${
                    method === "token"
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Channel Bio Token
                </button>
              </div>

              {method === "email" ? (
                <form onSubmit={handleEmailClaim} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Channel or Management Business Email
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="e.g. partnerships@creatorbrand.com"
                      required
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                      Must match the public business inquiry email listed in your YouTube, Instagram, or TikTok bio.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="flex items-center gap-2 p-3 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/50">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow transition disabled:opacity-50"
                  >
                    {status === "submitting" ? (
                      "Verifying..."
                    ) : (
                      <>
                        <span>Send Ownership Verification</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Paste this temporary verification code anywhere into your YouTube channel About description,
                    Instagram bio, or TikTok bio. Once detected, ownership is granted immediately.
                  </p>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                    <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white tracking-wider">
                      {verificationToken}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyToken}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-600 transition"
                    >
                      {copiedToken ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Token</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                      You may remove this code from your bio as soon as your profile displays the Official Verified badge.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
          <span>SignCollab Verified Creator Protocol</span>
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Fast 2-Minute Review</span>
        </div>
      </div>
    </div>
  );
}
