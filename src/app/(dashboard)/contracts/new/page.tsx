"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/layout/ProtectedRoute";
import { useToast } from "@/components/ui/Toast";
import { JURISDICTIONS, getJurisdiction } from "@/lib/config/jurisdictions";
import { CURRENCY_MAP } from "@/lib/currency";
import { ModernSelect } from "@/components/ui/ModernSelect";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";

interface DeliverableItem {
  type: string;
  quantity: number;
  duration: string;
  notes: string;
}

const JOB_TITLE_SUGGESTIONS = [
  "Marketing Director",
  "Brand Campaign Manager",
  "Lead Content Creator / Influencer",
  "Influencer Marketing Lead",
  "Founder & CEO",
  "Creative Director",
  "Talent Agent / Manager",
];

function getDeliverableNoteSuggestions(type: string): string[] {
  const t = (type || "").toUpperCase();
  if (t.includes("REEL") || t.includes("TIKTOK") || t.includes("SHORTS") || t.includes("VIDEO")) {
    return [
      "4K 60fps video with product unboxing in first 5s",
      "Voiceover explaining top 3 key product features + CTA",
      "Includes link in bio & custom promo discount code",
      "High-res raw video footage delivered via Google Drive",
    ];
  }
  if (t.includes("STORY")) {
    return [
      "3-frame Instagram Story sequence with direct link sticker",
      "1x Story with product unboxing + 1x Story with promo code tag",
      "Story post featuring direct product link sticker & brand tag",
    ];
  }
  if (t.includes("POST") || t.includes("CAROUSEL") || t.includes("PHOTO")) {
    return [
      "Carousel 3-5 multi-angle product photos + brand tag",
      "High-res grid post with detailed product review in caption",
      "Include custom promo discount code in caption & first comment",
    ];
  }
  return [
    "Standard campaign deliverable with brand tag & promo link",
    "High-resolution final asset delivered post pre-approval",
    "Verified deliverable specifications & caption guidelines",
  ];
}

const TAGGING_REQUIREMENTS_SUGGESTIONS = [
  "Tag @brand_official in caption & first 3s",
  "Mandatory hashtags: #ad #collab #brandpartner",
  "Include promo code [CODE10] in bio & caption",
  "Tag official account as Co-Author on IG Collab Post",
];

const IP_OWNERSHIP_SUGGESTIONS = [
  "Brand License (1 Year Digital & Social Usage)",
  "Full Perpetual Ownership (All Channels & Ads)",
  "Creator Retains Copyright (Usage Rights License)",
];

const EXCLUSIVITY_COMPETITOR_SUGGESTIONS = [
  "Direct competitors in skincare & beauty category",
  "No sponsored posts for competing apparel brands during term",
  "Direct competitors in consumer tech",
];

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

