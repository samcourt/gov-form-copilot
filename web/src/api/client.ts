const API_BASE_URL = "http://localhost:8787/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {})
    },
    ...options
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok || data.ok === false) {
    throw new Error(data.error ?? `API request failed: ${response.status}`);
  }

  return data as T;
}

export interface EvidenceDocument {
  id: string;
  type: string;
  label: string;
  extractedAt?: string;
  uploadedAt?: string;
  values: Record<string, {
    value: string;
    sourceId: string;
    sourceType: string;
    sourceLabel: string;
    confidence: number;
    rawText?: string;
  }>;
}

export interface EvidenceResponse {
  ok: boolean;
  evidenceDocuments: EvidenceDocument[];
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
  profileSummary: {
    documents: number;
    fields: number;
    conflicts: number;
    generatedAt: string;
  };
}

export async function getEvidence(): Promise<EvidenceResponse> {
  return request<EvidenceResponse>("/evidence");
}

export async function getProfile(): Promise<ProfileResponse> {
  return request<ProfileResponse>("/profile");
}

export async function ingestExtractedText(args: {
  sourceType: string;
  label: string;
  rawText: string;
}): Promise<ExtractTextResponse> {
  return request<ExtractTextResponse>("/documents/extract-text", {
    method: "POST",
    body: JSON.stringify(args)
  });
}

export async function ingestStructuredEvidence(args: {
  sourceType: string;
  label: string;
  values: Record<string, string>;
}): Promise<ExtractTextResponse> {
  return request<ExtractTextResponse>("/documents/evidence", {
    method: "POST",
    body: JSON.stringify(args)
  });
}
