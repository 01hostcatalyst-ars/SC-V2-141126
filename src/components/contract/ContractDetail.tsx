"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusTimeline } from "./StatusTimeline";
import { SignatureModal } from "@/components/signature/SignatureModal";
import { useToast } from "@/components/ui/Toast";

interface ContractDetailProps {
  contract: any;
  userRole: string;
  refreshContract: () => void;
}

export const ContractDetail: React.FC<ContractDetailProps> = ({
  contract,
  userRole,
  refreshContract,
}) => {
  const { showToast } = useToast();

  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const getRemainingAmount = () => {
    return Number(contract.totalAmount || 0) - Number(contract.advancePayment || 0);
  };

  const handlePublishLink = async () => {
    setIsSubmitLoading(true);
    try {
      const res = await fetch(`/api/contracts/${contract.id}/submit`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to submit draft agreement.");
      showToast("Agreement submitted. Copy public shared link below.", "success");
      refreshContract();
    } catch (err: any) {
      showToast(err.message || "Failed to submit contract.", "error");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleInitiatorSignatureConfirm = async (signatureB64: string, fingerprint: string) => {
    setIsSigning(true);
    const documentHash = "SHA256-" + contract.id;

    try {
      const res = await fetch(`/api/contracts/${contract.id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureB64,
          documentHash,
          fingerprint,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit signature.");

      showToast("Contract executed successfully and activated!", "success");
      refreshContract();
    } catch (err: any) {
      showToast(err.message || "Signature execution failed.", "error");
    } finally {
      setIsSigning(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const res = await fetch(`/api/contracts/${contract.id}/pdf`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to retrieve document.");
      
      // Open signed download link
      window.open(data.url, "_blank");
    } catch (err: any) {
      showToast(err.message || "Failed to download agreement.", "error");
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/c/${contract.shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    showToast("Shared contract link copied to clipboard!", "info");
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <StatusTimeline status={contract.status} />

      {/* Share link box */}
      {contract.status === "PENDING_RESPONDENT" && (
        <Card className="flex flex-col sm:flex-row items-center gap-4 bg-blue-500/5 border-blue-500/10 p-4">
          <div className="flex-1 text-xs">
            <span className="font-bold text-blue-400 block mb-0.5">Shared Contract Access Link</span>
            <span className="text-slate-400 block break-all">{window.location.origin}/c/{contract.shareToken}</span>
          </div>
          <Button variant="secondary" onClick={copyShareLink}>
            Copy Shared Link
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Main Details Panel */}
        <Card className="md:col-span-2 flex flex-col gap-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Campaign Specifications</span>
            <h4 className="text-xl font-bold text-white mt-0.5">Agreement # {contract.contractNumber}</h4>
          </div>

          {/* Deliverables */}
          <div className="flex flex-col gap-2 mt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Deliverables List</span>
            <div className="flex flex-col gap-2 pl-3 border-l-2 border-slate-800">
              {contract.deliverables?.map((d: any) => (
                <div key={d.id} className="text-sm text-slate-300">
                  <strong>{d.quantity}x {d.type.replace(/_/g, " ")}</strong>
                  {d.duration && <span className="text-slate-500 ml-1">({d.duration})</span>}
                  {d.notes && <p className="text-xs text-slate-500 mt-0.5">{d.notes}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Platforms Allowed */}
          <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-0.5">Allowed Platforms</span>
              <span className="text-sm font-semibold text-slate-300">{contract.platformsAllowed.join(", ")}</span>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-0.5">Usage Type</span>
              <span className="text-sm font-semibold text-slate-300">{contract.usageType.replace(/_/g, " ")}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-0.5">Usage Rights Duration</span>
              <span className="text-sm font-semibold text-slate-300">{contract.usageRightsDuration.replace(/_/g, " ")}</span>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-0.5">Delivery Frame</span>
              <span className="text-sm font-semibold text-slate-300">{contract.deliveryTimeframeDays} Days after signing</span>
            </div>
          </div>

          {/* Ownership */}
          <div className="border-t border-slate-900 pt-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Copyright Term</span>
            <span className="text-xs text-slate-400 font-medium leading-relaxed">{contract.contentOwnership}</span>
          </div>
        </Card>

        {/* Financial & Signing Panel */}
        <div className="flex flex-col gap-6 md:col-span-1">
          {/* Compensation */}
          <Card className="flex flex-col gap-4 bg-slate-900/30">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider pb-2 border-b border-slate-900">
              Financial Summary
            </h5>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Total Value</span>
              <span className="text-white font-extrabold text-lg">PKR {Number(contract.totalAmount).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Advance Payment</span>
              <span className="text-slate-300 font-semibold">PKR {Number(contract.advancePayment || 0).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Remaining Balance</span>
              <span className="text-slate-300 font-semibold">PKR {getRemainingAmount().toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Payment Method</span>
              <Badge variant="info">{contract.paymentMethod.replace(/_/g, " ")}</Badge>
            </div>
          </Card>

          {/* Action triggers */}
          <Card className="flex flex-col gap-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider pb-2 border-b border-slate-900">
              Actions
            </h5>

            {contract.status === "DRAFT" && (
              <Button onClick={handlePublishLink} isLoading={isSubmitLoading} className="w-full">
                Submit & Get Share Link
              </Button>
            )}

            {contract.status === "PENDING_INITIATOR" && (
              <Button onClick={() => setIsSignModalOpen(true)} className="w-full" isLoading={isSigning}>
                Sign Contract to Activate
              </Button>
            )}

            {(contract.status === "ACTIVE" || contract.status === "COMPLETED") && contract.pdfUrl && (
              <Button onClick={handleDownloadPdf} variant="secondary" className="w-full">
                Download Signed PDF
              </Button>
            )}

            {contract.status === "PENDING_RESPONDENT" && (
              <div className="text-xs text-slate-500 font-medium text-center">
                Awaiting counterparty verification and signature details...
              </div>
            )}
          </Card>
        </div>
      </div>

      <SignatureModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onConfirm={handleInitiatorSignatureConfirm}
      />
    </div>
  );
};
