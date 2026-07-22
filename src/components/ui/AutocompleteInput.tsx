"use client";

import React, { useState, useRef, useEffect } from "react";

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
        <label className="text-xs font-bold text-gray-700">
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
          className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-black placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed shadow-2xs"
        />

        {value && !disabled && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setIsOpen(true);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black font-bold text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tailwind UI Autocomplete Dropdown List */}
      {isOpen && !disabled && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl py-1 animate-in fade-in-50">
          {filteredSuggestions.map((item) => (
            <button
              key={item}
              type="button"
              onMouseDown={() => handleSelect(item)}
              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-800 hover:bg-black hover:text-white transition-colors cursor-pointer flex items-center justify-between group"
            >
              <span className="truncate mr-2">{item}</span>
              <span className="text-[10px] text-gray-400 group-hover:text-white font-bold shrink-0 uppercase tracking-wider">
                Select ↵
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
