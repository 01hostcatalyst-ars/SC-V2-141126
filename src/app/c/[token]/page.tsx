"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { getCompanyConfig } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { SignaturePadModal } from "@/components/ui/SignaturePadModal";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function PublicSigningPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { showToast } = useToast();
  const company = getCompanyConfig();

  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

  // Respondent details states
  const [respondentName, setRespondentName] = useState("");
  const [respondentEmail, setRespondentEmail] = useState("");
  const [respondentPhone, setRespondentPhone] = useState("");
  const [respondentCompany, setRespondentCompany] = useState("");
  const [respondentDesignation, setRespondentDesignation] = useState("");
  const [respondentAddress, setRespondentAddress] = useState("");
  const [collabDetails, setCollabDetails] = useState("");

  // OTP identity state
  const [otpDispatched, setOtpDispatched] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    const fetchSharedContract = async () => {
      try {
        const res = await fetch(`/api/contracts/share/${resolvedParams.token}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setContract(data.contract);
        } else {
          showToast(data.error || "Agreement is not accepting signatures.", "error");
        }
      } catch (err) {
        showToast("Error retrieving campaign details.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSharedContract();
  }, [resolvedParams.token, showToast]);

  const handleSendOTP = async () => {
    if (!respondentEmail) {
      showToast("Please specify a valid email to receive code.", "error");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch(`/api/contracts/share/${resolvedParams.token}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: respondentEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpDispatched(true);
        showToast("Identity verification OTP sent to your email. Check spam if not found.", "success");
      } else {
        showToast(data.error || "Failed to dispatch verification code.", "error");
      }
    } catch (err) {
      showToast("Error dispatching OTP.", "error");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      showToast("Verification code must be 6 digits.", "error");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch(`/api/contracts/share/${resolvedParams.token}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: respondentEmail, code: otpCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpVerified(true);
        showToast("Identity successfully verified! Signature pad unlocked.", "success");
      } else {
        showToast(data.error || "Invalid verification code.", "error");
      }
    } catch (err) {
      showToast("Error verifying OTP.", "error");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleReviewAndSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondentName || !respondentEmail) {
      showToast("Please fill in name and email details.", "error");
      return;
    }
    if (!otpVerified) {
      showToast("Please verify your email identity via OTP first.", "error");
      return;
    }
    setIsSignModalOpen(true);
  };

  const handleExecuteSignature = async (signatureB64: string, fingerprint: string) => {
    setSigning(true);
    const payloadDetails = {
      respondentName,
      respondentEmail,
      respondentPhone,
      respondentCompany: contract.contractType.endsWith("BRAND") ? respondentCompany : undefined,
      respondentAddress,
      respondentDesignation: contract.contractType.endsWith("BRAND") ? respondentDesignation : undefined,
      collabDetails,
    };

    try {
      // 1. Submit respondent profile details
      const detailsRes = await fetch(`/api/contracts/share/${resolvedParams.token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadDetails),
      });

      if (!detailsRes.ok) {
        throw new Error("Failed to save respondent parameters.");
      }

      // 2. Submit signature payload
      const documentHash = "SHA256-" + resolvedParams.token;
      const signRes = await fetch(`/api/contracts/share/${resolvedParams.token}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureB64,
          documentHash,
          fingerprint,
          email: respondentEmail,
        }),
      });

      const signData = await signRes.json();
      if (!signRes.ok) {
        throw new Error(signData.error || "Signature logging transaction failed.");
      }

      showToast("Agreement signed successfully!", "success");
      setTimeout(() => {
        window.location.href = `/c/${resolvedParams.token}/success`;
      }, 800);
    } catch (err: any) {
      showToast(err.message || "Signing transaction failed.", "error");
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-gradient flex items-center justify-center flex-col gap-3">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold uppercase tracking-wider text-black">Querying campaign...</span>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-theme-gradient flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold text-2xl mb-4">
          ✗
        </div>
        <h2 className="text-2xl font-black text-black mb-2">Invalid or Expired Link</h2>
        <p className="text-gray-500 text-xs mb-6 max-w-sm">
          This agreement link is no longer valid, has expired, or is not in a signable counterparty state.
        </p>
        <Link href="/">
          <button className="bg-black text-white hover:bg-black/90 font-bold px-6 py-2.5 rounded-xl text-xs uppercase shadow">
            Back to Home
          </button>
        </Link>
      </div>
    );
  }

  const isRespondentBrand = contract.contractType.endsWith("BRAND");

  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute top-[10%] left-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-purple pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-blue pointer-events-none z-0" />

      {/* Header */}
      <header className="w-full h-16 border-b border-gray-200/60 bg-white/70 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-black flex items-center justify-center font-bold text-white text-base">
            {company.name[0]}
          </span>
          <span className="font-bold text-lg text-black tracking-tight uppercase">
            {company.name}
          </span>
        </Link>
        <span className="text-[10px] font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full uppercase tracking-wider">
          Counterparty Review
        </span>
      </header>

      {/* Body Grid layout */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Static terms column */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-800 uppercase w-fit">
              🔒 E-Sign Requested By {contract.initiator.name}
            </span>
            <h1 className="text-3xl font-black text-black leading-tight">Review Agreement terms</h1>
            <p className="text-xs text-gray-500">
              Please review the campaign details below. If the terms match your negotiate values, verify your identity and sign.
            </p>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 font-bold block mb-1">Contract ID</span>
                  <span className="font-black text-black">{contract.contractNumber}</span>
                </div>
                {contract.brandName && (
                  <>
                    <hr className="border-gray-50" />
                    <div>
                      <span className="text-gray-400 font-bold block mb-1">Client Brand</span>
                      <span className="font-black text-black">
                        {contract.brandName} {contract.brandHandle ? `(${contract.brandHandle})` : ""}
                      </span>
                      {contract.campaignName && (
                        <span className="text-[10px] text-gray-500 block mt-0.5">Campaign: {contract.campaignName}</span>
                      )}
                    </div>
                  </>
                )}
                {contract.creatorName && (
                  <>
                    <hr className="border-gray-50" />
                    <div>
                      <span className="text-gray-400 font-bold block mb-1">Creator</span>
                      <span className="font-black text-black">
                        {contract.creatorName} {contract.creatorHandle ? `(${contract.creatorHandle})` : ""}
                      </span>
                    </div>
                  </>
                )}
                <hr className="border-gray-50" />
                <div>
                  <span className="text-gray-400 font-bold block mb-1">Total Valuation</span>
                  <span className="font-black text-black">PKR {Number(contract.totalAmount).toLocaleString()}</span>
                </div>
                {contract.advancePayment && (
                  <>
                    <hr className="border-gray-50" />
                    <div>
                      <span className="text-gray-400 font-bold block mb-1">Advance Payment</span>
                      <span className="font-black text-black">PKR {Number(contract.advancePayment).toLocaleString()}</span>
                    </div>
                  </>
                )}
                <hr className="border-gray-50" />
                <div>
                  <span className="text-gray-400 font-bold block mb-1">Delivery Frame</span>
                  <span className="font-black text-black">{contract.deliveryTimeframeDays} Days post-execution</span>
                </div>
                <hr className="border-gray-50" />
                <div>
                  <span className="text-gray-400 font-bold block mb-1">Platforms</span>
                  <span className="font-black text-black uppercase">{contract.platformsAllowed.join(", ")}</span>
                </div>
                {contract.exclusivityClause && (
                  <>
                    <hr className="border-gray-50" />
                    <div>
                      <span className="text-gray-400 font-bold block mb-1">Exclusivity Restriction</span>
                      <span className="font-black text-rose-800 uppercase bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[10px] w-fit font-bold block mt-1">
                        Active ({contract.exclusivityDuration || "Not Specified"})
                      </span>
                    </div>
                  </>
                )}
                {contract.brandApprovalRequired && (
                  <>
                    <hr className="border-gray-50" />
                    <div>
                      <span className="text-gray-400 font-bold block mb-1">Content Pre-Approval</span>
                      <span className="font-black text-emerald-800 uppercase bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] w-fit font-bold block mt-1">
                        Required
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Deliverables display */}
              <div className="border-t border-gray-100 pt-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Deliverables Requirements</span>
                <table className="w-full text-[11px] text-left">
                  <thead>
                    <tr className="border-b border-gray-50 text-gray-400 font-bold">
                      <th className="py-1">Format</th>
                      <th className="py-1 text-center">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contract.deliverables?.map((d: any) => (
                      <tr key={d.id} className="text-black font-semibold border-b border-gray-50/50">
                        <td className="py-1.5">{d.type.replace(/_/g, " ")}</td>
                        <td className="py-1.5 text-center">{d.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Column 2: Respondent Details & Signatures Form */}
          <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-xl">
            <h3 className="text-lg font-black text-black border-b border-gray-100 pb-2 text-left mb-6 uppercase tracking-wider">
              Verification & Signature
            </h3>

            <form onSubmit={handleReviewAndSign} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email (OTP identifier) */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">Your Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={respondentEmail}
                    onChange={(e) => setRespondentEmail(e.target.value)}
                    disabled={otpDispatched || otpVerified}
                    className="input-field"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">Your Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="03XXXXXXXXX"
                    value={respondentPhone}
                    onChange={(e) => setRespondentPhone(e.target.value)}
                    disabled={otpVerified}
                    className="input-field"
                  />
                </div>
              </div>

              {/* OTP triggering row */}
              {!otpVerified && (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-[11px] text-gray-500 font-semibold">
                      {otpDispatched 
                        ? "Verification OTP code sent to your email. Enter below." 
                        : "Verify your email identity via OTP to unlock signature pad."}
                    </span>
                    {!otpDispatched && (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={otpLoading || !respondentEmail}
                        className="bg-black text-white hover:bg-black/90 font-bold px-4 py-2 rounded-lg text-[10px] uppercase shadow-sm whitespace-nowrap focus:outline-none"
                      >
                        {otpLoading ? "Sending..." : "Send OTP"}
                      </button>
                    )}
                  </div>

                  {otpDispatched && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        className="input-field text-center font-bold tracking-widest text-lg py-2 max-w-[150px]"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={otpLoading || !otpCode}
                        className="bg-black text-white hover:bg-black/90 font-bold px-5 py-2.5 rounded-xl text-xs uppercase shadow"
                      >
                        {otpLoading ? "Verifying..." : "Verify OTP"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Fields adapting dynamically */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">
                    {isRespondentBrand ? "Contact Person Name" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mohammad Ali"
                    value={respondentName}
                    onChange={(e) => setRespondentName(e.target.value)}
                    disabled={otpVerified && !otpVerified}
                    className="input-field"
                  />
                </div>

                {isRespondentBrand ? (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-black uppercase tracking-wider">Brand / Company Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sapphire"
                        value={respondentCompany}
                        onChange={(e) => setRespondentCompany(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-black uppercase tracking-wider">Your Job Title</label>
                      <input
                        type="text"
                        required
                        placeholder="Marketing Associate"
                        value={respondentDesignation}
                        onChange={(e) => setRespondentDesignation(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">Instagram Handle</label>
                    <input
                      type="text"
                      placeholder="@username"
                      value={collabDetails}
                      onChange={(e) => setCollabDetails(e.target.value)}
                      className="input-field"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">Your Address</label>
                  <input
                    type="text"
                    required
                    placeholder="Office or Home Address, City"
                    value={respondentAddress}
                    onChange={(e) => setRespondentAddress(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              {otpVerified && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-semibold">
                  ✓ Identity verified. Review form and click &quot;Review &amp; Sign&quot; below.
                </div>
              )}

              <button
                type="submit"
                disabled={signing || !otpVerified}
                className="w-full bg-black text-white hover:bg-black/90 font-bold text-xs uppercase py-3 rounded-xl transition-all shadow-md mt-6 flex items-center justify-center gap-2"
              >
                {signing ? "Processing..." : "Review & Sign Agreement ➔"}
              </button>
            </form>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/60 bg-white/70 backdrop-blur-md py-6 flex flex-col md:flex-row items-center justify-between px-6 gap-4 z-10 mt-12">
        <span className="text-xs text-gray-500 font-semibold">
          © {new Date().getFullYear()} {company.name}. Powered by ETO 2002 security layer.
        </span>
        <div className="flex gap-4">
          <a href={`mailto:${company.supportEmail}`} className="text-xs text-gray-500 hover:text-black font-semibold transition-colors">
            Support: {company.supportEmail}
          </a>
        </div>
      </footer>

      {/* Signature Modal */}
      <SignaturePadModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onConfirm={handleExecuteSignature}
        loading={signing}
      />
    </div>
  );
}
