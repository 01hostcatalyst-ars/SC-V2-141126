import { launchBrowser } from "@/lib/pdf/chromiumLauncher";
import { formatCurrencyAmount } from "@/lib/currency";
import { FORMAT_LABELS, REGIONAL_CONFIG } from "@/lib/calculator/constants";
import { DeliverableFormat, Platform, RegionCode } from "@/lib/calculator/types";
import { CompleteCreatorIntelligence } from "@/lib/ai/types";
import { GeneratedPackage } from "@/lib/calculator/packages";
import { InstagramPostItem, YouTubeVideoItem, TikTokVideoItem } from "@/lib/scrapers/types";

export interface RateCardPdfPayload {
  creatorMeta: {
    displayName: string;
    primaryUsername: string;
    avatarUrl?: string;
  };
  selectedRegion: RegionCode;
  activeNicheName?: string;
  activeSubNicheName?: string;
  totalAudienceCount: number;
  verifiedChannelsCount: number;
  platforms: {
    instagram?: {
      status: string;
      username?: string;
      followerCount?: number;
      avgLikes?: number;
      avgComments?: number;
      avgViews?: number;
      engagementRate?: number;
      rateCardItems?: Array<{
        format: DeliverableFormat;
        amount: number;
        formattedAmount: string;
        lowAmount: number;
        formattedLow: string;
        highAmount: number;
        formattedHigh: string;
        currency: string;
        usdEquivalentFormatted?: string;
      }>;
      posts?: InstagramPostItem[];
    };
    youtube?: {
      status: string;
      username?: string;
      followerCount?: number;
      avgLikes?: number;
      avgComments?: number;
      avgViews?: number;
      avgLongViews?: number;
      avgShortViews?: number;
      engagementRate?: number;
      longEngagementRate?: number;
      shortEngagementRate?: number;
      rateCardItems?: Array<{
        format: DeliverableFormat;
        amount: number;
        formattedAmount: string;
        lowAmount: number;
        formattedLow: string;
        highAmount: number;
        formattedHigh: string;
        currency: string;
        usdEquivalentFormatted?: string;
      }>;
      videos?: YouTubeVideoItem[];
    };
    tiktok?: {
      status: string;
      username?: string;
      followerCount?: number;
      avgLikes?: number;
      avgComments?: number;
      avgViews?: number;
      engagementRate?: number;
      rateCardItems?: Array<{
        format: DeliverableFormat;
        amount: number;
        formattedAmount: string;
        lowAmount: number;
        formattedLow: string;
        highAmount: number;
        formattedHigh: string;
        currency: string;
        usdEquivalentFormatted?: string;
      }>;
      videos?: TikTokVideoItem[];
    };
  };
  recommendedPackages?: GeneratedPackage[];
  completeIntelligence?: CompleteCreatorIntelligence | null;
}

function formatShortNumber(num?: number | null): string {
  if (num === null || num === undefined) return "—";
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString("en-US");
}

function formatPercentage(num?: number | null): string {
  if (num === null || num === undefined) return "—";
  return `${Number(num).toFixed(2)}%`;
}

// Inline SVG platform icons to guarantee 100% offline, vector-crisp rendering
const SVG_ICONS = {
  youtube: `<svg width="14" height="14" viewBox="0 0 24 24" fill="#dc2626"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  instagram: `<svg width="14" height="14" viewBox="0 0 24 24" fill="#db2777"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  tiktok: `<svg width="14" height="14" viewBox="0 0 24 24" fill="#09090b"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .594.045.87.134V9.41a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.28 6.28 0 0 0 1.87-4.48V8.71a8.31 8.31 0 0 0 3.9 1.02V6.69z"/></svg>`,
  shield: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  check: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
};

