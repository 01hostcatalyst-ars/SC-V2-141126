"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

interface GoogleSignInButtonProps {
  className?: string;
  onNavigate?: () => void;
}

export function GoogleSignInButton({ className, onNavigate }: GoogleSignInButtonProps) {
  const { data: session, isPending } = authClient.useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("google_login_error")) {
      setError("Google sign-in was not completed. Please try again.");
    }
  }, []);

  async function handleClick() {
    setBusy(true);
    setError("");
    try {
      if (session) {
        const result = await authClient.signOut();
        if (result.error) setError("Could not sign out. Please try again.");
      } else {
        const result = await authClient.signIn.social({
          provider: "google",
          callbackURL: "/auth/continue",
          errorCallbackURL: "/?google_login_error=1",
        });
        if (result.error) setError("Could not start Google sign-in. Please try again.");
        else onNavigate?.();
      }
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="google-auth-action">
      {session && <Link href="/auth/continue" className={className} onClick={onNavigate}>Dashboard</Link>}
      <button type="button" className={session ? "google-auth-signout" : className} disabled={busy || isPending} onClick={handleClick} title={session ? `Signed in as ${session.user.name} (${session.user.email})` : undefined}>
        {!session && <span aria-hidden="true" className="google-auth-mark">G</span>}
        {isPending ? "Checking sign-in…" : busy ? (session ? "Signing out…" : "Opening Google…") : session ? "Sign out" : "Continue with Google"}
      </button>
      {error && <span role="alert" className="google-auth-error">{error}</span>}
    </span>
  );
}
