"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "CREATOR" | "BRAND" | "AGENCY";
  creatorName?: string | null;
  instagramHandle: string | null;
  cnicNumber: string | null;
  agencyName: string | null;
  agencyAddress: string | null;
  countryCode?: string | null;
  taxId?: string | null;
  designation: string | null;
  isVerified: boolean;
}
interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending, error: sessionError } = authClient.useSession();
  const [profile, setProfile] = useState<{ identityId: string; user: UserProfile } | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const identityId = session?.user.id;

  useEffect(() => {
    if (isPending || sessionError) return;
    if (!identityId) { router.replace("/login"); return; }
    const controller = new AbortController();
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", { cache: "no-store", signal: controller.signal });
        if (response.status === 401) { router.replace("/login"); return; }
        if (response.status === 404) { router.replace("/onboarding"); return; }
        if (!response.ok) throw new Error("Could not load your profile.");
        const data = await response.json();
        if (!controller.signal.aborted && identityId) setProfile({ identityId, user: data.profile });
      } catch {
        if (!controller.signal.aborted) setError("Could not load your account. Please try again.");
      }
    }
    void loadProfile();
    return () => controller.abort();
  }, [identityId, isPending, sessionError, router, retry]);

  async function logout() {
    setLoggingOut(true);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign out failed");
      setProfile(null);
      router.replace("/login");
      router.refresh();
    } catch { setError("Could not sign out. Please try again."); }
    finally { setLoggingOut(false); }
  }
  if (error || sessionError) return <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6"><div className="max-w-sm rounded-2xl border border-zinc-200 bg-white p-6"><p role="alert" className="text-sm text-red-700">{error || "Could not check your session."}</p><button type="button" onClick={() => { setError(""); setRetry(value => value + 1); void authClient.getSession(); }} className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">Try again</button></div></div>;
  const user = profile && profile.identityId === identityId ? profile.user : null;
  if (isPending || !user || loggingOut) return <div className="flex min-h-screen items-center justify-center bg-zinc-50"><p role="status" className="text-sm text-zinc-600">{loggingOut ? "Signing out…" : "Opening your workspace…"}</p></div>;
  return <AuthContext.Provider value={{ user, loading: false, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within a ProtectedRoute");
  return context;
}
