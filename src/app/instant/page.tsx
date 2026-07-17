"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCompanyConfig } from "@/lib/config";
import { SignaturePadModal } from "@/components/ui/SignaturePadModal";

interface DeliverableItem {
  type: string;
  quantity: number;
  duration: string;
  notes: string;
}

const WORKFLOW_OPTIONS = [
  { value: "CREATOR_TO_BRAND", label: "Creator ➔ Brand (Direct Deal)" },
  { value: "BRAND_TO_CREATOR", label: "Brand ➔ Creator (Sponsorship Offer)" },
  { value: "AGENCY_TO_CREATOR", label: "Agency ➔ Creator (Campaign Delegation)" },
  { value: "AGENCY_TO_BRAND", label: "Agency ➔ Brand (Master Services Agreement)" },
  { value: "BRAND_TO_AGENCY", label: "Brand ➔ Agency (Agency Retainer/Campaign)" },
  { value: "CREATOR_TO_AGENCY", label: "Creator ➔ Agency (Representation Deal)" },
];

const PLATFORM_OPTIONS = [
  { id: "INSTAGRAM", label: "Instagram" },
  { id: "TIKTOK", label: "TikTok" },
  { id: "YOUTUBE", label: "YouTube" },
  { id: "FACEBOOK", label: "Facebook" },
  { id: "LINKEDIN", label: "LinkedIn" },
  { id: "X_TWITTER", label: "X (Twitter)" },
];

const USAGE_TYPE_OPTIONS = [
  { id: "ORGANIC_ONLY", label: "Organic Social Post" },
  { id: "PAID_AD", label: "Paid Social Media Ads" },
  { id: "BILLBOARD_PRINT", label: "Print and Billboard" },
  { id: "ALL_MEDIA", label: "Full Commercial Broadcast" },
];

