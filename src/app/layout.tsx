import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { getCompanyConfig } from "@/lib/config";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
});

export async function generateMetadata(): Promise<Metadata> {
  const company = getCompanyConfig();
  return {
    title: `${company.name} | Creator Agreement Proof Layer`,
    description: `Formalize creator-brand partnerships and secure bilaterally signed audit trails admissible under Pakistan's ETO 2002. Powered by ${company.name}.`,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased min-h-screen bg-theme-gradient`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
