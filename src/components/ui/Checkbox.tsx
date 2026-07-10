"use client";

import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  id,
  className = "",
  checked,
  ...props
}) => {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-3 cursor-pointer select-none text-sm text-slate-300 hover:text-white font-medium transition-colors ${className}`}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        className="sr-only peer"
        {...props}
      />
      <div className="w-5 h-5 rounded-md border border-slate-800 bg-slate-900 flex items-center justify-center transition-all peer-checked:bg-blue-600 peer-checked:border-blue-600">
        <svg
          className="w-3.5 h-3.5 text-white scale-0 transition-transform duration-200 peer-checked:scale-100"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="3.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span>{label}</span>
    </label>
  );
};
