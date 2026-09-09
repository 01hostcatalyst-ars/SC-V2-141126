"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface ModernSelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

export interface ModernSelectProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  options: ModernSelectOption[];
  className?: string;
  placeholder?: string;
  size?: "sm" | "md";
}

export function ModernSelect({
  label,
  value,
  onChange,
  disabled,
  options,
  className = "",
  placeholder = "Select option",
  size = "md",
}: ModernSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOpt = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pyClass = "py-2.5 px-3.5 text-xs font-semibold";

  return (
    <div className="flex flex-col text-left gap-1 relative" ref={dropdownRef}>
      {label && <label className="text-xs font-bold text-zinc-900">{label}</label>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full ${pyClass} rounded-lg border text-left flex items-center justify-between transition-all bg-white shadow-2xs hover:border-zinc-950 focus:outline-none ${
          disabled
            ? "bg-zinc-100 text-zinc-400 cursor-not-allowed border-zinc-200"
            : isOpen
            ? "border-zinc-950 text-zinc-950 bg-white ring-1 ring-zinc-950/10"
            : "border-zinc-300 text-zinc-950 hover:bg-zinc-50/50 cursor-pointer"
        } ${className}`}
      >
        <span className="truncate">{selectedOpt ? selectedOpt.label : placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 shrink-0 ml-2 transition-transform duration-150 ${
            isOpen ? "rotate-180 text-zinc-950" : ""
          }`}
          strokeWidth={2}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-zinc-200/80 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto py-1 surface-elevated animate-fadeIn">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all flex flex-col justify-center ${
                opt.value === value
                  ? "bg-black text-white"
                  : "text-gray-800 hover:bg-gray-100"
              }`}
            >
              <span>{opt.label}</span>
              {opt.sublabel && (
                <span
                  className={`text-[10px] mt-0.5 font-normal ${
                    opt.value === value ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {opt.sublabel}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
