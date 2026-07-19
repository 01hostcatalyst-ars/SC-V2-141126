"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { getCompanyConfig } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { SignaturePadModal } from "@/components/ui/SignaturePadModal";
import { formatLegalDate, formatUsageLicenseText, formatDeliverableTypeName } from "@/lib/utils";
import { getJurisdiction } from "@/lib/config/jurisdictions";
import { formatCurrencyAmount } from "@/lib/currency";

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

  const jur = getJurisdiction(contract?.jurisdictionCountryCode || "US");
  const currCode = contract?.currency || jur.defaultCurrency || "USD";


  // Respondent details states
  const [respondentName, setRespondentName] = useState("");
  const [respondentEmail, setRespondentEmail] = useState("");
  const [respondentPhone, setRespondentPhone] = useState("");
  const [respondentCompany, setRespondentCompany] = useState("");
  const [respondentDesignation, setRespondentDesignation] = useState("");
  const [respondentAddress, setRespondentAddress] = useState("");
  const [respondentNtn, setRespondentNtn] = useState("");
  const [respondentCnic, setRespondentCnic] = useState("");
  const [collabDetails, setCollabDetails] = useState("");

  // Payout details for Creator respondents
  const [paymentMethod, setPaymentMethod] = useState("BANK_IBAN");
  const [bankAccountIban, setBankAccountIban] = useState("");
  const [mobileWalletNumber, setMobileWalletNumber] = useState("");

  // Signature & OTP identity state
  const [stagedSignatureB64, setStagedSignatureB64] = useState("");
  const [stagedFingerprint, setStagedFingerprint] = useState("");
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
          if (data.contract.respondentEmail) setRespondentEmail(data.contract.respondentEmail);
          if (data.contract.respondentName) setRespondentName(data.contract.respondentName);
          if (data.contract.respondentPhone) setRespondentPhone(data.contract.respondentPhone);
          if (data.contract.respondentCompany) setRespondentCompany(data.contract.respondentCompany);
          if (data.contract.respondentAddress) setRespondentAddress(data.contract.respondentAddress);
          if (data.contract.respondentDesignation) setRespondentDesignation(data.contract.respondentDesignation);
          if (data.contract.respondentNtn) setRespondentNtn(data.contract.respondentNtn);
          if (data.contract.paymentMethod) setPaymentMethod(data.contract.paymentMethod);
          if (data.contract.bankAccountIban) setBankAccountIban(data.contract.bankAccountIban);
          if (data.contract.mobileWalletNumber) setMobileWalletNumber(data.contract.mobileWalletNumber);
        } else {
          showToast(data.error || "Agreement link invalid or expired.", "error");
        }
      } catch (err) {
        showToast("Error retrieving campaign details.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSharedContract();
  }, [resolvedParams.token, showToast]);

  const isRespondentBrand = contract?.contractType?.endsWith("_BRAND") ?? false;
  const isRespondentAgency = contract?.contractType?.endsWith("_AGENCY") ?? false;
  const isRespondentCreator = !isRespondentBrand && !isRespondentAgency;
  const isRespondentPayee = ["BRAND_TO_CREATOR", "AGENCY_TO_CREATOR", "BRAND_TO_AGENCY"].includes(contract?.contractType);

  // Validation check: Profile form is complete
  const isFormValid = Boolean(
    respondentEmail &&
    respondentPhone &&
    respondentName &&
    (isRespondentBrand ? respondentCompany : isRespondentAgency ? respondentCompany : collabDetails) &&
    respondentAddress &&
    respondentDesignation &&
    ((isRespondentBrand || isRespondentAgency) 
      ? respondentNtn.trim() 
      : (jur.nationalIdLabel.toLowerCase().includes("optional") || respondentCnic.trim())) &&
    (!isRespondentPayee || (paymentMethod === "BANK_IBAN" ? bankAccountIban.trim() : mobileWalletNumber.trim()))
  );

  // Save drawn signature from modal FIRST
  const handleSaveSignature = (signatureB64: string, fingerprint: string) => {
    setStagedSignatureB64(signatureB64);
    setStagedFingerprint(fingerprint);
    setIsSignModalOpen(false);
    showToast("Digital signature recorded! Now request OTP below to authorize & execute.", "success");
  };

  const handleSendOTP = async () => {
    if (!isFormValid || !stagedSignatureB64) {
      showToast("Please complete profile info and draw your signature first.", "error");
      return;
    }

    setOtpLoading(true);
    try {
      const res = await fetch(`/api/contracts/share/${resolvedParams.token}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: respondentEmail,
          phone: respondentPhone,
          name: respondentName,
          company: (isRespondentBrand || isRespondentAgency) ? respondentCompany : collabDetails,
          address: respondentAddress,
          designation: respondentDesignation,
          respondentEmail,
          respondentPhone,
          respondentName,
          respondentCompany: (isRespondentBrand || isRespondentAgency) ? respondentCompany : collabDetails,
          respondentAddress,
          respondentDesignation,
          respondentNtn: (isRespondentBrand || isRespondentAgency) ? respondentNtn : undefined,
          respondentCnic: isRespondentCreator ? respondentCnic : undefined,
          collabDetails: isRespondentCreator ? collabDetails : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOtpDispatched(true);
        showToast(`Verification code sent to ${respondentEmail}!`, "success");
      } else {
        showToast(data.error || "Failed to dispatch verification code.", "error");
      }
    } catch (err) {
      showToast("Error dispatching verification email.", "error");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyAndExecuteOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      showToast("Please enter the 6-digit OTP code sent to your email.", "error");
      return;
    }
    if (!stagedSignatureB64) {
      showToast("Please draw your digital signature first.", "error");
      return;
    }

    setOtpLoading(true);
    try {
      const res = await fetch(`/api/contracts/share/${resolvedParams.token}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: respondentEmail,
          respondentEmail,
          code: otpCode,
          otpCode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOtpVerified(true);
        showToast("Identity verified! Executing agreement...", "success");
        await handleExecuteSignature(stagedSignatureB64, stagedFingerprint);
      } else {
        showToast(data.error || "Invalid or expired OTP code.", "error");
        setOtpLoading(false);
      }
    } catch (err) {
      showToast("Error verifying identity code.", "error");
      setOtpLoading(false);
    }
  };

  const handleExecuteSignature = async (signatureB64: string, fingerprint: string) => {
    setSigning(true);
    try {
      const res = await fetch(`/api/contracts/share/${resolvedParams.token}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: respondentEmail,
          name: respondentName,
          phone: respondentPhone,
          company: (isRespondentBrand || isRespondentAgency) ? respondentCompany : undefined,
          address: respondentAddress,
          designation: respondentDesignation,
          ntn: (isRespondentBrand || isRespondentAgency) ? respondentNtn : undefined,
          cnic: isRespondentCreator ? respondentCnic : undefined,
          taxId: (isRespondentBrand || isRespondentAgency) ? respondentNtn : undefined,
          nationalId: isRespondentCreator ? respondentCnic : undefined,
          respondentName,
          respondentEmail,
          respondentPhone,
          respondentCompany: (isRespondentBrand || isRespondentAgency) ? respondentCompany : undefined,
          respondentDesignation,
          respondentAddress,
          respondentNtn: (isRespondentBrand || isRespondentAgency) ? respondentNtn : undefined,
          respondentCnic: isRespondentCreator ? respondentCnic : undefined,
          respondentTaxId: (isRespondentBrand || isRespondentAgency) ? respondentNtn : undefined,
          respondentNationalId: isRespondentCreator ? respondentCnic : undefined,
          collabDetails: isRespondentCreator ? collabDetails : undefined,

          paymentMethod: isRespondentPayee ? paymentMethod : undefined,
          bankAccountIban: isRespondentPayee && paymentMethod === "BANK_IBAN" ? bankAccountIban : undefined,
          mobileWalletNumber: isRespondentPayee && paymentMethod !== "BANK_IBAN" ? mobileWalletNumber : undefined,
          signatureB64,
          fingerprint,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Agreement signed successfully!", "success");
        window.location.href = `/c/${resolvedParams.token}/success`;
      } else {
        showToast(data.error || "Failed to execute signature transaction.", "error");
      }
    } catch (err) {
      showToast("Error processing signature transaction.", "error");
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-bold text-sm">
        Loading agreement details...
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-rose-600 font-bold text-sm">
        Agreement unavailable or link has expired.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFC] flex flex-col justify-between font-sans antialiased selection:bg-black selection:text-white">
      {/* Navbar Header */}
      <header className="w-full border-b border-gray-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-20 px-6 md:px-12 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-black text-xl tracking-tight text-black">{company.name}</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Ref: {contract.contractNumber}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-10 space-y-8 z-10">
        
        {/* Banner Welcome */}
        <div className="space-y-2 text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-800 uppercase">
            Mutual Legal Agreement Execution ({jur.lawAbbreviation})
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-black leading-tight">
            Review &amp; Sign Collaboration Agreement
          </h1>
          <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
            Agreement requested by <strong className="text-black">{(contract as any).parties?.find((p: any) => p.partyType === "INITIATOR")?.companyName || (contract as any).parties?.find((p: any) => p.partyType === "INITIATOR")?.name || (contract as any).initiatorCompanyName || contract.initiator?.name}</strong> ({(contract as any).parties?.find((p: any) => p.partyType === "INITIATOR")?.email || contract.initiator?.email}). Complete the verification below, review all campaign terms, and execute your digital signature.
          </p>

        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          
          {/* SECTION 1: REVIEW CAMPAIGN TERMS */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-md space-y-6">
            <div className="border-b border-gray-100 pb-3 text-left">
              <h2 className="text-base font-black text-black uppercase tracking-wider">
                1. Review Campaign Terms
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Please review all campaign parameters below. If terms match your negotiated values, complete your profile details and execute your digital signature below.
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
                    <span className="font-black text-black text-sm">{formatCurrencyAmount(contract.totalAmount, currCode)}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500 block">Advance Payment:</span>
                    <span className="font-bold text-black">{contract.advancePayment ? formatCurrencyAmount(contract.advancePayment, currCode) : "No Advance"}</span>
                    {contract.advancePaymentDate && <span className="text-[10px] text-gray-500 block">Due: {formatLegalDate(contract.advancePaymentDate, contract?.jurisdictionCountryCode)}</span>}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500 block">Remaining Payout:</span>
                    <span className="font-bold text-black">{formatCurrencyAmount(contract.remainingAmount || 0, currCode)}</span>
                    {contract.remainingPaymentDate && <span className="text-[10px] text-gray-500 block">Due: {formatLegalDate(contract.remainingPaymentDate, contract?.jurisdictionCountryCode)}</span>}
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
                          <td className="py-2 font-bold">{formatDeliverableTypeName(d.type)}</td>
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
                    <span className="font-semibold text-gray-500 block mb-1">Granted License:</span>
                    <span className="font-bold text-black">{formatUsageLicenseText(contract.usageType)}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500 block mb-1">Rights Duration:</span>
                    <span className="font-bold text-black">{contract.usageRightsDuration}</span>
                  </div>
                </div>
              </div>

              {/* Card 5: Delivery, Exclusivity & NDA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Delivery Window &amp; Pre-Approval Protocol</span>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">Delivery Deadline:</span>
                    <span className="font-bold text-black">{contract.deliveryTimeframeDays} Days (post product/advance)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">Revision Rounds:</span>
                    <span className="font-bold text-black">{contract.revisionRounds} Rounds ({contract.revisionTurnaroundDays || 5} days/round)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">Pre-Approval Protocol:</span>
                    <span className="font-bold text-black">{contract.brandApprovalRequired ? "Required (48-hr Deemed Approval)" : "Not Required"}</span>
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
                        <span className="font-bold text-black">{contract.embargoDate ? formatLegalDate(contract.embargoDate, contract?.jurisdictionCountryCode) : "Required until official launch"}</span>
                      </div>
                      {contract.earlyDisclosurePenalty && (
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-500">Early Leak Penalty:</span>
                          <span className="font-bold text-rose-600">{formatCurrencyAmount(contract.earlyDisclosurePenalty, currCode)}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Card 6: Collaboration Product & Loan Return Terms (if present) */}
              {contract.collabProduct && (
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Collaboration Product Shipment &amp; Return Terms</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="font-semibold text-gray-500 block">Product:</span>
                      <span className="font-bold text-black">{contract.collabProduct} ({contract.collabProductProvisionType})</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-500 block">Expected Arrival:</span>
                      <span className="font-bold text-black">{contract.collabDeliveryDate ? formatLegalDate(contract.collabDeliveryDate, contract?.jurisdictionCountryCode) : "Not Specified"}</span>
                    </div>
                    {contract.collabDeliveryAddress && (
                      <div>
                        <span className="font-semibold text-gray-500 block">Delivery Address:</span>
                        <span className="font-bold text-black block">{contract.collabDeliveryAddress}</span>
                      </div>
                    )}
                  </div>
                  {contract.collabProductProvisionType === "Product Loan" && (
                    <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-950 space-y-1 mt-2">
                      <div>• Product Loan Return Deadline: Within <strong>{contract.collabProductReturnDays || 7} days</strong> post-deliverable.</div>
                      <div>• Return Shipping Paid By: <strong>{contract.collabProductReturnShippingBy || "Brand"}</strong></div>
                      {contract.collabProductNonReturnFee && <div>• Loss / Non-Return Fee: <strong>{formatCurrencyAmount(contract.collabProductNonReturnFee, currCode)}</strong></div>}
                    </div>
                  )}
                </div>
              )}

              {/* Card 7: Bilateral Safeguard Penalties */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Bilateral Safeguard Penalties &amp; Caps</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="font-semibold text-gray-500 block">Late Payment / Delivery:</span>
                    <span className="font-bold text-black">{Number(contract.latePaymentPenaltyPct)}% / {Number(contract.lateContentPenaltyPct)}% per day (Capped at {Number(contract.penaltyCapPct || 20)}%)</span>
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
                    <span className="font-semibold text-gray-500 block">Non-Delivery Cutoff:</span>
                    <span className="font-bold text-black">{contract.nonDeliveryCutoffDays || 7} Days post-deadline</span>
                  </div>
                </div>
              </div>

              {/* Card 8: Dispute Resolution (ADR) Clause */}
              <div className="p-4 rounded-xl border border-gray-200 bg-blue-50/50 space-y-1 text-[11px] text-blue-950">
                <span className="font-bold uppercase tracking-wider block text-blue-900">Section 11: Governing Law &amp; Dispute Resolution</span>
                <p className="leading-relaxed">
                  {jur.disputeClause} Legal recourse and dispute determination shall be administered under the <strong>{jur.arbitrationAct}</strong>.
                </p>
              </div>

            </div>
          </div>


          {/* SECTION 2: VERIFICATION & DIGITAL SIGNATURE EXECUTION */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-black text-black uppercase tracking-wider">
                  2. Counterparty Verification &amp; Digital Signature Execution
                </h2>
                <p className="text-[11px] text-gray-400 font-medium">
                  Complete your profile details, verify your email identity via OTP, and click Review &amp; Sign to execute.
                </p>
              </div>
              {otpVerified && (
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                  ✓ Identity Verified
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Your Email Address * */}
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
                  className="input-field disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                />
              </div>

              {/* 2. Your Phone Number * */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">
                  Your Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder={`e.g. ${jur.phonePlaceholder}`}
                  value={respondentPhone}
                  onChange={(e) => setRespondentPhone(e.target.value)}
                  disabled={otpDispatched || otpVerified}
                  className="input-field disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                />
              </div>

              {/* 3. Contact Person Name * */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">
                  Contact Person Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Smith"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  disabled={otpDispatched || otpVerified}
                  className="input-field disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                />
              </div>

              {/* 4. Brand / Company Name * */}
              <div className="flex flex-col gap-1">
                {isRespondentBrand ? (
                  <>
                    <label className="text-xs font-bold text-black uppercase tracking-wider">
                      Brand / Company Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sapphire Retail Ltd."
                      value={respondentCompany}
                      onChange={(e) => setRespondentCompany(e.target.value)}
                      disabled={otpDispatched || otpVerified}
                      className="input-field disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    />
                  </>
                ) : isRespondentAgency ? (
                  <>
                    <label className="text-xs font-bold text-black uppercase tracking-wider">
                      Agency Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Creative Hub Agency"
                      value={respondentCompany}
                      onChange={(e) => setRespondentCompany(e.target.value)}
                      disabled={otpDispatched || otpVerified}
                      className="input-field disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    />
                  </>
                ) : (
                  <>
                    <label className="text-xs font-bold text-black uppercase tracking-wider">
                      Instagram / Social Handle <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="@username"
                      value={collabDetails}
                      onChange={(e) => setCollabDetails(e.target.value)}
                      disabled={otpDispatched || otpVerified}
                      className="input-field disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    />
                  </>
                )}
              </div>

              {/* 5. Address * */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs font-bold text-black uppercase tracking-wider">
                  {isRespondentAgency ? "Agency Address" : isRespondentBrand ? "Brand / Company Address" : "Residential / Contact Address"} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Official registered address, City"
                  value={respondentAddress}
                  onChange={(e) => setRespondentAddress(e.target.value)}
                  disabled={otpDispatched || otpVerified}
                  className="input-field disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                />
              </div>

              {/* 6. Job Title AND NTN/CNIC */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">
                  {isRespondentCreator ? "Capacity / Role" : "Your Job Title"} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={isRespondentCreator ? "e.g. Content Creator / Influencer" : "e.g. Head of Marketing / Director"}
                  value={respondentDesignation}
                  onChange={(e) => setRespondentDesignation(e.target.value)}
                  disabled={otpDispatched || otpVerified}
                  className="input-field disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-1">
                {(isRespondentBrand || isRespondentAgency) ? (
                  <>
                    <label className="text-xs font-bold text-black uppercase tracking-wider">
                      {jur.taxIdLabel} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={`e.g. Enter your ${jur.taxIdLabel}`}
                      value={respondentNtn}
                      onChange={(e) => setRespondentNtn(e.target.value)}
                      disabled={otpDispatched || otpVerified}
                      className="input-field disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    />
                  </>
                ) : (
                  <>
                    <label className="text-xs font-bold text-black uppercase tracking-wider">
                      {jur.nationalIdLabel} {!jur.nationalIdLabel.toLowerCase().includes("optional") && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="text"
                      required={!jur.nationalIdLabel.toLowerCase().includes("optional")}
                      placeholder={`e.g. Enter your ${jur.nationalIdLabel.replace(" (Optional)", "")}`}
                      value={respondentCnic}
                      onChange={(e) => setRespondentCnic(e.target.value)}
                      disabled={otpDispatched || otpVerified}
                      className="input-field disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    />
                  </>
                )}
              </div>

              {/* Payout Account Route Selection for Counterparty Payee (Creator / Agency) */}
              {isRespondentPayee && (
                <div className="sm:col-span-2 border-t border-gray-100 pt-4 mt-2 space-y-3">
                  <span className="text-xs font-bold text-black uppercase tracking-wider block">
                    {isRespondentAgency ? "Agency Payout Account Details" : "Your Payout Account Details"} (Required for Campaign Payouts) <span className="text-rose-500">*</span>
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(jur.allowedPaymentMethods || ["BANK_IBAN", "WIRE_TRANSFER", "PAYPAL"]).map((m) => {
                      const labelMap: Record<string, string> = {
                        BANK_IBAN: "Bank Transfer (IBAN)",
                        ACH_ROUTING: "ACH Direct Routing",
                        WIRE_TRANSFER: "Wire Transfer",
                        SEPA: "SEPA Transfer",
                        JAZZCASH: "JazzCash Mobile",
                        EASYPAISA: "EasyPaisa Mobile",
                        PAYPAL: "PayPal",
                        WISE: "Wise Transfer",
                        LOCAL_MOBILE_WALLET: "Mobile Wallet",
                        CREDIT_DEBIT_CARD: "Card On File",
                      };
                      return (
                        <button
                          key={m}
                          type="button"
                          disabled={otpDispatched || otpVerified}
                          onClick={() => setPaymentMethod(m)}
                          className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                            paymentMethod === m
                              ? "bg-black text-white border-black shadow-sm"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {labelMap[m] || m.replace(/_/g, " ")}
                        </button>
                      );
                    })}
                  </div>


                  {paymentMethod === "BANK_IBAN" ? (
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Bank IBAN Number *</label>
                      <input
                        type="text"
                        required
                        disabled={otpDispatched || otpVerified}
                        placeholder="PK36 MEZN 0000 1234 5678 9012"
                        className="input-field font-mono disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                        value={bankAccountIban}
                        onChange={(e) => setBankAccountIban(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Mobile Account Number *</label>
                      <input
                        type="text"
                        required
                        disabled={otpDispatched || otpVerified}
                        placeholder="0300 1234567"
                        className="input-field font-mono disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                        value={mobileWalletNumber}
                        onChange={(e) => setMobileWalletNumber(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 1: DRAW DIGITAL SIGNATURE FIRST */}
              <div className="sm:col-span-2 p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-black uppercase tracking-wider">Step 1: Digital Signature</span>
                  <span className="text-[10px] text-gray-500">
                    {stagedSignatureB64
                      ? "Digital signature recorded! Now request OTP below to authorize & execute."
                      : isFormValid
                      ? "Complete all required fields above to enable Signature Pad."
                      : "Fill all required profile fields above to enable Signature Pad."}
                  </span>
                </div>

                {stagedSignatureB64 ? (
                  <div className="flex items-center gap-3">
                    <div className="bg-white border border-gray-200 rounded-lg p-1.5 flex items-center gap-2">
                      <img src={stagedSignatureB64} alt="Signature Preview" className="h-8 max-w-[120px] object-contain" />
                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase">✓ Drawn</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSignModalOpen(true)}
                      className="text-xs text-gray-600 hover:text-black font-bold underline uppercase"
                    >
                      Redraw
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSignModalOpen(true)}
                    disabled={!isFormValid}
                    className={`font-bold px-6 py-3 rounded-xl text-xs uppercase transition-all whitespace-nowrap ${
                      isFormValid
                        ? "bg-black text-white hover:bg-black/90 shadow-md cursor-pointer"
                        : "bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed"
                    }`}
                  >
                    Draw Signature ➔
                  </button>
                )}
              </div>

              {/* STEP 2: EMAIL OTP IDENTITY AUTHORIZATION & FINAL EXECUTION SECOND */}
              <div className="sm:col-span-2 p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-black uppercase tracking-wider">Step 2: Email OTP Identity Authorization</span>
                    <span className="text-[10px] text-gray-500">
                      {!isFormValid || !stagedSignatureB64
                        ? "🔒 OTP inactive until complete information and digital signature are done above."
                        : otpDispatched
                        ? `Code dispatched to ${respondentEmail}. Enter code to verify & execute contract.`
                        : `Click Send OTP to dispatch verification passcode to ${respondentEmail}.`}
                    </span>
                  </div>

                  {!otpDispatched && (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={!isFormValid || !stagedSignatureB64 || otpLoading}
                      className={`font-bold px-6 py-3 rounded-xl text-xs uppercase transition-all whitespace-nowrap ${
                        isFormValid && stagedSignatureB64 && !otpLoading
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer"
                          : "bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed"
                      }`}
                    >
                      {otpLoading ? "Sending..." : "Send OTP ➔"}
                    </button>
                  )}
                </div>

                {otpDispatched && (
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-gray-200">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="6-digit OTP"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="input-field text-center font-mono font-bold tracking-widest text-sm py-2 max-w-[150px]"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyAndExecuteOTP}
                      disabled={otpLoading || otpCode.length !== 6 || signing}
                      className="w-full sm:w-auto bg-black hover:bg-black/90 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase shadow-md transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      {signing ? "Processing Signature..." : otpLoading ? "Verifying..." : "VERIFY OTP & EXECUTE CONTRACT ➔"}
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

        </form>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/60 bg-white/80 backdrop-blur-md py-6 flex flex-col md:flex-row items-center justify-between px-6 md:px-12 gap-4 z-10 mt-12">
        <span className="text-xs text-gray-500 font-semibold">
          © {new Date().getFullYear()} {company.name}. Powered by ETO 2002 legal security layer.
        </span>
        <div className="flex gap-4 items-center flex-wrap justify-center">
          <Link href="/features" target="_blank" className="text-xs text-gray-600 hover:text-black font-semibold transition-colors">
            Features
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/verify" target="_blank" className="text-xs text-gray-600 hover:text-black font-semibold transition-colors">
            Verify Document
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/terms" target="_blank" className="text-xs text-gray-600 hover:text-black font-semibold transition-colors">
            Terms &amp; Privacy
          </Link>
          <span className="text-gray-300">|</span>
          <a href={`mailto:${company.supportEmail}`} className="text-xs text-gray-500 hover:text-black font-semibold transition-colors">
            Support: {company.supportEmail}
          </a>
        </div>
      </footer>

      {/* Signature Modal */}
      <SignaturePadModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onConfirm={handleSaveSignature}
        loading={signing}
        countryCode={contract?.jurisdictionCountryCode || "US"}
      />

    </div>
  );
}
