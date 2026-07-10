export function createId(prefix: string, seed: string): string {
  const normalisedSeed = seed
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return `${prefix}_${normalisedSeed || "unknown"}`;
}