export async function generateRateCardPDF(payload: RateCardPdfPayload): Promise<Buffer> {
  const {
    creatorMeta,
    selectedRegion,
    activeNicheName,
    activeSubNicheName,
    totalAudienceCount,
    verifiedChannelsCount,
    platforms,
    recommendedPackages = [],
    completeIntelligence,
  } = payload;

  const regionInfo = REGIONAL_CONFIG[selectedRegion] || REGIONAL_CONFIG["US"];
  const reportRef = `BB-VAL-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const auditDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Collect all verified platform rate card rows
  const allRateRows: Array<{
    platform: Platform;
    format: DeliverableFormat;
    label: string;
    tag: string;
    formattedAmount: string;
    formattedRange: string;
    usdEquivalentFormatted?: string;
  }> = [];

  const platformKeys: Platform[] = ["youtube", "instagram", "tiktok"];
  for (const plat of platformKeys) {
    const pData = platforms[plat];
    if (pData?.status === "ready" && pData.rateCardItems?.length) {
      for (const item of pData.rateCardItems) {
        const info = FORMAT_LABELS[item.format] || { label: item.format, tag: plat, platform: plat };
        allRateRows.push({
          platform: plat,
          format: item.format,
          label: info.label,
          tag: info.tag,
          formattedAmount: item.formattedAmount,
          formattedRange: `${item.formattedLow} – ${item.formattedHigh}`,
          usdEquivalentFormatted: item.usdEquivalentFormatted,
        });
      }
    }
  }

  // Construct HTML
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BrandBridge Valuation Dossier - ${creatorMeta.displayName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 14mm 14mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #09090b;
      background: #ffffff;
      font-size: 9pt;
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #18181b;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .brand-title {
      font-size: 13pt;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #09090b;
      text-transform: uppercase;
    }
    .brand-sub {
      font-size: 7.5pt;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: #71717a;
      text-transform: uppercase;
    }
    .doc-meta {
      text-align: right;
      font-size: 7.5pt;
      color: #52525b;
      font-family: ui-monospace, "SF Mono", Menlo, monospace;
    }
    .doc-ref {
      font-weight: 700;
      color: #09090b;
    }

    /* Identity Card */
    .identity-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .creator-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .avatar-box {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #09090b;
      color: #ffffff;
      font-weight: 800;
      font-size: 14pt;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #e2e8f0;
      overflow: hidden;
      flex-shrink: 0;
    }
    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .creator-name {
      font-size: 13pt;
      font-weight: 800;
      color: #09090b;
      letter-spacing: -0.3px;
    }
    .creator-handle {
      font-size: 8pt;
      color: #71717a;
      font-family: ui-monospace, "SF Mono", Menlo, monospace;
    }
    .verified-channels {
      display: flex;
      gap: 6px;
      margin-top: 4px;
    }
    .channel-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 7pt;
      font-weight: 600;
      color: #334155;
    }
    .identity-stats {
      display: flex;
      gap: 16px;
      text-align: right;
    }
    .stat-box {
      border-left: 1px solid #e2e8f0;
      padding-left: 12px;
    }
    .stat-label {
      font-size: 7pt;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.5px;
    }
    .stat-val {
      font-size: 12pt;
      font-weight: 800;
      color: #09090b;
      font-family: ui-monospace, "SF Mono", Menlo, monospace;
    }

    /* Section Headings */
    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 1.5px solid #09090b;
      padding-bottom: 3px;
      margin-bottom: 8px;
      margin-top: 14px;
    }
    .section-title {
      font-size: 9pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #09090b;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .section-desc {
      font-size: 7pt;
      color: #64748b;
    }

    /* Data Tables */
    table.audit-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 8pt;
    }
    table.audit-table th {
      background: #09090b;
      color: #ffffff;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 6.5pt;
      letter-spacing: 0.5px;
      padding: 6px 8px;
      text-align: left;
    }
    table.audit-table th.num, table.audit-table td.num {
      text-align: right;
    }
    table.audit-table td {
      padding: 6px 8px;
      border-bottom: 1px solid #e2e8f0;
      color: #18181b;
    }
    table.audit-table tr:nth-child(even) td {
      background: #f8fafc;
    }
    .fmt-pill {
      display: inline-block;
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 6.5pt;
      font-weight: 700;
      text-transform: uppercase;
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1;
      margin-right: 4px;
    }
    .mono {
      font-family: ui-monospace, "SF Mono", Menlo, monospace;
      font-weight: 600;
    }
    .mono-bold {
      font-family: ui-monospace, "SF Mono", Menlo, monospace;
      font-weight: 800;
      color: #09090b;
    }

    /* Omnichannel Packages Grid */
    .packages-grid {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
    .pkg-card {
      flex: 1;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 9px 10px;
      position: relative;
    }
    .pkg-card.rec {
      border: 1.5px solid #09090b;
      background: #fafafa;
    }
    .pkg-badge {
      display: inline-block;
      font-size: 6pt;
      font-weight: 800;
      text-transform: uppercase;
      padding: 1px 5px;
      border-radius: 3px;
      background: #09090b;
      color: #ffffff;
      margin-bottom: 4px;
    }
    .pkg-name {
      font-size: 8.5pt;
      font-weight: 800;
      color: #09090b;
    }
    .pkg-tagline {
      font-size: 6.5pt;
      color: #64748b;
      margin-bottom: 6px;
      line-height: 1.25;
    }
    .pkg-price {
      font-size: 11pt;
      font-weight: 900;
      color: #09090b;
      font-family: ui-monospace, "SF Mono", Menlo, monospace;
      border-top: 1px solid #e2e8f0;
      padding-top: 5px;
      margin-top: 4px;
    }
    .pkg-delivs {
      font-size: 6.5pt;
      color: #475569;
      margin-top: 5px;
      line-height: 1.35;
    }

    /* 4-Block Intelligence Matrix */
    .intel-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 12px;
    }
    .intel-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
    }
    .intel-label {
      font-size: 6.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
      margin-bottom: 4px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 2px;
    }
    .intel-row {
      display: flex;
      justify-content: space-between;
      font-size: 7pt;
      margin-bottom: 2px;
    }
    .intel-val {
      font-weight: 700;
      color: #09090b;
    }

    /* Page Footer */
    .doc-footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 6px;
      margin-top: 14px;
      display: flex;
      justify-content: space-between;
      font-size: 6.5pt;
      color: #64748b;
      font-family: ui-monospace, "SF Mono", Menlo, monospace;
    }
    .avoid-break {
      page-break-inside: avoid;
    }
  </style>
</head>
<body>

  <!-- 1. Header Bar -->
  <div class="header-bar">
    <div>
      <div class="brand-title">BrandBridge</div>
      <div class="brand-sub">Empirical Creator Valuation &amp; Media Procurement Terminal</div>
    </div>
    <div class="doc-meta">
      <div>REPORT REF: <span class="doc-ref">${reportRef}</span></div>
      <div>AUDIT DATE: ${auditDate}</div>
      <div>VALUATION BASE: ${regionInfo.name} (${regionInfo.currency})</div>
    </div>
  </div>

  <!-- 2. Creator Identity Card -->
  <div class="identity-card">
    <div class="creator-left">
      <div class="avatar-box">
        ${
          creatorMeta.avatarUrl
            ? `<img src="${creatorMeta.avatarUrl}" class="avatar-img" alt="avatar" />`
            : creatorMeta.displayName.slice(0, 2).toUpperCase()
        }
      </div>
      <div>
        <div class="creator-name">${creatorMeta.displayName}</div>
        <div class="creator-handle">@${creatorMeta.primaryUsername.replace(/^@+/, "")}</div>
        <div class="verified-channels">
          ${
            platforms.youtube?.status === "ready"
              ? `<span class="channel-badge">${SVG_ICONS.youtube} YouTube (${formatShortNumber(platforms.youtube.followerCount)})</span>`
              : ""
          }
          ${
            platforms.instagram?.status === "ready"
              ? `<span class="channel-badge">${SVG_ICONS.instagram} Instagram (${formatShortNumber(platforms.instagram.followerCount)})</span>`
              : ""
          }
          ${
            platforms.tiktok?.status === "ready"
              ? `<span class="channel-badge">${SVG_ICONS.tiktok} TikTok (${formatShortNumber(platforms.tiktok.followerCount)})</span>`
              : ""
          }
        </div>
      </div>
    </div>

    <div class="identity-stats">
      <div class="stat-box">
        <div class="stat-label">Combined Reach</div>
        <div class="stat-val">${formatShortNumber(totalAudienceCount)}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Active Channels</div>
        <div class="stat-val">${verifiedChannelsCount} Verified</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Sector / Niche</div>
        <div class="stat-val" style="font-size: 8.5pt; font-family: inherit;">${activeNicheName || "General Entertainment"}</div>
      </div>
    </div>
  </div>

  <!-- 3. Executive Rate Card Section -->
  <div class="section-head">
    <div class="section-title">
      1. Institutional Commercial Rate Card Schedule
    </div>
    <div class="section-desc">Defended median deliverables pricing calibrated against verified empirical audience reach</div>
  </div>

  <table class="audit-table">
    <thead>
      <tr>
        <th style="width: 28%;">Platform &amp; Deliverable Format</th>
        <th class="num" style="width: 22%;">Baseline Median (${regionInfo.currency})</th>
        <th class="num" style="width: 26%;">Negotiation Band (Low – High)</th>
        <th class="num" style="width: 24%;">USD Conversion Equiv.</th>
      </tr>
    </thead>
    <tbody>
      ${
        allRateRows.length > 0
          ? allRateRows
              .map((row) => {
                const iconSvg =
                  row.platform === "youtube"
                    ? SVG_ICONS.youtube
                    : row.platform === "instagram"
                    ? SVG_ICONS.instagram
                    : SVG_ICONS.tiktok;
                return `
        <tr>
          <td>
            <span style="vertical-align: middle; display: inline-flex; align-items: center; margin-right: 4px;">
              ${iconSvg}
            </span>
            <span class="fmt-pill">${row.tag}</span>
            <strong style="font-size: 8pt;">${row.label}</strong>
          </td>
          <td class="num mono-bold">${row.formattedAmount}</td>
          <td class="num mono" style="color: #475569;">${row.formattedRange}</td>
          <td class="num mono" style="color: #0284c7;">${row.usdEquivalentFormatted || "—"}</td>
        </tr>
      `;
              })
              .join("")
          : `<tr><td colspan="4" style="text-align: center; color: #94a3b8;">No rate card deliverables configured.</td></tr>`
      }
    </tbody>
  </table>

  <!-- 4. Strategic Omnichannel Packages (If Available) -->
  ${
    recommendedPackages.length > 0
      ? `
  <div class="avoid-break">
    <div class="section-head">
      <div class="section-title">
        2. Recommended Omnichannel Campaign Bundles
      </div>
      <div class="section-desc">Turnkey multi-platform procurement packages with built-in bundling economics</div>
    </div>

    <div class="packages-grid">
      ${recommendedPackages
        .slice(0, 3)
        .map(
          (pkg) => `
        <div class="pkg-card ${pkg.isRecommended ? "rec" : ""}">
          <div class="pkg-badge">${pkg.tag || "Campaign Tier"}</div>
          <div class="pkg-name">${pkg.name}</div>
          <div class="pkg-tagline">${pkg.objective || ""}</div>
          <div class="pkg-price">${pkg.pricing?.typicalFormatted || "—"}</div>
          <div style="font-size: 6pt; color: #059669; font-weight: bold; margin-top: 1px;">
            ${pkg.pricing?.savingsFormatted ? `${pkg.pricing.savingsFormatted} Bundle Savings` : "Optimized Multi-Platform Rate"}
            ${pkg.pricing?.usdEquivalentTypical ? ` • (${pkg.pricing.usdEquivalentTypical})` : ""}
          </div>
          <div class="pkg-delivs">
            ${(pkg.calibratedDeliverables || pkg.deliverables || [])
              .slice(0, 3)
              .map((d: any) => `<div>• ${d.quantity}x ${d.title || d.formatKey || "Deliverable"}</div>`)
              .join("")}
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  </div>
  `
      : ""
  }

  <!-- 5. Intelligence Matrix & Audience DNA -->
  ${
    completeIntelligence
      ? `
  <div class="avoid-break">
    <div class="section-head">
      <div class="section-title">
        3. Strategic Creator DNA &amp; Intelligence Matrix
      </div>
      <div class="section-desc">Synthesized commercial buyer demographics, brand safety, and regional reach</div>
    </div>

    <div class="intel-grid">
      <div class="intel-box">
        <div class="intel-label">Audience Demographics &amp; Commercial Intent</div>
        <div class="intel-row">
          <span>Demographic Skew</span>
          <span class="intel-val">${completeIntelligence.audience?.genderSkew || "Balanced"}, ${completeIntelligence.audience?.likelyAgeRange || "18-34"}</span>
        </div>
        <div class="intel-row">
          <span>Buyer Purchase Intent</span>
          <span class="intel-val">${completeIntelligence.audience?.purchaseIntent || "Moderate"} Commercial Intent</span>
        </div>
        <div class="intel-row">
          <span>Dominant Content Format</span>
          <span class="intel-val">${completeIntelligence.content?.dominantFormat || "Video"}</span>
        </div>
      </div>

      <div class="intel-box">
        <div class="intel-label">Brand Safety &amp; Strategic Strengths</div>
        <div class="intel-row">
          <span>Brand Safety Risk</span>
          <span class="intel-val" style="color: #059669;">● ${completeIntelligence.brandSafety?.overallRisk || "Low"} Risk Profile</span>
        </div>
        <div class="intel-row">
          <span>Primary Geographic Market</span>
          <span class="intel-val">${completeIntelligence.geography?.countryName || regionInfo.name}</span>
        </div>
        <div class="intel-row">
          <span>Primary Strategic Anchor</span>
          <span class="intel-val">${completeIntelligence.strengths?.[0]?.area || "Organic Retention"}</span>
        </div>
      </div>
    </div>
  </div>
  `
      : ""
  }

  <!-- 6. Empirical Performance Baselines Defense (Appendix) -->
  <div class="avoid-break">
    <div class="section-head">
      <div class="section-title">
        4. Empirical Audience Interaction Baselines (Verification Appendix)
      </div>
      <div class="section-desc">Normalized sample baselines defending institutional rate card valuations</div>
    </div>

    <table class="audit-table">
      <thead>
        <tr>
          <th>Platform Channel</th>
          <th class="num">Audience Base</th>
          <th class="num">Verified Median Views</th>
          <th class="num">Normalized Likes</th>
          <th class="num">Audited Comments</th>
          <th class="num">Eng. Rate (ER)</th>
        </tr>
      </thead>
      <tbody>
        ${
          platforms.youtube?.status === "ready"
            ? `
          <tr>
            <td><strong>${SVG_ICONS.youtube} YouTube Channel</strong></td>
            <td class="num mono">${formatShortNumber(platforms.youtube.followerCount)}</td>
            <td class="num mono">${formatShortNumber(platforms.youtube.avgViews)}</td>
            <td class="num mono">${formatShortNumber(platforms.youtube.avgLikes)}</td>
            <td class="num mono">${formatShortNumber(platforms.youtube.avgComments)}</td>
            <td class="num mono-bold" style="color: #059669;">${formatPercentage(platforms.youtube.engagementRate)}</td>
          </tr>
        `
            : ""
        }
        ${
          platforms.instagram?.status === "ready"
            ? `
          <tr>
            <td><strong>${SVG_ICONS.instagram} Instagram Account</strong></td>
            <td class="num mono">${formatShortNumber(platforms.instagram.followerCount)}</td>
            <td class="num mono" style="color: #94a3b8;">— (IG Private)</td>
            <td class="num mono">${formatShortNumber(platforms.instagram.avgLikes)}</td>
            <td class="num mono">${formatShortNumber(platforms.instagram.avgComments)}</td>
            <td class="num mono-bold" style="color: #059669;">${formatPercentage(platforms.instagram.engagementRate)}*</td>
          </tr>
        `
            : ""
        }
        ${
          platforms.tiktok?.status === "ready"
            ? `
          <tr>
            <td><strong>${SVG_ICONS.tiktok} TikTok Account</strong></td>
            <td class="num mono">${formatShortNumber(platforms.tiktok.followerCount)}</td>
            <td class="num mono">${formatShortNumber(platforms.tiktok.avgViews)}</td>
            <td class="num mono">${formatShortNumber(platforms.tiktok.avgLikes)}</td>
            <td class="num mono">${formatShortNumber(platforms.tiktok.avgComments)}</td>
            <td class="num mono-bold" style="color: #059669;">${formatPercentage(platforms.tiktok.engagementRate)}</td>
          </tr>
        `
            : ""
        }
      </tbody>
    </table>
    <div style="font-size: 6.5pt; color: #64748b; margin-top: -6px; margin-bottom: 10px;">
      * Note: Instagram engagement rates reflect follower-benchmarked interaction ratios ((Likes + Comments) / Followers) in accordance with institutional procurement standards.
    </div>
  </div>

  <!-- 7. Document Verification Footer -->
  <div class="doc-footer">
    <div>
      CONFIDENTIAL &amp; PROPRIETARY • GENERATED BY BRANDBRIDGE VALUATION ENGINE • 30-DAY COMMERCIAL VALIDITY
    </div>
    <div>
      VERIFICATION REF: ${reportRef} • PAGE 1 OF 1
    </div>
  </div>

</body>
</html>
  `;

  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
