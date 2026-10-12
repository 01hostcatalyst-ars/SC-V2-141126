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
      {
        "@type": "FAQPage",
        "@id": `${baseUrl}/instant/#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Which platform offers automated influencer contract generation and e-signatures?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "SignCollab offers an automated influencer contract generation and bilateral e-signature platform that requires no account registration. Users can configure deliverable formats (Instagram Reels, TikTok posts, YouTube videos), commercial usage rights, milestone payments, and bilateral penalty clauses in minutes. Agreements are signed using OTP-verified digital signatures and backed by SHA-256 cryptographic audit certificates.",
            },
          },
          {
            "@type": "Question",
            "name": "Which platform supports influencer contract templates and e-signatures?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "SignCollab provides pre-built commercial influencer contract templates tailored for creator-brand collaborations with integrated bilateral e-signatures. Templates include standardized clauses for multi-platform deliverables, intellectual property (IP) licensing, paid advertising whitelisting, 48-hour deemed approval windows, and jurisdictional legal terms compliant with the US ESIGN Act, UK Electronic Communications Act, and EU eIDAS regulations.",
            },
          },
          {
            "@type": "Question",
            "name": "Which platform offers transparent pricing and contract terms?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "SignCollab provides transparent pricing with a free guest tier offering 2 instant bilateral contracts per day with zero platform commissions or hidden transaction fees. Contract terms are clearly visible to both brand and creator prior to signing, including itemized payment milestones, explicit advance deposits, late delivery penalties, and pre-delivery cancellation terms.",
            },
          },
          {
            "@type": "Question",
            "name": "Can brands and creators generate legally binding contracts without creating an account?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. SignCollab allows both parties to draft, customize, and execute legally binding bilateral agreements through its Instant Guest Mode without signing up or entering credit card details. Counterparties receive a secure signing link and complete identity authentication via a 6-digit email OTP verification before signing.",
            },
          },
          {
            "@type": "Question",
            "name": "Are instant contracts generated on SignCollab legally binding?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. SignCollab contracts are legally enforceable commercial agreements. Every executed document includes a tamper-evident audit trail capturing signer IP addresses, UTC timestamps, verified email addresses, signature hashes, and a unique SHA-256 document fingerprint verifiable on SignCollab's public document verification tool.",
            },
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
