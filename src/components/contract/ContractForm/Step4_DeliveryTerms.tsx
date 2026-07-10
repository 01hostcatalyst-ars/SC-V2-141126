"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select } from "@/components/ui/Select";

interface Step4Props {
  deliveryTimeframeDays: string;
  setDeliveryTimeframeDays: (val: string) => void;
  revisionRounds: number;
  setRevisionRounds: (val: number) => void;
  brandApprovalRequired: boolean;
  setBrandApprovalRequired: (val: boolean) => void;
  exclusivityClause: boolean;
  setExclusivityClause: (val: boolean) => void;
  exclusivityDuration: string;
  setExclusivityDuration: (val: string) => void;
  taggingRequirements: string;
  setTaggingRequirements: (val: string) => void;
  contentOwnership: string;
  setContentOwnership: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const APPROVAL_OPTIONS = [
  { label: "Approval Required (Draft submission before post)", value: "true" },
  { label: "No Approval Required (Creator posts directly)", value: "false" },
];

const EXCLUSIVITY_OPTIONS = [
  { label: "No campaign exclusivity requirements", value: "false" },
  { label: "Exclusivity Required during & post campaign", value: "true" },
];

export const Step4_DeliveryTerms: React.FC<Step4Props> = ({
  deliveryTimeframeDays,
  setDeliveryTimeframeDays,
  revisionRounds,
  setRevisionRounds,
  brandApprovalRequired,
  setBrandApprovalRequired,
  exclusivityClause,
  setExclusivityClause,
  exclusivityDuration,
  setExclusivityDuration,
  taggingRequirements,
  setTaggingRequirements,
  contentOwnership,
  setContentOwnership,
  onNext,
  onBack,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-1">Campaign & Delivery Terms</h3>
        <p className="text-xs text-slate-500">Define timelines, approvals, exclusivity, and content copyright.</p>
      </div>

      <div className="flex flex-col gap-5 border border-slate-900 bg-slate-900/10 p-6 rounded-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Delivery Deadline (Days after signing)"
            type="number"
            min={1}
            placeholder="14"
            value={deliveryTimeframeDays}
            onChange={(e) => setDeliveryTimeframeDays(e.target.value)}
          />
          <Input
            label="Revision Rounds Included"
            type="number"
            min={0}
            value={revisionRounds}
            onChange={(e) => setRevisionRounds(parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <Select
            label="Content Approval Policy"
            options={APPROVAL_OPTIONS}
            value={brandApprovalRequired.toString()}
            onChange={(e) => setBrandApprovalRequired(e.target.value === "true")}
          />
          <Select
            label="Exclusivity Category"
            options={EXCLUSIVITY_OPTIONS}
            value={exclusivityClause.toString()}
            onChange={(e) => setExclusivityClause(e.target.value === "true")}
          />
        </div>

        {exclusivityClause && (
          <Input
            label="Exclusivity Duration (e.g. 30 days post-campaign)"
            placeholder="e.g. 30 days for competitor brands"
            value={exclusivityDuration}
            onChange={(e) => setExclusivityDuration(e.target.value)}
          />
        )}

        <div className="border-t border-slate-900 pt-4 mt-2 flex flex-col gap-4">
          <Input
            label="Tagging / Caption Mention Requirements"
            placeholder="e.g. Tag @SapphirePK in caption and use hashtag #SapphireCollab"
            value={taggingRequirements}
            onChange={(e) => setTaggingRequirements(e.target.value)}
          />
          <Input
            label="Content Copyright & Ownership Clause"
            value={contentOwnership}
            onChange={(e) => setContentOwnership(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button variant="secondary" type="button" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext} disabled={!deliveryTimeframeDays}>
          Next Step
        </Button>
      </div>
    </div>
  );
};
