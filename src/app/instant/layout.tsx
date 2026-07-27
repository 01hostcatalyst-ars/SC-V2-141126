import type { Metadata } from "next";

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
  return children;
}
