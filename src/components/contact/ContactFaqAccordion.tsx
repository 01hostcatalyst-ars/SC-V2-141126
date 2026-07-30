"use client";

import React, { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
  tag?: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How quickly do you respond to support tickets & emails?",
    answer:
      "Our team reviews all incoming inquiries during our business schedule (Monday – Friday, 9:00 AM – 6:00 PM UTC). We typically respond within 24 hours on business days. Urgent security or contract delivery issues are prioritized.",
    tag: "SLA & Response",
  },
  {
    question: "Can I request a custom product demo or Enterprise plan?",
    answer:
      "Yes. For agencies managing multi-creator campaigns, talent managers, or enterprise brand teams requiring custom legal clause templates, custom branding, or dedicated account managers, email sales@signcollab.com.",
    tag: "Enterprise & Sales",
  },
  {
    question: "How do I report a bug or technical issue with a contract?",
    answer:
      "If you experience any technical difficulty, OTP delivery delay, or PDF rendering anomaly, email support@signcollab.com with your Contract Token ID and device details or submit a support ticket above.",
    tag: "Technical Support",
  },
  {
    question: "Are SignCollab electronic signatures legally recognized worldwide?",
    answer:
      "Yes. SignCollab signatures generate an audit trail with email OTP validation, SHA-256 cryptographic PDF checksums, IP addresses, and timestamps. They are compliant with major international electronic transaction frameworks including US ESIGN & UETA, UK eIDAS, EU eIDAS Regulation (EU) No 910/2014, UAE Federal Decree-Law No. 46 of 2021, and Pakistan ETO 2002.",
    tag: "Legal & Compliance",
  },
  {
    question: "How can I submit new feature requests or feedback?",
    answer:
      "We love creator and brand feedback! Send your feature suggestions, workflow improvement ideas, or integration requests to questions@signcollab.com. Our product team reviews all user input weekly.",
    tag: "Product Roadmap",
  },
];

export function ContactFaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-xl font-black text-black tracking-tight">Frequently Asked Support Questions</h2>
        <p className="text-xs text-gray-500 mt-1 font-medium">
          Quick answers to common inquiries about support SLAs, legal validity, enterprise plans, and feature requests.
        </p>
      </div>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                isOpen ? "border-blue-300 bg-blue-50/30" : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(idx)}
                className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  {item.tag && (
                    <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 uppercase tracking-wider shrink-0">
                      {item.tag}
                    </span>
                  )}
                  <span className="text-xs md:text-sm font-bold text-black leading-snug">
                    {item.question}
                  </span>
                </div>
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 shrink-0">
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-4 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100/60 font-medium">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
