export interface EvidenceItem {
  source: string;
  value: string;
  confidence: number;
  extractedAt?: string;
  page?: number;
  field?: string;
}

export type EvidenceMap = Record<string, EvidenceItem>;
