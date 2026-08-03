"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/layout/ProtectedRoute";
import { useToast } from "@/components/ui/Toast";
import ContractCard from "@/components/contracts/ContractCard";

const ITEMS_PER_PAGE = 8;

export default function ContractsListPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [activeRoleTab, setActiveRoleTab] = useState<"all" | "brand" | "creator" | "agency">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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
      } catch {
        showToast("Error retrieving contracts record.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, [showToast]);

  // Reset pagination when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, activeRoleTab, searchQuery]);

  const handleDownloadPDF = async (contractId: string) => {
    try {
      const res = await fetch(`/api/contracts/${contractId}/pdf`);
      const data = await res.json();
      if (res.ok && data.url) {
        window.open(data.url, "_blank");
      } else {
        showToast(data.error || "Failed to generate download link.", "error");
      }
    } catch {
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
    } catch {
      showToast("Error retrieving Audit Certificate document.", "error");
    }
  };

  // Filtered contracts combining Search, Status Filter & Role Tab
  const filteredContracts = contracts.filter((c) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const numMatch = (c.contractNumber || "").toLowerCase().includes(q);
      const partyAMatch = (c.initiatorName || c.brandName || "").toLowerCase().includes(q);
      const partyBMatch = (c.respondentName || c.creatorName || c.respondentCompany || "").toLowerCase().includes(q);
      if (!numMatch && !partyAMatch && !partyBMatch) return false;
    }

    // 2. Status Filter
    if (statusFilter === "ACTIVE" && c.status !== "ACTIVE") return false;
    if (statusFilter === "PENDING" && (c.status !== "PENDING_RESPONDENT" && c.status !== "PENDING_INITIATOR")) return false;
    if (statusFilter === "COMPLETED" && c.status !== "COMPLETED") return false;
    if (statusFilter === "DRAFT" && c.status !== "DRAFT") return false;

    // 3. Role Specific Tab Filter
    if (activeRoleTab !== "all") {
      if (user?.role === "AGENCY") {
        if (activeRoleTab === "brand" && c.contractType !== "AGENCY_TO_BRAND") return false;
        if (activeRoleTab === "creator" && c.contractType !== "AGENCY_TO_CREATOR") return false;
      }
      if (user?.role === "BRAND") {
        if (activeRoleTab === "creator" && c.contractType !== "BRAND_TO_CREATOR") return false;
        if (activeRoleTab === "agency" && c.contractType !== "BRAND_TO_AGENCY") return false;
      }
      if (user?.role === "CREATOR") {
        if (activeRoleTab === "brand" && c.contractType !== "CREATOR_TO_BRAND") return false;
        if (activeRoleTab === "agency" && c.contractType !== "CREATOR_TO_AGENCY") return false;
      }
    }

    return true;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredContracts.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedContracts = filteredContracts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-10 text-left">
      {/* Title & Quick Search Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-2 border-b border-gray-200/60">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-black tracking-tight font-display">Campaign Agreements</h1>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Review, execute, and inspect your bilaterally signed contract portfolio.
          </p>
        </div>

        {/* Quick Search & Create CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative min-w-[280px]">
            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search contract # or party..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/90 backdrop-blur-md border border-gray-200 focus:border-black rounded-xl text-xs font-semibold outline-none transition-all shadow-sm"
            />
          </div>

          <Link href="/contracts/new">
            <button className="w-full sm:w-auto bg-black hover:bg-gray-900 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md text-xs whitespace-nowrap flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Agreement</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Role-Specific Filter Tabs (if AGENCY, BRAND, or CREATOR) */}
      {user?.role === "AGENCY" && (
        <div className="flex border border-gray-200 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl max-w-md shadow-sm">
          <button
            onClick={() => setActiveRoleTab("all")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeRoleTab === "all" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            All Deals
          </button>
          <button
            onClick={() => setActiveRoleTab("brand")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeRoleTab === "brand" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            Brand Deals
          </button>
          <button
            onClick={() => setActiveRoleTab("creator")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeRoleTab === "creator" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            Creator Deals
          </button>
        </div>
      )}

      {user?.role === "BRAND" && (
        <div className="flex border border-gray-200 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl max-w-md shadow-sm">
          <button
            onClick={() => setActiveRoleTab("all")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeRoleTab === "all" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            All Deals
          </button>
          <button
            onClick={() => setActiveRoleTab("creator")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeRoleTab === "creator" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            Creator Deals
          </button>
          <button
            onClick={() => setActiveRoleTab("agency")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeRoleTab === "agency" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            Agency Deals
          </button>
        </div>
      )}

      {user?.role === "CREATOR" && (
        <div className="flex border border-gray-200 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl max-w-md shadow-sm">
          <button
            onClick={() => setActiveRoleTab("all")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeRoleTab === "all" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            All Deals
          </button>
          <button
            onClick={() => setActiveRoleTab("brand")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeRoleTab === "brand" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            Brand Deals
          </button>
          <button
            onClick={() => setActiveRoleTab("agency")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeRoleTab === "agency" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            Agency Deals
          </button>
        </div>
      )}

      {/* Status Filter Menu Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200/80 pb-4">
        {[
          { label: "All Agreements", value: "ALL" },
          { label: "Active", value: "ACTIVE" },
          { label: "Pending Signatures", value: "PENDING" },
          { label: "Completed", value: "COMPLETED" },
          { label: "Drafts", value: "DRAFT" },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setStatusFilter(item.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              statusFilter === item.value
                ? "bg-black border-black text-white shadow-sm"
                : "bg-white/80 backdrop-blur-md border-gray-200 text-gray-600 hover:text-black hover:bg-gray-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Header Counter Info */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-black font-display">Agreement Vault</h3>
        <span className="text-xs text-gray-500 font-semibold">
          Showing {paginatedContracts.length} of {filteredContracts.length} agreements (Page {currentPage} of {totalPages})
        </span>
      </div>

      {/* Contracts table or card grid */}
      {loading ? (
        <div className="py-20 flex justify-center items-center flex-col gap-3 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200 shadow-sm">
          <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Syncing agreement vault...</span>
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="py-20 text-center bg-white/80 backdrop-blur-md border border-gray-200 rounded-3xl p-10 shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="font-bold text-black text-lg font-display">No Agreements Found</h4>
          <p className="text-xs text-gray-500 max-w-sm font-medium leading-relaxed">
            No agreements match your selected tab or search query. Try switching tabs or draft a new partnership deal.
          </p>
          <Link href="/contracts/new">
            <button className="bg-black hover:bg-gray-900 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md text-xs flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Agreement</span>
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Card Grid (8 items per page) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedContracts.map((c) => (
              <ContractCard
                key={c.id}
                contract={c}
                currentUserEmail={user?.email}
                onDownloadPDF={handleDownloadPDF}
                onDownloadCertificate={handleDownloadCertificate}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200/80">
              <span className="text-xs text-gray-500 font-semibold">
                Page <strong className="text-black font-bold font-display">{currentPage}</strong> of <strong className="text-black font-bold font-display">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 disabled:opacity-40 disabled:hover:bg-white text-black font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-black text-white shadow-sm"
                          : "bg-white hover:bg-gray-100 border border-gray-200 text-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 disabled:opacity-40 disabled:hover:bg-white text-black font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>Next</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
