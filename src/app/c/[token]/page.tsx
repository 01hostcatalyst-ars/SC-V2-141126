"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { getCompanyConfig } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { SignaturePadModal } from "@/components/ui/SignaturePadModal";

interface PageProps {
  params: Promise<{ token: string }>;
}

const formatUsageType = (type: any) => {
  if (Array.isArray(type)) {
    return type.map((t) => t.replace(/_/g, " ")).join(", ");
  }
  if (typeof type === 'string') {
    return type.replace(/_/g, " ");
  }
  return "N/A";
};

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
      showToast("Please enter a valid email address first.", "error");
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
        showToast("Verification code dispatched to your email!", "success");
      } else {
        showToast(data.error || "Failed to send verification code.", "error");
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
        showToast("Identity successfully verified!", "success");
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
    if (!respondentEmail || !respondentPhone || !respondentName || !respondentAddress) {
      showToast("Please fill in all required verification fields.", "error");
      return;
    }
    if (!otpVerified) {
      showToast("Please verify your email address via OTP first.", "error");
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
      const detailsRes = await fetch(`/api/contracts/share/${resolvedParams.token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadDetails),
      });

      if (!detailsRes.ok) {
        throw new Error("Failed to save respondent parameters.");
      }

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
        throw new Error(signData.error || "Signature execution failed.");
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
        <span className="text-xs font-bold uppercase tracking-wider text-black">Querying agreement...</span>
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
          This agreement link is no longer valid, has expired, or is not accepting counterparty signatures.
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
    <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-hidden text-left">
      {/* Ambient backgrounds */}
      <div className="absolute top-[5%] left-[-5%] w-[80%] h-[40%] rounded-full ambient-glow-purple pointer-events-none z-0" />
      <div className="absolute bottom-[5%] right-[-5%] w-[80%] h-[40%] rounded-full ambient-glow-blue pointer-events-none z-0" />

      {/* Header Bar */}
      <header className="w-full h-16 border-b border-gray-200/60 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 md:px-12 z-10 sticky top-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-black flex items-center justify-center font-bold text-white text-base">
            {company.name[0]}
          </span>
          <span className="font-bold text-lg text-black tracking-tight uppercase">
            {company.name}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
            🔒 Contract No: {contract.contractNumber}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-10 space-y-8 z-10">
        
        {/* Banner Welcome */}
        <div className="space-y-2 text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-800 uppercase">
            ⚖️ Mutual Legal Agreement Execution
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-black leading-tight">
            Review &amp; Sign Collaboration Agreement
          </h1>
          <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
            Agreement requested by <strong className="text-black">{contract.initiator?.name}</strong> ({contract.initiator?.email}). Complete the verification below, review all campaign terms, and execute your digital signature.
          </p>
        </div>

        <form onSubmit={handleReviewAndSign} className="space-y-8">
          
          {/* SECTION 1: VERIFICATION & IDENTITY */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-black text-black uppercase tracking-wider">
                  1. Counterparty Verification &amp; Profile Details
                </h2>
                <p className="text-[11px] text-gray-400 font-medium">
                  Enter your official contact details and verify your email address via OTP.
                </p>
              </div>
              {otpVerified && (
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                  ✓ Identity Verified
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">
                  Your Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={respondentEmail}
                  onChange={(e) => setRespondentEmail(e.target.value)}
                  disabled={otpDispatched || otpVerified}
                  className="input-field"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">
                  Your Phone Number <span className="text-rose-500">*</span>
                </label>
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

              {/* Contact Person Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">
                  Contact Person Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohammad Ali"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  className="input-field"
                />
              </div>

              {isRespondentBrand ? (
                <>
                  {/* Brand / Company Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">
                      Brand / Company Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sapphire Retail Ltd."
                      value={respondentCompany}
                      onChange={(e) => setRespondentCompany(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  {/* Your Job Title */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">
                      Your Job Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Head of Marketing / Director"
                      value={respondentDesignation}
                      onChange={(e) => setRespondentDesignation(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">
                    Instagram / Social Handle
                  </label>
                  <input
                    type="text"
                    placeholder="@username"
                    value={collabDetails}
                    onChange={(e) => setCollabDetails(e.target.value)}
                    className="input-field"
                  />
                </div>
              )}

              {/* Brand / Company Address */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs font-bold text-black uppercase tracking-wider">
                  Brand / Company Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Official registered address, City"
                  value={respondentAddress}
                  onChange={(e) => setRespondentAddress(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {/* OTP VERIFICATION ACTION BOX */}
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
              {!otpVerified ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-black">Email OTP Verification Required</span>
                    <span className="text-[11px] text-gray-500">
                      {otpDispatched
                        ? "A 6-digit OTP has been sent to your email. Check your inbox and enter code below."
                        : "Click Send OTP to receive your 6-digit verification code before signing."}
                    </span>
                  </div>

                  {!otpDispatched ? (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={otpLoading || !respondentEmail}
                      className="bg-black text-white hover:bg-black/90 font-bold px-6 py-2.5 rounded-xl text-xs uppercase shadow transition-all whitespace-nowrap"
                    >
                      {otpLoading ? "Sending..." : "Send OTP Code"}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        className="input-field text-center font-mono font-bold tracking-widest text-base py-2 max-w-[140px]"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={otpLoading || !otpCode}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase shadow transition-all whitespace-nowrap"
                      >
                        {otpLoading ? "Verifying..." : "Verify OTP"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 text-xs font-bold text-emerald-800 bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200">
                  <span className="text-base">✓</span>
                  <span>Email address ({respondentEmail}) has been successfully verified! You may now review all terms below and execute signature.</span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: REVIEW AGREEMENT TERMS */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-md space-y-6">
            <div className="border-b border-gray-100 pb-3 text-left">
              <h2 className="text-base font-black text-black uppercase tracking-wider">
                2. Review Agreement Terms
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Please review the campaign details below. If the terms match your negotiated values, verify your identity and sign.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Card 1: Overview & Parties */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Campaign &amp; Parties Overview</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="font-semibold text-gray-500 block">Direction:</span>
                    <span className="font-bold text-black uppercase">{contract.contractType.replace(/_/g, " ")}</span>
                  </div>
                  {contract.brandName && (
                    <div>
                      <span className="font-semibold text-gray-500 block">Client Brand:</span>
                      <span className="font-bold text-black">{contract.brandName} {contract.brandHandle ? `(${contract.brandHandle})` : ""}</span>
                      {contract.campaignName && <span className="text-[10px] text-gray-500 block">Campaign: {contract.campaignName}</span>}
                    </div>
                  )}
                  {contract.creatorName && (
                    <div>
                      <span className="font-semibold text-gray-500 block">Creator:</span>
                      <span className="font-bold text-black">{contract.creatorName} {contract.creatorHandle ? `(${contract.creatorHandle})` : ""}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Financial Compensation */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Financial Compensation &amp; Payout Terms</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="font-semibold text-gray-500 block">Total Valuation:</span>
                    <span className="font-black text-black text-sm">PKR {Number(contract.totalAmount).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500 block">Advance Escrow:</span>
                    <span className="font-bold text-black">{contract.advancePayment ? `PKR ${Number(contract.advancePayment).toLocaleString()}` : "No Advance"}</span>
                    {contract.advancePaymentDate && <span className="text-[10px] text-gray-500 block">Due: {new Date(contract.advancePaymentDate).toLocaleDateString()}</span>}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500 block">Remaining Payout:</span>
                    <span className="font-bold text-black">PKR {Number(contract.remainingAmount || 0).toLocaleString()}</span>
                    {contract.remainingPaymentDate && <span className="text-[10px] text-gray-500 block">Due: {new Date(contract.remainingPaymentDate).toLocaleDateString()}</span>}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500 block">Payment Route Method:</span>
                    <span className="font-bold text-black uppercase">{contract.paymentMethod ? contract.paymentMethod.replace(/_/g, " ") : "Not Specified"}</span>
                    <span className="text-[10px] text-gray-500 font-mono block truncate">{contract.paymentMethod === "BANK_IBAN" ? contract.bankAccountIban : contract.mobileWalletNumber}</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Deliverables Requirements */}
              <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Campaign Deliverables Table</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-500 font-bold">
                        <th className="py-2">Platform Format</th>
                        <th className="py-2 text-center">Qty</th>
                        <th className="py-2 text-center">Retention Duration</th>
                        <th className="py-2">Instructions / Brief</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contract.deliverables?.map((d: any) => (
                        <tr key={d.id} className="border-b border-gray-50 text-black">
                          <td className="py-2 font-bold">{d.type.replace(/_/g, " ")}</td>
                          <td className="py-2 font-bold text-center">{d.quantity}</td>
                          <td className="py-2 text-gray-500 font-semibold text-center">{d.duration || "Permanent"}</td>
                          <td className="py-2 text-gray-500 max-w-xs">{d.notes || "No notes"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Card 4: Usage Rights & Scope */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Usage Rights &amp; Platform Scope</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="font-semibold text-gray-500 block mb-1">Platforms Allowed:</span>
                    <div className="flex flex-wrap gap-1">
                      {contract.platformsAllowed?.map((p: string) => (
                        <span key={p} className="px-2 py-0.5 rounded bg-black text-white text-[10px] font-bold">{p}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500 block mb-1">Usage Category:</span>
                    <span className="font-bold text-black uppercase">{formatUsageType(contract.usageType)}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500 block mb-1">Rights Duration:</span>
                    <span className="font-bold text-black">{contract.usageRightsDuration}</span>
                  </div>
                </div>
              </div>

              {/* Card 5: Delivery & Exclusivity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Delivery Window &amp; Exclusivity</span>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">Delivery Deadline:</span>
                    <span className="font-bold text-black">{contract.deliveryTimeframeDays} Days post-execution</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">Revision Rounds:</span>
                    <span className="font-bold text-black">{contract.revisionRounds} Rounds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">Pre-Approval:</span>
                    <span className="font-bold text-black">{contract.brandApprovalRequired ? "Required" : "Not Required"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">Exclusivity Clause:</span>
                    <span className="font-bold text-black">{contract.exclusivityClause ? `Active (${contract.exclusivityDuration || "Yes"})` : "No"}</span>
                  </div>
                  {contract.exclusivityClause && contract.exclusivityCompetitors && (
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-500">Prohibited Competitors:</span>
                      <span className="font-bold text-black truncate max-w-[180px]" title={contract.exclusivityCompetitors}>{contract.exclusivityCompetitors}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Confidentiality / Pre-Launch NDA</span>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">NDA Embargo Status:</span>
                    <span className="font-bold text-black">{contract.confidentialityRequired ? "Strict NDA Active" : "Standard Confidentiality"}</span>
                  </div>
                  {contract.confidentialityRequired && (
                    <>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-500">Embargo Launch Date:</span>
                        <span className="font-bold text-black">{contract.embargoDate ? new Date(contract.embargoDate).toLocaleDateString() : "Required until official launch"}</span>
                      </div>
                      {contract.earlyDisclosurePenalty && (
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-500">Early Leak Penalty:</span>
                          <span className="font-bold text-rose-600">PKR {Number(contract.earlyDisclosurePenalty).toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Card 6: Collaboration Product (if present) */}
              {contract.collabProduct && (
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Collaboration Product Shipment</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="font-semibold text-gray-500 block">Product:</span>
                      <span className="font-bold text-black">{contract.collabProduct} ({contract.collabProductProvisionType})</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-500 block">Expected Arrival:</span>
                      <span className="font-bold text-black">{contract.collabDeliveryDate ? new Date(contract.collabDeliveryDate).toLocaleDateString() : "Not Specified"}</span>
                    </div>
                    {contract.collabDeliveryAddress && (
                      <div>
                        <span className="font-semibold text-gray-500 block">Delivery Address:</span>
                        <span className="font-bold text-black block">{contract.collabDeliveryAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Card 7: Tagging & Copyright Terms */}
              {(contract.taggingRequirements || contract.contentOwnership) && (
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Tagging &amp; Copyright Terms</span>
                  {contract.taggingRequirements && (
                    <div>
                      <span className="font-semibold text-gray-500 block mb-0.5">Tagging / Caption Requirements:</span>
                      <p className="font-bold text-black bg-white p-2.5 rounded border border-gray-200">{contract.taggingRequirements}</p>
                    </div>
                  )}
                  {contract.contentOwnership && (
                    <div>
                      <span className="font-semibold text-gray-500 block mb-0.5">Content Ownership Clause:</span>
                      <p className="text-gray-800 leading-relaxed bg-white p-2.5 rounded border border-gray-200">{contract.contentOwnership}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Card 8: Bilateral Safeguard Penalties */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Bilateral Safeguard Penalties</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="font-semibold text-gray-500 block">Late Payment / Delivery:</span>
                    <span className="font-bold text-black">{Number(contract.latePaymentPenaltyPct)}% / {Number(contract.lateContentPenaltyPct)}% per day</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500 block">Unauthorized Brand Re-Use:</span>
                    <span className="font-bold text-black">{Number(contract.unauthorizedUsagePenaltyPct || 50)}% of fee</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500 block">Non-Delivery Advance Refund:</span>
                    <span className="font-bold text-black">{contract.advanceRefundable !== false ? `Yes (within ${contract.advanceRefundTimeframeDays || 7} days)` : "No"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500 block">Pre-Delivery Cancellation Fee:</span>
                    <span className="font-bold text-black">{Number(contract.cancellationFeePct || 25)}% of fee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: SIGNATURE & EXECUTION BUTTON */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-md text-center space-y-4">
            <h2 className="text-base font-black text-black uppercase tracking-wider">
              3. Execute Digital Signature
            </h2>
            <p className="text-xs text-gray-500 max-w-lg mx-auto">
              By clicking below, your digital signature will be recorded along with an ETO 2002 audit log containing your verified email, IP address, and cryptographic timestamp.
            </p>

            <button
              type="submit"
              disabled={signing}
              className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
                otpVerified
                  ? "bg-black text-white hover:bg-black/90 cursor-pointer"
                  : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
              }`}
            >
              {signing
                ? "Processing Signature..."
                : otpVerified
                ? "REVIEW & SIGN AGREEMENT ➔"
                : "🔒 Verify Email via OTP Above to Unlock Signature"}
            </button>
          </div>

        </form>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/60 bg-white/80 backdrop-blur-md py-6 flex flex-col md:flex-row items-center justify-between px-6 md:px-12 gap-4 z-10 mt-12">
        <span className="text-xs text-gray-500 font-semibold">
          © {new Date().getFullYear()} {company.name}. Powered by ETO 2002 legal security layer.
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
