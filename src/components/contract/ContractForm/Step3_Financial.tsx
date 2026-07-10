"use client";

import React from "react";
import { PaymentMethod } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface Step3Props {
  totalAmount: string;
  setTotalAmount: (val: string) => void;
  advancePayment: string;
  setAdvancePayment: (val: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (val: PaymentMethod) => void;
  bankAccountIban: string;
  setBankAccountIban: (val: string) => void;
  mobileWalletNumber: string;
  setMobileWalletNumber: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const PAYMENT_METHODS = [
  { label: "Bank Account Transfer (IBAN)", value: PaymentMethod.BANK_IBAN },
  { label: "JazzCash Mobile Wallet", value: PaymentMethod.JAZZCASH },
  { label: "Easypaisa Mobile Wallet", value: PaymentMethod.EASYPAISA },
];

export const Step3_Financial: React.FC<Step3Props> = ({
  totalAmount,
  setTotalAmount,
  advancePayment,
  setAdvancePayment,
  paymentMethod,
  setPaymentMethod,
  bankAccountIban,
  setBankAccountIban,
  mobileWalletNumber,
  setMobileWalletNumber,
  onNext,
  onBack,
}) => {
  const remaining = Number(totalAmount || 0) - Number(advancePayment || 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-1">Financial Terms</h3>
        <p className="text-xs text-slate-500">Define the campaign compensation and payout schedule.</p>
      </div>

      <div className="flex flex-col gap-5 border border-slate-900 bg-slate-900/10 p-6 rounded-xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Total Campaign Amount (PKR)"
            type="number"
            placeholder="150000"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
          />
          <Input
            label="Advance Payment (PKR)"
            type="number"
            placeholder="50000"
            value={advancePayment}
            onChange={(e) => setAdvancePayment(e.target.value)}
          />
          <div className="flex flex-col gap-1.5 w-full justify-end">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Remaining Amount (Auto)
            </span>
            <div className="input-field bg-slate-950 border-slate-900 text-slate-400 select-none flex items-center">
              PKR {remaining.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <Select
            label="Payment Option"
            options={PAYMENT_METHODS}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          />

          {paymentMethod === PaymentMethod.BANK_IBAN ? (
            <Input
              label="Bank IBAN (24 characters)"
              placeholder="PKXXXXXXXXXXXXXXXXXXXXXX"
              value={bankAccountIban}
              onChange={(e) => setBankAccountIban(e.target.value)}
            />
          ) : (
            <Input
              label={`${paymentMethod === PaymentMethod.JAZZCASH ? "JazzCash" : "Easypaisa"} Account Phone`}
              placeholder="03XXXXXXXXX"
              value={mobileWalletNumber}
              onChange={(e) => setMobileWalletNumber(e.target.value)}
            />
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button variant="secondary" type="button" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext} disabled={!totalAmount || Number(totalAmount) <= 0}>
          Next Step
        </Button>
      </div>
    </div>
  );
};
