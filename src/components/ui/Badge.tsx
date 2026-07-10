"use client";

import React from "react";

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "primary" | "accent";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case "success":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "warning":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "danger":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "info":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "primary":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "accent":
        return "bg-violet-500/10 text-violet-400 border-violet-500/20";
      case "default":
      default:
        return "bg-slate-800 text-slate-300 border-slate-700/80";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getVariantClass()} ${className}`}
    >
      {children}
    </span>
  );
};
