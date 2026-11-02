import { graph, pageNode, faqNode, serializeJsonLd, schemaUrl } from '@/lib/structured-data';
import { HOME_FAQS } from '@/lib/home/faqs';
import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { getHomeHeroCreator } from "@/lib/home/featured-creator";
import { getHomeSpotlightCreators } from "@/lib/home/spotlight-creators";
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

// Keep this literal so Next.js can statically analyze the three-day ISR interval.
export const revalidate = 259200;

export default async function Home() {
  const [heroCreator, spotlightCreators] = await Promise.all([getHomeHeroCreator(), getHomeSpotlightCreators()]);
  const schema = graph([{...pageNode('/', 'SignCollab — Creator discovery, rates & contracts', 'Find creators, explore estimated sponsorship rates, understand platform performance and audience insights, and build a clear partnership agreement.'), hasPart: [{ '@id': schemaUrl('/creators') }, { '@id': schemaUrl('/influencer-rate-calculator#webapp') }, { '@id': schemaUrl('/instant#application') }]}, faqNode('/', HOME_FAQS), {'@type': 'ItemList', '@id': schemaUrl('/#featured-creators'), name: 'Featured creators', numberOfItems: spotlightCreators.length, itemListElement: spotlightCreators.map((creator,index)=>({'@type':'ListItem',position:index+1,name:creator.brandName||creator.canonicalName,url:schemaUrl(`/creators/${creator.slug}`)}))}]);
  return <div className="min-h-screen bg-zinc-50 flex flex-col selection:bg-pink-200 selection:text-zinc-900">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(schema)}} />
    <PublicHeader activeRoute="/" />
    <HomeExperience heroCreator={heroCreator} spotlightCreators={spotlightCreators} />
    <PublicFooter />
  </div>;
}
