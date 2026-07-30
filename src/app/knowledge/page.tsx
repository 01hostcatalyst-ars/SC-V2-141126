import React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { getCompanyConfig } from "@/lib/config";
import { getKnowledgeArticles } from "@/lib/gdocs";
import AcademyClientPage from "./AcademyClientPage";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

export const metadata: Metadata = {
  title: "SignCollab Academy — Master Content Architecture & Legal Knowledge",
  description:
    "The definitive operational, business, and legal authority for brand-creator partnerships. Guided learning pathways, e-signature compliance, usage rights calculators, and agreement templates.",
  alternates: {
    canonical: "/knowledge",
  },
  openGraph: {
    title: "SignCollab Academy — Master Content Architecture & Legal Knowledge",
    description:
      "Operational workflows, legal compliance, contract templates, and calculators for creators, brands, and agencies.",
    url: `${baseUrl}/knowledge`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SignCollab Academy — Creator & Brand Legal Resources",
    description:
      "Guided learning pathways, contract compliance, usage rights, and e-signature standards.",
  },
};

export default async function KnowledgeIndexPage() {
  const company = getCompanyConfig();
  const articles = await getKnowledgeArticles();

  const knowledgeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${baseUrl}/knowledge`,
        "url": `${baseUrl}/knowledge`,
        "name": "SignCollab Academy — Master Content Architecture & Legal Knowledge",
        "description":
          "The definitive operational, business, and legal authority for brand-creator partnerships. Guided learning pathways, e-signature compliance, usage rights calculators, and agreement templates.",
        "isPartOf": { "@id": `${baseUrl}/#website` },
        "about": { "@id": `${baseUrl}/#organization` },
        "breadcrumb": { "@id": `${baseUrl}/knowledge/#breadcrumb` },
        "inLanguage": "en-US",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/knowledge/#breadcrumb`,
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
            "name": "SignCollab Academy",
            "item": `${baseUrl}/knowledge`,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${baseUrl}/knowledge/#itemlist`,
        "name": "SignCollab Academy Knowledge Articles",
        "numberOfItems": articles.length,
        "itemListElement": articles.slice(0, 30).map((art, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "url": `${baseUrl}/knowledge/${art.slug}`,
          "name": art.title,
          "description": art.excerpt,
        })),
      },
    ],
  };

  return (
    <>
      <Script
        id="knowledge-index-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(knowledgeJsonLd) }}
      />
      <AcademyClientPage initialArticles={articles} companyName={company.name} />
    </>
  );
}
