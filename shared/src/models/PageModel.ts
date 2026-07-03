import type { SectionModel } from "./SectionModel.js";

export interface PageModel {
  url: string;
  title: string;
  scannedAt: string;
  sections: SectionModel[];
}
