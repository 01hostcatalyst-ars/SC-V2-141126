import { graph, pageNode, breadcrumbs } from '@/lib/structured-data';
import { serializeJsonLd } from '@/lib/structured-data';
import type { Metadata } from "next";

const baseUrl = 'https://www.signcollab.com';

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

  const surveyJsonLd = graph([pageNode('/survey', 'Creator pricing research survey', 'Contribute your experience of creator pricing, commercial usage rights, and partnership agreements to SignCollab research.'), breadcrumbs('/survey', 'Pricing research survey')]);

  return (
    <>
      <script
        id="survey-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(surveyJsonLd) }}
      />
      {children}
    </>
  );
}
