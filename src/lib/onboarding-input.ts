import { JURISDICTIONS } from "@/lib/config/jurisdictions";

export class OnboardingInputError extends Error {}

function text(value: unknown, label: string, max: number, required = false) {
  if (value === undefined || value === null) value = "";
  if (typeof value !== "string") throw new OnboardingInputError(`${label} must be text.`);
  const clean = value.trim();
  if (required && !clean) throw new OnboardingInputError(`${label} is required.`);
  if (clean.length > max) throw new OnboardingInputError(`${label} is too long.`);
  return clean;
}

export function parseOnboardingInput(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new OnboardingInputError("Enter your profile details.");
  const input = body as Record<string, unknown>;
  if (input.role !== "CREATOR" && input.role !== "BRAND" && input.role !== "AGENCY") throw new OnboardingInputError("Choose Creator, Brand, or Agency.");
  const countryCode = text(input.countryCode, "Country", 2, true).toUpperCase();
  if (!Object.hasOwn(JURISDICTIONS, countryCode)) throw new OnboardingInputError("Choose a supported country.");
  const organization = text(input.organizationName, input.role === "AGENCY" ? "Agency name" : "Brand name", 150, input.role !== "CREATOR");
  const creatorName = text(input.creatorName, "Creator name", 100);
  const instagramHandle = text(input.instagramHandle, "Instagram handle", 31).replace(/^@/, "");
  if (instagramHandle && !/^[a-zA-Z0-9._]{1,30}$/.test(instagramHandle)) throw new OnboardingInputError("Enter an Instagram username, rather than a link.");
  return {
    name: text(input.name, "Name", 100, true),
    role: input.role as "CREATOR" | "BRAND" | "AGENCY",
    countryCode,
    phone: text(input.phone, "Phone", 40) || null,
    creatorName: input.role === "CREATOR" ? creatorName || null : null,
    instagramHandle: input.role === "CREATOR" ? instagramHandle || null : null,
    agencyName: input.role !== "CREATOR" ? organization : null,
  };
}
