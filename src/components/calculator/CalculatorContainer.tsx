"use client";

import React, { useState, useMemo } from "react";
import {
  PricingInput,
  CreatorMetrics,
  DeliverableItem,
  CommercialTerms,
  ProductionAddons,
} from "@/lib/calculator/types";
import { calculateInfluencerRate } from "@/lib/calculator/engine";
import { CreatorProfileForm } from "./CreatorProfileForm";
import { DeliverablesBuilder } from "./DeliverablesBuilder";
import { CommercialTermsForm } from "./CommercialTermsForm";
import { ProductionAddonsForm } from "./ProductionAddonsForm";
import { ValuationSummaryCard } from "./ValuationSummaryCard";

export function CalculatorContainer() {
  // 1. Creator Profile State
  const [metrics, setMetrics] = useState<CreatorMetrics>({
    followerCount: 25000,
    last3PostsAvgLikes: 650,
    last3PostsAvgComments: 35,
    last3PostsAvgViews: 12000,
    primaryNicheId: 10, // Fashion & Apparel
    subNicheId: 1001, // Women's RTW
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

  // Aggregate Input for Calculation Engine
  const pricingInput: PricingInput = useMemo(() => {
    return {
      creator: metrics,
      deliverables,
      commercialTerms,
      productionAddons,
    };
  }, [metrics, deliverables, commercialTerms, productionAddons]);

  // Execute Calculation Engine in Real-Time
  const calculationResult = useMemo(() => {
    return calculateInfluencerRate(pricingInput);
  }, [pricingInput]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Form Column (Inputs) */}
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

      {/* Right Summary Column (Sticky Output Card) */}
      <div className="lg:col-span-5 xl:col-span-4">
        <ValuationSummaryCard result={calculationResult} input={pricingInput} />
      </div>
    </div>
  );
}
