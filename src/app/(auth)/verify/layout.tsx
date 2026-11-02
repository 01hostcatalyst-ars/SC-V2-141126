import { graph, pageNode, breadcrumbs, SITE_URL, organizationId } from '@/lib/structured-data';
import { serializeJsonLd } from '@/lib/structured-data';
import type { Metadata } from "next";

const baseUrl = 'https://www.signcollab.com';

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

  const verifyJsonLd = graph([{...pageNode('/verify', 'Document verification', 'Look up a SignCollab document reference or compare a PDF SHA-256 fingerprint against the stored agreement record.'), mainEntity: {'@id': `${SITE_URL}/verify#application`}}, breadcrumbs('/verify', 'Document verification'), {'@type': 'WebApplication', '@id': `${SITE_URL}/verify#application`, name: 'Document verification', url: `${SITE_URL}/verify`, description: 'Look up a SignCollab document reference or compare a PDF SHA-256 fingerprint against the stored agreement record.', applicationCategory: 'BusinessApplication', operatingSystem: 'Web browser', provider: {'@id': organizationId}, featureList: ["Document reference lookup", "Browser-based PDF SHA-256 fingerprint", "Comparison with the stored record"]}]);

  return (
    <>
      <script
        id="verify-page-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(verifyJsonLd) }}
      />
      {children}
    </>
  );
}
