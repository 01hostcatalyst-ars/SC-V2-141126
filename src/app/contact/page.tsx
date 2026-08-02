import React from "react";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { getCompanyConfig } from "@/lib/config";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactFaqAccordion } from "@/components/contact/ContactFaqAccordion";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

export const metadata: Metadata = {
  title: "Contact & Support — SignCollab Global Agreement Platform",
  description:
    "Reach SignCollab support, enterprise sales, legal, and security teams. Serving creators, brands, and agencies across 27 global jurisdictions with prompt 24-hour SLA assistance.",
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
      "Dedicated contact channels for product questions, technical support, enterprise sales, legal notices, and security disclosures.",
  },
};

export default function ContactPage() {
  const company = getCompanyConfig();

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
        "name": company.name || "SignCollab",
        "url": baseUrl,
        "logo": `${baseUrl}/icon.png`,
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
          "27 Jurisdiction Compliance",
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
              "text": "Yes. SignCollab signatures generate audit trails with OTP validation, SHA-256 cryptographic PDF checksums, IP addresses, and timestamps compliant with electronic transaction laws across 27 jurisdictions including the US, UK, EU, UAE, Saudi Arabia, India, Pakistan, Canada, Australia, and Singapore.",
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
      description: "For product inquiries, feature exploration, account assistance, and contract guidance.",
      badge: "General",
      color: "bg-blue-50 border-blue-200 text-blue-900",
    },
    {
      title: "Technical Support",
      email: "support@signcollab.com",
      description: "Technical assistance, OTP email delivery issues, PDF rendering, or contract certificate questions.",
      badge: "Support SLA",
      color: "bg-emerald-50 border-emerald-200 text-emerald-900",
    },
    {
      title: "Sales & Partnerships",
      email: "sales@signcollab.com",
      description: "Enterprise plans, agency retainers, talent manager tools, and custom workflow integrations.",
      badge: "Commercial",
      color: "bg-purple-50 border-purple-200 text-purple-900",
    },
    {
      title: "Security & Vulnerabilities",
      email: "security@signcollab.com",
      description: "Responsible vulnerability disclosures, cryptographic hash audits, and security compliance.",
      badge: "Security Priority",
      color: "bg-rose-50 border-rose-200 text-rose-900",
    },
  ];

  const globalFlags = [
    { country: "United States", code: "US" },
    { country: "United Kingdom", code: "GB" },
    { country: "European Union", code: "EU" },
    { country: "United Arab Emirates", code: "AE" },
    { country: "Saudi Arabia", code: "SA" },
    { country: "Canada", code: "CA" },
    { country: "Australia", code: "AU" },
    { country: "Singapore", code: "SG" },
    { country: "India", code: "IN" },
    { country: "Pakistan", code: "PK" },
    { country: "Brazil", code: "BR" },
    { country: "Mexico", code: "MX" },
  ];

  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-hidden">
      {/* Contact Page JSON-LD */}
      <Script
        id="contact-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />

      {/* Ambient background glow shapes */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full ambient-glow-purple pointer-events-none z-0 opacity-40 blur-3xl" />
      <div className="absolute top-[35%] right-[-10%] w-[600px] h-[600px] rounded-full ambient-glow-blue pointer-events-none z-0 opacity-30 blur-3xl" />

      {/* Navigation Header */}
      <header className="w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-black text-xl tracking-tight text-black uppercase">
              {company.name}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
              Support Portal
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-700">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <Link href="/about" className="hover:text-black transition-colors">
              About Us
            </Link>
            <Link href="/vision" className="hover:text-black transition-colors">
              Vision &amp; Mission
            </Link>
            <Link href="/features" className="hover:text-black transition-colors">
              Features
            </Link>
            <Link href="/knowledge" className="hover:text-black transition-colors">
              Academy
            </Link>
            <Link href="/contact" className="text-black font-bold border-b-2 border-black pb-0.5">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/instant"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-black text-white hover:bg-gray-800 transition-all shadow-sm"
            >
              Create Free Contract
            </Link>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12 z-10 space-y-12">
        {/* HERO SECTION */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/90 text-emerald-950 border border-emerald-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Global Support Portal Active
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
              Mon–Fri 9:00 AM – 6:00 PM (UTC)
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-black leading-tight tracking-tight">
            Get in Touch with <span className="text-accent-gradient">SignCollab</span>
          </h1>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-gray-200/80 shadow-sm">
            We are here to assist creators, brands, and agencies with contract questions, technical support, enterprise partnerships, legal notices, and platform security.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-200 shadow-sm text-xs font-semibold text-gray-800">
            <span>Average Response SLA:</span>
            <span className="font-bold text-blue-900">Within 24 Business Hours</span>
          </div>
        </section>

        {/* DEPARTMENTAL CONTACT CHANNELS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-black uppercase tracking-wider">
              Departmental Contact Channels
            </h2>
            <span className="text-xs text-gray-500 font-medium">Direct Email Routing</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {departments.map((dept, idx) => (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md hover:-translate-y-1 transition-all group"
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
        </section>

        {/* INTERACTIVE CONTACT FORM */}
        <section className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-3xl p-6 md:p-8 shadow-xl">
          <ContactForm />
        </section>

        {/* GLOBAL OPERATIONS & REGIONAL COVERAGE */}
        <section className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-950 uppercase tracking-wider mb-1">
                Global Operations
              </span>
              <h2 className="text-xl font-black text-black tracking-tight">Worldwide Customer Coverage</h2>
            </div>
            <div className="text-left sm:text-right">
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
                SignCollab is a remote-first, cloud-native platform serving creators, brands, and agencies across 27 legal jurisdictions worldwide. Rather than physical mail handling, all support operations, verification checks, and agreement processing are handled securely via our digital infrastructure.
              </p>
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-700 font-semibold space-y-1">
                <p><strong>Founder &amp; Engineering Hub:</strong> Muhammad Arsalan / SignCollab</p>
                <p><strong>Primary Service Area:</strong> 27 Supported Countries Worldwide</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-black">Serving Customers Across Flagship Jurisdictions</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {globalFlags.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2 hover:bg-white hover:shadow-sm transition-all"
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
        </section>

        {/* SECURITY & LEGAL TRUST SAFEGUARDS */}
        <section className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <h2 className="text-xl font-black text-black tracking-tight border-b border-gray-100 pb-4">
            Security &amp; Legal Trust Safeguards
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-1.5">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">Cryptographic Proof</h3>
              <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                Contracts sealed with SHA-256 hashes and tamper-proof PDF audit certificates.
              </p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-1.5">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">27-Jurisdiction E-Sign</h3>
              <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                Compliant with US ESIGN, UK/EU eIDAS, UAE Decree 46/2021, KSA Royal Decree M/18, &amp; PK ETO 2002.
              </p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-1.5">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider">Secure Infrastructure</h3>
              <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                Cloud infrastructure backed by AES-256 data protection and 6-digit email OTP verification.
              </p>
            </div>
          </div>
        </section>

        {/* INTERACTIVE FAQ ACCORDION */}
        <section>
          <ContactFaqAccordion />
        </section>

        {/* SYSTEM OPERATIONAL STATUS */}
        <section className="bg-gradient-to-br from-slate-900 to-black text-white rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                All Core Platform Services Operational
              </span>
            </div>
            <h3 className="text-lg font-bold">Platform Uptime: 99.98%</h3>
            <p className="text-xs text-gray-300 font-medium">
              API Services, OTP Email Delivery, PDF Rendering Engine, and SHA-256 Verification are fully functional.
            </p>
          </div>
          <Link
            href="/verify"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-all shrink-0 shadow-md"
          >
            Verify a Document →
          </Link>
        </section>

        {/* SOCIAL PRESENCE LINKS */}
        <section className="text-center space-y-3 pt-4">
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
                className="px-3.5 py-1.5 bg-white/80 border border-gray-300 hover:border-black rounded-full text-xs font-bold text-gray-800 hover:text-black transition-all shadow-sm"
              >
                {social.name} ↗
              </a>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/80 bg-white/80 backdrop-blur-md py-8 px-6 z-10 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
            <span className="font-bold text-sm tracking-tight text-black uppercase">
              {company.name}
            </span>
            <p className="text-xs text-gray-500 font-medium">
              Bilateral Agreement Proof-Layer &amp; Tamper-Proof Audit Trails
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-gray-600">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <Link href="/about" className="hover:text-black transition-colors">
              About Us
            </Link>
            <Link href="/vision" className="hover:text-black transition-colors">
              Vision &amp; Mission
            </Link>
            <Link href="/knowledge" className="hover:text-black transition-colors">
              Knowledge Base
            </Link>
            <Link href="/survey" className="hover:text-emerald-600 transition-colors text-emerald-700 font-bold">
              Pricing Index Survey
            </Link>
            <Link href="/features" className="hover:text-black transition-colors">
              Features
            </Link>
            <Link href="/verify" className="hover:text-black transition-colors">
              Verify Document
            </Link>
            <Link href="/terms" className="hover:text-black transition-colors">
              Terms &amp; Privacy
            </Link>
            <Link href="/contact" className="text-black font-bold hover:underline">
              Contact &amp; Support
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-gray-100 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2 text-center sm:text-left">
          <span>
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </span>
          <span className="text-gray-400 font-medium">
            {company.supportEmail}
          </span>
        </div>
      </footer>
    </div>
  );
}
