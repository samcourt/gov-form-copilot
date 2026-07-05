export type EvidenceAssetStatus =
  | "uploaded"
  | "ocr_pending"
  | "ocr_complete"
  | "extracted"
  | "verified"
  | "error";

export interface EvidenceAsset {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  status: EvidenceAssetStatus;
  sourceType?: string;
  label?: string;
  storagePath: string;
  evidenceDocumentId?: string;
}
