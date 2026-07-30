import type { Metadata } from "next";
import Script from "next/script";
import { getCompanyConfig } from "@/lib/config";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

export const metadata: Metadata = {
  title: "Instant Contract — Create a Commercial Agreement Without Signup",
  description:
    "Create a bilaterally signed commercial agreement in minutes without creating an account. SignCollab's guest mode lets you generate 2 free instant contracts per day with OTP-verified e-signatures, SHA-256 audit trails, and multi-jurisdiction compliance.",
  alternates: {
    canonical: "/instant",
  },
  openGraph: {
    title: "Instant Contract — No Signup Required | SignCollab",
    description:
      "Generate a complete bilateral commercial contract in minutes. OTP-verified e-signatures, SHA-256 tamper-proof audit trails, and global e-signature compliance across 25+ countries.",
    url: `${baseUrl}/instant`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SignCollab Instant Contract — No Signup Required",
    description:
      "Create bilaterally signed commercial agreements in minutes with OTP verification, SHA-256 audit trails, and multi-jurisdiction compliance.",
  },
};

export default function InstantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const company = getCompanyConfig();

  const instantJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/instant`,
        "url": `${baseUrl}/instant`,
        "name": `Instant Contract — Create a Commercial Agreement Without Signup | ${company.name}`,
        "description":
          "Create a bilaterally signed commercial agreement in minutes without creating an account. Guest mode allows 2 free instant contracts per day with OTP-verified e-signatures and SHA-256 audit trails.",
        "isPartOf": { "@id": `${baseUrl}/#website` },
        "about": { "@id": `${baseUrl}/#webapp` },
        "breadcrumb": { "@id": `${baseUrl}/instant/#breadcrumb` },
        "inLanguage": "en-US",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/instant/#breadcrumb`,
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
            "name": "Instant Contract",
            "item": `${baseUrl}/instant`,
          },
        ],
      },
      {
        "@type": "HowTo",
        "@id": `${baseUrl}/instant/#howto`,
        "name": "How to Create an Instant Bilateral Contract on SignCollab",
        "description":
          "Step-by-step guide to creating a legally compliant bilateral agreement between creators, brands, and agencies — no signup required.",
        "totalTime": "PT10M",
        "tool": [
          {
            "@type": "HowToTool",
            "name": "Web browser (Chrome, Safari, Firefox, or Edge)",
          },
          {
            "@type": "HowToTool",
            "name": "Valid email address for OTP verification",
          },
        ],
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Specify Deliverables",
            "text": "Define the content format (Reel, Story, Post, YouTube Video, TikTok Short), post quantities, and retention deadlines.",
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Set Commercial Usage Rights",
            "text": "Determine where the brand can re-use creator IP (organic reposts, paid ads, print, broadcast) and for how long.",
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Configure Financial Milestones",
            "text": "Input total contract valuation, advance deposit, due dates, and select the payout route (bank IBAN, mobile wallet, or wire transfer).",
          },
          {
            "@type": "HowToStep",
            "position": 4,
            "name": "Set Turnaround and Approval Terms",
            "text": "Configure delivery turnaround, maximum revision rounds, product shipment details, and the 48-hour deemed approval protocol.",
          },
          {
            "@type": "HowToStep",
            "position": 5,
            "name": "Define Bilateral Penalties",
            "text": "Set late payment fees, late delivery penalties, pre-delivery cancellation fees, and the 7-day non-delivery cutoff rule.",
          },
          {
            "@type": "HowToStep",
            "position": 6,
            "name": "Verify Identity via OTP Email",
            "text": "Complete 6-digit email OTP verification to authenticate your identity before the contract is published for counterparty signing.",
          },
        ],
      },
    ],
  };

  return (
    <>
      <Script
        id="instant-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(instantJsonLd) }}
      />
      {children}
    </>
  );
}
