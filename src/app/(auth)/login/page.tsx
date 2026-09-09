"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Building,
  AtSign,
} from "lucide-react";
import { SuiteHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ModernSelect } from "@/components/ui/ModernSelect";
import { JURISDICTIONS } from "@/lib/config/jurisdictions";

type AuthTab = "signin" | "signup";
type Role = "CREATOR" | "BRAND" | "AGENCY";

export default function LoginPage() {
  const router = useRouter();

  const [authTab, setAuthTab] = useState<AuthTab>("signin");
  const [role, setRole] = useState<Role>("CREATOR");

  // Sign In state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Sign Up state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [designation, setDesignation] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter both email and password.");
      return;
    }

    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login authentication failed.");
      }

      if (data.session) {
        const { supabase } = await import("@/lib/supabase/client");
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      router.push("/dashboard");
    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword) {
      setSignupError("Please fill in contact name, email, and password.");
      return;
    }

    setSignupLoading(true);
    setSignupError("");

    const payload = {
      name: signupName,
      email: signupEmail,
      phone: signupPhone,
      role,
      password: signupPassword,
      countryCode,
      creatorName: role === "CREATOR" ? signupName : undefined,
      instagramHandle: role === "CREATOR" ? instagramHandle : undefined,
      agencyName: role !== "CREATOR" ? companyName : undefined,
      designation: designation || undefined,
    };

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration initialization failed.");
      }

      setSignupSuccess(true);
    } catch (err: any) {
      setSignupError(err.message || "Registration failed.");
    } finally {
      setSignupLoading(false);
    }
  };

  const countryOptions = Object.values(JURISDICTIONS).map((j) => ({
    value: j.countryCode,
    label: `${j.countryName} (${j.defaultCurrency})`,
  }));

  return (
    <div className="min-h-screen bg-canvas flex flex-col relative text-left">
      <SuiteHeader activeRoute="/login" />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-md bg-white border border-zinc-200/90 rounded-2xl shadow-xl p-6 sm:p-8 surface-card">
          
          {/* Top Logo & Title */}
          <div className="text-center mb-6 space-y-1.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white font-bold text-sm flex items-center justify-center mx-auto shadow-sm">
              BB
            </div>
            <h2 className="text-xl font-bold font-display text-zinc-950">
              {authTab === "signin" ? "Welcome Back" : "Create Your Account"}
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              {authTab === "signin"
                ? "Sign in to manage agreements, rates & audit trails"
                : "Join creators, brands, and agencies signing with proof"}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-zinc-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthTab("signin");
                setLoginError("");
              }}
              className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                authTab === "signin"
                  ? "border-zinc-950 text-zinc-950"
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab("signup");
                setSignupError("");
              }}
              className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                authTab === "signup"
                  ? "border-zinc-950 text-zinc-950"
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form Content */}
          {authTab === "signin" ? (
            /* Sign In Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-800">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" strokeWidth={2} />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={loginLoading}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-950 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950/10 transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-800">Password</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" strokeWidth={2} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={loginLoading}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-950 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950/10 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" strokeWidth={2} />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-zinc-950 text-white hover:bg-zinc-900 font-bold text-xs py-3 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loginLoading ? "Authenticating..." : "Sign In to Workspace"}
              </button>
            </form>
          ) : signupSuccess ? (
            /* Sign Up Success State */
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" strokeWidth={2} />
              </div>
              <h3 className="text-base font-bold text-zinc-950">Confirmation Email Sent</h3>
              <p className="text-xs text-zinc-600 leading-relaxed max-w-sm mx-auto">
                We&apos;ve sent an activation link to <strong className="text-zinc-950 font-semibold">{signupEmail}</strong>. Please verify your email to unlock full workspace access.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSignupSuccess(false);
                  setAuthTab("signin");
                }}
                className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition-colors cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleSignup} className="space-y-3.5">
              {/* Role Selection */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  Platform Role
                </label>
                <div className="grid grid-cols-3 gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200/60 text-center">
                  {(["CREATOR", "BRAND", "AGENCY"] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                        role === r
                          ? "bg-white text-zinc-950 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-950"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-800">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-950 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-800">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-950 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none"
                />
              </div>

              {role === "CREATOR" ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-800">Instagram Handle (Optional)</label>
                  <div className="relative flex items-center">
                    <AtSign className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="username"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-950 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-800">Company / Agency Name</label>
                  <input
                    type="text"
                    placeholder="Acme Studio"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-950 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none"
                  />
                </div>
              )}

              <ModernSelect
                label="Country Jurisdiction"
                value={countryCode}
                onChange={setCountryCode}
                options={countryOptions}
              />

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-800">Create Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 8 characters"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-950 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none"
                />
              </div>

              {signupError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" strokeWidth={2} />
                  <span>{signupError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={signupLoading}
                className="w-full bg-zinc-950 text-white hover:bg-zinc-900 font-bold text-xs py-3 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {signupLoading ? "Creating Account..." : "Create Free Account"}
              </button>
            </form>
          )}

          {/* Guest Route Disclaimer */}
          <div className="mt-6 pt-4 border-t border-zinc-100 text-center">
            <p className="text-[11px] text-zinc-500 font-medium">
              Want to draft an agreement without an account?{" "}
              <Link href="/instant" className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-1">
                <span>Use Guest Mode (2/Day)</span>
                <ArrowRight className="w-3 h-3 inline" />
              </Link>
            </p>
          </div>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
