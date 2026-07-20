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
    "@type": "WebApplication",
    "name": company.name,
    "url": baseUrl,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "description": "Commercial agreement proof layer and electronic signature platform for creators, brands, and agencies.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
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

