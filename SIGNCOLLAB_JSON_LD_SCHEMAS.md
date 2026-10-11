# SignCollab JSON-LD Schema Architecture & Complete Implementation Catalog

This document provides a comprehensive, untruncated record of all Schema.org JSON-LD structured data implementations currently active across the SignCollab application codebase. Every schema block is documented in its complete, unabridged format.

---

## Table of Contents

1. [SignCollab Organization Schema Architecture](#1-signcollab-organization-schema-architecture)
2. [Global Root Graph — layout.tsx](#2-global-root-graph--layouttsx)
3. [About Page — about/page.tsx](#3-about-page--aboutpagetsx)
4. [Features & Architecture Page — features/page.tsx](#4-features--architecture-page--featurespagetsx)
5. [Pricing Page — pricing/page.tsx](#5-pricing-page--pricingpagetsx)
6. [Influencer Rate Calculator — influencer-rate-calculator/page.tsx](#6-influencer-rate-calculator--influencer-rate-calculatorpagetsx)
7. [SignCollab Academy Index — knowledge/page.tsx](#7-signcollab-academy-index--knowledgepagetsx)
8. [SignCollab Academy Article — knowledge/[slug]/page.tsx](#8-signcollab-academy-article--knowledgeslugpagetsx)
9. [Creator Profile Page — creators/[slug]/page.tsx](#9-creator-profile-page--creatorsslugpagetsx)
10. [Contact & Support Portal — contact/page.tsx](#10-contact--support-portal--contactpagetsx)
11. [Terms of Service & Privacy Policy — terms/page.tsx](#11-terms-of-service--privacy-policy--termspagetsx)
12. [Vision & Mission — vision/page.tsx](#12-vision--mission--visionpagetsx)
13. [Instant Contract Creator — instant/layout.tsx](#13-instant-contract-creator--instantlayouttsx)
14. [Creator Pricing & Legal Risk Benchmark — survey/layout.tsx](#14-creator-pricing--legal-risk-benchmark--surveylayouttsx)
15. [Public Document Verifier — (auth)/verify/layout.tsx](#15-public-document-verifier--authverifylayouttsx)
16. [Creators Directory Analysis & Recommendations — creators/page.tsx](#16-creators-directory-analysis--recommendations--creatorspagetsx)

---

## 1. SignCollab Organization Schema Architecture

SignCollab is modeled as the primary legal and operating entity using the canonical URI `@id: "https://www.signcollab.com/#organization"`.

### Key Entity Attributes
- **Canonical ID**: `https://www.signcollab.com/#organization`
- **Name**: `SignCollab`
- **URL**: `https://www.signcollab.com`
- **Logo**: `https://www.signcollab.com/favicon.ico` (or `icon.png`)
- **Founding Date**: `2026` (with company origin dating from 2024 in founder biographical entries)
- **Support Email**: `support@signcollab.com`
- **Slogan**: `Bilateral Contracts. Secure Evidence.`
- **Founder**: `Muhammad Arsalan` (`https://www.signcollab.com/#author-arsalan`)
- **Official SameAs Social Channels**:
  - `https://www.facebook.com/signcollab`
  - `https://www.instagram.com/signcollab/`
  - `https://www.linkedin.com/company/signcollab/`
  - `https://x.com/signcollab`
  - `https://www.reddit.com/r/SignCollab/`
  - `https://github.com/signcollab`
- **Multi-Jurisdiction Service Scope (28 Countries)**:
  - United States, United Kingdom, Canada, Australia, United Arab Emirates, Saudi Arabia, India, Pakistan, Singapore, Germany, France, Brazil, Mexico, Colombia, Indonesia, Malaysia, Philippines, Thailand, Vietnam, China, Nigeria, South Africa, Kenya, Egypt, Qatar, Oman, Ghana, Jamaica.
- **Topical Entity Authority (`knowsAbout`)**:
  - Creator Contracts, Influencer Marketing Agreements, Brand Partnership Contracts, Digital Electronic Signatures, E-Signature Compliance, US ESIGN Act, UK eIDAS Regulation, EU eIDAS Regulation 910/2014, UAE Federal Decree-Law No. 46/2021, Pakistan Electronic Transactions Ordinance 2002, India Information Technology Act 2000, Bilateral Commercial Agreements, Cryptographic Audit Trails, SHA-256 Document Verification, Influencer Campaign Management, Content Creator Legal Protection, Agency-Brand Contract Management.

Every child page connects to this entity by referencing `@id: "https://www.signcollab.com/#organization"` via `publisher`, `provider`, `creator`, `about`, or `mainEntity`.

---

## 2. Global Root Graph — layout.tsx

Source file: [src/app/layout.tsx](file:///d:/BrandBridge%20v1/src/app/layout.tsx#L124-L271)

Injected globally into the `<head>` of every page via `id="schema-jsonld"`. Defines the root `Organization`, the core `WebApplication`, the global `WebSite`, and the top-level `BreadcrumbList`.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.signcollab.com/#organization",
      "name": "SignCollab",
      "url": "https://www.signcollab.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.signcollab.com/favicon.ico",
        "width": 512,
        "height": 512
      },
      "description": "SignCollab is the commercial agreement proof layer for creators, brands, and agencies. Generate bilaterally signed digital contracts with e-signature compliance across 25+ countries including the US, UK, EU, UAE, Saudi Arabia, Pakistan, India, Canada, Australia, Singapore, and more.",
      "foundingDate": "2026",
      "email": "support@signcollab.com",
      "sameAs": [
        "https://www.facebook.com/signcollab",
        "https://www.instagram.com/signcollab/",
        "https://www.linkedin.com/company/signcollab/",
        "https://x.com/signcollab",
        "https://www.reddit.com/r/SignCollab/"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "support@signcollab.com",
        "availableLanguage": ["English"]
      },
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
        { "@type": "Country", "name": "Germany", "sameAs": "https://en.wikipedia.org/wiki/Germany" },
        { "@type": "Country", "name": "France", "sameAs": "https://en.wikipedia.org/wiki/France" },
        { "@type": "Country", "name": "Brazil", "sameAs": "https://en.wikipedia.org/wiki/Brazil" },
        { "@type": "Country", "name": "Mexico", "sameAs": "https://en.wikipedia.org/wiki/Mexico" },
        { "@type": "Country", "name": "Colombia", "sameAs": "https://en.wikipedia.org/wiki/Colombia" },
        { "@type": "Country", "name": "Indonesia", "sameAs": "https://en.wikipedia.org/wiki/Indonesia" },
        { "@type": "Country", "name": "Malaysia", "sameAs": "https://en.wikipedia.org/wiki/Malaysia" },
        { "@type": "Country", "name": "Philippines", "sameAs": "https://en.wikipedia.org/wiki/Philippines" },
        { "@type": "Country", "name": "Thailand", "sameAs": "https://en.wikipedia.org/wiki/Thailand" },
        { "@type": "Country", "name": "Vietnam", "sameAs": "https://en.wikipedia.org/wiki/Vietnam" },
        { "@type": "Country", "name": "China", "sameAs": "https://en.wikipedia.org/wiki/China" },
        { "@type": "Country", "name": "Nigeria", "sameAs": "https://en.wikipedia.org/wiki/Nigeria" },
        { "@type": "Country", "name": "South Africa", "sameAs": "https://en.wikipedia.org/wiki/South_Africa" },
        { "@type": "Country", "name": "Kenya", "sameAs": "https://en.wikipedia.org/wiki/Kenya" },
        { "@type": "Egypt", "name": "Egypt", "sameAs": "https://en.wikipedia.org/wiki/Egypt" },
        { "@type": "Country", "name": "Qatar", "sameAs": "https://en.wikipedia.org/wiki/Qatar" },
        { "@type": "Country", "name": "Oman", "sameAs": "https://en.wikipedia.org/wiki/Oman" },
        { "@type": "Country", "name": "Ghana", "sameAs": "https://en.wikipedia.org/wiki/Ghana" },
        { "@type": "Country", "name": "Jamaica", "sameAs": "https://en.wikipedia.org/wiki/Jamaica" }
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
      "@id": "https://www.signcollab.com/#webapp",
      "name": "SignCollab",
      "url": "https://www.signcollab.com",
      "applicationCategory": "BusinessApplication",
      "applicationSubCategory": "Contract Management & E-Signature Platform",
      "operatingSystem": "All (Web-Based)",
      "browserRequirements": "Requires a modern web browser with JavaScript enabled",
      "softwareVersion": "1.0",
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
        "description": "Free during early access phase. Create up to 2 instant contracts per day without registration.",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2027-12-31"
      },
      "creator": { "@id": "https://www.signcollab.com/#organization" },
      "provider": { "@id": "https://www.signcollab.com/#organization" }
    },
    {
      "@type": "WebSite",
      "@id": "https://www.signcollab.com/#website",
      "name": "SignCollab",
      "url": "https://www.signcollab.com",
      "description": "SignCollab — the commercial agreement proof layer and e-signature platform for creators, brands, and agencies worldwide.",
      "publisher": { "@id": "https://www.signcollab.com/#organization" },
      "inLanguage": "en-US"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.signcollab.com/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.signcollab.com"
        }
      ]
    }
  ]
}
```

---

## 3. About Page — about/page.tsx

Source file: [src/app/about/page.tsx](file:///d:/BrandBridge%20v1/src/app/about/page.tsx#L46-L83)

Defines the `AboutPage` entity, connecting the organization with its founder `Muhammad Arsalan`.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.signcollab.com/about",
      "name": "About SignCollab",
      "description": "SignCollab is a collaboration agreement platform built for brands, agencies, and creators.",
      "url": "https://www.signcollab.com/about",
      "isPartOf": { "@id": "https://www.signcollab.com/#website" },
      "about": { "@id": "https://www.signcollab.com/#organization" },
      "breadcrumb": { "@id": "https://www.signcollab.com/#breadcrumb" },
      "inLanguage": "en-US"
    },
    {
      "@type": "AboutPage",
      "@id": "https://www.signcollab.com/about/#aboutpage",
      "name": "About SignCollab & Founder Muhammad Arsalan",
      "mainEntity": {
        "@type": "Organization",
        "name": "SignCollab",
        "url": "https://www.signcollab.com",
        "logo": "https://www.signcollab.com/icon.png",
        "foundingDate": "2024",
        "founder": {
          "@type": "Person",
          "name": "Muhammad Arsalan",
          "jobTitle": "Founder & CEO",
          "url": "https://www.linkedin.com/in/arsalananis/",
          "sameAs": ["https://www.linkedin.com/in/arsalananis/"],
          "image": "https://www.signcollab.com/founder.jpeg",
          "description": "Technology entrepreneur, SaaS builder, and marketing strategist with over 10 years of experience in software development, digital marketing, eCommerce, and business automation."
        }
      }
    }
  ]
}
```

---

## 4. Features & Architecture Page — features/page.tsx

Source file: [src/app/features/page.tsx](file:///d:/BrandBridge%20v1/src/app/features/page.tsx#L36-L144)

Includes the `WebPage`, complete `FAQPage` (5 comprehensive legal questions), and a detailed `HowTo` schema covering the 6-step contract wizard.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.signcollab.com/features",
      "name": "SignCollab Features & Architecture",
      "description": "Detailed breakdown of SignCollab's contract wizard, bilateral e-signature engine, SHA-256 audit certificate generation, document verification, and 27-jurisdiction legal compliance framework.",
      "url": "https://www.signcollab.com/features",
      "isPartOf": { "@id": "https://www.signcollab.com/#website" },
      "about": { "@id": "https://www.signcollab.com/#organization" },
      "breadcrumb": { "@id": "https://www.signcollab.com/#breadcrumb" },
      "inLanguage": "en-US"
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.signcollab.com/features/#faqpage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does SignCollab's 6-step contract wizard work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "SignCollab guides users through 6 structured steps: (1) Deliverables & Tagging, (2) Usage Rights & Licensing, (3) Financial & Payment Terms, (4) Delivery, Revisions & Product Provisions, (5) Safeguards, Penalties & Exclusivity, and (6) Workflow & Identity Verification. It turns informal conversations into binding, legally sound digital contracts."
          }
        },
        {
          "@type": "Question",
          "name": "How many legal jurisdictions does SignCollab support?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "SignCollab supports 27 global jurisdictions: United States (US ESIGN & UETA), United Kingdom (UK eIDAS), European Union (EU eIDAS Reg 910/2014 & eIDAS 2.0), UAE (Decree-Law 46/2021), Saudi Arabia (Royal Decree M/18), Canada (UECA & PIPEDA), Australia (ETA 1999), Singapore (ETA 2010), India (IT Act 2000 & Section 63 BSA 2023), Pakistan (ETO 2002), Brazil (MP 2.200-2 & Law 14.063), Mexico (Commerce Code), Colombia (Law 527/1999), Indonesia (ITE Law), Malaysia (ECA 2006), Philippines (RA 8792), Thailand (ETA B.E. 2544), Vietnam (ET Law 2023), China (PRC E-Signature Law), Nigeria (Evidence Act 2011), South Africa (ECTA 2002), Kenya (KICA 2020), Egypt (Law 15/2004), Qatar (Law 16/2010), Oman (RD 69/2008), Ghana (Act 772), and Jamaica (ET Act 2006)."
          }
        },
        {
          "@type": "Question",
          "name": "How does local browser document verification work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "SignCollab's verification engine processes contract PDFs locally inside your browser to compute their SHA-256 hash fingerprint before contacting servers. If even a single character or comma is altered, the SHA-256 hash changes completely, flagging the document as tampered."
          }
        },
        {
          "@type": "Question",
          "name": "What is Guest Mode in SignCollab?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Guest Mode lets users generate up to 2 free, fully signed instant contracts per 24 hours per email address without creating an account or paying upfront fees."
          }
        },
        {
          "@type": "Question",
          "name": "What information is included in the SHA-256 audit trail certificate?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The audit certificate includes the master contract SHA-256 hash checksum, verified signatory email addresses, phone numbers, job titles, exact UTC timestamps, IP addresses, browser user-agent signatures, OTP verification logs, and governing legal jurisdiction notices."
          }
        }
      ]
    },
    {
      "@type": "HowTo",
      "@id": "https://www.signcollab.com/features/#howto",
      "name": "How to Create a Bilateral Creator-Brand Contract on SignCollab",
      "description": "A step-by-step guide to generating a legally compliant bilateral contract using SignCollab's 6-step guided wizard.",
      "totalTime": "PT5M",
      "step": [
        {
          "@type": "HowToStep",
          "position": 1,
          "name": "Specify Deliverables & Tagging",
          "text": "Define content formats (Reels, TikToks, Shorts, YouTube, Carousels), post counts, tagging instructions (#ad #collab), and promo code rules."
        },
        {
          "@type": "HowToStep",
          "position": 2,
          "name": "Set Commercial Usage Rights",
          "text": "Configure usage scope (Organic Social, Paid Ads, Print & Billboard, Broadcast Media), platform permissions, and licensing duration."
        },
        {
          "@type": "HowToStep",
          "position": 3,
          "name": "Configure Financials & Payouts",
          "text": "Select currency, statutory tax treatment, advance deposit terms, milestone payment dates, and payout routes (Bank IBAN, Local Mobile Wallet, Wire)."
        },
        {
          "@type": "HowToStep",
          "position": 4,
          "name": "Define Delivery & Product Provisions",
          "text": "Set delivery turnaround days, revision caps, product shipment details, return policies, and the 48-hour deemed approval rule."
        },
        {
          "@type": "HowToStep",
          "position": 5,
          "name": "Establish Safeguards & Penalties",
          "text": "Configure late payment penalties, late content delivery fees, non-delivery cutoff rules, category exclusivity terms, and confidentiality embargoes."
        },
        {
          "@type": "HowToStep",
          "position": 6,
          "name": "Verify Identity & Execute",
          "text": "Select workflow relationship, complete email OTP authentication, and generate a secure counterparty signing link."
        }
      ]
    }
  ]
}
```

---

## 5. Pricing Page — pricing/page.tsx

Source file: [src/app/pricing/page.tsx](file:///d:/BrandBridge%20v1/src/app/pricing/page.tsx#L37-L146)

Contains `WebPage`, `BreadcrumbList`, an `OfferCatalog` representing the 5 tiers (Starter, Professional, Business, Team, Enterprise), and `FAQPage`.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.signcollab.com/pricing",
      "url": "https://www.signcollab.com/pricing",
      "name": "Pricing Plans — SignCollab",
      "description": "Simple, transparent pricing plans for creators, brands, and agencies.",
      "isPartOf": { "@id": "https://www.signcollab.com/#website" },
      "about": { "@id": "https://www.signcollab.com/#organization" },
      "inLanguage": "en-US"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.signcollab.com/pricing/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.signcollab.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Pricing",
          "item": "https://www.signcollab.com/pricing"
        }
      ]
    },
    {
      "@type": "OfferCatalog",
      "@id": "https://www.signcollab.com/pricing/#offercatalog",
      "name": "SignCollab Creator Contract Subscriptions",
      "itemListElement": [
        {
          "@type": "Offer",
          "name": "Starter Plan",
          "price": "0",
          "priceCurrency": "USD",
          "description": "Up to 2 instant agreements per day. No credit card required.",
          "url": "https://www.signcollab.com/pricing"
        },
        {
          "@type": "Offer",
          "name": "Professional Plan",
          "price": "9.50",
          "priceCurrency": "USD",
          "description": "Includes up to 250 agreements/month. 50% OFF first 3 months (regular $19/mo).",
          "url": "https://www.signcollab.com/pricing"
        },
        {
          "@type": "Offer",
          "name": "Business Plan",
          "price": "19.50",
          "priceCurrency": "USD",
          "description": "Includes up to 1,000 agreements/month. 50% OFF first 3 months (regular $39/mo).",
          "url": "https://www.signcollab.com/pricing"
        },
        {
          "@type": "Offer",
          "name": "Team Plan",
          "price": "39.50",
          "priceCurrency": "USD",
          "description": "Includes up to 2,500 agreements/month and 5 team member seats. 50% OFF first 3 months (regular $79/mo).",
          "url": "https://www.signcollab.com/pricing"
        },
        {
          "@type": "Offer",
          "name": "Enterprise Plan",
          "price": "Contact Sales",
          "priceCurrency": "USD",
          "description": "Unlimited team members, custom volume, and white-label PDF branding.",
          "url": "https://www.signcollab.com/contact"
        }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.signcollab.com/pricing/#faqpage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does the 50% Launch Offer work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "All paid monthly plans receive 50% off for your first 3 months. No coupon code is required; the discount is automatically applied at checkout."
          }
        },
        {
          "@type": "Question",
          "name": "What happens after I reach my monthly limit?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can upgrade your plan anytime to immediately increase your agreement capacity, or wait until your monthly quota resets at the start of your next billing cycle."
          }
        },
        {
          "@type": "Question",
          "name": "Can I change or cancel my plan anytime?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. You can upgrade, downgrade, or cancel your subscription whenever your business needs change."
          }
        }
      ]
    }
  ]
}
```

---

## 6. Influencer Rate Calculator — influencer-rate-calculator/page.tsx

Source file: [src/app/influencer-rate-calculator/page.tsx](file:///d:/BrandBridge%20v1/src/app/influencer-rate-calculator/page.tsx#L42-L170)

Includes `WebPage`, `WebApplication` (SignCollab Influencer Rate Radar), `FAQPage` (6 technical questions detailing the 16-Knot valuation matrix), `BreadcrumbList`, and `Organization`.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.signcollab.com/influencer-rate-calculator",
      "url": "https://www.signcollab.com/influencer-rate-calculator",
      "name": "Influencer Rate Calculator & AI Creator Valuation Radar — SignCollab",
      "description": "Calculate data-informed sponsorship rates, creator intelligence, audience insights, content analysis, and cross-platform campaign pricing across Instagram, TikTok, and YouTube.",
      "inLanguage": "en-US",
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://www.signcollab.com/#website",
        "name": "SignCollab",
        "url": "https://www.signcollab.com"
      },
      "breadcrumb": {
        "@id": "https://www.signcollab.com/influencer-rate-calculator#breadcrumbs"
      },
      "mainEntity": {
        "@id": "https://www.signcollab.com/influencer-rate-calculator#webapp"
      },
      "publisher": {
        "@id": "https://www.signcollab.com/#organization"
      }
    },
    {
      "@type": "WebApplication",
      "@id": "https://www.signcollab.com/influencer-rate-calculator#webapp",
      "name": "SignCollab Influencer Rate Radar",
      "url": "https://www.signcollab.com/influencer-rate-calculator",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Cross-platform profile scanning (Instagram, YouTube, TikTok)",
        "16-knot empirical cubic Bézier rate valuation",
        "19-point AI creator intelligence dossier",
        "17-region purchasing power parity (PPP) calibration",
        "Omnichannel multi-platform bundle discounting",
        "1-click legal contract export"
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.signcollab.com/influencer-rate-calculator#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is the SignCollab Influencer Rate Calculator & Creator Intelligence Engine?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The SignCollab Influencer Rate Calculator is an AI-powered creator valuation system that analyzes creator footprints across Instagram, YouTube, and TikTok to provide methodology-based sponsorship rate ranges, itemized deliverable pricing, and strategic creator intelligence dossiers."
          }
        },
        {
          "@type": "Question",
          "name": "How does the SignCollab 16-Knot Quantitative Valuation Matrix calculate creator rates?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The SignCollab 16-Knot Quantitative Valuation Matrix calculates creator sponsorship rates across four empirical layers: Audience Dynamics & Liquidity (scale curves, cross-channel reach consolidation, regional PPP, demographic skew), Interaction Velocity & Retention Physics (trimmed-median views, organic engagement, format decay curves, retention pacing), Commercial Capital Intensity & Equity (industry vertical multipliers, micro-niche authority, buyer purchasing intent, production caliber), and Transaction Governance & Rights (whitelisting surcharges, digital asset buyouts, exclusivity protections, and multi-asset bundle discounts)."
          }
        },
        {
          "@type": "Question",
          "name": "How does automatic cross-platform creator discovery work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "When you enter a single creator handle or profile link from Instagram, YouTube, or TikTok, the engine scans public profile footprints and bio links to automatically discover and connect the creator's secondary channels into a unified report."
          }
        },
        {
          "@type": "Question",
          "name": "What deliverable formats and rates are calculated?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The calculator produces estimated market rate ranges for Instagram Reels, Feed Carousels, Static Posts, and Story Sets; YouTube Dedicated Videos, 60s Integrated Sponsorships, and Shorts; TikTok Videos; and multi-platform campaign packages."
          }
        },
        {
          "@type": "Question",
          "name": "What is included in the 19-point Creator Intelligence Dossier?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The dossier provides an AI-synthesized analysis structured around four key pillars: Audience Demographics & Purchasing Intent, Content DNA & Production Standards, Brand Fit & Sponsorship Safety, and Strategic Strengths with partnership recommendations."
          }
        },
        {
          "@type": "Question",
          "name": "Does the calculator support international currencies and regional pricing?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. The calculator applies regional economic purchasing-power adjustments across 17 regional markets, showing estimated pricing in local currencies (including PKR, USD, GBP, EUR, INR, AED, SAR, CAD, AUD) alongside USD conversions."
          }
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.signcollab.com/influencer-rate-calculator#breadcrumbs",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.signcollab.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Influencer Rate Calculator",
          "item": "https://www.signcollab.com/influencer-rate-calculator"
        }
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://www.signcollab.com/#organization",
      "name": "SignCollab",
      "url": "https://www.signcollab.com",
      "logo": "https://www.signcollab.com/icon.png"
    }
  ]
}
```

---

## 7. SignCollab Academy Index — knowledge/page.tsx

Source file: [src/app/knowledge/page.tsx](file:///d:/BrandBridge%20v1/src/app/knowledge/page.tsx#L38-L86)

Represents the educational hub via `CollectionPage`, `BreadcrumbList`, and `ItemList` dynamically generating items for up to 30 articles.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://www.signcollab.com/knowledge",
      "url": "https://www.signcollab.com/knowledge",
      "name": "SignCollab Academy — Master Content Architecture & Legal Knowledge",
      "description": "The definitive operational, business, and legal authority for brand-creator partnerships. Guided learning pathways, e-signature compliance, usage rights calculators, and agreement templates.",
      "isPartOf": { "@id": "https://www.signcollab.com/#website" },
      "about": { "@id": "https://www.signcollab.com/#organization" },
      "breadcrumb": { "@id": "https://www.signcollab.com/knowledge/#breadcrumb" },
      "inLanguage": "en-US"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.signcollab.com/knowledge/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.signcollab.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "SignCollab Academy",
          "item": "https://www.signcollab.com/knowledge"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://www.signcollab.com/knowledge/#itemlist",
      "name": "SignCollab Academy Knowledge Articles",
      "numberOfItems": 30,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "url": "https://www.signcollab.com/knowledge/article-slug-example",
          "name": "Sample Article Title",
          "description": "Sample article excerpt description..."
        }
      ]
    }
  ]
}
```

