// src/components/instant/constants.ts

export const WORKFLOW_OPTIONS = [
  { value: "CREATOR_TO_BRAND", label: "Creator → Brand (Direct Deal)" },
  { value: "BRAND_TO_CREATOR", label: "Brand → Creator (Sponsorship Offer)" },
  { value: "AGENCY_TO_CREATOR", label: "Agency → Creator (Campaign Delegation)" },
  { value: "AGENCY_TO_BRAND", label: "Agency → Brand (Master Services Agreement)" },
  { value: "BRAND_TO_AGENCY", label: "Brand → Agency (Agency Retainer/Campaign)" },
  { value: "CREATOR_TO_AGENCY", label: "Creator → Agency (Representation Deal)" },
];

export const PLATFORM_OPTIONS = [
  { id: "INSTAGRAM", label: "Instagram" },
  { id: "TIKTOK", label: "TikTok" },
  { id: "YOUTUBE", label: "YouTube" },
  { id: "FACEBOOK", label: "Facebook" },
  { id: "LINKEDIN", label: "LinkedIn" },
  { id: "X_TWITTER", label: "X (Twitter)" },
];

export const USAGE_TYPE_OPTIONS = [
  { value: "ORGANIC_ONLY", id: "ORGANIC_ONLY", label: "Organic Social Post" },
  { value: "PAID_AD", id: "PAID_AD", label: "Paid Social Media Ads" },
  { value: "BILLBOARD_PRINT", id: "BILLBOARD_PRINT", label: "Print and Billboard" },
  { value: "ALL_MEDIA", id: "ALL_MEDIA", label: "Full Commercial Broadcast" },
];

export const BOOSTING_DURATION_OPTIONS = [
  { value: "30_DAYS", label: "30 Calendar Days" },
  { value: "60_DAYS", label: "60 Calendar Days" },
  { value: "90_DAYS", label: "90 Calendar Days" },
  { value: "180_DAYS", label: "180 Calendar Days" },
  { value: "PERPETUAL", label: "Perpetual Commercial License" },
];

export const JOB_TITLE_SUGGESTIONS = [
  "Marketing Director",
  "Brand Campaign Manager",
  "Lead Content Creator / Influencer",
  "Influencer Marketing Lead",
  "Founder & CEO",
  "Creative Director",
  "Talent Agent / Manager",
];

export function getDeliverableNoteSuggestions(type: string): string[] {
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

export const TAGGING_REQUIREMENTS_SUGGESTIONS = [
  "Tag @brand_official in caption & first 3s",
  "Mandatory hashtags: #ad #collab #brandpartner",
  "Include promo code [CODE10] in bio & caption",
  "Tag official account as Co-Author on IG Collab Post",
];

export const IP_OWNERSHIP_SUGGESTIONS = [
  "Brand License (1 Year Digital & Social Usage)",
  "Full Perpetual Ownership (All Channels & Ads)",
  "Creator Retains Copyright (Usage Rights License)",
];

export const EXCLUSIVITY_COMPETITOR_SUGGESTIONS = [
  "Direct competitors in skincare & beauty category",
  "No sponsored posts for competing apparel brands during term",
  "Direct competitors in consumer tech",
];
