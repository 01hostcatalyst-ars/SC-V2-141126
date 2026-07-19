// src/lib/currency.ts

export interface CurrencyFormatOptions {
  code: string;
  symbol: string;
  decimals: number;
}

export const CURRENCY_MAP: Record<string, CurrencyFormatOptions> = {
  USD: { code: "USD", symbol: "$", decimals: 2 },
  EUR: { code: "EUR", symbol: "€", decimals: 2 },
  GBP: { code: "GBP", symbol: "£", decimals: 2 },
  AED: { code: "AED", symbol: "AED ", decimals: 2 },
  SAR: { code: "SAR", symbol: "SAR ", decimals: 2 },
  CAD: { code: "CAD", symbol: "CA$", decimals: 2 },
  AUD: { code: "AUD", symbol: "A$", decimals: 2 },
  SGD: { code: "SGD", symbol: "S$", decimals: 2 },
  INR: { code: "INR", symbol: "₹", decimals: 2 },
  PKR: { code: "PKR", symbol: "Rs. ", decimals: 0 },
  BRL: { code: "BRL", symbol: "R$ ", decimals: 2 },
  MXN: { code: "MXN", symbol: "MX$", decimals: 2 },
  COP: { code: "COP", symbol: "COL$ ", decimals: 0 },
  IDR: { code: "IDR", symbol: "Rp ", decimals: 0 },
  MYR: { code: "MYR", symbol: "RM ", decimals: 2 },
  PHP: { code: "PHP", symbol: "₱", decimals: 2 },
  THB: { code: "THB", symbol: "฿", decimals: 2 },
  VND: { code: "VND", symbol: "₫", decimals: 0 },
  CNY: { code: "CNY", symbol: "¥", decimals: 2 },
  NGN: { code: "NGN", symbol: "₦", decimals: 2 },
  ZAR: { code: "ZAR", symbol: "R ", decimals: 2 },
  KES: { code: "KES", symbol: "KSh ", decimals: 2 },
  EGP: { code: "EGP", symbol: "EGP ", decimals: 2 },
  QAR: { code: "QAR", symbol: "QAR ", decimals: 2 },
  OMR: { code: "OMR", symbol: "OMR ", decimals: 3 },
  GHS: { code: "GHS", symbol: "GH₵ ", decimals: 2 },
  JMD: { code: "JMD", symbol: "J$", decimals: 2 },
};

export function formatCurrencyAmount(amount: number | string | null | undefined, currencyCode: string = "USD"): string {
  const num = Number(amount || 0);
  const info = CURRENCY_MAP[currencyCode.toUpperCase()] || { code: currencyCode.toUpperCase(), symbol: `${currencyCode.toUpperCase()} `, decimals: 2 };
  
  return `${info.symbol}${num.toLocaleString("en-US", {
    minimumFractionDigits: info.decimals,
    maximumFractionDigits: info.decimals,
  })}`;
}
