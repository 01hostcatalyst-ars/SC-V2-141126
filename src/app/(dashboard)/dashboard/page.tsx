"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/layout/ProtectedRoute";
import { useToast } from "@/components/ui/Toast";
import ContractCard from "@/components/contracts/ContractCard";

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "brand" | "creator" | "agency">("all");
  const [searchQuery, setSearchQuery] = useState("");

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
      } catch {
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

  // Statistics calculations
  const total = contracts.length;
  const active = contracts.filter((c) => c.status === "ACTIVE").length;
  const completed = contracts.filter((c) => c.status === "COMPLETED").length;
  const pendingSign = contracts.filter((c) => {
    if (c.status === "PENDING_INITIATOR" && c.initiator?.email === user?.email) return true;
    if (c.status === "PENDING_RESPONDENT" && c.respondentEmail === user?.email) return true;
    return false;
  }).length;

  // Filtered list for role-specific tabs and search query
  const filteredContracts = contracts.filter((c) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const numMatch = (c.contractNumber || "").toLowerCase().includes(q);
      const partyAMatch = (c.initiatorName || c.brandName || "").toLowerCase().includes(q);
      const partyBMatch = (c.respondentName || c.creatorName || c.respondentCompany || "").toLowerCase().includes(q);
      if (!numMatch && !partyAMatch && !partyBMatch) return false;
    }

    if (activeTab === "all") return true;
    if (user?.role === "AGENCY") {
      if (activeTab === "brand") return c.contractType === "AGENCY_TO_BRAND";
      if (activeTab === "creator") return c.contractType === "AGENCY_TO_CREATOR";
    }
    if (user?.role === "BRAND") {
      if (activeTab === "creator") return c.contractType === "BRAND_TO_CREATOR";
      if (activeTab === "agency") return c.contractType === "BRAND_TO_AGENCY";
    }
    if (user?.role === "CREATOR") {
      if (activeTab === "brand") return c.contractType === "CREATOR_TO_BRAND";
      if (activeTab === "agency") return c.contractType === "CREATOR_TO_AGENCY";
    }
    return true;
  });

  return (
    <div className="space-y-10 text-left">
      {/* Title & Quick Search Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-2 border-b border-gray-200/60">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-black tracking-tight font-display">Workspace Dashboard</h1>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Welcome back, <strong className="text-black font-semibold">{user?.name}</strong>. Manage your commercial agreements &amp; audit trails.
          </p>
        </div>

        {/* Quick Search Input & Action Button */}
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
              <span>+ Create Agreement</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 4 REDESIGNED ACTION METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Total Deals */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-3xl p-6 shadow-sm space-y-3 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Deals</span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <span className="text-3xl font-bold text-black block font-display">{total}</span>
          <span className="text-[10px] text-gray-500 font-medium block">All time campaign agreements</span>
        </div>

        {/* Metric 2: Active Deals */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-3xl p-6 shadow-sm space-y-3 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Active Deals</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <span className="text-3xl font-bold text-blue-600 block font-display">{active}</span>
          <span className="text-[10px] text-gray-500 font-medium block">Fully executed &amp; active</span>
        </div>

        {/* Metric 3: Completed Deals */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-3xl p-6 shadow-sm space-y-3 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Completed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <span className="text-3xl font-bold text-emerald-600 block font-display">{completed}</span>
          <span className="text-[10px] text-gray-500 font-medium block">Fulfilled &amp; archived</span>
        </div>

        {/* Metric 4: Action Required */}
        <div className="bg-white/80 backdrop-blur-md border border-amber-200 rounded-3xl p-6 shadow-sm space-y-3 hover:shadow-md transition-all relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Action Required</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <svg className="w-4 h-4 animate-bounce text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <span className="text-3xl font-bold text-amber-700 block font-display">{pendingSign}</span>
          <span className="text-[10px] text-amber-900 font-bold block">Awaiting your signature</span>
        </div>
      </div>

      {/* Role specific header features & links (Agency Tabs) */}
      {user?.role === "AGENCY" && (
        <div className="flex border border-gray-200 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl max-w-md shadow-sm">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeTab === "all" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            All Deals
          </button>
          <button
            onClick={() => setActiveTab("brand")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeTab === "brand" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            Brand Deals
          </button>
          <button
            onClick={() => setActiveTab("creator")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeTab === "creator" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            Creator Deals
          </button>
        </div>
      )}

      {/* Role specific tabs for Brands */}
      {user?.role === "BRAND" && (
        <div className="flex border border-gray-200 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl max-w-md shadow-sm">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeTab === "all" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            All Deals
          </button>
          <button
            onClick={() => setActiveTab("creator")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeTab === "creator" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            Creator Deals
          </button>
          <button
            onClick={() => setActiveTab("agency")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeTab === "agency" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            Agency Deals
          </button>
        </div>
      )}

      {/* Role specific tabs for Creators */}
      {user?.role === "CREATOR" && (
        <div className="flex border border-gray-200 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl max-w-md shadow-sm">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeTab === "all" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            All Deals
          </button>
          <button
            onClick={() => setActiveTab("brand")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeTab === "brand" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            Brand Deals
          </button>
          <button
            onClick={() => setActiveTab("agency")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeTab === "agency" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            Agency Deals
          </button>
        </div>
      )}

      {/* Contract list container */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-black font-display">Active Partnership Agreements</h3>
          <span className="text-xs text-gray-500 font-semibold">{filteredContracts.length} agreements found</span>
        </div>
        
        {loading ? (
          <div className="py-20 flex justify-center items-center flex-col gap-3 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200 shadow-sm">
            <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Syncing agreement vault...</span>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="py-20 text-center bg-white/80 backdrop-blur-md border border-gray-200 rounded-3xl p-10 shadow-sm flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="font-bold text-black text-lg font-display">No Agreements Found</h4>
            <p className="text-xs text-gray-500 max-w-sm font-medium leading-relaxed">
              You haven&apos;t initiated or received any agreements matching this view yet. Generate your first legally binding agreement draft to get started.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredContracts.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                currentUserEmail={user?.email}
                onDownloadPDF={handleDownloadPDF}
                onDownloadCertificate={handleDownloadCertificate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
