"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  ShieldCheck,
  Zap,
  ArrowRight,
  AlertCircle,
  Clock,
  Scale,
  Sparkles,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { SuiteHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { InstantWizardNav } from "@/components/instant/InstantWizardNav";
import { Step1Relationship } from "@/components/instant/Step1Relationship";
import { Step2Deliverables } from "@/components/instant/Step2Deliverables";
import { Step3UsageRights } from "@/components/instant/Step3UsageRights";
import { Step4Financials } from "@/components/instant/Step4Financials";
import { Step5Identity } from "@/components/instant/Step5Identity";
import { Step6SignOtp } from "@/components/instant/Step6SignOtp";
import { ContractLivePreview } from "@/components/instant/ContractLivePreview";
import { InstantSuccessModal } from "@/components/instant/InstantSuccessModal";
import {
  InstantContractFormState,
  CreatedContractResult,
} from "@/components/instant/types";

const INITIAL_FORM_STATE: InstantContractFormState = {
  // Step 1: Relationship & Law
  contractType: "CREATOR_TO_BRAND",
  jurisdictionCountryCode: "US",
  currency: "USD",
  brandName: "",
  brandHandle: "",
  campaignName: "",
  creatorName: "",
  creatorHandle: "",

  // Step 2: Deliverables & Scope
  deliverables: [
    {
      type: "REEL",
      quantity: 1,
      duration: "2 Months",
      notes: "4K 60fps video with product unboxing in first 5s",
    },
  ],
  deliveryTimeframeDays: 7,
  taggingRequirements:
    "Tag @brand_official in caption & first 3s. Include #ad #collab",
  contentOwnership: "Brand License (1 Year Digital & Social Usage)",

  // Step 3: Usage Rights & Distribution
  platforms: ["INSTAGRAM", "TIKTOK"],
  usageType: "ORGANIC_ONLY",
  paidBoostingDuration: "30 Days",
  deemedApproval48h: true,
  revisionLimit: 2,
  revisionRounds: 1,
  revisionTurnaroundDays: 5,
  brandApprovalRequired: true,

  // Step 4: Financials & Protection
  totalAmount: "1500",
  advancePercent: 50,
  taxTreatment: "INCLUSIVE",
  taxRatePct: 0,
  paymentMethod: "BANK_IBAN",
  bankAccountIban: "",
  mobileWalletNumber: "",
  swiftBic: "",
  achRouting: "",
  paypalEmail: "",
  wiseTag: "",
  latePaymentPenaltyPct: 3,
  lateContentPenaltyPct: 3,
  penaltyCapPct: 20,
  unauthorizedUsagePenaltyPct: 50,
  advanceRefundable: true,
  advanceRefundTimeframeDays: 7,
  nonDeliveryCutoffDays: 7,
  cancellationFeePct: 25,
  collabProductProvisionType: "None",
  collabProductNonReturnFee: "",
  exclusivityClause: false,
  exclusivityDuration: "30 Days",
  exclusivityCompetitors: "",
  confidentialityRequired: false,
  embargoDate: "",
  earlyDisclosurePenalty: "",

  // Step 5: Party A (Initiator) Identity
  initiatorName: "",
  initiatorEmail: "",
  initiatorPhone: "",
  initiatorCompany: "",
  initiatorDesignation: "Lead Content Creator",
  initiatorAddress: "",
  initiatorTaxId: "",
  initiatorNationalId: "",
  creatorRepresentationCapacity: "CREATOR_SELF",
  creatorLegalName: "",
  confirmHandleOwnership: true,

  // Step 6: Signature & OTP
  initiatorSignatureB64: "",
  initiatorFingerprint: "",
  initiatorOtpCode: "",
  initiatorOtpDispatched: false,
  initiatorOtpVerified: false,
};

function InstantStudioContent() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [form, setForm] = useState<InstantContractFormState>(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [createdResult, setCreatedResult] = useState<CreatedContractResult | null>(
    null
  );
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  // Email quota rate limit check state
  const [emailLimitChecking, setEmailLimitChecking] = useState(false);
  const [emailLimitReached, setEmailLimitReached] = useState(false);
  const [emailLimitMessage, setEmailLimitMessage] = useState("");

  // Update form state helper
  const handleFormChange = (updates: Partial<InstantContractFormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
    if (errorMsg) setErrorMsg("");
  };

  // Pre-fill deal flow from query parameters if present
  useEffect(() => {
    const workflow = searchParams.get("workflow");
    if (workflow) {
      setForm((prev) => ({ ...prev, contractType: workflow }));
    }
  }, [searchParams]);

  // Live check DB for 24h guest quota when email changes
  useEffect(() => {
    if (
      !form.initiatorEmail ||
      !form.initiatorEmail.includes("@") ||
      !form.initiatorEmail.includes(".")
    ) {
      setEmailLimitReached(false);
      setEmailLimitMessage("");
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setEmailLimitChecking(true);
        const res = await fetch(
          `/api/guest/check-limit?email=${encodeURIComponent(
            form.initiatorEmail.trim().toLowerCase()
          )}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.limitReached) {
            setEmailLimitReached(true);
            setEmailLimitMessage(
              "Guest limit reached (2 contracts per 24h for this email). Please sign in or use another email to continue."
            );
          } else {
            setEmailLimitReached(false);
            setEmailLimitMessage("");
          }
        }
      } catch (err) {
        console.error("Failed to check email limit", err);
      } finally {
        setEmailLimitChecking(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [form.initiatorEmail]);

  // Step Validation logic
  const handleValidateAndNext = () => {
    setErrorMsg("");

    if (currentStep === 1) {
      if (!form.contractType || !form.jurisdictionCountryCode) {
        setErrorMsg("Please select a commercial deal flow and governing jurisdiction.");
        return;
      }
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (currentStep === 2) {
      if (!form.deliverables || form.deliverables.length === 0) {
        setErrorMsg("Please include at least one campaign deliverable item.");
        return;
      }
      for (const item of form.deliverables) {
        if (!item.type || item.quantity <= 0) {
          setErrorMsg("Each deliverable must specify a valid format and quantity greater than 0.");
          return;
        }
      }
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (currentStep === 3) {
      if (!form.platforms || form.platforms.length === 0) {
        setErrorMsg("Please select at least one authorized social media platform.");
        return;
      }
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (currentStep === 4) {
      const amount = parseFloat(form.totalAmount);
      if (isNaN(amount) || amount <= 0) {
        setErrorMsg("Please provide a valid total campaign compensation amount.");
        return;
      }
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (currentStep === 5) {
      if (!form.initiatorName.trim()) {
        setErrorMsg("Please provide your full legal name.");
        return;
      }
      if (
        !form.initiatorEmail.trim() ||
        !form.initiatorEmail.includes("@") ||
        !form.initiatorEmail.includes(".")
      ) {
        setErrorMsg("Please enter a valid work email address.");
        return;
      }
      if (emailLimitReached) {
        setErrorMsg(emailLimitMessage || "Daily guest contract limit reached for this email.");
        return;
      }
      setCurrentStep(6);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
  };

  const handleBack = () => {
    setErrorMsg("");
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Final Submission to /api/guest/contracts
  const handleSubmitContract = async () => {
    if (!form.initiatorSignatureB64) {
      setErrorMsg("Please draw and capture your electronic signature first.");
      return;
    }
    if (!form.initiatorOtpVerified) {
      setErrorMsg("Please dispatch and verify the 6-digit OTP code sent to your email.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const isInitiatorPayee =
        form.contractType.startsWith("CREATOR_") ||
        form.contractType === "AGENCY_TO_BRAND";

      const totalVal = parseFloat(form.totalAmount) || 0;
      const advanceVal = Math.round((totalVal * form.advancePercent) / 100);

      const payload = {
        contractType: form.contractType,
        jurisdictionCountryCode: form.jurisdictionCountryCode,
        currency: form.currency,
        taxTreatment: form.taxTreatment,
        taxRatePct: form.taxRatePct || 0,
        initiatorName: form.initiatorName.trim(),
        initiatorEmail: form.initiatorEmail.trim().toLowerCase(),
        initiatorPhone: form.initiatorPhone.trim(),
        initiatorRole: form.contractType.startsWith("CREATOR_")
          ? "CREATOR"
          : form.contractType.startsWith("BRAND_")
          ? "BRAND"
          : "AGENCY",
        initiatorDesignation: form.initiatorDesignation.trim(),
        initiatorNtn: form.initiatorTaxId || undefined,
        initiatorCnic: form.initiatorNationalId || undefined,
        initiatorTaxId: form.initiatorTaxId || undefined,
        initiatorNationalId: form.initiatorNationalId || undefined,
        initiatorCompanyName: form.initiatorCompany.trim() || undefined,
        initiatorCompanyAddress: form.initiatorAddress.trim() || undefined,
        brandName: form.brandName || undefined,
        brandHandle: form.brandHandle || undefined,
        campaignName: form.campaignName || undefined,
        creatorName:
          form.creatorName ||
          (form.creatorRepresentationCapacity === "TALENT_MANAGER"
            ? form.creatorLegalName
            : form.initiatorName),
        creatorHandle: form.creatorHandle || undefined,
        totalAmount: totalVal,
        advancePayment: advanceVal,
        advancePaymentDate: form.advancePaymentDate || undefined,
        remainingPaymentDate: form.remainingPaymentDate || undefined,
        paymentMethod: isInitiatorPayee ? form.paymentMethod : undefined,
        bankAccountIban:
          isInitiatorPayee && form.paymentMethod === "BANK_IBAN"
            ? form.bankAccountIban
            : undefined,
        mobileWalletNumber:
          isInitiatorPayee && form.paymentMethod !== "BANK_IBAN"
            ? form.mobileWalletNumber
            : undefined,
        deliveryTimeframeDays: Number(form.deliveryTimeframeDays) || 7,
        revisionRounds: Number(form.revisionLimit || form.revisionRounds || 2),
        revisionTurnaroundDays: Number(form.revisionTurnaroundDays || 5),
        brandApprovalRequired: form.brandApprovalRequired ?? true,
        platformsAllowed: form.platforms,
        usageType: form.usageType,
        usageRightsDuration: form.paidBoostingDuration || "12 Months",
        collabProduct: form.collabProduct || undefined,
        collabProductProvisionType: form.collabProductProvisionType,
        collabDeliveryAddress: form.collabDeliveryAddress || undefined,
        collabDeliveryDate: form.collabDeliveryDate || undefined,
        collabProductReturnDays:
          form.collabProductProvisionType === "Product Loan"
            ? Number(form.collabProductReturnDays || 7)
            : undefined,
        collabProductReturnAddress:
          form.collabProductProvisionType === "Product Loan"
            ? form.collabProductReturnAddress
            : undefined,
        collabProductReturnShippingBy:
          form.collabProductProvisionType === "Product Loan"
            ? form.collabProductReturnShippingBy
            : undefined,
        collabProductNonReturnFee:
          form.collabProductProvisionType === "Product Loan" &&
          form.collabProductNonReturnFee
            ? Number(form.collabProductNonReturnFee)
            : undefined,
        latePaymentPenaltyPct: Number(form.latePaymentPenaltyPct) || 3,
        lateContentPenaltyPct: Number(form.lateContentPenaltyPct) || 3,
        penaltyCapPct: Number(form.penaltyCapPct) || 20,
        unauthorizedUsagePenaltyPct:
          Number(form.unauthorizedUsagePenaltyPct) || 50,
        advanceRefundable: form.advanceRefundable ?? true,
        advanceRefundTimeframeDays:
          Number(form.advanceRefundTimeframeDays) || 7,
        nonDeliveryCutoffDays: Number(form.nonDeliveryCutoffDays) || 7,
        cancellationFeePct: Number(form.cancellationFeePct) || 25,
        exclusivityClause: form.exclusivityClause,
        exclusivityDuration: form.exclusivityClause
          ? form.exclusivityDuration
          : undefined,
        exclusivityCompetitors: form.exclusivityClause
          ? form.exclusivityCompetitors
          : undefined,
        confidentialityRequired: form.confidentialityRequired,
        embargoDate:
          form.confidentialityRequired && form.embargoDate
            ? form.embargoDate
            : undefined,
        earlyDisclosurePenalty:
          form.confidentialityRequired && form.earlyDisclosurePenalty
            ? Number(form.earlyDisclosurePenalty)
            : undefined,
        contentOwnership: form.contentOwnership,
        taggingRequirements: form.taggingRequirements,
        deliverables: form.deliverables,
        signatureB64: form.initiatorSignatureB64,
        fingerprint: form.initiatorFingerprint || "client-fingerprint",
      };

      const res = await fetch("/api/guest/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.limitReached) {
          setEmailLimitReached(true);
          setEmailLimitMessage(data.error);
        }
        throw new Error(data.error || "Failed to generate instant contract.");
      }

      const shareToken = data.shareToken || data.contract?.shareToken;
      const shareUrl = `${window.location.origin}/c/${shareToken}`;

      setCreatedResult({
        shareUrl,
        shareToken,
        contractNumber: data.contract?.contractNumber || "SC-INSTANT",
      });
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-hidden">
      {/* Header */}
      <SuiteHeader activeRoute="/instant" />

      {/* Main Studio Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 z-10">
        {/* Studio Top Breadcrumb & Title */}
        <div className="space-y-2 mb-6 text-left">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-600">
            <Link href="/" className="hover:text-zinc-950 transition-colors">
              SignCollab
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-zinc-950 font-bold">Instant Agreement Studio</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-900 text-white mb-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Statutory Creator E-Sign Standard
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 font-display tracking-tight">
                Instant Creator Agreement Studio
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 font-medium max-w-2xl leading-relaxed mt-0.5">
                Generate bilaterally enforceable influencer contracts with automated 48-hour deemed approval, advance escrow protection, and audit trails in under 2 minutes.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-white border border-zinc-200 text-zinc-700 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-zinc-600" />
                2 Free Guest Agreements / 24h
              </span>
            </div>
          </div>

          {/* Email Limit Alert Banner if triggered */}
          {emailLimitReached && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-start gap-3 mt-4">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Guest Daily Quota Reached</span>
                <p className="text-amber-800 leading-relaxed font-normal">
                  {emailLimitMessage ||
                    "This email address has reached the 2 free instant contracts limit for today. You can switch email or sign in to your SignCollab workspace for unlimited contract generation."}
                </p>
                <div className="pt-1">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1 font-bold text-amber-950 underline hover:no-underline"
                  >
                    <span>Sign In to Unlock Unlimited Contracts</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 6-Step Wizard Navigation */}
        <div className="mb-6">
          <InstantWizardNav
            currentStep={currentStep}
            onSelectStep={(step) => {
              if (step < currentStep) {
                setCurrentStep(step);
                setErrorMsg("");
              }
            }}
          />
        </div>

        {/* Split Screen Grid (Left: Step Form, Right: Live Contract Preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Active Step Form */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-6">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-zinc-200/90 shadow-xs p-5 sm:p-7 md:p-8">
              {errorMsg && (
                <div className="p-4 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" strokeWidth={2} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {currentStep === 1 && (
                <Step1Relationship
                  form={form}
                  onChange={handleFormChange}
                  onNext={handleValidateAndNext}
                />
              )}

              {currentStep === 2 && (
                <Step2Deliverables
                  form={form}
                  onChange={handleFormChange}
                  onNext={handleValidateAndNext}
                  onBack={handleBack}
                />
              )}

              {currentStep === 3 && (
                <Step3UsageRights
                  form={form}
                  onChange={handleFormChange}
                  onNext={handleValidateAndNext}
                  onBack={handleBack}
                />
              )}

              {currentStep === 4 && (
                <Step4Financials
                  form={form}
                  onChange={handleFormChange}
                  onNext={handleValidateAndNext}
                  onBack={handleBack}
                />
              )}

              {currentStep === 5 && (
                <Step5Identity
                  form={form}
                  onChange={handleFormChange}
                  onNext={handleValidateAndNext}
                  onBack={handleBack}
                />
              )}

              {currentStep === 6 && (
                <Step6SignOtp
                  form={form}
                  onChange={handleFormChange}
                  onSubmit={handleSubmitContract}
                  onBack={handleBack}
                  loading={loading}
                  errorMsg={errorMsg}
                />
              )}
            </div>
          </div>

          {/* Right Column: Real-Time Document Preview (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-5 sticky top-24 max-h-[calc(100vh-7rem)]">
            <ContractLivePreview form={form} />
          </div>
        </div>
      </main>

      {/* Mobile Sticky Floating Preview Trigger */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsMobilePreviewOpen(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-zinc-950 text-white font-bold text-xs shadow-xl flex items-center justify-between border border-zinc-800 backdrop-blur-md cursor-pointer min-h-[44px]"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Preview Contract (Live Draft)</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            {form.deliverables.length} Deliverable(s) • ${form.totalAmount || "0"}
          </span>
        </button>
      </div>

      {/* Mobile Preview Modal / Drawer */}
      {isMobilePreviewOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-zinc-950/60 backdrop-blur-xs p-2 sm:p-4">
          <div className="w-full max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-slideUp">
            <ContractLivePreview
              form={form}
              isMobileDrawer
              onCloseMobileDrawer={() => setIsMobilePreviewOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Post-Creation Success Modal */}
      {createdResult && (
        <InstantSuccessModal
          result={createdResult}
          form={form}
          onClose={() => {
            setCreatedResult(null);
            setForm(INITIAL_FORM_STATE);
            setCurrentStep(1);
          }}
        />
      )}

      {/* Suite Footer */}
      <PublicFooter />
    </div>
  );
}

export default function InstantStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-theme-gradient flex items-center justify-center p-6">
          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center gap-3 font-mono text-xs text-zinc-600">
            <div className="w-4 h-4 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin" />
            <span>Loading SignCollab Instant Studio...</span>
          </div>
        </div>
      }
    >
      <InstantStudioContent />
    </Suspense>
  );
}
