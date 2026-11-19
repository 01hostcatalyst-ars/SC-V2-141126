import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getGoogleIdentity } from "@/lib/auth-user";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export const metadata: Metadata = { title: "Welcome to SignCollab", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getGoogleIdentity()) redirect("/auth/continue");
  return <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-5 py-12 text-zinc-900"><section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-10"><Link href="/" className="text-lg font-extrabold tracking-tight">SIGNCOLLAB</Link><h1 className="mt-8 text-3xl font-bold tracking-tight">Your next collaboration starts here.</h1><p className="mt-4 text-sm leading-6 text-zinc-600">Continue with Google to sign in or create your account. New here? We’ll help you set up your profile.</p><div className="mt-7"><GoogleSignInButton className="inline-flex items-center justify-center gap-3 rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold hover:bg-zinc-50" /></div><p className="mt-7 text-xs leading-5 text-zinc-500">Read our <Link href="/privacy" className="underline">Privacy Policy</Link> and <Link href="/terms" className="underline">Terms</Link>.</p><Link href="/" className="mt-6 inline-block text-xs text-zinc-500 underline">Back to home</Link></section></main>;
}
