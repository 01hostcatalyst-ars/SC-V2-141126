import { serializeJsonLd } from '@/lib/structured-data';
import { siteGraph } from '@/lib/structured-data';
import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { getCompanyConfig } from "@/lib/config";

const inter = localFont({
  src: "../../public/fonts/Inter.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-inter",
});

const plusJakarta = localFont({
  src: "../../public/fonts/PlusJakartaSans-Variable.ttf",
  weight: "200 800",
  style: "normal",
  display: "swap",
  variable: "--font-jakarta",
});

const jetbrainsMono = localFont({
  src: "../../public/fonts/JetBrainsMono-Variable.ttf",
  weight: "100 800",
  style: "normal",
  display: "swap",
  variable: "--font-mono",
});

export async function generateMetadata(): Promise<Metadata> {
  const company = getCompanyConfig();
  const baseUrl = 'https://www.signcollab.com';

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
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "48x48" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        {
          rel: "icon",
          url: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          rel: "icon",
          url: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    manifest: "/site.webmanifest",
    appleWebApp: {
      title: company.name,
      statusBarStyle: "black-translucent",
      capable: true,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const company = getCompanyConfig();
  const baseUrl = 'https://www.signcollab.com';

  const jsonLd = siteGraph(company);

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
        <script
          id="schema-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} ${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-canvas text-primary selection:bg-zinc-950 selection:text-white`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

