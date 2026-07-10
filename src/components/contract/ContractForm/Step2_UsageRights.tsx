"use client";

import React from "react";
import { UsageType } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select } from "@/components/ui/Select";

interface Step2Props {
  platformsAllowed: string[];
  setPlatformsAllowed: React.Dispatch<React.SetStateAction<string[]>>;
  usageType: UsageType;
  setUsageType: (val: UsageType) => void;
  usageRightsDuration: string;
  setUsageRightsDuration: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const PLATFORM_OPTIONS = ["Instagram", "TikTok", "Facebook", "YouTube"];

const USAGE_OPTIONS = Object.keys(UsageType).map((type) => ({
  label: type.replace(/_/g, " "),
  value: type,
}));

const DURATION_OPTIONS = [
  { label: "3 Months", value: "3_months" },
  { label: "6 Months", value: "6_months" },
  { label: "1 Year", value: "1_year" },
  { label: "Perpetual / Lifetime", value: "perpetual" },
];

export const Step2_UsageRights: React.FC<Step2Props> = ({
  platformsAllowed,
  setPlatformsAllowed,
  usageType,
  setUsageType,
  usageRightsDuration,
  setUsageRightsDuration,
  onNext,
  onBack,
}) => {
  const handlePlatformChange = (platform: string, checked: boolean) => {
    if (checked) {
      setPlatformsAllowed((prev) => [...prev, platform]);
    } else {
      setPlatformsAllowed((prev) => prev.filter((p) => p !== platform));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-1">Usage Rights & Platforms</h3>
        <p className="text-xs text-slate-500">Specify where and how the content can be used commercially.</p>
      </div>

      <div className="flex flex-col gap-5 border border-slate-900 bg-slate-900/10 p-6 rounded-xl">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Allowed Platforms
          </span>
          <div className="flex flex-wrap gap-6 mt-1">
            {PLATFORM_OPTIONS.map((platform) => (
              <Checkbox
                key={platform}
                id={`platform-${platform}`}
                label={platform}
                checked={platformsAllowed.includes(platform)}
                onChange={(e) => handlePlatformChange(platform, e.target.checked)}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <Select
            label="Usage Rights Scope"
            options={USAGE_OPTIONS}
            value={usageType}
            onChange={(e) => setUsageType(e.target.value as UsageType)}
          />
          <Select
            label="Usage Duration"
            options={DURATION_OPTIONS}
            value={usageRightsDuration}
            onChange={(e) => setUsageRightsDuration(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button variant="secondary" type="button" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext} disabled={platformsAllowed.length === 0}>
          Next Step
        </Button>
      </div>
    </div>
  );
};
