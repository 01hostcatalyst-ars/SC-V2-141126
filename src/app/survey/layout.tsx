import type { Metadata } from "next";
import Script from "next/script";
import { getCompanyConfig } from "@/lib/config";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

export const metadata: Metadata = {
  title: "Creator Legal Protection Survey & Risk Audit — SignCollab",
  description:
    "Evaluate your creator-brand contract risk level, payment protection score, usage rights parameters, and e-signature compliance in under 2 minutes. Free bilateral agreement audit by SignCollab.",
  alternates: {
    canonical: "/survey",
  },
  openGraph: {
    title: "Creator Legal Protection Survey & Audit Calculator | SignCollab",
    description:
      "Assess creator contract risks, payment terms, usage rights, and legal enforceability across 25+ jurisdictions.",
    url: `${baseUrl}/survey`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SignCollab Creator Legal Protection Survey",
    description:
      "Evaluate creator-brand agreement compliance, late-payment protections, and audit trail strength.",
  },
};

export default function SurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const company = getCompanyConfig();

  const surveyJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/survey`,
        "url": `${baseUrl}/survey`,
        "name": "Creator Pricing & Legal Protection Benchmark Index 2027 — SignCollab",
        "description":
          "An interactive market research survey and assessment tool evaluating creator deal pricing, platform rates, commercial usage rights parameters, late payment frequencies, and contract legal protections.",
        "isPartOf": { "@id": `${baseUrl}/#website` },
        "about": { "@id": `${baseUrl}/survey/#dataset` },
        "breadcrumb": { "@id": `${baseUrl}/survey/#breadcrumb` },
        "inLanguage": "en-US",
      },
      {
        "@type": "Dataset",
        "@id": `${baseUrl}/survey/#dataset`,
        "name": "SignCollab Creator Pricing & Contract Legal Protection Benchmark Dataset 2027",
        "description": "Anonymous global market research dataset tracking creator rate benchmarks, usage rights licensing valuations, late payment occurrence frequencies, and contract legal protections across 25+ countries.",
        "creator": { "@id": `${baseUrl}/#organization` },
        "license": "https://creativecommons.org/licenses/by/4.0/",
        "isAccessibleForFree": true,
        "measurementTechnique": "Self-administered anonymous online quantitative market survey & contract pricing assessment calculator",
        "variableMeasured": [
          "Creator Deal Compensation Rate",
          "Social Media Deliverable Unit Price",
          "Commercial Usage Rights Licensing Fee",
          "Late Payment Delay Occurrence Frequency",
          "48-Hour Deemed Approval Protocol Utilization",
          "Bilateral E-Signature Legal Compliance Score"
        ],
        "temporalCoverage": "2026/2027",
        "spatialCoverage": "Global (25+ countries across North America, Europe, MENA, Asia-Pacific)",
        "keywords": [
          "Creator Pricing Index",
          "Influencer Rates Benchmark",
          "Usage Rights Valuation",
          "Brand Partnership Legal Risk Assessment",
          "Late Payment Statistics",
          "Creator Contract Compliance"
        ]
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/survey/#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl,
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Creator Pricing & Legal Risk Index",
            "item": `${baseUrl}/survey`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${baseUrl}/survey/#faqpage`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Why should creators and brands participate in the Creator Pricing & Legal Protection Survey?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The survey collects anonymous benchmark data on creator rates, commercial usage rights licensing, non-payment risks, and missing legal protections to publish the annual SignCollab Creator Pricing Index.",
            },
          },
          {
            "@type": "Question",
            "name": "How does SignCollab address contract vulnerabilities identified in the survey?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "SignCollab auto-generates balanced bilateral contracts featuring OTP email e-signatures, SHA-256 tamper-proof certificates, and 48-hour deemed approval protocols compliant with electronic signature laws in 25+ countries.",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <Script
        id="survey-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(surveyJsonLd) }}
      />
      {children}
    </>
  );
}