---

## 8. SignCollab Academy Article — knowledge/[slug]/page.tsx

Source file: [src/app/knowledge/[slug]/page.tsx](file:///d:/BrandBridge%20v1/src/app/knowledge/%5Bslug%5D/page.tsx#L101-L263)

Includes high-authority E-E-A-T Person metadata, dynamic Article/TechArticle typing, Topical Entity Graph (`about`, `mentions`), statutory legislation citations, Speakable specification, and FAQPage.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://www.signcollab.com/#author-arsalan",
      "name": "Muhammad Arsalan",
      "jobTitle": "Founder & Product Lead",
      "worksFor": { "@id": "https://www.signcollab.com/#organization" },
      "knowsAbout": [
        "Digital E-Signatures",
        "Creator & Influencer Commercial Contracts",
        "US ESIGN Act & UETA Compliance",
        "EU & UK eIDAS Regulations",
        "Commercial Usage Rights & IP Licensing",
        "Cryptographic SHA-256 Audit Trails"
      ],
      "sameAs": [
        "https://www.linkedin.com/in/muhammadarsalanofficial/",
        "https://x.com/ArsalanSignCol"
      ],
      "url": "https://www.signcollab.com"
    },
    {
      "@type": "WebPage",
      "@id": "https://www.signcollab.com/knowledge/sample-slug",
      "url": "https://www.signcollab.com/knowledge/sample-slug",
      "name": "Sample Article Title",
      "description": "Sample article excerpt description",
      "isPartOf": { "@id": "https://www.signcollab.com/#website" },
      "breadcrumb": { "@id": "https://www.signcollab.com/knowledge/sample-slug/#breadcrumb" },
      "inLanguage": "en-US"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.signcollab.com/knowledge/sample-slug/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.signcollab.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Academy",
          "item": "https://www.signcollab.com/knowledge"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Sample Article Title",
          "item": "https://www.signcollab.com/knowledge/sample-slug"
        }
      ]
    },
    {
      "@type": ["Article", "TechArticle"],
      "@id": "https://www.signcollab.com/knowledge/sample-slug/#article",
      "headline": "Sample Article Title",
      "description": "Sample article excerpt description",
      "mainEntityOfPage": { "@id": "https://www.signcollab.com/knowledge/sample-slug" },
      "datePublished": "2026-01-01T00:00:00.000Z",
      "dateModified": "2026-03-01T00:00:00.000Z",
      "author": { "@id": "https://www.signcollab.com/#author-arsalan" },
      "publisher": { "@id": "https://www.signcollab.com/#organization" },
      "about": [
        { "@id": "https://www.signcollab.com/#webapp" },
        {
          "@type": "DefinedTerm",
          "name": "Creator Contracts",
          "inDefinedTermSet": "https://www.signcollab.com/knowledge"
        },
        {
          "@type": "Thing",
          "name": "Content Creator Legal Protection"
        }
      ],
      "mentions": [
        { "@type": "Thing", "name": "Creator Commercial Contracts" },
        { "@type": "Thing", "name": "Usage Rights & IP Licensing" },
        { "@type": "Thing", "name": "Bilateral E-Signature Compliance" },
        { "@type": "Thing", "name": "Deemed Approval Protocol" },
        { "@type": "Thing", "name": "SHA-256 Audit Trail Verification" }
      ],
      "citation": [
        {
          "@type": "Legislation",
          "name": "US Electronic Signatures in Global and National Commerce Act (15 U.S.C. § 7001)",
          "url": "https://www.ftc.gov/legal-library/browse/statutes/electronic-signatures-global-national-commerce-act"
        },
        {
          "@type": "Legislation",
          "name": "EU eIDAS Regulation (EU) No 910/2014 & eIDAS 2.0 (EU 2024/1183)",
          "url": "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32014R0910"
        },
        {
          "@type": "Legislation",
          "name": "UK Electronic Communications Act 2000 & UK eIDAS",
          "url": "https://www.legislation.gov.uk/ukpga/2000/7/contents"
        },
        {
          "@type": "Legislation",
          "name": "UAE Federal Decree-Law No. 46 of 2021 on Electronic Transactions & Trust Services",
          "url": "https://elaws.gov.ae/"
        },
        {
          "@type": "Legislation",
          "name": "Saudi Arabia Electronic Transactions Law (Royal Decree No. M/18)",
          "url": "https://mcit.gov.sa/"
        },
        {
          "@type": "Legislation",
          "name": "India Information Technology Act 2000 & Bharatiya Sakshya Adhiniyam 2023 Section 63",
          "url": "https://www.meity.gov.in/content/information-technology-act-2000"
        },
        {
          "@type": "Legislation",
          "name": "Pakistan Electronic Transactions Ordinance (ETO) 2002",
          "url": "https://pakistanlawsite.com/"
        }
      ],
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["h1", ".academy-article-header", "article p"]
      },
      "image": {
        "@type": "ImageObject",
        "url": "https://www.signcollab.com/favicon.ico",
        "width": 512,
        "height": 512
      },
      "inLanguage": "en-US"
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.signcollab.com/knowledge/sample-slug/#faqpage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is the primary legal standard?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The statutory framework requires bilateral consent and tamper-evident audit trails."
          }
        }
      ]
    }
  ]
}
```

---

## 9. Creator Profile Page — creators/[slug]/page.tsx

Source file: [src/app/creators/[slug]/page.tsx](file:///d:/BrandBridge%20v1/src/app/creators/%5Bslug%5D/page.tsx#L198-L224)

Models each individual creator as a verified `Person` with combined follow counts (`InteractionCounter`) and rate card pricing bounds (`AggregateOffer`).

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Creator Display Name",
  "alternateName": "Creator Brand Name",
  "url": "https://signcollab.com/creators/creator-slug",
  "image": "https://images.unsplash.com/... or creator avatar",
  "jobTitle": "Tech Reviewer & Content Creator",
  "description": "High-impact tech reviews, unboxings, and consumer electronics breakdowns.",
  "interactionStatistic": [
    {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/FollowAction",
      "userInteractionCount": 1500000
    }
  ],
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "lowPrice": 450,
    "highPrice": 3200,
    "offerCount": "6",
    "name": "SignCollab 16-Knot Empirical Rate Card"
  },
  "dateModified": "2026-10-09T04:30:00.000Z"
}
```

