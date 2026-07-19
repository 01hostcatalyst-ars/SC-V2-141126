// src/lib/tax.ts

import { formatCurrencyAmount } from "./currency";

export interface TaxCalculationInput {
  totalValuation: number;
  taxTreatment: "INCLUSIVE" | "EXCLUSIVE" | "REVERSE_CHARGE" | "EXEMPT";
  taxRatePct?: number; // e.g. 20 for UK 20% VAT
}

export interface TaxCalculationResult {
  baseNetAmount: number;
  taxAmount: number;
  grossPayableAmount: number;
  displayText: string;
}

export function calculateContractTax(input: TaxCalculationInput, currencyCode: string = "USD"): TaxCalculationResult {
  const total = Number(input.totalValuation || 0);
  const rate = Number(input.taxRatePct || 0) / 100;

  if (input.taxTreatment === "EXCLUSIVE" && rate > 0) {
    const tax = total * rate;
    const gross = total + tax;
    return {
      baseNetAmount: total,
      taxAmount: tax,
      grossPayableAmount: gross,
      displayText: `${formatCurrencyAmount(total, currencyCode)} + ${input.taxRatePct}% Tax (${formatCurrencyAmount(tax, currencyCode)}) = Total: ${formatCurrencyAmount(gross, currencyCode)}`,
    };
  }

  if (input.taxTreatment === "INCLUSIVE" && rate > 0) {
    const base = total / (1 + rate);
    const tax = total - base;
    return {
      baseNetAmount: base,
      taxAmount: tax,
      grossPayableAmount: total,
      displayText: `${formatCurrencyAmount(total, currencyCode)} (Inclusive of ${input.taxRatePct}% Tax / ${formatCurrencyAmount(tax, currencyCode)})`,
    };
  }

  if (input.taxTreatment === "REVERSE_CHARGE") {
    return {
      baseNetAmount: total,
      taxAmount: 0,
      grossPayableAmount: total,
      displayText: `${formatCurrencyAmount(total, currencyCode)} (Cross-Border B2B Reverse Charge - No Tax Charged)`,
    };
  }

  return {
    baseNetAmount: total,
    taxAmount: 0,
    grossPayableAmount: total,
    displayText: `${formatCurrencyAmount(total, currencyCode)} (Tax Exempt / Inclusive)`,
  };
}
