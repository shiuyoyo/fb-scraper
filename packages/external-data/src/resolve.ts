import type { KitContent, KitName } from "@evalycloud/content-schema";
import { businessSheetSpec, resolveBusinessContent } from "./business.ts";
import { educationSheetSpec, resolveEducationContent } from "./education.ts";
import { eventSheetSpec, resolveEventContent, type EventLive } from "./event.ts";
import { portfolioSheetSpec, resolvePortfolioContent } from "./portfolio.ts";
import { resolveRestaurantContent, restaurantSheetSpec } from "./restaurant.ts";
import { sheetTemplate, type KitSheetSpec } from "./kit-sheets.ts";

export const kitSheetSpecs: { [K in KitName]: KitSheetSpec<KitContent[K]> } = {
  business: businessSheetSpec,
  restaurant: restaurantSheetSpec,
  event: eventSheetSpec,
  education: educationSheetSpec,
  portfolio: portfolioSheetSpec,
};

export type KitResolved = {
  content: KitContent[KitName];
  /** Event kit only. */
  live?: EventLive;
  diagnostics: Record<string, string>;
};

/** Build-time entry point: resolve any kit's content against its sheets. */
export async function resolveCustomerContent(kit: KitName, fallback: KitContent[KitName]): Promise<KitResolved> {
  const config = fallback.site.sheets;
  switch (kit) {
    case "business":
      return resolveBusinessContent(fallback as KitContent["business"], config);
    case "restaurant":
      return resolveRestaurantContent(fallback as KitContent["restaurant"], config);
    case "event":
      return resolveEventContent(fallback as KitContent["event"], config);
    case "education":
      return resolveEducationContent(fallback as KitContent["education"], config);
    case "portfolio":
      return resolvePortfolioContent(fallback as KitContent["portfolio"], config);
  }
}

/** Pre-filled sheet template CSVs for any kit. */
export function customerSheetTemplate(kit: KitName, content: KitContent[KitName]) {
  return sheetTemplate(content as KitContent["business"], kitSheetSpecs[kit] as KitSheetSpec<KitContent["business"]>);
}
