"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCompanyConfig } from "@/lib/config";

interface DeliverableItem {
  type: string;
  quantity: number;
  duration: string;
  notes: string;
}

export default function InstantContractPage() {
  const router = useRouter();
  const company = getCompanyConfig();

  // Initiator details
  const [initiatorName, setInitiatorName] = useState("");
  const [initiatorEmail, setInitiatorEmail] = useState("");
  const [initiatorPhone, setInitiatorPhone] = useState("");
  const [initiatorRole, setInitiatorRole] = useState<"CREATOR" | "BRAND" | "AGENCY">("CREATOR");

  // Contract Scope
  const [contractType, setContractType] = useState<string>("CREATOR_TO_BRAND");
  const [brandName, setBrandName] = useState("");
  const [brandHandle, setBrandHandle] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [creatorHandle, setCreatorHandle] = useState("");

  // Financials & Delivery
  const [totalAmount, setTotalAmount] = useState("");
  const [advancePayment, setAdvancePayment] = useState("");
  const [deliveryTimeframeDays, setDeliveryTimeframeDays] = useState("7");
  const [paymentMethod, setPaymentMethod] = useState("BANK_IBAN");
  const [bankAccountIban, setBankAccountIban] = useState("");
  const [mobileWalletNumber, setMobileWalletNumber] = useState("");

  // Usage Rights & Rules
  const [usageRightsDuration, setUsageRightsDuration] = useState("30 Days");
  const [revisionRounds, setRevisionRounds] = useState("1");
  const [exclusivityClause, setExclusivityClause] = useState(false);
  const [confidentialityRequired, setConfidentialityRequired] = useState(false);

  // Deliverables
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>([
    { type: "REEL", quantity: 1, duration: "Permanent", notes: "" },
  ]);

  // Form Submission State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [createdResult, setCreatedResult] = useState<{
    shareUrl: string;
    shareToken: string;
    contractNumber: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const handleAddDeliverable = () => {
    setDeliverables([
      ...deliverables,
      { type: "REEL", quantity: 1, duration: "Permanent", notes: "" },
    ]);
  };

  const handleRemoveDeliverable = (index: number) => {
    if (deliverables.length === 1) return;
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleDeliverableChange = (index: number, field: keyof DeliverableItem, value: any) => {
    const updated = [...deliverables];
    updated[index] = { ...updated[index], [field]: value };
    setDeliverables(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!initiatorName.trim() || !initiatorEmail.trim()) {
      setErrorMsg("Please enter your name and email address.");
      return;
    }

    if (!totalAmount || Number(totalAmount) <= 0) {
      setErrorMsg("Please enter a valid total contract amount.");
      return;
    }

    if (!deliveryTimeframeDays || Number(deliveryTimeframeDays) <= 0) {
      setErrorMsg("Please specify the delivery timeframe in days.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        contractType,
        initiatorName,
        initiatorEmail: initiatorEmail.trim().toLowerCase(),
        initiatorPhone,
        initiatorRole,
        brandName,
        brandHandle,
        creatorName,
        creatorHandle,
        totalAmount: Number(totalAmount),
        advancePayment: advancePayment ? Number(advancePayment) : 0,
        paymentMethod,
        bankAccountIban,
        mobileWalletNumber,
        deliveryTimeframeDays: Number(deliveryTimeframeDays),
        usageRightsDuration,
        revisionRounds: Number(revisionRounds),
        exclusivityClause,
        confidentialityRequired,
        deliverables,
        platformsAllowed: ["INSTAGRAM", "TIKTOK"],
        usageType: ["ORGANIC_ONLY"],
      };

      const res = await fetch("/api/guest/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create guest contract.");
      }

      setCreatedResult({
        shareUrl: data.shareUrl,
        shareToken: data.shareToken,
        contractNumber: data.contract.contractNumber,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while creating the contract.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (createdResult?.shareUrl) {
      navigator.clipboard.writeText(createdResult.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-hidden">
      {/* Glow elements */}
      <div className="absolute top-[5%] left-[-5%] w-[70%] h-[40%] rounded-full ambient-glow-purple pointer-events-none z-0" />
      <div className="absolute bottom-[5%] right-[-5%] w-[70%] h-[40%] rounded-full ambient-glow-blue pointer-events-none z-0" />

      {/* Navigation Header */}
      <header className="w-full h-16 border-b border-gray-200/60 bg-white/70 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-black flex items-center justify-center font-bold text-white text-base">
            {company.name[0]}
          </span>
          <span className="font-bold text-lg text-black tracking-tight uppercase">
            {company.name}
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Guest Mode (2 / Day)
          </span>
          <Link
            href="/"
            className="text-xs font-semibold px-4 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-black transition-colors"
          >
            Sign In / Register
          </Link>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 lg:p-12 z-10">
        {createdResult ? (
          /* SUCCESS VIEW */
          <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 animate-fadeIn">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto">
                ✓
              </div>
              <h2 className="text-3xl font-black text-black">Instant Contract Ready!</h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Contract <strong>#{createdResult.contractNumber}</strong> has been generated. Share this link with the counterparty to review and sign.
              </p>
            </div>

            {/* Share Token Input & Button */}
            <div className="bg-gray-50 p-4 md:p-6 rounded-2xl border border-gray-200 space-y-3">
              <label className="text-xs font-bold text-black uppercase tracking-wider block">
                Shareable Signing Link (Send to Counterparty)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdResult.shareUrl}
                  className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs md:text-sm font-mono text-gray-800 select-all focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-black hover:bg-black/90 text-white font-bold px-6 py-3 rounded-xl text-xs md:text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {copied ? "✓ Copied!" : "📋 Copy Link"}
                </button>
              </div>
            </div>

            {/* Up-Sell Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 md:p-8 rounded-2xl shadow-lg space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/20">
                    Auto-Claim Available
                  </span>
                  <h3 className="text-xl font-bold mt-2">Want to manage &amp; track this contract in a permanent dashboard?</h3>
                  <p className="text-xs text-blue-200 mt-1 max-w-xl leading-relaxed">
                    Create a free account using <strong>{initiatorEmail}</strong> and this agreement will automatically sync to your dashboard!
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/"
                  className="bg-white text-black hover:bg-gray-100 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-sm"
                >
                  Create Free Account Now
                </Link>
                <button
                  onClick={() => {
                    setCreatedResult(null);
                    setInitiatorName("");
                    setInitiatorEmail("");
                    setTotalAmount("");
                    setAdvancePayment("");
                  }}
                  className="text-xs text-blue-200 hover:text-white underline font-medium px-2 py-1"
                >
                  Create Another Guest Contract
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* CONTRACT GENERATOR FORM */
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-xl space-y-8">
            
            {/* Header Banner */}
            <div className="border-b border-gray-100 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100/70 text-blue-800 border border-blue-200">
                    Instant 1-Page Agreement
                  </span>
                  <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight mt-2">
                    Create Legally Enforceable Contract
                  </h1>
                </div>
                <div className="text-xs text-gray-500 font-semibold bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                  ⚡ No login required • 2 per day limit
                </div>
              </div>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Fill out the essential agreement terms below to generate a court-admissible bilateral proof link.
              </p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2">
                <span>⚠</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* SECTION 1: Initiator Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-gray-100 pb-2">
                1. Your Details (Agreement Initiator)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Khan"
                    value={initiatorName}
                    onChange={(e) => setInitiatorName(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Your Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@domain.com"
                    value={initiatorEmail}
                    onChange={(e) => setInitiatorEmail(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Your Role</label>
                  <select
                    value={initiatorRole}
                    onChange={(e: any) => setInitiatorRole(e.target.value)}
                    className="input-field"
                  >
                    <option value="CREATOR">Creator / Influencer</option>
                    <option value="BRAND">Brand / Sponsor</option>
                    <option value="AGENCY">Marketing Agency</option>
                  </select>
                </div>

                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Phone / WhatsApp (Optional)</label>
                  <input
                    type="tel"
                    placeholder="03XXXXXXXXX"
                    value={initiatorPhone}
                    onChange={(e) => setInitiatorPhone(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Agreement Type & Counterparty */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-gray-100 pb-2">
                2. Contract Type &amp; Parties
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col text-left gap-1 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700">Contract Workflow</label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value)}
                    className="input-field"
                  >
                    <option value="CREATOR_TO_BRAND">Creator ➔ Brand (Direct Collaboration)</option>
                    <option value="BRAND_TO_CREATOR">Brand ➔ Creator (Sponsorship Offer)</option>
                    <option value="AGENCY_TO_CREATOR">Agency ➔ Creator (Campaign Delegation)</option>
                    <option value="AGENCY_TO_BRAND">Agency ➔ Brand (Master Services Agreement)</option>
                  </select>
                </div>

                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Nexus Tech"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Creator Name / Handle</label>
                  <input
                    type="text"
                    placeholder="e.g. @creative_ali"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: Deliverables */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                  3. Campaign Deliverables
                </h3>
                <button
                  type="button"
                  onClick={handleAddDeliverable}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  + Add Deliverable
                </button>
              </div>

              {deliverables.map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Deliverable #{idx + 1}</span>
                    {deliverables.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(idx)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Content Format</label>
                      <select
                        value={item.type}
                        onChange={(e) => handleDeliverableChange(idx, "type", e.target.value)}
                        className="input-field text-xs"
                      >
                        <option value="REEL">Instagram Reel</option>
                        <option value="STORY">Instagram Story</option>
                        <option value="CAROUSEL_POST">Carousel Post</option>
                        <option value="IMAGE_POST">Single Image Post</option>
                        <option value="TIKTOK_VIDEO">TikTok Video</option>
                        <option value="YOUTUBE_VIDEO">YouTube Video / Integration</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleDeliverableChange(idx, "quantity", e.target.value)}
                        className="input-field text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Notes (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Tag @brand, link in bio"
                        value={item.notes}
                        onChange={(e) => handleDeliverableChange(idx, "notes", e.target.value)}
                        className="input-field text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* SECTION 4: Financial Terms */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-gray-100 pb-2">
                4. Financial &amp; Payment Terms
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Total Contract Amount *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50000"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Advance Payment (Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 25000"
                    value={advancePayment}
                    onChange={(e) => setAdvancePayment(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Delivery Timeframe (Days) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="7"
                    value={deliveryTimeframeDays}
                    onChange={(e) => setDeliveryTimeframeDays(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: Usage Rights & Safeguards */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-gray-100 pb-2">
                5. Usage License &amp; Safeguards
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Usage Rights License Duration</label>
                  <select
                    value={usageRightsDuration}
                    onChange={(e) => setUsageRightsDuration(e.target.value)}
                    className="input-field"
                  >
                    <option value="30 Days">30 Days</option>
                    <option value="90 Days">90 Days</option>
                    <option value="6 Months">6 Months</option>
                    <option value="12 Months">12 Months</option>
                    <option value="Perpetual">Perpetual Commercial License</option>
                  </select>
                </div>

                <div className="flex flex-col text-left gap-1">
                  <label className="text-xs font-bold text-gray-700">Max Revision Rounds</label>
                  <select
                    value={revisionRounds}
                    onChange={(e) => setRevisionRounds(e.target.value)}
                    className="input-field"
                  >
                    <option value="1">1 Round of Revisions</option>
                    <option value="2">2 Rounds of Revisions</option>
                    <option value="3">3 Rounds of Revisions</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
                  <input
                    type="checkbox"
                    checked={exclusivityClause}
                    onChange={(e) => setExclusivityClause(e.target.checked)}
                    className="w-4 h-4 rounded text-black focus:ring-black"
                  />
                  <span>Category Exclusivity Clause</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
                  <input
                    type="checkbox"
                    checked={confidentialityRequired}
                    onChange={(e) => setConfidentialityRequired(e.target.checked)}
                    className="w-4 h-4 rounded text-black focus:ring-black"
                  />
                  <span>Confidentiality / NDA Clause</span>
                </label>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-black/90 text-white font-black py-4 px-6 rounded-2xl text-base shadow-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? "Generating Instant Link..." : "⚡ Generate Instant Agreement Link"}
            </button>

          </form>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="w-full border-t border-gray-200/60 bg-white/70 backdrop-blur-md py-4 text-center text-xs text-gray-500 font-semibold z-10">
        © {new Date().getFullYear()} {company.name}. Safe &amp; Bilateral Legal Agreements.
      </footer>
    </div>
  );
}
