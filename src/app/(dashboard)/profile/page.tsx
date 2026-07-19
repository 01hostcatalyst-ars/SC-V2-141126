"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/layout/ProtectedRoute";
import { useToast } from "@/components/ui/Toast";

export default function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [cnicNumber, setCnicNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [updating, setUpdating] = useState(false);

  // Sync state with user profile from context
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setInstagramHandle(user.instagramHandle || "");
      setCnicNumber(user.cnicNumber || "");
      setCompanyName(user.agencyName || "");
      setCompanyAddress(user.agencyAddress || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      showToast("Name is required.", "error");
      return;
    }
    setUpdating(true);

    const payload = {
      name,
      phone,
      instagramHandle: user?.role === "CREATOR" ? instagramHandle : undefined,
      cnicNumber: user?.role === "CREATOR" ? cnicNumber : undefined,
      agencyName: user?.role !== "CREATOR" ? companyName : undefined,
      agencyAddress: user?.role !== "CREATOR" ? companyAddress : undefined,
    };

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Profile settings updated successfully! Please reload to synchronize.", "success");
      } else {
        showToast(data.error || "Failed to update profile.", "error");
      }
    } catch (err) {
      showToast("Error executing profile save.", "error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-2xl mx-auto">
      {/* Title block */}
      <div>
        <h1 className="text-3xl font-black text-black">Profile Settings</h1>
        <p className="text-xs text-gray-500 mt-1">Manage your professional credentials and identity proof parameters.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleUpdateProfile} className="space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black uppercase tracking-wider">
                {user?.role === "CREATOR" ? "Full Name" : "Contact Person Name"}
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={updating}
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black uppercase tracking-wider">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                className="input-field bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
                value={user?.email || ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black uppercase tracking-wider">Phone (WhatsApp)</label>
              <input
                type="tel"
                placeholder="03XXXXXXXXX"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={updating}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black uppercase tracking-wider">Account Role Badge</label>
              <input
                type="text"
                disabled
                className="input-field bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200 uppercase font-bold"
                value={user?.role || ""}
              />
            </div>
          </div>

          {/* Role specific inputs */}
          {user?.role === "CREATOR" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">Instagram Handle</label>
                <input
                  type="text"
                  placeholder="@username"
                  className="input-field"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  disabled={updating}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">National ID Number (CNIC / SSN / Iqama)</label>
                <input
                  type="text"
                  placeholder="Enter National Identity Card, SSN, Iqama or Passport number"
                  className="input-field"
                  value={cnicNumber}
                  onChange={(e) => setCnicNumber(e.target.value)}
                  disabled={updating}
                />
              </div>
            </div>
          )}

          {user?.role !== "CREATOR" && (
            <div className="space-y-4 border-t border-gray-100 pt-4 mt-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">
                  {user?.role === "BRAND" ? "Brand / Company Name" : "Agency Name"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={user?.role === "BRAND" ? "Sapphire" : "Core Media Agency"}
                  className="input-field"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={updating}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-black uppercase tracking-wider">Office Address</label>
                <input
                  type="text"
                  required
                  placeholder="Office address, Lahore"
                  className="input-field"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  disabled={updating}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={updating}
            className="w-full bg-black text-white hover:bg-black/90 font-bold text-xs uppercase py-3 rounded-xl transition-all shadow-md mt-6"
          >
            {updating ? "Saving Changes..." : "Save Profile Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
