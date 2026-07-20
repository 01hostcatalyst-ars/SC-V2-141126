"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/layout/ProtectedRoute";
import { useToast } from "@/components/ui/Toast";
import { formatLegalDate, formatUsageLicenseText, formatDeliverableTypeName } from "@/lib/utils";
import { JURISDICTIONS, getJurisdiction } from "@/lib/config/jurisdictions";
import { CURRENCY_MAP, formatCurrencyAmount } from "@/lib/currency";


interface DeliverableItem {
  type: string;
  quantity: number;
  duration: string;
  notes: string;
}

const STEPS = [
  { id: 0, title: "Deliverables" },
  { id: 1, title: "Usage Rights" },
  { id: 2, title: "Financials" },
  { id: 3, title: "Delivery" },
  { id: 4, title: "Safeguards" },
  { id: 5, title: "Confirm" },
];

export default function NewContractPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [agencyContracts, setAgencyContracts] = useState<any[]>([]);

  // Default contract type based on logged-in user role
  const getDefaultContractType = () => {
    if (user?.role === "BRAND") return "BRAND_TO_CREATOR";
    if (user?.role === "AGENCY") return "AGENCY_TO_BRAND";
    return "CREATOR_TO_BRAND";
  };

  // State mapping database schema fields
  const [contractType, setContractType] = useState(getDefaultContractType());
  const [linkedContractId, setLinkedContractId] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandHandle, setBrandHandle] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [creatorHandle, setCreatorHandle] = useState("");

  // Signing authority fields
  const [initiatorDesignation, setInitiatorDesignation] = useState("");
  const [initiatorNtn, setInitiatorNtn] = useState("");
  const [initiatorCnic, setInitiatorCnic] = useState("");
  const [initiatorCompanyName, setInitiatorCompanyName] = useState(user?.agencyName || "");
  const [initiatorCompanyAddress, setInitiatorCompanyAddress] = useState(user?.agencyAddress || "");

  // Party A Initiator OTP Verification State
  const [initiatorOtpDispatched, setInitiatorOtpDispatched] = useState(false);
  const [initiatorOtpVerified, setInitiatorOtpVerified] = useState(false);
  const [initiatorOtpCode, setInitiatorOtpCode] = useState("");
  const [initiatorOtpLoading, setInitiatorOtpLoading] = useState(false);
  const [initiatorResendTimer, setInitiatorResendTimer] = useState(0);

  // Financial
  const [jurisdictionCountryCode, setJurisdictionCountryCode] = useState("US");
  const [currency, setCurrency] = useState("USD");
  const [taxTreatment, setTaxTreatment] = useState("INCLUSIVE");
  const [taxRatePct, setTaxRatePct] = useState("0");
  const [initiatorTaxIdType, setInitiatorTaxIdType] = useState("");
  const [initiatorTaxId, setInitiatorTaxId] = useState("");
  const [initiatorNationalId, setInitiatorNationalId] = useState("");
  const [paymentRoutingDetails, setPaymentRoutingDetails] = useState<any>({});
  const [totalAmount, setTotalAmount] = useState("");
  const [advancePayment, setAdvancePayment] = useState("");
  const [advancePaymentDate, setAdvancePaymentDate] = useState("");
  const [remainingPaymentDate, setRemainingPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_IBAN");
  const [bankAccountIban, setBankAccountIban] = useState("");
  const [mobileWalletNumber, setMobileWalletNumber] = useState("");

  // Delivery & Revisions
  const [deliveryTimeframeDays, setDeliveryTimeframeDays] = useState("10");
  const [revisionRounds, setRevisionRounds] = useState(1);
  const [revisionTurnaroundDays, setRevisionTurnaroundDays] = useState("5");
  const [brandApprovalRequired, setBrandApprovalRequired] = useState(true);

  // Product Provision / Shipment
  const [collabProduct, setCollabProduct] = useState("");
  const [collabProductProvisionType, setCollabProductProvisionType] = useState("Product Provision");
  const [collabDeliveryAddress, setCollabDeliveryAddress] = useState("");
  const [collabDeliveryDate, setCollabDeliveryDate] = useState("");
  const [collabProductReturnDays, setCollabProductReturnDays] = useState("7");
  const [collabProductReturnAddress, setCollabProductReturnAddress] = useState("");
  const [collabProductReturnShippingBy, setCollabProductReturnShippingBy] = useState("Brand");
  const [collabProductNonReturnFee, setCollabProductNonReturnFee] = useState("");

  // Usage Rights
  const [platformsAllowed, setPlatformsAllowed] = useState<string[]>(["INSTAGRAM"]);
  const [usageType, setUsageType] = useState<string[]>(["ORGANIC_ONLY"]);
  const [usageRightsDuration, setUsageRightsDuration] = useState("30 Days");

  // Exclusivity & NDA
  const [exclusivityClause, setExclusivityClause] = useState(false);
  const [exclusivityDuration, setExclusivityDuration] = useState("30 Days");
  const [exclusivityCompetitors, setExclusivityCompetitors] = useState("");
  const [confidentialityRequired, setConfidentialityRequired] = useState(false);
  const [embargoDate, setEmbargoDate] = useState("");
  const [earlyDisclosurePenalty, setEarlyDisclosurePenalty] = useState("");

  // Bilateral Safeguard Penalties (Default min/max constrained)
  const [latePaymentPenaltyPct, setLatePaymentPenaltyPct] = useState("1");
  const [lateContentPenaltyPct, setLateContentPenaltyPct] = useState("1");
  const [penaltyCapPct, setPenaltyCapPct] = useState("20");
  const [unauthorizedUsagePenaltyPct, setUnauthorizedUsagePenaltyPct] = useState("50");
  const [advanceRefundable, setAdvanceRefundable] = useState(true);
  const [advanceRefundTimeframeDays, setAdvanceRefundTimeframeDays] = useState("7");
  const [nonDeliveryCutoffDays, setNonDeliveryCutoffDays] = useState("7");
  const [cancellationFeePct, setCancellationFeePct] = useState("25");

  // Guidelines & Ownership
  const [taggingRequirements, setTaggingRequirements] = useState("");
  const [contentOwnership, setContentOwnership] = useState(
    "Creator retains underlying IP copyright. Brand receives licensed commercial usage rights as specified herein."
  );

  // Deliverables List State
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>([
    { type: "REEL", quantity: 1, duration: "Permanent", notes: "" },
  ]);

  // Resend timer countdown
  useEffect(() => {
    let timer: any;
    if (initiatorResendTimer > 0) {
      timer = setInterval(() => setInitiatorResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [initiatorResendTimer]);

  // Smooth scroll to top when changing wizard steps
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // Fetch Agency deals for linking
  useEffect(() => {
    if (user?.role === "AGENCY") {
      fetch("/api/contracts")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.contracts)) {
            setAgencyContracts(data.contracts.filter((c: any) => c.contractType === "AGENCY_TO_BRAND"));
          }
        })
        .catch(() => {});
    }
  }, [user]);

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

  const togglePlatform = (platform: string) => {
    if (platformsAllowed.includes(platform)) {
      if (platformsAllowed.length === 1) return;
      setPlatformsAllowed(platformsAllowed.filter((p) => p !== platform));
    } else {
      setPlatformsAllowed([...platformsAllowed, platform]);
    }
  };

  const toggleUsageType = (typeKey: string) => {
    if (usageType.includes(typeKey)) {
      if (usageType.length === 1) return;
      setUsageType(usageType.filter((t) => t !== typeKey));
    } else {
      setUsageType([...usageType, typeKey]);
    }
  };

  const handleSendInitiatorOTP = async () => {
    if (!initiatorDesignation.trim()) {
      showToast("Please enter your Job Title / Signing Capacity first.", "error");
      return;
    }

    setInitiatorOtpLoading(true);
    try {
      const res = await fetch("/api/contracts/initiator-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          designation: initiatorDesignation,
          ntn: initiatorNtn,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setInitiatorOtpDispatched(true);
        setInitiatorResendTimer(60);
        showToast(data.message || `Verification code sent to ${user?.email}`, "success");
      } else {
        showToast(data.error || "Failed to send verification code.", "error");
      }
    } catch (err) {
      showToast("Error sending verification code.", "error");
    } finally {
      setInitiatorOtpLoading(false);
    }
  };

  const handleVerifyInitiatorOTP = async () => {
    if (!initiatorOtpCode || initiatorOtpCode.length !== 6) {
      showToast("Please enter the 6-digit OTP code sent to your email.", "error");
      return;
    }

    setInitiatorOtpLoading(true);
    try {
      const res = await fetch("/api/contracts/initiator-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          code: initiatorOtpCode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setInitiatorOtpVerified(true);
        showToast("Email identity verified! You may now publish & generate shared link.", "success");
      } else {
        showToast(data.error || "Invalid or expired OTP code.", "error");
      }
    } catch (err) {
      showToast("Error verifying identity code.", "error");
    } finally {
      setInitiatorOtpLoading(false);
    }
  };

  const validateStep = () => {
    if (step === 0) {
      if (contractType === "AGENCY_TO_BRAND" || contractType === "BRAND_TO_CREATOR") {
        if (!creatorName.trim() || !creatorHandle.trim()) {
          showToast("Creator Name and Creator Handle are required.", "error");
          return false;
        }
      }
      if (contractType === "BRAND_TO_AGENCY") {
        if (!creatorName.trim() || !creatorHandle.trim()) {
          showToast("Creator Name and Creator Handle are required.", "error");
          return false;
        }
      }
      if (contractType === "AGENCY_TO_CREATOR") {
        if (!brandName.trim()) {
          showToast("Brand Name is required for Agency to Creator deals.", "error");
          return false;
        }
      }
      if (contractType === "CREATOR_TO_BRAND") {
        if (!brandName.trim() || !brandHandle.trim()) {
          showToast("Brand Name and Brand Handle are required.", "error");
          return false;
        }
      }
      if (contractType === "CREATOR_TO_AGENCY") {
        if (!brandName.trim()) {
          showToast("Brand Name is required.", "error");
          return false;
        }
      }
      if (!deliverables || deliverables.length === 0) {
        showToast("At least one deliverable is required.", "error");
        return false;
      }
    }
    if (step === 1) {
      if (platformsAllowed.length === 0 || usageType.length === 0) {
        showToast("Select at least one platform and usage license tier.", "error");
        return false;
      }
    }
    if (step === 2) {
      if (!totalAmount || Number(totalAmount) <= 0) {
        showToast("Total campaign valuation is required.", "error");
        return false;
      }
      if (advancePayment && Number(advancePayment) > Number(totalAmount)) {
        showToast("Advance payment cannot exceed total campaign valuation.", "error");
        return false;
      }
    }
    if (step === 3) {
      if (!deliveryTimeframeDays || Number(deliveryTimeframeDays) <= 0) {
        showToast("Please enter a valid delivery timeframe.", "error");
        return false;
      }
      if (!revisionTurnaroundDays || Number(revisionTurnaroundDays) <= 0) {
        showToast("Please enter a valid revision turnaround window.", "error");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmitContract = async () => {
    if (!validateStep()) return;

    setLoading(true);
    const payload = {
      contractType,
      jurisdictionCountryCode,
      currency,
      taxTreatment,
      taxRatePct: Number(taxRatePct || 0),
      initiatorTaxIdType: initiatorTaxIdType || undefined,
      initiatorTaxId: initiatorTaxId || initiatorNtn || undefined,
      initiatorNationalId: initiatorNationalId || initiatorCnic || undefined,
      paymentRoutingDetails: paymentMethod === "BANK_IBAN"
        ? { iban: bankAccountIban }
        : { mobileWalletNumber },
      linkedContractId: contractType === "AGENCY_TO_CREATOR" && linkedContractId && linkedContractId.trim() !== "" ? linkedContractId : undefined,
      brandName: ["AGENCY_TO_CREATOR", "CREATOR_TO_BRAND", "CREATOR_TO_AGENCY"].includes(contractType) ? brandName : undefined,
      brandHandle: ["AGENCY_TO_CREATOR", "CREATOR_TO_BRAND", "CREATOR_TO_AGENCY"].includes(contractType) ? brandHandle : undefined,
      campaignName: ["AGENCY_TO_CREATOR", "CREATOR_TO_AGENCY", "BRAND_TO_AGENCY"].includes(contractType) ? campaignName : undefined,
      creatorName: ["AGENCY_TO_BRAND", "BRAND_TO_CREATOR", "BRAND_TO_AGENCY"].includes(contractType) ? creatorName : undefined,
      creatorHandle: ["AGENCY_TO_BRAND", "BRAND_TO_CREATOR", "BRAND_TO_AGENCY"].includes(contractType) ? creatorHandle : undefined,
      initiatorDesignation: initiatorDesignation || undefined,
      initiatorNtn: initiatorNtn || undefined,
      initiatorCnic: initiatorCnic || undefined,
      initiatorCompanyName: initiatorCompanyName || undefined,
      initiatorCompanyAddress: initiatorCompanyAddress || undefined,
      collabProduct: collabProduct || undefined,
      collabProductProvisionType,
      collabDeliveryAddress: collabDeliveryAddress || undefined,
      collabDeliveryDate: collabDeliveryDate || undefined,
      collabProductReturnDays: collabProductProvisionType === "Product Loan" ? Number(collabProductReturnDays) || 7 : undefined,
      collabProductReturnAddress: collabProductProvisionType === "Product Loan" ? collabProductReturnAddress || undefined : undefined,
      collabProductReturnShippingBy: collabProductProvisionType === "Product Loan" ? collabProductReturnShippingBy || undefined : undefined,
      collabProductNonReturnFee: collabProductProvisionType === "Product Loan" && collabProductNonReturnFee ? Number(collabProductNonReturnFee) : undefined,
      totalAmount: Number(totalAmount),
      advancePayment: advancePayment ? Number(advancePayment) : undefined,
      paymentMethod,
      bankAccountIban: paymentMethod === "BANK_IBAN" ? bankAccountIban : undefined,
      mobileWalletNumber: paymentMethod !== "BANK_IBAN" ? mobileWalletNumber : undefined,
      deliveryTimeframeDays: Number(deliveryTimeframeDays),
      revisionRounds: Number(revisionRounds),
      revisionTurnaroundDays: Number(revisionTurnaroundDays),
      brandApprovalRequired,
      platformsAllowed,
      usageType,
      usageRightsDuration,
      advancePaymentDate: advancePayment ? advancePaymentDate || undefined : undefined,
      remainingPaymentDate: remainingPaymentDate || undefined,
      exclusivityClause,
      exclusivityDuration: exclusivityClause ? exclusivityDuration : undefined,
      exclusivityCompetitors: exclusivityClause ? exclusivityCompetitors : undefined,
      confidentialityRequired,
      embargoDate: confidentialityRequired && embargoDate ? embargoDate : undefined,
      earlyDisclosurePenalty: confidentialityRequired && earlyDisclosurePenalty ? Number(earlyDisclosurePenalty) : undefined,
      latePaymentPenaltyPct: Number(latePaymentPenaltyPct),
      lateContentPenaltyPct: Number(lateContentPenaltyPct),
      penaltyCapPct: Number(penaltyCapPct),
      unauthorizedUsagePenaltyPct: Number(unauthorizedUsagePenaltyPct),
      advanceRefundable,
      advanceRefundTimeframeDays: Number(advanceRefundTimeframeDays),
      nonDeliveryCutoffDays: Number(nonDeliveryCutoffDays),
      cancellationFeePct: Number(cancellationFeePct),
      contentOwnership,
      taggingRequirements,
      deliverables,
    };

    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Agreement draft created successfully!", "success");
        window.location.href = `/contracts/${data.contract.id}`;
      } else {
        showToast(data.error || "Failed to create agreement draft.", "error");
      }
    } catch (err) {
      showToast("Error creating agreement draft.", "error");
    } finally {
      setLoading(false);
    }
  };

  const jur = getJurisdiction(jurisdictionCountryCode);

  return (
    <div className="space-y-8 text-left max-w-3xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-black">Draft Agreement</h1>
        <p className="text-xs text-gray-500 mt-1">Specify campaign terms and generate bilateral agreement link under {jur.lawAbbreviation} rules.</p>
      </div>


      {/* Contract direction settings for Agencies */}
      {user?.role === "AGENCY" && step === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-black block">Campaign Direction</label>
          <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setContractType("AGENCY_TO_BRAND")}
              className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                contractType === "AGENCY_TO_BRAND" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
              }`}
            >
              Agency ➔ Brand
            </button>
            <button
              type="button"
              onClick={() => setContractType("AGENCY_TO_CREATOR")}
              className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                contractType === "AGENCY_TO_CREATOR" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
              }`}
            >
              Agency ➔ Creator
            </button>
          </div>

          {contractType === "AGENCY_TO_CREATOR" && agencyContracts.length > 0 && (
            <div className="flex flex-col gap-1 mt-3 border-t border-gray-100 pt-3">
              <label className="text-xs font-bold uppercase tracking-wider text-black">Link to Brand Campaign (Optional)</label>
              <select
                className="input-field mt-1"
                value={linkedContractId}
                onChange={(e) => setLinkedContractId(e.target.value)}
              >
                <option value="">No Linked Campaign</option>
                {agencyContracts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.contractNumber} (Brand Deal)
                  </option>
                ))}
              </select>
            </div>
          )}

          {contractType === "AGENCY_TO_CREATOR" && (
            <div className="border-t border-gray-100 pt-4 mt-3 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">Client Brand Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Samsung"
                    className="input-field"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Brand IG / Website</label>
                  <input
                    type="text"
                    placeholder="e.g. @samsungpk"
                    className="input-field"
                    value={brandHandle}
                    onChange={(e) => setBrandHandle(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {contractType === "AGENCY_TO_BRAND" && (
            <div className="border-t border-gray-100 pt-4 mt-3 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">Target Creator Details <span className="text-rose-500">*</span></h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Creator Full Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    className="input-field"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Creator Handle / Username <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. @janedoe"
                    className="input-field"
                    value={creatorHandle}
                    onChange={(e) => setCreatorHandle(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contract direction settings for Brands */}
      {user?.role === "BRAND" && step === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-black block">Campaign Direction</label>
          <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setContractType("BRAND_TO_CREATOR")}
              className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                contractType === "BRAND_TO_CREATOR" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
              }`}
            >
              Brand ➔ Creator
            </button>
            <button
              type="button"
              onClick={() => setContractType("BRAND_TO_AGENCY")}
              className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                contractType === "BRAND_TO_AGENCY" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
              }`}
            >
              Brand ➔ Agency
            </button>
          </div>

          {(contractType === "BRAND_TO_CREATOR" || contractType === "BRAND_TO_AGENCY") && (
            <div className="border-t border-gray-100 pt-4 mt-3 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">Target Creator Details <span className="text-rose-500">*</span></h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Creator Full Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    className="input-field"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Creator Handle / Username <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. @janedoe"
                    className="input-field"
                    value={creatorHandle}
                    onChange={(e) => setCreatorHandle(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contract direction settings for Creators */}
      {user?.role === "CREATOR" && step === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-black block">Campaign Direction</label>
          <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setContractType("CREATOR_TO_BRAND")}
              className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                contractType === "CREATOR_TO_BRAND" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
              }`}
            >
              Creator ➔ Brand
            </button>
            <button
              type="button"
              onClick={() => setContractType("CREATOR_TO_AGENCY")}
              className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                contractType === "CREATOR_TO_AGENCY" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
              }`}
            >
              Creator ➔ Agency
            </button>
          </div>

          {contractType === "CREATOR_TO_BRAND" && (
            <div className="border-t border-gray-100 pt-4 mt-3 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">Target Brand Details <span className="text-rose-500">*</span></h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Brand Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samsung Pakistan"
                    className="input-field"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Brand Handle / Website <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. @samsungpk"
                    className="input-field"
                    value={brandHandle}
                    onChange={(e) => setBrandHandle(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {contractType === "CREATOR_TO_AGENCY" && (
            <div className="border-t border-gray-100 pt-4 mt-3 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">Client Brand Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Brand Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Samsung"
                    className="input-field"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Brand IG / Website</label>
                  <input
                    type="text"
                    placeholder="e.g. @samsungpk"
                    className="input-field"
                    value={brandHandle}
                    onChange={(e) => setBrandHandle(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Campaign Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Galaxy S27 Launch"
                    className="input-field"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stepper Header Bar (Unified Tab Style, Horizontal Scroll on Mobile) */}
      <div className="bg-gray-100/80 border border-gray-200/80 rounded-2xl p-1.5 shadow-sm">
        <div className="flex overflow-x-auto no-scrollbar sm:grid sm:grid-cols-6 gap-1 pb-1 sm:pb-0">
          {STEPS.map((s) => {
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => (isDone || isActive) && setStep(s.id)}
                disabled={!isDone && !isActive}
                className={`py-3 px-3 sm:px-2 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap flex-shrink-0 sm:flex-shrink ${
                  isActive
                    ? "bg-black text-white shadow-md"
                    : isDone
                    ? "bg-white text-black hover:bg-gray-50 border border-gray-200/60 cursor-pointer"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                {s.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        {step === 0 && (
          /* Step 1: Deliverables */
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-black">Campaign Deliverables</h3>
              <p className="text-xs text-gray-500 mt-0.5">Specify required content formats, quantities, and retention requirements.</p>
            </div>

            {/* Deliverables List */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-black block">Required Content Deliverables</label>

              {deliverables.map((d, index) => (
                <div key={index} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3 relative">
                  {deliverables.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverable(index)}
                      className="absolute top-3 right-3 text-rose-500 font-bold text-xs hover:underline"
                    >
                      Remove
                    </button>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-gray-400">Platform Format</label>
                      <select
                        className="input-field"
                        value={d.type}
                        onChange={(e) => handleDeliverableChange(index, "type", e.target.value)}
                      >
                        <option value="REEL">Reel</option>
                        <option value="STORY">Story</option>
                        <option value="IMAGE_POST">Post</option>
                        <option value="CAROUSEL_POST">Carousel</option>
                        <option value="YOUTUBE_VIDEO">Video</option>
                        <option value="TIKTOK_VIDEO">Short Video</option>
                        <option value="LIVE_SESSION">Live Stream</option>
                        <option value="AD">Paid Ad</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-gray-400">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        className="input-field"
                        value={d.quantity}
                        onChange={(e) => handleDeliverableChange(index, "quantity", parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-gray-400">Stay Published</label>
                      <select
                        className="input-field"
                        value={d.duration || "1 Month"}
                        onChange={(e) => handleDeliverableChange(index, "duration", e.target.value)}
                      >
                        <option value="1 Day">1 Day</option>
                        <option value="1 Week">1 Week</option>
                        <option value="1 Month">1 Month</option>
                        <option value="2 Months">2 Months</option>
                        <option value="3 Months">3 Months</option>
                        <option value="6 Months">6 Months</option>
                        <option value="1 Year">1 Year</option>
                        <option value="Permanent">Permanent</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Instructions / Creative Brief</label>
                    <input
                      type="text"
                      placeholder="e.g. Show product packaging in first 3 seconds, tag official brand handle"
                      className="input-field"
                      value={d.notes || ""}
                      onChange={(e) => handleDeliverableChange(index, "notes", e.target.value)}
                    />
                  </div>
                </div>
              ))}

              {/* Add Deliverable Button (Moved below row, matching form styling) */}
              <button
                type="button"
                onClick={handleAddDeliverable}
                className="w-full py-3 rounded-xl border border-dashed border-gray-300 hover:border-black bg-white hover:bg-gray-50 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                + Add Deliverable
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          /* Step 2: Usage Rights */
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-black">Usage Rights &amp; Commercial Scope</h3>
              <p className="text-xs text-gray-500 mt-0.5">Define allowed social platforms, additive commercial license tiers, and rights duration.</p>
            </div>

            {/* Platforms Allowed */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-black block">Permitted Platforms</label>
              <div className="flex flex-wrap gap-2">
                {["INSTAGRAM", "TIKTOK", "YOUTUBE", "FACEBOOK", "LINKEDIN", "X_TWITTER"].map((platform) => {
                  const isSelected = platformsAllowed.includes(platform);
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        isSelected
                          ? "bg-black text-white border-black shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {platform === "X_TWITTER" ? "X (TWITTER)" : platform}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Granted License Category */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-black block">Granted Commercial License Tiers</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { key: "ORGANIC_ONLY", label: "Organic Social Rights", desc: "Organic posting on creator profile/feed" },
                  { key: "PAID_AD", label: "Paid Ads & Dark Posting", desc: "Digital paid ads & whitelisting license" },
                  { key: "BILLBOARD_PRINT", label: "Physical Print & Outdoor", desc: "Billboards, print ads & packaging" },
                  { key: "ALL_MEDIA", label: "Full Commercial Broadcast", desc: "Global TV, digital, print & all media" },
                ].map((u) => {
                  const isSelected = usageType.includes(u.key);
                  return (
                    <button
                      key={u.key}
                      type="button"
                      onClick={() => toggleUsageType(u.key)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-black text-white border-black shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <div className="text-xs font-black uppercase">{u.label}</div>
                      <div className={`text-[10px] mt-0.5 ${isSelected ? "text-gray-300" : "text-gray-500"}`}>{u.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* License Duration */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-black">Commercial License Duration</label>
              <input
                type="text"
                placeholder="e.g. 30 Days / 6 Months / Perpetuity"
                className="input-field"
                value={usageRightsDuration}
                onChange={(e) => setUsageRightsDuration(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          /* Step 3: Financials & Payment */
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-black">Financial Compensation &amp; Payout Route</h3>
              <p className="text-xs text-gray-500 mt-0.5">Specify campaign fees, advance payment, and payout account details.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-gray-100">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-gray-500">Jurisdiction *</label>
                <select
                  value={jurisdictionCountryCode}
                  onChange={(e) => {
                    setJurisdictionCountryCode(e.target.value);
                    const selectedJur = getJurisdiction(e.target.value);
                    setCurrency(selectedJur.defaultCurrency);
                  }}
                  className="input-field text-xs font-semibold"
                >
                  {Object.values(JURISDICTIONS).map((j) => (
                    <option key={j.countryCode} value={j.countryCode}>
                      {j.countryName} ({j.lawAbbreviation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-gray-500">Currency *</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="input-field text-xs font-semibold"
                >
                  {Object.keys(CURRENCY_MAP).map((code) => (
                    <option key={code} value={code}>
                      {code} ({CURRENCY_MAP[code].symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-gray-500">Tax Treatment *</label>
                <select
                  value={taxTreatment}
                  onChange={(e) => setTaxTreatment(e.target.value)}
                  className="input-field text-xs"
                >
                  <option value="INCLUSIVE">Tax Inclusive</option>
                  <option value="EXCLUSIVE">Tax Exclusive</option>
                  <option value="REVERSE_CHARGE">Reverse Charge</option>
                  <option value="EXEMPT">Tax Exempt</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-gray-500">Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRatePct}
                  onChange={(e) => setTaxRatePct(e.target.value)}
                  placeholder="e.g. 18"
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-black">Total Campaign Valuation ({currency}) *</label>
                <input
                  type="number"
                  placeholder="e.g. 150000"
                  className="input-field font-bold text-black"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-black">Advance Payment ({currency})</label>
                <input
                  type="number"
                  placeholder="e.g. 50000 (Optional)"
                  className="input-field"
                  value={advancePayment}
                  onChange={(e) => setAdvancePayment(e.target.value)}
                />
              </div>
            </div>

            {advancePayment && Number(advancePayment) > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Advance Payment Due Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={advancePaymentDate}
                    onChange={(e) => setAdvancePaymentDate(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Remaining Balance Payout Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={remainingPaymentDate}
                    onChange={(e) => setRemainingPaymentDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Payment Method & Account */}
            {contractType === "AGENCY_TO_CREATOR" || contractType === "BRAND_TO_CREATOR" ? (
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70 text-xs text-blue-950 leading-relaxed font-semibold">
                • <strong>Payout Route Notice:</strong> For Creator sponsorship deals, payout route selection and account details will be entered directly by the Creator on their recipient signing link under local {jur.countryName} guidelines.
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-black block">Payout Route Method ({jur.countryName})</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(jur.allowedPaymentMethods || ["BANK_IBAN", "WIRE_TRANSFER", "PAYPAL"]).map((methodId) => {
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
                        key={methodId}
                        type="button"
                        onClick={() => setPaymentMethod(methodId)}
                        className={`py-2.5 px-3 rounded-lg text-xs font-bold border transition-all text-center ${
                          paymentMethod === methodId
                            ? "bg-black text-white border-black shadow-sm"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {labelMap[methodId] || methodId.replace(/_/g, " ")}
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === "BANK_IBAN" || paymentMethod === "SEPA" || paymentMethod === "WIRE_TRANSFER" || paymentMethod === "ACH_ROUTING" ? (
                  <div className="flex flex-col gap-1 mt-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500">
                      {paymentMethod === "ACH_ROUTING" ? "Routing Number & Account Number" : paymentMethod === "SEPA" ? "IBAN & BIC/SWIFT" : "Bank Account / IBAN"}
                    </label>
                    <input
                      type="text"
                      placeholder={paymentMethod === "ACH_ROUTING" ? "Routing: 123456789 | Account: 987654321" : "Enter your IBAN or Account details"}
                      className="input-field font-mono"
                      value={bankAccountIban}
                      onChange={(e) => setBankAccountIban(e.target.value)}
                    />
                  </div>
                ) : paymentMethod === "PAYPAL" ? (
                  <div className="flex flex-col gap-1 mt-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500">PayPal Email Address</label>
                    <input
                      type="email"
                      placeholder="paypal@example.com"
                      className="input-field font-mono"
                      value={bankAccountIban}
                      onChange={(e) => setBankAccountIban(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 mt-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Mobile Account / Tag</label>
                    <input
                      type="text"
                      placeholder={jur.phonePlaceholder}
                      className="input-field font-mono"
                      value={mobileWalletNumber}
                      onChange={(e) => setMobileWalletNumber(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {step === 3 && (
          /* Step 4: Delivery, Product Shipment & Exclusivity */
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-black">Delivery Terms, Product Shipment &amp; Exclusivity</h3>
              <p className="text-xs text-gray-500 mt-0.5">Define draft delivery turnaround rules, product return conditions, and exclusivity periods.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-black">Delivery Timeframe (Days) *</label>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 10"
                  className="input-field"
                  value={deliveryTimeframeDays}
                  onChange={(e) => setDeliveryTimeframeDays(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-black">Revision Rounds Included *</label>
                <input
                  type="number"
                  min={1}
                  className="input-field"
                  value={revisionRounds}
                  onChange={(e) => setRevisionRounds(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-black">Revision Turnaround (Days) *</label>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 5"
                  className="input-field"
                  value={revisionTurnaroundDays}
                  onChange={(e) => setRevisionTurnaroundDays(e.target.value)}
                />
              </div>
            </div>

            {/* Delivery Timeframe & Revision Rules Explanation */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 leading-relaxed space-y-1.5">
              <p>• <strong>Delivery Start Trigger:</strong> Delivery timeframe ({deliveryTimeframeDays} days) starts post receipt of physical product (if product is sent by brand) or post advance payment receipt (if no product loan/shipment), counted as Round 1.</p>
              <p>• <strong>Revision Delivery Protocol:</strong> If draft revisions are requested and revision rounds remain ({revisionRounds} rounds), each revised draft must be delivered within {revisionTurnaroundDays} days per round.</p>
              <p>• <strong>NDA Embargo Publishing Rule:</strong> Content will not be published prior to an active NDA Embargo Launch Threshold Date regardless of draft pre-approval.</p>
            </div>

            {/* Pre-Approval Toggle & Deemed Approval Note */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={brandApprovalRequired}
                  onChange={(e) => setBrandApprovalRequired(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-xs font-bold text-black uppercase tracking-wider">Content Pre-Approval Required</span>
              </label>
              {brandApprovalRequired && (
                <p className="text-[10px] text-gray-500 leading-relaxed bg-white p-2.5 rounded border border-gray-200">
                  <strong>48-Hour Deemed Approval Protocol:</strong> Draft content must be submitted to Brand at least 3 business days prior to delivery deadline. Brand must respond within 48 hours. Failure by Brand to respond within 48 hours legally constitutes <strong>Deemed Approval</strong>, authorizing final posting.
                </p>
              )}
            </div>

            {/* Product Shipment & Product Loan Return Terms */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-black">Collaboration Product Shipment</label>
                <select
                  className="text-xs font-bold bg-white border border-gray-200 p-2 rounded-lg w-full sm:w-auto"
                  value={collabProductProvisionType}
                  onChange={(e) => setCollabProductProvisionType(e.target.value)}
                >
                  <option value="Product Provision">Product Provision (Gifted / Retained)</option>
                  <option value="Product Loan">Product Loan (Must Be Returned)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Product Name / Model</label>
                  <input
                    type="text"
                    placeholder="e.g. Samsung Galaxy S27 Ultra"
                    className="input-field"
                    value={collabProduct}
                    onChange={(e) => setCollabProduct(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Expected Arrival Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={collabDeliveryDate}
                    onChange={(e) => setCollabDeliveryDate(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Delivery Shipment Address</label>
                  <input
                    type="text"
                    placeholder="Address where product should be sent"
                    className="input-field"
                    value={collabDeliveryAddress}
                    onChange={(e) => setCollabDeliveryAddress(e.target.value)}
                  />
                </div>
              </div>

              {collabProductProvisionType === "Product Loan" && (
                <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 space-y-3 mt-2">
                  <span className="text-[10px] font-bold uppercase text-amber-800 block">Product Loan Return Conditions</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-500">Return Deadline (Days post-deliverable)</label>
                      <input
                        type="number"
                        min={1}
                        className="input-field"
                        value={collabProductReturnDays}
                        onChange={(e) => setCollabProductReturnDays(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-500">Return Shipping Paid By</label>
                      <select
                        className="input-field"
                        value={collabProductReturnShippingBy}
                        onChange={(e) => setCollabProductReturnShippingBy(e.target.value)}
                      >
                        <option value="Brand">Brand</option>
                        <option value="Creator">Creator / Agency</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-500">Non-Return / Damage Fee (PKR)</label>
                      <input
                        type="number"
                        placeholder="e.g. 250000"
                        className="input-field"
                        value={collabProductNonReturnFee}
                        onChange={(e) => setCollabProductNonReturnFee(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Return Address</label>
                    <input
                      type="text"
                      placeholder="Address where loaned product must be returned"
                      className="input-field"
                      value={collabProductReturnAddress}
                      onChange={(e) => setCollabProductReturnAddress(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Exclusivity */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exclusivityClause}
                  onChange={(e) => setExclusivityClause(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-xs font-bold text-black uppercase tracking-wider">Exclusivity Restrictive Clause</span>
              </label>

              {exclusivityClause && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Exclusivity Duration (Commences on 1st Post Date)</label>
                    <input
                      type="text"
                      placeholder="e.g. 30 Days post-campaign"
                      className="input-field"
                      value={exclusivityDuration}
                      onChange={(e) => setExclusivityDuration(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Restricted Competitors / Categories</label>
                    <input
                      type="text"
                      placeholder="e.g. Apple, Google, Xiaomi, Vivo"
                      className="input-field"
                      value={exclusivityCompetitors}
                      onChange={(e) => setExclusivityCompetitors(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          /* Step 5: Safeguards, NDA & Penalties */
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-black">Confidentiality (NDA) &amp; Bilateral Safeguard Penalties</h3>
              <p className="text-xs text-gray-500 mt-0.5">Set pre-launch product embargo dates, penalty caps, and 7-day non-delivery cutoff rules.</p>
            </div>

            {/* Confidentiality / NDA */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confidentialityRequired}
                  onChange={(e) => setConfidentialityRequired(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-xs font-bold text-black uppercase tracking-wider">Pre-Launch Confidentiality / Product NDA</span>
              </label>

              {confidentialityRequired && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Embargo Launch Threshold Date</label>
                    <input
                      type="date"
                      className="input-field"
                      value={embargoDate}
                      onChange={(e) => setEmbargoDate(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Early Disclosure Penalty Amount</label>

                    <input
                      type="number"
                      placeholder="e.g. 200000"
                      className="input-field"
                      value={earlyDisclosurePenalty}
                      onChange={(e) => setEarlyDisclosurePenalty(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bilateral Safeguard Penalties (Min/Max Controls) */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-black block">Bilateral Safeguard Penalties &amp; Caps</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Late Payment Penalty (%/d)</label>
                  <select
                    className="input-field font-bold text-xs"
                    value={latePaymentPenaltyPct}
                    onChange={(e) => setLatePaymentPenaltyPct(e.target.value)}
                  >
                    <option value="0">0%</option>
                    <option value="0.5">0.5%</option>
                    <option value="1">1%</option>
                    <option value="2">2%</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Late Content Penalty (%/d)</label>
                  <select
                    className="input-field font-bold text-xs"
                    value={lateContentPenaltyPct}
                    onChange={(e) => setLateContentPenaltyPct(e.target.value)}
                  >
                    <option value="0">0%</option>
                    <option value="0.5">0.5%</option>
                    <option value="1">1%</option>
                    <option value="2">2%</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Maximum Penalty Cap (%) (0% - 20%)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    className="input-field"
                    value={penaltyCapPct}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (isNaN(val)) setPenaltyCapPct("");
                      else setPenaltyCapPct(Math.min(20, Math.max(0, val)).toString());
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-gray-200 pt-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Unauthorized Re-Use Fee (% total)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={unauthorizedUsagePenaltyPct}
                    onChange={(e) => setUnauthorizedUsagePenaltyPct(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Non-Delivery Cutoff (Days)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={nonDeliveryCutoffDays}
                    onChange={(e) => setNonDeliveryCutoffDays(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Pre-Delivery Cancellation Fee (%)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={cancellationFeePct}
                    onChange={(e) => setCancellationFeePct(e.target.value)}
                  />
                </div>
              </div>

              <p className="text-[10px] text-gray-500 leading-relaxed italic">
                Note: Daily late fees (%/day) accumulate up to the maximum {penaltyCapPct}% cap. Delivery delayed beyond {nonDeliveryCutoffDays} calendar days post-deadline legally constitutes Non-Delivery, stopping daily fees and triggering 100% advance refundability with zero enforcement gap.
              </p>
            </div>

            {/* Tagging & Copyright Ownership */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-black block">Tagging Guidelines &amp; Content Copyright</span>
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-gray-400">Caption &amp; Tagging Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Must tag @brand, use hashtag #Ad #BrandBridge"
                  className="input-field"
                  value={taggingRequirements}
                  onChange={(e) => setTaggingRequirements(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-gray-400">Content Ownership &amp; Copyright Clause</label>
                <input
                  type="text"
                  className="input-field"
                  value={contentOwnership}
                  onChange={(e) => setContentOwnership(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          /* Step 6: Confirmation Review & Party A Signing Authority */
          <div className="space-y-6 text-left">
            <h3 className="text-lg font-black text-black border-b border-gray-100 pb-2">Review &amp; Execute Agreement Details</h3>
            
            {/* 1. Campaign & Parties */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col gap-2 text-xs">
              <span className="text-gray-400 font-bold uppercase tracking-wider block">1. Campaign Direction &amp; Assigned Parties</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <span className="font-semibold text-gray-500 block">Direction:</span>
                  <span className="font-bold text-black uppercase">{contractType.replace(/_/g, " ")}</span>
                </div>
                {brandName && (
                  <div>
                    <span className="font-semibold text-gray-500 block">Client Brand:</span>
                    <span className="font-bold text-black">{brandName} {brandHandle ? `(${brandHandle})` : ""}</span>
                    {campaignName && <span className="text-[10px] text-gray-500 block">Campaign: {campaignName}</span>}
                  </div>
                )}
                {creatorName && (
                  <div>
                    <span className="font-semibold text-gray-500 block">Target Creator:</span>
                    <span className="font-bold text-black">{creatorName} {creatorHandle ? `(${creatorHandle})` : ""}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Financial & Payment Route */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col gap-2 text-xs">
              <span className="text-gray-400 font-bold uppercase tracking-wider block">2. Financial Compensation &amp; Payout Route</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <span className="font-semibold text-gray-500 block">Total Campaign Value:</span>
                  <span className="font-bold text-black text-sm">{formatCurrencyAmount(totalAmount, currency)}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-500 block">Advance Payment:</span>
                  <span className="font-bold text-black">{advancePayment ? formatCurrencyAmount(advancePayment, currency) : "No Advance"}</span>
                  {advancePaymentDate && <span className="text-[10px] text-gray-500 block">Due: {formatLegalDate(advancePaymentDate, jurisdictionCountryCode)}</span>}
                </div>
                <div>
                  <span className="font-semibold text-gray-500 block">Remaining Balance:</span>
                  <span className="font-bold text-black">{formatCurrencyAmount(Number(totalAmount) - (Number(advancePayment) || 0), currency)}</span>
                  {remainingPaymentDate && <span className="text-[10px] text-gray-500 block">Due: {formatLegalDate(remainingPaymentDate, jurisdictionCountryCode)}</span>}
                </div>
                <div>
                  <span className="font-semibold text-gray-500 block">Payout Route Method:</span>
                  <span className="font-bold text-black uppercase">{paymentMethod.replace(/_/g, " ")}</span>
                  <span className="text-[10px] text-gray-500 block font-mono truncate">{bankAccountIban || mobileWalletNumber || "Account on file"}</span>
                </div>
              </div>
            </div>

            {/* 3. Usage Rights & Scope */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col gap-2 text-xs">
              <span className="text-gray-400 font-bold uppercase tracking-wider block">3. Usage Rights &amp; Platform Scope</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="font-semibold text-gray-500 block">Platforms Allowed:</span>
                  <span className="font-bold text-black uppercase">{platformsAllowed.join(", ")}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-500 block">Granted License:</span>
                  <span className="font-bold text-black">{formatUsageLicenseText(usageType)}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-500 block">Rights Duration:</span>
                  <span className="font-bold text-black">{usageRightsDuration}</span>
                </div>
              </div>
            </div>

            {/* 4. Delivery, Exclusivity & NDA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col gap-2">
                <span className="text-gray-400 font-bold uppercase tracking-wider block">4. Delivery Terms &amp; Exclusivity</span>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Delivery Deadline:</span>
                  <span className="font-bold text-black">{deliveryTimeframeDays} Days (post product/advance)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Revision Rounds:</span>
                  <span className="font-bold text-black">{revisionRounds} Rounds ({revisionTurnaroundDays} days/round)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Pre-Approval Protocol:</span>
                  <span className="font-bold text-black">{brandApprovalRequired ? "Required (48-hr Deemed Approval)" : "Not Required"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Exclusivity Clause:</span>
                  <span className="font-bold text-black">{exclusivityClause ? (exclusivityDuration ? `Active (${exclusivityDuration})` : "Active") : "No"}</span>
                </div>
                {exclusivityClause && exclusivityCompetitors && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">Restricted Competitors:</span>
                    <span className="font-bold text-black truncate max-w-[180px]" title={exclusivityCompetitors}>{exclusivityCompetitors}</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col gap-2">
                <span className="text-gray-400 font-bold uppercase tracking-wider block">5. Confidentiality / Pre-Launch NDA</span>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">NDA Status:</span>
                  <span className="font-bold text-black">{confidentialityRequired ? "Strict NDA Active" : "Standard Confidentiality"}</span>
                </div>
                {confidentialityRequired && (
                  <>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-500">Embargo Launch Date:</span>
                      <span className="font-bold text-black">{embargoDate ? formatLegalDate(embargoDate, jurisdictionCountryCode) : "Required until launch"}</span>
                    </div>
                    {earlyDisclosurePenalty && (
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-500">Early Disclosure Leak Fine:</span>
                        <span className="font-bold text-black">{formatCurrencyAmount(earlyDisclosurePenalty, currency)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 5. Bilateral Safeguard Penalties */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col gap-2 text-xs">
              <span className="text-gray-400 font-bold uppercase tracking-wider block">6. Bilateral Safeguard Penalties &amp; Caps</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <span className="font-semibold text-gray-500 block">Late Payment / Delivery:</span>
                  <span className="font-bold text-black">{latePaymentPenaltyPct}% / {lateContentPenaltyPct}% per day (Capped at {penaltyCapPct}%)</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-500 block">Unauthorized Brand Usage:</span>
                  <span className="font-bold text-black">{unauthorizedUsagePenaltyPct}% of contract fee</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-500 block">Advance Refundability:</span>
                  <span className="font-bold text-black">{advanceRefundable ? `Yes (${advanceRefundTimeframeDays} days)` : "No"}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-500 block">Non-Delivery Cutoff:</span>
                  <span className="font-bold text-black">{nonDeliveryCutoffDays} Days post-deadline</span>
                </div>
              </div>
            </div>

            {/* 6. Product Shipment Details */}
            {collabProduct && (
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col gap-2 text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-wider block">7. Collaboration Product Shipment &amp; Return Terms</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="font-semibold text-gray-500 block">Product:</span>
                    <span className="font-bold text-black">{collabProduct} ({collabProductProvisionType})</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500 block">Expected Arrival:</span>
                    <span className="font-bold text-black">{collabDeliveryDate ? formatLegalDate(collabDeliveryDate, jurisdictionCountryCode) : "Not Specified"}</span>
                  </div>
                  {collabDeliveryAddress && (
                    <div>
                      <span className="font-semibold text-gray-500 block">Delivery Address:</span>
                      <span className="font-bold text-black block">{collabDeliveryAddress}</span>
                    </div>
                  )}
                </div>
                {collabProductProvisionType === "Product Loan" && (
                  <div className="mt-2 pt-2 border-t border-gray-200 text-[11px] text-amber-900 font-semibold space-y-1">
                    <div>• Return Deadline: Within {collabProductReturnDays} days post-campaign.</div>
                    <div>• Return Shipping Payer: {collabProductReturnShippingBy}</div>
                    {collabProductNonReturnFee && <div>• Non-Return / Damage Penalty Fee: {formatCurrencyAmount(collabProductNonReturnFee, currency)}</div>}
                  </div>
                )}
              </div>
            )}

            {/* 7. Dispute Resolution (ADR) Clause Notice */}
            <div className="p-4 rounded-xl border border-gray-200 bg-blue-50/50 flex flex-col gap-1 text-xs">
              <span className="text-blue-900 font-bold uppercase tracking-wider block">8. Governing Law &amp; Dispute Resolution</span>
              <p className="text-[11px] text-blue-950 leading-relaxed">
                {jur.disputeClause} Legal recourse and dispute determination shall be administered under the <strong>{jur.arbitrationAct}</strong>.
              </p>
            </div>

            {/* 8. Deliverables Table */}
            <div className="p-4 rounded-xl border border-gray-200 bg-white">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">9. Deliverables List &amp; Requirements</span>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 font-bold">
                    <th className="py-2">Platform Format</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-center">Stay Published</th>
                    <th className="py-2">Instructions / Brief</th>
                  </tr>
                </thead>
                <tbody>
                  {deliverables.map((d, i) => (
                    <tr key={i} className="border-b border-gray-50 text-black">
                      <td className="py-2 font-bold">{formatDeliverableTypeName(d.type)}</td>
                      <td className="py-2 font-bold text-center">{d.quantity}</td>
                      <td className="py-2 text-gray-500 font-semibold text-center">{d.duration || "Permanent"}</td>
                      <td className="py-2 text-gray-500 max-w-xs">{d.notes || "No notes"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed font-semibold">
              Saving this agreement will store it in your dashboard as a <strong>DRAFT</strong>. You can view, edit, or publish it and verify your identity via OTP when ready to share with the counterparty.
            </div>
          </div>
        )}

        {/* Stepper Buttons */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 0}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase transition-all ${
              step === 0 ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            Previous
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="bg-black text-white hover:bg-black/90 font-bold px-8 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Continue ➔
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitContract}
              disabled={loading}
              className="bg-black text-white hover:bg-black/90 font-bold px-8 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
            >
              {loading ? "Saving Draft..." : "Save Agreement Draft ➔"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
