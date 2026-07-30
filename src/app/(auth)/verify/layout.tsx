import type { Metadata } from "next";
import Script from "next/script";
import { getCompanyConfig } from "@/lib/config";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

export const metadata: Metadata = {
  title: "Verify Document Integrity & Audit Certificates — SignCollab",
  description:
    "Verify SHA-256 cryptographic document integrity and validate e-signature audit trail certificates for SignCollab commercial contracts.",
  alternates: {
    canonical: "/verify",
  },
  openGraph: {
    title: "Verify Document Integrity & Audit Certificates | SignCollab",
    description:
      "Public verification endpoint for SHA-256 cryptographic checksums and OTP e-signature audit logs.",
    url: `${baseUrl}/verify`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SignCollab — Document Integrity Verification",
    description: "Verify contract SHA-256 hashes and e-signature audit trails online.",
  },
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const company = getCompanyConfig();

  const verifyJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/verify`,
        "url": `${baseUrl}/verify`,
        "name": "Public Contract & Audit Trail Verifier — SignCollab",
        "description":
          "Public document verification service allowing users to verify SHA-256 cryptographic hashes and inspect OTP e-signature audit trail certificates.",
        "isPartOf": { "@id": `${baseUrl}/#website` },
        "about": { "@id": `${baseUrl}/#webapp` },
        "breadcrumb": { "@id": `${baseUrl}/verify/#breadcrumb` },
        "inLanguage": "en-US",
        "potentialAction": {
          "@type": "SearchAction",
          "name": "Verify Document SHA-256 Integrity",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${baseUrl}/verify?token={tracking_token}`
          },
          "query-input": "required name=tracking_token"
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/verify/#breadcrumb`,
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
            "name": "Verify Document",
            "item": `${baseUrl}/verify`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <Script
        id="verify-page-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(verifyJsonLd) }}
      />
      {children}
    </>
  );
}
