"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { JURISDICTIONS } from "@/lib/config/jurisdictions";
import { authClient } from "@/lib/auth-client";

type Role = "CREATOR" | "BRAND" | "AGENCY";
const roles: { value: Role; title: string; description: string }[] = [
  { value: "CREATOR", title: "Creator", description: "Manage your collaborations and agreements." },
  { value: "BRAND", title: "Brand", description: "Find creators and organize partnerships." },
  { value: "AGENCY", title: "Agency", description: "Coordinate campaigns for brands and creators." },
];
const countries = Object.values(JURISDICTIONS).sort((a, b) => a.countryName.localeCompare(b.countryName));
const inputClass = "mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-pink-600 focus:ring-2 focus:ring-pink-100 disabled:opacity-60";

export function OnboardingForm({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [role, setRole] = useState<Role | "">("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!role) { setError("Choose Creator, Brand, or Agency."); return; }
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, role }) });
      const result = await response.json();
      if (!response.ok) { setError(result.error || "Could not save your profile."); setBusy(false); return; }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Could not connect. Your details are still here; please try again.");
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    try {
      const result = await authClient.signOut();
      if (result.error) { setError("Could not sign out. Please try again."); return; }
      router.replace("/login");
      router.refresh();
    } catch { setError("Could not connect. Please try again."); }
    finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8 text-zinc-900 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-lg font-extrabold tracking-tight">SIGNCOLLAB</Link>
        <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10" aria-labelledby="onboarding-title">
          <p className="text-xs font-semibold uppercase tracking-widest text-pink-700">One last step</p>
          <h1 id="onboarding-title" className="mt-3 text-3xl font-bold tracking-tight">Make yourself at home.</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600">Tell us how you’ll use SignCollab. We’ve already verified your email with Google.</p>
          <p className="mt-4 break-all rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">{email}</p>
          <form onSubmit={submit} className="mt-7 space-y-6" aria-busy={busy}>
            <fieldset disabled={busy}>
              <legend className="text-sm font-semibold">I’m joining as</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {roles.map(option => <label key={option.value} className={`cursor-pointer rounded-2xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-pink-500 ${role === option.value ? "border-pink-500 bg-pink-50" : "border-zinc-200 hover:border-zinc-400"}`}>
                  <span className="flex items-center gap-2"><input type="radio" name="role" value={option.value} checked={role === option.value} onChange={() => setRole(option.value)} required className="accent-pink-600" /><span className="text-sm font-semibold">{option.title}</span></span>
                  <span className="mt-2 block text-xs leading-5 text-zinc-600">{option.description}</span>
                </label>)}
              </div>
            </fieldset>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium">Your name<input name="name" autoComplete="name" defaultValue={name} maxLength={100} required disabled={busy} className={inputClass} /></label>
              <label className="text-sm font-medium">Country<select name="countryCode" autoComplete="country" required defaultValue="" disabled={busy} className={inputClass}><option value="" disabled>Select your country</option>{countries.map(country => <option key={country.countryCode} value={country.countryCode}>{country.countryName}</option>)}</select></label>
            </div>
            {role === "CREATOR" && <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium">Creator name <span className="font-normal text-zinc-500">(optional)</span><input name="creatorName" maxLength={100} disabled={busy} className={inputClass} /></label>
              <label className="text-sm font-medium">Instagram username <span className="font-normal text-zinc-500">(optional)</span><input name="instagramHandle" placeholder="your.username" maxLength={31} disabled={busy} className={inputClass} /></label>
            </div>}
            {(role === "BRAND" || role === "AGENCY") && <label className="block text-sm font-medium">{role === "BRAND" ? "Brand or company name" : "Agency name"}<input name="organizationName" autoComplete="organization" maxLength={150} required disabled={busy} className={inputClass} /></label>}
            <label className="block text-sm font-medium">Phone <span className="font-normal text-zinc-500">(optional)</span><input type="tel" name="phone" autoComplete="tel" maxLength={40} disabled={busy} className={inputClass} /></label>
            {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={busy} className="w-full rounded-xl bg-zinc-900 px-5 py-3.5 text-sm font-semibold text-white hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 disabled:opacity-60">{busy ? "Please wait…" : "Continue to dashboard"}</button>
            <p className="text-xs leading-5 text-zinc-500">You can update your details later in profile settings. Adding a social handle does not verify ownership of a creator profile.</p>
          </form>
          <button type="button" onClick={signOut} disabled={busy} className="mt-5 text-xs text-zinc-500 underline underline-offset-4">Use another Google account</button>
        </section>
        <p className="mt-5 text-center text-xs text-zinc-500"><Link href="/privacy" className="underline">Privacy</Link><span aria-hidden="true"> · </span><Link href="/terms" className="underline">Terms</Link></p>
      </div>
    </main>
  );
}
