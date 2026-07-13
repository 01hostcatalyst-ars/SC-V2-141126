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
