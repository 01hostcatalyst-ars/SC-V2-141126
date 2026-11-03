"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import {
  Zap,
  AlertCircle,
  FileText,
  ArrowRight,
  CheckCircle2,
  Check,
  Info,
  Copy,
  ExternalLink,
  ShieldCheck,
  PenLine,
  RotateCcw,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  QrCode,
  DollarSign,
  Layers,
  Scale,
  Share2,
  Sliders,
  Lock,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { getCompanyConfig } from "@/lib/config";
import { SignaturePadModal } from "@/components/ui/SignaturePadModal";
import { JURISDICTIONS, getJurisdiction } from "@/lib/config/jurisdictions";
import { CURRENCY_MAP } from "@/lib/currency";
import { ModernSelect } from "@/components/ui/ModernSelect";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { SuiteHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import styles from "./InstantContract.module.css";

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
  { value: "CREATOR_TO_BRAND", label: "Creator → Brand (Direct Deal)" },
  { value: "BRAND_TO_CREATOR", label: "Brand → Creator (Sponsorship Offer)" },
  { value: "AGENCY_TO_CREATOR", label: "Agency → Creator (Campaign Delegation)" },
  { value: "AGENCY_TO_BRAND", label: "Agency → Brand (Master Services Agreement)" },
  { value: "BRAND_TO_AGENCY", label: "Brand → Agency (Agency Retainer/Campaign)" },
  { value: "CREATOR_TO_AGENCY", label: "Creator → Agency (Representation Deal)" },
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

const CONTRACT_SECTIONS = [
  { id: 'sec-setup', label: 'Partnership setup' },
  { id: 'sec-deliverables', label: 'Deliverables' },
  { id: 'sec-licensing', label: 'Usage rights' },
  { id: 'sec-financials', label: 'Payment' },
  { id: 'sec-provisions', label: 'Delivery & products' },
  { id: 'sec-safeguards', label: 'Additional terms' },
  { id: 'sec-execution', label: 'Your details & signing' },
];

function InstantContractForm() {
  const [summaryOpen, setSummaryOpen] = useState(false);
  useEffect(() => {
    const viewport = window.matchMedia('(min-width: 1200px)');
    const updateSummary = () => setSummaryOpen(viewport.matches);
    updateSummary();
    viewport.addEventListener('change', updateSummary);
    return () => viewport.removeEventListener('change', updateSummary);
  }, []);
  const company = getCompanyConfig();
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const [jurisdictionCountryCode, setJurisdictionCountryCode] = useState("US");
  const jur = getJurisdiction(jurisdictionCountryCode);
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

  // Section 6: Workflow & Parties (Final Section)
  const [contractType, setContractType] = useState<string>("AGENCY_TO_CREATOR");
  const [initiatorName, setInitiatorName] = useState("");
  const [initiatorEmail, setInitiatorEmail] = useState("");
  const [initiatorPhone, setInitiatorPhone] = useState("");
  const [initiatorRole, setInitiatorRole] = useState<"CREATOR" | "BRAND" | "AGENCY">("AGENCY");
  const [initiatorDesignation, setInitiatorDesignation] = useState("");
  const [initiatorSigningCapacity, setInitiatorSigningCapacity] = useState<"CREATOR_SELF" | "CREATOR_MANAGER">("CREATOR_SELF");
  const [creatorLegalName, setCreatorLegalName] = useState("");
  const [initiatorNtn, setInitiatorNtn] = useState("");
  const [initiatorCnic, setInitiatorCnic] = useState("");
  const [initiatorCompanyName, setInitiatorCompanyName] = useState("");
  const [initiatorCompanyAddress, setInitiatorCompanyAddress] = useState("");

  // Party 1 / Initiator Email 24h limit live check state
  const [emailLimitChecking, setEmailLimitChecking] = useState(false);
  const [emailLimitReached, setEmailLimitReached] = useState(false);
  const [emailLimitMessage, setEmailLimitMessage] = useState("");

  // Live check DB for 24h guest contract quota as user types/edits initiatorEmail
  useEffect(() => {
    if (!initiatorEmail || !initiatorEmail.includes("@") || !initiatorEmail.includes(".")) {
      setEmailLimitReached(false);
      setEmailLimitMessage("");
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setEmailLimitChecking(true);
        const res = await fetch(`/api/guest/check-limit?email=${encodeURIComponent(initiatorEmail.trim().toLowerCase())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.limitReached) {
            setEmailLimitReached(true);
            setEmailLimitMessage("Guest limit reached (2 contracts per 24h for this email). Please change email address to continue or sign in to your workspace.");
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
    }, 400);

    return () => clearTimeout(timer);
  }, [initiatorEmail]);

  // Derived: is the initiator a business entity (Agency/Brand) or individual (Creator)?
  const isInitiatorBusiness = initiatorRole === "AGENCY" || initiatorRole === "BRAND";

  // Derived: is the initiator receiving payout money? (Agency -> Brand, Creator -> Brand, Creator -> Agency)
  const isInitiatorPayee = ["AGENCY_TO_BRAND", "CREATOR_TO_BRAND", "CREATOR_TO_AGENCY"].includes(contractType);

  // Auto-sync Platform Role based on Contract Workflow
  useEffect(() => {
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

  // Pre-fill fields if navigated from the Influencer Rate Calculator
  useEffect(() => {
    if (!searchParams || searchParams.get("from") !== "calculator") return;

    const creatorParam = searchParams.get("creator") || searchParams.get("creatorName");
    if (creatorParam) setCreatorName(creatorParam);

    const handleParam = searchParams.get("handle") || searchParams.get("creatorHandle");
    if (handleParam) setCreatorHandle(handleParam);

    const amountParam = searchParams.get("amount");
    if (amountParam) setTotalAmount(amountParam);

    const currencyParam = searchParams.get("currency");
    if (currencyParam) setCurrency(currencyParam);

    const regionParam = searchParams.get("region");
    if (regionParam && ["US", "PK", "IN", "UK", "CA", "AE", "SA", "AU"].includes(regionParam)) {
      setJurisdictionCountryCode(regionParam);
    }

    const platformParam = searchParams.get("platform");
    if (platformParam && ["INSTAGRAM", "TIKTOK", "YOUTUBE"].includes(platformParam)) {
      setPlatformsAllowed([platformParam]);
    }

    const deliverablesParam = searchParams.get("deliverables");
    if (deliverablesParam) {
      try {
        const parsed = JSON.parse(deliverablesParam);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDeliverables(
            parsed.map((item: any) => ({
              type: (item.type || "REEL").replace("IG_", "").replace("YT_", ""),
              quantity: Number(item.quantity) || 1,
              duration: item.duration || "2 Months",
              notes: item.notes || "",
            }))
          );
        }
      } catch (err) {
        console.error("Failed to parse deliverables from calculator", err);
      }
    }

    const usageScopeParam = searchParams.get("usageScope");
    if (usageScopeParam && usageScopeParam.includes("paid")) {
      setUsageType(["PAID_AD"]);
    }

    const exclusivityScopeParam = searchParams.get("exclusivityScope");
    if (exclusivityScopeParam && exclusivityScopeParam !== "none") {
      setExclusivityClause(true);
    }
  }, [searchParams]);

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
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  // Generate QR code whenever a shareUrl is minted
  useEffect(() => {
    if (createdResult?.shareUrl) {
      QRCode.toDataURL(createdResult.shareUrl, {
        margin: 1,
        width: 160,
        color: {
          dark: "#09090b",
          light: "#ffffff",
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("Failed to generate QR code", err));
    }
  }, [createdResult]);

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
    if (contractType === "AGENCY_TO_CREATOR" && (!brandName.trim() || !creatorHandle.trim())) return false;
    if (contractType === "CREATOR_TO_BRAND" && (!brandName.trim() || !brandHandle.trim())) return false;
    if (contractType === "BRAND_TO_CREATOR" && !creatorHandle.trim()) return false;
    if (contractType === "AGENCY_TO_BRAND" && (!creatorName.trim() || !creatorHandle.trim())) return false;
    if (contractType === "CREATOR_TO_AGENCY" && !brandName.trim()) return false;
    if (contractType === "BRAND_TO_AGENCY" && (!creatorName.trim() || !creatorHandle.trim())) return false;
    if (advancePayment && Number(advancePayment) > 0 && !advancePaymentDate) return false;
    return true;
  }, [
    initiatorSignatureB64, initiatorName, initiatorEmail, initiatorPhone,
    initiatorDesignation, isInitiatorBusiness, initiatorNtn, initiatorCompanyName,
    initiatorCnic, totalAmount, remainingPaymentDate, deliveryTimeframeDays,
    contractType, brandName, brandHandle, creatorName, creatorHandle,
    advancePayment, advancePaymentDate,
  ]);

  // Helpers for deliverables & platforms
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
        if (data.limitReached) {
          setEmailLimitReached(true);
          setEmailLimitMessage(data.error);
        }
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
        jurisdictionCountryCode,
        currency,
        taxTreatment,
        taxRatePct: taxRatePct ? Number(taxRatePct) : 0,
        initiatorName,
        initiatorEmail: initiatorEmail.trim().toLowerCase(),
        initiatorPhone,
        initiatorRole,
        initiatorDesignation,
        initiatorNtn: isInitiatorBusiness ? initiatorNtn : undefined,
        initiatorCnic: !isInitiatorBusiness ? initiatorCnic : undefined,
        initiatorTaxId: isInitiatorBusiness ? initiatorNtn : undefined,
        initiatorNationalId: !isInitiatorBusiness ? initiatorCnic : undefined,
        initiatorCompanyName: isInitiatorBusiness ? initiatorCompanyName : undefined,
        initiatorCompanyAddress: isInitiatorBusiness ? initiatorCompanyAddress : undefined,
        brandName: ["AGENCY_TO_CREATOR", "CREATOR_TO_BRAND", "CREATOR_TO_AGENCY"].includes(contractType) ? brandName : undefined,
        brandHandle: ["AGENCY_TO_CREATOR", "CREATOR_TO_BRAND", "CREATOR_TO_AGENCY"].includes(contractType) ? brandHandle : undefined,
        campaignName: ["AGENCY_TO_CREATOR", "CREATOR_TO_AGENCY", "BRAND_TO_AGENCY"].includes(contractType) ? campaignName : undefined,
        creatorName: ["AGENCY_TO_BRAND", "BRAND_TO_CREATOR", "BRAND_TO_AGENCY"].includes(contractType) ? creatorName : undefined,
        creatorHandle: ["AGENCY_TO_BRAND", "AGENCY_TO_CREATOR", "BRAND_TO_CREATOR", "BRAND_TO_AGENCY"].includes(contractType) ? creatorHandle : undefined,
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

  // Smooth scroll to section
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className={`${styles.page} flex flex-col`}>
      {/* Directional Ambient Spotlight matching Home Page */}


      {/* Universal Suite Header with pure typography SIGNCOLLAB & mobile hamburger */}
      <SuiteHeader
        activeRoute="/instant"
        rightBadge={
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Guest Mode (2 / Day)
          </span>
        }
      />

      {/* Main 1-Page Form Container */}
      <main className={styles.main}>
        
        <header className={styles.builderHero}>
          <span className={styles.eyebrow}><FileText size={16} aria-hidden="true" /> Instant contract</span>
          <h1>Your creator partnership agreement.</h1>
          <p>Fill in your agreement as you read. Review the scope, permissions, and payment terms, then sign below.</p>
          <span className={styles.builderMeta}>No signup required · 2 free contracts per 24 hours</span>
        </header>
        <div className={styles.workspace}>
          <div className={styles.formArea}>


        {/* Global Error Banner */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main 1-Page Form Sheet */}
        <form onSubmit={(e) => e.preventDefault()} className={styles.agreementDocument}>
          <header className={styles.documentHeading}>
            <div><span>Agreement draft</span><h2>Creator partnership agreement</h2></div>
            <p>* Required fields · Review preset values before signing.</p>
          </header>

          {/* WORKFLOW & JURISDICTION SELECTION CARD */}
          <div id="sec-setup" className="bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-7 shadow-xs surface-card space-y-4 text-left">
            <div className="border-b border-zinc-100 pb-3">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 block">
                01 / Start here
              </span>
              <h2 className="text-base sm:text-lg font-semibold text-zinc-800 tracking-tight">
                Your partnership
              </h2>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ModernSelect
                label="Who is this agreement between? *"
                value={contractType}
                disabled={initiatorOtpVerified}
                onChange={(val) => setContractType(val)}
                options={WORKFLOW_OPTIONS}
              />

              <ModernSelect
                label="Governing country *"
                value={jurisdictionCountryCode}
                disabled={initiatorOtpVerified}
                onChange={(val) => {
                  setJurisdictionCountryCode(val);
                  const newJur = getJurisdiction(val);
                  setCurrency(newJur.defaultCurrency);
                }}
                options={Object.values(JURISDICTIONS).map((j) => ({
                  value: j.countryCode,
                  label: `${j.countryName} (${j.lawAbbreviation})`,
                  sublabel: `Currency: ${j.defaultCurrency}`,
                }))}
              />
            </div>
          </div>

          {/* SECTION 1: Campaign Deliverables & Guidelines */}
          <div
            id="sec-deliverables"
            className="bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-7 shadow-xs surface-card space-y-5 text-left scroll-mt-28"
          >
            <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 block">
                  02 / Campaign scope
                </span>
                <h2 className="text-base sm:text-lg font-semibold text-zinc-800 tracking-tight flex items-center gap-2">
                  <span>What will be delivered?</span>
                </h2>

              </div>
              <span className="text-xs font-mono font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">
                {deliverables.length} deliverable{deliverables.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className={styles.deliverablesBody}>
              {deliverables.map((item, idx) => (
                <div key={idx} className={styles.deliverableItem}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
                      Deliverable {idx + 1}
                    </span>
                    {deliverables.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(idx)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer min-h-[38px] px-2 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Row 1: Format, Quantity, Stay Published */}
                    <div className={styles.deliverableFields}>
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
                        <label htmlFor={`deliverable-quantity-${idx}`} className="text-xs font-semibold text-zinc-700">Quantity</label>
                        <input
                          id={`deliverable-quantity-${idx}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleDeliverableChange(idx, "quantity", e.target.value)}
                          className="input-field font-mono"
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
                        ]}
                      />
                    </div>

                    {/* Row 2: Notes / Instructions with Suggestion Chips */}
                    <div className="w-full pt-1 space-y-2">
                      <AutocompleteInput
                        label="Content instructions"
                        id={`deliverable-notes-${idx}`}
                        multiline
                        rows={2}
                        placeholder="Describe the content, key messages, and production requirements."
                        value={item.notes}
                        onChange={(val) => handleDeliverableChange(idx, "notes", val)}
                        suggestions={getDeliverableNoteSuggestions(item.type)}
                      />

                      <div className={styles.suggestions}><span className={styles.suggestionsLabel}>Suggested instructions</span><div className={styles.suggestionButtons}>
                        {getDeliverableNoteSuggestions(item.type).slice(0, 3).map((sugg, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => handleDeliverableChange(idx, "notes", sugg)}
                            className={styles.suggestionButton}
                          >
                            + {sugg}
                          </button>
                        ))}
                      </div></div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddDeliverable}
                className={styles.addDeliverable}
              >
                <Plus className="w-4 h-4 text-zinc-600" />
                <span>Add another deliverable</span>
              </button>

              <details className={styles.sharedRequirements}><summary className={styles.requirementsToggle}>Tags &amp; ownership details <ChevronDown size={16} /></summary><div className={styles.sharedRequirementsHeading}><p>These apply across all deliverables. Review the ownership terms before continuing.</p></div><div className={styles.sharedRequirementFields}>
                <AutocompleteInput
                  label="Tags & collaboration requirements"
                  id="campaign-tagging"
                  multiline
                  rows={2}
                  placeholder="Add account tags, disclosure hashtags, or collaboration requirements."
                  value={taggingRequirements}
                  onChange={(val) => setTaggingRequirements(val)}
                  suggestions={TAGGING_REQUIREMENTS_SUGGESTIONS}
                />

                <AutocompleteInput
                  label="Copyright & ownership terms"
                  id="campaign-ownership"
                  multiline
                  rows={2}
                  placeholder="e.g. Creator retains copyright; brand receives 1-year commercial digital license"
                  value={contentOwnership}
                  onChange={(val) => setContentOwnership(val)}
                  suggestions={IP_OWNERSHIP_SUGGESTIONS}
                />
              </div></details>
            </div>
          </div>

          {/* SECTION 2: Granted Commercial License Tiers & Media Scope */}
          <div
            id="sec-licensing"
            className="bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-7 shadow-xs surface-card space-y-5 text-left scroll-mt-28"
          >
            <div className="border-b border-zinc-100 pb-3">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 block">
                03 / Content permissions
              </span>
              <h2 className="text-base sm:text-lg font-semibold text-zinc-800 tracking-tight flex items-center gap-2">
                <span>How can the content be used?</span>
              </h2>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-2">Where can the content appear?</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORM_OPTIONS.map((p) => {
                    const isSelected = platformsAllowed.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlatform(p.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 min-h-[40px] cursor-pointer ${
                          isSelected
                            ? "bg-zinc-900 text-white border-zinc-900 shadow-2xs"
                            : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-2">Permitted uses</label>
                <div className="flex flex-wrap gap-2">
                  {USAGE_TYPE_OPTIONS.map((u) => {
                    const isSelected = usageType.includes(u.id);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => toggleUsageType(u.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 min-h-[40px] cursor-pointer ${
                          isSelected
                            ? "bg-zinc-900 text-white border-zinc-900 shadow-2xs"
                            : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        <span>{u.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <ModernSelect
              label="Usage duration"
              value={usageRightsDuration}
              onChange={(val) => setUsageRightsDuration(val)}
              options={[
                { value: "30 Days", label: "30 Days" },
                { value: "90 Days", label: "90 Days" },
                { value: "6 Months", label: "6 Months" },
                { value: "12 Months", label: "12 Months" },
                { value: "Perpetual", label: "Perpetual Commercial Usage" },
              ]}
            />
          </div>

          {/* SECTION 3: Financial & Payment Schedule */}
          <div
            id="sec-financials"
            className="bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-7 shadow-xs surface-card space-y-5 text-left scroll-mt-28"
          >
            <div className="border-b border-zinc-100 pb-3">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 block">
                04 / Fees & dates
              </span>
              <h2 className="text-base sm:text-lg font-semibold text-zinc-800 tracking-tight flex items-center gap-2">
                <span>How and when will payment happen?</span>
              </h2>

            </div>

            <p className={styles.paymentNote}>Currency: {currency} ({CURRENCY_MAP[currency]?.symbol || "$"}) · Amounts include taxes.</p>
            <div className={styles.paymentGrid}>
              <div className={styles.paymentField}>
                <label htmlFor="agreement-fee">Total agreed fee ({currency}) *</label>
                <input id="agreement-fee" type="number" required placeholder="e.g. 100000" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} className="input-field font-mono font-medium text-zinc-900" />
              </div>
              <div className={styles.paymentField}>
                <label htmlFor="agreement-advance">Advance payment ({currency}, optional)</label>
                <input id="agreement-advance" type="number" placeholder="e.g. 50000" value={advancePayment} onChange={(e) => setAdvancePayment(e.target.value)} className="input-field font-mono" />
              </div>
              <div className={styles.paymentField}>
                <label htmlFor="agreement-balance-date">Balance due date *</label>
                <input id="agreement-balance-date" type="date" required value={remainingPaymentDate} onChange={(e) => setRemainingPaymentDate(e.target.value)} className="input-field text-xs font-mono" />
              </div>
              <div className={styles.paymentField}>
                <label htmlFor="agreement-advance-date">Advance due date {advancePayment && Number(advancePayment) > 0 ? "*" : ""}</label>
                <input id="agreement-advance-date" type="date" required={Boolean(advancePayment && Number(advancePayment) > 0)} value={advancePaymentDate} onChange={(e) => setAdvancePaymentDate(e.target.value)} className="input-field text-xs font-mono" />
              </div>
            </div>
            <div className={styles.paymentGrid}>
              {/* JURISDICTION & PAYEE SENSITIVE PAYMENT ROUTING */}
              {isInitiatorPayee ? (
                <>
                  <ModernSelect
                    label="How will you receive payment? *"
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
                    <div className="flex flex-col text-left gap-1">
                      <label className="text-xs font-semibold text-zinc-700">
                        {paymentMethod === "ACH_ROUTING" ? "Routing & Account No *" : paymentMethod === "SEPA" ? "IBAN & BIC *" : "Bank IBAN Account *"}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={paymentMethod === "ACH_ROUTING" ? "Routing: 123456789 | Account: 987654321" : "Enter IBAN or Account details"}
                        value={bankAccountIban}
                        onChange={(e) => setBankAccountIban(e.target.value)}
                        className="input-field font-mono"
                      />
                    </div>
                  ) : paymentMethod === "PAYPAL" ? (
                    <div className="flex flex-col text-left gap-1">
                      <label className="text-xs font-semibold text-zinc-700">PayPal Email Address *</label>
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
                    <div className="flex flex-col text-left gap-1">
                      <label className="text-xs font-semibold text-zinc-700">
                        Mobile Account Number ({paymentMethod}) *
                      </label>
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
                <p className={styles.payoutNote}>
                  The receiving {contractType.endsWith("_CREATOR") ? "creator" : "agency"} will provide their payout account through their signing link.
                </p>
              )}
            </div>
          </div>

          {/* SECTION 4: Delivery, Revisions & Product Loans */}
          <div
            id="sec-provisions"
            className="bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-7 shadow-xs surface-card space-y-5 text-left scroll-mt-28"
          >
            <div className="border-b border-zinc-100 pb-3">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 block">
                05 / Timing & logistics
              </span>
              <h2 className="text-base sm:text-lg font-semibold text-zinc-800 tracking-tight flex items-center gap-2">
                <span>Delivery, revisions & products</span>
              </h2>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col text-left gap-1">
                <label className="text-xs font-semibold text-zinc-700">Delivery timeframe (days) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={deliveryTimeframeDays}
                  onChange={(e) => setDeliveryTimeframeDays(e.target.value)}
                  className="input-field font-mono"
                />
              </div>

              <ModernSelect
                label="Revision Rounds"
                value={revisionRounds}
                onChange={(val) => setRevisionRounds(val)}
                options={[
                  { value: "1", label: "1 Round Included" },
                  { value: "2", label: "2 Rounds (Standard)" },
                  { value: "3", label: "3 Rounds" },
                ]}
              />

              <div className="flex flex-col text-left gap-1">
                <label className="text-xs font-semibold text-zinc-700">Days per revision round</label>
                <input
                  type="number"
                  min="1"
                  value={revisionTurnaroundDays}
                  onChange={(e) => setRevisionTurnaroundDays(e.target.value)}
                  className="input-field font-mono"
                />
              </div>
            </div>

            {/* Product Provisioning & Logistics Card */}
            <div className="p-4 sm:p-5 bg-zinc-50/70 border border-zinc-200/90 rounded-2xl space-y-3 mt-2">
              <span className="text-xs font-semibold text-zinc-800 uppercase tracking-wide block">
                Product details & shipping
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-semibold text-zinc-700">Product Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Apparel Set / Tech Review Unit"
                    value={collabProduct}
                    onChange={(e) => setCollabProduct(e.target.value)}
                    className="input-field"
                  />
                </div>

                <ModernSelect
                  label="Is the product a gift or a loan?"
                  value={collabProductProvisionType}
                  onChange={(val) => setCollabProductProvisionType(val)}
                  options={[
                    { value: "Product Provision", label: "Gift / Complimentary Provision" },
                    { value: "Product Loan", label: "Product Loan (Must Be Returned)" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-semibold text-zinc-700">Shipping / Delivery Address</label>
                  <input
                    type="text"
                    placeholder="Physical address for product shipment"
                    value={collabDeliveryAddress}
                    onChange={(e) => setCollabDeliveryAddress(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-semibold text-zinc-700">Expected Product Arrival</label>
                  <input
                    type="date"
                    value={collabDeliveryDate}
                    onChange={(e) => setCollabDeliveryDate(e.target.value)}
                    className="input-field text-xs font-mono"
                  />
                </div>
              </div>

              {collabProductProvisionType === "Product Loan" && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-200">
                  <div className="flex flex-col text-left gap-1">
                    <label className="text-xs font-semibold text-zinc-700">Return Window (Days)</label>
                    <input
                      type="number"
                      value={collabProductReturnDays}
                      onChange={(e) => setCollabProductReturnDays(e.target.value)}
                      className="input-field font-mono"
                    />
                  </div>

                  <div className="flex flex-col text-left gap-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-zinc-700">Return Address</label>
                    <input
                      type="text"
                      placeholder="Destination address to return item"
                      value={collabProductReturnAddress}
                      onChange={(e) => setCollabProductReturnAddress(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <ModernSelect
                    label="Shipping Paid By"
                    value={collabProductReturnShippingBy}
                    onChange={(val) => setCollabProductReturnShippingBy(val)}
                    options={[
                      { value: "Brand", label: "Brand / Agency" },
                      { value: "Creator", label: "Creator" },
                    ]}
                  />

                  <div className="flex flex-col text-left gap-1 sm:col-span-4">
                    <label className="text-xs font-semibold text-zinc-700">Non-Return Penalty Fee ({currency})</label>
                    <input
                      type="number"
                      placeholder="e.g. 15000"
                      value={collabProductNonReturnFee}
                      onChange={(e) => setCollabProductNonReturnFee(e.target.value)}
                      className="input-field font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5: Safeguards, Penalties & Exclusivity */}
          <div
            id="sec-safeguards"
            className="bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-7 shadow-xs surface-card space-y-5 text-left scroll-mt-28"
          >
            <div className="border-b border-zinc-100 pb-3">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 block">
                06 / Additional terms
              </span>
              <h2 className="text-base sm:text-lg font-semibold text-zinc-800 tracking-tight flex items-center gap-2">
                <span>Additional terms & responsibilities</span>
              </h2>

            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ModernSelect
                label="Late payment (% per day)"
                value={latePaymentPenaltyPct}
                onChange={(val) => setLatePaymentPenaltyPct(val)}
                options={[
                  { value: "0", label: "0%" },
                  { value: "0.5", label: "0.5%" },
                  { value: "1", label: "1%" },
                  { value: "2", label: "2%" },
                ]}
              />
              <ModernSelect
                label="Late delivery (% per day)"
                value={lateContentPenaltyPct}
                onChange={(val) => setLateContentPenaltyPct(val)}
                options={[
                  { value: "0", label: "0%" },
                  { value: "0.5", label: "0.5%" },
                  { value: "1", label: "1%" },
                  { value: "2", label: "2%" },
                ]}
              />
              <div className="flex flex-col text-left gap-1">
                <label className="text-xs font-semibold text-zinc-700">Maximum penalty cap (%)</label>
                <input
                  type="number"
                  value={penaltyCapPct}
                  onChange={(e) => setPenaltyCapPct(e.target.value)}
                  className="input-field font-mono"
                />
              </div>
              <div className="flex flex-col text-left gap-1">
                <label className="text-xs font-semibold text-zinc-700">Unauthorized ad use (%)</label>
                <input
                  type="number"
                  value={unauthorizedUsagePenaltyPct}
                  onChange={(e) => setUnauthorizedUsagePenaltyPct(e.target.value)}
                  className="input-field font-mono"
                />
              </div>
            </div>

            {/* Interactive Bento Clause Toggles matching Home Page */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div
                onClick={() => setExclusivityClause(!exclusivityClause)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none space-y-2 ${
                  exclusivityClause
                    ? "bg-emerald-50/60 border-emerald-300 shadow-2xs"
                    : "bg-zinc-50/80 border-zinc-200/80 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-800">Category Exclusivity Clause</span>
                  <CheckCircle2
                    className={`w-4 h-4 ${exclusivityClause ? "text-emerald-600" : "text-zinc-300"}`}
                  />
                </div>
                <p className="text-[11px] text-zinc-600 leading-snug">
                  Restricts creator from promoting direct competing brands during the active campaign term.
                </p>

                {exclusivityClause && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="space-y-2 pt-2 border-t border-emerald-200/60"
                  >
                    <input
                      type="text"
                      placeholder="Exclusivity Duration (e.g. 30 Days)"
                      value={exclusivityDuration}
                      onChange={(e) => setExclusivityDuration(e.target.value)}
                      className="input-field text-xs bg-white"
                    />
                    <AutocompleteInput
                      size="sm"
                      placeholder="Excluded Competitors (e.g. Direct skincare brands)"
                      value={exclusivityCompetitors}
                      onChange={(val) => setExclusivityCompetitors(val)}
                      suggestions={EXCLUSIVITY_COMPETITOR_SUGGESTIONS}
                    />
                  </div>
                )}
              </div>

              <div
                onClick={() => setConfidentialityRequired(!confidentialityRequired)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none space-y-2 ${
                  confidentialityRequired
                    ? "bg-emerald-50/60 border-emerald-300 shadow-2xs"
                    : "bg-zinc-50/80 border-zinc-200/80 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-800">Confidentiality &amp; NDA</span>
                  <CheckCircle2
                    className={`w-4 h-4 ${confidentialityRequired ? "text-emerald-600" : "text-zinc-300"}`}
                  />
                </div>
                <p className="text-[11px] text-zinc-600 leading-snug">
                  Prohibits premature public disclosure of campaign products prior to the official launch date.
                </p>

                {confidentialityRequired && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="space-y-2 pt-2 border-t border-emerald-200/60"
                  >
                    <input
                      type="date"
                      value={embargoDate}
                      onChange={(e) => setEmbargoDate(e.target.value)}
                      className="input-field text-xs font-mono bg-white"
                    />
                    <input
                      type="number"
                      placeholder="Early Disclosure Penalty Amount"
                      value={earlyDisclosurePenalty}
                      onChange={(e) => setEarlyDisclosurePenalty(e.target.value)}
                      className="input-field text-xs font-mono bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 6: Initiator Digital Signature & Verification Vault */}
          <div
            id="sec-execution"
            className="bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-7 shadow-xs surface-card space-y-6 text-left scroll-mt-28"
          >
            <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 block">
                  07 / Details & signing
                </span>
                <h2 className="text-base sm:text-lg font-semibold text-zinc-800 tracking-tight flex items-center gap-2">
                  <span>Your details & signature</span>
                </h2>

              </div>
              {initiatorOtpVerified && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Email verified
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col text-left gap-1">
                <label className="text-xs font-semibold text-zinc-700">Your Full Legal Name *</label>
                <input
                  type="text"
                  required
                  disabled={initiatorOtpVerified}
                  placeholder="e.g. Sarah Khan"
                  value={initiatorName}
                  onChange={(e) => setInitiatorName(e.target.value)}
                  className="input-field disabled:bg-zinc-100"
                />
              </div>

              <div className="flex flex-col text-left gap-1">
                <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
                  <span>Your Email Address *</span>
                  {emailLimitChecking && (
                    <span className="text-[10px] text-blue-600 font-semibold animate-pulse">Checking 24h quota...</span>
                  )}
                </label>
                <input
                  type="email"
                  required
                  disabled={initiatorOtpVerified || initiatorOtpDispatched}
                  placeholder="sarah@example.com"
                  value={initiatorEmail}
                  onChange={(e) => setInitiatorEmail(e.target.value)}
                  className={`input-field disabled:bg-zinc-100 ${
                    emailLimitReached ? "border-2 border-rose-500 bg-rose-50/60 text-rose-950 font-semibold focus:ring-rose-400" : ""
                  }`}
                />
                {emailLimitReached && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs font-medium space-y-1.5 mt-1">
                    <div className="flex items-start gap-1.5 font-semibold">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>
                        Quota Exceeded: This email address ({initiatorEmail}) has created 2 contracts in 24 hours.
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-800 leading-relaxed pl-5">
                      Type a different email address above to continue right away, or{" "}
                      <Link href="/dashboard" className="underline font-semibold text-rose-950 hover:text-black">
                        Sign In / Sign Up
                      </Link>{" "}
                      for unlimited contract minting.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col text-left gap-1">
                <label className="text-xs font-semibold text-zinc-700">Your Phone Number *</label>
                <input
                  type="tel"
                  required
                  disabled={initiatorOtpVerified}
                  placeholder={`e.g. ${jur.phonePlaceholder}`}
                  value={initiatorPhone}
                  onChange={(e) => setInitiatorPhone(e.target.value)}
                  className="input-field disabled:bg-zinc-100 font-mono"
                />
              </div>

              <div className="flex flex-col text-left gap-1">
                <label className="text-xs font-semibold text-zinc-700">Platform Role</label>
                <div className="input-field bg-zinc-100 border-zinc-200 text-zinc-800 font-semibold flex items-center justify-between cursor-not-allowed">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {initiatorRole === "CREATOR" ? "Creator / Influencer" : initiatorRole === "BRAND" ? "Brand Representative" : "Agency Representative"}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">Set by your selection</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <AutocompleteInput
                  label="Your job title or signing role *"
                  required
                  disabled={initiatorOtpVerified}
                  placeholder="e.g. Lead Content Creator"
                  value={initiatorDesignation}
                  onChange={(val) => setInitiatorDesignation(val)}
                  suggestions={JOB_TITLE_SUGGESTIONS}
                />
              </div>

              {/* BUSINESS VS INDIVIDUAL IDENTITY FIELDS */}
              {isInitiatorBusiness ? (
                <>
                  <div className="flex flex-col text-left gap-1">
                    <label className="text-xs font-semibold text-zinc-700">
                      {initiatorRole === "AGENCY" ? "Agency Legal Name" : "Company Legal Name"} *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={initiatorOtpVerified}
                      placeholder={initiatorRole === "AGENCY" ? "e.g. Creative Hub Agency" : "e.g. Sapphire Retail Ltd."}
                      value={initiatorCompanyName}
                      onChange={(e) => setInitiatorCompanyName(e.target.value)}
                      className="input-field disabled:bg-zinc-100"
                    />
                  </div>

                  <div className="flex flex-col text-left gap-1">
                    <label className="text-xs font-semibold text-zinc-700">{jur.taxIdLabel} *</label>
                    <input
                      type="text"
                      required
                      disabled={initiatorOtpVerified}
                      placeholder={`Enter your ${jur.taxIdLabel}`}
                      value={initiatorNtn}
                      onChange={(e) => setInitiatorNtn(e.target.value)}
                      className="input-field disabled:bg-zinc-100 font-mono"
                    />
                  </div>

                  <div className="flex flex-col text-left gap-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-zinc-700">
                      {initiatorRole === "AGENCY" ? "Agency Office Address" : "Company Registered Address"}
                    </label>
                    <input
                      type="text"
                      disabled={initiatorOtpVerified}
                      placeholder="Official registered address, City"
                      value={initiatorCompanyAddress}
                      onChange={(e) => setInitiatorCompanyAddress(e.target.value)}
                      className="input-field disabled:bg-zinc-100"
                    />
                  </div>
                </>
              ) : (
                <>
                  <ModernSelect
                    label="Signing Capacity *"
                    value={initiatorSigningCapacity}
                    onChange={(val: any) => {
                      setInitiatorSigningCapacity(val);
                      if (val === "CREATOR_MANAGER") {
                        setInitiatorDesignation("Authorized Talent Manager");
                      } else {
                        setInitiatorDesignation("Content Creator / Influencer");
                      }
                    }}
                    options={[
                      { value: "CREATOR_SELF", label: "I am the Creator (Signing Myself)" },
                      { value: "CREATOR_MANAGER", label: "I am an Authorized Manager / Agent (Signing for Creator)" },
                    ]}
                  />

                  <div className="flex flex-col text-left gap-1">
                    <label className="text-xs font-semibold text-zinc-700">Creator Instagram Handle *</label>
                    <input
                      type="text"
                      required
                      disabled={initiatorOtpVerified}
                      placeholder="e.g. @username"
                      value={creatorHandle}
                      onChange={(e) => setCreatorHandle(e.target.value)}
                      className="input-field disabled:bg-zinc-100 font-mono"
                    />
                  </div>

                  {initiatorSigningCapacity === "CREATOR_MANAGER" && (
                    <div className="flex flex-col text-left gap-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-zinc-700">Creator Full Legal Name *</label>
                      <input
                        type="text"
                        required
                        disabled={initiatorOtpVerified}
                        placeholder="e.g. Sarah Khan"
                        value={creatorLegalName}
                        onChange={(e) => setCreatorLegalName(e.target.value)}
                        className="input-field disabled:bg-zinc-100"
                      />
                    </div>
                  )}

                  <div className="flex flex-col text-left gap-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-zinc-700">
                      {jur.nationalIdLabel} {!jur.nationalIdLabel.toLowerCase().includes("optional") && "*"}
                    </label>
                    <input
                      type="text"
                      required={!jur.nationalIdLabel.toLowerCase().includes("optional")}
                      disabled={initiatorOtpVerified}
                      placeholder={`Enter your ${jur.nationalIdLabel.replace(" (Optional)", "")}`}
                      value={initiatorCnic}
                      onChange={(e) => setInitiatorCnic(e.target.value)}
                      className="input-field disabled:bg-zinc-100 font-mono"
                    />
                  </div>

                  <div className="flex flex-col text-left gap-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-zinc-700">Your Residential / Physical Address</label>
                    <input
                      type="text"
                      disabled={initiatorOtpVerified}
                      placeholder="Residential / Postal Address, City"
                      value={initiatorCompanyAddress}
                      onChange={(e) => setInitiatorCompanyAddress(e.target.value)}
                      className="input-field disabled:bg-zinc-100"
                    />
                  </div>
                </>
              )}

              {/* DISTINCT COUNTERPARTY CLIENT INFORMATION HEADER */}
              <div className="sm:col-span-2 border-t border-zinc-100 pt-4 mt-2 text-left">
                <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider block mb-3">
                  Target Client / Counterparty Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["AGENCY_TO_CREATOR", "CREATOR_TO_BRAND", "CREATOR_TO_AGENCY"].includes(contractType) && (
                    <div className="flex flex-col text-left gap-1">
                      <label className="text-xs font-semibold text-zinc-700">
                        {contractType === "CREATOR_TO_AGENCY" ? "Target Agency Name *" : "Target Brand Name *"}
                      </label>
                      <input
                        type="text"
                        required
                        disabled={initiatorOtpVerified}
                        placeholder={contractType === "CREATOR_TO_AGENCY" ? "e.g. Creative Hub Agency" : "e.g. Sapphire / Nexus"}
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        className="input-field border-blue-200 disabled:bg-zinc-100"
                      />
                    </div>
                  )}

                  {["AGENCY_TO_CREATOR", "CREATOR_TO_BRAND"].includes(contractType) && (
                    <div className="flex flex-col text-left gap-1">
                      <label className="text-xs font-semibold text-zinc-700">Target Brand Instagram Handle</label>
                      <input
                        type="text"
                        disabled={initiatorOtpVerified}
                        placeholder="e.g. @brand_official"
                        value={brandHandle}
                        onChange={(e) => setBrandHandle(e.target.value)}
                        className="input-field border-blue-200 disabled:bg-zinc-100 font-mono"
                      />
                    </div>
                  )}

                  {["BRAND_TO_CREATOR", "AGENCY_TO_CREATOR"].includes(contractType) && (
                    <div className="flex flex-col text-left gap-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-zinc-700">Target Creator IG Handle *</label>
                      <input
                        type="text"
                        required
                        disabled={initiatorOtpVerified}
                        placeholder="e.g. @username"
                        value={creatorHandle}
                        onChange={(e) => setCreatorHandle(e.target.value)}
                        className="input-field border-blue-200 disabled:bg-zinc-100 font-mono"
                      />
                    </div>
                  )}

                  {["AGENCY_TO_BRAND", "BRAND_TO_AGENCY"].includes(contractType) && (
                    <>
                      <div className="flex flex-col text-left gap-1">
                        <label className="text-xs font-semibold text-zinc-700">Target Creator Name *</label>
                        <input
                          type="text"
                          required
                          disabled={initiatorOtpVerified}
                          placeholder="e.g. Mohammad Ali"
                          value={creatorName}
                          onChange={(e) => setCreatorName(e.target.value)}
                          className="input-field border-blue-200 disabled:bg-zinc-100"
                        />
                      </div>
                      <div className="flex flex-col text-left gap-1">
                        <label className="text-xs font-semibold text-zinc-700">Target Creator Handle *</label>
                        <input
                          type="text"
                          required
                          disabled={initiatorOtpVerified}
                          placeholder="e.g. @alibeats"
                          value={creatorHandle}
                          onChange={(e) => setCreatorHandle(e.target.value)}
                          className="input-field border-blue-200 disabled:bg-zinc-100 font-mono"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* CONTEXTUAL NOTICE BADGE */}
              <div className="sm:col-span-2 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-left">
                <p className="text-xs text-blue-900 font-medium flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    {contractType === "AGENCY_TO_CREATOR" || contractType === "BRAND_TO_CREATOR"
                      ? "Creator representative verification details, National ID Number, and payout routing will be collected directly from the Creator when they open the Contract Link."
                      : contractType === "CREATOR_TO_BRAND" || contractType === "AGENCY_TO_BRAND"
                      ? "Brand representative verification details, company address, and official authority will be collected directly from the Brand when they open the Contract Link."
                      : "Agency representative verification details, office address, and official authority will be collected directly from the Agency when they open the Contract Link."}
                  </span>
                </p>
              </div>

              {/* INITIATOR DIGITAL SIGNATURE STEP (BEFORE OTP) */}
              <div className="flex flex-col text-left gap-1.5 sm:col-span-2 pt-2">
                <label className="text-xs font-semibold text-zinc-800">Your signature *</label>
                {initiatorSignatureB64 ? (
                  <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-xl border border-emerald-200 shadow-2xs shrink-0">
                        <img src={initiatorSignatureB64} alt="Signature Preview" className="h-10 object-contain max-w-[150px]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Signature added</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 font-medium">
                          Embedded in E-Sign Vault &amp; dispatched in OTP Email
                        </span>
                      </div>
                    </div>
                    {!initiatorOtpVerified && (
                      <button
                        type="button"
                        onClick={() => setIsSignModalOpen(true)}
                        className="text-xs font-semibold text-blue-700 hover:text-blue-900 px-3 py-1.5 bg-white border border-blue-200 rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer min-h-[38px]"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Redraw</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSignModalOpen(true)}
                    className="w-full py-4 bg-blue-50/80 hover:bg-blue-100/90 border-2 border-dashed border-blue-300 hover:border-blue-400 text-blue-900 font-semibold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer min-h-[44px]"
                  >
                    <PenLine className="w-4 h-4 text-blue-700" />
                    <span>Add your signature</span>
                  </button>
                )}
              </div>

              {/* OTP VERIFICATION ACTION BOX FOR PARTY 1 */}
              <div className="sm:col-span-2 pt-2 text-left">
                {!initiatorOtpVerified ? (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50/60 to-zinc-50 border-2 border-emerald-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                    <div className="flex flex-col text-left space-y-1">
                      <span className="text-xs font-semibold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Verify your email &amp; create a sharing link
                      </span>
                      <span className="text-xs text-zinc-600 font-normal">
                        {initiatorOtpDispatched
                          ? `Code sent to ${initiatorEmail}. Enter 6-digit verification code below.`
                          : "Draw your signature above and enter all required details, then click Send OTP."}
                      </span>
                    </div>

                    {!initiatorOtpDispatched ? (
                      <button
                        type="button"
                        onClick={handleSendInitiatorOtp}
                        disabled={!initiatorEmail || !initiatorName || !initiatorPhone || !initiatorDesignation || !initiatorSignatureB64 || initiatorOtpLoading || emailLimitReached}
                        className={`font-semibold px-6 py-3 rounded-xl text-xs uppercase transition-all whitespace-nowrap shrink-0 flex items-center gap-2 min-h-[44px] ${
                          initiatorEmail && initiatorName && initiatorPhone && initiatorDesignation && initiatorSignatureB64 && !initiatorOtpLoading && !emailLimitReached
                            ? "bg-zinc-950 text-white hover:bg-zinc-900 shadow-sm cursor-pointer"
                            : "bg-zinc-200 text-zinc-400 border border-zinc-300 cursor-not-allowed"
                        }`}
                      >
                        {emailLimitReached ? (
                          "24h Limit Reached (Change Email)"
                        ) : initiatorOtpLoading ? (
                          "Sending OTP..."
                        ) : (
                          <>
                            <span>Send OTP</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
                        <div className="flex flex-col text-left">
                          <label className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider mb-1">
                            6-Digit OTP
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="123456"
                            value={initiatorOtpCode}
                            onChange={(e) => setInitiatorOtpCode(e.target.value.replace(/\D/g, ""))}
                            className="w-36 px-3 py-2 bg-white border-2 border-emerald-500 rounded-xl text-center font-mono font-semibold tracking-[0.2em] text-base text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-600 placeholder:text-zinc-300 min-h-[44px]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleVerifyInitiatorOtp}
                          disabled={initiatorOtpLoading || !initiatorOtpCode}
                          className="self-end bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 text-white font-semibold px-5 py-2.5 rounded-xl text-xs uppercase shadow-sm transition-all whitespace-nowrap min-h-[44px] cursor-pointer"
                        >
                          {initiatorOtpLoading ? "Verifying..." : "Verify OTP & Save Contract"}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Initiator identity verified &amp; contract saved! You may copy the sharing link below.</span>
                  </div>
                )}
              </div>

              {/* SHAREABLE CONTRACT LINK BOX DIRECTLY BELOW SIGNATURE & OTP */}
              {createdResult && (
                <div className="sm:col-span-2 p-5 bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-300 rounded-2xl space-y-4 shadow-lg animate-fadeIn mt-2 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      Shareable Signing Link (Send to Party 2)
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full uppercase">
                      Contract #{createdResult.contractNumber}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      readOnly
                      value={createdResult.shareUrl}
                      className="flex-1 bg-white border border-zinc-300 rounded-xl px-4 py-3 text-xs md:text-sm font-mono text-zinc-900 select-all focus:outline-none shadow-inner min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="bg-zinc-950 hover:bg-zinc-900 text-white font-semibold px-6 py-3 rounded-xl text-xs md:text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-sm min-h-[44px] cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Contract Link</span>
                        </>
                      )}
                    </button>
                    <a
                      href={createdResult.shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shadow-sm min-h-[44px]"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* QR Code & Mobile Fast Scan Box */}
                  {qrCodeUrl && (
                    <div className="pt-3 border-t border-emerald-200/60 flex flex-col sm:flex-row items-center gap-4">
                      <img
                        src={qrCodeUrl}
                        alt="Contract Signing QR Code"
                        className="w-28 h-28 rounded-xl border border-zinc-200 bg-white p-1 shrink-0"
                      />
                      <div className="text-left space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
                          <QrCode className="w-4 h-4 text-zinc-700" />
                          <span>Scan QR Code to Sign on Mobile</span>
                        </div>
                        <p className="text-[11px] text-zinc-600 leading-relaxed font-normal">
                          Point your phone camera at this QR code to instantly review and counter-sign this agreement on iOS or Android with zero signup needed.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </form>
          </div>
          <aside className={styles.summaryPanel}>
            <details className={styles.agreementSummary} open={summaryOpen} onToggle={event => setSummaryOpen(event.currentTarget.open)}>
              <summary><FileText size={18} /> Your agreement so far <ChevronDown size={16} /></summary>
              <div className={styles.summaryBody}>
                <span className={styles.draftBadge}>Draft summary</span>
                <dl>
                  <div><dt>Partnership</dt><dd>{WORKFLOW_OPTIONS.find(option => option.value === contractType)?.label}</dd></div>
                  <div><dt>Governing country</dt><dd>{jur.countryName}</dd></div>
                  <div><dt>Deliverables</dt><dd>{deliverables.map((item, index) => <span key={index}>{item.quantity} × {item.type.replaceAll('_', ' ')} · {item.duration}</span>)}</dd></div>
                  <div><dt>Platforms</dt><dd>{platformsAllowed.map(id => PLATFORM_OPTIONS.find(option => option.id === id)?.label).join(', ') || 'None selected'}</dd></div>
                  <div><dt>Permitted uses</dt><dd>{usageType.map(id => USAGE_TYPE_OPTIONS.find(option => option.id === id)?.label).join(', ') || 'None selected'}</dd></div>
                  <div><dt>Usage duration</dt><dd>{usageRightsDuration}</dd></div>
                  <div><dt>Agreed fee</dt><dd>{totalAmount ? `${currency} ${totalAmount}` : 'Not set yet'}</dd></div>
                  <div><dt>Delivery</dt><dd>{deliveryTimeframeDays} days · {revisionRounds} revision round(s)</dd></div>
                </dl>
                <p>Includes preset values. Review the full terms before signing.</p>
                <button type="button" onClick={() => scrollToSection('sec-execution')}>Go to signing <ArrowRight size={15} /></button>
              </div>
            </details>
            <nav className={styles.documentNav} aria-label="Agreement sections">
              <p>In this agreement</p>
              {CONTRACT_SECTIONS.map(section => <button key={section.id} type="button" onClick={() => scrollToSection(section.id)}>{section.label}</button>)}
            </nav>
          </aside>
        </div>
      </main>

      {/* Signature Pad Modal for Initiator */}
      <SignaturePadModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onConfirm={handleSaveSignature}
        loading={loading}
        countryCode={jurisdictionCountryCode}
      />

      {/* Frequently Asked Questions Section */}
      <InstantContractFaqSection />

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}


const INSTANT_FAQS = [
  {q:"Do I need an account?",a:"You can create an instant agreement without signing up. Guest use allows two contracts per email address in a 24-hour period."},
  {q:"Who can use this agreement builder?",a:"Creators, brands, and agencies can choose the relationship that matches their deal. The form then shows the identity and payment details needed for that relationship."},
  {q:"Does this form collect or hold payment?",a:"No. It records the agreed fee, payment schedule, and payment details in the agreement. Entering these details does not transfer funds or create an escrow deposit."},
  {q:"What happens after I sign and verify my email?",a:"Once the agreement is created, you receive a sharing link for the other party. They use that link to review the agreement and complete their signing steps."},
  {q:"How can I check a document later?",a:"Use SignCollab’s document verification tool to look up the document reference or compare the PDF’s SHA-256 fingerprint with the stored record."},
];

function InstantContractFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className={styles.faq}>
      <div className={`${styles.faqInner} space-y-8`}>
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 text-white rounded-full text-xs font-bold shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-300" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 font-display">
            Before you sign.
          </h2>
          <p className="text-sm text-zinc-600 max-w-2xl mx-auto font-normal leading-relaxed">
            A few useful answers about creating and sharing your agreement.
          </p>
        </div>

        <div className="space-y-3">
          {INSTANT_FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between text-left p-5 sm:p-6 gap-4 cursor-pointer hover:bg-zinc-50/50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-zinc-900">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-zinc-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-zinc-900" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 border-t border-zinc-100">
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal pt-3">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function InstantContractPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-theme-gradient flex items-center justify-center text-sm font-semibold text-zinc-500">
          Loading SignCollab instant contract studio...
        </div>
      }
    >
      <InstantContractForm />
    </Suspense>
  );
}