---

## 10. Contact & Support Portal — contact/page.tsx

Source file: [src/app/contact/page.tsx](file:///d:/BrandBridge%20v1/src/app/contact/page.tsx#L38-L154)

Features a specialized `ContactPage`, dedicated `Organization` with 4 operational `ContactPoint` channels (Customer Support with business hours, Tech Support, Sales, Security Disclosures), and `FAQPage`.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.signcollab.com/contact",
      "url": "https://www.signcollab.com/contact",
      "name": "Contact & Support — SignCollab Global Agreement Platform",
      "description": "Official contact channels, technical support, sales inquiries, legal notices, and security disclosures for SignCollab.",
      "isPartOf": { "@id": "https://www.signcollab.com/#website" },
      "about": { "@id": "https://www.signcollab.com/#organization" },
      "specialty": "CustomerSupport",
      "inLanguage": "en-US"
    },
    {
      "@type": "ContactPage",
      "@id": "https://www.signcollab.com/contact/#contactpage",
      "name": "SignCollab Support Portal",
      "url": "https://www.signcollab.com/contact",
      "mainEntity": { "@id": "https://www.signcollab.com/#organization" }
    },
    {
      "@type": "Organization",
      "@id": "https://www.signcollab.com/#organization",
      "name": "SignCollab",
      "url": "https://www.signcollab.com",
      "logo": "https://www.signcollab.com/icon.png",
      "sameAs": [
        "https://www.linkedin.com/company/signcollab",
        "https://x.com/signcollab",
        "https://github.com/signcollab",
        "https://www.instagram.com/signcollab",
        "https://www.facebook.com/signcollab"
      ],
      "knowsAbout": [
        "Electronic Signatures",
        "Digital Contracts",
        "Creator Economy Agreements",
        "Cryptographic Audit Trails",
        "SHA-256 Document Verification",
        "27 Jurisdiction Compliance"
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
            "timeZone": "UTC"
          }
        },
        {
          "@type": "ContactPoint",
          "contactType": "technical support",
          "email": "support@signcollab.com",
          "availableLanguage": "English"
        },
        {
          "@type": "ContactPoint",
          "contactType": "sales",
          "email": "sales@signcollab.com",
          "availableLanguage": "English"
        },
        {
          "@type": "ContactPoint",
          "contactType": "security disclosures",
          "email": "security@signcollab.com",
          "availableLanguage": "English"
        }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.signcollab.com/contact/#faqpage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How quickly do you respond to support tickets & emails?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our team reviews all incoming inquiries during our business schedule (Monday – Friday, 9:00 AM – 6:00 PM UTC). We typically respond within 24 hours on business days."
          }
        },
        {
          "@type": "Question",
          "name": "Can I request a custom product demo or Enterprise plan?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. For agencies managing multi-creator campaigns, talent managers, or enterprise brand teams requiring custom legal clause templates or dedicated support, email sales@signcollab.com."
          }
        },
        {
          "@type": "Question",
          "name": "How do I report a bug or technical issue with a contract?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "If you experience technical difficulties, OTP delays, or PDF anomalies, email support@signcollab.com with your Contract Token ID."
          }
        },
        {
          "@type": "Question",
          "name": "Are SignCollab electronic signatures legally recognized worldwide?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. SignCollab signatures generate audit trails with OTP validation, SHA-256 cryptographic PDF checksums, IP addresses, and timestamps compliant with electronic transaction laws across 27 jurisdictions including the US, UK, EU, UAE, Saudi Arabia, India, Pakistan, Canada, Australia, and Singapore."
          }
        }
      ]
    }
  ]
}
```

---

## 11. Terms of Service & Privacy Policy — terms/page.tsx

Source file: [src/app/terms/page.tsx](file:///d:/BrandBridge%20v1/src/app/terms/page.tsx#L36-L98)

Defines `WebPage` (with specialty `"Legal"`) and `FAQPage` addressing liability, legal recognition across 27 nations, Guest Mode rules, deemed approval protocol, and client-side privacy.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.signcollab.com/terms",
      "name": "Terms of Service & Privacy Policy — SignCollab",
      "description": "SignCollab's Terms of Service and Privacy Notice covering 27 global jurisdictions, e-signature compliance, OTP verification, SHA-256 audit certificates, beta status, and user responsibilities.",
      "url": "https://www.signcollab.com/terms",
      "isPartOf": { "@id": "https://www.signcollab.com/#website" },
      "about": { "@id": "https://www.signcollab.com/#organization" },
      "specialty": "Legal",
      "inLanguage": "en-US"
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.signcollab.com/terms/#faqpage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is SignCollab a law firm, legal counsel, or escrow agent?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. SignCollab is an independent technology proof-layer platform that facilitates contract generation, OTP identity validation, and cryptographic audit logging. SignCollab is not a party to any contract, does not provide legal or tax advice, does not hold escrow funds, and does not guarantee counterparty performance."
          }
        },
        {
          "@type": "Question",
          "name": "Are SignCollab electronic signatures legally valid across 27 countries?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. SignCollab electronic signatures are supported by verified email OTP validation, SHA-256 cryptographic PDF checksums, IP addresses, timestamps, and device fingerprints. They comply with electronic transaction laws across 27 jurisdictions including the US (ESIGN Act & UETA), UK (eIDAS & ECA 2000), EU (eIDAS Reg 910/2014 & eIDAS 2.0), UAE (Decree-Law 46/2021), Saudi Arabia (Royal Decree M/18), India (IT Act 2000 & Section 63 BSA 2023), Pakistan (ETO 2002), Canada, Australia, Singapore, Brazil, Mexico, and 15 additional nations."
          }
        },
        {
          "@type": "Question",
          "name": "What are the rules for Guest Mode and contract generation limits?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Guest Mode grants users up to 2 free instant contracts per 24 hours per email address without mandatory signup. The platform reserves the right to introduce subscription or per-agreement fees in the future with reasonable advance notice."
          }
        },
        {
          "@type": "Question",
          "name": "How does the 48-hour deemed approval protocol work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "If a brand or counterparty fails to review or provide written feedback on a creator's submitted content draft within 48 hours, the content is automatically deemed approved under the contract terms. This prevents indefinite approval delays."
          }
        },
        {
          "@type": "Question",
          "name": "How does SignCollab protect my personal data and contract privacy?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "SignCollab processes personal data necessary for identity verification and certificate generation. Document verification at /verify executes locally in your browser using Web Crypto APIs so document bytes are not uploaded over the network during hash checks. SignCollab never sells user data."
          }
        }
      ]
    }
  ]
}
```

