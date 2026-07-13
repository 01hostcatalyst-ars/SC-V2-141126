"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/layout/ProtectedRoute";
import { useToast } from "@/components/ui/Toast";
import { formatLegalDate, formatUsageLicenseText } from "@/lib/utils";

interface Deliverable {
  type: string;
  quantity: number;
  duration?: string;
  notes?: string;
}

const STEPS = [
  { id: 0, title: "Deliverables & Brief", icon: "📦" },
  { id: 1, title: "Usage Rights & Scope", icon: "🛡️" },
  { id: 2, title: "Financials & Payment", icon: "💳" },
  { id: 3, title: "Delivery & Exclusivity", icon: "⏱️" },
  { id: 4, title: "Safeguards & NDA", icon: "⚖️" },
  { id: 5, title: "Confirm & Submit", icon: "📝" },
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

  // Authority & NTN Registration fields
  const [initiatorDesignation, setInitiatorDesignation] = useState("");
  const [initiatorNtn, setInitiatorNtn] = useState("");
  const [respondentNtn, setRespondentNtn] = useState("");

  const [deliverables, setDeliverables] = useState<Deliverable[]>([
    { type: "REEL", quantity: 1, duration: "", notes: "" },
  ]);
  const [platformsAllowed, setPlatformsAllowed] = useState<string[]>(["Instagram"]);
  const [usageType, setUsageType] = useState<string[]>(["ORGANIC_ONLY"]);
  const [usageRightsDuration, setUsageRightsDuration] = useState("6 months");
  const [totalAmount, setTotalAmount] = useState("");
  const [advancePayment, setAdvancePayment] = useState("");
  const [advancePaymentDate, setAdvancePaymentDate] = useState("");
  const [remainingPaymentDate, setRemainingPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_IBAN");
  const [bankAccountIban, setBankAccountIban] = useState("");
  const [mobileWalletNumber, setMobileWalletNumber] = useState("");
  const [deliveryTimeframeDays, setDeliveryTimeframeDays] = useState("");
  const [revisionRounds, setRevisionRounds] = useState(1);
  const [brandApprovalRequired, setBrandApprovalRequired] = useState(false);
  const [exclusivityClause, setExclusivityClause] = useState(false);
  const [exclusivityDuration, setExclusivityDuration] = useState("");
  const [exclusivityCompetitors, setExclusivityCompetitors] = useState("");
  const [confidentialityRequired, setConfidentialityRequired] = useState(false);
  const [embargoDate, setEmbargoDate] = useState("");
  const [earlyDisclosurePenalty, setEarlyDisclosurePenalty] = useState("");

  // Bilateral Safeguards & Penalty Caps
  const [latePaymentPenaltyPct, setLatePaymentPenaltyPct] = useState("3");
  const [lateContentPenaltyPct, setLateContentPenaltyPct] = useState("3");
  const [penaltyCapPct, setPenaltyCapPct] = useState("20");
  const [unauthorizedUsagePenaltyPct, setUnauthorizedUsagePenaltyPct] = useState("50");
  const [advanceRefundable, setAdvanceRefundable] = useState(true);
  const [advanceRefundTimeframeDays, setAdvanceRefundTimeframeDays] = useState("7");
  const [nonDeliveryCutoffDays, setNonDeliveryCutoffDays] = useState("7");
  const [cancellationFeePct, setCancellationFeePct] = useState("25");

  const [contentOwnership, setContentOwnership] = useState(
    "Creator retains copyright; brand receives usage license as defined."
  );
  const [taggingRequirements, setTaggingRequirements] = useState("");
  const [collabProduct, setCollabProduct] = useState("");
  const [collabProductProvisionType, setCollabProductProvisionType] = useState("Product Provision");
  const [collabDeliveryAddress, setCollabDeliveryAddress] = useState("");
  const [collabDeliveryDate, setCollabDeliveryDate] = useState("");

  // Product Loan return terms
  const [collabProductReturnDays, setCollabProductReturnDays] = useState("7");
  const [collabProductReturnAddress, setCollabProductReturnAddress] = useState("");
  const [collabProductReturnShippingBy, setCollabProductReturnShippingBy] = useState("Brand");
  const [collabProductNonReturnFee, setCollabProductNonReturnFee] = useState("");

  // Load parent contracts for agency linking
  useEffect(() => {
    if (user?.role === "AGENCY") {
      const loadAgencyDeals = async () => {
        try {
          const res = await fetch("/api/contracts");
          const data = await res.json();
          if (res.ok) {
            const brandDeals = (data.contracts || []).filter(
              (c: any) => c.contractType === "AGENCY_TO_BRAND" && c.status !== "CANCELLED"
            );
            setAgencyContracts(brandDeals);
          }
        } catch (err) {
          console.error("Failed to load agency contracts:", err);
        }
      };
      loadAgencyDeals();
    }
  }, [user]);

  // Adjust defaults when role is changed
  useEffect(() => {
    if (user?.role) {
      const type = user.role === "BRAND"
        ? "BRAND_TO_CREATOR"
        : user.role === "AGENCY"
        ? "AGENCY_TO_BRAND"
        : "CREATOR_TO_BRAND";
      setContractType(type);
    }
  }, [user]);

  const handleAddDeliverable = () => {
    setDeliverables([...deliverables, { type: "REEL", quantity: 1, duration: "", notes: "" }]);
  };

  const handleRemoveDeliverable = (index: number) => {
    if (deliverables.length === 1) return;
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleDeliverableChange = (index: number, field: keyof Deliverable, value: any) => {
    const updated = [...deliverables];
    updated[index] = { ...updated[index], [field]: value };
    setDeliverables(updated);
  };

  const handlePlatformToggle = (platform: string) => {
    if (platformsAllowed.includes(platform)) {
      if (platformsAllowed.length === 1) return;
      setPlatformsAllowed(platformsAllowed.filter((p) => p !== platform));
    } else {
      setPlatformsAllowed([...platformsAllowed, platform]);
    }
  };

  const handleUsageTypeToggle = (type: string) => {
    if (usageType.includes(type)) {
      if (usageType.length === 1) return;
      setUsageType(usageType.filter((t) => t !== type));
    } else {
      setUsageType([...usageType, type]);
    }
  };

  const validateStep = () => {
    if (step === 0) {
      for (const d of deliverables) {
        if (!d.type || d.quantity <= 0) {
          showToast("Please ensure all deliverables have valid types and quantities.", "error");
          return false;
        }
      }
    }
    if (step === 2) {
      if (!totalAmount || isNaN(Number(totalAmount)) || Number(totalAmount) <= 0) {
        showToast("Please enter a valid total campaign amount.", "error");
        return false;
      }
      if (advancePayment && (isNaN(Number(advancePayment)) || Number(advancePayment) < 0 || Number(advancePayment) > Number(totalAmount))) {
        showToast("Advance payment must be less than or equal to the total amount.", "error");
        return false;
      }
      if (paymentMethod === "BANK_IBAN" && !bankAccountIban) {
        showToast("Please specify bank IBAN account for payout route.", "error");
        return false;
      }
      if (paymentMethod !== "BANK_IBAN" && !mobileWalletNumber) {
        showToast("Please specify mobile wallet account number.", "error");
        return false;
      }
    }
    if (step === 3) {
      if (!deliveryTimeframeDays || isNaN(Number(deliveryTimeframeDays)) || Number(deliveryTimeframeDays) <= 0) {
        showToast("Please enter a valid delivery timeframe in days.", "error");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => setStep((prev) => Math.max(0, prev - 1));

  const handleCreate = async () => {
    setLoading(true);
    const payload = {
      contractType,
      linkedContractId: contractType === "AGENCY_TO_CREATOR" ? linkedContractId || undefined : undefined,
      brandName: contractType === "AGENCY_TO_CREATOR" ? brandName || undefined : undefined,
      brandHandle: contractType === "AGENCY_TO_CREATOR" ? brandHandle || undefined : undefined,
      campaignName: contractType === "AGENCY_TO_CREATOR" ? campaignName || undefined : undefined,
      creatorName: contractType === "AGENCY_TO_BRAND" ? creatorName || undefined : undefined,
      creatorHandle: contractType === "AGENCY_TO_BRAND" ? creatorHandle || undefined : undefined,
      initiatorDesignation: initiatorDesignation || undefined,
      initiatorNtn: initiatorNtn || undefined,
      respondentNtn: respondentNtn || undefined,
      collabProduct: collabProduct || undefined,
      collabProductProvisionType: collabProductProvisionType || undefined,
      collabDeliveryAddress: collabDeliveryAddress || undefined,
      collabDeliveryDate: collabDeliveryDate || undefined,
      collabProductReturnDays: collabProductProvisionType === "Product Loan" && collabProductReturnDays ? Number(collabProductReturnDays) : undefined,
      collabProductReturnAddress: collabProductProvisionType === "Product Loan" ? collabProductReturnAddress || undefined : undefined,
      collabProductReturnShippingBy: collabProductProvisionType === "Product Loan" ? collabProductReturnShippingBy || undefined : undefined,
      collabProductNonReturnFee: collabProductProvisionType === "Product Loan" && collabProductNonReturnFee ? Number(collabProductNonReturnFee) : undefined,
      totalAmount: Number(totalAmount),
      advancePayment: advancePayment ? Number(advancePayment) : undefined,
      paymentMethod,
      bankAccountIban: paymentMethod === "BANK_IBAN" ? bankAccountIban : undefined,
      mobileWalletNumber: paymentMethod !== "BANK_IBAN" ? mobileWalletNumber : undefined,
      deliveryTimeframeDays: Number(deliveryTimeframeDays),
      platformsAllowed,
      usageType,
      usageRightsDuration,
      advancePaymentDate: advancePayment ? advancePaymentDate || undefined : undefined,
      remainingPaymentDate: remainingPaymentDate || undefined,
      revisionRounds: Number(revisionRounds),
      brandApprovalRequired,
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

  return (
    <div className="space-y-8 text-left max-w-3xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-black">Draft Agreement</h1>
        <p className="text-xs text-gray-500 mt-1">Specify campaign terms and generate bilateral agreement link under ETO 2002 rules.</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Campaign Name</label>
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

          {contractType === "AGENCY_TO_BRAND" && (
            <div className="border-t border-gray-100 pt-4 mt-3 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">Creator Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Creator Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    className="input-field"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Creator Handle</label>
                  <input
                    type="text"
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

      {/* Stepper Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {STEPS.map((s) => {
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => isDone && setStep(s.id)}
                disabled={!isDone && !isActive}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive
                    ? "bg-black text-white border-black shadow"
                    : isDone
                    ? "bg-gray-50 text-black border-gray-200 hover:bg-gray-100"
                    : "bg-white text-gray-300 border-gray-100 cursor-not-allowed"
                }`}
              >
                <span className="text-lg">{s.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-center line-clamp-1">{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stepper Content Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        
        {step === 0 && (
          /* Step 1: Deliverables & Party Authority */
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-black">Campaign Deliverables &amp; Signing Authority</h3>
              <p className="text-xs text-gray-500 mt-0.5">Specify content formats and party registration details.</p>
            </div>

            {/* Authority & NTN Inputs */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-black block">Party A Authority &amp; Tax Registration</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Your Job Title / Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Managing Director / Partner"
                    className="input-field"
                    value={initiatorDesignation}
                    onChange={(e) => setInitiatorDesignation(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Your NTN / Reg No (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1234567-8"
                    className="input-field"
                    value={initiatorNtn}
                    onChange={(e) => setInitiatorNtn(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Deliverables List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-black">Required Content Deliverables</label>
                <button
                  type="button"
                  onClick={handleAddDeliverable}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  + Add Deliverable
                </button>
              </div>

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
                        <option value="REEL">Instagram Reel</option>
                        <option value="STORY">Instagram Story</option>
                        <option value="IMAGE_POST">Instagram Image Post</option>
                        <option value="CAROUSEL_POST">Instagram Carousel</option>
                        <option value="YOUTUBE_VIDEO">YouTube Video</option>
                        <option value="TIKTOK_VIDEO">TikTok Video</option>
                        <option value="LIVE_SESSION">Live Stream</option>
                        <option value="AD">Paid Video Ad</option>
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
                      <label className="text-[10px] font-bold uppercase text-gray-400">Retention / Post Duration</label>
                      <input
                        type="text"
                        placeholder="e.g. 30 Days / Permanent"
                        className="input-field"
                        value={d.duration || ""}
                        onChange={(e) => handleDeliverableChange(index, "duration", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Instructions / Creative Brief</label>
                    <input
                      type="text"
                      placeholder="e.g. Must feature product in first 3 seconds with unboxing audio"
                      className="input-field"
                      value={d.notes || ""}
                      onChange={(e) => handleDeliverableChange(index, "notes", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          /* Step 2: Usage Rights & Scope */
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-black">Usage Rights &amp; Licensing Scope</h3>
              <p className="text-xs text-gray-500 mt-0.5">Specify allowed platforms and additive commercial usage tiers.</p>
            </div>

            {/* Platforms Allowed */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-black block">Permitted Platforms</label>
              <div className="flex flex-wrap gap-2">
                {["Instagram", "TikTok", "YouTube", "Facebook", "LinkedIn", "X"].map((platform) => {
                  const isSelected = platformsAllowed.includes(platform);
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => handlePlatformToggle(platform)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? "bg-black text-white border-black shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {platform} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Usage Type Categories (Refactored non-contradictory additive options) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-black block">Granted Commercial License Scope</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "ORGANIC_ONLY", label: "Organic Social Rights", desc: "Native organic posting on creator/brand channels" },
                  { id: "PAID_AD", label: "Paid Ads & Dark Posting License", desc: "Digital ad boosting & Meta/TikTok whitelisting" },
                  { id: "BILLBOARD_PRINT", label: "Physical Print & Outdoor License", desc: "Billboards, print media & in-store collateral" },
                  { id: "ALL_MEDIA", label: "Full Commercial Broadcast License", desc: "TV, streaming, radio & all commercial media" },
                ].map((type) => {
                  const isSelected = usageType.includes(type.id);
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleUsageTypeToggle(type.id)}
                      className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between gap-1 ${
                        isSelected
                          ? "bg-blue-50/50 border-blue-600 text-black shadow-sm"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="font-bold text-xs flex items-center justify-between">
                        {type.label} {isSelected && <span className="text-blue-600 font-black">✓</span>}
                      </span>
                      <span className="text-[10px] text-gray-500">{type.desc}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-400 italic mt-1">
                Note: License types are additive. Selecting Organic Social Rights + Paid Ads grants organic posting plus digital ad whitelisting cleanly without statement contradiction.
              </p>
            </div>

            {/* Usage Duration */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-black">Rights Duration</label>
              <select
                className="input-field"
                value={usageRightsDuration}
                onChange={(e) => setUsageRightsDuration(e.target.value)}
              >
                <option value="30 days">30 Days</option>
                <option value="3 months">3 Months</option>
                <option value="6 months">6 Months</option>
                <option value="1 year">1 Year</option>
                <option value="Permanent">Perpetual / Permanent</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          /* Step 3: Financials & Payment Route */
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-black">Financial Compensation &amp; Payment Route</h3>
              <p className="text-xs text-gray-500 mt-0.5">Define total valuation, advance payment, and payout account.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-black">Total Campaign Amount (PKR) *</label>
                <input
                  type="number"
                  placeholder="e.g. 150000"
                  className="input-field text-lg font-bold"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-black">Advance Payment (PKR)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000 (Optional)"
                  className="input-field text-lg font-bold"
                  value={advancePayment}
                  onChange={(e) => setAdvancePayment(e.target.value)}
                />
              </div>
            </div>

            {advancePayment && Number(advancePayment) > 0 && (
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-black block">Payout Route Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "BANK_IBAN", label: "Bank Transfer (IBAN)" },
                  { id: "JAZZCASH", label: "JazzCash Mobile" },
                  { id: "EASYPAISA", label: "EasyPaisa Mobile" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      paymentMethod === m.id
                        ? "bg-black text-white border-black shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {paymentMethod === "BANK_IBAN" ? (
                <div className="flex flex-col gap-1 mt-2">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Bank Account IBAN *</label>
                  <input
                    type="text"
                    placeholder="PK36MEZN0001000123456789"
                    className="input-field font-mono"
                    value={bankAccountIban}
                    onChange={(e) => setBankAccountIban(e.target.value)}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1 mt-2">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Mobile Wallet Account Number *</label>
                  <input
                    type="text"
                    placeholder="03001234567"
                    className="input-field font-mono"
                    value={mobileWalletNumber}
                    onChange={(e) => setMobileWalletNumber(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          /* Step 4: Delivery, Product & Exclusivity */
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-black">Delivery Terms, Product Shipment &amp; Exclusivity</h3>
              <p className="text-xs text-gray-500 mt-0.5">Set delivery deadlines, 48-hour pre-approval sequencing, product return terms, and exclusivity.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-black">Delivery Timeframe (Days) *</label>
                <input
                  type="number"
                  placeholder="e.g. 7"
                  className="input-field"
                  value={deliveryTimeframeDays}
                  onChange={(e) => setDeliveryTimeframeDays(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-black">Revision Rounds Included</label>
                <input
                  type="number"
                  min={1}
                  className="input-field"
                  value={revisionRounds}
                  onChange={(e) => setRevisionRounds(parseInt(e.target.value) || 1)}
                />
              </div>
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
                  ⚡ <strong>48-Hour Deemed Approval Protocol:</strong> Draft content must be submitted to Brand at least 3 business days prior to delivery deadline. Brand must respond within 48 hours. Failure by Brand to respond within 48 hours legally constitutes <strong>Deemed Approval</strong>, authorizing final posting.
                </p>
              )}
            </div>

            {/* Product Shipment & Product Loan Return Terms */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-black">Collaboration Product Shipment</label>
                <select
                  className="text-xs font-bold bg-white border border-gray-200 p-1.5 rounded-lg"
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
                  <label className="text-[10px] font-bold uppercase text-gray-400">Shipment Address</label>
                  <input
                    type="text"
                    placeholder="Delivery Address"
                    className="input-field"
                    value={collabDeliveryAddress}
                    onChange={(e) => setCollabDeliveryAddress(e.target.value)}
                  />
                </div>
              </div>

              {collabProductProvisionType === "Product Loan" && (
                <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 space-y-3 mt-2">
                  <span className="text-[10px] font-bold uppercase text-amber-800 block">🔒 Product Loan Return Conditions</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-500">Return Deadline (Days post-deliverable)</label>
                      <input
                        type="number"
                        placeholder="7"
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
                        <option value="Brand">Client Brand</option>
                        <option value="Creator">Creator / Agency</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-500">Non-Return / Damage Fee (PKR)</label>
                      <input
                        type="number"
                        placeholder="e.g. 350000"
                        className="input-field"
                        value={collabProductNonReturnFee}
                        onChange={(e) => setCollabProductNonReturnFee(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500">Return Shipping Address</label>
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
                    <label className="text-[10px] font-bold uppercase text-gray-400">Early Disclosure Leak Fine (PKR)</label>
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

            {/* Bilateral Safeguard Penalties */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-black block">Bilateral Safeguard Penalties &amp; Caps</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Late Payment Fee (%/day)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={latePaymentPenaltyPct}
                    onChange={(e) => setLatePaymentPenaltyPct(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Late Delivery Fee (%/day)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={lateContentPenaltyPct}
                    onChange={(e) => setLateContentPenaltyPct(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Maximum Penalty Cap (%)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={penaltyCapPct}
                    onChange={(e) => setPenaltyCapPct(e.target.value)}
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
                Note: At 3%/day, late fees accumulate up to the {penaltyCapPct}% cap (reached at Day {nonDeliveryCutoffDays}). Delivery delayed beyond {nonDeliveryCutoffDays} calendar days post-deadline legally constitutes Non-Delivery, stopping daily fees and triggering 100% advance refundability with zero enforcement gap.
              </p>
            </div>

            {/* Copyright & Tagging */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-gray-400">Tagging &amp; Caption Requirements</label>
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
          /* Step 6: Confirmation Review */
          <div className="space-y-6 text-left">
            <h3 className="text-lg font-black text-black border-b border-gray-100 pb-2">Review All Campaign Terms</h3>
            
            {/* 1. Campaign & Parties */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col gap-2 text-xs">
              <span className="text-gray-400 font-bold uppercase tracking-wider block">1. Campaign Direction, Parties &amp; Authority</span>
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
                {initiatorDesignation && (
                  <div>
                    <span className="font-semibold text-gray-500 block">Party A Authority Title:</span>
                    <span className="font-bold text-black">{initiatorDesignation}</span>
                  </div>
                )}
                {initiatorNtn && (
                  <div>
                    <span className="font-semibold text-gray-500 block">Party A NTN / Reg No:</span>
                    <span className="font-bold text-black">{initiatorNtn}</span>
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
                  <span className="font-bold text-black text-sm">PKR {Number(totalAmount).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-500 block">Advance Payment:</span>
                  <span className="font-bold text-black">{advancePayment ? `PKR ${Number(advancePayment).toLocaleString()}` : "No Advance"}</span>
                  {advancePaymentDate && <span className="text-[10px] text-gray-500 block">Due: {formatLegalDate(advancePaymentDate)}</span>}
                </div>
                <div>
                  <span className="font-semibold text-gray-500 block">Remaining Balance:</span>
                  <span className="font-bold text-black">PKR {(Number(totalAmount) - (Number(advancePayment) || 0)).toLocaleString()}</span>
                  {remainingPaymentDate && <span className="text-[10px] text-gray-500 block">Due: {formatLegalDate(remainingPaymentDate)}</span>}
                </div>
                <div>
                  <span className="font-semibold text-gray-500 block">Payout Route Method:</span>
                  <span className="font-bold text-black uppercase">{paymentMethod.replace(/_/g, " ")}</span>
                  <span className="text-[10px] text-gray-500 block font-mono truncate">{paymentMethod === "BANK_IBAN" ? bankAccountIban : mobileWalletNumber}</span>
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
                  <span className="font-bold text-black">{deliveryTimeframeDays} Days post-execution</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Revision Rounds:</span>
                  <span className="font-bold text-black">{revisionRounds} Rounds</span>
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
                      <span className="font-bold text-black">{embargoDate ? formatLegalDate(embargoDate) : "Required until launch"}</span>
                    </div>
                    {earlyDisclosurePenalty && (
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-500">Early Disclosure Leak Fine:</span>
                        <span className="font-bold text-black">PKR {Number(earlyDisclosurePenalty).toLocaleString()}</span>
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
                    <span className="font-bold text-black">{collabDeliveryDate ? formatLegalDate(collabDeliveryDate) : "Not Specified"}</span>
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
                    {collabProductNonReturnFee && <div>• Non-Return / Damage Penalty Fee: PKR {Number(collabProductNonReturnFee).toLocaleString()}</div>}
                  </div>
                )}
              </div>
            )}

            {/* 7. Dispute Resolution (ADR) Clause Notice */}
            <div className="p-4 rounded-xl border border-gray-200 bg-blue-50/50 flex flex-col gap-1 text-xs">
              <span className="text-blue-900 font-bold uppercase tracking-wider block">8. Governing Law &amp; Dispute Resolution</span>
              <p className="text-[11px] text-blue-950 leading-relaxed">
                Governed by the laws of Pakistan. Disputes proceed to 14 days of good-faith negotiation. If unresolved: (a) Claims &le; PKR 500,000 proceed to summary court determination; (b) Claims &gt; PKR 500,000 proceed to binding arbitration under the <strong>Arbitration Act 1940 of Pakistan</strong>.
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
                    <th className="py-2 text-center">Retention Duration</th>
                    <th className="py-2">Instructions / Brief</th>
                  </tr>
                </thead>
                <tbody>
                  {deliverables.map((d, i) => (
                    <tr key={i} className="border-b border-gray-50 text-black">
                      <td className="py-2 font-bold">{d.type.replace(/_/g, " ")}</td>
                      <td className="py-2 font-bold text-center">{d.quantity}</td>
                      <td className="py-2 text-gray-500 font-semibold text-center">{d.duration || "Permanent"}</td>
                      <td className="py-2 text-gray-500 max-w-xs">{d.notes || "No notes"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 leading-relaxed font-semibold">
              ⚖️ Once submitted, this generates a unique shared agreement link. The counterparty must verify their email via OTP before signing first.
            </div>
          </div>
        )}

        {/* Stepper Buttons */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0 || loading}
            className={`font-bold text-xs uppercase px-5 py-2.5 rounded-xl border transition-all ${
              step === 0 
                ? "border-gray-200 text-gray-300 cursor-not-allowed" 
                : "border-gray-300 text-black hover:bg-gray-50"
            }`}
          >
            Back
          </button>
          
          {step === STEPS.length - 1 ? (
            <button
              type="button"
              disabled={loading}
              onClick={handleCreate}
              className="bg-black text-white hover:bg-black/90 font-bold text-xs uppercase px-8 py-3 rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              {loading ? "Drafting..." : "Submit Draft ➔"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="bg-black text-white hover:bg-black/90 font-bold text-xs uppercase px-8 py-3 rounded-xl transition-all shadow-md"
            >
              Next Step
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
