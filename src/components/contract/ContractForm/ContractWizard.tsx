"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ContractType, PaymentMethod, UsageType } from "@prisma/client";
import { Stepper } from "@/components/ui/Stepper";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { Step1_Deliverables } from "./Step1_Deliverables";
import { Step2_UsageRights } from "./Step2_UsageRights";
import { Step3_Financial } from "./Step3_Financial";
import { Step4_DeliveryTerms } from "./Step4_DeliveryTerms";
import { Step5_Penalties } from "./Step5_Penalties";
import { Step6_Review } from "./Step6_Review";

interface ContractWizardProps {
  userRole: string;
  linkedContracts?: { label: string; value: string }[]; // For agency link selection
}

const STEPS = ["Deliverables", "Rights", "Financial", "Delivery", "Penalties", "Confirm"];

export const ContractWizard: React.FC<ContractWizardProps> = ({ userRole, linkedContracts = [] }) => {
  const router = useRouter();
  const { showToast } = useToast();

  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Setup default contract category type dynamically based on user role
  const getDefaultContractType = () => {
    if (userRole === "BRAND") return ContractType.BRAND_TO_CREATOR;
    if (userRole === "AGENCY") return ContractType.AGENCY_TO_BRAND; // default agency option
    return ContractType.CREATOR_TO_BRAND;
  };

  // State values mapping schema fields
  const [contractType, setContractType] = useState<ContractType>(getDefaultContractType());
  const [linkedContractId, setLinkedContractId] = useState("");
  const [deliverables, setDeliverables] = useState<any[]>([
    { type: "IMAGE_POST", quantity: 1, duration: "", notes: "" },
  ]);
  const [platformsAllowed, setPlatformsAllowed] = useState<string[]>(["Instagram"]);
  const [usageType, setUsageType] = useState<UsageType>(UsageType.ORGANIC_ONLY);
  const [usageRightsDuration, setUsageRightsDuration] = useState("6_months");
  const [totalAmount, setTotalAmount] = useState("");
  const [advancePayment, setAdvancePayment] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.BANK_IBAN);
  const [bankAccountIban, setBankAccountIban] = useState("");
  const [mobileWalletNumber, setMobileWalletNumber] = useState("");
  const [deliveryTimeframeDays, setDeliveryTimeframeDays] = useState("");
  const [revisionRounds, setRevisionRounds] = useState(1);
  const [brandApprovalRequired, setBrandApprovalRequired] = useState(false);
  const [exclusivityClause, setExclusivityClause] = useState(false);
  const [exclusivityDuration, setExclusivityDuration] = useState("");
  const [latePaymentPenaltyPct, setLatePaymentPenaltyPct] = useState("3");
  const [lateContentPenaltyPct, setLateContentPenaltyPct] = useState("3");
  const [contentOwnership, setContentOwnership] = useState(
    "Creator retains copyright; brand receives usage license as defined."
  );
  const [taggingRequirements, setTaggingRequirements] = useState("");

  const handleNext = () => setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    setIsLoading(true);
    const payload = {
      contractType,
      linkedContractId: contractType === ContractType.AGENCY_TO_CREATOR ? linkedContractId : undefined,
      totalAmount,
      advancePayment,
      paymentMethod,
      bankAccountIban: paymentMethod === PaymentMethod.BANK_IBAN ? bankAccountIban : undefined,
      mobileWalletNumber: paymentMethod !== PaymentMethod.BANK_IBAN ? mobileWalletNumber : undefined,
      deliveryTimeframeDays: parseInt(deliveryTimeframeDays) || 0,
      platformsAllowed,
      usageType,
      usageRightsDuration,
      revisionRounds,
      brandApprovalRequired,
      exclusivityClause,
      exclusivityDuration: exclusivityClause ? exclusivityDuration : undefined,
      latePaymentPenaltyPct: parseFloat(latePaymentPenaltyPct) || 3.0,
      lateContentPenaltyPct: parseFloat(lateContentPenaltyPct) || 3.0,
      contentOwnership,
      taggingRequirements,
      deliverables,
    };

    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create contract.");
      }

      showToast("Agreement Draft Generated Successfully!", "success");
      router.push(`/contracts/${data.contract.id}`);
    } catch (err: any) {
      showToast(err.message || "Failed to save agreement.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <Step1_Deliverables
            deliverables={deliverables}
            setDeliverables={setDeliverables}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <Step2_UsageRights
            platformsAllowed={platformsAllowed}
            setPlatformsAllowed={setPlatformsAllowed}
            usageType={usageType}
            setUsageType={setUsageType}
            usageRightsDuration={usageRightsDuration}
            setUsageRightsDuration={setUsageRightsDuration}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <Step3_Financial
            totalAmount={totalAmount}
            setTotalAmount={setTotalAmount}
            advancePayment={advancePayment}
            setAdvancePayment={setAdvancePayment}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            bankAccountIban={bankAccountIban}
            setBankAccountIban={setBankAccountIban}
            mobileWalletNumber={mobileWalletNumber}
            setMobileWalletNumber={setMobileWalletNumber}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <Step4_DeliveryTerms
            deliveryTimeframeDays={deliveryTimeframeDays}
            setDeliveryTimeframeDays={setDeliveryTimeframeDays}
            revisionRounds={revisionRounds}
            setRevisionRounds={setRevisionRounds}
            brandApprovalRequired={brandApprovalRequired}
            setBrandApprovalRequired={setBrandApprovalRequired}
            exclusivityClause={exclusivityClause}
            setExclusivityClause={setExclusivityClause}
            exclusivityDuration={exclusivityDuration}
            setExclusivityDuration={setExclusivityDuration}
            taggingRequirements={taggingRequirements}
            setTaggingRequirements={setTaggingRequirements}
            contentOwnership={contentOwnership}
            setContentOwnership={setContentOwnership}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <Step5_Penalties
            latePaymentPenaltyPct={latePaymentPenaltyPct}
            setLatePaymentPenaltyPct={setLatePaymentPenaltyPct}
            lateContentPenaltyPct={lateContentPenaltyPct}
            setLateContentPenaltyPct={setLateContentPenaltyPct}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
      default:
        return (
          <Step6_Review
            formData={{
              contractType,
              deliverables,
              platformsAllowed,
              usageRightsDuration,
              totalAmount,
              advancePayment,
              deliveryTimeframeDays,
              exclusivityClause,
              latePaymentPenaltyPct,
              lateContentPenaltyPct,
            }}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            onBack={handleBack}
          />
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Contract type customization headers for Agency profiles */}
      {userRole === "AGENCY" && step === 0 && (
        <Card className="flex flex-col gap-3 p-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Agency Contract Direction
          </label>
          <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-1 rounded-xl border border-slate-900">
            <button
              type="button"
              onClick={() => setContractType(ContractType.AGENCY_TO_BRAND)}
              className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                contractType === ContractType.AGENCY_TO_BRAND
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Agency → Brand
            </button>
            <button
              type="button"
              onClick={() => setContractType(ContractType.AGENCY_TO_CREATOR)}
              className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                contractType === ContractType.AGENCY_TO_CREATOR
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Agency → Creator
            </button>
          </div>

          {contractType === ContractType.AGENCY_TO_CREATOR && linkedContracts.length > 0 && (
            <div className="mt-2 flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Link to Brand Campaign (Optional)
              </label>
              <select
                className="input-field py-2"
                value={linkedContractId}
                onChange={(e) => setLinkedContractId(e.target.value)}
              >
                <option value="">No Link</option>
                {linkedContracts.map((lc) => (
                  <option key={lc.value} value={lc.value}>
                    {lc.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </Card>
      )}

      <Stepper steps={STEPS} currentStep={step} />
      <Card className="p-8">{renderStep()}</Card>
    </div>
  );
};
