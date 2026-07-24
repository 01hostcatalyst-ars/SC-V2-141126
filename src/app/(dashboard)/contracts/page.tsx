"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/layout/ProtectedRoute";
import { useToast } from "@/components/ui/Toast";
import ContractCard from "@/components/contracts/ContractCard";

export default function ContractsListPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await fetch("/api/contracts");
        const data = await res.json();
        if (res.ok) {
          setContracts(data.contracts || []);
        } else {
          showToast(data.error || "Failed to load contracts.", "error");
        }
      } catch (err) {
        showToast("Error retrieving contracts record.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, [showToast]);

  const handleDownloadPDF = async (contractId: string) => {
    try {
      const res = await fetch(`/api/contracts/${contractId}/pdf`);
      const data = await res.json();
      if (res.ok && data.url) {
        window.open(data.url, "_blank");
      } else {
        showToast(data.error || "Failed to generate download link.", "error");
      }
    } catch (err) {
      showToast("Error retrieving PDF document.", "error");
    }
  };

  const handleDownloadCertificate = async (contractId: string) => {
    try {
      const res = await fetch(`/api/contracts/${contractId}/certificate`);
      const data = await res.json();
      if (res.ok && data.url) {
        window.open(data.url, "_blank");
      } else {
        showToast(data.error || "Failed to generate certificate link.", "error");
      }
    } catch (err) {
      showToast("Error retrieving Audit Certificate document.", "error");
    }
  };

  const filteredContracts = contracts.filter((c) => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return c.status === "ACTIVE";
    if (filter === "PENDING") return c.status === "PENDING_RESPONDENT" || c.status === "PENDING_INITIATOR";
    if (filter === "COMPLETED") return c.status === "COMPLETED";
    if (filter === "DRAFT") return c.status === "DRAFT";
    return true;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-black">Campaign Agreements</h1>
          <p className="text-xs text-gray-500 mt-1">Review, execute, and inspect your legal contract portfolio.</p>
        </div>
        <Link href="/contracts/new">
          <button className="bg-black text-white hover:bg-black/90 font-bold px-6 py-3 rounded-xl transition-all shadow-md text-sm cursor-pointer">
            + Create Agreement
          </button>
        </Link>
      </div>

      {/* Filter Menu Bar */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {[
          { label: "All Agreements", value: "ALL" },
          { label: "Active", value: "ACTIVE" },
          { label: "Pending Signatures", value: "PENDING" },
          { label: "Completed", value: "COMPLETED" },
          { label: "Drafts", value: "DRAFT" },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              filter === item.value
                ? "bg-black border-black text-white"
                : "bg-white border-gray-200 text-gray-500 hover:text-black"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Contracts table or card grid */}
      {loading ? (
        <div className="py-12 flex justify-center items-center flex-col gap-2 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Querying agreements...</span>
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="py-16 text-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h4 className="font-bold text-black text-base">No agreements match the filter</h4>
          <p className="text-xs text-gray-400 mt-1">Try switching tabs or draft a new partnership deal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContracts.map((c) => (
            <ContractCard
              key={c.id}
              contract={c}
              currentUserEmail={user?.email}
              onDownloadPDF={handleDownloadPDF}
              onDownloadCertificate={handleDownloadCertificate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
