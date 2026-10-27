import type { MultiSheetConfig, SheetSource } from "@evalycloud/content-schema";
import { loadSheet, type SheetResult } from "./sheet.ts";

export type { MultiSheetConfig };

/**
 * A customer may wire several published sheets, one per concern. Each is
 * optional and fails independently: a broken menu sheet must not take down
 * opening hours. The config type lives in the schema; the loader is here.
 */

export type SheetSourceName =
  | "site"
  | "sections"
  | "images"
  | "announcements"
  | "faq"
  | "menu"
  | "featured"
  | "openingHours";

export type LoadedSources = Partial<Record<SheetSourceName, SheetResult>>;

/**
 * Fetch every configured source once, in parallel, and hand back the raw
 * parsed rows keyed by source name. Never throws; per-source failures are
 * captured in each result's status.
 *
 * Deduplication is structural: each source is one fetch, and a page resolves
 * this object once, so the same CSV is never requested twice in a render.
 */
export async function loadAllSources(config: MultiSheetConfig | undefined): Promise<LoadedSources> {
  if (!config?.enabled) return {};

  const names = Object.keys(config.sources) as SheetSourceName[];

  const entries = await Promise.all(
    names.map(async (name) => {
      const source = config.sources[name];
      const withInterval: SheetSource | undefined =
        source && config.refreshInterval !== undefined
          ? { ...source, revalidateSeconds: source.revalidateSeconds ?? config.refreshInterval }
          : source;
      const result = await loadSheet(withInterval);
      return [name, result] as const;
    }),
  );

  return Object.fromEntries(entries) as LoadedSources;
}

/** Turn a key/value sheet (two columns) into a flat override map. */
export function keyValueRows(result: SheetResult | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!result || result.status !== "ok") return out;

  for (const row of result.rows) {
    const key = String((row as Record<string, unknown>).key ?? "").trim();
    const value = String((row as Record<string, unknown>).value ?? "").trim();
    if (key !== "") out[key] = value;
  }
  return out;
}
