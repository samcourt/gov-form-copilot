import type { Address } from "./Address.js";
import type { ApplicationContext } from "./Application.js";
import type { Household } from "./Household.js";
import type { Person } from "./Person.js";
import type { Relationship } from "./Relationship.js";

/**
 * New v0.6 source model.
 *
 * IdentityGraph is the canonical domain shape. Legacy CanonicalProfile remains
 * as a derived compatibility view while the UI/API migrate.
 */
export interface IdentityGraph {
  people: Person[];
  relationships: Relationship[];
  households: Household[];
  addresses: Address[];
  applications: ApplicationContext[];
}
