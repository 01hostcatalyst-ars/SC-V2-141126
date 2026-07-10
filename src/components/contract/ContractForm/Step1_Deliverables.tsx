"use client";

import React from "react";
import { DeliverableType } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface Step1Props {
  deliverables: any[];
  setDeliverables: React.Dispatch<React.SetStateAction<any[]>>;
  onNext: () => void;
}

const DELIVERABLE_OPTIONS = Object.keys(DeliverableType).map((type) => ({
  label: type.replace(/_/g, " "),
  value: type,
}));

export const Step1_Deliverables: React.FC<Step1Props> = ({
  deliverables,
  setDeliverables,
  onNext,
}) => {
  const addRow = () => {
    setDeliverables((prev) => [
      ...prev,
      { type: DeliverableType.IMAGE_POST, quantity: 1, duration: "", notes: "" },
    ]);
  };

  const removeRow = (index: number) => {
    if (deliverables.length === 1) return;
    setDeliverables((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateRow = (index: number, key: string, value: any) => {
    setDeliverables((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [key]: value } : row))
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-1">Deliverables</h3>
        <p className="text-xs text-slate-500">Define the exact content deliverables required for this campaign.</p>
      </div>

      <div className="flex flex-col gap-4">
        {deliverables.map((row, index) => (
          <div
            key={index}
            className="p-4 rounded-xl border border-slate-900 bg-slate-900/20 flex flex-col gap-4 relative"
          >
            {deliverables.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="absolute top-4 right-4 text-xs font-bold text-rose-400 hover:underline outline-none"
              >
                Remove
              </button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Content Format"
                options={DELIVERABLE_OPTIONS}
                value={row.type}
                onChange={(e) => updateRow(index, "type", e.target.value)}
              />
              <Input
                label="Quantity"
                type="number"
                min={1}
                value={row.quantity}
                onChange={(e) => updateRow(index, "quantity", parseInt(e.target.value) || 1)}
              />
              <Input
                label="Duration / Story Keep (e.g. 24h)"
                placeholder="N/A"
                value={row.duration}
                onChange={(e) => updateRow(index, "duration", e.target.value)}
              />
            </div>

            <Input
              label="Additional Notes / Brief Requirements"
              placeholder="e.g. Must tag brand account in the first 3 seconds of video."
              value={row.notes}
              onChange={(e) => updateRow(index, "notes", e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button variant="secondary" type="button" onClick={addRow}>
          + Add Deliverable
        </Button>
        <Button type="button" onClick={onNext}>
          Next Step
        </Button>
      </div>
    </div>
  );
};
