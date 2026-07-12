"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/ProtectedRoute";
import { useToast } from "@/components/ui/Toast";

interface Deliverable {
  type: string;
  quantity: number;
  duration: string;
  notes: string;
}

const STEPS = ["Deliverables", "Rights", "Financial", "Delivery", "Penalties", "Confirm"];

const DELIVERABLE_TYPES = [
  { label: "Image Post", value: "IMAGE_POST" },
  { label: "Reel", value: "REEL" },
  { label: "Story", value: "STORY" },
  { label: "Carousel Post", value: "CAROUSEL_POST" },
  { label: "Live Session", value: "LIVE_SESSION" },
  { label: "Paid Ad Setup", value: "AD" },
  { label: "YouTube Video", value: "YOUTUBE_VIDEO" },
  { label: "TikTok Video", value: "TIKTOK_VIDEO" },
];

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Facebook", "LinkedIn", "X"];

const USAGE_CATEGORIES = [
  { label: "Organic Social Post Only", value: "ORGANIC_ONLY" },
  { label: "Paid Advertising Whitelisting", value: "PAID_AD" },
  { label: "Print / Billboard Rights", value: "BILLBOARD_PRINT" },
  { label: "All Media Broadcast License", value: "ALL_MEDIA" },
];

export default function NewContractPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [agencyContracts, setAgencyContracts] = useState<{ id: string; contractNumber: string }[]>([]);

  // Setup default contract type dynamically based on user role
  const getDefaultContractType = () => {
    if (user?.role === "BRAND") return "BRAND_TO_CREATOR";
    if (user?.role === "AGENCY") return "AGENCY_TO_BRAND"; // Default agency selection
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
  const [latePaymentPenaltyPct, setLatePaymentPenaltyPct] = useState("3");
  const [lateContentPenaltyPct, setLateContentPenaltyPct] = useState("3");
  const [unauthorizedUsagePenaltyPct, setUnauthorizedUsagePenaltyPct] = useState("50");
  const [advanceRefundable, setAdvanceRefundable] = useState(true);
  const [advanceRefundTimeframeDays, setAdvanceRefundTimeframeDays] = useState("7");
  const [cancellationFeePct, setCancellationFeePct] = useState("25");
  const [contentOwnership, setContentOwnership] = useState(
    "Creator retains copyright; brand receives usage license as defined."
  );
  const [taggingRequirements, setTaggingRequirements] = useState("");
  const [collabProduct, setCollabProduct] = useState("");
  const [collabProductProvisionType, setCollabProductProvisionType] = useState("Product Provision");
  const [collabDeliveryAddress, setCollabDeliveryAddress] = useState("");
  const [collabDeliveryDate, setCollabDeliveryDate] = useState("");

  // Load parent contracts for agency linking
  useEffect(() => {
    if (user?.role === "AGENCY") {
      const loadAgencyDeals = async () => {
        try {
          const res = await fetch("/api/contracts");
          const data = await res.json();
          if (res.ok) {
            // Filter only Agency -> Brand contracts to display as parent campaigns
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

  // Adjust defaults when role is changed (Only agency role can toggle contract direction)
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
      if (platformsAllowed.length === 1) return; // Keep at least one platform selected
      setPlatformsAllowed(platformsAllowed.filter((p) => p !== platform));
    } else {
      setPlatformsAllowed([...platformsAllowed, platform]);
    }
  };

  const handleUsageTypeToggle = (type: string) => {
    if (usageType.includes(type)) {
      if (usageType.length === 1) return; // Keep at least one selected
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
        showToast("Please enter bank IBAN details.", "error");
        return false;
      }
      if (paymentMethod !== "BANK_IBAN" && !mobileWalletNumber) {
        showToast("Please enter mobile wallet account number.", "error");
        return false;
      }
    }
    if (step === 3) {
      if (!deliveryTimeframeDays || isNaN(Number(deliveryTimeframeDays)) || Number(deliveryTimeframeDays) <= 0) {
        showToast("Please specify delivery timeframe in days.", "error");
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
      collabProduct: collabProduct || undefined,
      collabProductProvisionType: collabProductProvisionType || undefined,
      collabDeliveryAddress: collabDeliveryAddress || undefined,
      collabDeliveryDate: collabDeliveryDate || undefined,
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
      unauthorizedUsagePenaltyPct: Number(unauthorizedUsagePenaltyPct),
      advanceRefundable,
      advanceRefundTimeframeDays: Number(advanceRefundTimeframeDays),
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
      if (!res.ok) {
        throw new Error(data.error || "Failed to create contract.");
      }

      showToast("Agreement Draft Generated Successfully!", "success");
      router.push(`/contracts/${data.contract.id}`);
    } catch (err: any) {
      showToast(err.message || "Failed to save agreement.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-left max-w-3xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-black">Draft Agreement</h1>
        <p className="text-xs text-gray-500 mt-1">Specify campaign terms and generate bilateral agreement link.</p>
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

      {/* Mobile Stepper Helper */}
      <div className="flex flex-col gap-2 md:hidden bg-white border border-gray-200 rounded-2xl p-4 shadow-sm text-center">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Step {step + 1} of {STEPS.length}
        </span>
        <h4 className="text-base font-black text-black">{STEPS[step]}</h4>
        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-black h-full transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop Stepper */}
      <div className="hidden md:flex justify-between items-center bg-white border border-gray-200 rounded-2xl p-5 shadow-sm gap-2">
        {STEPS.map((s, idx) => (
          <div key={s} className="flex items-center gap-2 flex-1 last:flex-initial">
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${
              idx === step 
                ? "bg-black text-white border-black shadow" 
                : idx < step 
                ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                : "bg-white text-gray-400 border-gray-200"
            }`}>
              {idx < step ? "✓" : idx + 1}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider truncate ${
              idx === step ? "text-black" : "text-gray-400"
            }`}>
              {s}
            </span>
            {idx < STEPS.length - 1 && <div className="h-px bg-gray-200 flex-1 mx-2" />}
          </div>
        ))}
      </div>

      {/* Wizard Form Cards */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        {step === 0 && (
          /* Step 1: Deliverables */
          <div className="space-y-6">
            <h3 className="text-lg font-black text-black border-b border-gray-100 pb-2">Campaign Deliverables</h3>
            <div className="space-y-4">
              {deliverables.map((d, index) => (
                <div key={index} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-4 relative">
                  {deliverables.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverable(index)}
                      className="absolute top-3 right-3 text-xs font-bold text-rose-600 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-black uppercase tracking-wider">Type</label>
                      <select
                        className="input-field"
                        value={d.type}
                        onChange={(e) => handleDeliverableChange(index, "type", e.target.value)}
                      >
                        {DELIVERABLE_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-black uppercase tracking-wider">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        className="input-field"
                        value={d.quantity}
                        onChange={(e) => handleDeliverableChange(index, "quantity", parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-black uppercase tracking-wider">
                        Duration (Optional)
                        <div className="group relative inline-block cursor-pointer">
                          <span className="text-gray-400 hover:text-black text-[11px] font-normal transition-colors">ⓘ</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 bg-gray-900 text-white text-[11px] font-normal normal-case p-2.5 rounded-lg shadow-xl z-50 leading-relaxed text-center">
                            How long the post must remain visible on the creator&apos;s profile before they are allowed to delete or archive it (e.g., 24 hours for a Story, or Permanent for a Reel/Post).
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                          </div>
                        </div>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 24 hours, Permanent"
                        className="input-field"
                        value={d.duration}
                        onChange={(e) => handleDeliverableChange(index, "duration", e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-black uppercase tracking-wider">
                        Instructions (Optional)
                        <div className="group relative inline-block cursor-pointer">
                          <span className="text-gray-400 hover:text-black text-[11px] font-normal transition-colors">ⓘ</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 bg-gray-900 text-white text-[11px] font-normal normal-case p-2.5 rounded-lg shadow-xl z-50 leading-relaxed text-center">
                            Special rules or directions for the content (e.g., &quot;Put the discount link in your bio&quot; or &quot;Tag the brand logo in the first 3 seconds&quot;).
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                          </div>
                        </div>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Include link in bio, Tag brand logo"
                        className="input-field"
                        value={d.notes}
                        onChange={(e) => handleDeliverableChange(index, "notes", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddDeliverable}
              className="w-full border border-dashed border-gray-300 text-xs font-bold text-black hover:bg-gray-50 py-3 rounded-xl transition-all"
            >
              + Add Deliverable Row
            </button>
          </div>
        )}

        {step === 1 && (
          /* Step 2: Usage Rights */
          <div className="space-y-6">
            <h3 className="text-lg font-black text-black border-b border-gray-100 pb-2">Campaign Usage Rights</h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-black uppercase tracking-wider">Platforms Allowed</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((platform) => {
                  const active = platformsAllowed.includes(platform);
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => handlePlatformToggle(platform)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        active 
                          ? "bg-black border-black text-white" 
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {platform}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <label className="text-xs font-bold text-black uppercase tracking-wider">Usage Category</label>
              <div className="flex flex-wrap gap-2">
                {USAGE_CATEGORIES.map((cat) => {
                  const active = usageType.includes(cat.value);
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleUsageTypeToggle(cat.value)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        active 
                          ? "bg-black border-black text-white" 
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-4">
              <label className="text-xs font-bold text-black uppercase tracking-wider">Rights Duration</label>
              <input
                type="text"
                placeholder="e.g. 6 months, 1 year, Permanent"
                className="input-field"
                value={usageRightsDuration}
                onChange={(e) => setUsageRightsDuration(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          /* Step 3: Financial Terms */
          <div className="space-y-6">
            <h3 className="text-lg font-black text-black border-b border-gray-100 pb-2">Financial Agreements</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">Total Amount (PKR)</label>
                <input
                  type="text"
                  placeholder="e.g. 150000"
                  className="input-field"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">Advance Payment (PKR, Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 50000"
                  className="input-field"
                  value={advancePayment}
                  onChange={(e) => setAdvancePayment(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {advancePayment && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">Advance Payment Deadline Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={advancePaymentDate}
                    onChange={(e) => setAdvancePaymentDate(e.target.value)}
                  />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">Remaining Payment Deadline Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={remainingPaymentDate}
                  onChange={(e) => setRemainingPaymentDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <label className="text-xs font-bold text-black uppercase tracking-wider">Payment Route Method</label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-xl">
                {[
                  { label: "Bank Transfer", value: "BANK_IBAN" },
                  { label: "JazzCash", value: "JAZZCASH" },
                  { label: "EasyPaisa", value: "EASYPAISA" },
                ].map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setPaymentMethod(m.value)}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      paymentMethod === m.value 
                        ? "bg-black text-white shadow" 
                        : "text-gray-500 hover:text-black"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === "BANK_IBAN" ? (
              <div className="flex flex-col gap-1 mt-4">
                <label className="text-xs font-bold text-black uppercase tracking-wider">Bank account IBAN Number</label>
                <input
                  type="text"
                  placeholder="PK00 BANK 0000 0000 0000 0000"
                  className="input-field uppercase"
                  value={bankAccountIban}
                  onChange={(e) => setBankAccountIban(e.target.value)}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1 mt-4">
                <label className="text-xs font-bold text-black uppercase tracking-wider">Mobile Wallet Number</label>
                <input
                  type="tel"
                  placeholder="03XXXXXXXXX"
                  className="input-field"
                  value={mobileWalletNumber}
                  onChange={(e) => setMobileWalletNumber(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          /* Step 4: Delivery Terms */
          <div className="space-y-6">
            <h3 className="text-lg font-black text-black border-b border-gray-100 pb-2">Delivery Timeframe & Options</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">Delivery Timeframe (Days)</label>
                <input
                  type="text"
                  placeholder="e.g. 7"
                  className="input-field"
                  value={deliveryTimeframeDays}
                  onChange={(e) => setDeliveryTimeframeDays(e.target.value.replace(/\D/g, ""))}
                />
                <span className="text-[10px] text-gray-400">Number of days allowed for content delivery after contract signature.</span>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">Revision Rounds</label>
                <input
                  type="number"
                  min={1}
                  className="input-field"
                  value={revisionRounds}
                  onChange={(e) => setRevisionRounds(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 select-none">
                <input
                  type="checkbox"
                  checked={brandApprovalRequired}
                  onChange={(e) => setBrandApprovalRequired(e.target.checked)}
                  className="w-4 h-4 accent-black"
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-black">Approval Required</span>
                  <span className="text-[10px] text-gray-400">Content must be pre-approved.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 select-none">
                <input
                  type="checkbox"
                  checked={exclusivityClause}
                  onChange={(e) => setExclusivityClause(e.target.checked)}
                  className="w-4 h-4 accent-black"
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-black">Exclusivity Clause</span>
                  <span className="text-[10px] text-gray-400">Restricts signing with competitor brands.</span>
                </div>
              </label>
            </div>

            {exclusivityClause && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">Exclusivity Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 30 days post-campaign"
                    className="input-field"
                    value={exclusivityDuration}
                    onChange={(e) => setExclusivityDuration(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">Restricted Competitors / Categories</label>
                  <input
                    type="text"
                    placeholder="e.g. Apple, OnePlus, Android Smartphones"
                    className="input-field"
                    value={exclusivityCompetitors}
                    onChange={(e) => setExclusivityCompetitors(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Confidentiality & Pre-Launch NDA Clause */}
            <div className="border-t border-gray-100 pt-6 mt-4 space-y-4">
              <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 select-none">
                <input
                  type="checkbox"
                  checked={confidentialityRequired}
                  onChange={(e) => setConfidentialityRequired(e.target.checked)}
                  className="w-4 h-4 accent-black"
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-black">Confidentiality / Pre-Launch NDA Clause</span>
                  <span className="text-[10px] text-gray-400">Strictly prohibits early disclosure or leaking unreleased product info before official launch.</span>
                </div>
              </label>

              {confidentialityRequired && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">Embargo / Launch Date</label>
                    <input
                      type="date"
                      className="input-field"
                      value={embargoDate}
                      onChange={(e) => setEmbargoDate(e.target.value)}
                    />
                    <span className="text-[10px] text-gray-400">Creator cannot post or disclose product before this date.</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">Early Disclosure Penalty (PKR)</label>
                    <input
                      type="text"
                      placeholder="e.g. 50000"
                      className="input-field"
                      value={earlyDisclosurePenalty}
                      onChange={(e) => setEarlyDisclosurePenalty(e.target.value.replace(/\D/g, ""))}
                    />
                    <span className="text-[10px] text-gray-400">Fine owed if product/content is leaked prior to embargo date.</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1 mt-4">
              <label className="text-xs font-bold text-black uppercase tracking-wider">Tagging / Caption Requirements (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Must tag @brandname, use hashtag #Ad"
                className="input-field"
                value={taggingRequirements}
                onChange={(e) => setTaggingRequirements(e.target.value)}
              />
            </div>

            {/* Collaboration Product Details (Optional) */}
            <div className="border-t border-gray-100 pt-6 mt-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">Collaboration Product Shipment (Optional)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Product Name, Description and Qty</label>
                  <input
                    type="text"
                    placeholder="e.g. Samsung Galaxy S27 Ultra"
                    className="input-field"
                    value={collabProduct}
                    onChange={(e) => setCollabProduct(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Provision Type</label>
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-full">
                    <button
                      type="button"
                      onClick={() => setCollabProductProvisionType("Product Loan")}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${collabProductProvisionType === "Product Loan" ? "bg-black text-white shadow" : "text-gray-500 hover:text-black"}`}
                    >
                      Product Loan
                    </button>
                    <button
                      type="button"
                      onClick={() => setCollabProductProvisionType("Product Provision")}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${collabProductProvisionType === "Product Provision" ? "bg-black text-white shadow" : "text-gray-500 hover:text-black"}`}
                    >
                      Product Provision
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Delivery Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 123 Brand Ave, Suite 400"
                    className="input-field"
                    value={collabDeliveryAddress}
                    onChange={(e) => setCollabDeliveryAddress(e.target.value)}
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
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-4">
              <label className="text-xs font-bold text-black uppercase tracking-wider">Content Ownership Clause</label>
              <textarea
                rows={3}
                className="input-field resize-none"
                value={contentOwnership}
                onChange={(e) => setContentOwnership(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          /* Step 5: Penalties */
          <div className="space-y-6">
            <h3 className="text-lg font-black text-black border-b border-gray-100 pb-2">Bilateral Safeguard Penalties</h3>
            
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed font-semibold">
              ⚖️ Bilateral safeguards protect both parties equally across payment delays, content delivery delays, unauthorized content usage, advance refunds, and pre-delivery cancellations.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">Late Payment Penalty (%)</label>
                <input
                  type="number"
                  min={0}
                  className="input-field"
                  value={latePaymentPenaltyPct}
                  onChange={(e) => setLatePaymentPenaltyPct(e.target.value)}
                />
                <span className="text-[10px] text-gray-400">Paid by Brand per day if payment is delayed (default 3%).</span>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">Late Content Penalty (%)</label>
                <input
                  type="number"
                  min={0}
                  className="input-field"
                  value={lateContentPenaltyPct}
                  onChange={(e) => setLateContentPenaltyPct(e.target.value)}
                />
                <span className="text-[10px] text-gray-400">Paid by Creator per day if delivery is delayed (default 3%).</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">Unauthorized Usage Penalty (%)</label>
                <input
                  type="number"
                  min={0}
                  className="input-field"
                  value={unauthorizedUsagePenaltyPct}
                  onChange={(e) => setUnauthorizedUsagePenaltyPct(e.target.value)}
                />
                <span className="text-[10px] text-gray-400">Fee charged to Brand per violation if content is used outside agreed platforms, category, or duration (default 50%).</span>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">Pre-Delivery Cancellation Fee (%)</label>
                <input
                  type="number"
                  min={0}
                  className="input-field"
                  value={cancellationFeePct}
                  onChange={(e) => setCancellationFeePct(e.target.value)}
                />
                <span className="text-[10px] text-gray-400">Owed if either party cancels contract after execution but before content delivery (default 25%).</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 mt-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">Advance Refund Terms (Non-Delivery Protection)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 select-none">
                  <input
                    type="checkbox"
                    checked={advanceRefundable}
                    onChange={(e) => setAdvanceRefundable(e.target.checked)}
                    className="w-4 h-4 accent-black"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-black">Advance Refundable on Non-Delivery</span>
                    <span className="text-[10px] text-gray-400">Requires creator/agency to return advance payout if deliverables are not provided.</span>
                  </div>
                </label>

                {advanceRefundable && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">Refund Timeframe (Business Days)</label>
                    <input
                      type="number"
                      min={1}
                      className="input-field"
                      value={advanceRefundTimeframeDays}
                      onChange={(e) => setAdvanceRefundTimeframeDays(e.target.value)}
                    />
                    <span className="text-[10px] text-gray-400">Days allowed for refunding advance payout following non-delivery notice.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          /* Step 6: Confirmation */
          <div className="space-y-6">
            <h3 className="text-lg font-black text-black border-b border-gray-100 pb-2">Review Campaign Terms</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col gap-2">
                <span className="text-gray-400 font-bold uppercase tracking-wider block">Campaign Specifications</span>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Direction:</span>
                  <span className="font-bold text-black uppercase">{contractType.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Total Value:</span>
                  <span className="font-bold text-black">PKR {Number(totalAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Advance Check:</span>
                  <span className="font-bold text-black">{advancePayment ? `PKR ${Number(advancePayment).toLocaleString()}` : "No Advance"}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col gap-2">
                <span className="text-gray-400 font-bold uppercase tracking-wider block">Delivery & Exclusivity</span>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Timeframe:</span>
                  <span className="font-bold text-black">{deliveryTimeframeDays} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Revision Cap:</span>
                  <span className="font-bold text-black">{revisionRounds} Rounds</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Exclusivity:</span>
                  <span className="font-bold text-black">{exclusivityClause ? (exclusivityDuration ? `${exclusivityDuration}` : "Active") : "No"}</span>
                </div>
                {exclusivityClause && exclusivityCompetitors && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">Restricted Competitors:</span>
                    <span className="font-bold text-black truncate max-w-[180px]" title={exclusivityCompetitors}>{exclusivityCompetitors}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col gap-2">
                <span className="text-gray-400 font-bold uppercase tracking-wider block">Confidentiality / Pre-Launch NDA</span>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">NDA Status:</span>
                  <span className="font-bold text-black">{confidentialityRequired ? "Strict NDA Active" : "Standard Confidentiality"}</span>
                </div>
                {confidentialityRequired && (
                  <>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-500">Embargo / Launch Date:</span>
                      <span className="font-bold text-black">{embargoDate ? new Date(embargoDate).toLocaleDateString() : "Required until launch"}</span>
                    </div>
                    {earlyDisclosurePenalty && (
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-500">Early Disclosure Penalty:</span>
                        <span className="font-bold text-black">PKR {Number(earlyDisclosurePenalty).toLocaleString()}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col gap-2">
                <span className="text-gray-400 font-bold uppercase tracking-wider block">Bilateral Safeguard Penalties</span>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Late Payment / Delivery:</span>
                  <span className="font-bold text-black">{latePaymentPenaltyPct}% / {lateContentPenaltyPct}% per day</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Unauthorized Brand Usage:</span>
                  <span className="font-bold text-black">{unauthorizedUsagePenaltyPct}% of fee</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Non-Delivery Advance Refund:</span>
                  <span className="font-bold text-black">{advanceRefundable ? `Yes (within ${advanceRefundTimeframeDays} days)` : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Pre-Delivery Cancellation Fee:</span>
                  <span className="font-bold text-black">{cancellationFeePct}%</span>
                </div>
              </div>
            </div>

            {collabProduct && (
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col gap-2 text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-wider block">Collaboration Product Shipment</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="font-semibold text-gray-500 block">Product:</span>
                    <span className="font-bold text-black">{collabProduct} ({collabProductProvisionType})</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500 block">Expected Arrival:</span>
                    <span className="font-bold text-black">{collabDeliveryDate ? new Date(collabDeliveryDate).toLocaleDateString() : "Not Specified"}</span>
                  </div>
                  {collabDeliveryAddress && (
                    <div>
                      <span className="font-semibold text-gray-500 block">Delivery Address:</span>
                      <span className="font-bold text-black truncate block" title={collabDeliveryAddress}>{collabDeliveryAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Deliverables table */}
            <div className="p-4 rounded-xl border border-gray-200 bg-white">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Deliverables List</span>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 font-bold">
                    <th className="py-2">Platform Type</th>
                    <th className="py-2">Qty</th>
                    <th className="py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {deliverables.map((d, i) => (
                    <tr key={i} className="border-b border-gray-50 text-black">
                      <td className="py-2 font-bold">{d.type}</td>
                      <td className="py-2 font-bold">{d.quantity}</td>
                      <td className="py-2 text-gray-500 truncate max-w-xs">{d.notes || "No notes"} {d.duration && `(${d.duration})`}</td>
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
