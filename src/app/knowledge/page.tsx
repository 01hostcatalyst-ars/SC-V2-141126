import React from "react";
import type { Metadata } from "next";
import { getCompanyConfig } from "@/lib/config";
import { getKnowledgeArticles } from "@/lib/gdocs";
import AcademyClientPage from "./AcademyClientPage";

const baseUrl = 'https://www.signcollab.com';

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

export const metadata: Metadata = {
  title: "SignCollab Academy — Guides for Creator Partnerships",
  description:
    "Practical guides to creator pricing, contracts, usage rights, and the business of working together.",
  alternates: {
    canonical: "/knowledge",
  },
  openGraph: {
    title: "SignCollab Academy — Guides for Creator Partnerships",
    description:
      "Operational workflows, legal compliance, contract templates, and calculators for creators, brands, and agencies.",
    url: `${baseUrl}/knowledge`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SignCollab Academy — Creator & Brand Guides",
    description:
      "Guided learning pathways, contract compliance, usage rights, and e-signature standards.",
  },
};

export default async function KnowledgeIndexPage() {
  const company = getCompanyConfig();
  const articles = await getKnowledgeArticles();


  return (
    <>
      <AcademyClientPage initialArticles={articles} companyName={company.name} />
    </>
  );
}
