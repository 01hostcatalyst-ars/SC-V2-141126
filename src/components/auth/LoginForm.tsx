"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { getCompanyConfig } from "@/lib/config";

export default function LoginForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const company = getCompanyConfig();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all credentials.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      showToast("Access granted. Welcome back!", "success");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      showToast(err.message || "Failed to sign in.", "error");
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
        <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
        <p className="text-xs text-slate-500">Sign in to manage your active campaign agreements</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Email Address"
          type="email"
          id="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />

        <Input
          label="Password"
          type="password"
          id="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-semibold">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full py-3" isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      <div className="mt-8 text-center text-xs text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-blue-400 font-semibold hover:underline">
          Create account
        </Link>
      </div>
    </Card>
  );
}
