"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { getCompanyConfig } from "@/lib/config";

export default function SignupForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const company = getCompanyConfig();

  const [role, setRole] = useState<Role>(Role.CREATOR);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [cnicNumber, setCnicNumber] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandAddress, setBrandAddress] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [agencyAddress, setAgencyAddress] = useState("");
  const [designation, setDesignation] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    setError("");

    // Prepare role-specific fields
    const payload = {
      name,
      email,
      phone,
      role,
      password,
      instagramHandle: role === Role.CREATOR ? instagramHandle : undefined,
      cnicNumber: role === Role.CREATOR ? cnicNumber : undefined,
      // For Brand, map company name to DB fields
      agencyName: role === Role.AGENCY ? agencyName : role === Role.BRAND ? brandName : undefined,
      agencyAddress: role === Role.AGENCY ? agencyAddress : role === Role.BRAND ? brandAddress : undefined,
      designation: role !== Role.CREATOR ? designation : undefined,
    };

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Sign-up registration failed.");
      }

      showToast("Account initialized. OTP sent to your email.", "success");
      // Push state parameters to verify page
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || "Failed to initialize registration.");
      showToast(err.message || "Sign-up failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg p-8">
      <div className="flex flex-col items-center gap-2 mb-6 text-center">
        <Link href="/" className="flex items-center gap-2 outline-none mb-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center font-bold text-white text-base">
            {company.name[0]}
          </span>
          <span className="font-display font-bold text-lg text-white">
            {company.name}
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
        <p className="text-xs text-slate-500">Secure agreements with dynamic audit verification</p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-3 gap-2 mb-6 bg-slate-900/50 p-1.5 rounded-xl border border-slate-900">
        {(Object.keys(Role) as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              setRole(r);
              setError("");
            }}
            className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              role === r
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {r.toLowerCase()}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={role === Role.CREATOR ? "Full Name" : "Contact Person Name"}
            id="name"
            placeholder="Mohammad Ali"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            required
          />
          <Input
            label="Email Address"
            type="email"
            id="email"
            placeholder="ali@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone Number"
            type="tel"
            id="phone"
            placeholder="03XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading}
          />
          <Input
            label="Password"
            type="password"
            id="password"
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        {/* Creator Specific Form Inputs */}
        {role === Role.CREATOR && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-900 pt-4 mt-2">
            <Input
              label="Instagram Handle"
              id="instagram"
              placeholder="@username"
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              disabled={isLoading}
            />
            <Input
              label="CNIC Number (Optional)"
              id="cnic"
              placeholder="42101-XXXXXXX-X"
              value={cnicNumber}
              onChange={(e) => setCnicNumber(e.target.value)}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Brand Specific Form Inputs */}
        {role === Role.BRAND && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-900 pt-4 mt-2">
            <Input
              label="Brand / Company Name"
              id="brandName"
              placeholder="e.g. Sapphire"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              disabled={isLoading}
            />
            <Input
              label="Job Title / Designation"
              id="designation"
              placeholder="Marketing Manager"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              disabled={isLoading}
            />
            <div className="sm:col-span-2">
              <Input
                label="Brand Address"
                id="brandAddress"
                placeholder="Office Address, Lahore"
                value={brandAddress}
                onChange={(e) => setBrandAddress(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        {/* Agency Specific Form Inputs */}
        {role === Role.AGENCY && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-900 pt-4 mt-2">
            <Input
              label="Agency Name"
              id="agencyName"
              placeholder="e.g. Core Media Agency"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              disabled={isLoading}
            />
            <Input
              label="Job Title / Designation"
              id="designation"
              placeholder="Account Director"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              disabled={isLoading}
            />
            <div className="sm:col-span-2">
              <Input
                label="Agency Address"
                id="agencyAddress"
                placeholder="Office Address, Karachi"
                value={agencyAddress}
                onChange={(e) => setAgencyAddress(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-semibold mt-2">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full py-3 mt-4" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-400 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </Card>
  );
}
