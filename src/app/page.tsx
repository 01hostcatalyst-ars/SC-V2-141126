"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCompanyConfig } from "@/lib/config";
import { JURISDICTIONS, getJurisdiction } from "@/lib/config/jurisdictions";
import { ModernSelect } from "@/components/ui/ModernSelect";

type AuthTab = "signin" | "signup";
type Role = "CREATOR" | "BRAND" | "AGENCY";

export default function Home() {
  const router = useRouter();
  const company = getCompanyConfig();

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
    <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-hidden">
      {/* Background ambient glow shapes */}
      <div className="absolute top-[10%] left-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-purple pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-blue pointer-events-none z-0" />

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
      <header className="w-full h-16 border-b border-gray-200/60 bg-white/70 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:flex w-8 h-8 rounded-lg bg-black items-center justify-center font-bold text-white text-base shrink-0">
            {company.name[0]}
          </span>
          <span className="font-bold text-base sm:text-lg text-black tracking-tight uppercase">
            {company.name}
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/instant"
            className="hidden sm:inline-flex text-xs font-bold px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm items-center gap-1.5 whitespace-nowrap"
          >
            <span>Instant Contract (No Signup)</span>
          </Link>
          <button 
            onClick={() => setAuthTab(authTab === "signin" ? "signup" : "signin")} 
            className="text-xs font-semibold px-3 py-2 sm:px-4 sm:py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-black transition-colors whitespace-nowrap"
          >
            {authTab === "signin" ? "Create Account" : "Sign In"}
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          {/* Column 1: Info Column */}
          <div className="flex flex-col text-left space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-900 border border-emerald-300 w-fit">
              Instant 1-Page Contracts Now Available • No Signup Required
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-black leading-tight tracking-tight">
              Bilateral Contracts.<br />
              <span className="text-accent-gradient">Secure Evidence.</span>
            </h1>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed max-w-xl">
              Stop executing commercial social media partnerships via transient chat logs. 
              <strong> {company.name}</strong> provides a simple, bilateral proof-layer with tamper-proof signature logs and cryptographic audit trails compliant with global electronic signature standards.
            </p>

            {/* Badges system - using Gen-Z/Professional favorite color codes */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 rounded-md text-xs font-bold border bg-blue-50 border-blue-200 text-blue-800">
                #Creator
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-bold border bg-emerald-50 border-emerald-200 text-emerald-800">
                #Brand
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-bold border bg-orange-50 border-orange-200 text-orange-800">
                #Agency
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-bold border bg-amber-50 border-amber-200 text-amber-800">
                #GlobalCompliance
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-bold border bg-rose-50 border-rose-200 text-rose-800">
                #SignedPDF
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-200/80 pt-6 mt-2">
              <div>
                <h4 className="text-xl font-bold text-black">Guest Mode</h4>
                <p className="text-xs text-gray-500 mt-1">2 free instant contracts per day per email without signing up.</p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-black">Audit Trails</h4>
                <p className="text-xs text-gray-500 mt-1">Includes SHA-256 integrity check and device identifiers.</p>
              </div>
            </div>
          </div>

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

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/80 bg-white/80 backdrop-blur-md py-8 px-6 z-10 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
            <span className="font-bold text-sm tracking-tight text-black uppercase">
              {company.name}
            </span>
            <p className="text-xs text-gray-500 font-medium">
              Bilateral Agreement Proof-Layer &amp; Tamper-Proof Audit Trails
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-gray-600">
            <Link href="/features" className="hover:text-black transition-colors">
              Features
            </Link>
            <Link href="/verify" className="hover:text-black transition-colors">
              Verify Document
            </Link>
            <Link href="/terms" className="hover:text-black transition-colors">
              Terms &amp; Privacy
            </Link>
            <a href={`mailto:${company.supportEmail}`} className="hover:text-black transition-colors">
              Support
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-gray-100 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2 text-center sm:text-left">
          <span>
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </span>
          <span className="text-gray-400 font-medium">
            {company.supportEmail}
          </span>
        </div>
      </footer>
    </div>
  );
}
