"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getCompanyConfig } from "@/lib/config";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const company = getCompanyConfig();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else {
      router.push("/");
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || token.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "OTP verification failed.");
      }

      // Store Supabase session on client
      if (data.session) {
        const { supabase } = await import("@/lib/supabase/client");
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8 text-center">
      <Link href="/" className="inline-flex items-center gap-2 outline-none mb-6">
        <span className="w-8 h-8 rounded-lg bg-black flex items-center justify-center font-bold text-white text-base">
          {company.name[0]}
        </span>
        <span className="font-bold text-lg text-black uppercase tracking-tight">
          {company.name}
        </span>
      </Link>
      
      <h2 className="text-2xl font-black text-black mb-2">Verify Your Email</h2>
      <p className="text-xs text-gray-500 mb-6">
        We sent a 6-digit OTP code to <strong className="text-black">{email}</strong>.
      </p>

      {success ? (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 font-bold">
          ✓ Verification successful! Redirecting...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col text-left gap-1">
            <label className="text-xs font-bold text-black uppercase tracking-wider text-center mb-1">
              Enter 6-Digit OTP Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="123456"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
              disabled={loading}
              className="input-field text-center text-xl font-bold tracking-widest py-3"
            />
          </div>

          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-lg font-medium text-left">
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white hover:bg-black/90 font-bold py-3 px-4 rounded-xl transition-all shadow-md mt-6"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>
      )}

      <div className="mt-8 text-xs text-gray-400">
        Didn&apos;t receive code? Check your spam folder or{" "}
        <Link href="/" className="text-black font-semibold hover:underline">
          Go Back Home
        </Link>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-theme-gradient flex items-center justify-center flex-col gap-3">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold uppercase tracking-wider text-black">Loading...</span>
      </div>
    }>
      <div className="min-h-screen bg-theme-gradient flex items-center justify-center p-6">
        <VerifyContent />
      </div>
    </Suspense>
  );
}
