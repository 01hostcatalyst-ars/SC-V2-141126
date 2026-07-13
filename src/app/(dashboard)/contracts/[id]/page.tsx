"use client";

import React, { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/layout/ProtectedRoute";
import { useToast } from "@/components/ui/Toast";
import { SignaturePadModal } from "@/components/ui/SignaturePadModal";
import { formatLegalDate, formatUsageLicenseText, parseUserAgentString, formatDeliverableTypeName } from "@/lib/utils";

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

  const handleDownloadPDF = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/contracts/${resolvedParams.id}/pdf`);
      const data = await res.json();
      if (res.ok && data.url) {
        window.open(data.url, "_blank");
      } else {
        showToast(data.error || "Failed to generate PDF document.", "error");
      }
    } catch (err) {
      showToast("Error downloading PDF file.", "error");
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
        showToast("Advance payment confirmed!", "success");
        fetchContract();
      } else {
        showToast(data.error || "Failed to log advance payment.", "error");
      }
    } catch (err) {
      showToast("Error logging payment.", "error");
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
        showToast("Campaign marked as completed!", "success");
        fetchContract();
      } else {
        showToast(data.error || "Failed to complete agreement.", "error");
      }
    } catch (err) {
      showToast("Error marking completion.", "error");
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
      <div className="p-8 text-center text-gray-500 font-bold text-sm">
        Loading agreement data...
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="p-8 text-center text-rose-600 font-bold text-sm">
        Agreement record not found.
      </div>
    );
  }

  const isUserInitiator = user?.id === contract.initiatorId;

  return (
    <div className="space-y-8 text-left">
      {/* Header Info Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-blue-600 uppercase tracking-wider font-mono">
              {contract.contractNumber}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800 uppercase tracking-wider">
              {contract.status.replace(/_/g, " ")}
            </span>
          </div>
          <h1 className="text-2xl font-black text-black mt-1">
            {contract.campaignName || contract.contractType.replace(/_/g, " ")}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Created on {formatLegalDate(contract.createdAt)} by {contract.initiator?.name} ({contract.initiator?.email})
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {contract.status === "DRAFT" && isUserInitiator && (
            <button
              onClick={handleSubmitDraft}
              disabled={actionLoading}
              className="bg-black text-white hover:bg-black/90 font-bold px-6 py-2.5 rounded-xl text-xs uppercase shadow transition-all"
            >
              Publish &amp; Generate Link
            </button>
          )}

          {contract.status === "PENDING_RESPONDENT" && (
            <button
              onClick={copySigningLink}
              className="bg-black text-white hover:bg-black/90 font-bold px-6 py-2.5 rounded-xl text-xs uppercase shadow transition-all flex items-center gap-2"
            >
              Copy Signing Link
            </button>
          )}

          {contract.status === "PENDING_INITIATOR" && isUserInitiator && (
            <button
              onClick={() => setIsSignModalOpen(true)}
              disabled={actionLoading}
              className="bg-black text-white hover:bg-black/90 font-bold px-6 py-2.5 rounded-xl text-xs uppercase shadow transition-all"
            >
              Sign &amp; Activate Contract
            </button>
          )}

          {(contract.status === "ACTIVE" || contract.status === "COMPLETED") && (
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
              {contract.advancePayment && !contract.advanceReceived && (user?.role === "CREATOR" || user?.role === "AGENCY") && (
                <button
                  onClick={handleMarkAdvanceReceived}
                  disabled={actionLoading}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-black font-bold px-6 py-2.5 rounded-xl text-xs uppercase shadow transition-all"
                >
                  Confirm Advance Payment Received
                </button>
              )}
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
            <h4 className="text-xs font-black text-black border-b border-gray-100 pb-2 uppercase tracking-wider">Campaign &amp; Authority Specs</h4>
            
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wide block mb-1">Contract Type</span>
                <span className="text-black font-bold uppercase">{contract.contractType.replace(/_/g, " ")}</span>
              </div>
              
              {contract.initiatorDesignation && (
                <>
                  <hr className="border-gray-50" />
                  <div>
                    <span className="text-gray-400 font-bold uppercase tracking-wide block mb-1">Party A Designation</span>
                    <span className="text-black font-bold">{contract.initiatorDesignation}</span>
                  </div>
                </>
              )}

              {(contract.initiatorNtn || contract.respondentNtn) && (
                <>
                  <hr className="border-gray-50" />
                  <div>
                    <span className="text-gray-400 font-bold uppercase tracking-wide block mb-1">Tax / Registration NTN</span>
                    {contract.initiatorNtn && <div className="text-black font-semibold">Party A NTN: {contract.initiatorNtn}</div>}
                    {contract.respondentNtn && <div className="text-black font-semibold">Party B NTN: {contract.respondentNtn}</div>}
                  </div>
                </>
              )}

              {contract.brandName && (
                <>
                  <hr className="border-gray-50" />
                  <div>
                    <span className="text-gray-400 font-bold uppercase tracking-wide block mb-1">Client Brand</span>
                    <span className="text-black font-bold">
                      {contract.brandName} {contract.brandHandle ? `(${contract.brandHandle})` : ""}
                    </span>
                    {contract.campaignName && (
                      <span className="text-[10px] text-gray-400 block mt-0.5 font-bold uppercase">Campaign: {contract.campaignName}</span>
                    )}
                  </div>
                </>
              )}
              {contract.creatorName && (
                <>
                  <hr className="border-gray-50" />
                  <div>
                    <span className="text-gray-400 font-bold uppercase tracking-wide block mb-1">Creator</span>
                    <span className="text-black font-bold">
                      {contract.creatorName} {contract.creatorHandle ? `(${contract.creatorHandle})` : ""}
                    </span>
                  </div>
                </>
              )}
              <hr className="border-gray-50" />
              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wide block mb-1">Platforms Allowed</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {contract.platformsAllowed?.map((p: string) => (
                    <span key={p} className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <hr className="border-gray-50" />
              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wide block mb-1">Usage Rights</span>
                <span className="text-black font-bold">{contract.usageRightsDuration}</span>
                <span className="text-[10px] text-gray-500 block font-semibold mt-0.5">{formatUsageLicenseText(contract.usageType)}</span>
              </div>
              <hr className="border-gray-50" />
              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wide block mb-1">Delivery &amp; Revision Protocol</span>
                <span className="text-black font-bold">{contract.deliveryTimeframeDays} Days (Round 1 Draft)</span>
                <span className="text-[10px] text-gray-500 block font-semibold mt-0.5">
                  Starts post product/advance receipt. Revisions: {contract.revisionRounds || 1} Rounds ({contract.revisionTurnaroundDays || 5} days/round).
                </span>
                {contract.brandApprovalRequired && (
                  <span className="text-[10px] text-blue-700 block font-semibold mt-0.5">48-Hr Deemed Approval Active</span>
                )}
              </div>
              <hr className="border-gray-50" />
              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wide block mb-1">Exclusivity Clause</span>
                <span className="text-black font-bold">
                  {contract.exclusivityClause ? `Active (${contract.exclusivityDuration || "Yes"})` : "Not Required"}
                </span>
                {contract.exclusivityClause && contract.exclusivityCompetitors && (
                  <span className="text-[10px] text-gray-500 font-semibold block mt-0.5">
                    Prohibited: {contract.exclusivityCompetitors}
                  </span>
                )}
              </div>
              {contract.confidentialityRequired && (
                <>
                  <hr className="border-gray-50" />
                  <div>
                    <span className="text-gray-400 font-bold uppercase tracking-wide block mb-1">Confidentiality / Product NDA</span>
                    <span className="text-amber-800 uppercase bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold inline-block">
                      Strict NDA Active
                    </span>
                    {contract.embargoDate && (
                      <span className="text-[10px] text-gray-500 font-semibold block mt-1">
                        Embargo Until: {formatLegalDate(contract.embargoDate)}
                      </span>
                    )}
                    {contract.earlyDisclosurePenalty && (
                      <span className="text-[10px] text-rose-600 font-bold block mt-0.5">
                        Early Leak Fine: PKR {Number(contract.earlyDisclosurePenalty).toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Financial & Deliverables list */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Financial details */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h4 className="text-xs font-black text-black border-b border-gray-100 pb-2 uppercase tracking-wider mb-4">Financial Settlements</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold">
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                <span className="text-gray-400 font-bold uppercase tracking-wider block mb-1">Total Valuation</span>
                <span className="text-base font-black text-black">PKR {Number(contract.totalAmount).toLocaleString()}</span>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between min-h-[90px]">
                <div>
                  <span className="text-gray-400 font-bold uppercase tracking-wider block mb-1">Advance Payment</span>
                  <span className="text-base font-black text-black">
                    {contract.advancePayment ? `PKR ${Number(contract.advancePayment).toLocaleString()}` : "PKR 0"}
                  </span>
                  {contract.advancePaymentDate && (
                    <span className="text-[10px] text-gray-500 block mt-1">
                      Due: {formatLegalDate(contract.advancePaymentDate)}
                    </span>
                  )}
                </div>
                {contract.advancePayment && (
                  <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border block w-fit mt-1.5 tracking-wider ${
                    contract.advanceReceived 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 uppercase" 
                      : "bg-amber-50 border-amber-200 text-amber-800 uppercase"
                  }`}>
                    {contract.advanceReceived ? "Confirmed" : "Pending"}
                  </span>
                )}
              </div>
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                <span className="text-gray-400 font-bold uppercase tracking-wider block mb-1">Remaining Payout</span>
                <span className="text-base font-black text-black">
                  PKR {Number(contract.remainingAmount || 0).toLocaleString()}
                </span>
                {contract.remainingPaymentDate && (
                  <span className="text-[10px] text-gray-500 block mt-1">
                    Due: {formatLegalDate(contract.remainingPaymentDate)}
                  </span>
                )}
              </div>
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                <span className="text-gray-400 font-bold uppercase tracking-wider block mb-1">Route Method</span>
                <span className="text-base font-black text-black uppercase">{contract.paymentMethod ? contract.paymentMethod.replace(/_/g, " ") : "Not Specified"}</span>
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
                      <td className="py-3 font-bold">{formatDeliverableTypeName(d.type)}</td>
                      <td className="py-3 font-bold text-center">{d.quantity}</td>
                      <td className="py-3 font-bold text-center text-gray-500">{d.duration || "Permanent"}</td>
                      <td className="py-3 text-gray-500">{d.notes || "No notes"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Collaboration Product Details & Loan Return Terms */}
          {contract.collabProduct && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-xs space-y-4">
              <h4 className="text-xs font-black text-black border-b border-gray-100 pb-2 uppercase tracking-wider">Collaboration Product Shipment &amp; Return Terms</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 font-bold block mb-1 uppercase tracking-wide">Product Details</span>
                  <span className="text-black font-bold bg-gray-50 p-3 rounded-lg border border-gray-200 block">
                    {contract.collabProduct} ({contract.collabProductProvisionType || "Provision"})
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block mb-1 uppercase tracking-wide">Expected Arrival Date</span>
                  <span className="text-black font-bold bg-gray-50 p-3 rounded-lg border border-gray-200 block">
                    {contract.collabDeliveryDate ? formatLegalDate(contract.collabDeliveryDate) : "Not Specified"}
                  </span>
                </div>
              </div>
              {contract.collabDeliveryAddress && (
                <div>
                  <span className="text-gray-400 font-bold block mb-1 uppercase tracking-wide">Delivery Address</span>
                  <p className="text-black leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200">{contract.collabDeliveryAddress}</p>
                </div>
              )}

              {contract.collabProductProvisionType === "Product Loan" && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs space-y-2">
                  <span className="font-bold text-amber-900 uppercase tracking-wider block">Product Loan Return Terms</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-amber-950">
                    <div>• Return Deadline: Within <strong>{contract.collabProductReturnDays || 7} days</strong> post-deliverable.</div>
                    <div>• Shipping Paid By: <strong>{contract.collabProductReturnShippingBy || "Brand"}</strong></div>
                    {contract.collabProductNonReturnFee && <div>• Loss / Non-Return Penalty Fee: <strong>PKR {Number(contract.collabProductNonReturnFee).toLocaleString()}</strong></div>}
                  </div>
                  {contract.collabProductReturnAddress && (
                    <div className="text-[11px] text-amber-900">Return Address: {contract.collabProductReturnAddress}</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bilateral Safeguards & Dispute Resolution */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-xs space-y-4">
            <h4 className="text-xs font-black text-black border-b border-gray-100 pb-2 uppercase tracking-wider">Bilateral Safeguard Penalties &amp; Governing Law</h4>
            
            <div>
              <span className="text-gray-400 font-bold block mb-1 uppercase tracking-wide">Bilateral Safeguard Penalties</span>
              <div className="text-black font-medium bg-gray-50 p-3.5 rounded-lg border border-gray-200 space-y-1.5 leading-relaxed">
                <div>• Late Payment Delay Penalty (Charged to Brand): <strong>{Number(contract.latePaymentPenaltyPct)}%/day</strong> (Capped at <strong>{Number(contract.penaltyCapPct || 20)}%</strong>)</div>
                <div>• Late Content Delivery Penalty (Charged to Creator): <strong>{Number(contract.lateContentPenaltyPct)}%/day</strong> (Capped at <strong>{Number(contract.penaltyCapPct || 20)}%</strong>)</div>
                <div>• Non-Delivery Cutoff: Content delayed beyond <strong>{contract.nonDeliveryCutoffDays || 7} calendar days</strong> legally constitutes Non-Delivery, stopping daily fees and triggering 100% advance refundability.</div>
                <div>• Unauthorized Brand Re-Use Penalty: <strong>{Number(contract.unauthorizedUsagePenaltyPct || 50)}% of contract value per violation</strong></div>
                <div>• Pre-Delivery Termination Fee: <strong>{Number(contract.cancellationFeePct || 25)}% of fee</strong></div>
              </div>
            </div>

            <div>
              <span className="text-gray-400 font-bold block mb-1 uppercase tracking-wide">Section 12: Governing Law &amp; Dispute Resolution (ADR)</span>
              <div className="text-blue-950 font-medium bg-blue-50/60 p-3.5 rounded-lg border border-blue-200 leading-relaxed">
                Governed by the laws of Pakistan. Any dispute proceeds to 14 days of good-faith executive negotiation. If unresolved: (a) Claims &le; PKR 500,000 proceed to summary determination in local courts; (b) Claims &gt; PKR 500,000 proceed to binding arbitration by a sole arbitrator under the <strong>Arbitration Act 1940 of Pakistan</strong>. Prevailing party recovers legal costs.
              </div>
            </div>

            <div>
              <span className="text-gray-400 font-bold block mb-1 uppercase tracking-wide">Content Ownership &amp; License Terms</span>
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
            {contract.signatures?.map((sig: any) => {
              return (
                <div key={sig.id} className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col gap-3 relative overflow-hidden">
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                    Signed Counterparty ({sig.signerRole})
                  </span>
                  
                  <div className="w-full h-24 bg-white border border-gray-200 rounded-xl flex items-center justify-center p-2">
                    <img src={sig.signatureImageUrl} alt="Signature canvas" className="h-full object-contain max-w-full" />
                  </div>

                  <div className="space-y-1 text-[10px] text-gray-500 font-semibold leading-relaxed mt-2">
                    <div className="flex justify-between">
                      <span>Signer Verified Email:</span>
                      <span className="text-black truncate max-w-xs">{sig.otpEmail || "No OTP verification log"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verification Date:</span>
                      <span className="text-black">{formatLegalDate(sig.signedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IP Address:</span>
                      <span className="text-black">{sig.ipAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Device / Browser:</span>
                      <span className="text-black font-semibold truncate max-w-[160px]" title={sig.userAgent || sig.deviceFingerprint}>{parseUserAgentString(sig.userAgent || sig.deviceFingerprint)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bilateral SHA-256:</span>
                      <span className="text-black font-mono truncate max-w-[110px]">{sig.documentHash?.slice(0, 20)}...</span>
                    </div>
                  </div>
                </div>
              );
            })}

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
