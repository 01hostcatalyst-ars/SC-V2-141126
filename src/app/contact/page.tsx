import React from "react";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { getCompanyConfig } from "@/lib/config";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactFaqAccordion } from "@/components/contact/ContactFaqAccordion";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

export const metadata: Metadata = {
  title: "Contact & Support — SignCollab Global Customer & Legal Portal",
  description:
    "Get support for creator-brand contracts, enterprise sales, legal notices, and security disclosures. SignCollab provides 24-hour response SLAs, global UTC availability, and dedicated support channels.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact & Support — SignCollab Global Agreement Platform",
    description:
      "Reach SignCollab support, enterprise sales, legal, and security teams. Serving creators, brands, and agencies worldwide with prompt 24-hour SLA assistance.",
    url: `${baseUrl}/contact`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SignCollab — Contact & Support Portal",
    description:
      "Dedicated contact channels for product questions, technical support, enterprise sales, legal notices, and vulnerability reports.",
  },
};

export default function ContactPage() {
  const company = getCompanyConfig();

  // Comprehensive JSON-LD Structured Data Schema for Contact, Organization & FAQ
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/contact`,
        "url": `${baseUrl}/contact`,
        "name": "Contact & Support — SignCollab Global Agreement Platform",
        "description":
          "Official contact channels, technical support, sales inquiries, legal notices, and security disclosures for SignCollab.",
        "isPartOf": { "@id": `${baseUrl}/#website` },
        "about": { "@id": `${baseUrl}/#organization` },
        "specialty": "CustomerSupport",
        "lastReviewed": "2026-07-30",
        "inLanguage": "en-US",
      },
      {
        "@type": "ContactPage",
        "@id": `${baseUrl}/contact/#contactpage`,
        "name": "SignCollab Support Portal",
        "url": `${baseUrl}/contact`,
        "mainEntity": { "@id": `${baseUrl}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": "SignCollab",
        "url": baseUrl,
        "logo": `${baseUrl}/favicon.ico`,
        "sameAs": [
          "https://www.linkedin.com/company/signcollab",
          "https://x.com/signcollab",
          "https://github.com/signcollab",
          "https://www.instagram.com/signcollab",
          "https://www.facebook.com/signcollab",
        ],
        "knowsAbout": [
          "Electronic Signatures",
          "Digital Contracts",
          "Creator Economy Agreements",
          "Cryptographic Audit Trails",
          "SHA-256 Document Verification",
        ],
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "email": "questions@signcollab.com",
            "availableLanguage": ["English", "Urdu", "Arabic"],
            "hoursAvailable": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "09:00",
              "closes": "18:00",
              "timeZone": "UTC",
            },
          },
          {
            "@type": "ContactPoint",
            "contactType": "technical support",
            "email": "support@signcollab.com",
            "availableLanguage": "English",
            "hoursAvailable": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "09:00",
              "closes": "18:00",
              "timeZone": "UTC",
            },
          },
          {
            "@type": "ContactPoint",
            "contactType": "sales",
            "email": "sales@signcollab.com",
            "availableLanguage": "English",
          },
          {
            "@type": "ContactPoint",
            "contactType": "security disclosures",
            "email": "security@signcollab.com",
            "availableLanguage": "English",
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${baseUrl}/contact/#faqpage`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How quickly do you respond to support tickets & emails?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our team reviews all incoming inquiries during our business schedule (Monday – Friday, 9:00 AM – 6:00 PM UTC). We typically respond within 24 hours on business days.",
            },
          },
          {
            "@type": "Question",
            "name": "Can I request a custom product demo or Enterprise plan?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. For agencies managing multi-creator campaigns, talent managers, or enterprise brand teams requiring custom legal clause templates or dedicated support, email sales@signcollab.com.",
            },
          },
          {
            "@type": "Question",
            "name": "How do I report a bug or technical issue with a contract?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "If you experience technical difficulties, OTP delays, or PDF anomalies, email support@signcollab.com with your Contract Token ID.",
            },
          },
          {
            "@type": "Question",
            "name": "Are SignCollab electronic signatures legally recognized worldwide?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. SignCollab signatures generate audit trails with OTP validation, SHA-256 cryptographic PDF checksums, IP addresses, and timestamps compliant with US ESIGN, UK eIDAS, EU eIDAS, UAE Law 46/2021, and Pakistan ETO 2002.",
            },
          },
        ],
      },
    ],
  };

  const departments = [
    {
      title: "General Questions",
      email: "questions@signcollab.com",
      description: "For product inquiries, feature exploration, and account assistance.",
      badge: "General",
      color: "bg-blue-50 border-blue-200 text-blue-900",
    },
    {
      title: "Technical Support",
      email: "support@signcollab.com",
      description: "Technical issues, bug reports, OTP delivery, or contract certificate problems.",
      badge: "Support SLA",
      color: "bg-emerald-50 border-emerald-200 text-emerald-900",
    },
    {
      title: "Sales & Partnerships",
      email: "sales@signcollab.com",
      description: "Enterprise plans, agency accounts, multi-brand licensing, and custom features.",
      badge: "Commercial",
      color: "bg-purple-50 border-purple-200 text-purple-900",
    },
    {
      title: "Security & Vulnerabilities",
      email: "security@signcollab.com",
      description: "Responsible disclosure, vulnerability reporting, and security audits.",
      badge: "Security Priority",
      color: "bg-rose-50 border-rose-200 text-rose-900",
    },
  ];

  const globalFlags = [
    { country: "United States", code: "US" },
    { country: "United Kingdom", code: "UK" },
    { country: "Canada", code: "CA" },
    { country: "Australia", code: "AU" },
    { country: "United Arab Emirates", code: "AE" },
    { country: "Saudi Arabia", code: "SA" },
    { country: "Pakistan", code: "PK" },
    { country: "India", code: "IN" },
    { country: "Singapore", code: "SG" },
  ];

  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-hidden text-left">
      {/* Contact Page JSON-LD */}
      <Script
        id="contact-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />

      {/* Background ambient glow shapes */}
      <div className="absolute top-[10%] left-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-purple pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-blue pointer-events-none z-0" />

      {/* Navigation Header */}
      <header className="w-full h-16 border-b border-gray-200/60 bg-white/70 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:flex w-8 h-8 rounded-lg bg-black items-center justify-center font-bold text-white text-base shrink-0">
            {company.name[0]}
          </span>
          <span className="font-bold text-base sm:text-lg text-black tracking-tight uppercase">
            {company.name}
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/features"
            className="hidden sm:inline-block text-xs font-semibold text-gray-700 hover:text-black transition-colors"
          >
            Features
          </Link>
          <Link
            href="/verify"
            className="hidden sm:inline-block text-xs font-semibold text-gray-700 hover:text-black transition-colors"
          >
            Verify
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold px-4 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-black transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12 z-10 space-y-12">
        {/* Hero Section */}
        <div className="space-y-4 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-950 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Global Support Portal Active
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
              UTC Schedule (Mon–Fri)
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-black leading-tight tracking-tight">
            Get in Touch
          </h1>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed max-w-2xl">
            We are here to assist with contract questions, technical support, enterprise partnerships, legal notices, and platform security.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-200 shadow-2xs text-xs font-semibold text-gray-800">
            <span>Average Response SLA:</span>
            <span className="font-bold text-blue-900">Within 24 Business Hours</span>
          </div>
        </div>

        {/* Department Contact Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-black uppercase tracking-wider">
              Departmental Contact Channels
            </h2>
            <span className="text-xs text-gray-500 font-medium">Direct Email Routing</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-gray-300 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${dept.color}`}
                    >
                      {dept.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-black tracking-tight">{dept.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">
                    {dept.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <a
                    href={`mailto:${dept.email}`}
                    className="font-mono text-xs font-bold text-black hover:text-blue-700 underline transition-colors truncate"
                  >
                    {dept.email}
                  </a>
                  <a
                    href={`mailto:${dept.email}`}
                    className="w-7 h-7 rounded-xl bg-gray-100 group-hover:bg-black group-hover:text-white text-gray-700 flex items-center justify-center text-xs font-bold transition-all shrink-0 ml-2"
                    title={`Send email to ${dept.email}`}
                  >
                    ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Contact Form */}
        <ContactForm />

        {/* Global Availability & UTC Business Hours */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-950 uppercase tracking-wider mb-1">
                Global Operations
              </span>
              <h2 className="text-xl font-black text-black tracking-tight">Worldwide Customer Coverage</h2>
            </div>
            <div className="text-right sm:text-right">
              <span className="text-xs font-bold text-black block">Business Operating Hours</span>
              <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 inline-block mt-0.5">
                Monday – Friday | 9:00 AM – 6:00 PM (UTC)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-black">Remote-First Operating Model</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                SignCollab is a remote-first, cloud-native platform serving creators, brands, and agencies across multiple legal jurisdictions worldwide. Rather than physical mail handling, all support operations, verification checks, and agreement processing are handled securely via our digital infrastructure.
              </p>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-[11px] text-gray-700 font-semibold space-y-1">
                <p><strong>Registered Region Context:</strong> Karachi, Pakistan</p>
                <p><strong>Service Area:</strong> Worldwide Digital Platform</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-black">Serving Customers Across Flagship Regions</h3>
              <div className="grid grid-cols-3 gap-2">
                {globalFlags.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2 hover:bg-white hover:shadow-2xs transition-all"
                  >
                    <span className="px-1.5 py-0.5 bg-gray-200 text-gray-800 font-mono text-[10px] font-bold rounded">
                      {item.code}
                    </span>
                    <span className="text-[11px] font-bold text-gray-800 truncate">{item.country}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Platform Trust & Security Safeguards */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-black text-black tracking-tight border-b border-gray-100 pb-4">
            Security &amp; Legal Trust Safeguards
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-1.5">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">Cryptographic Proof</h3>
              <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                Contracts sealed with SHA-256 hashes and tamper-proof PDF verification logs.
              </p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-1.5">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">E-Sign Compliance</h3>
              <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                Built to align with US ESIGN, UK/EU eIDAS, UAE Decree 46/2021, &amp; PK ETO 2002.
              </p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-1.5">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">Secure Infrastructure</h3>
              <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                Cloud infrastructure backed by AES-256 data protection and strict OTP verification.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive FAQ Accordion */}
        <ContactFaqAccordion />

        {/* System Operational Status */}
        <div className="bg-emerald-900 text-white rounded-3xl p-6 md:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                All Core Services Operational
              </span>
            </div>
            <h3 className="text-lg font-bold">Platform Uptime: 99.98%</h3>
            <p className="text-xs text-emerald-200 font-medium">
              API Services, Email OTP Delivery, and PDF Certificate Hash Engine are functioning normally.
            </p>
          </div>
          <Link
            href="/verify"
            className="px-5 py-2.5 bg-white text-emerald-950 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all shrink-0 shadow-xs"
          >
            Verify a Document →
          </Link>
        </div>

        {/* Social Presence Links */}
        <div className="text-center space-y-3 pt-4">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Connect &amp; Follow SignCollab
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { name: "LinkedIn", url: "https://www.linkedin.com/company/signcollab" },
              { name: "X (Twitter)", url: "https://x.com/signcollab" },
              { name: "GitHub", url: "https://github.com/signcollab" },
              { name: "Instagram", url: "https://www.instagram.com/signcollab" },
              { name: "Facebook", url: "https://www.facebook.com/signcollab" },
            ].map((social, idx) => (
              <a
                key={idx}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-white border border-gray-300 hover:border-black rounded-full text-xs font-bold text-gray-800 hover:text-black transition-all shadow-2xs"
              >
                {social.name} ↗
              </a>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/60 bg-white/70 backdrop-blur-md py-6 flex flex-col md:flex-row items-center justify-between px-6 gap-4 z-10">
        <span className="text-xs text-gray-500 font-semibold">
          © {new Date().getFullYear()} {company.name}. All rights reserved.
        </span>
        <div className="flex gap-4 items-center flex-wrap justify-center">
          <Link href="/features" className="text-xs text-gray-600 hover:text-black font-semibold transition-colors">
            Features
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/verify" className="text-xs text-gray-600 hover:text-black font-semibold transition-colors">
            Verify Document
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/terms" className="text-xs text-gray-600 hover:text-black font-semibold transition-colors">
            Terms &amp; Privacy
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/contact" className="text-xs text-black font-bold hover:underline">
            Contact &amp; Support
          </Link>
        </div>
      </footer>
    </div>
  );
}
