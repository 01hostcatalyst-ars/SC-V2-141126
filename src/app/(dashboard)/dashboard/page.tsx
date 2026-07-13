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
  advancePayment: string | null;
  respondentName: string | null;
  respondentEmail: string | null;
  respondentCompany: string | null;
  createdAt: string;
  linkedContractId: string | null;
  initiator: { name: string; role: string; email: string };
  respondent: { name: string; role: string; email: string } | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "brand" | "creator">("all");

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await fetch("/api/contracts");
        const data = await res.json();
        if (res.ok) {
          setContracts(data.contracts || []);
        } else {
          showToast(data.error || "Failed to load agreements.", "error");
        }
      } catch (err) {
        showToast("Error retrieving dashboard agreements.", "error");
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

  // Statistics calculations
  const total = contracts.length;
  const active = contracts.filter((c) => c.status === "ACTIVE").length;
  const completed = contracts.filter((c) => c.status === "COMPLETED").length;
  const pendingSign = contracts.filter((c) => {
    // Awaiting current user signature
    if (c.status === "PENDING_INITIATOR" && c.initiator.email === user?.email) return true;
    if (c.status === "PENDING_RESPONDENT" && c.respondentEmail === user?.email) return true;
    return false;
  }).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-800 uppercase tracking-wider">Draft</span>;
      case "PENDING_RESPONDENT":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 border border-blue-200 text-blue-800 uppercase tracking-wider">Awaiting Receiver</span>;
      case "PENDING_INITIATOR":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 border border-orange-200 text-orange-800 uppercase tracking-wider">Awaiting You</span>;
      case "ACTIVE":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 uppercase tracking-wider">Active</span>;
      case "COMPLETED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-800 uppercase tracking-wider">Completed</span>;
      case "EXPIRED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 border border-rose-200 text-rose-800 uppercase tracking-wider">Expired</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-50 border border-gray-200 text-gray-800 uppercase tracking-wider">{status}</span>;
    }
  };

  const getContractTypeBadge = (type: string) => {
    switch (type) {
      case "CREATOR_TO_BRAND":
        return <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">Creator ➔ Brand</span>;
      case "BRAND_TO_CREATOR":
        return <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">Brand ➔ Creator</span>;
      case "AGENCY_TO_BRAND":
        return <span className="text-[10px] font-bold bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">Agency ➔ Brand</span>;
      case "AGENCY_TO_CREATOR":
        return <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">Agency ➔ Creator</span>;
      default:
        return <span className="text-[10px] font-bold bg-gray-50 text-gray-700 px-2 py-0.5 rounded border border-gray-200">{type}</span>;
    }
  };

  // Filtered list for Agency tabs
  const filteredContracts = contracts.filter((c) => {
    if (user?.role !== "AGENCY" || activeTab === "all") return true;
    if (activeTab === "brand") return c.contractType === "AGENCY_TO_BRAND";
    if (activeTab === "creator") return c.contractType === "AGENCY_TO_CREATOR";
    return true;
  });

  return (
    <div className="space-y-8 text-left">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-black">Workspace Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1">
            Welcome back, <strong className="text-black">{user?.name}</strong>. Manage your agreements here.
          </p>
        </div>
        <Link href="/contracts/new">
          <button className="bg-black text-white hover:bg-black/90 font-bold px-6 py-3 rounded-xl transition-all shadow-md text-sm">
            + Create Agreement
          </button>
        </Link>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Deals</span>
          <span className="text-3xl font-black text-black block mt-1">{total}</span>
        </div>
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Active Deals</span>
          <span className="text-3xl font-black text-blue-600 block mt-1">{active}</span>
        </div>
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Completed Deals</span>
          <span className="text-3xl font-black text-emerald-600 block mt-1">{completed}</span>
        </div>
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Action Required</span>
          <span className="text-3xl font-black text-orange-600 block mt-1">{pendingSign}</span>
        </div>
      </div>

      {/* Role specific header features & links (Agency Tabs) */}
      {user?.role === "AGENCY" && (
        <div className="flex border-b border-gray-200 bg-white p-1 rounded-xl border max-w-md">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "all" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            All Deals
          </button>
          <button
            onClick={() => setActiveTab("brand")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "brand" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            Brand Deals
          </button>
          <button
            onClick={() => setActiveTab("creator")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "creator" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            Creator Deals
          </button>
        </div>
      )}

      {/* Contract list container */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-black">Active Partnership Agreements</h3>
        
        {loading ? (
          <div className="py-12 flex justify-center items-center flex-col gap-2 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Syncing documents...</span>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="py-16 text-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center">
            <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h4 className="font-bold text-black text-lg">No Agreements Found</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              You haven&apos;t initiated or received any campaigns yet. Generate your first legally binding agreement draft to get started.
            </p>
            <Link href="/contracts/new" className="mt-5">
              <button className="bg-black text-white hover:bg-black/90 font-bold px-6 py-2.5 rounded-xl transition-all shadow-md text-xs">
                Create Agreement
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredContracts.map((contract) => {
              const partnerName = contract.initiator.email === user?.email 
                ? (contract.respondentName || contract.respondentEmail || "Awaiting Receiver")
                : contract.initiator.name;
              
              return (
                <Link key={contract.id} href={`/contracts/${contract.id}`} className="block">
                  <div className="premium-card p-5 text-left flex flex-col justify-between h-full bg-white border border-gray-200 rounded-2xl cursor-pointer">
                    <div className="space-y-4">
                      {/* Header row */}
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {contract.contractNumber}
                        </span>
                        {getStatusBadge(contract.status)}
                      </div>

                      {/* Title Partner */}
                      <div>
                        <h4 className="text-base font-bold text-black truncate">
                          Deal Partner: {partnerName}
                        </h4>
                        {contract.respondentCompany && (
                          <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">
                            Company: {contract.respondentCompany}
                          </p>
                        )}
                      </div>

                      {/* Type Badge & Meta info */}
                      <div className="flex flex-wrap gap-2 items-center">
                        {getContractTypeBadge(contract.contractType)}
                        {contract.linkedContractId && (
                          <span className="text-[10px] font-extrabold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                            Linked Campaign
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Finance Row */}
                    <div className="border-t border-gray-100 pt-4 mt-5 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Total Campaign Value</span>
                        <span className="text-sm font-black text-black">PKR {Number(contract.totalAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {(contract.status === "ACTIVE" || contract.status === "COMPLETED") && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDownloadPDF(contract.id);
                            }}
                            className="bg-black text-white hover:bg-black/90 font-bold px-3 py-1.5 rounded-lg text-[9px] uppercase shadow-sm transition-all whitespace-nowrap"
                          >
                            Download PDF
                          </button>
                        )}
                        <div className="text-[10px] text-gray-400 font-bold uppercase hover:underline text-black">
                          Details ➔
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
