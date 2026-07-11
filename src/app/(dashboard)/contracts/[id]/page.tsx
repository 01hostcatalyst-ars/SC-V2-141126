"use client";

import React, { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/layout/ProtectedRoute";
import { useToast } from "@/components/ui/Toast";
import { SignaturePadModal } from "@/components/ui/SignaturePadModal";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ContractDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

  const fetchContract = useCallback(async () => {
    try {
      const res = await fetch(`/api/contracts/${resolvedParams.id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setContract(data.contract);
      } else {
        showToast(data.error || "Failed to load agreement details.", "error");
      }
    } catch (err) {
      showToast("Error retrieving agreement record.", "error");
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, showToast]);

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  const handleSubmitDraft = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/contracts/${resolvedParams.id}/submit`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Agreement submitted! Public signing link generated.", "success");
        fetchContract();
      } else {
        showToast(data.error || "Failed to submit draft.", "error");
      }
    } catch (err) {
      showToast("Error executing draft submission.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleInitiatorSign = async (signatureB64: string, fingerprint: string) => {
    setActionLoading(true);
    // Simple document hash correlation
    const documentHash = contract.documentHash || "SHA256-" + contract.shareToken;
    try {
      const res = await fetch(`/api/contracts/${resolvedParams.id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureB64,
          documentHash,
          fingerprint,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Contract executed and active! Both parties notified.", "success");
        fetchContract();
      } else {
        showToast(data.error || "Failed to execute signature transaction.", "error");
      }
    } catch (err) {
      showToast("Error processing signature execution.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAdvanceReceived = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/contracts/${resolvedParams.id}/advance-received`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Advance payment receipt confirmed!", "success");
        fetchContract();
      } else {
        showToast(data.error || "Failed to log advance payment receipt.", "error");
      }
    } catch (err) {
      showToast("Error processing advance payment route.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/contracts/${resolvedParams.id}/complete`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Agreement marked completed and closed!", "success");
        fetchContract();
      } else {
        showToast(data.error || "Failed to close agreement.", "error");
      }
    } catch (err) {
      showToast("Error executing complete transaction.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/contracts/${resolvedParams.id}/pdf`);
      const data = await res.json();
      if (res.ok && data.url) {
        window.open(data.url, "_blank");
      } else {
        showToast(data.error || "Failed to generate download link.", "error");
      }
    } catch (err) {
      showToast("Error retrieving PDF document.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const copySigningLink = () => {
    const link = `${window.location.origin}/c/${contract.shareToken}`;
    navigator.clipboard.writeText(link);
    showToast("Counterparty signing link copied to clipboard!", "success");
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center items-center flex-col gap-3 bg-white rounded-2xl border border-gray-200 shadow-sm text-left">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Querying document...</span>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="py-16 text-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-left">
        <h4 className="font-bold text-black text-lg">Document Not Found</h4>
        <p className="text-xs text-gray-500 mt-1">This agreement record does not exist or has been removed.</p>
        <Link href="/dashboard" className="mt-5">
          <button className="bg-black text-white hover:bg-black/90 font-bold px-6 py-2 rounded-xl text-xs uppercase">
            Back to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-amber-50 border-amber-200 text-amber-800";
      case "PENDING_RESPONDENT":
      case "PENDING_INITIATOR":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "ACTIVE":
        return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "COMPLETED":
        return "bg-indigo-50 border-indigo-200 text-indigo-800";
      case "EXPIRED":
      case "CANCELLED":
        return "bg-rose-50 border-rose-200 text-rose-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const isUserInitiator = contract.initiatorId === user?.id;

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner Navigation */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-xs font-bold text-gray-400 hover:text-black transition-colors">
          &larr; Dashboard
        </Link>
        <span className="text-gray-300">|</span>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Agreement {contract.contractNumber}
        </span>
      </div>

      {/* Info Status Banner */}
      <div className={`border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm ${getStatusColor(contract.status)}`}>
        <div className="flex flex-col text-left gap-1">
          <span className="text-[10px] font-black uppercase tracking-wider opacity-70">Deal Current Status</span>
          <span className="text-lg font-black uppercase">{contract.status.replace(/_/g, " ")}</span>
          <p className="text-[11px] font-medium opacity-80 mt-1 max-w-xl">
            {contract.status === "DRAFT" && "This agreement is currently a draft. Review the terms below and submit it to counterparties."}
            {contract.status === "PENDING_RESPONDENT" && "Awaiting countersignatures from your deal partner. Copy and send the link to them to sign."}
            {contract.status === "PENDING_INITIATOR" && "Your counterparty has signed! Review their details at the bottom, sign, and activate the deal."}
            {contract.status === "ACTIVE" && "Contract is fully executed and active. A court-admissible signed PDF record has been locked."}
            {contract.status === "COMPLETED" && "This partnership campaign has been marked as fully fulfilled and finalized."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2">
          {contract.status === "DRAFT" && isUserInitiator && (
            <button
              onClick={handleSubmitDraft}
              disabled={actionLoading}
              className="bg-black text-white hover:bg-black/90 font-bold px-6 py-2.5 rounded-xl text-xs uppercase shadow transition-all"
            >
              {actionLoading ? "Submitting..." : "Submit Agreement ➔"}
            </button>
          )}

          {contract.status === "PENDING_RESPONDENT" && (
            <button
              onClick={copySigningLink}
              className="bg-black text-white hover:bg-black/90 font-bold px-6 py-2.5 rounded-xl text-xs uppercase shadow transition-all flex items-center gap-2"
            >
              🔗 Copy Signing Link
            </button>
          )}

          {contract.status === "PENDING_INITIATOR" && isUserInitiator && (
            <button
              onClick={() => setIsSignModalOpen(true)}
              disabled={actionLoading}
              className="bg-black text-white hover:bg-black/90 font-bold px-6 py-2.5 rounded-xl text-xs uppercase shadow transition-all"
            >
              Sign & Activate Contract
            </button>
          )}

          {(contract.status === "ACTIVE" || contract.status === "COMPLETED") && contract.pdfUrl && (
            <button
              onClick={handleDownloadPDF}
              disabled={actionLoading}
              className="bg-black text-white hover:bg-black/90 font-bold px-6 py-2.5 rounded-xl text-xs uppercase shadow transition-all text-center"
            >
              Download Signed PDF
            </button>
          )}

          {contract.status === "ACTIVE" && (
            <>
              {/* Advance Payment Logging for Creator/Agency */}
              {contract.advancePayment && !contract.advanceReceived && (user?.role === "CREATOR" || user?.role === "AGENCY") && (
                <button
                  onClick={handleMarkAdvanceReceived}
                  disabled={actionLoading}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-black font-bold px-6 py-2.5 rounded-xl text-xs uppercase shadow transition-all"
                >
                  Confirm Advance Payment Received
                </button>
              )}
              {/* Completion trigger */}
              <button
                onClick={handleMarkComplete}
                disabled={actionLoading}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-black font-bold px-6 py-2.5 rounded-xl text-xs uppercase shadow transition-all"
              >
                Mark Deal Completed
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid specs layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left column: Summary specs */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-black border-b border-gray-100 pb-2 uppercase tracking-wider">Campaign Parameters</h4>
            
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wide block mb-1">Contract Type</span>
                <span className="text-black font-bold uppercase">{contract.contractType.replace(/_/g, " ")}</span>
              </div>
              <hr className="border-gray-50" />
              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wide block mb-1">Platforms Allowed</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {contract.platformsAllowed.map((p: string) => (
                    <span key={p} className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <hr className="border-gray-50" />
              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wide block mb-1">Usage rights</span>
                <span className="text-black font-bold">{contract.usageRightsDuration} ({contract.usageType.replace(/_/g, " ")})</span>
              </div>
              <hr className="border-gray-50" />
              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wide block mb-1">Delivery Window</span>
                <span className="text-black font-bold">{contract.deliveryTimeframeDays} Days post-execution</span>
              </div>
              <hr className="border-gray-50" />
              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wide block mb-1">Revision Cap</span>
                <span className="text-black font-bold">{contract.revisionRounds} Rounds allowed</span>
              </div>
              <hr className="border-gray-50" />
              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wide block mb-1">Bilateral Penalties</span>
                <span className="text-black font-bold">Payment: {contract.latePaymentPenaltyPct}%/day | Content: {contract.lateContentPenaltyPct}%/day</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Financial & Deliverables list */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Financial details */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h4 className="text-xs font-black text-black border-b border-gray-100 pb-2 uppercase tracking-wider mb-4">Financial Settlements</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                <span className="text-gray-400 font-bold uppercase tracking-wider block mb-1">Total Valuation</span>
                <span className="text-base font-black text-black">PKR {Number(contract.totalAmount).toLocaleString()}</span>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                <span className="text-gray-400 font-bold uppercase tracking-wider block mb-1">Advance Escrow</span>
                <span className="text-base font-black text-black">
                  {contract.advancePayment ? `PKR ${Number(contract.advancePayment).toLocaleString()}` : "PKR 0"}
                </span>
                {contract.advancePayment && (
                  <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border block w-fit mt-1 tracking-wider ${
                    contract.advanceReceived 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 uppercase" 
                      : "bg-amber-50 border-amber-200 text-amber-800 uppercase"
                  }`}>
                    {contract.advanceReceived ? "Confirmed" : "Pending Confirmation"}
                  </span>
                )}
              </div>
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                <span className="text-gray-400 font-bold uppercase tracking-wider block mb-1">Route Method</span>
                <span className="text-base font-black text-black uppercase">{contract.paymentMethod.replace(/_/g, " ")}</span>
                <span className="text-[10px] text-gray-500 font-semibold block mt-1 truncate">
                  {contract.paymentMethod === "BANK_IBAN" ? contract.bankAccountIban : contract.mobileWalletNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Deliverables details */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h4 className="text-xs font-black text-black border-b border-gray-100 pb-2 uppercase tracking-wider mb-4">Required Campaign Deliverables</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold">
                    <th className="py-2">Platform format</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-center">Duration</th>
                    <th className="py-2">Instructions / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {contract.deliverables?.map((d: any) => (
                    <tr key={d.id} className="border-b border-gray-50 text-black">
                      <td className="py-3 font-bold">{d.type}</td>
                      <td className="py-3 font-bold text-center">{d.quantity}</td>
                      <td className="py-3 font-bold text-center text-gray-500">{d.duration || "Permanent"}</td>
                      <td className="py-3 text-gray-500">{d.notes || "No notes"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Text clauses detail */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-xs space-y-4">
            <h4 className="text-xs font-black text-black border-b border-gray-100 pb-2 uppercase tracking-wider">Additional Legal Clauses</h4>
            
            {contract.taggingRequirements && (
              <div>
                <span className="text-gray-400 font-bold block mb-1 uppercase tracking-wide">Caption / Tagging Requirements</span>
                <p className="text-black font-semibold bg-gray-50 p-3 rounded-lg border border-gray-200">{contract.taggingRequirements}</p>
              </div>
            )}

            {contract.exclusivityClause && (
              <div>
                <span className="text-gray-400 font-bold block mb-1 uppercase tracking-wide">Exclusivity Restrictive Clause</span>
                <p className="text-black font-semibold bg-gray-50 p-3 rounded-lg border border-gray-200">
                  Required Exclusivity Duration: <strong>{contract.exclusivityDuration || "Not Specified"}</strong>
                </p>
              </div>
            )}

            <div>
              <span className="text-gray-400 font-bold block mb-1 uppercase tracking-wide">Content Ownership & License Terms</span>
              <p className="text-black leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200">{contract.contentOwnership}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Audit Log / Verification Visual Signatures Blocks */}
      {(contract.signatures?.length > 0 || contract.status === "PENDING_INITIATOR") && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-xs space-y-6">
          <h4 className="text-xs font-black text-black border-b border-gray-100 pb-2 uppercase tracking-wider">ETO 2002 Bilateral Signature Audit Log</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Render counterparts signature */}
            {contract.signatures?.map((sig: any) => {
              const date = new Date(sig.signedAt).toLocaleString();
              return (
                <div key={sig.id} className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col gap-3 relative overflow-hidden">
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                    Signed Counterparty ({sig.signerRole})
                  </span>
                  
                  {/* Signature display block */}
                  <div className="w-full h-24 bg-white border border-gray-200 rounded-xl flex items-center justify-center p-2">
                    <img src={sig.signatureImageUrl} alt="Signature canvas" className="h-full object-contain max-w-full" />
                  </div>

                  {/* Audit Metadata */}
                  <div className="space-y-1 text-[10px] text-gray-500 font-semibold leading-relaxed mt-2">
                    <div className="flex justify-between">
                      <span>Signer Verified Email:</span>
                      <span className="text-black truncate max-w-xs">{sig.otpEmail || "No OTP verification log"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verification Date:</span>
                      <span className="text-black">{date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IP Address:</span>
                      <span className="text-black">{sig.ipAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Device Fingerprint:</span>
                      <span className="text-black font-mono truncate max-w-[120px]" title={sig.deviceFingerprint || "N/A"}>{sig.deviceFingerprint || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bilateral SHA-256:</span>
                      <span className="text-black font-mono truncate max-w-[100px]">{sig.documentHash.slice(0, 20)}...</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* If counterparty has signed but initiator hasn't, show initiator empty block */}
            {contract.status === "PENDING_INITIATOR" && isUserInitiator && (
              <div className="p-5 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center py-8">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-4">
                  Your Signature Required
                </span>
                <p className="text-[11px] text-gray-500 max-w-xs mb-4">
                  The respondent has signed this campaign. Sign now to execute, activate, and lock the document.
                </p>
                <button
                  onClick={() => setIsSignModalOpen(true)}
                  className="bg-black text-white hover:bg-black/90 font-bold px-6 py-2 rounded-xl text-[10px] uppercase shadow"
                >
                  Sign Agreement
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Signature Modal */}
      <SignaturePadModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onConfirm={handleInitiatorSign}
        loading={actionLoading}
      />
    </div>
  );
}
