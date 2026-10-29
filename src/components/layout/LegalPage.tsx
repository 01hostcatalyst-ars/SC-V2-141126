import Link from "next/link";
import type { ReactNode } from "react";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900">
      <PublicHeader />
      <main className="w-full max-w-3xl mx-auto px-6 py-16 sm:py-24 flex-1">
        <p className="text-sm text-zinc-500 mb-3">SignCollab · Updated October 29, 2026</p>
        <h1 className="text-4xl font-bold tracking-tight mb-6">{title}</h1>
        <nav aria-label="Legal pages" className="flex flex-wrap gap-5 text-sm underline mb-10">
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/terms">Terms of service</Link>
          <Link href="/data-deletion">Data deletion</Link>
        </nav>
        <div className="space-y-8 text-base leading-7 text-zinc-700 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-zinc-950 [&_h2]:mb-3 [&_p]:mb-3 [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-3">{children}</div>
      </main>
      <PublicFooter />
    </div>
  );
}
