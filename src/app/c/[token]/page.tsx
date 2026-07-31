"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { getCompanyConfig } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { SignaturePadModal } from "@/components/ui/SignaturePadModal";
import { formatLegalDate, formatUsageLicenseText, formatDeliverableTypeName } from "@/lib/utils";
import { getJurisdiction } from "@/lib/config/jurisdictions";
import { formatCurrencyAmount } from "@/lib/currency";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { ModernSelect } from "@/components/ui/ModernSelect";

const RESPONDENT_TITLE_SUGGESTIONS = [
  "Marketing Director",
  "Brand Campaign Manager",
  "Lead Content Creator / Influencer",
  "Creative Director",
  "Founder & CEO",
  "Talent Manager / Agent",
];

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
  const [respondentCapacity, setRespondentCapacity] = useState<"CREATOR_SELF" | "CREATOR_MANAGER">("CREATOR_SELF");
  const [creatorLegalName, setCreatorLegalName] = useState("");
  const [confirmHandleChecked, setConfirmHandleChecked] = useState(false);

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

  // Executed & PDF Download state
  const [isExecuted, setIsExecuted] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);

  useEffect(() => {
    const fetchSharedContract = async () => {
      try {
        const res = await fetch(`/api/contracts/share/${resolvedParams.token}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setContract(data.contract);
          if (data.isExecuted || data.contract.status === "ACTIVE" || data.contract.status === "COMPLETED") {
            setIsExecuted(true);
          }
          if (data.contract.respondentEmail) setRespondentEmail(data.contract.respondentEmail);
          if (data.contract.respondentName) setRespondentName(data.contract.respondentName);
          if (data.contract.respondentPhone) setRespondentPhone(data.contract.respondentPhone);
          if (data.contract.respondentCompany) setRespondentCompany(data.contract.respondentCompany);
          if (data.contract.respondentAddress) setRespondentAddress(data.contract.respondentAddress);
          if (data.contract.respondentDesignation) setRespondentDesignation(data.contract.respondentDesignation);
          if (data.contract.respondentNtn) setRespondentNtn(data.contract.respondentNtn);
          if (data.contract.respondentPaymentMethod) setPaymentMethod(data.contract.respondentPaymentMethod);
          if (data.contract.respondentBankAccountIban) setBankAccountIban(data.contract.respondentBankAccountIban);
          if (data.contract.respondentMobileWalletNumber) setMobileWalletNumber(data.contract.respondentMobileWalletNumber);
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

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const res = await fetch(`/api/contracts/share/${resolvedParams.token}/pdf`);
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        window.open(data.url, "_blank");
      } else {
        showToast(data.error || "Failed to retrieve Contract PDF.", "error");
      }
    } catch (err) {
      showToast("Error downloading Contract PDF.", "error");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadCertificate = async () => {
    setDownloadingCert(true);
    try {
      const res = await fetch(`/api/contracts/share/${resolvedParams.token}/certificate`);
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        window.open(data.url, "_blank");
      } else {
        showToast(data.error || "Failed to retrieve Audit Certificate PDF.", "error");
      }
    } catch (err) {
      showToast("Error downloading Audit Certificate.", "error");
    } finally {
      setDownloadingCert(false);
    }
  };

  const isRespondentBrand = contract?.contractType?.endsWith("_BRAND") ?? false;
  const isRespondentAgency = contract?.contractType?.endsWith("_AGENCY") ?? false;
  const isRespondentCreator = !isRespondentBrand && !isRespondentAgency;
  const isRespondentPayee = ["BRAND_TO_CREATOR", "AGENCY_TO_CREATOR", "BRAND_TO_AGENCY"].includes(contract?.contractType);

  // Validation check: Profile form is complete
  const isBankOrService = ["BANK_IBAN", "SEPA", "WIRE_TRANSFER", "ACH_ROUTING", "PAYPAL", "WISE", "CREDIT_DEBIT_CARD"].includes(paymentMethod);
  const isFormValid = Boolean(
    respondentEmail &&
    respondentPhone &&
    respondentName &&
    (isRespondentBrand ? respondentCompany : isRespondentAgency ? respondentCompany : confirmHandleChecked) &&
    (isRespondentCreator && respondentCapacity === "CREATOR_MANAGER" ? creatorLegalName.trim() : true) &&
    respondentAddress &&
    respondentDesignation &&
    ((isRespondentBrand || isRespondentAgency) 
      ? respondentNtn.trim() 
      : (jur.nationalIdLabel.toLowerCase().includes("optional") || respondentCnic.trim())) &&
    (!isRespondentPayee || (isBankOrService ? bankAccountIban.trim() : mobileWalletNumber.trim()))
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
      showToast("Please complete profile info, confirm creator handle, and draw your signature first.", "error");
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
          company: (isRespondentBrand || isRespondentAgency) ? respondentCompany : undefined,
          address: respondentAddress,
          designation: respondentDesignation,
          respondentEmail,
          respondentPhone,
          respondentName,
          respondentCompany: (isRespondentBrand || isRespondentAgency) ? respondentCompany : undefined,
          respondentAddress,
          respondentDesignation,
          respondentNtn: (isRespondentBrand || isRespondentAgency) ? respondentNtn : undefined,
          respondentCnic: isRespondentCreator ? respondentCnic : undefined,
          creatorLegalName: isRespondentCreator && respondentCapacity === "CREATOR_MANAGER" ? creatorLegalName : undefined,
          respondentCapacity,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOtpDispatched(true);
        showToast(data.message || `Verification code sent to ${respondentEmail}`, "success");
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
          creatorLegalName: isRespondentCreator && respondentCapacity === "CREATOR_MANAGER" ? creatorLegalName : undefined,
          respondentCapacity,

          paymentMethod: isRespondentPayee ? paymentMethod : undefined,
          bankAccountIban: isRespondentPayee && isBankOrService ? bankAccountIban : undefined,
          mobileWalletNumber: isRespondentPayee && !isBankOrService ? mobileWalletNumber : undefined,
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
      <div className="min-h-screen flex items-center justify-center bg-theme-gradient text-slate-700 font-medium text-sm">
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-gray-200 shadow-xl">
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <span>Retrieving campaign agreement details...</span>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-gradient text-rose-600 font-medium text-sm">
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl border border-rose-200 shadow-xl text-center space-y-3 max-w-md">
          <svg className="w-8 h-8 text-rose-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-base font-bold text-slate-900">Agreement Unavailable</div>
          <p className="text-xs text-slate-600 leading-relaxed">
            This agreement link may have expired or is no longer accessible. Please contact the initiator for an updated link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col justify-between font-sans antialiased text-left selection:bg-black selection:text-white">
      {/* Background ambient glow shapes */}
      <div className="absolute top-[5%] left-[-5%] w-[80%] h-[40%] rounded-full ambient-glow-purple pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-5%] w-[80%] h-[40%] rounded-full ambient-glow-blue pointer-events-none z-0" />

      {/* Navbar Header */}
      <header className="w-full border-b border-gray-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-20 px-6 sm:px-12 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-black flex items-center justify-center font-bold text-white text-base shadow-sm">
            {company.name[0]}
          </span>
          <span className="font-bold text-lg tracking-tight text-black uppercase">{company.name}</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full tracking-wider uppercase">
            Ref: {contract.contractNumber}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 md:p-10 space-y-8 z-10">
        
        {/* Banner Welcome */}
        {isExecuted ? (
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white uppercase tracking-wider w-fit">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Bilaterally Executed &amp; Activated</span>
                </span>

                <h1 className="text-2xl sm:text-3xl font-bold text-emerald-950 tracking-tight">
                  Campaign Agreement Executed &amp; Locked
                </h1>

                <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed max-w-xl">
                  This agreement was executed under {jur.lawAbbreviation} on {formatLegalDate(contract.activatedAt || contract.updatedAt, contract?.jurisdictionCountryCode)}. The deal terms below are read-only and cryptographically locked.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="px-5 py-3 rounded-2xl bg-black hover:bg-slate-900 text-white font-bold text-xs uppercase transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>{downloadingPdf ? "Generating PDF..." : "Download Contract PDF"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCertificate}
                  disabled={downloadingCert}
                  className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>{downloadingCert ? "Generating Certificate..." : "Audit Certificate"}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-900 uppercase tracking-wider w-fit">
              <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Mutual Legal Agreement Execution ({jur.lawAbbreviation})</span>
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Review &amp; Sign Collaboration Agreement
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              Agreement requested by <strong className="text-slate-900 font-bold">{(contract as any).parties?.find((p: any) => p.partyType === "INITIATOR")?.companyName || (contract as any).parties?.find((p: any) => p.partyType === "INITIATOR")?.name || (contract as any).initiatorCompanyName || contract.initiator?.name}</strong> ({(contract as any).parties?.find((p: any) => p.partyType === "INITIATOR")?.email || contract.initiator?.email}). Complete the verification below, review all campaign terms, and execute your digital signature.
            </p>
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          
          {/* SECTION 1: REVIEW CAMPAIGN TERMS (Card after Card Layout) */}
          <div className="space-y-6">
            
            {/* Header Section Title */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-wider">
                1. Campaign &amp; Legal Terms
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Please review all campaign parameters below. If terms match your negotiated values, complete your profile details and execute your digital signature in section 2 below.
              </p>
            </div>

            {/* CARD A: Campaign & Parties Overview */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Campaign &amp; Parties Overview</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-slate-500 block">Direction</span>
                  <span className="font-bold text-slate-900 uppercase text-sm block">{contract.contractType.replace(/_/g, " ")}</span>
                </div>

                {contract.brandName && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-500 block">Client Brand</span>
                    <span className="font-bold text-slate-900 text-sm block">{contract.brandName} {contract.brandHandle ? `(${contract.brandHandle})` : ""}</span>
                    {contract.campaignName && <span className="text-xs text-slate-500 block">Campaign: {contract.campaignName}</span>}
                  </div>
                )}

                {contract.creatorName && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-500 block">Creator</span>
                    <span className="font-bold text-slate-900 text-sm block">{contract.creatorName} {contract.creatorHandle ? `(${contract.creatorHandle})` : ""}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CARD B: Financial Compensation & Payout Terms (Full Width Rows - No side-by-side squishing) */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Financial Compensation &amp; Payout Terms</span>
              
              <div className="space-y-3">
                {/* Row 1: Total Valuation */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600">Total Valuation</span>
                  <span className="text-base font-bold text-slate-900">{formatCurrencyAmount(contract.totalAmount, currCode)}</span>
                </div>

                {/* Row 2: Advance Payment */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-slate-600 block">Advance Payment</span>
                    {contract.advancePaymentDate && (
                      <span className="text-xs text-slate-500 block">Due: {formatLegalDate(contract.advancePaymentDate, contract?.jurisdictionCountryCode)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900">
                      {contract.advancePayment ? formatCurrencyAmount(contract.advancePayment, currCode) : "No Advance"}
                    </span>
                    {contract.advancePayment && (
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        contract.advanceReceived 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800 uppercase" 
                          : "bg-amber-50 border-amber-200 text-amber-800 uppercase"
                      }`}>
                        {contract.advanceReceived ? "Confirmed" : "Pending"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Row 3: Remaining Payout */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-slate-600 block">Remaining Payout</span>
                    {contract.remainingPaymentDate && (
                      <span className="text-xs text-slate-500 block">Due: {formatLegalDate(contract.remainingPaymentDate, contract?.jurisdictionCountryCode)}</span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-slate-900">{formatCurrencyAmount(contract.remainingAmount || 0, currCode)}</span>
                </div>

                {/* Row 4: Route Method & Account */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600">Payment Route Method</span>
                  <div className="text-left sm:text-right">
                    <span className="text-sm font-bold text-slate-900 uppercase block">{contract.paymentMethod ? contract.paymentMethod.replace(/_/g, " ") : "Not Specified"}</span>
                    <span className="text-xs text-slate-600 block">{contract.paymentMethod === "BANK_IBAN" ? contract.bankAccountIban : contract.mobileWalletNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD C: Campaign Deliverables Table */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Campaign Deliverables Table</span>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-3">Platform Format</th>
                      <th className="py-3 px-3 text-center">Quantity</th>
                      <th className="py-3 px-3 text-center">Stay Published</th>
                      <th className="py-3 px-3">Instructions / Brief</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {contract.deliverables?.map((d: any) => (
                      <tr key={d.id} className="text-slate-900">
                        <td className="py-3.5 px-3 font-bold text-xs sm:text-sm">{formatDeliverableTypeName(d.type)}</td>
                        <td className="py-3.5 px-3 font-bold text-center text-xs sm:text-sm">{d.quantity}</td>
                        <td className="py-3.5 px-3 text-slate-600 font-medium text-center">{d.duration || "Permanent"}</td>
                        <td className="py-3.5 px-3 text-slate-600 max-w-xs">{d.notes || "No notes"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CARD D: Usage Rights & Scope */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Usage Rights &amp; Platform Scope</span>
              
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600">Platforms Allowed</span>
                  <div className="flex flex-wrap gap-1.5">
                    {contract.platformsAllowed?.map((p: string) => (
                      <span key={p} className="px-3 py-1 rounded-lg bg-black text-white text-xs font-bold">{p}</span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600">Granted License</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">{formatUsageLicenseText(contract.usageType)}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600">Rights Duration</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">{contract.usageRightsDuration}</span>
                </div>
              </div>
            </div>

            {/* CARD E: Delivery Timeline & Pre-Approval Protocol */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Delivery Window &amp; Pre-Approval Protocol</span>
              
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-semibold text-slate-600">Delivery Deadline</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{contract.deliveryTimeframeDays} Days (post product/advance)</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-semibold text-slate-600">Revision Rounds</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{contract.revisionRounds} Rounds ({contract.revisionTurnaroundDays || 5} days/round)</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-semibold text-slate-600">Pre-Approval Protocol</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{contract.brandApprovalRequired ? "Required (48-hr Deemed Approval)" : "Not Required"}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-semibold text-slate-600">Exclusivity Clause</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{contract.exclusivityClause ? `Active (${contract.exclusivityDuration || "Yes"})` : "No"}</span>
                </div>

                {contract.exclusivityClause && contract.exclusivityCompetitors && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-semibold text-slate-600">Prohibited Competitors</span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{contract.exclusivityCompetitors}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CARD F: Confidentiality / Pre-Launch NDA (if required) */}
            {contract.confidentialityRequired && (
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Confidentiality / Pre-Launch NDA</span>
                
                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-semibold text-slate-600">NDA Embargo Status</span>
                    <span className="font-bold text-slate-900">Strict NDA Active</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-semibold text-slate-600">Embargo Launch Date</span>
                    <span className="font-bold text-slate-900">{contract.embargoDate ? formatLegalDate(contract.embargoDate, contract?.jurisdictionCountryCode) : "Required until official launch"}</span>
                  </div>

                  {contract.earlyDisclosurePenalty && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-semibold text-slate-600">Early Leak Penalty</span>
                      <span className="font-bold text-rose-600 text-xs sm:text-sm">{formatCurrencyAmount(contract.earlyDisclosurePenalty, currCode)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CARD G: Collaboration Product Shipment & Return Terms (if present) */}
            {contract.collabProduct && (
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Collaboration Product Shipment &amp; Return Terms</span>
                
                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-semibold text-slate-600">Product Details</span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{contract.collabProduct} ({contract.collabProductProvisionType})</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-semibold text-slate-600">Expected Arrival Date</span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{contract.collabDeliveryDate ? formatLegalDate(contract.collabDeliveryDate, contract?.jurisdictionCountryCode) : "Not Specified"}</span>
                  </div>

                  {contract.collabDeliveryAddress && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="font-semibold text-slate-600 block">Delivery Address</span>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm block">{contract.collabDeliveryAddress}</span>
                    </div>
                  )}

                  {contract.collabProductProvisionType === "Product Loan" && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5 leading-relaxed">
                      <div>Product Loan Return Deadline: Within <strong className="font-bold">{contract.collabProductReturnDays || 7} days</strong> post-deliverable.</div>
                      <div>Return Shipping Paid By: <strong className="font-bold">{contract.collabProductReturnShippingBy || "Brand"}</strong></div>
                      {contract.collabProductNonReturnFee && <div>Loss / Non-Return Fee: <strong className="font-bold">{formatCurrencyAmount(contract.collabProductNonReturnFee, currCode)}</strong></div>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CARD H: Bilateral Safeguard Penalties */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Bilateral Safeguard Penalties &amp; Caps</span>
              
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-semibold text-slate-600">Late Payment / Delivery</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{Number(contract.latePaymentPenaltyPct)}% / {Number(contract.lateContentPenaltyPct)}% per day (Capped at {Number(contract.penaltyCapPct || 20)}%)</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-semibold text-slate-600">Unauthorized Brand Re-Use</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{Number(contract.unauthorizedUsagePenaltyPct || 50)}% of fee</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-semibold text-slate-600">Non-Delivery Advance Refund</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{contract.advanceRefundable !== false ? `Yes (within ${contract.advanceRefundTimeframeDays || 7} days)` : "No"}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-semibold text-slate-600">Non-Delivery Cutoff</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{contract.nonDeliveryCutoffDays || 7} Days post-deadline</span>
                </div>
              </div>
            </div>

            {/* CARD I: Section 11 - Governing Law & Dispute Resolution (ADR) */}
            <div className="bg-blue-50/60 border border-blue-200 rounded-3xl p-6 sm:p-8 space-y-2 text-xs text-blue-950">
              <span className="font-bold uppercase tracking-wider block text-blue-900 text-xs">Section 11: Governing Law &amp; Dispute Resolution</span>
              <p className="leading-relaxed">
                {jur.disputeClause} Legal recourse and dispute determination shall be administered under the <strong>{jur.arbitrationAct}</strong>.
              </p>
            </div>

          </div>

          {/* SECTION 2: VERIFICATION & DIGITAL SIGNATURE EXECUTION / PDF DOWNLOAD CENTER */}
          {isExecuted ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-left">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-wider">
                  2. Bilateral Execution &amp; PDF Download Center
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  This agreement is fully signed and active. Below are your persistent legal PDF transaction documents.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
                  <div className="font-bold text-slate-900 text-sm sm:text-base">Bilateral Executed Contract PDF</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Contains the full A4 legal agreement with all 11 standardized clauses, party signatures, and payment details.
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                    className="w-full py-3.5 rounded-2xl bg-black text-white font-bold text-xs uppercase hover:bg-slate-900 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>{downloadingPdf ? "Retrieving PDF..." : "Download Contract PDF"}</span>
                  </button>
                </div>

                <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-4">
                  <div className="font-bold text-blue-950 text-sm sm:text-base">Standalone Legal Audit Certificate PDF</div>
                  <p className="text-xs text-blue-900/70 leading-relaxed">
                    Contains verification QR code, SHA-256 document checksums, IP addresses, device fingerprints, and time logs.
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadCertificate}
                    disabled={downloadingCert}
                    className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-bold text-xs uppercase hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>{downloadingCert ? "Retrieving Certificate..." : "Download Audit Certificate"}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-wider">
                    2. Counterparty Verification &amp; Digital Signature Execution
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Complete your profile details, verify your email identity via OTP, and execute your digital signature.
                  </p>
                </div>
                {otpVerified && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 rounded-full uppercase tracking-wider w-fit">
                    <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Identity Verified</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* 1. Your Email Address * */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Your Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={respondentEmail}
                    onChange={(e) => setRespondentEmail(e.target.value)}
                    disabled={otpDispatched || otpVerified}
                    className="px-4 py-3 text-sm font-medium rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black bg-slate-50/50 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                  />
                </div>

                {/* 2. Your Phone Number * */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Your Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={`e.g. ${jur.phonePlaceholder}`}
                    value={respondentPhone}
                    onChange={(e) => setRespondentPhone(e.target.value)}
                    disabled={otpDispatched || otpVerified}
                    className="px-4 py-3 text-sm font-medium rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black bg-slate-50/50 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                  />
                </div>

                {/* 3. Signing Capacity & Creator Identification (If Creator Counterparty) */}
                {isRespondentCreator && (
                  <div className="sm:col-span-2">
                    <ModernSelect
                      label="Signing Capacity *"
                      value={respondentCapacity}
                      onChange={(val: any) => {
                        setRespondentCapacity(val);
                        if (val === "CREATOR_MANAGER") {
                          setRespondentDesignation("Authorized Talent Manager");
                        } else {
                          setRespondentDesignation("Content Creator / Influencer");
                        }
                      }}
                      options={[
                        { value: "CREATOR_SELF", label: "I am the Creator (Signing Myself)" },
                        { value: "CREATOR_MANAGER", label: "I am an Authorized Manager / Agent (Signing for Creator)" },
                      ]}
                    />
                  </div>
                )}

                {/* Contact Person Name / Signer Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {respondentCapacity === "CREATOR_MANAGER" ? "Signer / Manager Name" : "Signer's Full Legal Name"} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={respondentCapacity === "CREATOR_MANAGER" ? "e.g. John Smith" : "e.g. Sarah Khan"}
                    value={respondentName}
                    onChange={(e) => setRespondentName(e.target.value)}
                    disabled={otpDispatched || otpVerified}
                    className="px-4 py-3 text-sm font-medium rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black bg-slate-50/50 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                  />
                </div>

                {/* 4. Brand / Company Name OR Creator Handle Checkbox Confirmation */}
                {isRespondentBrand ? (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Brand / Company Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sapphire Retail Ltd."
                      value={respondentCompany}
                      onChange={(e) => setRespondentCompany(e.target.value)}
                      disabled={otpDispatched || otpVerified}
                      className="px-4 py-3 text-sm font-medium rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black bg-slate-50/50 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                    />
                  </div>
                ) : isRespondentAgency ? (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Agency Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Creative Hub Agency"
                      value={respondentCompany}
                      onChange={(e) => setRespondentCompany(e.target.value)}
                      disabled={otpDispatched || otpVerified}
                      className="px-4 py-3 text-sm font-medium rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black bg-slate-50/50 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                    />
                  </div>
                ) : (
                  <div className="flex items-start gap-3.5 p-4 bg-slate-50 border border-slate-200/80 rounded-xl sm:col-span-2">
                    <input
                      type="checkbox"
                      id="confirmHandle"
                      checked={confirmHandleChecked}
                      onChange={(e) => setConfirmHandleChecked(e.target.checked)}
                      disabled={otpDispatched || otpVerified}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-black focus:ring-black cursor-pointer"
                    />
                    <label htmlFor="confirmHandle" className="text-xs text-slate-700 font-medium cursor-pointer leading-relaxed">
                      <strong className="text-slate-900 font-bold">Confirm Creator Handle:</strong> I confirm that I am the creator or authorized representative for Instagram account <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{contract?.creatorHandle || "N/A"}</span>. <span className="text-rose-500">*</span>
                    </label>
                  </div>
                )}

                {/* 4b. Conditional Creator Legal Name (if Manager signing) */}
                {isRespondentCreator && respondentCapacity === "CREATOR_MANAGER" && (
                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Creator Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Khan"
                      value={creatorLegalName}
                      onChange={(e) => setCreatorLegalName(e.target.value)}
                      disabled={otpDispatched || otpVerified}
                      className="px-4 py-3 text-sm font-medium rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black bg-slate-50/50 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                    />
                  </div>
                )}

                {/* 5. Address * */}
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {isRespondentAgency ? "Agency Address" : isRespondentBrand ? "Brand / Company Address" : "Residential / Contact Address"} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Official registered address, City"
                    value={respondentAddress}
                    onChange={(e) => setRespondentAddress(e.target.value)}
                    disabled={otpDispatched || otpVerified}
                    className="px-4 py-3 text-sm font-medium rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black bg-slate-50/50 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                  />
                </div>

                {/* 6. Job Title AND NTN/CNIC */}
                <div>
                  <AutocompleteInput
                    label={isRespondentCreator ? "Capacity / Role" : "Your Job Title"}
                    required
                    disabled={otpDispatched || otpVerified}
                    placeholder={isRespondentCreator ? "e.g. Content Creator / Influencer" : "e.g. Head of Marketing / Director"}
                    value={respondentDesignation}
                    onChange={(val) => setRespondentDesignation(val)}
                    suggestions={RESPONDENT_TITLE_SUGGESTIONS}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  {(isRespondentBrand || isRespondentAgency) ? (
                    <>
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        {jur.taxIdLabel} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={`e.g. Enter your ${jur.taxIdLabel}`}
                        value={respondentNtn}
                        onChange={(e) => setRespondentNtn(e.target.value)}
                        disabled={otpDispatched || otpVerified}
                        className="px-4 py-3 text-sm font-medium rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black bg-slate-50/50 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                      />
                    </>
                  ) : (
                    <>
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        {jur.nationalIdLabel} {!jur.nationalIdLabel.toLowerCase().includes("optional") && <span className="text-rose-500">*</span>}
                      </label>
                      <input
                        type="text"
                        required={!jur.nationalIdLabel.toLowerCase().includes("optional")}
                        placeholder={`e.g. Enter your ${jur.nationalIdLabel.replace(" (Optional)", "")}`}
                        value={respondentCnic}
                        onChange={(e) => setRespondentCnic(e.target.value)}
                        disabled={otpDispatched || otpVerified}
                        className="px-4 py-3 text-sm font-medium rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black bg-slate-50/50 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                      />
                    </>
                  )}
                </div>

                {/* Payout Account Route Selection for Counterparty Payee (Creator / Agency) */}
                {isRespondentPayee && (
                  <div className="sm:col-span-2 border-t border-slate-100 pt-6 mt-2 space-y-4">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                      {isRespondentAgency ? "Agency Payout Account Details" : "Your Payout Account Details"} (Required for Campaign Payouts) <span className="text-rose-500">*</span>
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                            className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                              paymentMethod === m
                                ? "bg-black text-white border-black shadow-md"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {labelMap[m] || m.replace(/_/g, " ")}
                          </button>
                        );
                      })}
                    </div>

                    {paymentMethod === "BANK_IBAN" || paymentMethod === "SEPA" || paymentMethod === "WIRE_TRANSFER" || paymentMethod === "ACH_ROUTING" ? (
                      <div className="flex flex-col gap-2 pt-2">
                        <label className="text-xs font-bold uppercase text-slate-600">
                          {paymentMethod === "ACH_ROUTING"
                            ? "Routing & Account Number *"
                            : paymentMethod === "SEPA"
                            ? "IBAN & BIC / SWIFT Code *"
                            : paymentMethod === "WIRE_TRANSFER"
                            ? "Wire Transfer Account / SWIFT *"
                            : "Bank Transfer IBAN / Account Number *"}
                        </label>
                        <input
                          type="text"
                          required
                          disabled={otpDispatched || otpVerified}
                          placeholder={
                            paymentMethod === "ACH_ROUTING"
                              ? "e.g. Routing: 123456789 | Account: 987654321"
                              : paymentMethod === "SEPA"
                              ? "e.g. DE89 3704 0044 0532 0130 00"
                              : paymentMethod === "WIRE_TRANSFER"
                              ? "e.g. SWIFT: BOFAUS3N | Account: 12345678"
                              : jur.countryCode === "PK"
                              ? "PK36 MEZN 0000 1234 5678 9012"
                              : jur.countryCode === "GB"
                              ? "GB29 NWBK 6016 1331 9268 19"
                              : "Enter your IBAN or Account details"
                          }
                          className="px-4 py-3 text-sm font-medium rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black bg-slate-50/50 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                          value={bankAccountIban}
                          onChange={(e) => setBankAccountIban(e.target.value)}
                        />
                      </div>
                    ) : paymentMethod === "PAYPAL" ? (
                      <div className="flex flex-col gap-2 pt-2">
                        <label className="text-xs font-bold uppercase text-slate-600">PayPal Registered Email Address *</label>
                        <input
                          type="email"
                          required
                          disabled={otpDispatched || otpVerified}
                          placeholder="e.g. paypal@example.com"
                          className="px-4 py-3 text-sm font-medium rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black bg-slate-50/50 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                          value={bankAccountIban}
                          onChange={(e) => setBankAccountIban(e.target.value)}
                        />
                      </div>
                    ) : paymentMethod === "WISE" ? (
                      <div className="flex flex-col gap-2 pt-2">
                        <label className="text-xs font-bold uppercase text-slate-600">Wise Email or Handle *</label>
                        <input
                          type="text"
                          required
                          disabled={otpDispatched || otpVerified}
                          placeholder="e.g. name@domain.com or @handle"
                          className="px-4 py-3 text-sm font-medium rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black bg-slate-50/50 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                          value={bankAccountIban}
                          onChange={(e) => setBankAccountIban(e.target.value)}
                        />
                      </div>
                    ) : paymentMethod === "CREDIT_DEBIT_CARD" ? (
                      <div className="flex flex-col gap-2 pt-2">
                        <label className="text-xs font-bold uppercase text-slate-600">Card Reference / Last 4 Digits *</label>
                        <input
                          type="text"
                          required
                          disabled={otpDispatched || otpVerified}
                          placeholder="e.g. Card ending in 4321"
                          className="px-4 py-3 text-sm font-medium rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black bg-slate-50/50 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                          value={bankAccountIban}
                          onChange={(e) => setBankAccountIban(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 pt-2">
                        <label className="text-xs font-bold uppercase text-slate-600">
                          {paymentMethod === "JAZZCASH"
                            ? "JazzCash Mobile Account Number *"
                            : paymentMethod === "EASYPAISA"
                            ? "Easypaisa Mobile Account Number *"
                            : "Mobile Wallet Account Number *"}
                        </label>
                        <input
                          type="text"
                          required
                          disabled={otpDispatched || otpVerified}
                          placeholder={jur.phonePlaceholder}
                          className="px-4 py-3 text-sm font-medium rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black bg-slate-50/50 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                          value={mobileWalletNumber}
                          onChange={(e) => setMobileWalletNumber(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 1: DRAW DIGITAL SIGNATURE FIRST */}
                <div className="sm:col-span-2 p-6 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-col text-left space-y-1">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Step 1: Digital Signature</span>
                    <span className="text-xs text-slate-500">
                      {stagedSignatureB64
                        ? "Digital signature recorded! Now request OTP below to authorize & execute."
                        : isFormValid
                        ? "Complete all required fields above to enable Signature Pad."
                        : "Fill all required profile fields above to enable Signature Pad."}
                    </span>
                  </div>

                  {stagedSignatureB64 ? (
                    <div className="flex items-center gap-3">
                      <div className="bg-white border border-slate-200 rounded-xl p-2 flex items-center gap-2 shadow-sm">
                        <img src={stagedSignatureB64} alt="Signature Preview" className="h-9 max-w-[140px] object-contain" />
                        <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-lg uppercase">Drawn</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSignModalOpen(true)}
                        className="text-xs text-slate-600 hover:text-black font-bold underline uppercase"
                      >
                        Redraw
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsSignModalOpen(true)}
                      disabled={!isFormValid}
                      className={`font-bold px-7 py-3 rounded-xl text-xs uppercase transition-all whitespace-nowrap ${
                        isFormValid
                          ? "bg-black text-white hover:bg-slate-900 shadow-md cursor-pointer"
                          : "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed"
                      }`}
                    >
                      Draw Signature
                    </button>
                  )}
                </div>

                {/* STEP 2: EMAIL OTP IDENTITY AUTHORIZATION & FINAL EXECUTION SECOND */}
                <div className="sm:col-span-2 p-6 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col text-left space-y-1">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Step 2: Email OTP Identity Authorization</span>
                      <span className="text-xs text-slate-500">
                        {!isFormValid || !stagedSignatureB64
                          ? "OTP inactive until complete information and digital signature are done above."
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
                        className={`font-bold px-7 py-3 rounded-xl text-xs uppercase transition-all whitespace-nowrap ${
                          isFormValid && stagedSignatureB64 && !otpLoading
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer"
                            : "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed"
                        }`}
                      >
                        {otpLoading ? "Sending..." : "Send OTP"}
                      </button>
                    )}
                  </div>

                  {otpDispatched && (
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-200">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="6-digit OTP"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        className="w-full sm:w-auto bg-white border border-slate-300 focus:border-black text-center font-bold tracking-widest text-base py-2.5 px-4 rounded-xl outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyAndExecuteOTP}
                        disabled={otpLoading || otpCode.length !== 6 || signing}
                        className="w-full sm:w-auto bg-black hover:bg-slate-900 text-white font-bold px-8 py-3 rounded-xl text-xs uppercase shadow-md transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
                      >
                        {signing ? "Processing Signature..." : otpLoading ? "Verifying..." : "Verify OTP & Execute Contract"}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </form>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/60 bg-white/70 backdrop-blur-md py-6 flex flex-col md:flex-row items-center justify-between px-6 sm:px-12 gap-4 z-10 mt-12">
        <span className="text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} {company.name}. Powered by {jur.lawAbbreviation} legal security layer.
        </span>
        <div className="flex gap-4 items-center flex-wrap justify-center">
          <Link href="/features" target="_blank" className="text-xs text-slate-600 hover:text-black font-semibold transition-colors">
            Features
          </Link>
          <span className="text-slate-300">|</span>
          <Link href="/verify" target="_blank" className="text-xs text-slate-600 hover:text-black font-semibold transition-colors">
            Verify Document
          </Link>
          <span className="text-slate-300">|</span>
          <Link href="/terms" target="_blank" className="text-xs text-slate-600 hover:text-black font-semibold transition-colors">
            Terms &amp; Privacy
          </Link>
          <span className="text-slate-300">|</span>
          <a href={`mailto:${company.supportEmail}`} className="text-xs text-slate-500 hover:text-black font-semibold transition-colors">
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
