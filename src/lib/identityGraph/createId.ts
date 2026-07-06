export function createId(prefix: string, seed?: string): string {
  const s = seed?.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g,"");
  return s ? `${prefix}_${s}` : `${prefix}_${crypto.randomUUID()}`;
}
