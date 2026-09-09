"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, CornerDownLeft } from "lucide-react";

interface AutocompleteInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  required?: boolean;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function AutocompleteInput({
  label,
  placeholder,
  value,
  onChange,
  suggestions,
  required = false,
  disabled = false,
  className = "",
  size = "md",
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions.filter((item) =>
    item.toLowerCase().includes((value || "").toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative text-left flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-bold text-zinc-800">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-zinc-950 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950/10 transition-all disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed shadow-2xs"
        />

        {value && !disabled && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setIsOpen(true);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-950 transition-colors p-1"
            aria-label="Clear input"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && !disabled && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-30 mt-1.5 max-h-60 overflow-y-auto bg-white border border-zinc-200/80 rounded-xl shadow-xl py-1 surface-elevated animate-fadeIn">
          {filteredSuggestions.map((item) => (
            <button
              key={item}
              type="button"
              onMouseDown={() => handleSelect(item)}
              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-950 hover:text-white transition-colors cursor-pointer flex items-start justify-between gap-2 border-b border-zinc-100/80 last:border-0 group"
            >
              <span className="whitespace-normal break-words leading-snug flex-1">{item}</span>
              <span className="text-[10px] text-zinc-400 group-hover:text-white font-bold shrink-0 uppercase tracking-wider pt-0.5 select-none inline-flex items-center gap-1">
                Select <CornerDownLeft className="w-2.5 h-2.5" strokeWidth={2.5} />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
