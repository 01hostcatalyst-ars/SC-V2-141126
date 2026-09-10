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
import { SuiteHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  ShieldCheck,
  CheckCircle2,
  Download,
  AlertCircle,
  FileText,
  Check,
  RotateCcw,
  Lock,
  PenLine,
  ArrowRight,
  Clock,
  Layers,
  DollarSign,
  ExternalLink,
  QrCode,
  Info,
  Sparkles,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  Scale,
  Share2,
} from "lucide-react";

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
      } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
      showToast("Error processing signature transaction.", "error");
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-gradient text-zinc-700 font-medium text-sm">
        <div className="flex items-center gap-3 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm surface-elevated">
          <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
          <span>Retrieving campaign agreement details...</span>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-gradient text-rose-600 font-medium text-sm p-4">
        <div className="bg-white p-8 rounded-2xl border border-rose-200 shadow-sm text-center space-y-3 max-w-md surface-elevated">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <div className="text-base font-semibold text-zinc-900">Agreement Unavailable</div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            This agreement link may have expired or is no longer accessible. Please contact the initiator for an updated link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col justify-between font-sans antialiased text-left relative overflow-hidden selection:bg-zinc-950 selection:text-white">
      {/* Directional Ambient Spotlight matching Home Page & Instant Studio */}
      <div className="absolute top-0 inset-x-0 h-[480px] ambient-spotlight-emerald pointer-events-none z-0" />

      {/* Universal Suite Header */}
      <SuiteHeader
        activeRoute="/c"
        rightBadge={
          <span className="font-mono text-xs font-semibold text-zinc-700 bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-full uppercase">
            Ref: {contract.contractNumber}
          </span>
        }
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6 z-10">
        
        {/* Banner Welcome */}
        {isExecuted ? (
          <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-3xl p-6 sm:p-8 shadow-xs surface-card space-y-6 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white uppercase tracking-wider w-fit shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Bilaterally Executed &amp; Activated</span>
                </span>

                <h1 className="text-2xl sm:text-3xl font-semibold text-emerald-950 tracking-tight font-display">
                  Campaign Agreement Executed &amp; Locked
                </h1>

                <p className="text-xs sm:text-sm text-emerald-900/90 leading-relaxed max-w-xl font-normal">
                  This agreement was executed under {jur.lawAbbreviation} on {formatLegalDate(contract.activatedAt || contract.updatedAt, contract?.jurisdictionCountryCode)}. The deal terms below are read-only and cryptographically locked.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="px-5 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-semibold text-xs uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadingPdf ? "Generating PDF..." : "Download Contract PDF"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCertificate}
                  disabled={downloadingCert}
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{downloadingCert ? "Generating Certificate..." : "Audit Certificate"}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-900 uppercase tracking-wider w-fit">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Mutual Legal Agreement Execution ({jur.lawAbbreviation})</span>
            </span>

            <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight font-display">
              Review &amp; Sign Collaboration Agreement
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-2xl font-normal">
              Agreement requested by <strong className="text-zinc-950 font-semibold">{(contract as any).parties?.find((p: any) => p.partyType === "INITIATOR")?.companyName || (contract as any).parties?.find((p: any) => p.partyType === "INITIATOR")?.name || (contract as any).initiatorCompanyName || contract.initiator?.name}</strong> ({(contract as any).parties?.find((p: any) => p.partyType === "INITIATOR")?.email || contract.initiator?.email}). Complete the verification below, review all campaign terms, and execute your digital signature.
            </p>
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          
          {/* SECTION 1: REVIEW CAMPAIGN TERMS */}
          <div className="space-y-5">
            
            {/* Header Section Title */}
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-7 shadow-xs surface-card text-left">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 block">
                Verification Review
              </span>
              <h2 className="text-base sm:text-lg font-semibold text-zinc-800 tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-600" />
                <span>1. Campaign &amp; Legal Terms</span>
              </h2>
              <p className="text-xs text-zinc-500 font-normal mt-1 leading-relaxed">
                Please review all campaign parameters below. If terms match your negotiated values, complete your profile details and execute your digital signature in Section 2 below.
              </p>
            </div>

            {/* CARD A: Campaign & Parties Overview */}
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-7 shadow-xs surface-card space-y-4 text-left">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 block">
                Campaign &amp; Parties Overview
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-zinc-500 block">Direction</span>
                  <span className="font-semibold text-zinc-900 uppercase text-sm block">{contract.contractType.replace(/_/g, " ")}</span>
                </div>

                {contract.brandName && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-zinc-500 block">Client Brand</span>
                    <span className="font-semibold text-zinc-900 text-sm block">{contract.brandName} {contract.brandHandle ? `(${contract.brandHandle})` : ""}</span>
                    {contract.campaignName && <span className="text-xs text-zinc-500 block">Campaign: {contract.campaignName}</span>}
                  </div>
                )}

                {contract.creatorName && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-zinc-500 block">Creator</span>
                    <span className="font-semibold text-zinc-900 text-sm block">{contract.creatorName} {contract.creatorHandle ? `(${contract.creatorHandle})` : ""}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CARD B: Financial Compensation & Payout Terms */}
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-7 shadow-xs surface-card space-y-4 text-left">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 block">
                Financial Compensation &amp; Payout Terms
              </span>
              
              <div className="space-y-2.5">
                {/* Row 1: Total Valuation */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-medium text-zinc-600">Total Valuation</span>
                  <span className="text-base font-semibold font-mono text-zinc-900">{formatCurrencyAmount(contract.totalAmount, currCode)}</span>
                </div>

                {/* Row 2: Advance Payment */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-medium text-zinc-600 block">Advance Deposit</span>
                    {contract.advancePaymentDate && (
                      <span className="text-xs text-zinc-500 block">Due: {formatLegalDate(contract.advancePaymentDate, contract?.jurisdictionCountryCode)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold font-mono text-zinc-900">
                      {contract.advancePayment ? formatCurrencyAmount(contract.advancePayment, currCode) : "No Advance"}
                    </span>
                    {contract.advancePayment && (
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
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
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-medium text-zinc-600 block">Remaining Settlement</span>
                    {contract.remainingPaymentDate && (
                      <span className="text-xs text-zinc-500 block">Due: {formatLegalDate(contract.remainingPaymentDate, contract?.jurisdictionCountryCode)}</span>
                    )}
                  </div>
                  <span className="text-sm font-semibold font-mono text-zinc-900">{formatCurrencyAmount(contract.remainingAmount || 0, currCode)}</span>
                </div>

                {/* Row 4: Route Method & Account */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-medium text-zinc-600">Payment Channel</span>
                  <div className="text-left sm:text-right">
                    <span className="text-sm font-semibold text-zinc-900 uppercase block">{contract.paymentMethod ? contract.paymentMethod.replace(/_/g, " ") : "Not Specified"}</span>
                    <span className="text-xs font-mono text-zinc-600 block">{contract.paymentMethod === "BANK_IBAN" ? contract.bankAccountIban : contract.mobileWalletNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD C: Campaign Deliverables, Platforms & Usage Scope */}
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-7 shadow-xs surface-card space-y-5 text-left">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 block">
                Deliverables &amp; Licensing Scope
              </span>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Asset Format</th>
                      <th className="py-2.5 px-3 text-center">Quantity</th>
                      <th className="py-2.5 px-3 text-center">Stay Published</th>
                      <th className="py-2.5 px-3">Production Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {contract.deliverables?.map((d: any) => (
                      <tr key={d.id} className="text-zinc-900">
                        <td className="py-3 px-3 font-semibold text-xs sm:text-sm">{formatDeliverableTypeName(d.type)}</td>
                        <td className="py-3 px-3 font-mono font-semibold text-center text-xs sm:text-sm">{d.quantity}</td>
                        <td className="py-3 px-3 text-zinc-600 font-medium text-center">{d.duration || "Permanent"}</td>
                        <td className="py-3 px-3 text-zinc-600 max-w-xs">{d.notes || "Standard specifications"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2.5 pt-1">
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-medium text-zinc-600">Platforms Permitted</span>
                  <div className="flex flex-wrap gap-1.5">
                    {contract.platformsAllowed?.map((p: string) => (
                      <span key={p} className="px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-xs font-semibold">{p}</span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-medium text-zinc-600">Commercial Scope</span>
                  <span className="text-xs sm:text-sm font-semibold text-zinc-900">{formatUsageLicenseText(contract.usageType)}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-medium text-zinc-600">License Duration</span>
                  <span className="text-xs sm:text-sm font-semibold text-zinc-900">{contract.usageRightsDuration}</span>
                </div>
              </div>
            </div>

            {/* CARD D: Delivery Timeline & Pre-Approval Protocol */}
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-7 shadow-xs surface-card space-y-4 text-left">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 block">
                Production Timelines &amp; Review Conditions
              </span>
              
              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-medium text-zinc-600">Delivery Deadline</span>
                  <span className="font-semibold text-zinc-900 text-xs sm:text-sm">{contract.deliveryTimeframeDays} Days (post product/advance)</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-medium text-zinc-600">Revision Rounds</span>
                  <span className="font-semibold text-zinc-900 text-xs sm:text-sm">{contract.revisionRounds} Rounds ({contract.revisionTurnaroundDays || 5} days/round)</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-medium text-zinc-600">Pre-Approval Protocol</span>
                  <span className="font-semibold text-zinc-900 text-xs sm:text-sm">{contract.brandApprovalRequired ? "Required (48-hr Deemed Approval)" : "Not Required"}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-medium text-zinc-600">Category Exclusivity</span>
                  <span className="font-semibold text-zinc-900 text-xs sm:text-sm">{contract.exclusivityClause ? `Active (${contract.exclusivityDuration || "Yes"})` : "None"}</span>
                </div>

                {contract.exclusivityClause && contract.exclusivityCompetitors && (
                  <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-medium text-zinc-600">Excluded Competitors</span>
                    <span className="font-semibold text-zinc-900 text-xs sm:text-sm">{contract.exclusivityCompetitors}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CARD E: Confidentiality / Pre-Launch NDA (if required) */}
            {contract.confidentialityRequired && (
              <div className="bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-7 shadow-xs surface-card space-y-4 text-left">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 block">
                  Confidentiality &amp; NDA
                </span>
                
                <div className="space-y-2.5 text-xs">
                  <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-medium text-zinc-600">NDA Embargo Status</span>
                    <span className="font-semibold text-zinc-900">Strict Embargo Active</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-medium text-zinc-600">Embargo Launch Date</span>
                    <span className="font-semibold text-zinc-900">{contract.embargoDate ? formatLegalDate(contract.embargoDate, contract?.jurisdictionCountryCode) : "Required until official launch"}</span>
                  </div>

                  {contract.earlyDisclosurePenalty && (
                    <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-medium text-zinc-600">Early Leak Penalty</span>
                      <span className="font-semibold font-mono text-rose-600 text-xs sm:text-sm">{formatCurrencyAmount(contract.earlyDisclosurePenalty, currCode)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CARD F: Collaboration Product Shipment & Return Terms (if present) */}
            {contract.collabProduct && (
              <div className="bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-7 shadow-xs surface-card space-y-4 text-left">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 block">
                  Product Logistics &amp; Provisioning
                </span>
                
                <div className="space-y-2.5 text-xs">
                  <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-medium text-zinc-600">Product Details</span>
                    <span className="font-semibold text-zinc-900 text-xs sm:text-sm">{contract.collabProduct} ({contract.collabProductProvisionType})</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-medium text-zinc-600">Expected Arrival Date</span>
                    <span className="font-semibold text-zinc-900 text-xs sm:text-sm">{contract.collabDeliveryDate ? formatLegalDate(contract.collabDeliveryDate, contract?.jurisdictionCountryCode) : "Not Specified"}</span>
                  </div>

                  {contract.collabDeliveryAddress && (
                    <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                      <span className="font-medium text-zinc-600 block">Delivery Address</span>
                      <span className="font-semibold text-zinc-900 text-xs sm:text-sm block">{contract.collabDeliveryAddress}</span>
                    </div>
                  )}

                  {contract.collabProductProvisionType === "Product Loan" && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1.5 leading-relaxed">
                      <div>Product Loan Return Window: Within <strong className="font-semibold">{contract.collabProductReturnDays || 7} days</strong> post-deliverable.</div>
                      <div>Return Shipping Paid By: <strong className="font-semibold">{contract.collabProductReturnShippingBy || "Brand"}</strong></div>
                      {contract.collabProductNonReturnFee && <div>Loss / Non-Return Fee: <strong className="font-semibold font-mono">{formatCurrencyAmount(contract.collabProductNonReturnFee, currCode)}</strong></div>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CARD G: Bilateral Safeguard Penalties */}
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-7 shadow-xs surface-card space-y-4 text-left">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 block">
                Bilateral Safeguard Penalties &amp; Caps
              </span>
              
              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-medium text-zinc-600">Late Payment / Delivery</span>
                  <span className="font-semibold font-mono text-zinc-900 text-xs sm:text-sm">{Number(contract.latePaymentPenaltyPct)}% / {Number(contract.lateContentPenaltyPct)}% per day (Capped at {Number(contract.penaltyCapPct || 20)}%)</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-medium text-zinc-600">Unauthorized Brand Ad Usage</span>
                  <span className="font-semibold font-mono text-zinc-900 text-xs sm:text-sm">{Number(contract.unauthorizedUsagePenaltyPct || 50)}% of fee</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-medium text-zinc-600">Non-Delivery Advance Refund</span>
                  <span className="font-semibold text-zinc-900 text-xs sm:text-sm">{contract.advanceRefundable !== false ? `Yes (within ${contract.advanceRefundTimeframeDays || 7} days)` : "No"}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-medium text-zinc-600">Non-Delivery Termination Cutoff</span>
                  <span className="font-semibold text-zinc-900 text-xs sm:text-sm">{contract.nonDeliveryCutoffDays || 7} Days post-deadline</span>
                </div>
              </div>
            </div>

            {/* CARD H: Dispute Resolution Clause */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-3xl p-5 sm:p-7 space-y-1.5 text-xs text-blue-950 text-left">
              <span className="font-semibold uppercase tracking-wider block text-blue-900 text-xs">
                Governing Law &amp; Dispute Resolution
              </span>
              <p className="leading-relaxed">
                {jur.disputeClause} Legal recourse and dispute determination shall be administered under the <strong className="font-semibold">{jur.arbitrationAct}</strong>.
              </p>
            </div>

          </div>

          {/* SECTION 2: VERIFICATION & DIGITAL SIGNATURE EXECUTION / PDF DOWNLOAD CENTER */}
          {isExecuted ? (
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-7 shadow-xs surface-card space-y-6 text-left">
              <div className="border-b border-zinc-100 pb-3">
                <h2 className="text-base sm:text-lg font-semibold text-zinc-800 tracking-tight flex items-center gap-2">
                  <Download className="w-4 h-4 text-zinc-600" />
                  <span>2. Bilateral Execution &amp; PDF Download Center</span>
                </h2>
                <p className="text-xs text-zinc-500 font-normal mt-1">
                  This agreement is fully signed and active. Below are your persistent legal PDF transaction documents.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50/70 space-y-3">
                  <div className="font-semibold text-zinc-900 text-sm">Bilateral Executed Contract PDF</div>
                  <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                    Contains the full A4 legal agreement with all standardized clauses, dual electronic signatures, and payout routing.
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                    className="w-full py-3 rounded-xl bg-zinc-950 text-white font-semibold text-xs uppercase hover:bg-zinc-900 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
                  >
                    <Download className="w-4 h-4" />
                    <span>{downloadingPdf ? "Retrieving PDF..." : "Download Contract PDF"}</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-3">
                  <div className="font-semibold text-blue-950 text-sm">Cryptographic Audit Certificate PDF</div>
                  <p className="text-xs text-blue-900/80 leading-relaxed font-normal">
                    Contains verification QR code, SHA-256 document checksums, IP audit logs, and hardware device fingerprints.
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadCertificate}
                    disabled={downloadingCert}
                    className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-xs uppercase hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{downloadingCert ? "Retrieving Certificate..." : "Download Audit Certificate"}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-7 shadow-xs surface-card space-y-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-3 gap-2">
                <div>
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 block">
                    Party 2 Execution
                  </span>
                  <h2 className="text-base sm:text-lg font-semibold text-zinc-800 tracking-tight flex items-center gap-2">
                    <PenLine className="w-4 h-4 text-zinc-600" />
                    <span>2. Counterparty Identity Intake &amp; Digital Signature</span>
                  </h2>
                  <p className="text-xs text-zinc-500 font-normal mt-1">
                    Complete your profile details, verify your email identity via OTP, and execute your digital signature.
                  </p>
                </div>
                {otpVerified && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider w-fit">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Identity Verified</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Your Email Address * */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-700">
                    Your Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={respondentEmail}
                    onChange={(e) => setRespondentEmail(e.target.value)}
                    disabled={otpDispatched || otpVerified}
                    className="input-field disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed"
                  />
                </div>

                {/* 2. Your Phone Number * */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-700">
                    Your Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={`e.g. ${jur.phonePlaceholder}`}
                    value={respondentPhone}
                    onChange={(e) => setRespondentPhone(e.target.value)}
                    disabled={otpDispatched || otpVerified}
                    className="input-field font-mono disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed"
                  />
                </div>

                {/* 3. Signing Capacity & Creator Identification (If Creator Counterparty) */}
                {isRespondentCreator && (
                  <div className="sm:col-span-2">
                    <ModernSelect
                      label="Signing Capacity *"
                      value={respondentCapacity}
                      disabled={otpDispatched || otpVerified}
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
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-700">
                    {respondentCapacity === "CREATOR_MANAGER" ? "Signer / Manager Name" : "Signer's Full Legal Name"} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={respondentCapacity === "CREATOR_MANAGER" ? "e.g. John Smith" : "e.g. Sarah Khan"}
                    value={respondentName}
                    onChange={(e) => setRespondentName(e.target.value)}
                    disabled={otpDispatched || otpVerified}
                    className="input-field disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed"
                  />
                </div>

                {/* 4. Brand / Company Name OR Creator Handle Checkbox Confirmation */}
                {isRespondentBrand ? (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-zinc-700">
                      Brand / Company Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sapphire Retail Ltd."
                      value={respondentCompany}
                      onChange={(e) => setRespondentCompany(e.target.value)}
                      disabled={otpDispatched || otpVerified}
                      className="input-field disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed"
                    />
                  </div>
                ) : isRespondentAgency ? (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-zinc-700">
                      Agency Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Creative Hub Agency"
                      value={respondentCompany}
                      onChange={(e) => setRespondentCompany(e.target.value)}
                      disabled={otpDispatched || otpVerified}
                      className="input-field disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed"
                    />
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-2xl sm:col-span-2">
                    <input
                      type="checkbox"
                      id="confirmHandle"
                      checked={confirmHandleChecked}
                      onChange={(e) => setConfirmHandleChecked(e.target.checked)}
                      disabled={otpDispatched || otpVerified}
                      className="mt-0.5 h-4 w-4 rounded accent-zinc-950 cursor-pointer"
                    />
                    <label htmlFor="confirmHandle" className="text-xs text-zinc-700 font-medium cursor-pointer leading-relaxed">
                      <strong className="text-zinc-950 font-semibold">Confirm Creator Handle:</strong> I confirm that I am the creator or authorized representative for Instagram account <span className="font-semibold font-mono text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{contract?.creatorHandle || "N/A"}</span>. <span className="text-rose-500">*</span>
                    </label>
                  </div>
                )}

                {/* 4b. Conditional Creator Legal Name (if Manager signing) */}
                {isRespondentCreator && respondentCapacity === "CREATOR_MANAGER" && (
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-zinc-700">
                      Creator Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Khan"
                      value={creatorLegalName}
                      onChange={(e) => setCreatorLegalName(e.target.value)}
                      disabled={otpDispatched || otpVerified}
                      className="input-field disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed"
                    />
                  </div>
                )}

                {/* 5. Address * */}
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-700">
                    {isRespondentAgency ? "Agency Office Address" : isRespondentBrand ? "Brand / Company Registered Address" : "Residential / Contact Address"} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Official registered address, City"
                    value={respondentAddress}
                    onChange={(e) => setRespondentAddress(e.target.value)}
                    disabled={otpDispatched || otpVerified}
                    className="input-field disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed"
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

                <div className="flex flex-col gap-1">
                  {(isRespondentBrand || isRespondentAgency) ? (
                    <>
                      <label className="text-xs font-semibold text-zinc-700">
                        {jur.taxIdLabel} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={`e.g. Enter your ${jur.taxIdLabel}`}
                        value={respondentNtn}
                        onChange={(e) => setRespondentNtn(e.target.value)}
                        disabled={otpDispatched || otpVerified}
                        className="input-field font-mono disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed"
                      />
                    </>
                  ) : (
                    <>
                      <label className="text-xs font-semibold text-zinc-700">
                        {jur.nationalIdLabel} {!jur.nationalIdLabel.toLowerCase().includes("optional") && <span className="text-rose-500">*</span>}
                      </label>
                      <input
                        type="text"
                        required={!jur.nationalIdLabel.toLowerCase().includes("optional")}
                        placeholder={`e.g. Enter your ${jur.nationalIdLabel.replace(" (Optional)", "")}`}
                        value={respondentCnic}
                        onChange={(e) => setRespondentCnic(e.target.value)}
                        disabled={otpDispatched || otpVerified}
                        className="input-field font-mono disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed"
                      />
                    </>
                  )}
                </div>

                {/* Payout Account Route Selection for Counterparty Payee (Creator / Agency) */}
                {isRespondentPayee && (
                  <div className="sm:col-span-2 border-t border-zinc-100 pt-5 mt-1 space-y-3">
                    <span className="text-xs font-semibold text-zinc-800 uppercase tracking-wide block">
                      {isRespondentAgency ? "Agency Payout Account Details" : "Your Payout Account Details"} (Required for Campaign Payouts) <span className="text-rose-500">*</span>
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                            className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              paymentMethod === m
                                ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                                : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400"
                            }`}
                          >
                            {labelMap[m] || m.replace(/_/g, " ")}
                          </button>
                        );
                      })}
                    </div>

                    {paymentMethod === "BANK_IBAN" || paymentMethod === "SEPA" || paymentMethod === "WIRE_TRANSFER" || paymentMethod === "ACH_ROUTING" ? (
                      <div className="flex flex-col gap-1 pt-1">
                        <label className="text-xs font-semibold text-zinc-700">
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
                          className="input-field font-mono disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed"
                          value={bankAccountIban}
                          onChange={(e) => setBankAccountIban(e.target.value)}
                        />
                      </div>
                    ) : paymentMethod === "PAYPAL" ? (
                      <div className="flex flex-col gap-1 pt-1">
                        <label className="text-xs font-semibold text-zinc-700">PayPal Registered Email Address *</label>
                        <input
                          type="email"
                          required
                          disabled={otpDispatched || otpVerified}
                          placeholder="e.g. paypal@example.com"
                          className="input-field font-mono disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed"
                          value={bankAccountIban}
                          onChange={(e) => setBankAccountIban(e.target.value)}
                        />
                      </div>
                    ) : paymentMethod === "WISE" ? (
                      <div className="flex flex-col gap-1 pt-1">
                        <label className="text-xs font-semibold text-zinc-700">Wise Email or Handle *</label>
                        <input
                          type="text"
                          required
                          disabled={otpDispatched || otpVerified}
                          placeholder="e.g. name@domain.com or @handle"
                          className="input-field font-mono disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed"
                          value={bankAccountIban}
                          onChange={(e) => setBankAccountIban(e.target.value)}
                        />
                      </div>
                    ) : paymentMethod === "CREDIT_DEBIT_CARD" ? (
                      <div className="flex flex-col gap-1 pt-1">
                        <label className="text-xs font-semibold text-zinc-700">Card Reference / Last 4 Digits *</label>
                        <input
                          type="text"
                          required
                          disabled={otpDispatched || otpVerified}
                          placeholder="e.g. Card ending in 4321"
                          className="input-field font-mono disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed"
                          value={bankAccountIban}
                          onChange={(e) => setBankAccountIban(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 pt-1">
                        <label className="text-xs font-semibold text-zinc-700">
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
                          className="input-field font-mono disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed"
                          value={mobileWalletNumber}
                          onChange={(e) => setMobileWalletNumber(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 1: DRAW DIGITAL SIGNATURE FIRST */}
                <div className="sm:col-span-2 p-5 rounded-2xl border border-zinc-200 bg-zinc-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-col text-left space-y-1">
                    <span className="text-xs font-semibold text-zinc-800 uppercase tracking-wide">
                      Step 1: Digital Signature
                    </span>
                    <span className="text-xs text-zinc-500 font-normal">
                      {stagedSignatureB64
                        ? "Digital signature recorded! Now request OTP below to authorize & execute."
                        : isFormValid
                        ? "Complete all required fields above to enable Signature Pad."
                        : "Fill all required profile fields above to enable Signature Pad."}
                    </span>
                  </div>

                  {stagedSignatureB64 ? (
                    <div className="flex items-center gap-3">
                      <div className="bg-white border border-zinc-200 rounded-xl p-2 flex items-center gap-2 shadow-2xs">
                        <img src={stagedSignatureB64} alt="Signature Preview" className="h-9 max-w-[140px] object-contain" />
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md uppercase">Drawn</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSignModalOpen(true)}
                        className="text-xs text-blue-700 hover:text-blue-900 font-semibold underline cursor-pointer"
                      >
                        Redraw
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsSignModalOpen(true)}
                      disabled={!isFormValid}
                      className={`font-semibold px-6 py-2.5 rounded-xl text-xs uppercase transition-all whitespace-nowrap min-h-[40px] ${
                        isFormValid
                          ? "bg-zinc-950 text-white hover:bg-zinc-900 shadow-sm cursor-pointer"
                          : "bg-zinc-200 text-zinc-400 border border-zinc-300 cursor-not-allowed"
                      }`}
                    >
                      Draw Signature
                    </button>
                  )}
                </div>

                {/* STEP 2: EMAIL OTP IDENTITY AUTHORIZATION & FINAL EXECUTION */}
                <div className="sm:col-span-2 p-5 rounded-2xl border border-zinc-200 bg-zinc-50/70 flex flex-col space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col text-left space-y-1">
                      <span className="text-xs font-semibold text-zinc-800 uppercase tracking-wide">
                        Step 2: Email OTP Identity Authorization
                      </span>
                      <span className="text-xs text-zinc-500 font-normal">
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
                        className={`font-semibold px-6 py-2.5 rounded-xl text-xs uppercase transition-all whitespace-nowrap min-h-[40px] ${
                          isFormValid && stagedSignatureB64 && !otpLoading
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer"
                            : "bg-zinc-200 text-zinc-400 border border-zinc-300 cursor-not-allowed"
                        }`}
                      >
                        {otpLoading ? "Sending..." : "Send OTP"}
                      </button>
                    )}
                  </div>

                  {otpDispatched && (
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-zinc-200">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        className="w-full sm:w-36 px-3 py-2 bg-white border-2 border-emerald-500 rounded-xl text-center font-mono font-semibold tracking-[0.2em] text-base text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-600 placeholder:text-zinc-300 min-h-[44px]"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyAndExecuteOTP}
                        disabled={otpLoading || otpCode.length !== 6 || signing}
                        className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-900 text-white font-semibold px-7 py-2.5 rounded-xl text-xs uppercase shadow-sm transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 min-h-[44px]"
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

      {/* Modern Public Footer */}
      <PublicFooter />

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
