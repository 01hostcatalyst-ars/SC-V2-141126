/** Display-only audience country resolution, independent of pricing regions. */
export function resolveAudienceCountry(value: unknown): { name: string; code?: string } | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const name = value.trim();
  const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");
  const aliases: Record<string, string> = {
    usa: "US", us: "US", unitedstatesofamerica: "US",
    uk: "GB", uae: "AE", republicofkorea: "KR", korea: "KR",
  };
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  const alias = aliases[normalize(name)];
  if (alias) return { name: names.of(alias) || name, code: alias };
  for (let first = 65; first <= 90; first++) {
    for (let second = 65; second <= 90; second++) {
      const code = String.fromCharCode(first, second);
      const label = names.of(code);
      if (label && label !== code && (normalize(name) === normalize(label) || name.toUpperCase() === code)) {
        return { name: label, code };
      }
    }
  }
  // Preserve regional/unknown market descriptions without inventing a country flag.
  return { name };
}
