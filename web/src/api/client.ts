const API_BASE_URL = "http://localhost:8787/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok || data.ok === false) throw new Error(data.error ?? `API request failed: ${response.status}`);
  return data as T;
}

async function formRequest<T>(path: string, body: FormData): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { method: "POST", body });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok || data.ok === false) throw new Error(data.error ?? `API request failed: ${response.status}`);
  return data as T;
}

export interface EvidenceAsset {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  status: string;
  sourceType?: string;
  label?: string;
  storagePath: string;
  evidenceDocumentId?: string;
}

export interface EvidenceDocument {
  id: string;
  type: string;
  label: string;
  extractedAt?: string;
  uploadedAt?: string;
  values: Record<string, { value: string; sourceId: string; sourceType: string; sourceLabel: string; confidence: number; rawText?: string }>;
}

export interface EvidenceResponse { ok: boolean; evidenceDocuments: EvidenceDocument[]; }
export interface AssetsResponse { ok: boolean; assets: EvidenceAsset[]; }
export interface AssetUploadResponse { ok: boolean; asset: EvidenceAsset; }

export interface ProfileResponse {
  ok: boolean;
  profile: unknown;
  evidenceDocuments?: EvidenceDocument[];
  documents: number;
  fields: number;
  conflicts: number;
  generatedAt: string;
}

export interface ExtractTextResponse {
  ok: boolean;
  evidenceDocument: EvidenceDocument;
  extractedFields: string[];
  profileSummary: { documents: number; fields: number; conflicts: number; generatedAt: string; };
}

export interface ProfileField {
  path: string;
  value?: string;
  confidence: number;
  status: string;
  reason?: string;
  evidence: Array<{
    value: string;
    sourceLabel: string;
    confidence: number;
  }>;
  conflicts: Array<{
    value: string;
    sourceLabel: string;
    confidence: number;
  }>;
}

export async function getEvidence(): Promise<EvidenceResponse> { return request<EvidenceResponse>("/evidence"); }
export async function getAssets(): Promise<AssetsResponse> { return request<AssetsResponse>("/assets"); }
export async function deleteAsset(assetId: string): Promise<{ ok: boolean }> { return request<{ ok: boolean }>(`/assets/${assetId}`, { method: "DELETE" }); }

export async function uploadAsset(args: { file: File; sourceType: string; label: string; }): Promise<AssetUploadResponse> {
  const formData = new FormData();
  formData.append("file", args.file);
  formData.append("sourceType", args.sourceType);
  formData.append("label", args.label);
  return formRequest<AssetUploadResponse>("/assets/upload", formData);
}

export function assetFileUrl(assetId: string): string { return `${API_BASE_URL}/assets/${assetId}/file`; }
export async function getProfile(): Promise<ProfileResponse> { return request<ProfileResponse>("/profile"); }

export async function ingestExtractedText(args: { sourceType: string; label: string; rawText: string; }): Promise<ExtractTextResponse> {
  return request<ExtractTextResponse>("/documents/extract-text", { method: "POST", body: JSON.stringify(args) });
}

export async function ingestStructuredEvidence(args: { sourceType: string; label: string; values: Record<string, string>; }): Promise<ExtractTextResponse> {
  return request<ExtractTextResponse>("/documents/evidence", { method: "POST", body: JSON.stringify(args) });
}
