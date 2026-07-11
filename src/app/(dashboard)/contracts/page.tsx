"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/layout/ProtectedRoute";
import { useToast } from "@/components/ui/Toast";

interface Contract {
  id: string;
  contractNumber: string;
  contractType: string;
  status: string;
  totalAmount: string;
  respondentName: string | null;
  respondentEmail: string | null;
  respondentCompany: string | null;
  createdAt: string;
  linkedContractId: string | null;
  initiator: { name: string; email: string };
}

export default function ContractsListPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [contracts, setContracts] = useState<Contract[]>([]);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-800 uppercase tracking-wider">Draft</span>;
      case "PENDING_RESPONDENT":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 border border-blue-200 text-blue-800 uppercase tracking-wider">Awaiting Counterparty</span>;
      case "PENDING_INITIATOR":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 border border-orange-200 text-orange-800 uppercase tracking-wider">Awaiting You</span>;
      case "ACTIVE":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 uppercase tracking-wider">Active</span>;
      case "COMPLETED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-800 uppercase tracking-wider">Completed</span>;
      case "EXPIRED":
      case "CANCELLED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 border border-rose-200 text-rose-800 uppercase tracking-wider">{status.toLowerCase()}</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-50 border border-gray-200 text-gray-800 uppercase tracking-wider">{status}</span>;
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
          <button className="bg-black text-white hover:bg-black/90 font-bold px-6 py-3 rounded-xl transition-all shadow-md text-sm">
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
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
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
          <h4 className="font-bold text-black text-base">No agreements matches the filter</h4>
          <p className="text-xs text-gray-400 mt-1">Try switching tabs or draft a new partnership deal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContracts.map((c) => {
            const partner = c.initiator.email === user?.email 
              ? (c.respondentName || c.respondentEmail || "Awaiting Receiver")
              : c.initiator.name;

            return (
              <Link key={c.id} href={`/contracts/${c.id}`}>
                <div className="premium-card p-5 text-left bg-white border border-gray-200 rounded-2xl cursor-pointer flex flex-col justify-between h-full">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{c.contractNumber}</span>
                      {getStatusBadge(c.status)}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-black truncate">Partner: {partner}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">
                        Type: {c.contractType.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mt-5 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Value</span>
                      <span className="text-sm font-black text-black">PKR {Number(c.totalAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {(c.status === "ACTIVE" || c.status === "COMPLETED") && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDownloadPDF(c.id);
                          }}
                          className="bg-black text-white hover:bg-black/90 font-bold px-3 py-1.5 rounded-lg text-[9px] uppercase shadow-sm transition-all whitespace-nowrap"
                        >
                          Download PDF
                        </button>
                      )}
                      <span className="text-[10px] font-bold text-black uppercase hover:underline">View Detail ➔</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
