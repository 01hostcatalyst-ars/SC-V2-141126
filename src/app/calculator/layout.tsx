import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Influencer Price & Campaign Rate Calculator 2026 | SignCollab",
  description:
    "Estimate fair market rates for Instagram, TikTok, and YouTube influencer campaigns. Based on 2025–2026 empirical benchmark data across engagement, usage rights, and exclusivity.",
  keywords: [
    "influencer price calculator",
    "influencer rate card",
    "creator pricing benchmark",
    "instagram reel cost calculator",
    "tiktok influencer pricing",
    "youtube sponsorship calculator",
    "commercial usage rights cost",
    "influencer marketing budget estimator",
  ],
  openGraph: {
    title: "Influencer Rate & Campaign Pricing Calculator | SignCollab",
    description:
      "Defensible market benchmarks for Instagram Reels, Stories, TikToks, and YouTube integrations with continuous ER scaling and usage rights licensing.",
    type: "website",
  },
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
