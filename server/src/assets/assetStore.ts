import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { EvidenceAsset } from "@gov-form-copilot/shared";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadsDir = path.resolve(__dirname, "../../data/uploads");
const assetIndexPath = path.join(uploadsDir, "assets.json");

export async function ensureUploadsDir(): Promise<void> {
  await fs.mkdir(uploadsDir, { recursive: true });
}

export async function loadAssets(): Promise<EvidenceAsset[]> {
  await ensureUploadsDir();
  try {
    return JSON.parse(await fs.readFile(assetIndexPath, "utf-8")) as EvidenceAsset[];
  } catch {
    return [];
  }
}

export async function saveAssets(assets: EvidenceAsset[]): Promise<void> {
  await ensureUploadsDir();
  await fs.writeFile(assetIndexPath, JSON.stringify(assets, null, 2), "utf-8");
}

export async function addAsset(asset: EvidenceAsset): Promise<EvidenceAsset> {
  const assets = await loadAssets();
  assets.unshift(asset);
  await saveAssets(assets);
  return asset;
}

export async function findAsset(assetId: string): Promise<EvidenceAsset | undefined> {
  return (await loadAssets()).find((asset) => asset.id === assetId);
}

export async function deleteAsset(assetId: string): Promise<boolean> {
  const assets = await loadAssets();
  const asset = assets.find((item) => item.id === assetId);
  const nextAssets = assets.filter((item) => item.id !== assetId);
  if (nextAssets.length === assets.length) return false;
  await saveAssets(nextAssets);
  if (asset) await fs.unlink(asset.storagePath).catch(() => undefined);
  return true;
}

export function makeAssetId(filename: string): string {
  const slug = filename.toLowerCase().replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
  return `${slug || "asset"}-${Date.now()}`;
}
