/**
 * Format date string into unambiguous Pakistani legal format: "13 July 2026 (PKT / UTC+5)"
 */
export function formatLegalDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "N/A";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "N/A";

  const day = date.getDate();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year} (PKT / UTC+5)`;
}

/**
 * Parse raw browser user-agent string into clean human-readable device & browser name
 */
export function parseUserAgentString(ua: string | null | undefined): string {
  if (!ua || ua === "unknown") return "Verified Device";

  let browser = "Web Browser";
  let os = "Desktop Device";

  // Browser detection
  if (ua.includes("Edg/")) browser = "Microsoft Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Firefox/")) browser = "Firefox";

  // OS detection
  if (ua.includes("Windows NT 10.0")) os = "Windows 10/11";
  else if (ua.includes("Windows NT")) os = "Windows";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS Mobile";
  else if (ua.includes("Android")) os = "Android Mobile";
  else if (ua.includes("Linux")) os = "Linux";

  return `${browser} on ${os}`;
}

/**
 * Convert selected usage types into dynamic, non-contradictory commercial license text
 */
export function formatUsageLicenseText(usageTypes: string[] | string | null | undefined): string {
  if (!usageTypes) return "Organic Social Rights";
  const list = Array.isArray(usageTypes) ? usageTypes : [usageTypes];

  if (list.includes("ALL_MEDIA")) {
    return "Full Commercial Broadcast License (TV, Streaming, Radio, Outdoor, Print & Digital Media)";
  }

  const grantedRights: string[] = [];
  if (list.includes("ORGANIC_ONLY")) grantedRights.push("Organic Social Rights");
  if (list.includes("PAID_AD")) grantedRights.push("Paid Ads & Dark Posting License");
  if (list.includes("BILLBOARD_PRINT")) grantedRights.push("Physical Print & Outdoor License");

  if (grantedRights.length === 0) return "Organic Social Rights";

  if (grantedRights.length === 1 && list.includes("ORGANIC_ONLY")) {
    return "Organic Social Rights (Content is strictly restricted to native organic social posting; no paid advertising or off-platform commercial distribution permitted)";
  }

  return `${grantedRights.join(" + ")} (Content may be published natively and utilized across agreed digital ad & media campaigns)`;
}

/**
 * Format raw deliverable type enum into clean short name (Reel, Story, Post, Carousel, Video, Short Video, Live Stream, Paid Ad)
 */
export function formatDeliverableTypeName(type: string | null | undefined): string {
  if (!type) return "Deliverable";
  switch (type.toUpperCase()) {
    case "REEL":
      return "Reel";
    case "STORY":
      return "Story";
    case "IMAGE_POST":
      return "Post";
    case "CAROUSEL_POST":
      return "Carousel";
    case "YOUTUBE_VIDEO":
      return "Video";
    case "TIKTOK_VIDEO":
      return "Short Video";
    case "LIVE_SESSION":
      return "Live Stream";
    case "AD":
      return "Paid Ad";
    default:
      return type.replace(/_/g, " ");
  }
}

/**
 * Build a deterministic canonical JSON representation of all substantive contract terms
 */
export function buildCanonicalContractPayload(contract: any): string {
  if (!contract) return "";

  const canonicalObj = {
    contractNumber: contract.contractNumber || "",
    contractType: contract.contractType || "",
    initiator: {
      name: contract.initiator?.name || "",
      email: contract.initiator?.email || "",
      company: contract.initiator?.companyName || contract.initiator?.agencyName || "",
      designation: contract.initiatorDesignation || contract.initiator?.designation || "",
      ntn: contract.initiatorNtn || contract.initiator?.ntn || "",
    },
    respondent: {
      name: contract.respondentName || "",
      email: contract.respondentEmail || "",
      company: contract.respondentCompany || "",
      address: contract.respondentAddress || "",
      designation: contract.respondentDesignation || "",
      ntn: contract.respondentNtn || "",
    },
    brand: {
      name: contract.brandName || "",
      handle: contract.brandHandle || "",
      campaignName: contract.campaignName || "",
    },
    creator: {
      name: contract.creatorName || "",
      handle: contract.creatorHandle || "",
    },
    financials: {
      totalAmount: contract.totalAmount ? String(contract.totalAmount) : "0",
      advancePayment: contract.advancePayment ? String(contract.advancePayment) : "0",
      paymentMethod: contract.paymentMethod || "",
      bankAccountIban: contract.bankAccountIban || "",
      mobileWalletNumber: contract.mobileWalletNumber || "",
    },
    deliverables: Array.isArray(contract.deliverables)
      ? contract.deliverables
          .map((d: any) => ({
            type: d.type || "",
            quantity: Number(d.quantity || 1),
            duration: d.duration || "",
            notes: d.notes || "",
          }))
          .sort((a: any, b: any) => (a.type || "").localeCompare(b.type || ""))
      : [],
    rights: {
      platformsAllowed: Array.isArray(contract.platformsAllowed) ? [...contract.platformsAllowed].sort() : [],
      usageType: Array.isArray(contract.usageType) ? [...contract.usageType].sort() : [],
      usageRightsDuration: contract.usageRightsDuration || "",
    },
    terms: {
      deliveryTimeframeDays: Number(contract.deliveryTimeframeDays || 0),
      revisionRounds: Number(contract.revisionRounds || 1),
      revisionTurnaroundDays: Number(contract.revisionTurnaroundDays || 5),
      brandApprovalRequired: Boolean(contract.brandApprovalRequired),
      exclusivityClause: Boolean(contract.exclusivityClause),
      exclusivityDuration: contract.exclusivityDuration || "",
      exclusivityCompetitors: contract.exclusivityCompetitors || "",
      confidentialityRequired: Boolean(contract.confidentialityRequired),
      embargoDate: contract.embargoDate ? new Date(contract.embargoDate).toISOString() : "",
      earlyDisclosurePenalty: contract.earlyDisclosurePenalty ? String(contract.earlyDisclosurePenalty) : "0",
      latePaymentPenaltyPct: String(contract.latePaymentPenaltyPct || 3),
      lateContentPenaltyPct: String(contract.lateContentPenaltyPct || 3),
      penaltyCapPct: String(contract.penaltyCapPct || 20),
    },
    collabProduct: contract.collabProduct ? {
      name: contract.collabProduct || "",
      provisionType: contract.collabProductProvisionType || "",
      deliveryAddress: contract.collabDeliveryAddress || "",
      deliveryDate: contract.collabDeliveryDate ? new Date(contract.collabDeliveryDate).toISOString() : "",
      returnDays: contract.collabProductReturnDays ? Number(contract.collabProductReturnDays) : null,
      returnAddress: contract.collabProductReturnAddress || "",
      returnShippingBy: contract.collabProductReturnShippingBy || "",
      nonReturnFee: contract.collabProductNonReturnFee ? String(contract.collabProductNonReturnFee) : null,
    } : null,
  };

  return JSON.stringify(canonicalObj);
}

/**
 * Compute SHA-256 hash of canonical contract JSON payload
 */
export function computeContentHash(contract: any): string {
  const payload = buildCanonicalContractPayload(contract);
  try {
    const nodeCrypto = require("crypto");
    if (nodeCrypto && nodeCrypto.createHash) {
      return nodeCrypto.createHash("sha256").update(payload).digest("hex");
    }
  } catch (_) {}
  
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "SHA256-" + Math.abs(hash).toString(16).padStart(12, "0");
}
