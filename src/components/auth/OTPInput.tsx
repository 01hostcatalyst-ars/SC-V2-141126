"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { getCompanyConfig } from "@/lib/config";

function VerifyOtpInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const company = getCompanyConfig();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !token) {
      setError("Please input the 6-digit verification code.");
      return;
    }

    setIsLoading(true);
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

      showToast("Email address verified successfully. Loading dashboard...", "success");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      showToast(err.message || "Failed to verify code.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-8">
      <div className="flex flex-col items-center gap-2 mb-8 text-center">
        <Link href="/" className="flex items-center gap-2 outline-none mb-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center font-bold text-white text-base">
            {company.name[0]}
          </span>
          <span className="font-display font-bold text-lg text-white">
            {company.name}
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-white tracking-tight">Confirm OTP Code</h2>
        <p className="text-xs text-slate-500">We have sent a verification code to your email</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Email Address"
          type="email"
          id="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!!searchParams.get("email") || isLoading}
          required
        />

        <Input
          label="Verification Code (OTP)"
          type="text"
          id="token"
          placeholder="123456"
          maxLength={6}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          disabled={isLoading}
          required
        />

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-semibold">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full py-3" isLoading={isLoading}>
          Verify & Sign In
        </Button>
      </form>
    </Card>
  );
}

export default function VerifyOtpForm() {
  return (
    <Suspense fallback={
      <Card className="w-full max-w-md p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </Card>
    }>
      <VerifyOtpInner />
    </Suspense>
  );
}
