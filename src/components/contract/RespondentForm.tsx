"use client";

import React, { useState } from "react";
import { ContractType } from "@prisma/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface RespondentFormProps {
  contractType: ContractType;
  onSubmit: (formData: any) => void;
  isLoading: boolean;
}

export const RespondentForm: React.FC<RespondentFormProps> = ({
  contractType,
  onSubmit,
  isLoading,
}) => {
  const { showToast } = useToast();

  // Respondent forms are adaptive: Brands see company fields, Creators see IG/CNIC
  const isRespondentCreator =
    contractType === ContractType.BRAND_TO_CREATOR ||
    contractType === ContractType.AGENCY_TO_CREATOR;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [designation, setDesignation] = useState("");
  const [address, setAddress] = useState("");
  
  // Custom creator fields
  const [instagramHandle, setInstagramHandle] = useState("");
  const [cnic, setCnic] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      showToast("Email address is required to dispatch confirmation OTP.", "warning");
      return;
    }

    setIsOtpVerifying(true);
    try {
      const token = window.location.pathname.split("/").pop();
      const res = await fetch(`/api/contracts/share/${token}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed to send OTP code.");
      showToast("Verification code dispatched to your email.", "success");
      setOtpSent(true);
    } catch (err: any) {
      showToast(err.message || "Failed to dispatch verification.", "error");
    } finally {
      setIsOtpVerifying(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      showToast("Please enter the 6-digit verification code.", "warning");
      return;
    }

    setIsOtpVerifying(true);
    try {
      const token = window.location.pathname.split("/").pop();
      const res = await fetch(`/api/contracts/share/${token}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode }),
      });

      if (!res.ok) throw new Error("Invalid or expired verification code.");
      showToast("Identity successfully verified. Signature pad enabled.", "success");
      setIsOtpVerified(true);
    } catch (err: any) {
      showToast(err.message || "Verification failed.", "error");
    } finally {
      setIsOtpVerifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtpVerified) {
      showToast("Please verify your email address to enable signing.", "warning");
      return;
    }

    onSubmit({
      respondentName: name,
      respondentEmail: email,
      respondentPhone: phone,
      respondentCompany: isRespondentCreator ? instagramHandle : company,
      respondentAddress: address,
      respondentDesignation: isRespondentCreator ? cnic : designation,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
      <div>
        <h4 className="text-lg font-bold text-white mb-1">
          {isRespondentCreator ? "Creator Agreement Inputs" : "Brand Agreement Inputs"}
        </h4>
        <p className="text-xs text-slate-500">Provide verified signature variables to execute this contract.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={isRespondentCreator ? "Creator Legal Name" : "Authorized Contact Person"}
          id="resp-name"
          placeholder="e.g. Mohammad Ali"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading || isOtpVerified}
          required
        />
        <Input
          label="Phone Number"
          id="resp-phone"
          placeholder="03XXXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isLoading || isOtpVerified}
        />
      </div>

      {/* Verify email to unlock signature */}
      <div className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <Input
              label="Signature Verification Email"
              type="email"
              id="resp-email"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || isOtpVerified || otpSent}
              required
            />
          </div>
          {!otpSent && !isOtpVerified && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleSendOtp}
              isLoading={isOtpVerifying}
              disabled={!email}
            >
              Verify Email
            </Button>
          )}
        </div>

        {otpSent && !isOtpVerified && (
          <div className="flex flex-col sm:flex-row gap-4 items-end animate-slide-in">
            <div className="flex-1">
              <Input
                label="6-Digit Verification Code"
                id="resp-otp"
                placeholder="123456"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                disabled={isOtpVerifying}
              />
            </div>
            <Button
              type="button"
              onClick={handleVerifyOtp}
              isLoading={isOtpVerifying}
            >
              Confirm Code
            </Button>
          </div>
        )}

        {isOtpVerified && (
          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-slide-in">
            ✓ Email Identity Verified & Signature Unlocked
          </div>
        )}
      </div>

      {/* Creator specific inputs */}
      {isRespondentCreator && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-900 pt-4 mt-2">
          <Input
            label="Instagram Handle"
            id="resp-instagram"
            placeholder="@username"
            value={instagramHandle}
            onChange={(e) => setInstagramHandle(e.target.value)}
            disabled={isLoading}
          />
          <Input
            label="CNIC Number"
            id="resp-cnic"
            placeholder="42101-XXXXXXX-X"
            value={cnic}
            onChange={(e) => setCnic(e.target.value)}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Brand specific inputs */}
      {!isRespondentCreator && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-900 pt-4 mt-2">
          <Input
            label="Brand / Company Name"
            id="resp-brand"
            placeholder="e.g. Sapphire"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={isLoading}
          />
          <Input
            label="Authorized Title / Designation"
            id="resp-designation"
            placeholder="Marketing Manager"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            disabled={isLoading}
          />
          <div className="sm:col-span-2">
            <Input
              label="Company Billing Address"
              id="resp-address"
              placeholder="Office Location, Lahore"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full py-3 mt-4"
        disabled={!isOtpVerified || isLoading}
        isLoading={isLoading}
      >
        Save Details & Open Signature Modal
      </Button>
    </form>
  );
};
