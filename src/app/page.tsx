import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { getHomeHeroCreator } from "@/lib/home/featured-creator";
import { HomeExperience } from "@/components/home/HomeExperience";

export const metadata: Metadata = {
  title: "SignCollab | Creator discovery, sponsorship rates & contracts",
  description: "Find creators, explore estimated sponsorship rates, understand platform performance and audience insights, and build a clear creator partnership agreement.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Find creators. Understand rates. Make the deal. | SignCollab",
    description: "Explore creator profiles, compare estimated sponsorship rates, and turn your partnership into a clear agreement.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creator discovery, sponsorship rates & contracts | SignCollab",
    description: "Explore creator profiles, compare estimated sponsorship rates, and build a creator agreement.",
  },
};

export const revalidate = 300;

export default async function Home() {
  const heroCreator = await getHomeHeroCreator();
  return <div className="min-h-screen bg-zinc-50 flex flex-col selection:bg-pink-200 selection:text-zinc-900">
    <PublicHeader activeRoute="/" />
    <HomeExperience heroCreator={heroCreator} />
    <PublicFooter />
  </div>;
}
