import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getAuthUser, getGoogleIdentity } from "@/lib/auth-user";
import { OnboardingForm } from "@/components/auth/OnboardingForm";

export const metadata: Metadata = { title: "Complete your profile | SignCollab", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const identity = await getGoogleIdentity();
  if (!identity) redirect("/login");
  if (await getAuthUser()) redirect("/dashboard");
  return <OnboardingForm name={identity.name} email={identity.email} />;
}
