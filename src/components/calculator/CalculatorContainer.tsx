"use client";

import React, { useState, useMemo } from "react";
import {
  PricingInput,
  CreatorMetrics,
  DeliverableItem,
  CommercialTerms,
  ProductionAddons,
  Platform,
  DeliverableFormat,
  RegionCode,
} from "@/lib/calculator/types";
import { calculateInfluencerRate } from "@/lib/calculator/engine";
import { CreatorAIClassification } from "@/lib/ai/gemini";
import { ProfileImportHeader } from "./ProfileImportHeader";
import { CreatorProfileForm } from "./CreatorProfileForm";
import { DeliverablesBuilder } from "./DeliverablesBuilder";
import { CommercialTermsForm } from "./CommercialTermsForm";
import { ProductionAddonsForm } from "./ProductionAddonsForm";
import { ValuationSummaryCard } from "./ValuationSummaryCard";

import { MultiPlatformCalculatorGrid } from "./MultiPlatformCalculatorGrid";
import { RateCardDeliverableItem } from "./PlatformRateCard";

interface ImportedCreatorData {
  username: string;
  displayName: string;
  avatarUrl: string;
  biography?: string;
  platform: Platform;
  followerCount: number;
  avgLikes: number;
  avgComments: number;
  avgViews: number;
  avgShares?: number;
  externalLinks?: Array<{ platform: string; url: string }>;
}

export function CalculatorContainer() {
  // Imported state from Scraper + AI
  const [importedCreator, setImportedCreator] = useState<ImportedCreatorData | null>(null);
  const [aiEnrichment, setAiEnrichment] = useState<CreatorAIClassification | null>(null);
  const [rateCardItems, setRateCardItems] = useState<RateCardDeliverableItem[] | undefined>(undefined);

  // 1. Creator Profile State
  const [metrics, setMetrics] = useState<CreatorMetrics>({
    followerCount: 25000,
    last3PostsAvgLikes: 650,
    last3PostsAvgComments: 35,
    last3PostsAvgViews: 12000,
    primaryPlatform: "instagram",
    primaryNicheId: 12, // Fashion & Apparel (0.53x)
    subNicheId: undefined,
    isLuxuryOrHighEnd: false,
    regionCode: "US",
  });

  // 2. Content Deliverables State
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>([
    {
      id: "deliv_1",
      platform: "instagram",
      format: "ig_reel",
      quantity: 1,
    },
  ]);

  // 3. Commercial Terms State
  const [commercialTerms, setCommercialTerms] = useState<CommercialTerms>({
    usageRights: {
      scope: "paid_partnership_ads",
      duration: "30_days",
    },
    exclusivity: {
      scope: "direct_competitors",
      duration: "14_days",
    },
    whitelisting: false,
  });

  // 4. Production Add-ons State
  const [productionAddons, setProductionAddons] = useState<ProductionAddons>({
    turnaround: "standard",
    rawFootageBuyout: false,
    extraRevisionsCount: 0,
    linkInBioDays: 0,
    pinnedHighlightMonths: 0,
    reimbursedExpenses: 0,
  });

  // Handle successful 1-click import from scraper
  const handleImportSuccess = (data: {
    creator: ImportedCreatorData;
    aiEnrichment: CreatorAIClassification;
    rateCardItems?: unknown[];
  }) => {
    setImportedCreator(data.creator);
    setAiEnrichment(data.aiEnrichment);
    if (Array.isArray(data.rateCardItems)) {
      setRateCardItems(data.rateCardItems as RateCardDeliverableItem[]);
    }

    // Update Creator Metrics
    setMetrics({
      followerCount: data.creator.followerCount,
      last3PostsAvgLikes: data.creator.avgLikes,
      last3PostsAvgComments: data.creator.avgComments,
      last3PostsAvgViews: data.creator.avgViews,
      last3PostsAvgShares: data.creator.avgShares,
      primaryPlatform: data.creator.platform,
      primaryNicheId: data.aiEnrichment.primaryNiche.id,
      secondaryNicheIds: data.aiEnrichment.secondaryNiches.map((s) => s.id),
      regionCode: (data.aiEnrichment.detectedCountry as RegionCode) || "US",
    });

    // Preset Default Deliverables for imported platform
    const platform = data.creator.platform;
    const newDeliverables: DeliverableItem[] = [];

    if (platform === "youtube") {
      newDeliverables.push({ id: "deliv_1", platform: "youtube", format: "yt_integrated", quantity: 1 });
      newDeliverables.push({ id: "deliv_2", platform: "youtube", format: "yt_short", quantity: 1 });
    } else if (platform === "instagram") {
      newDeliverables.push({ id: "deliv_1", platform: "instagram", format: "ig_reel", quantity: 1 });
    } else if (platform === "tiktok") {
      newDeliverables.push({ id: "deliv_1", platform: "tiktok", format: "tiktok_video", quantity: 1 });
    }

    setDeliverables(newDeliverables);
  };

  // Handle Quick Switch to Secondary Niche
  const handleSelectNiche = (nicheId: number) => {
    setMetrics((prev) => ({
      ...prev,
      primaryNicheId: nicheId,
      subNicheId: undefined,
    }));
  };

  // Aggregate Input for Calculation Engine
  const pricingInput: PricingInput = useMemo(() => {
    return {
      creator: metrics,
      deliverables,
      commercialTerms,
      productionAddons,
    };
  }, [metrics, deliverables, commercialTerms, productionAddons]);

  // Execute 9-Step 16-Knot Calculation Engine in Real-Time
  const calculationResult = useMemo(() => {
    return calculateInfluencerRate(pricingInput);
  }, [pricingInput]);

  return (
    <div className="space-y-8">
      {/* 1. Scraper Profile Import & AI Niche Bar */}
      <ProfileImportHeader
        onImportSuccess={handleImportSuccess}
        onSelectSecondaryNiche={handleSelectNiche}
        activeNicheId={metrics.primaryNicheId}
        importedCreator={importedCreator}
        aiEnrichment={aiEnrichment}
      />

      {/* 2. Omnichannel 4-Card Progressive Matrix */}
      <MultiPlatformCalculatorGrid
        initialPlatform={metrics.primaryPlatform}
        initialCreator={importedCreator || undefined}
        initialRateCardItems={rateCardItems}
        primaryNicheId={metrics.primaryNicheId}
        regionCode={metrics.regionCode}
      />

      {/* 3. Deep Campaign Customizer & Negotiation Bounds */}
      <div className="pt-4 border-t border-gray-200/80">
        <div className="mb-6">
          <h2 className="text-base font-black text-gray-950 uppercase tracking-tight">
            Custom Campaign &amp; Commercial Terms
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Fine-tune deliverable quantities, paid advertising rights, exclusivity lockouts, and rush addons
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (Forms & Parameters) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <CreatorProfileForm
              metrics={metrics}
              onChange={(updated) => setMetrics((prev) => ({ ...prev, ...updated }))}
            />

            <DeliverablesBuilder
              deliverables={deliverables}
              onChange={(items) => setDeliverables(items)}
            />

            <CommercialTermsForm
              terms={commercialTerms}
              onChange={(updated) => setCommercialTerms(updated)}
            />

            <ProductionAddonsForm
              addons={productionAddons}
              onChange={(updated) => setProductionAddons(updated)}
            />
          </div>

          {/* Right Column (Live Valuation Card & Negotiation Bounds) */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-6">
            <ValuationSummaryCard
              result={calculationResult}
              input={pricingInput}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