---

## 12. Vision & Mission — vision/page.tsx

Source file: [src/app/vision/page.tsx](file:///d:/BrandBridge%20v1/src/app/vision/page.tsx#L36-L70)

Defines `WebPage` and `AboutPage` linking back to the organizational identity and core values.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.signcollab.com/vision",
      "name": "Vision & Mission — SignCollab",
      "description": "SignCollab exists to make professional collaborations simple, transparent, and trusted—helping brands, agencies, and creators build stronger partnerships through clear digital agreements.",
      "url": "https://www.signcollab.com/vision",
      "isPartOf": { "@id": "https://www.signcollab.com/#website" },
      "about": { "@id": "https://www.signcollab.com/#organization" },
      "breadcrumb": { "@id": "https://www.signcollab.com/#breadcrumb" },
      "inLanguage": "en-US"
    },
    {
      "@type": "AboutPage",
      "@id": "https://www.signcollab.com/vision/#aboutpage",
      "name": "About SignCollab - Vision & Mission",
      "mainEntity": {
        "@type": "Organization",
        "name": "SignCollab",
        "url": "https://www.signcollab.com",
        "slogan": "Building Better Collaborations",
        "knowsAbout": [
          "Creator Contracts",
          "Electronic Signatures",
          "Influencer Marketing Agreements",
          "Bilateral Audit Trails",
          "Digital Contract Infrastructure"
        ]
      }
    }
  ]
}
```

---

## 13. Instant Contract Creator — instant/layout.tsx

Source file: [src/app/instant/layout.tsx](file:///d:/BrandBridge%20v1/src/app/instant/layout.tsx#L36-L126)

Injected through the instant route layout. Features `WebPage`, `BreadcrumbList`, and a `HowTo` schema with prerequisite tools (`HowToTool`) and 6 execution steps.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.signcollab.com/instant",
      "url": "https://www.signcollab.com/instant",
      "name": "Instant Contract — Create a Commercial Agreement Without Signup | SignCollab",
      "description": "Create a bilaterally signed commercial agreement in minutes without creating an account. Guest mode allows 2 free instant contracts per day with OTP-verified e-signatures and SHA-256 audit trails.",
      "isPartOf": { "@id": "https://www.signcollab.com/#website" },
      "about": { "@id": "https://www.signcollab.com/#webapp" },
      "breadcrumb": { "@id": "https://www.signcollab.com/instant/#breadcrumb" },
      "inLanguage": "en-US"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.signcollab.com/instant/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.signcollab.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Instant Contract",
          "item": "https://www.signcollab.com/instant"
        }
      ]
    },
    {
      "@type": "HowTo",
      "@id": "https://www.signcollab.com/instant/#howto",
      "name": "How to Create an Instant Bilateral Contract on SignCollab",
      "description": "Step-by-step guide to creating a legally compliant bilateral agreement between creators, brands, and agencies — no signup required.",
      "totalTime": "PT10M",
      "tool": [
        {
          "@type": "HowToTool",
          "name": "Web browser (Chrome, Safari, Firefox, or Edge)"
        },
        {
          "@type": "HowToTool",
          "name": "Valid email address for OTP verification"
        }
      ],
      "step": [
        {
          "@type": "HowToStep",
          "position": 1,
          "name": "Specify Deliverables",
          "text": "Define the content format (Reel, Story, Post, YouTube Video, TikTok Short), post quantities, and retention deadlines."
        },
        {
          "@type": "HowToStep",
          "position": 2,
          "name": "Set Commercial Usage Rights",
          "text": "Determine where the brand can re-use creator IP (organic reposts, paid ads, print, broadcast) and for how long."
        },
        {
          "@type": "HowToStep",
          "position": 3,
          "name": "Configure Financial Milestones",
          "text": "Input total contract valuation, advance deposit, due dates, and select the payout route (bank IBAN, mobile wallet, or wire transfer)."
        },
        {
          "@type": "HowToStep",
          "position": 4,
          "name": "Set Turnaround and Approval Terms",
          "text": "Configure delivery turnaround, maximum revision rounds, product shipment details, and the 48-hour deemed approval protocol."
        },
        {
          "@type": "HowToStep",
          "position": 5,
          "name": "Define Bilateral Penalties",
          "text": "Set late payment fees, late delivery penalties, pre-delivery cancellation fees, and the 7-day non-delivery cutoff rule."
        },
        {
          "@type": "HowToStep",
          "position": 6,
          "name": "Verify Identity via OTP Email",
          "text": "Complete 6-digit email OTP verification to authenticate your identity before the contract is published for counterparty signing."
        }
      ]
    }
  ]
}
```

