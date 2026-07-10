"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getCompanyConfig } from "@/lib/config";

export default function SignSuccessPage() {
  const company = getCompanyConfig();

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Header />

      <main className="flex-grow flex items-center justify-center p-4 pt-24 pb-20">
        <Card className="w-full max-w-md p-8 text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-3xl animate-bounce">
            ✓
          </div>
          
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Agreement Executed!</h2>
            <p className="text-slate-400 text-sm">
              Your electronic signature has been successfully verified and applied to the campaign contract.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 text-xs text-slate-400 leading-relaxed text-left">
            ℹ️ <strong>Next Steps:</strong> The contract has been returned to the initiator for their final executing signature. Once both signatures are recorded, the final contract PDF and audit logs will be emailed directly to your inbox.
          </div>

          <div className="flex flex-col gap-3 w-full border-t border-slate-900 pt-6">
            <Link href="/signup">
              <Button className="w-full py-2.5">Create Free Account</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full">Back to Home</Button>
            </Link>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
