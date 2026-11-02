"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Users, ChartNoAxesCombined, MapPin, Info } from "lucide-react";
import { PlatformBadge } from "@/components/icons/PlatformIcons";

export interface PlatformMetric {
  handle: string;
  followers: number;
  er?: number;
  lfEr?: number;
  sfEr?: number;
}

export interface FlagshipRateItem {
  platform: "youtube" | "instagram" | "tiktok";
  format: string;
  label: string;
  recommendedAmount: number;
  formattedRecommended: string;
  lowAmount: number;
  formattedLow: string;
  highAmount: number;
  formattedHigh: string;
  currency: string;
  symbol: string;
  erPercent: number;
  erLabel: string;
}

export interface CreatorItem {
  id: string;
  slug: string;
  canonicalName: string;
  brandName?: string | null;
  creatorType?: string | null;
  primaryNicheId?: number | null;
  primaryNicheName?: string | null;
  subNicheName?: string | null;
  countryCode?: string | null;
  countryName?: string | null;
  primaryAudienceCountry?: { name: string; code?: string };
  combinedFollowers: number;
  primaryPlatform: string;
  avatarUrl?: string | null;
  verifiedEmail?: string | null;
  typicalRateMinUsd?: number | null;
  typicalRateMaxUsd?: number | null;
  avgEngagementRate?: number | null;
  isClaimed: boolean;
  handles: {
    youtube?: string | null;
    instagram?: string | null;
    tiktok?: string | null;
  };
  platforms?: {
    youtube?: PlatformMetric | null;
    instagram?: PlatformMetric | null;
    tiktok?: PlatformMetric | null;
  };
  flagshipRates?: FlagshipRateItem[];
  audienceFit?: {
    demographicProfile?: string;
    commercialBuyerIntent?: string;
    interests: string[];
  };
}

export function formatFollowerCount(num: number): string {
  if (!num) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return num.toLocaleString();
}

export { formatCardEstimate, getRangeMarkerPosition } from "./CreatorPriceRange";
import { CreatorPriceRange } from "./CreatorPriceRange";

interface CreatorCardProps {
  creator: CreatorItem;
  className?: string;
  layout?: "card" | "directory";
}