---

## 14. Creator Pricing & Legal Risk Benchmark — survey/layout.tsx

Source file: [src/app/survey/layout.tsx](file:///d:/BrandBridge%20v1/src/app/survey/layout.tsx#L36-L120)

Defines `WebPage`, an open research `Dataset` (creative commons licensed with measured research variables), `BreadcrumbList`, and `FAQPage`.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.signcollab.com/survey",
      "url": "https://www.signcollab.com/survey",
      "name": "Creator Pricing & Legal Protection Benchmark Index 2027 — SignCollab",
      "description": "An interactive market research survey and assessment tool evaluating creator deal pricing, platform rates, commercial usage rights parameters, late payment frequencies, and contract legal protections.",
      "isPartOf": { "@id": "https://www.signcollab.com/#website" },
      "about": { "@id": "https://www.signcollab.com/survey/#dataset" },
      "breadcrumb": { "@id": "https://www.signcollab.com/survey/#breadcrumb" },
      "inLanguage": "en-US"
    },
    {
      "@type": "Dataset",
      "@id": "https://www.signcollab.com/survey/#dataset",
      "name": "SignCollab Creator Pricing & Contract Legal Protection Benchmark Dataset 2027",
      "description": "Anonymous global market research dataset tracking creator rate benchmarks, usage rights licensing valuations, late payment occurrence frequencies, and contract legal protections across 25+ countries.",
      "creator": { "@id": "https://www.signcollab.com/#organization" },
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
      "@id": "https://www.signcollab.com/survey/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.signcollab.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Creator Pricing & Legal Risk Index",
          "item": "https://www.signcollab.com/survey"
        }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.signcollab.com/survey/#faqpage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Why should creators and brands participate in the Creator Pricing & Legal Protection Survey?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The survey collects anonymous benchmark data on creator rates, commercial usage rights licensing, non-payment risks, and missing legal protections to publish the annual SignCollab Creator Pricing Index."
          }
        },
        {
          "@type": "Question",
          "name": "How does SignCollab address contract vulnerabilities identified in the survey?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "SignCollab auto-generates balanced bilateral contracts featuring OTP email e-signatures, SHA-256 tamper-proof certificates, and 48-hour deemed approval protocols compliant with electronic signature laws in 25+ countries."
          }
        }
      ]
    }
  ]
}
```

---

## 15. Public Document Verifier — (auth)/verify/layout.tsx

Source file: [src/app/(auth)/verify/layout.tsx](file:///d:/BrandBridge%20v1/src/app/%28auth%29/verify/layout.tsx#L35-L79)

Features `WebPage` configured with `potentialAction` (`SearchAction`) enabling Google and AI bots to understand the token search functionality, plus `BreadcrumbList`.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.signcollab.com/verify",
      "url": "https://www.signcollab.com/verify",
      "name": "Public Contract & Audit Trail Verifier — SignCollab",
      "description": "Public document verification service allowing users to verify SHA-256 cryptographic hashes and inspect OTP e-signature audit trail certificates.",
      "isPartOf": { "@id": "https://www.signcollab.com/#website" },
      "about": { "@id": "https://www.signcollab.com/#webapp" },
      "breadcrumb": { "@id": "https://www.signcollab.com/verify/#breadcrumb" },
      "inLanguage": "en-US",
      "potentialAction": {
        "@type": "SearchAction",
        "name": "Verify Document SHA-256 Integrity",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.signcollab.com/verify?token={tracking_token}"
        },
        "query-input": "required name=tracking_token"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.signcollab.com/verify/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.signcollab.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Verify Document",
          "item": "https://www.signcollab.com/verify"
        }
      ]
    }
  ]
}
```

