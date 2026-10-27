import type { BusinessSiteContent } from "@evalycloud/content-schema";
import { mergeList } from "./merge.ts";
import type { MultiSheetConfig } from "./sources.ts";
import {
  faqColumns,
  faqRows,
  galleryColumns,
  galleryRows,
  mapFaq,
  mapGallery,
  mapTitled,
  titledColumns,
  titledRows,
} from "./common.ts";
import { linkFields, resolveKitSheets, sharedOptional, type KitSheetSpec } from "./kit-sheets.ts";

export const businessSheetSpec: KitSheetSpec<BusinessSiteContent> = {
  optional: [
    ...sharedOptional,
    { path: "hero", fields: ["eyebrow"] },
    { path: "hero.secondaryCta", ...linkFields },
    { path: "labels", fields: ["services", "gallery", "faq", "contact"] },
  ],
  tabs: [
    {
      source: "services",
      file: "2_services.csv",
      owns: "services",
      columns: titledColumns,
      toRows: (content) => titledRows(content.services),
      apply: (content, result) => ({ ...content, services: mergeList(content.services, mapTitled(result)) }),
    },
    {
      source: "gallery",
      file: "3_gallery.csv",
      owns: "gallery",
      columns: galleryColumns,
      toRows: (content) => galleryRows(content.gallery),
      apply: (content, result) => ({ ...content, gallery: mergeList(content.gallery, mapGallery(result)) }),
    },
    {
      source: "faq",
      file: "4_faq.csv",
      owns: "faq",
      columns: faqColumns,
      toRows: (content) => faqRows(content.faq),
      apply: (content, result) => ({ ...content, faq: mergeList(content.faq, mapFaq(result)) }),
    },
  ],
};

export async function resolveBusinessContent(fallback: BusinessSiteContent, config?: MultiSheetConfig) {
  const { content, diagnostics } = await resolveKitSheets(fallback, config, businessSheetSpec);
  return { content, diagnostics };
}
