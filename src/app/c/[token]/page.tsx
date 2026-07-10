"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RespondentForm } from "@/components/contract/RespondentForm";
import { SignatureModal } from "@/components/signature/SignatureModal";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { getCompanyConfig } from "@/lib/config";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function RespondentPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { showToast } = useToast();
  const company = getCompanyConfig();

  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [respondentData, setRespondentData] = useState<any>(null);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const res = await fetch(`/api/contracts/share/${resolvedParams.token}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setContract(data.contract);
        } else {
          showToast(data.error || "Failed to load agreement.", "error");
        }
      } catch (err) {
        showToast("Error retrieving shared agreement details.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [resolvedParams.token, showToast]);

  const handleDetailsSubmit = (formData: any) => {
    setRespondentData(formData);
    setIsModalOpen(true);
  };

  const handleSignatureConfirm = async (signatureB64: string, fingerprint: string) => {
    setSigning(true);
    try {
      // 1. Submit respondent profile details
      const detailsRes = await fetch(`/api/contracts/share/${resolvedParams.token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(respondentData),
      });

      if (!detailsRes.ok) throw new Error("Failed to save profile parameters.");

      // Compute simple hash representing document specifications
      const documentHash = "SHA256-" + resolvedParams.token;

      // 2. Submit signature payload
      const signRes = await fetch(`/api/contracts/share/${resolvedParams.token}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureB64,
          documentHash,
          fingerprint,
          email: respondentData.respondentEmail,
        }),
      });

      const signData = await signRes.json();
      if (!signRes.ok) throw new Error(signData.error || "Signing transaction failed.");

      showToast("Agreement signed successfully!", "success");
      window.location.href = `/c/${resolvedParams.token}/success`;
    } catch (err: any) {
      showToast(err.message || "Signing transaction failed.", "error");
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-white mb-2">Invalid or Expired Link</h2>
        <p className="text-slate-400 text-sm mb-6">This agreement link is no longer valid or has expired.</p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 relative">
      <Header />

      <main className="flex-grow pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Agreement Review: {contract.contractNumber}
            </span>
            <Badge variant="warning">Awaiting Counterparty Signature</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Agreement Terms Preview Card */}
            <Card className="md:col-span-1 flex flex-col gap-4 text-left text-xs bg-slate-900/30">
              <h5 className="font-bold text-white text-sm uppercase tracking-wider pb-2 border-b border-slate-900">
                Campaign Terms
              </h5>
              <div>
                <span className="text-slate-500 font-semibold block mb-1">Contract Type</span>
                <Badge variant="primary">{contract.contractType.replace(/_/g, " ")}</Badge>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block mb-1">Total Campaign Value</span>
                <span className="text-white font-bold text-sm">PKR {Number(contract.totalAmount).toLocaleString()}</span>
              </div>
              {contract.advancePayment && (
                <div>
                  <span className="text-slate-500 font-semibold block mb-1">Advance Amount</span>
                  <span className="text-white font-bold">PKR {Number(contract.advancePayment).toLocaleString()}</span>
                </div>
              )}
              <div>
                <span className="text-slate-500 font-semibold block mb-1">Delivery Timeframe</span>
                <span className="text-slate-300 font-semibold">{contract.deliveryTimeframeDays} Days after execution</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block mb-1">Allowed Platforms</span>
                <span className="text-slate-300 font-semibold">{contract.platformsAllowed.join(", ")}</span>
              </div>
            </Card>

            {/* Respondent Fillable Profile Details Form */}
            <Card className="md:col-span-2">
              <RespondentForm
                contractType={contract.contractType}
                onSubmit={handleDetailsSubmit}
                isLoading={signing}
              />
            </Card>
          </div>
        </div>
      </main>

      <SignatureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleSignatureConfirm}
      />

      <Footer />
    </div>
  );
}