---

## 16. Creators Directory Analysis & Recommendations — creators/page.tsx

Source file: [src/app/creators/page.tsx](file:///d:/BrandBridge%20v1/src/app/creators/page.tsx)

### Current State
- The individual creator profile pages (`/creators/[slug]`) have complete JSON-LD markup (`Person` + `InteractionCounter` + `AggregateOffer`).
- The directory index page (`/creators`), however, **does not currently have a dedicated `<script type="application/ld+json">` tag**.

### Recommended Schema for `/creators/page.tsx`
To achieve consistency with `/knowledge/page.tsx` and maximize search indexability for creator discovery, the following schema is recommended for insertion into `src/app/creators/page.tsx`:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://www.signcollab.com/creators",
      "url": "https://www.signcollab.com/creators",
      "name": "Creator Directory & Sponsorship Rate Intelligence — SignCollab",
      "description": "Discover verified content creators across YouTube, Instagram, and TikTok with data-backed sponsorship rate cards, audience metrics, and instant contract execution.",
      "isPartOf": { "@id": "https://www.signcollab.com/#website" },
      "about": { "@id": "https://www.signcollab.com/#organization" },
      "breadcrumb": { "@id": "https://www.signcollab.com/creators/#breadcrumb" },
      "inLanguage": "en-US"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.signcollab.com/creators/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.signcollab.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Creators Directory",
          "item": "https://www.signcollab.com/creators"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://www.signcollab.com/creators/#itemlist",
      "name": "Verified Content Creators & Rate Cards",
      "numberOfItems": 30,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "url": "https://www.signcollab.com/creators/{slug}",
          "name": "{canonicalName}",
          "description": "{creatorType} with {followerCount} followers"
        }
      ]
    }
  ]
}
```
