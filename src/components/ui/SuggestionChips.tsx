"use client";

import React from "react";

interface SuggestionChipsProps {
  label?: string;
  chips: string[];
  currentValue: string;
  onSelect: (newValue: string) => void;
  mode?: "append" | "replace";
  disabled?: boolean;
}

export function SuggestionChips({
  label = "Quick Presets:",
  chips,
  currentValue,
  onSelect,
  mode = "append",
  disabled = false,
}: SuggestionChipsProps) {
  if (!chips || chips.length === 0 || disabled) return null;

  const handleChipClick = (chipText: string) => {
    if (mode === "replace") {
      onSelect(chipText);
      return;
    }

    // Append mode logic: Append with proper formatting/punctuation
    const current = (currentValue || "").trim();
    if (!current) {
      onSelect(chipText);
    } else if (current.endsWith(".") || current.endsWith(";") || current.endsWith(",")) {
      onSelect(`${current} ${chipText}`);
    } else {
      onSelect(`${current}, ${chipText}`);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-left">
      {label && (
        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mr-0.5 select-none">
          {label}
        </span>
      )}
      {chips.map((chip) => (
        <button
          key={chip}
          type="button"
          disabled={disabled}
          onClick={() => handleChipClick(chip)}
          className="group px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100/80 hover:bg-black text-gray-700 hover:text-white border border-gray-200/80 transition-all duration-150 shadow-2xs active:scale-95 cursor-pointer flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-gray-400 group-hover:text-white font-bold text-[10px] transition-colors">+</span>
          <span>{chip}</span>
        </button>
      ))}
    </div>
  );
}