export function CreatorCard({ creator, className = "", layout = "card" }: CreatorCardProps) {
  const name = creator.brandName || creator.canonicalName;
  const audienceCountry = layout === "directory" ? creator.primaryAudienceCountry : { name: creator.countryName || creator.countryCode || "", code: creator.countryCode || undefined };

  return (
    <div
      className={`group relative flex flex-col justify-between p-5 rounded-[9px] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-200 ${layout === "directory" ? "directory-creator-row" : ""} ${className}`}
    >
      {/* Top Content: Anchored firmly at the top */}
      <div className={`space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800/60 ${layout === "directory" ? "directory-creator-content" : ""}`}>
        {/* Header: Avatar, Identity & Primary Audience/Niches */}
        <div className="creator-profile pb-3 space-y-2">
          <div className="creator-identity-heading flex items-center gap-3.5">
            <Link
              href={`/creators/${creator.slug}`}
              className="creator-avatar relative shrink-0 block"
            >
              {creator.avatarUrl ? (
                <>
                  <img
                    src={creator.avatarUrl}
                    alt={name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700 hover:opacity-90 transition"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = "none";
                      const fallback = target.nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                  <div
                    style={{ display: "none" }}
                    className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700 items-center justify-center font-bold text-lg text-zinc-500"
                  >
                    {name.charAt(0)}
                  </div>
                </>
              ) : (
                <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700 flex items-center justify-center font-bold text-lg text-zinc-500">
                  {name.charAt(0)}
                </div>
              )}
              {creator.isClaimed && (
                <div className="absolute bottom-0 right-0 p-0.5 bg-blue-600 rounded-full text-white ring-2 ring-white dark:ring-zinc-900 shadow-xs">
                  <ShieldCheck className="w-3 h-3" />
                </div>
              )}
            </Link>

            <div className="space-y-0.5 min-w-0 flex-1">
              <Link
                href={`/creators/${creator.slug}`}
                className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition"
              >
                <h3 className="creator-name text-base font-bold text-zinc-900 dark:text-white whitespace-normal break-words">
                  {name}
                </h3>
              </Link>
              {creator.canonicalName && (layout !== "directory" || creator.canonicalName.trim().toLowerCase() !== name.trim().toLowerCase()) && (
                <p className="creator-alias text-xs text-zinc-400 dark:text-zinc-500 font-medium whitespace-normal break-words">
                  {creator.canonicalName}
                </p>
              )}

            </div>
          </div>

              {creator.primaryNicheName && (
                <p
                  className="creator-niche text-xs font-semibold text-zinc-800 dark:text-zinc-200 whitespace-normal break-words"
                  title={creator.primaryNicheName}
                >
                  {creator.primaryNicheName}
                </p>
              )}
            {creator.subNicheName && (
              <div
                className="creator-subniche text-zinc-600 dark:text-zinc-400 whitespace-normal break-words"
                title={creator.subNicheName}
              >
                {creator.subNicheName}
              </div>
            )}
          {/* Primary Audience & Sub-Niche (Directly below identity, no divider) */}
          <div className="space-y-1 text-xs pt-0.5">
            {audienceCountry?.name && (
              <div className="creator-audience text-zinc-700 dark:text-zinc-300">
                {layout === "directory" && <MapPin aria-hidden="true" className="mr-1 inline-block h-3 w-3 text-zinc-400" strokeWidth={1.5} />}
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                  Primary Audience:{" "}
                </span>
                <span className="creator-audience-country font-semibold text-zinc-900 dark:text-zinc-100">
                  {audienceCountry.code && /^[a-z]{2}$/i.test(audienceCountry.code) && (
                    <img
                      src={`https://flagcdn.com/w40/${audienceCountry.code.toLowerCase()}.png`}
                      alt=""
                      aria-hidden="true"
                      width={12}
                      height={12}
                      loading="lazy"
                      className="creator-country-flag"
                      onError={(event) => { event.currentTarget.style.display = "none"; }}
                    />
                  )}
                  {audienceCountry.name}
                </span>
              </div>
            )}

          </div>

        </div>

        {/* Platform Rates List (Flat, anchored directly below header) */}
        {(() => {
          const activePlatforms: Array<{
            platform: "youtube" | "instagram" | "tiktok";
            handle: string;
            followers: number;
            unit: string;
            metricsText: string;
            deliverableName: string;
            rate?: FlagshipRateItem;
          }> = [];

          if (
            creator.platforms?.youtube &&
            (creator.platforms.youtube.followers > 0 || creator.platforms.youtube.handle)
          ) {
            const m = creator.platforms.youtube;
            const rate = creator.flagshipRates?.find(
              (r) => r.platform === "youtube" || r.format === "yt_dedicated"
            );
            const lfEr = Number(m.lfEr || m.er || rate?.erPercent || 1.8);
            const sfEr = Number(m.sfEr || 2.5);
            activePlatforms.push({
              platform: "youtube",
              handle: m.handle,
              followers: m.followers,
              unit: "Subscribers",
              metricsText: layout === "directory"
                ? `LF ER: ${lfEr.toFixed(2).replace(/\.00$/, "")}%`
                : `LF ER: ${lfEr.toFixed(2).replace(/\.00$/, "")}% · SF ER: ${sfEr.toFixed(2).replace(/\.00$/, "")}%`,
              deliverableName: "YouTube long-form",
              rate,
            });
            if (layout === "directory") {
              activePlatforms.push({
                platform: "youtube",
                handle: m.handle,
                followers: m.followers,
                unit: "Subscribers",
                metricsText: `SF ER: ${sfEr.toFixed(2).replace(/\.00$/, "")}%`,
                deliverableName: "YouTube Shorts",
                rate: creator.flagshipRates?.find((r) => r.platform === "youtube" && r.format === "yt_short"),
              });
            }
          }

          if (
            creator.platforms?.instagram &&
            (creator.platforms.instagram.followers > 0 || creator.platforms.instagram.handle)
          ) {
            const m = creator.platforms.instagram;
            const rate = creator.flagshipRates?.find(
              (r) => r.platform === "instagram" || r.format === "ig_reel"
            );
            const er = Number(m.er || rate?.erPercent || 1.47);
            activePlatforms.push({
              platform: "instagram",
              handle: m.handle,
              followers: m.followers,
              unit: "Followers",
              metricsText: `ER: ${er.toFixed(2).replace(/\.00$/, "")}%`,
              deliverableName: "Instagram Reel",
              rate,
            });
          }

          if (
            creator.platforms?.tiktok &&
            (creator.platforms.tiktok.followers > 0 || creator.platforms.tiktok.handle)
          ) {
            const m = creator.platforms.tiktok;
            const rate = creator.flagshipRates?.find(
              (r) => r.platform === "tiktok" || r.format === "tiktok_video"
            );
            const er = Number(m.er || rate?.erPercent || 4.24);
            activePlatforms.push({
              platform: "tiktok",
              handle: m.handle,
              followers: m.followers,
              unit: "Followers",
              metricsText: `ER: ${er.toFixed(2).replace(/\.00$/, "")}%`,
              deliverableName: "TikTok Video",
              rate,
            });
          }

          // Order by audience size descending (primary flagship platform at top)
          activePlatforms.sort((a, b) => b.followers - a.followers);

          if (activePlatforms.length === 0) {
            return (
              <div className="py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
                No active verified channels linked
              </div>
            );
          }

          return (
            <div className={`divide-y divide-zinc-100 dark:divide-zinc-800/60 ${layout === "directory" ? "directory-platforms" : ""}`}>
              {activePlatforms.map((p) => {
                if (layout === "directory" && p.platform === "youtube") {
                  if (p.deliverableName === "YouTube Shorts") return null;
                  const formats = activePlatforms.filter((item) => item.platform === "youtube");
                  return (
                    <div key="youtube" className="creator-platform-row creator-youtube-group">
                      <div className="creator-platform-summary">
                        <div className="flex items-center gap-2">
                          <PlatformBadge platform="youtube" size="sm" />
                          <span className="creator-handle min-w-0 text-xs font-semibold text-zinc-900 dark:text-white">@{p.handle}</span>
                        </div>
                        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-200">
                          <Users aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-rose-400" strokeWidth={1.5} />
                          {formatFollowerCount(p.followers)} {p.unit}
                        </p>
                        <div className="creator-youtube-engagement mt-2 space-y-1">
                          {formats.map((format) => (
                            <React.Fragment key={format.deliverableName}>
                            <p className="creator-platform-er flex items-start gap-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                              <ChartNoAxesCombined aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" strokeWidth={1.5} />
                              <strong className="creator-er-value">{format.metricsText.slice(format.metricsText.indexOf(":") + 1).trim()}</strong>
                              <span className="creator-er-label">{format.deliverableName === "YouTube Shorts" ? "SF Engagement Rate" : "LF Engagement Rate"}</span>
                            </p>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                      <div className="creator-youtube-formats">
                        {formats.map((format) => (
                          <div key={format.deliverableName} className="creator-youtube-format">

                            {format.rate ? (
                              <CreatorPriceRange rate={format.rate} label={format.deliverableName} />
                            ) : (
                              <p className="creator-youtube-unavailable text-xs text-zinc-500">{format.deliverableName === "YouTube Shorts" ? "Shorts price not available in directory" : "Price estimate unavailable"}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                <div key={`${p.platform}-${p.deliverableName}`} className="creator-platform-row py-3 space-y-1">
                  {/* Line 1: SVG Icon + Full Handle */}
                  <div className="creator-platform-summary">
                  <div className="flex items-center gap-2">
                    <PlatformBadge platform={p.platform} size="sm" />
                    <div className="min-w-0">
                    <span className="creator-handle min-w-0 font-semibold text-zinc-900 dark:text-white font-sans text-xs whitespace-normal break-words">
                      @{p.handle}
                    </span>
                    </div>
                  </div>

                  {/* Line 2: Audience Metrics & ER */}
                  <div className="creator-platform-metrics text-xs font-sans text-zinc-600 dark:text-zinc-400 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-200">
                      {layout === "directory" && <Users aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-rose-400" strokeWidth={1.5} />}
                      {formatFollowerCount(p.followers)} {p.unit}
                    </span>
                  </div>
                  {p.metricsText && (
                    <div className="creator-platform-er flex items-start gap-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {layout === "directory" && <ChartNoAxesCombined aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" strokeWidth={1.5} />}
                      {layout === "directory" ? (
                        <>
                          <strong className="creator-er-value">{p.metricsText.slice(p.metricsText.indexOf(":") + 1).trim()}</strong>
                          <span className="creator-er-label">Engagement Rate</span>
                        </>
                      ) : p.metricsText}
                    </div>
                  )}
                  </div>
                  {p.rate ? (
                    <CreatorPriceRange rate={p.rate} label={p.deliverableName} />
                  ) : (
                    <p className="creator-price-unavailable pt-2 text-xs text-zinc-500">{p.deliverableName === "YouTube Shorts" ? "Shorts price not available in directory" : "Price estimate unavailable"}</p>
                  )}
                </div>
                );
              })}
            </div>
          );
        })()}
        {layout === "directory" && (
          <aside className="creator-audience-fit" aria-label="Estimated audience fit">
            {creator.audienceFit?.demographicProfile && (
              <div className="audience-fit-field audience-demographic"><p>Demographic profile</p><strong>{creator.audienceFit.demographicProfile}</strong></div>
            )}
            {creator.audienceFit?.commercialBuyerIntent && (
              <div className="audience-fit-field audience-buyer-intent"><p>Buyer intent <span title="Indicates the audience’s likely interest in purchasing products relevant to this creator. AI analyzes the profile and available supporting data to identify audience interests and commercial signals. This is an evidence-informed assessment, not measured conversions or a guarantee of sales." tabIndex={0} aria-label="About buyer intent: an evidence-informed assessment, not measured conversions or a guarantee of sales"><Info aria-hidden="true" className="inline h-3 w-3" /></span></p><strong>{creator.audienceFit.commercialBuyerIntent}</strong></div>
            )}
            {!!creator.audienceFit?.interests.length && (
              <div className="audience-fit-field audience-interests-desktop"><p>Top interests</p>
                <div className="audience-interest-chips">{creator.audienceFit.interests.slice(0, 3).map((interest, index) => <span key={`${interest}-${index}`}>{interest}</span>)}</div>
                {creator.audienceFit.interests.length > 3 && (
                  <details className="audience-more-interests"><summary>+{creator.audienceFit.interests.length - 3} more</summary><div className="audience-interest-chips">{creator.audienceFit.interests.slice(3).map((interest, index) => <span key={`${interest}-${index}`}>{interest}</span>)}</div></details>
                )}
              </div>
            )}
            {!!creator.audienceFit?.interests.length && (
              <details className="audience-interests-mobile">
                <summary>Show interests <span>({creator.audienceFit.interests.length})</span></summary>
                <div className="audience-interest-chips">{creator.audienceFit.interests.map((interest, index) => <span key={`${interest}-${index}`}>{interest}</span>)}</div>
              </details>
            )}
            {!creator.audienceFit?.demographicProfile && !creator.audienceFit?.commercialBuyerIntent && !creator.audienceFit?.interests.length && <p className="audience-fit-note mt-3">Audience insights not available yet.</p>}
            <Link href={`/creators/${creator.slug}`} className="creator-profile-action audience-fit-action mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors">
              View creator DNA
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          </aside>
        )}
      </div>

      {/* Bottom action retained for the shared homepage card. */}
      {layout !== "directory" && (
      <div className="pt-4 mt-auto">
        <Link
          href={`/creators/${creator.slug}`}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold rounded-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-white transition-all shadow-xs group-hover:bg-blue-600 dark:group-hover:bg-blue-500 dark:group-hover:text-white"
        >
          <span>View creator DNA</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      )}
    </div>
  );
}
