import type { EvidenceRef } from "./EvidenceRef.js";

export type AddressType = "residential" | "postal" | "previous" | "other";

export interface Address {
  id: string;
  type?: AddressType;
  line1?: string;
  line2?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  country?: string;
  fullAddress?: string;
  primary?: boolean;
  evidenceRefs?: EvidenceRef[];
}