export default function NewContractPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [agencyContracts, setAgencyContracts] = useState<any[]>([]);

  // Default contract type based on logged-in user role
  const getDefaultContractType = () => {
    if (user?.role === "BRAND") return "BRAND_TO_CREATOR";
    if (user?.role === "AGENCY") return "AGENCY_TO_BRAND";
    return "CREATOR_TO_BRAND";
  };

  const [contractType, setContractType] = useState(getDefaultContractType());
  const [linkedContractId, setLinkedContractId] = useState("");

  // Counterparty fields
  const [brandName, setBrandName] = useState("");
  const [brandHandle, setBrandHandle] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [creatorHandle, setCreatorHandle] = useState("");

  // Initiator profile & representative fields
  const [initiatorName, setInitiatorName] = useState(user?.name || "");
  const [initiatorDesignation, setInitiatorDesignation] = useState("");

  // Section 1: Campaign Deliverables & Tagging
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>([
    { type: "REEL", quantity: 1, duration: "2 Months", notes: "" },
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
  const [jurisdictionCountryCode, setJurisdictionCountryCode] = useState(user?.countryCode || "US");
  const [currency, setCurrency] = useState("USD");
  const [taxTreatment, setTaxTreatment] = useState("INCLUSIVE");
  const [taxRatePct, setTaxRatePct] = useState("0");
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

  // Auto-sync User Profile fields when logged-in user changes
  useEffect(() => {
    if (user) {
      if (user.name) setInitiatorName(user.name);
      if (user.countryCode) {
        setJurisdictionCountryCode(user.countryCode);
        const jur = getJurisdiction(user.countryCode);
        setCurrency(jur.defaultCurrency);
      }
    }
  }, [user]);

  // Auto-sync Platform Role based on Contract Workflow
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

  // Derived payee check
  const isInitiatorPayee = ["AGENCY_TO_BRAND", "CREATOR_TO_BRAND", "CREATOR_TO_AGENCY"].includes(contractType);

  const handleAddDeliverable = () => {
    setDeliverables([
      ...deliverables,
      { type: "REEL", quantity: 1, duration: "2 Months", notes: "" },
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

  const validateForm = () => {
    if (!initiatorName.trim()) {
      showToast("Authorized Representative Name is required.", "error");
      return false;
    }
    if (!initiatorDesignation.trim()) {
      showToast("Job Title / Signing Capacity is required.", "error");
      return false;
    }
    if (!totalAmount || Number(totalAmount) <= 0) {
      showToast("Total campaign valuation is required.", "error");
      return false;
    }
    if (advancePayment && Number(advancePayment) > Number(totalAmount)) {
      showToast("Advance payment cannot exceed total valuation.", "error");
      return false;
    }
    if (advancePayment && Number(advancePayment) > 0 && !advancePaymentDate) {
      showToast("Advance payment date is required when advance payment is specified.", "error");
      return false;
    }
    if (!remainingPaymentDate) {
      showToast("Remaining payment date is required.", "error");
      return false;
    }
    if (!deliveryTimeframeDays || Number(deliveryTimeframeDays) <= 0) {
      showToast("Delivery timeframe is required.", "error");
      return false;
    }
    // Workflow-specific counterparty checks
    if (contractType === "AGENCY_TO_CREATOR" && !brandName.trim()) {
      showToast("Brand Name is required for Agency to Creator deals.", "error");
      return false;
    }
    if (contractType === "CREATOR_TO_BRAND" && (!brandName.trim() || !brandHandle.trim())) {
      showToast("Brand Name and Brand Handle are required.", "error");
      return false;
    }
    if (contractType === "BRAND_TO_CREATOR" && (!creatorName.trim() || !creatorHandle.trim())) {
      showToast("Creator Name and Creator Handle are required.", "error");
      return false;
    }
    if (contractType === "AGENCY_TO_BRAND" && (!creatorName.trim() || !creatorHandle.trim())) {
      showToast("Creator Name and Creator Handle are required.", "error");
      return false;
    }
    if (contractType === "CREATOR_TO_AGENCY" && !brandName.trim()) {
      showToast("Brand Name is required.", "error");
      return false;
    }
    if (contractType === "BRAND_TO_AGENCY" && (!creatorName.trim() || !creatorHandle.trim())) {
      showToast("Creator Name and Creator Handle are required.", "error");
      return false;
    }
    return true;
  };

  const handleSubmitContract = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const payload = {
      contractType,
      jurisdictionCountryCode,
      currency,
      taxTreatment,
      taxRatePct: taxRatePct ? Number(taxRatePct) : 0,
      initiatorName: initiatorName.trim(),
      initiatorDesignation: initiatorDesignation.trim(),
      initiatorCompanyName: user?.agencyName || undefined,
      initiatorCompanyAddress: user?.agencyAddress || undefined,
      initiatorTaxId: user?.taxId || user?.cnicNumber || undefined,
      initiatorNtn: user?.taxId || undefined,
      initiatorCnic: user?.cnicNumber || undefined,
      linkedContractId: contractType === "AGENCY_TO_CREATOR" && linkedContractId && linkedContractId.trim() !== "" ? linkedContractId : undefined,
      brandName: ["AGENCY_TO_CREATOR", "CREATOR_TO_BRAND", "CREATOR_TO_AGENCY"].includes(contractType) ? brandName : undefined,
      brandHandle: ["AGENCY_TO_CREATOR", "CREATOR_TO_BRAND", "CREATOR_TO_AGENCY"].includes(contractType) ? brandHandle : undefined,
      campaignName: ["AGENCY_TO_CREATOR", "CREATOR_TO_AGENCY", "BRAND_TO_AGENCY"].includes(contractType) ? campaignName : undefined,
      creatorName: ["AGENCY_TO_BRAND", "BRAND_TO_CREATOR", "BRAND_TO_AGENCY", "CREATOR_TO_BRAND", "CREATOR_TO_AGENCY"].includes(contractType) ? creatorName : undefined,
      creatorHandle: ["AGENCY_TO_BRAND", "BRAND_TO_CREATOR", "BRAND_TO_AGENCY", "CREATOR_TO_BRAND", "CREATOR_TO_AGENCY"].includes(contractType) ? creatorHandle : undefined,
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
    };

    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Commercial agreement created successfully!", "success");
        window.location.href = `/contracts/${data.contract.id}`;
      } else {
        showToast(data.error || "Failed to create agreement draft.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Error creating agreement draft.", "error");
    } finally {
      setLoading(false);
    }
  };

  const jur = getJurisdiction(jurisdictionCountryCode);

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              ✓ Verified Registered Account Mode
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight mt-2">
              Create Commercial Agreement Draft
            </h1>
          </div>
          <div className="text-xs text-gray-500 font-semibold bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            Governing Law: {jur.lawAbbreviation}
          </div>
        </div>
        <p className="text-xs md:text-sm text-gray-600">
          Complete the commercial terms on this single-page form. Your registered profile details are automatically linked and pre-filled.
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-xl space-y-10">
        
        {/* CONTRACT WORKFLOW & JURISDICTION SELECTORS */}
        <div className="space-y-4 border-b border-gray-100 pb-6">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider">
            Contract Workflow &amp; Legal Jurisdiction
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModernSelect
              label="Contract Workflow *"
              value={contractType}
              onChange={(val) => setContractType(val)}
              options={WORKFLOW_OPTIONS}
            />

            <ModernSelect
              label="Governing Country Jurisdiction *"
              value={jurisdictionCountryCode}
              onChange={(val) => {
                setJurisdictionCountryCode(val);
                const selectedJur = getJurisdiction(val);
                setCurrency(selectedJur.defaultCurrency);
              }}
              options={Object.values(JURISDICTIONS).map((j) => ({
                value: j.countryCode,
                label: `${j.countryName} (${j.lawAbbreviation})`,
                sublabel: `Auto-bound Currency: ${j.defaultCurrency}`,
              }))}
            />
          </div>

          {/* Role & Workflow specific counterparty fields */}
          {user?.role === "AGENCY" && contractType === "AGENCY_TO_CREATOR" && agencyContracts.length > 0 && (
            <div className="pt-2">
              <ModernSelect
                label="Link to Master Brand Campaign (Optional)"
                value={linkedContractId}
                onChange={(val) => setLinkedContractId(val)}
                options={[
                  { value: "", label: "No Linked Master Campaign" },
                  ...agencyContracts.map((c) => ({
                    value: c.id,
                    label: `${c.contractNumber} (Brand Deal)`,
                  })),
                ]}
              />
            </div>
          )}

          {/* Dynamic Counterparty Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {["AGENCY_TO_CREATOR", "CREATOR_TO_BRAND", "CREATOR_TO_AGENCY"].includes(contractType) && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">Target Brand Name *</label>
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
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">Brand Handle / Website *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. @samsungpk"
                    className="input-field"
                    value={brandHandle}
                    onChange={(e) => setBrandHandle(e.target.value)}
                  />
                </div>
              </>
            )}

            {["AGENCY_TO_BRAND", "BRAND_TO_CREATOR", "BRAND_TO_AGENCY", "CREATOR_TO_BRAND", "CREATOR_TO_AGENCY"].includes(contractType) && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">Creator Full Name *</label>
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
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">Creator Handle / Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. @janedoe"
                    className="input-field"
                    value={creatorHandle}
                    onChange={(e) => setCreatorHandle(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          {/* CONTEXTUAL COUNTERPARTY NOTICE BADGE */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-left mt-3">
            <p className="text-xs text-blue-900 font-medium flex items-start gap-2">
              <span className="text-blue-600 font-bold shrink-0 text-sm mt-0.5">ℹ</span>
              <span>
                {contractType === "AGENCY_TO_CREATOR" || contractType === "BRAND_TO_CREATOR"
                  ? "Creator representative verification details, National ID Number, and payout details will be collected directly from the Creator when they open the Contract Link."
                  : contractType === "CREATOR_TO_BRAND" || contractType === "AGENCY_TO_BRAND"
                  ? "Brand representative verification details, company address, and official authority will be collected directly from the Brand when they open the Contract Link."
                  : "Agency representative verification details, office address, and official authority will be collected directly from the Agency when they open the Contract Link."}
              </span>
            </p>
          </div>
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
              <div className="space-y-3">
                {/* Row 1: Format, Quantity, Stay Published */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ModernSelect
                    label="Format"
                    value={item.type}
                    onChange={(val) => handleDeliverableChange(idx, "type", val)}
                    options={[
                      { value: "REEL", label: "Reel" },
                      { value: "STORY", label: "Story" },
                      { value: "CAROUSEL_POST", label: "Carousel Post" },
                      { value: "IMAGE_POST", label: "Single Post" },
                      { value: "TIKTOK_VIDEO", label: "Short Video" },
                      { value: "YOUTUBE_VIDEO", label: "Long-form Video" },
                      { value: "LIVE_SESSION", label: "Live Session" },
                    ]}
                  />

                  <div className="flex flex-col text-left gap-1">
                    <label className="text-xs font-bold text-gray-800">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleDeliverableChange(idx, "quantity", parseInt(e.target.value) || 1)}
                      className="input-field"
                    />
                  </div>

                  <ModernSelect
                    label="Stay Published"
                    value={item.duration}
                    onChange={(val) => handleDeliverableChange(idx, "duration", val)}
                    options={[
                      { value: "1 Day", label: "1 Day" },
                      { value: "1 Week", label: "1 Week" },
                      { value: "1 Month", label: "1 Month" },
                      { value: "2 Months", label: "2 Months" },
                      { value: "3 Months", label: "3 Months" },
                      { value: "6 Months", label: "6 Months" },
                      { value: "1 Year", label: "1 Year" },
                      { value: "Permanent", label: "Permanent" },
                    ]}
                  />
                </div>

                {/* Row 2: Full-Width Notes / Instructions */}
                <div className="w-full pt-1">
                  <AutocompleteInput
                    label="Notes / Instructions"
                    placeholder="e.g. Link in bio & unboxing in first 5s"
                    value={item.notes}
                    onChange={(val) => handleDeliverableChange(idx, "notes", val)}
                    suggestions={getDeliverableNoteSuggestions(item.type)}
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
            <div>
              <AutocompleteInput
                label="Tagging & Collaboration Requirements"
                placeholder="e.g. Must tag @brand, use #SummerCollection, add collab tag"
                value={taggingRequirements}
                onChange={(val) => setTaggingRequirements(val)}
                suggestions={TAGGING_REQUIREMENTS_SUGGESTIONS}
              />
            </div>

            <div>
              <AutocompleteInput
                label="Content IP Ownership Terms"
                placeholder="e.g. Brand License (1 Year Digital & Social Usage)"
                value={contentOwnership}
                onChange={(val) => setContentOwnership(val)}
                suggestions={IP_OWNERSHIP_SUGGESTIONS}
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

          <ModernSelect
            label="License Duration"
            value={usageRightsDuration}
            onChange={(val) => setUsageRightsDuration(val)}
            options={[
              { value: "30 Days", label: "30 Days" },
              { value: "60 Days", label: "60 Days" },
              { value: "90 Days", label: "90 Days" },
              { value: "6 Months", label: "6 Months" },
              { value: "12 Months", label: "12 Months" },
              { value: "Perpetual Commercial Rights", label: "Perpetual Commercial Rights" },
            ]}
          />
        </div>

        {/* SECTION 3: Financial & Payment Terms */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-gray-100 pb-2">
            3. Financial &amp; Payment Schedule ({jur.lawAbbreviation})
          </h3>

          {/* TAX & AUTO-BOUND CURRENCY NOTICE BADGE */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-bold shrink-0 text-sm">ℹ</span>
              <span>
                <strong>Tax &amp; Currency Note:</strong> Valuation currency is auto-bound to <strong>{currency} ({CURRENCY_MAP[currency]?.symbol || "$"})</strong> based on {jur.countryName} jurisdiction. All figures are inclusive of statutory local taxes (VAT/GST). Each party handles their own tax filings.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-800">
                Total Valuation Amount ({currency} - {CURRENCY_MAP[currency]?.symbol || "$"}) *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="1000"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="input-field font-bold text-black"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-800">Advance Payment (Optional)</label>
              <input
                type="number"
                min="0"
                placeholder="0.00"
                value={advancePayment}
                onChange={(e) => setAdvancePayment(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-800">
                Advance Payment Date {advancePayment && Number(advancePayment) > 0 ? "*" : ""}
              </label>
              <input
                type="date"
                required={Boolean(advancePayment && Number(advancePayment) > 0)}
                value={advancePaymentDate}
                onChange={(e) => setAdvancePaymentDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-800">Remaining Balance Due Date *</label>
              <input
                type="date"
                required
                value={remainingPaymentDate}
                onChange={(e) => setRemainingPaymentDate(e.target.value)}
                className="input-field"
              />
            </div>

            {isInitiatorPayee ? (
              <>
                <ModernSelect
                  label="Receiving Payment Method *"
                  value={paymentMethod}
                  onChange={(val) => setPaymentMethod(val)}
                  options={(jur.allowedPaymentMethods || ["BANK_IBAN", "WIRE_TRANSFER", "PAYPAL"]).map((m) => {
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
                    return {
                      value: m,
                      label: labelMap[m] || m.replace(/_/g, " "),
                    };
                  })}
                />

                {paymentMethod === "BANK_IBAN" || paymentMethod === "SEPA" || paymentMethod === "WIRE_TRANSFER" || paymentMethod === "ACH_ROUTING" ? (
                  <div className="flex flex-col gap-1 sm:col-span-3">
                    <label className="text-xs font-bold text-gray-800">
                      {paymentMethod === "ACH_ROUTING" ? "Routing & Account No *" : paymentMethod === "SEPA" ? "IBAN & BIC *" : "Bank IBAN Account *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={paymentMethod === "ACH_ROUTING" ? "Routing: 123456789 | Account: 987654321" : "Enter your IBAN or Account details"}
                      value={bankAccountIban}
                      onChange={(e) => setBankAccountIban(e.target.value)}
                      className="input-field font-mono"
                    />
                  </div>
                ) : paymentMethod === "PAYPAL" ? (
                  <div className="flex flex-col gap-1 sm:col-span-3">
                    <label className="text-xs font-bold text-gray-800">PayPal Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="paypal@example.com"
                      value={bankAccountIban}
                      onChange={(e) => setBankAccountIban(e.target.value)}
                      className="input-field font-mono"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 sm:col-span-3">
                    <label className="text-xs font-bold text-gray-800">Mobile Account / Tag ({paymentMethod}) *</label>
                    <input
                      type="text"
                      required
                      placeholder={jur.phonePlaceholder}
                      value={mobileWalletNumber}
                      onChange={(e) => setMobileWalletNumber(e.target.value)}
                      className="input-field font-mono"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="sm:col-span-2 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-left flex items-center">
                <p className="text-xs text-blue-900 font-medium flex items-center gap-2">
                  <span className="text-blue-600 font-bold text-sm shrink-0">ℹ</span>
                  <span>
                    Receiving Payout Account will be collected directly from the receiving counterparty ({contractType.endsWith("_CREATOR") ? "Creator" : "Agency"}) on their signing link.
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: Delivery, Revisions & Product Provisions */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-gray-100 pb-2">
            4. Delivery Timeframes &amp; Product Provisions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-800">Delivery Timeframe (Days) *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="7"
                value={deliveryTimeframeDays}
                onChange={(e) => setDeliveryTimeframeDays(e.target.value)}
                className="input-field"
              />
            </div>

            <ModernSelect
              label="Allowed Revision Rounds"
              value={revisionRounds}
              onChange={(val) => setRevisionRounds(val)}
              options={[
                { value: "0", label: "0 Rounds (No Revisions)" },
                { value: "1", label: "1 Round (Standard)" },
                { value: "2", label: "2 Rounds" },
                { value: "3", label: "3 Rounds" },
              ]}
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-800">Revision Turnaround (Days)</label>
              <input
                type="number"
                min="1"
                placeholder="5"
                value={revisionTurnaroundDays}
                onChange={(e) => setRevisionTurnaroundDays(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={brandApprovalRequired}
                onChange={(e) => setBrandApprovalRequired(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-xs font-bold text-gray-800">Require Pre-Publish Brand Approval</span>
            </label>
          </div>

          {/* Product Provision / Loan Details */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-4 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase">Product Provision / Loan Terms</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-800">Product / Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Galaxy S24 Ultra & Wireless Earbuds"
                  value={collabProduct}
                  onChange={(e) => setCollabProduct(e.target.value)}
                  className="input-field"
                />
              </div>

              <ModernSelect
                label="Provision Type"
                value={collabProductProvisionType}
                onChange={(val) => setCollabProductProvisionType(val)}
                options={[
                  { value: "Product Provision", label: "Gift / Retained Provision" },
                  { value: "Product Loan", label: "Temporary Product Loan (Return Required)" },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-800">Shipping / Delivery Address</label>
                <input
                  type="text"
                  placeholder="Shipping Address for product delivery"
                  value={collabDeliveryAddress}
                  onChange={(e) => setCollabDeliveryAddress(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-800">Expected Product Arrival Date</label>
                <input
                  type="date"
                  value={collabDeliveryDate}
                  onChange={(e) => setCollabDeliveryDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {collabProductProvisionType === "Product Loan" && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-gray-200/60">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-800">Return Timeframe (Days)</label>
                  <input
                    type="number"
                    value={collabProductReturnDays}
                    onChange={(e) => setCollabProductReturnDays(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-800">Product Return Address</label>
                  <input
                    type="text"
                    placeholder="Address to return the product"
                    value={collabProductReturnAddress}
                    onChange={(e) => setCollabProductReturnAddress(e.target.value)}
                    className="input-field"
                  />
                </div>

                <ModernSelect
                  label="Return Shipping Paid By"
                  value={collabProductReturnShippingBy}
                  onChange={(val) => setCollabProductReturnShippingBy(val)}
                  options={[
                    { value: "Brand", label: "Brand / Agency" },
                    { value: "Creator", label: "Creator" },
                  ]}
                />

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-800">Non-Return Fee ({currency})</label>
                  <input
                    type="number"
                    placeholder="e.g. 1500"
                    value={collabProductNonReturnFee}
                    onChange={(e) => setCollabProductNonReturnFee(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 5: Safeguards, Penalties & Exclusivity */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-gray-100 pb-2">
            5. Safeguards, Penalties &amp; Exclusivity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-800">Late Payment Penalty (%/day)</label>
              <input
                type="number"
                step="0.1"
                value={latePaymentPenaltyPct}
                onChange={(e) => setLatePaymentPenaltyPct(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-800">Late Content Penalty (%/day)</label>
              <input
                type="number"
                step="0.1"
                value={lateContentPenaltyPct}
                onChange={(e) => setLateContentPenaltyPct(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-800">Penalty Cap (% Total)</label>
              <input
                type="number"
                value={penaltyCapPct}
                onChange={(e) => setPenaltyCapPct(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-800">Unauthorized Use Penalty (%)</label>
              <input
                type="number"
                value={unauthorizedUsagePenaltyPct}
                onChange={(e) => setUnauthorizedUsagePenaltyPct(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exclusivityClause}
                onChange={(e) => setExclusivityClause(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-xs font-bold text-gray-800">Enable Category Exclusivity Restrictions</span>
            </label>
          </div>

          {exclusivityClause && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
              <ModernSelect
                label="Exclusivity Duration"
                value={exclusivityDuration}
                onChange={(val) => setExclusivityDuration(val)}
                options={[
                  { value: "14 Days", label: "14 Days" },
                  { value: "30 Days", label: "30 Days" },
                  { value: "60 Days", label: "60 Days" },
                  { value: "90 Days", label: "90 Days" },
                ]}
              />

              <AutocompleteInput
                label="Competitors Category / Excluded Brands"
                placeholder="e.g. Direct skincare competitors"
                value={exclusivityCompetitors}
                onChange={(val) => setExclusivityCompetitors(val)}
                suggestions={EXCLUSIVITY_COMPETITOR_SUGGESTIONS}
              />
            </div>
          )}

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={confidentialityRequired}
                onChange={(e) => setConfidentialityRequired(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-xs font-bold text-gray-800">Enable NDA &amp; Campaign Embargo Restrictions</span>
            </label>
          </div>

          {confidentialityRequired && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-800">Campaign Embargo / Launch Date</label>
                <input
                  type="date"
                  value={embargoDate}
                  onChange={(e) => setEmbargoDate(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-800">Early Disclosure Penalty ({currency})</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={earlyDisclosurePenalty}
                  onChange={(e) => setEarlyDisclosurePenalty(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 6: Verified Entity Identity & Representative Execution */}
        <div className="space-y-4 border-t border-gray-200 pt-6">
          <h3 className="text-xs font-bold text-black uppercase tracking-wider">
            6. Verified Entity Credentials &amp; Representative Execution
          </h3>

          {/* Read-Only Verified Entity Identity Card */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
              <span className="font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Verified Registered Account Profile Identity
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-white border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Locked Profile Credentials
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-emerald-900 pt-1">
              <div><strong>Business / Account Name:</strong> {user?.agencyName || user?.name || "N/A"}</div>
              <div><strong>Primary Account Email:</strong> {user?.email}</div>
              <div><strong>Account Phone:</strong> {user?.phone || "N/A"}</div>
              <div>
                <strong>{jur.taxIdLabel}:</strong> {user?.taxId || user?.cnicNumber || "N/A"}
              </div>
              {user?.agencyAddress && (
                <div className="sm:col-span-2"><strong>Registered Address:</strong> {user?.agencyAddress}</div>
              )}
            </div>
          </div>

          {/* Editable Per-Contract Representative Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-800">
                Authorized Representative Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mohammad Ali"
                value={initiatorName}
                onChange={(e) => setInitiatorName(e.target.value)}
                className="input-field font-semibold text-black"
              />
            </div>

            <AutocompleteInput
              label="Representative Job Title / Signing Capacity *"
              placeholder="e.g. Marketing Director"
              value={initiatorDesignation}
              onChange={(val) => setInitiatorDesignation(val)}
              suggestions={JOB_TITLE_SUGGESTIONS}
            />
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={handleSubmitContract}
              disabled={loading}
              className="w-full bg-black text-white hover:bg-black/90 font-black py-4 px-6 rounded-2xl shadow-xl transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {loading ? "Creating Commercial Agreement..." : "Generate & Publish Commercial Agreement Draft"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