export default function InstantContractPage() {
  const company = getCompanyConfig();
  const router = useRouter();

  // Section 1: Campaign Deliverables & Tagging
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>([
    { type: "REEL", quantity: 1, duration: "Permanent", notes: "" },
  ]);
  const [taggingRequirements, setTaggingRequirements] = useState("");
  const [contentOwnership, setContentOwnership] = useState(
    "Creator retains underlying IP copyright; brand receives licensed commercial usage rights as specified herein."
  );

  // Section 2: Usage Rights & Licensing
  const [platformsAllowed, setPlatformsAllowed] = useState<string[]>(["INSTAGRAM", "TIKTOK"]);
  const [usageType, setUsageType] = useState<string[]>(["ORGANIC_ONLY"]);
  const [usageRightsDuration, setUsageRightsDuration] = useState("12 Months");

  // Section 3: Financial & Payment Terms
  const [totalAmount, setTotalAmount] = useState("");
  const [advancePayment, setAdvancePayment] = useState("");
  const [advancePaymentDate, setAdvancePaymentDate] = useState("");
  const [remainingPaymentDate, setRemainingPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_IBAN");
  const [bankAccountIban, setBankAccountIban] = useState("");
  const [mobileWalletNumber, setMobileWalletNumber] = useState("");

  // Section 4: Delivery, Revisions & Product Provisions
  const [deliveryTimeframeDays, setDeliveryTimeframeDays] = useState("7");
  const [revisionRounds, setRevisionRounds] = useState("1");
  const [revisionTurnaroundDays, setRevisionTurnaroundDays] = useState("5");
  const [brandApprovalRequired, setBrandApprovalRequired] = useState(true);

  // Product Provision / Loan details
  const [collabProduct, setCollabProduct] = useState("");
  const [collabProductProvisionType, setCollabProductProvisionType] = useState("Product Provision");
  const [collabDeliveryAddress, setCollabDeliveryAddress] = useState("");
  const [collabDeliveryDate, setCollabDeliveryDate] = useState("");
  const [collabProductReturnDays, setCollabProductReturnDays] = useState("7");
  const [collabProductReturnAddress, setCollabProductReturnAddress] = useState("");
  const [collabProductReturnShippingBy, setCollabProductReturnShippingBy] = useState("Brand");
  const [collabProductNonReturnFee, setCollabProductNonReturnFee] = useState("");

  // Section 5: Safeguards, Penalties & Exclusivity
  const [latePaymentPenaltyPct, setLatePaymentPenaltyPct] = useState("3");
  const [lateContentPenaltyPct, setLateContentPenaltyPct] = useState("3");
  const [penaltyCapPct, setPenaltyCapPct] = useState("20");
  const [unauthorizedUsagePenaltyPct, setUnauthorizedUsagePenaltyPct] = useState("50");
  const [advanceRefundable, setAdvanceRefundable] = useState(true);
  const [advanceRefundTimeframeDays, setAdvanceRefundTimeframeDays] = useState("7");
  const [nonDeliveryCutoffDays, setNonDeliveryCutoffDays] = useState("7");
  const [cancellationFeePct, setCancellationFeePct] = useState("25");

  const [exclusivityClause, setExclusivityClause] = useState(false);
  const [exclusivityDuration, setExclusivityDuration] = useState("30 Days");
  const [exclusivityCompetitors, setExclusivityCompetitors] = useState("");

  const [confidentialityRequired, setConfidentialityRequired] = useState(false);
  const [embargoDate, setEmbargoDate] = useState("");
  const [earlyDisclosurePenalty, setEarlyDisclosurePenalty] = useState("");

  // Section 6: Workflow & Parties (Final Section)
  const [contractType, setContractType] = useState<string>("AGENCY_TO_CREATOR");
  const [initiatorName, setInitiatorName] = useState("");
  const [initiatorEmail, setInitiatorEmail] = useState("");
  const [initiatorPhone, setInitiatorPhone] = useState("");
  const [initiatorRole, setInitiatorRole] = useState<"CREATOR" | "BRAND" | "AGENCY">("AGENCY");
  const [initiatorDesignation, setInitiatorDesignation] = useState("");
  const [initiatorNtn, setInitiatorNtn] = useState("");
  const [initiatorCnic, setInitiatorCnic] = useState("");
  const [initiatorCompanyName, setInitiatorCompanyName] = useState("");
  const [initiatorCompanyAddress, setInitiatorCompanyAddress] = useState("");

  // Derived: is the initiator a business entity (Agency/Brand) or individual (Creator)?
  const isInitiatorBusiness = initiatorRole === "AGENCY" || initiatorRole === "BRAND";

  // Derived: is the initiator receiving payout money? (Agency -> Brand, Creator -> Brand, Creator -> Agency)
  const isInitiatorPayee = ["AGENCY_TO_BRAND", "CREATOR_TO_BRAND", "CREATOR_TO_AGENCY"].includes(contractType);

  // Auto-sync Platform Role based on Contract Workflow
  React.useEffect(() => {
    if (contractType.startsWith("CREATOR_")) {
      setInitiatorRole("CREATOR");
    } else if (contractType.startsWith("BRAND_")) {
      setInitiatorRole("BRAND");
    } else if (contractType.startsWith("AGENCY_")) {
      setInitiatorRole("AGENCY");
    }
  }, [contractType]);

  // Counterparty fields (Reactive based on contractType)
  const [brandName, setBrandName] = useState("");
  const [brandHandle, setBrandHandle] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [creatorHandle, setCreatorHandle] = useState("");

  // Party 1 Initiator Signature states (Captured before OTP)
  const [initiatorSignatureB64, setInitiatorSignatureB64] = useState("");
  const [initiatorFingerprint, setInitiatorFingerprint] = useState("");

  // Party 1 Initiator OTP states
  const [initiatorOtpDispatched, setInitiatorOtpDispatched] = useState(false);
  const [initiatorOtpVerified, setInitiatorOtpVerified] = useState(false);
  const [initiatorOtpCode, setInitiatorOtpCode] = useState("");
  const [initiatorOtpLoading, setInitiatorOtpLoading] = useState(false);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [createdResult, setCreatedResult] = useState<{
    shareUrl: string;
    shareToken: string;
    contractNumber: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  // Computed: is the form fully valid and ready to request OTP?
  const isFormReadyForOtp = useMemo(() => {
    if (!initiatorSignatureB64) return false;
    if (!initiatorName.trim() || !initiatorEmail.trim() || !initiatorPhone.trim()) return false;
    if (!initiatorDesignation.trim()) return false;
    if (isInitiatorBusiness && (!initiatorNtn.trim() || !initiatorCompanyName.trim())) return false;
    if (!isInitiatorBusiness && !initiatorCnic.trim()) return false;
    if (!totalAmount || Number(totalAmount) <= 0) return false;
    if (!remainingPaymentDate) return false;
    if (!deliveryTimeframeDays || Number(deliveryTimeframeDays) <= 0) return false;
    // Workflow-specific counterparty checks
    if (contractType === "AGENCY_TO_CREATOR" && (!brandName.trim() || !campaignName.trim())) return false;
    if (contractType === "CREATOR_TO_BRAND" && (!brandName.trim() || !brandHandle.trim())) return false;
    if (contractType === "BRAND_TO_CREATOR" && (!creatorName.trim() || !creatorHandle.trim())) return false;
    if (contractType === "AGENCY_TO_BRAND" && (!creatorName.trim() || !creatorHandle.trim())) return false;
    if (contractType === "CREATOR_TO_AGENCY" && (!brandName.trim() || !campaignName.trim())) return false;
    if (contractType === "BRAND_TO_AGENCY" && (!creatorName.trim() || !campaignName.trim())) return false;
    if (advancePayment && Number(advancePayment) > 0 && !advancePaymentDate) return false;
    return true;
  }, [
    initiatorSignatureB64, initiatorName, initiatorEmail, initiatorPhone,
    initiatorDesignation, isInitiatorBusiness, initiatorNtn, initiatorCompanyName,
    initiatorCnic, totalAmount, remainingPaymentDate, deliveryTimeframeDays,
    contractType, brandName, campaignName, brandHandle, creatorName, creatorHandle,
    advancePayment, advancePaymentDate,
  ]);

  // Helpers for deliverables & platforms
  const handleAddDeliverable = () => {
    setDeliverables([
      ...deliverables,
      { type: "REEL", quantity: 1, duration: "Permanent", notes: "" },
    ]);
  };

  const handleRemoveDeliverable = (index: number) => {
    if (deliverables.length === 1) return;
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleDeliverableChange = (index: number, field: keyof DeliverableItem, value: any) => {
    const updated = [...deliverables];
    updated[index] = { ...updated[index], [field]: value };
    setDeliverables(updated);
  };

  const togglePlatform = (pId: string) => {
    if (platformsAllowed.includes(pId)) {
      if (platformsAllowed.length === 1) return;
      setPlatformsAllowed(platformsAllowed.filter((p) => p !== pId));
    } else {
      setPlatformsAllowed([...platformsAllowed, pId]);
    }
  };

  const toggleUsageType = (uId: string) => {
    if (usageType.includes(uId)) {
      if (usageType.length === 1) return;
      setUsageType(usageType.filter((u) => u !== uId));
    } else {
      setUsageType([...usageType, uId]);
    }
  };

  // Called when initiator completes signature canvas drawing in modal
  const handleSaveSignature = (sigB64: string, fPrint: string) => {
    setInitiatorSignatureB64(sigB64);
    setInitiatorFingerprint(fPrint);
    setIsSignModalOpen(false);
  };

  // OTP Sending logic for Initiator (Party 1) - sends ALL initiator data + signature in email
  const handleSendInitiatorOtp = async () => {
    if (!initiatorEmail || !initiatorEmail.trim()) {
      setErrorMsg("Please enter your email address first.");
      return;
    }
    if (!initiatorName.trim() || !initiatorPhone.trim() || !initiatorDesignation.trim()) {
      setErrorMsg("Please fill in your Name, Phone Number, and Job Title / Capacity first.");
      return;
    }
    if (!initiatorSignatureB64) {
      setErrorMsg("Please draw and apply your Digital Signature first.");
      return;
    }

    setInitiatorOtpLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/guest/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          email: initiatorEmail,
          name: initiatorName,
          phone: initiatorPhone,
          designation: initiatorDesignation,
          companyName: isInitiatorBusiness ? initiatorCompanyName : undefined,
          companyAddress: isInitiatorBusiness ? initiatorCompanyAddress : undefined,
          ntn: isInitiatorBusiness ? initiatorNtn : undefined,
          cnic: !isInitiatorBusiness ? initiatorCnic : undefined,
          role: initiatorRole,
          contractType,
          brandName,
          brandHandle,
          campaignName,
          creatorName,
          creatorHandle,
          signatureB64: initiatorSignatureB64,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setInitiatorOtpDispatched(true);
      } else {
        setErrorMsg(data.error || "Failed to send verification code.");
      }
    } catch (err: any) {
      setErrorMsg("Error sending verification code.");
    } finally {
      setInitiatorOtpLoading(false);
    }
  };

  // Create Contract in Backend DB after successful OTP verification
  const handleCreateContractInDb = async (sigB64: string, fPrint: string) => {
    setLoading(true);
    try {
      const payload = {
        contractType,
        initiatorName,
        initiatorEmail: initiatorEmail.trim().toLowerCase(),
        initiatorPhone,
        initiatorRole,
        initiatorDesignation,
        initiatorNtn: isInitiatorBusiness ? initiatorNtn : undefined,
        initiatorCnic: !isInitiatorBusiness ? initiatorCnic : undefined,
        initiatorCompanyName: isInitiatorBusiness ? initiatorCompanyName : undefined,
        initiatorCompanyAddress: isInitiatorBusiness ? initiatorCompanyAddress : undefined,
        brandName: ["AGENCY_TO_CREATOR", "CREATOR_TO_BRAND", "CREATOR_TO_AGENCY"].includes(contractType) ? brandName : undefined,
        brandHandle: ["AGENCY_TO_CREATOR", "CREATOR_TO_BRAND", "CREATOR_TO_AGENCY"].includes(contractType) ? brandHandle : undefined,
        campaignName: ["AGENCY_TO_CREATOR", "CREATOR_TO_AGENCY", "BRAND_TO_AGENCY"].includes(contractType) ? campaignName : undefined,
        creatorName: ["AGENCY_TO_BRAND", "BRAND_TO_CREATOR", "BRAND_TO_AGENCY"].includes(contractType) ? creatorName : undefined,
        creatorHandle: ["AGENCY_TO_BRAND", "BRAND_TO_CREATOR", "BRAND_TO_AGENCY"].includes(contractType) ? creatorHandle : undefined,
        totalAmount: Number(totalAmount),
        advancePayment: advancePayment ? Number(advancePayment) : 0,
        advancePaymentDate: advancePaymentDate || undefined,
        remainingPaymentDate: remainingPaymentDate || undefined,
        paymentMethod: isInitiatorPayee ? paymentMethod : undefined,
        bankAccountIban: isInitiatorPayee && paymentMethod === "BANK_IBAN" ? bankAccountIban : undefined,
        mobileWalletNumber: isInitiatorPayee && paymentMethod !== "BANK_IBAN" ? mobileWalletNumber : undefined,
        deliveryTimeframeDays: Number(deliveryTimeframeDays),
        revisionRounds: Number(revisionRounds),
        revisionTurnaroundDays: Number(revisionTurnaroundDays),
        brandApprovalRequired,
        platformsAllowed,
        usageType,
        usageRightsDuration,
        collabProduct: collabProduct || undefined,
        collabProductProvisionType,
        collabDeliveryAddress: collabDeliveryAddress || undefined,
        collabDeliveryDate: collabDeliveryDate || undefined,
        collabProductReturnDays: collabProductProvisionType === "Product Loan" ? Number(collabProductReturnDays) : undefined,
        collabProductReturnAddress: collabProductProvisionType === "Product Loan" ? collabProductReturnAddress : undefined,
        collabProductReturnShippingBy: collabProductProvisionType === "Product Loan" ? collabProductReturnShippingBy : undefined,
        collabProductNonReturnFee: collabProductProvisionType === "Product Loan" && collabProductNonReturnFee ? Number(collabProductNonReturnFee) : undefined,
        latePaymentPenaltyPct: Number(latePaymentPenaltyPct),
        lateContentPenaltyPct: Number(lateContentPenaltyPct),
        penaltyCapPct: Number(penaltyCapPct),
        unauthorizedUsagePenaltyPct: Number(unauthorizedUsagePenaltyPct),
        advanceRefundable,
        advanceRefundTimeframeDays: Number(advanceRefundTimeframeDays),
        nonDeliveryCutoffDays: Number(nonDeliveryCutoffDays),
        cancellationFeePct: Number(cancellationFeePct),
        exclusivityClause,
        exclusivityDuration: exclusivityClause ? exclusivityDuration : undefined,
        exclusivityCompetitors: exclusivityClause ? exclusivityCompetitors : undefined,
        confidentialityRequired,
        embargoDate: confidentialityRequired && embargoDate ? embargoDate : undefined,
        earlyDisclosurePenalty: confidentialityRequired && earlyDisclosurePenalty ? Number(earlyDisclosurePenalty) : undefined,
        contentOwnership,
        taggingRequirements,
        deliverables,
        signatureB64: sigB64,
        fingerprint: fPrint,
      };

      const res = await fetch("/api/guest/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate instant contract.");
      }

      const shareToken = data.shareToken || data.contract?.shareToken;
      const shareUrl = `${window.location.origin}/c/${shareToken}`;

      setCreatedResult({
        shareUrl,
        shareToken,
        contractNumber: data.contract?.contractNumber || "BB-INSTANT",
      });
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while generating the contract.");
    } finally {
      setLoading(false);
    }
  };

  // OTP Verification logic for Initiator (Party 1)
  const handleVerifyInitiatorOtp = async () => {
    if (!initiatorOtpCode || initiatorOtpCode.length !== 6) {
      setErrorMsg("Please enter the 6-digit OTP code sent to your email.");
      return;
    }

    setInitiatorOtpLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/guest/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          email: initiatorEmail,
          code: initiatorOtpCode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setInitiatorOtpVerified(true);
        // Save contract in backend DB automatically once OTP is verified
        await handleCreateContractInDb(initiatorSignatureB64, initiatorFingerprint);
      } else {
        setErrorMsg(data.error || "Invalid or expired OTP code.");
      }
    } catch (err: any) {
      setErrorMsg("Error verifying identity code.");
    } finally {
      setInitiatorOtpLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (createdResult?.shareUrl) {
      navigator.clipboard.writeText(createdResult.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-hidden">
      {/* Glow shapes */}
      <div className="absolute top-[5%] left-[-5%] w-[70%] h-[40%] rounded-full ambient-glow-purple pointer-events-none z-0" />
      <div className="absolute bottom-[5%] right-[-5%] w-[70%] h-[40%] rounded-full ambient-glow-blue pointer-events-none z-0" />

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
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Guest Mode (2 / Day)
          </span>
          <Link
            href="/"
            className="text-xs font-semibold px-4 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-black transition-colors"
          >
            Sign In / Register
          </Link>
        </div>
      </header>

      {/* Main Form Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 lg:p-12 z-10">
        {createdResult ? (
          /* SUCCESS SCREEN */
          <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 animate-fadeIn">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto">
                ✓
              </div>
              <h2 className="text-3xl font-black text-black">Instant Contract Signed &amp; Ready!</h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Contract <strong>#{createdResult.contractNumber}</strong> has been signed by you via OTP. Send the link below to the counterparty to review &amp; sign.
              </p>
            </div>

            <div className="bg-gray-50 p-4 md:p-6 rounded-2xl border border-gray-200 space-y-3">
              <label className="text-xs font-bold text-black uppercase tracking-wider block">
                Shareable Signing Link (Send to Counterparty)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdResult.shareUrl}
                  className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs md:text-sm font-mono text-gray-800 select-all focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-black hover:bg-black/90 text-white font-bold px-6 py-3 rounded-xl text-xs md:text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {copied ? "✓ Copied!" : "📋 Copy Link"}
                </button>
                <a
                  href={createdResult.shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  Open Link ↗
                </a>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 md:p-8 rounded-2xl shadow-lg space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/20">
                    Auto-Claim Available
                  </span>
                  <h3 className="text-xl font-bold mt-2">Want to manage &amp; track this contract in a permanent dashboard?</h3>
                  <p className="text-xs text-blue-200 mt-1 max-w-xl leading-relaxed">
                    Create a free account using <strong>{initiatorEmail}</strong> and this agreement will automatically sync to your dashboard!
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/"
                  className="bg-white text-black hover:bg-gray-100 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-sm"
                >
                  Create Free Account Now
                </Link>
                <button
                  onClick={() => {
                    setCreatedResult(null);
                    setInitiatorName("");
                    setInitiatorEmail("");
                    setTotalAmount("");
                    setAdvancePayment("");
                    setInitiatorOtpVerified(false);
                    setInitiatorOtpDispatched(false);
                    setInitiatorOtpCode("");
                  }}
                  className="text-xs text-blue-200 hover:text-white underline font-medium px-2 py-1"
                >
                  Create Another Guest Contract
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* FULL FORM GENERATOR */
          <form onSubmit={(e) => e.preventDefault()} className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-xl space-y-10">
            
            {/* Header Banner */}
            <div className="border-b border-gray-100 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100/70 text-blue-800 border border-blue-200">
                    Full Parity 1-Page Instant Agreement
                  </span>
                  <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight mt-2">
                    Create Complete Commercial Contract
                  </h1>
                </div>
                <div className="text-xs text-gray-500 font-semibold bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                  ⚡ No signup required • 2 per day
                </div>
              </div>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Fill in campaign terms first, then verify your identity via OTP in the final step to generate the signing link.
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2">
                <span>⚠</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* CONTRACT WORKFLOW SELECTOR */}
            <div className="flex flex-col text-left gap-1">
              <label className="text-xs font-bold text-gray-800">Contract Workflow *</label>
              <select
                value={contractType}
                disabled={initiatorOtpVerified}
                onChange={(e) => setContractType(e.target.value)}
                className="input-field border-black font-semibold text-black bg-blue-50/50 disabled:bg-gray-100"
              >
                {WORKFLOW_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* SECTION 1: Campaign Deliverables & Guidelines */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                  1. Campaign Deliverables &amp; Guidelines
                </h3>
              </div>

              {deliverables.map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600 uppercase">Deliverable #{idx + 1}</span>
                    {deliverables.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(idx)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Format</label>
                      <select
                        value={item.type}
                        onChange={(e) => handleDeliverableChange(idx, "type", e.target.value)}
                        className="input-field text-xs"
                      >
                        <option value="REEL">Reel</option>
                        <option value="STORY">Story</option>
                        <option value="CAROUSEL_POST">Carousel Post</option>
                        <option value="IMAGE_POST">Single Post</option>
                        <option value="TIKTOK_VIDEO">Short Video</option>
                        <option value="YOUTUBE_VIDEO">Long-form Video</option>
                        <option value="LIVE_SESSION">Live Session</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleDeliverableChange(idx, "quantity", e.target.value)}
                        className="input-field text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Duration</label>
                      <input
                        type="text"
                        placeholder="Permanent / 30s"
                        value={item.duration}
                        onChange={(e) => handleDeliverableChange(idx, "duration", e.target.value)}
                        className="input-field text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Link in bio"
                        value={item.notes}
                        onChange={(e) => handleDeliverableChange(idx, "notes", e.target.value)}
                        className="input-field text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddDeliverable}
                className="w-full py-3 rounded-xl border border-dashed border-gray-300 hover:border-black bg-white hover:bg-gray-50 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                + Add Deliverable
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Tagging &amp; Collaboration Requirements</label>
                  <input
                    type="text"
                    placeholder="e.g. Must tag @brand, use #SummerCollection, add collab tag"
                    value={taggingRequirements}
                    onChange={(e) => setTaggingRequirements(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Content IP Ownership Terms</label>
                  <input
                    type="text"
                    value={contentOwnership}
                    onChange={(e) => setContentOwnership(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Granted Commercial License Tiers & Media Scope */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-gray-100 pb-2">
                2. Granted Commercial License Tiers &amp; Media Scope
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-800 block mb-2">Platforms Allowed</label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORM_OPTIONS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlatform(p.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          platformsAllowed.includes(p.id)
                            ? "bg-black text-white border-black"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:border-black"
                        }`}
                      >
                        {platformsAllowed.includes(p.id) ? "✓ " : ""}{p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-800 block mb-2">Granted Commercial License Tiers</label>
                  <div className="flex flex-wrap gap-2">
                    {USAGE_TYPE_OPTIONS.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => toggleUsageType(u.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          usageType.includes(u.id)
                            ? "bg-black text-white border-black"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:border-black"
                        }`}
                      >
                        {usageType.includes(u.id) ? "✓ " : ""}{u.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col text-left gap-1 pt-2">
                <label className="text-xs font-bold text-gray-700">License Duration</label>
                <select
                  value={usageRightsDuration}
                  onChange={(e) => setUsageRightsDuration(e.target.value)}
                  className="input-field"
                >
                  <option value="30 Days">30 Days</option>
                  <option value="90 Days">90 Days</option>
                  <option value="6 Months">6 Months</option>
                  <option value="12 Months">12 Months</option>
                  <option value="Perpetual">Perpetual Commercial Usage</option>
                </select>
              </div>
            </div>

            {/* SECTION 3: Financial & Payment Schedule */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-gray-100 pb-2">
                3. Financial &amp; Payment Schedule
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Total Valuation Amount *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 100000"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="input-field font-bold text-black"
                  />
                </div>

                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Advance Payment (Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={advancePayment}
                    onChange={(e) => setAdvancePayment(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">
                    Advance Payment Date {advancePayment && Number(advancePayment) > 0 ? "*" : ""}
                  </label>
                  <input
                    type="date"
                    required={Boolean(advancePayment && Number(advancePayment) > 0)}
                    value={advancePaymentDate}
                    onChange={(e) => setAdvancePaymentDate(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Remaining Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={remainingPaymentDate}
                    onChange={(e) => setRemainingPaymentDate(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>

                {isInitiatorPayee ? (
                  <>
                    <div className="flex flex-col text-left gap-1">
                      <label className="text-xs font-bold text-gray-700">Receiving Payment Method *</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="input-field"
                      >
                        <option value="BANK_IBAN">Bank IBAN Transfer</option>
                        <option value="JAZZCASH">JazzCash Wallet</option>
                        <option value="EASYPAISA">EasyPaisa Wallet</option>
                      </select>
                    </div>

                    {paymentMethod === "BANK_IBAN" ? (
                      <div className="flex flex-col text-left gap-1">
                        <label className="text-xs font-bold text-gray-700">Bank IBAN Account *</label>
                        <input
                          type="text"
                          required
                          placeholder="PK00XXXX0000000000000000"
                          value={bankAccountIban}
                          onChange={(e) => setBankAccountIban(e.target.value)}
                          className="input-field font-mono"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col text-left gap-1">
                        <label className="text-xs font-bold text-gray-700">Mobile Wallet ({paymentMethod}) *</label>
                        <input
                          type="text"
                          required
                          placeholder="03XXXXXXXXX"
                          value={mobileWalletNumber}
                          onChange={(e) => setMobileWalletNumber(e.target.value)}
                          className="input-field font-mono"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="sm:col-span-2 p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-left flex items-center">
                    <p className="text-xs text-blue-900 font-medium flex items-center gap-2">
                      <span className="text-blue-600 font-bold">ℹ</span>
                      <span>
                        Receiving Payout Account (IBAN / JazzCash) will be collected directly from the receiving counterparty ({contractType.endsWith("_CREATOR") ? "Creator" : "Agency"}) on their signing link.
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4: Delivery, Revisions & Product Loans */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-gray-100 pb-2">
                4. Delivery, Revisions &amp; Product Loans
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Delivery Timeframe (Days) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={deliveryTimeframeDays}
                    onChange={(e) => setDeliveryTimeframeDays(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Revision Rounds</label>
                  <select
                    value={revisionRounds}
                    onChange={(e) => setRevisionRounds(e.target.value)}
                    className="input-field"
                  >
                    <option value="1">1 Round</option>
                    <option value="2">2 Rounds</option>
                    <option value="3">3 Rounds</option>
                  </select>
                </div>

                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Revision Turnaround (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={revisionTurnaroundDays}
                    onChange={(e) => setRevisionTurnaroundDays(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Collab Product Details */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3 mt-4">
                <span className="text-xs font-bold text-gray-800 uppercase block">Product Provisioning / Loan Details</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Product Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Lawn Unstitched 3-pc suit / Camera Kit"
                      value={collabProduct}
                      onChange={(e) => setCollabProduct(e.target.value)}
                      className="input-field text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Provision Type</label>
                    <select
                      value={collabProductProvisionType}
                      onChange={(e) => setCollabProductProvisionType(e.target.value)}
                      className="input-field text-xs"
                    >
                      <option value="Product Provision">Gift / Complimentary Provision</option>
                      <option value="Product Loan">Product Loan (Must Be Returned)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Shipping / Delivery Address</label>
                    <input
                      type="text"
                      placeholder="Shipping Address for product delivery"
                      value={collabDeliveryAddress}
                      onChange={(e) => setCollabDeliveryAddress(e.target.value)}
                      className="input-field text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Expected Product Arrival Date</label>
                    <input
                      type="date"
                      value={collabDeliveryDate}
                      onChange={(e) => setCollabDeliveryDate(e.target.value)}
                      className="input-field text-xs"
                    />
                  </div>
                </div>

                {collabProductProvisionType === "Product Loan" && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-200">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Return Timeframe (Days)</label>
                      <input
                        type="number"
                        value={collabProductReturnDays}
                        onChange={(e) => setCollabProductReturnDays(e.target.value)}
                        className="input-field text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Return Address</label>
                      <input
                        type="text"
                        placeholder="Address to return the product"
                        value={collabProductReturnAddress}
                        onChange={(e) => setCollabProductReturnAddress(e.target.value)}
                        className="input-field text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Return Shipping Paid By</label>
                      <select
                        value={collabProductReturnShippingBy}
                        onChange={(e) => setCollabProductReturnShippingBy(e.target.value)}
                        className="input-field text-xs"
                      >
                        <option value="Brand">Brand / Agency</option>
                        <option value="Creator">Creator</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Non-Return Penalty Fee</label>
                      <input
                        type="number"
                        placeholder="e.g. 15000"
                        value={collabProductNonReturnFee}
                        onChange={(e) => setCollabProductNonReturnFee(e.target.value)}
                        className="input-field text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 5: Safeguards, Penalties & NDA */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-gray-100 pb-2">
                5. Safeguards, Penalties &amp; Exclusivity
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Late Pay Penalty (%/wk)</label>
                  <input
                    type="number"
                    value={latePaymentPenaltyPct}
                    onChange={(e) => setLatePaymentPenaltyPct(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Late Content (%/wk)</label>
                  <input
                    type="number"
                    value={lateContentPenaltyPct}
                    onChange={(e) => setLateContentPenaltyPct(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Max Penalty Cap (%)</label>
                  <input
                    type="number"
                    value={penaltyCapPct}
                    onChange={(e) => setPenaltyCapPct(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Unauth Usage Fee (%)</label>
                  <input
                    type="number"
                    value={unauthorizedUsagePenaltyPct}
                    onChange={(e) => setUnauthorizedUsagePenaltyPct(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                    <input
                      type="checkbox"
                      checked={exclusivityClause}
                      onChange={(e) => setExclusivityClause(e.target.checked)}
                      className="w-4 h-4 rounded text-black focus:ring-black"
                    />
                    <span>Category Exclusivity Clause</span>
                  </label>
                  {exclusivityClause && (
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        placeholder="Exclusivity Duration (e.g. 30 Days)"
                        value={exclusivityDuration}
                        onChange={(e) => setExclusivityDuration(e.target.value)}
                        className="input-field text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Excluded Competitors (e.g. Brand X, Brand Y)"
                        value={exclusivityCompetitors}
                        onChange={(e) => setExclusivityCompetitors(e.target.value)}
                        className="input-field text-xs"
                      />
                    </div>
                  )}
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                    <input
                      type="checkbox"
                      checked={confidentialityRequired}
                      onChange={(e) => setConfidentialityRequired(e.target.checked)}
                      className="w-4 h-4 rounded text-black focus:ring-black"
                    />
                    <span>Confidentiality &amp; NDA</span>
                  </label>
                  {confidentialityRequired && (
                    <div className="space-y-2 pt-1">
                      <input
                        type="date"
                        value={embargoDate}
                        onChange={(e) => setEmbargoDate(e.target.value)}
                        className="input-field text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Early Disclosure Penalty (PKR)"
                        value={earlyDisclosurePenalty}
                        onChange={(e) => setEarlyDisclosurePenalty(e.target.value)}
                        className="input-field text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 6: Initiator Digital Signature Execution */}
            <div className="space-y-4 border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                  6. Initiator Digital Signature Execution
                </h3>
                {initiatorOtpVerified && (
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                    ✓ Identity Verified &amp; Signed
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    disabled={initiatorOtpVerified}
                    placeholder="e.g. Sarah Khan"
                    value={initiatorName}
                    onChange={(e) => setInitiatorName(e.target.value)}
                    className="input-field disabled:bg-gray-100"
                  />
                </div>

                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Your Email Address *</label>
                  <input
                    type="email"
                    required
                    disabled={initiatorOtpVerified || initiatorOtpDispatched}
                    placeholder="sarah@example.com"
                    value={initiatorEmail}
                    onChange={(e) => setInitiatorEmail(e.target.value)}
                    className="input-field disabled:bg-gray-100"
                  />
                </div>

                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Your Phone Number *</label>
                  <input
                    type="tel"
                    required
                    disabled={initiatorOtpVerified}
                    placeholder="e.g. +92 300 1234567"
                    value={initiatorPhone}
                    onChange={(e) => setInitiatorPhone(e.target.value)}
                    className="input-field disabled:bg-gray-100"
                  />
                </div>

                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Your Platform Role</label>
                  <div className="input-field bg-gray-100/90 border-gray-200 text-gray-900 font-bold flex items-center justify-between cursor-not-allowed">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {initiatorRole === "CREATOR" ? "Creator / Influencer" : initiatorRole === "BRAND" ? "Brand Representative" : "Agency Representative"}
                    </span>
                    <span className="text-[10px] text-gray-400 font-normal ml-2">Auto-fixed</span>
                  </div>
                </div>

                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Your Job Title / Capacity *</label>
                  <input
                    type="text"
                    required
                    disabled={initiatorOtpVerified}
                    placeholder="e.g. Senior Campaign Manager"
                    value={initiatorDesignation}
                    onChange={(e) => setInitiatorDesignation(e.target.value)}
                    className="input-field disabled:bg-gray-100"
                  />
                </div>

                {/* CONDITIONAL BUSINESS VS INDIVIDUAL IDENTITY FIELDS */}
                {isInitiatorBusiness ? (
                  <>
                    <div className="flex flex-col text-left gap-1">
                      <label className="text-xs font-bold text-gray-700">
                        {initiatorRole === "AGENCY" ? "Agency Name" : "Company Name"} *
                      </label>
                      <input
                        type="text"
                        required
                        disabled={initiatorOtpVerified}
                        placeholder={initiatorRole === "AGENCY" ? "e.g. Creative Hub Agency" : "e.g. Sapphire Retail Ltd."}
                        value={initiatorCompanyName}
                        onChange={(e) => setInitiatorCompanyName(e.target.value)}
                        className="input-field disabled:bg-gray-100"
                      />
                    </div>

                    <div className="flex flex-col text-left gap-1 sm:col-span-2">
                      <label className="text-xs font-bold text-gray-700">
                        {initiatorRole === "AGENCY" ? "Agency Address" : "Company Address"}
                      </label>
                      <input
                        type="text"
                        disabled={initiatorOtpVerified}
                        placeholder="Official registered address, City"
                        value={initiatorCompanyAddress}
                        onChange={(e) => setInitiatorCompanyAddress(e.target.value)}
                        className="input-field disabled:bg-gray-100"
                      />
                    </div>

                    <div className="flex flex-col text-left gap-1 sm:col-span-2">
                      <label className="text-xs font-bold text-gray-700">NTN (National Tax Number) *</label>
                      <input
                        type="text"
                        required
                        disabled={initiatorOtpVerified}
                        placeholder="e.g. 1234567-8"
                        value={initiatorNtn}
                        onChange={(e) => setInitiatorNtn(e.target.value)}
                        className="input-field disabled:bg-gray-100"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col text-left gap-1 sm:col-span-2">
                    <label className="text-xs font-bold text-gray-700">CNIC (National Identity Card) *</label>
                    <input
                      type="text"
                      required
                      disabled={initiatorOtpVerified}
                      placeholder="e.g. 42101-0000000-0"
                      value={initiatorCnic}
                      onChange={(e) => setInitiatorCnic(e.target.value)}
                      className="input-field disabled:bg-gray-100"
                    />
                  </div>
                )}

                {/* REACTIVE COUNTERPARTY FIELDS BASED ON WORKFLOW */}
                {["AGENCY_TO_CREATOR", "CREATOR_TO_BRAND", "CREATOR_TO_AGENCY"].includes(contractType) && (
                  <div className="flex flex-col text-left gap-1">
                    <label className="text-xs font-bold text-gray-700">Brand Name *</label>
                    <input
                      type="text"
                      required
                      disabled={initiatorOtpVerified}
                      placeholder="e.g. Sapphire / Nexus"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="input-field border-blue-200 disabled:bg-gray-100"
                    />
                  </div>
                )}

                {["AGENCY_TO_CREATOR", "CREATOR_TO_BRAND", "CREATOR_TO_AGENCY"].includes(contractType) && (
                  <div className="flex flex-col text-left gap-1">
                    <label className="text-xs font-bold text-gray-700">Brand Instagram Handle</label>
                    <input
                      type="text"
                      disabled={initiatorOtpVerified}
                      placeholder="e.g. @sapphirepk"
                      value={brandHandle}
                      onChange={(e) => setBrandHandle(e.target.value)}
                      className="input-field border-blue-200 disabled:bg-gray-100"
                    />
                  </div>
                )}

                {["AGENCY_TO_CREATOR", "CREATOR_TO_AGENCY", "BRAND_TO_AGENCY"].includes(contractType) && (
                  <div className="flex flex-col text-left gap-1">
                    <label className="text-xs font-bold text-gray-700">Campaign Name *</label>
                    <input
                      type="text"
                      required
                      disabled={initiatorOtpVerified}
                      placeholder="e.g. Summer Lawn Campaign 2026"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      className="input-field border-blue-200 disabled:bg-gray-100"
                    />
                  </div>
                )}

                {["AGENCY_TO_BRAND", "BRAND_TO_CREATOR", "BRAND_TO_AGENCY"].includes(contractType) && (
                  <div className="flex flex-col text-left gap-1">
                    <label className="text-xs font-bold text-gray-700">Creator Name *</label>
                    <input
                      type="text"
                      required
                      disabled={initiatorOtpVerified}
                      placeholder="e.g. Mohammad Ali"
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      className="input-field border-blue-200 disabled:bg-gray-100"
                    />
                  </div>
                )}

                {["AGENCY_TO_BRAND", "BRAND_TO_CREATOR", "BRAND_TO_AGENCY"].includes(contractType) && (
                  <div className="flex flex-col text-left gap-1">
                    <label className="text-xs font-bold text-gray-700">Creator Handle *</label>
                    <input
                      type="text"
                      required
                      disabled={initiatorOtpVerified}
                      placeholder="e.g. @alibeats"
                      value={creatorHandle}
                      onChange={(e) => setCreatorHandle(e.target.value)}
                      className="input-field border-blue-200 disabled:bg-gray-100"
                    />
                  </div>
                )}

                {/* CONTEXTUAL NOTICE BADGE */}
                <div className="sm:col-span-2 p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-left">
                  <p className="text-xs text-blue-900 font-medium flex items-start gap-2">
                    <span className="text-blue-600 font-bold">ℹ</span>
                    <span>
                      {contractType === "AGENCY_TO_CREATOR" || contractType === "BRAND_TO_CREATOR"
                        ? "Creator representative verification details, CNIC photo, and payout details will be collected directly from the Creator when they open the Contract Link."
                        : contractType === "CREATOR_TO_BRAND" || contractType === "AGENCY_TO_BRAND"
                        ? "Brand representative verification details, company address, and official authority will be collected directly from the Brand when they open the Contract Link."
                        : "Agency representative verification details, office address, and official authority will be collected directly from the Agency when they open the Contract Link."}
                    </span>
                  </p>
                </div>

                {/* INITIATOR DIGITAL SIGNATURE STEP (BEFORE OTP) */}
                <div className="flex flex-col text-left gap-1.5 sm:col-span-2 pt-2">
                  <label className="text-xs font-bold text-gray-800">Your Digital Signature *</label>
                  {initiatorSignatureB64 ? (
                    <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-1.5 rounded-xl border border-emerald-200 shadow-sm shrink-0">
                          <img src={initiatorSignatureB64} alt="Signature Preview" className="h-10 object-contain max-w-[150px]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                            <span>✓</span> Digital Signature Captured &amp; Ready
                          </span>
                          <span className="text-[10px] text-emerald-700">
                            Will be embedded in E-Sign Vault &amp; sent in OTP Email
                          </span>
                        </div>
                      </div>
                      {!initiatorOtpVerified && (
                        <button
                          type="button"
                          onClick={() => setIsSignModalOpen(true)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 underline px-3 py-1.5 bg-white border border-blue-200 rounded-xl shadow-sm"
                        >
                          Redraw Signature
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsSignModalOpen(true)}
                      className="w-full py-4 bg-blue-50 hover:bg-blue-100/90 border-2 border-dashed border-blue-300 hover:border-blue-400 text-blue-900 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      ✍ Click Here to Draw Your Digital Signature *
                    </button>
                  )}
                </div>

                {/* OTP VERIFICATION ACTION BOX FOR PARTY 1 */}
                <div className="sm:col-span-2 pt-2">
                  {!initiatorOtpVerified ? (
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-black uppercase tracking-wider">
                          Verify Email Identity via OTP to Save Contract &amp; Generate Link
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {initiatorOtpDispatched
                            ? `Code sent to ${initiatorEmail}. Enter 6-digit verification code below.`
                            : "Draw your signature above and enter all required details, then click Send OTP."}
                        </span>
                      </div>

                      {!initiatorOtpDispatched ? (
                        <button
                          type="button"
                          onClick={handleSendInitiatorOtp}
                          disabled={!initiatorEmail || !initiatorName || !initiatorPhone || !initiatorDesignation || !initiatorSignatureB64 || initiatorOtpLoading}
                          className={`font-bold px-6 py-3 rounded-xl text-xs uppercase transition-all whitespace-nowrap ${
                            initiatorEmail && initiatorName && initiatorPhone && initiatorDesignation && initiatorSignatureB64 && !initiatorOtpLoading
                              ? "bg-black text-white hover:bg-black/90 shadow-md cursor-pointer"
                              : "bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed"
                          }`}
                        >
                          {initiatorOtpLoading ? "Sending OTP..." : "Send OTP ➔"}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="123456"
                            value={initiatorOtpCode}
                            onChange={(e) => setInitiatorOtpCode(e.target.value.replace(/\D/g, ""))}
                            className="input-field text-center font-mono font-bold tracking-widest text-sm py-2 max-w-[120px]"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyInitiatorOtp}
                            disabled={initiatorOtpLoading || !initiatorOtpCode}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase shadow transition-all whitespace-nowrap"
                          >
                            {initiatorOtpLoading ? "Verifying..." : "Verify OTP & Save Contract"}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                      <span>✓</span>
                      <span>Initiator identity verified &amp; contract saved! You may copy the sharing link above.</span>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/60 bg-white/70 backdrop-blur-md py-4 text-center text-xs text-gray-500 font-semibold z-10">
        © {new Date().getFullYear()} {company.name}. Safe &amp; Bilateral Legal Agreements.
      </footer>

      {/* Signature Pad Modal for Initiator */}
      <SignaturePadModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onConfirm={handleSaveSignature}
        loading={loading}
      />
    </div>
  );
}
