import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { getCompanyConfig } from "@/lib/config";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
});

export async function generateMetadata(): Promise<Metadata> {
  const company = getCompanyConfig();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: `${company.name} | Creator Agreement & e-Signature Proof Layer`,
      template: `%s | ${company.name}`,
    },
    description: `SignCollab is the commercial agreement proof layer for creators, brands, and agencies. Generate bilaterally signed digital contracts, enforce campaign terms, and secure audit trails with global e-signature compliance.`,
    keywords: [
      "SignCollab",
      "Creator Contracts",
      "Brand Agreements",
      "Digital e-Signature",
      "Commercial Contracts",
      "Influencer Contracts",
      "Agency Contracts",
      "Legal Proof Layer",
    ],
    authors: [{ name: company.name, url: baseUrl }],
    creator: company.name,
    publisher: company.name,
    alternates: {
      canonical: "/",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: `${company.name} | Creator Agreement & e-Signature Proof Layer`,
      description: `Formalize creator-brand partnerships and secure bilaterally signed audit trails with global electronic signature compliance. Powered by ${company.name}.`,
      url: baseUrl,
      siteName: company.name,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${company.name} | Creator Agreement & e-Signature Proof Layer`,
      description: `Formalize creator-brand partnerships and secure bilaterally signed audit trails with global electronic signature compliance.`,
    },
    verification: {
      google: "f9xPi8ZQ1212phsmENSO00AMPszNiLzxU_2D4lcnSWk",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const company = getCompanyConfig();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": company.name,
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/favicon.ico`,
          "width": 512,
          "height": 512
        },
        "description": "SignCollab is the commercial agreement proof layer for creators, brands, and agencies. Generate bilaterally signed digital contracts with e-signature compliance across 25+ countries including the US, UK, EU, UAE, Saudi Arabia, Pakistan, India, Canada, Australia, Singapore, and more.",
        "foundingDate": "2026",
        "email": company.supportEmail,
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer support",
          "email": company.supportEmail,
          "availableLanguage": ["English"],
          "areaServed": [
            { "@type": "Country", "name": "United States", "sameAs": "https://en.wikipedia.org/wiki/United_States" },
            { "@type": "Country", "name": "United Kingdom", "sameAs": "https://en.wikipedia.org/wiki/United_Kingdom" },
            { "@type": "Country", "name": "Canada", "sameAs": "https://en.wikipedia.org/wiki/Canada" },
            { "@type": "Country", "name": "Australia", "sameAs": "https://en.wikipedia.org/wiki/Australia" },
            { "@type": "Country", "name": "United Arab Emirates", "sameAs": "https://en.wikipedia.org/wiki/United_Arab_Emirates" },
            { "@type": "Country", "name": "Saudi Arabia", "sameAs": "https://en.wikipedia.org/wiki/Saudi_Arabia" },
            { "@type": "Country", "name": "India", "sameAs": "https://en.wikipedia.org/wiki/India" },
            { "@type": "Country", "name": "Pakistan", "sameAs": "https://en.wikipedia.org/wiki/Pakistan" },
            { "@type": "Country", "name": "Singapore", "sameAs": "https://en.wikipedia.org/wiki/Singapore" },
            { "@type": "Country", "name": "Germany" },
            { "@type": "Country", "name": "France" },
            { "@type": "Country", "name": "Brazil", "sameAs": "https://en.wikipedia.org/wiki/Brazil" },
            { "@type": "Country", "name": "Mexico", "sameAs": "https://en.wikipedia.org/wiki/Mexico" },
            { "@type": "Country", "name": "Colombia" },
            { "@type": "Country", "name": "Indonesia" },
            { "@type": "Country", "name": "Malaysia" },
            { "@type": "Country", "name": "Philippines" },
            { "@type": "Country", "name": "Thailand" },
            { "@type": "Country", "name": "Vietnam" },
            { "@type": "Country", "name": "China" },
            { "@type": "Country", "name": "Nigeria", "sameAs": "https://en.wikipedia.org/wiki/Nigeria" },
            { "@type": "Country", "name": "South Africa" },
            { "@type": "Country", "name": "Kenya" },
            { "@type": "Country", "name": "Egypt" },
            { "@type": "Country", "name": "Qatar" },
            { "@type": "Country", "name": "Oman" },
            { "@type": "Country", "name": "Ghana" },
            { "@type": "Country", "name": "Jamaica" }
          ]
        },
        "areaServed": [
          { "@type": "Country", "name": "United States" },
          { "@type": "Country", "name": "United Kingdom" },
          { "@type": "Country", "name": "Canada" },
          { "@type": "Country", "name": "Australia" },
          { "@type": "Country", "name": "United Arab Emirates" },
          { "@type": "Country", "name": "Saudi Arabia" },
          { "@type": "Country", "name": "India" },
          { "@type": "Country", "name": "Pakistan" },
          { "@type": "Country", "name": "Singapore" },
          { "@type": "AdministrativeArea", "name": "European Union" },
          { "@type": "Country", "name": "Brazil" },
          { "@type": "Country", "name": "Mexico" },
          { "@type": "Country", "name": "Colombia" },
          { "@type": "Country", "name": "Indonesia" },
          { "@type": "Country", "name": "Malaysia" },
          { "@type": "Country", "name": "Philippines" },
          { "@type": "Country", "name": "Thailand" },
          { "@type": "Country", "name": "Vietnam" },
          { "@type": "Country", "name": "China" },
          { "@type": "Country", "name": "Nigeria" },
          { "@type": "Country", "name": "South Africa" },
          { "@type": "Country", "name": "Kenya" },
          { "@type": "Country", "name": "Egypt" },
          { "@type": "Country", "name": "Qatar" },
          { "@type": "Country", "name": "Oman" },
          { "@type": "Country", "name": "Ghana" },
          { "@type": "Country", "name": "Jamaica" }
        ],
        "knowsAbout": [
          "Creator Contracts",
          "Influencer Marketing Agreements",
          "Brand Partnership Contracts",
          "Digital Electronic Signatures",
          "E-Signature Compliance",
          "US ESIGN Act",
          "UK eIDAS Regulation",
          "EU eIDAS Regulation 910/2014",
          "UAE Federal Decree-Law No. 46/2021",
          "Pakistan Electronic Transactions Ordinance 2002",
          "India Information Technology Act 2000",
          "Bilateral Commercial Agreements",
          "Cryptographic Audit Trails",
          "SHA-256 Document Verification",
          "Influencer Campaign Management",
          "Content Creator Legal Protection",
          "Agency-Brand Contract Management"
        ],
        "slogan": "Bilateral Contracts. Secure Evidence."
      },
      {
        "@type": "WebApplication",
        "@id": `${baseUrl}/#webapp`,
        "name": company.name,
        "url": baseUrl,
        "applicationCategory": "BusinessApplication",
        "applicationSubCategory": "Contract Management & E-Signature Platform",
        "operatingSystem": "All (Web-Based)",
        "browserRequirements": "Requires a modern web browser with JavaScript enabled",
        "softwareVersion": "1.0-beta",
        "description": "SignCollab is a free web-based platform for creating bilaterally signed digital contracts between creators, brands, and agencies. Features include instant contract generation without signup, OTP-verified e-signatures, SHA-256 tamper-proof audit trails, and multi-jurisdiction compliance with electronic signature laws in 25+ countries including the US (ESIGN Act), UK (eIDAS), EU (eIDAS 910/2014), UAE, Saudi Arabia, India, Pakistan, and more.",
        "featureList": [
          "Instant 1-page contract creation without registration",
          "Bilateral digital e-signatures with OTP email verification",
          "SHA-256 cryptographic document integrity verification",
          "Tamper-proof audit trail certificates with IP and device logging",
          "Multi-jurisdiction legal compliance (US ESIGN, UK eIDAS, EU eIDAS, UAE Decree-Law 46/2021, Pakistan ETO 2002, India IT Act)",
          "Creator-to-Brand direct deal contracts",
          "Brand-to-Creator sponsorship offer contracts",
          "Agency-to-Creator campaign delegation contracts",
          "Content deliverable specification (Reels, Stories, Posts, YouTube, TikTok)",
          "Commercial usage rights management (Organic, Paid Ads, Print, Broadcast)",
          "Financial milestone tracking with advance deposits",
          "Multi-currency support (USD, GBP, EUR, AED, SAR, PKR, INR, and 15+ currencies)",
          "Bilateral penalty clauses for late payment and late delivery",
          "Deemed approval protocol (48-hour automatic approval)",
          "Product shipment and loan tracking",
          "Contract PDF generation with embedded signatures",
          "Audit certificate PDF with SHA-256 hash verification",
          "Public contract verification via tracking token or file upload",
          "Guest mode with 2 free contracts per day per email",
          "6-step guided contract creation wizard"
        ],
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "Free during beta/early access phase. Create up to 2 instant contracts per day without registration.",
          "availability": "https://schema.org/InStock",
          "priceValidUntil": "2027-12-31"
        },
        "creator": { "@id": `${baseUrl}/#organization` },
        "provider": { "@id": `${baseUrl}/#organization` },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "50",
          "bestRating": "5",
          "worstRating": "1"
        }
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "name": company.name,
        "url": baseUrl,
        "description": "SignCollab — the commercial agreement proof layer and e-signature platform for creators, brands, and agencies worldwide.",
        "publisher": { "@id": `${baseUrl}/#organization` },
        "inLanguage": "en-US",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${baseUrl}/verify?token={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Instant Contract",
            "item": `${baseUrl}/instant`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Features",
            "item": `${baseUrl}/features`
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": "Terms & Privacy",
            "item": `${baseUrl}/terms`
          }
        ]
      }
    ]
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VCL8QWQXBK"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-VCL8QWQXBK');
          `}
        </Script>
        <Script
          id="schema-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-theme-gradient`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

