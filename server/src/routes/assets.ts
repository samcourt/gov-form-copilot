import path from "node:path";
import { Router } from "express";
import multer from "multer";
import type { EvidenceAsset } from "@gov-form-copilot/shared";
import { addAsset, deleteAsset, findAsset, loadAssets, makeAssetId, uploadsDir } from "../assets/assetStore.js";

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadsDir),
  filename: (_req, file, callback) => {
    const assetId = makeAssetId(file.originalname);
    callback(null, `${assetId}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp", "text/plain"];
    if (allowed.includes(file.mimetype)) callback(null, true);
    else callback(new Error(`Unsupported file type: ${file.mimetype}`));
  }
});

export const assetsRouter = Router();

assetsRouter.get("/assets", async (_req, res, next) => {
  try {
    res.json({ ok: true, assets: await loadAssets() });
  } catch (error) {
    next(error);
  }
});

assetsRouter.post("/assets/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, error: "No file uploaded." });

    const id = path.basename(req.file.filename, path.extname(req.file.filename));
    const asset: EvidenceAsset = {
      id,
      filename: req.file.filename,
      originalFilename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      status: "uploaded",
      sourceType: String(req.body.sourceType ?? "unknown"),
      label: String(req.body.label ?? req.file.originalname),
      storagePath: req.file.path
    };

    await addAsset(asset);
    res.json({ ok: true, asset });
  } catch (error) {
    next(error);
  }
});

assetsRouter.get("/assets/:assetId/file", async (req, res, next) => {
  try {
    const asset = await findAsset(req.params.assetId);
    if (!asset) return res.status(404).json({ ok: false, error: "Asset not found." });
    res.setHeader("Content-Type", asset.mimeType);
    res.sendFile(asset.storagePath);
  } catch (error) {
    next(error);
  }
});

assetsRouter.delete("/assets/:assetId", async (req, res, next) => {
  try {
    const deleted = await deleteAsset(req.params.assetId);
    if (!deleted) return res.status(404).json({ ok: false, error: "Asset not found." });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
