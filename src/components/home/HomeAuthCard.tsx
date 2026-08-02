"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CompanyConfig } from "@/lib/config";
import { JURISDICTIONS, getJurisdiction } from "@/lib/config/jurisdictions";
import { ModernSelect } from "@/components/ui/ModernSelect";
import { PublicHeader } from "@/components/layout/PublicHeader";

type AuthTab = "signin" | "signup";
type Role = "CREATOR" | "BRAND" | "AGENCY";

interface HomeAuthCardProps {
  company: CompanyConfig;
  children: React.ReactNode;
}

export function HomeAuthCard({ company, children }: HomeAuthCardProps) {
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
  const [taxId, setTaxId] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [cnicNumber, setCnicNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [designation, setDesignation] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  // Toast message simulation helper
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const triggerToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

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

      triggerToast("Signed in successfully. Redirecting...", "success");
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials.");
      triggerToast(err.message || "Failed to sign in.", "error");
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
      taxId: role === "CREATOR" ? (cnicNumber || undefined) : (taxId || undefined),
      cnicNumber: role === "CREATOR" ? (cnicNumber || undefined) : undefined,
      creatorName: role === "CREATOR" ? (creatorName || signupName) : undefined,
      instagramHandle: role === "CREATOR" ? instagramHandle : undefined,
      agencyName: role !== "CREATOR" ? companyName : undefined,
      agencyAddress: companyAddress || undefined,
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

      triggerToast("Account created! Please check your email to confirm registration.", "success");
      setSignupName("");
      setSignupEmail("");
      setSignupPhone("");
      setSignupPassword("");
      setCountryCode("US");
      setTaxId("");
      setCreatorName("");
      setInstagramHandle("");
      setCnicNumber("");
      setCompanyName("");
      setCompanyAddress("");
      setDesignation("");
      setTimeout(() => {
        setAuthTab("signin");
      }, 2000);
    } catch (err: any) {
      setSignupError(err.message || "Failed to initialize account creation.");
      triggerToast(err.message || "Registration failed.", "error");
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <>
      {/* Global Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border text-sm font-semibold transition-all duration-300 animate-bounce ${
          toast.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          {toast.type === "success" ? "✓" : "✗"} {toast.message}
        </div>
      )}

      {/* Header */}
      <PublicHeader
        activeRoute="/"
        authButton={
          <button 
            onClick={() => setAuthTab(authTab === "signin" ? "signup" : "signin")} 
            className="text-xs font-semibold px-3 py-2 sm:px-4 sm:py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-black transition-colors whitespace-nowrap"
          >
            {authTab === "signin" ? "Create Account" : "Sign In"}
          </button>
        }
      />

      {/* Main Body */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          {/* Column 1: Server-rendered marketing content passed as children */}
          {children}

          {/* Column 2: Auth Card */}
          <div className="w-full flex flex-col items-center max-w-md mx-auto">
            
            {/* Quick Action Button Above Sign In / Sign Up Form */}
            <Link
              href="/instant"
              className="w-full mb-4 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-5 py-3.5 rounded-2xl shadow-lg transition-all hover:scale-[1.01] group border border-emerald-500/20"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-left">
                  <span className="text-sm font-extrabold leading-tight">Create Instant Agreement (Guest Mode)</span>
                  <span className="text-[11px] text-emerald-100 font-medium leading-tight">No Account or Registration Required</span>
                </div>
              </div>
              <span className="text-sm font-black transition-transform group-hover:translate-x-1">➔</span>
            </Link>

            <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden p-6 md:p-8">
              
              {/* Tab Selector */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab("signin");
                    setLoginError("");
                  }}
                  className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all ${
                    authTab === "signin"
                      ? "border-black text-black"
                      : "border-transparent text-gray-400 hover:text-gray-600"
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
                  className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all ${
                    authTab === "signup"
                      ? "border-black text-black"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Form Content */}
              {authTab === "signin" ? (
                /* Login Form */
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="flex flex-col text-left gap-1">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={loginLoading}
                      className="input-field"
                    />
                  </div>

                  <div className="flex flex-col text-left gap-1">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={loginLoading}
                      className="input-field"
                    />
                  </div>

                  {loginError && (
                    <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-lg font-medium text-left">
                      ⚠ {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-black text-white hover:bg-black/90 font-bold py-3 px-4 rounded-xl transition-all shadow-md mt-6 flex items-center justify-center gap-2"
                  >
                    {loginLoading ? "Authenticating..." : "Sign In"}
                  </button>
                </form>
              ) : (
                /* Sign Up Form */
                <form onSubmit={handleSignup} className="space-y-4">
                  
                  {/* Role tab selector */}
                  <div className="flex flex-col text-left gap-2 mb-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select Platform Role</label>
                    <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200/60">
                      {(["CREATOR", "BRAND", "AGENCY"] as Role[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                            role === r
                              ? "bg-black text-white shadow-sm"
                              : "text-gray-500 hover:text-black"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fields Grid */}
                  <div className="grid grid-cols-1 gap-3">

                    {role === "CREATOR" ? (
                      /* CREATOR SIGN-UP FORM */
                      <div className="space-y-3">
                        {/* 1. Creator Brand / Persona Info */}
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                            1. Creator Brand / Persona Info
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="flex flex-col text-left gap-1">
                              <label className="text-xs font-bold text-black uppercase tracking-wider">Creator Name *</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Jane Doe"
                                value={creatorName}
                                onChange={(e) => setCreatorName(e.target.value)}
                                disabled={signupLoading}
                                className="input-field"
                              />
                            </div>
                            <div className="flex flex-col text-left gap-1">
                              <label className="text-xs font-bold text-black uppercase tracking-wider">Social Handle *</label>
                              <input
                                type="text"
                                required
                                placeholder="@janedoe"
                                value={instagramHandle}
                                onChange={(e) => setInstagramHandle(e.target.value)}
                                disabled={signupLoading}
                                className="input-field"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 2. Representative / Account Holder Info */}
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                            2. Account Holder &amp; Representative Details
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="flex flex-col text-left gap-1">
                              <label className="text-xs font-bold text-black uppercase tracking-wider">Representative Name *</label>
                              <input
                                type="text"
                                required
                                placeholder="Jane Doe or John Agent"
                                value={signupName}
                                onChange={(e) => setSignupName(e.target.value)}
                                disabled={signupLoading}
                                className="input-field"
                              />
                            </div>
                            <div className="flex flex-col text-left gap-1">
                              <label className="text-xs font-bold text-black uppercase tracking-wider">Job Title / Capacity *</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Self / Talent Manager"
                                value={designation}
                                onChange={(e) => setDesignation(e.target.value)}
                                disabled={signupLoading}
                                className="input-field"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="flex flex-col text-left gap-1">
                              <label className="text-xs font-bold text-black uppercase tracking-wider">Account Email *</label>
                              <input
                                type="email"
                                required
                                placeholder="name@domain.com"
                                value={signupEmail}
                                onChange={(e) => setSignupEmail(e.target.value)}
                                disabled={signupLoading}
                                className="input-field"
                              />
                            </div>
                            <div className="flex flex-col text-left gap-1">
                              <label className="text-xs font-bold text-black uppercase tracking-wider">Phone (WhatsApp) *</label>
                              <input
                                type="tel"
                                required
                                placeholder="03XXXXXXXXX"
                                value={signupPhone}
                                onChange={(e) => setSignupPhone(e.target.value)}
                                disabled={signupLoading}
                                className="input-field"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col text-left gap-1">
                            <label className="text-xs font-bold text-black uppercase tracking-wider">Studio / Residential Address *</label>
                            <input
                              type="text"
                              required
                              placeholder="Address, City, Country"
                              value={companyAddress}
                              onChange={(e) => setCompanyAddress(e.target.value)}
                              disabled={signupLoading}
                              className="input-field"
                            />
                          </div>

                          <ModernSelect
                            label="Country Jurisdiction *"
                            value={countryCode}
                            onChange={(val) => setCountryCode(val)}
                            options={Object.values(JURISDICTIONS).map((j) => ({
                              value: j.countryCode,
                              label: `${j.countryName} (${j.lawAbbreviation})`,
                              sublabel: `ID: ${j.nationalIdLabel.replace(" (Optional)", "")}`,
                            }))}
                          />

                          <div className="flex flex-col text-left gap-1">
                            <label className="text-xs font-bold text-black uppercase tracking-wider">
                              {getJurisdiction(countryCode).nationalIdLabel.replace(" (Optional)", "")} *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder={`e.g. ${getJurisdiction(countryCode).nationalIdLabel.replace(" (Optional)", "")}`}
                              value={cnicNumber}
                              onChange={(e) => setCnicNumber(e.target.value)}
                              disabled={signupLoading}
                              className="input-field"
                            />
                          </div>

                          <div className="flex flex-col text-left gap-1">
                            <label className="text-xs font-bold text-black uppercase tracking-wider">Password *</label>
                            <input
                              type="password"
                              required
                              placeholder="Min 6 characters"
                              value={signupPassword}
                              onChange={(e) => setSignupPassword(e.target.value)}
                              disabled={signupLoading}
                              className="input-field"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* BRAND / AGENCY SIGN-UP FORM */
                      <div className="space-y-3">
                        {/* 1. Business Entity Info */}
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                            1. Business Entity Info
                          </span>

                          <div className="flex flex-col text-left gap-1">
                            <label className="text-xs font-bold text-black uppercase tracking-wider">
                              {role === "BRAND" ? "Brand / Company Name *" : "Agency Name *"}
                            </label>
                            <input
                              type="text"
                              required
                              placeholder={role === "BRAND" ? "e.g. Samsung Pakistan" : "e.g. Core Agency"}
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              disabled={signupLoading}
                              className="input-field"
                            />
                          </div>

                          <div className="flex flex-col text-left gap-1">
                            <label className="text-xs font-bold text-black uppercase tracking-wider">Office Address *</label>
                            <input
                              type="text"
                              required
                              placeholder="Corporate Office Address, City"
                              value={companyAddress}
                              onChange={(e) => setCompanyAddress(e.target.value)}
                              disabled={signupLoading}
                              className="input-field"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="flex flex-col text-left gap-1">
                              <label className="text-xs font-bold text-black uppercase tracking-wider">Account Email *</label>
                              <input
                                type="email"
                                required
                                placeholder="corporate@domain.com"
                                value={signupEmail}
                                onChange={(e) => setSignupEmail(e.target.value)}
                                disabled={signupLoading}
                                className="input-field"
                              />
                            </div>
                            <ModernSelect
                              label="Country Jurisdiction *"
                              value={countryCode}
                              onChange={(val) => setCountryCode(val)}
                              options={Object.values(JURISDICTIONS).map((j) => ({
                                value: j.countryCode,
                                label: `${j.countryName} (${j.lawAbbreviation})`,
                                sublabel: `Tax Label: ${j.taxIdLabel}`,
                              }))}
                            />
                          </div>

                          <div className="flex flex-col text-left gap-1">
                            <label className="text-xs font-bold text-black uppercase tracking-wider">
                              Business {getJurisdiction(countryCode).taxIdLabel} *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder={`e.g. ${getJurisdiction(countryCode).taxIdLabel}`}
                              value={taxId}
                              onChange={(e) => setTaxId(e.target.value)}
                              disabled={signupLoading}
                              className="input-field"
                            />
                          </div>
                        </div>

                        {/* 2. Authorized Representative Info */}
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                            2. Authorized Representative Info
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="flex flex-col text-left gap-1">
                              <label className="text-xs font-bold text-black uppercase tracking-wider">Contact Person Name *</label>
                              <input
                                type="text"
                                required
                                placeholder="Mohammad Ali"
                                value={signupName}
                                onChange={(e) => setSignupName(e.target.value)}
                                disabled={signupLoading}
                                className="input-field"
                              />
                            </div>
                            <div className="flex flex-col text-left gap-1">
                              <label className="text-xs font-bold text-black uppercase tracking-wider">Your Job Title *</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Marketing Director"
                                value={designation}
                                onChange={(e) => setDesignation(e.target.value)}
                                disabled={signupLoading}
                                className="input-field"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="flex flex-col text-left gap-1">
                              <label className="text-xs font-bold text-black uppercase tracking-wider">Phone (WhatsApp) *</label>
                              <input
                                type="tel"
                                required
                                placeholder="03XXXXXXXXX"
                                value={signupPhone}
                                onChange={(e) => setSignupPhone(e.target.value)}
                                disabled={signupLoading}
                                className="input-field"
                              />
                            </div>
                            <div className="flex flex-col text-left gap-1">
                              <label className="text-xs font-bold text-black uppercase tracking-wider">Account Password *</label>
                              <input
                                type="password"
                                required
                                placeholder="Min 6 characters"
                                value={signupPassword}
                                onChange={(e) => setSignupPassword(e.target.value)}
                                disabled={signupLoading}
                                className="input-field"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {signupError && (
                    <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-lg font-medium text-left mt-2">
                      ⚠ {signupError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={signupLoading}
                    className="w-full bg-black text-white hover:bg-black/90 font-bold py-3 px-4 rounded-xl transition-all shadow-md mt-6 flex items-center justify-center gap-2"
                  >
                    {signupLoading ? "Registering..." : "Create Account"}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
