"use client";

import React, { useState } from "react";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    category: "general",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [ticketId, setTicketId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const categories = [
    { value: "general", label: "General Inquiries (questions@signcollab.com)" },
    { value: "support", label: "Technical & Contract Support (support@signcollab.com)" },
    { value: "sales", label: "Enterprise & Agency Sales (sales@signcollab.com)" },
    { value: "security", label: "Security & Vulnerability Disclosure (security@signcollab.com)" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus("error");
      setErrorMessage("Please fill in all required fields (Name, Email, and Message).");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    // Simulate swift submission handling with reference ticket generation
    setTimeout(() => {
      const generatedId = `SC-${Math.floor(100000 + Math.random() * 900000)}`;
      setTicketId(generatedId);
      setStatus("success");
    }, 800);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      company: "",
      category: "general",
      subject: "",
      message: "",
    });
    setStatus("idle");
    setTicketId("");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-black tracking-tight">Send a Direct Message</h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Fill out the form below. Your request will be routed directly to the designated department.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          SLA: &lt;24 Business Hours
        </span>
      </div>

      {status === "success" ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-xl font-bold">
            ✓
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-emerald-950">Message Sent Successfully</h3>
            <p className="text-xs text-emerald-800 font-medium max-w-md mx-auto">
              Thank you, <strong>{formData.name}</strong>. Your inquiry regarding{" "}
              <span className="capitalize font-bold">&quot;{formData.category}&quot;</span> has been received under Reference ID:
            </p>
            <div className="inline-block bg-white px-4 py-1.5 rounded-lg border border-emerald-300 font-mono font-bold text-xs text-emerald-900 mt-2">
              {ticketId}
            </div>
          </div>
          <p className="text-[11px] text-gray-500">
            A confirmation has been logged for <strong>{formData.email}</strong>. Our team typically responds within 24 business hours (UTC schedule).
          </p>
          <button
            onClick={handleReset}
            type="button"
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {status === "error" && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2">
              <span>Notice:</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-black">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Sarah Jenkins"
                required
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-black">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="sarah@example.com"
                required
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company / Organization */}
            <div className="space-y-1.5">
              <label htmlFor="company" className="block text-xs font-bold uppercase tracking-wider text-black">
                Company / Organization <span className="text-gray-400 font-normal text-[11px]">(Optional)</span>
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. Apex Media Agency"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Inquiry Category */}
            <div className="space-y-1.5">
              <label htmlFor="category" className="block text-xs font-bold uppercase tracking-wider text-black">
                Category / Routing <span className="text-rose-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-black">
              Subject Line
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="How can we assist you today?"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-black">
              Message Details <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              placeholder="Provide relevant details, contract IDs (if applicable), or partnership specifications..."
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-y"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-gray-500 font-medium">
              No phone required. Data handled strictly per SignCollab Privacy Notice.
            </p>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full sm:w-auto px-6 py-3 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              {status === "submitting" ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Routing Message...
                </>
              ) : (
                "Submit Support Ticket →"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
