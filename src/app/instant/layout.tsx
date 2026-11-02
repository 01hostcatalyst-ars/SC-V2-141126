import { graph, pageNode, breadcrumbs, SITE_URL, organizationId } from '@/lib/structured-data';
import { serializeJsonLd } from '@/lib/structured-data';
import type { Metadata } from "next";

const baseUrl = 'https://www.signcollab.com';

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

  const instantJsonLd = graph([{...pageNode('/instant', 'Instant contracts', 'Draft a creator partnership agreement with deliverables, usage rights, payment terms, timelines, and email-verified signing.'), mainEntity: {'@id': `${SITE_URL}/instant#application`}}, breadcrumbs('/instant', 'Instant contracts'), {'@type': 'WebApplication', '@id': `${SITE_URL}/instant#application`, name: 'Instant contracts', url: `${SITE_URL}/instant`, description: 'Draft a creator partnership agreement with deliverables, usage rights, payment terms, timelines, and email-verified signing.', applicationCategory: 'BusinessApplication', operatingSystem: 'Web browser', provider: {'@id': organizationId}, featureList: ["Guided agreement drafting", "Content deliverables and usage rights", "Payment and delivery terms", "Email verification and signing links", "Contract PDFs"]}]);

  return (
    <>
      <script
        id="instant-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(instantJsonLd) }}
      />
      {children}
    </>
  );
}
