"use client";

import React from "react";
import VerifyOtpForm from "@/components/auth/OTPInput";

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      
      <VerifyOtpForm />
    </div>
  );
}
