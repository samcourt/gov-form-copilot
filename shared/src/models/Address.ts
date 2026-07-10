import type { Fact } from "./Evidence.js";
import type { EvidenceRef } from "./EvidenceRef.js";

export type AddressType = "residential" | "postal" | "previous" | "other";

/**
 * Canonical address with attribute-level provenance.
 */
export interface Address {
  id: string;
  type?: AddressType;

  line1?: Fact<string>;
  line2?: Fact<string>;
  suburb?: Fact<string>;
  state?: Fact<string>;
  postcode?: Fact<string>;
  country?: Fact<string>;
  fullAddress?: Fact<string>;

  primary?: boolean;

  /**
   * Evidence supporting the address as an overall domain object.
   *
   * Evidence for each individual address value belongs on its Fact<T>.
   */
  evidenceRefs?: EvidenceRef[];

  createdAt?: string;
  updatedAt?: string;
}