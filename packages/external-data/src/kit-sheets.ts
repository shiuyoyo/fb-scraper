import { themeNames } from "@evalycloud/config/themes.ts";
import { applyOverrides, EMPTY_SENTINEL } from "./merge.ts";
import { keyValueRows, loadAllSources, type LoadedSources, type MultiSheetConfig, type SheetSourceName } from "./sources.ts";
import type { SheetResult } from "./sheet.ts";
import { cell, type Row } from "./common.ts";

/**
 * One description per kit of everything a customer can edit from a sheet.
 *
 * - The `site` tab is key/value and covers every single-valued field: names,
 *   hero copy, CTAs, contact, venue, section headings, SEO, palette.
 * - Each list section (services, menu, courses…) is its own tab.
 *
 * The same spec drives both directions: resolving a sheet into content at
 * build time, and exporting a pre-filled sheet template from content, so a
 * field that can be exported can always be edited back.
 */

/**
 * An optional object the fallback may not have yet (e.g. hero.image). A sheet
 * that fills one of its fields creates it; if the required fields are still
 * empty afterwards the half-made object is removed again, so a template never
 * sees an image without a src or a button without a link.
 */
export type OptionalGroup = {
  path: string;
  fields: string[];
  required?: string[];
  /** Fields that hold a list of strings, filled from a `|`-separated cell. */
  arrays?: string[];
};

/** Optional fields every kit can fill from the site tab. */
export const sharedOptional: OptionalGroup[] = [
  { path: "site", fields: ["theme", "logo"] },
  { path: "site.seo", fields: ["title", "description", "ogImage"] },
  { path: "contact", fields: ["phone", "email", "lineUrl", "instagramUrl", "facebookUrl", "mapUrl"] },
];

export const linkFields = { fields: ["label", "href"], required: ["label", "href"] };
export const imageFields = { fields: ["src", "alt"], required: ["src"] };

export type SheetTab<C> = {
  source: SheetSourceName;
  /** File name of the exported template CSV. */
  file: string;
  /** Top-level content key this tab replaces; excluded from the site tab. */
  owns: string;
  columns: string[];
  toRows: (content: C) => Row[];
  apply: (content: C, result: SheetResult | undefined) => C;
};

export type KitSheetSpec<C> = {
  optional: OptionalGroup[];
  tabs: SheetTab<C>[];
  /** Extra site-tab rows that are not content paths (the Event kit's live keys). */
  extraSiteRows?: (content: C) => Row[];
};

/**
 * Paths a sheet may never change. Template choice and sheet wiring are
 * delivery decisions; language drives labels; an event's status may only move
 * through the conservative live `status` key (see resolveStatus).
 */
export const LOCKED_PATHS = ["site.template", "site.language", "site.sheets", "site.sheet", "site.status"];

function isLocked(path: string): boolean {
  return LOCKED_PATHS.some((locked) => path === locked || path.startsWith(`${locked}.`));
}

type Plain = Record<string, unknown>;

function isPlain(value: unknown): value is Plain {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getPath(target: unknown, keys: string[]): unknown {
  let node = target;
  for (const key of keys) {
    if (!isPlain(node)) return undefined;
    node = node[key];
  }
  return node;
}

function hasValue(raw: string | undefined): boolean {
  return raw !== undefined && raw.trim() !== "" && raw !== EMPTY_SENTINEL;
}

/** Drop locked keys and palette names the design system does not ship. */
export function sanitizeOverrides(overrides: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [path, value] of Object.entries(overrides)) {
    if (!path.includes(".") || isLocked(path)) continue;
    if (path === "site.theme" && !(themeNames as string[]).includes(value.trim())) continue;
    out[path] = path === "site.theme" ? value.trim() : value;
  }
  return out;
}

/**
 * applyOverrides plus optional groups: create declared optional objects and
 * fields the fallback lacks, apply, then remove anything left incomplete.
 */
export function applySiteOverrides<C extends Plain>(
  fallback: C,
  overrides: Record<string, string>,
  optional: OptionalGroup[],
): C {
  const clean = sanitizeOverrides(overrides);
  const draft = structuredClone(fallback) as Plain;
  const created: Array<{ keys: string[]; required: string[] }> = [];
  const createdFields: string[][] = [];

  for (const group of optional) {
    const touched = group.fields.filter((field) => hasValue(clean[`${group.path}.${field}`]));
    if (touched.length === 0) continue;

    const keys = group.path.split(".");
    let node: Plain = draft;
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (node[key] === undefined) {
        node[key] = {};
        created.push({ keys: keys.slice(0, i + 1), required: i === keys.length - 1 ? group.required ?? [] : [] });
      }
      const next = node[key];
      if (!isPlain(next)) break;
      node = next;
    }
    if (getPath(draft, keys) !== node) continue;

    for (const field of group.fields) {
      if (!(field in node)) {
        node[field] = group.arrays?.includes(field) ? [] : "";
        createdFields.push([...keys, field]);
      }
    }
  }

  const merged = applyOverrides(draft, clean);

  // Fields we invented but the sheet left blank go away again.
  for (const keys of createdFields) {
    const parent = getPath(merged, keys.slice(0, -1));
    const leaf = keys[keys.length - 1];
    const value = isPlain(parent) ? parent[leaf] : undefined;
    if (isPlain(parent) && (value === "" || (Array.isArray(value) && value.length === 0))) delete parent[leaf];
  }

  // Objects we invented that are still incomplete or empty go away, deepest first.
  for (const { keys, required } of [...created].reverse()) {
    const parent = getPath(merged, keys.slice(0, -1));
    const leaf = keys[keys.length - 1];
    if (!isPlain(parent)) continue;
    const node = parent[leaf];
    const incomplete =
      !isPlain(node) ||
      Object.keys(node).length === 0 ||
      required.some((field) => typeof node[field] !== "string" || (node[field] as string).trim() === "");
    if (incomplete) delete parent[leaf];
  }

  return merged as C;
}

export type KitResolution<C> = {
  content: C;
  diagnostics: Record<string, string>;
  /** The raw site tab, for kits that read extra keys from it. */
  siteValues: Record<string, string>;
  sources: LoadedSources;
};

/**
 *   local fallback → site tab overrides → each list tab → resolved content
 *
 * Every tab fails on its own: a broken or unpublished tab leaves that part of
 * the fallback untouched, and the rest of the site still updates.
 */
export async function resolveKitSheets<C extends Plain>(
  fallback: C,
  config: MultiSheetConfig | undefined,
  spec: KitSheetSpec<C>,
): Promise<KitResolution<C>> {
  const sources = await loadAllSources(config);
  const diagnostics: Record<string, string> = {};

  for (const [name, result] of Object.entries(sources)) {
    if (result && result.status !== "ok") {
      diagnostics[name] = result.error ? `${result.status}: ${result.error}` : result.status;
    }
  }

  const siteValues = keyValueRows(sources.site);
  let content = applySiteOverrides(fallback, siteValues, spec.optional);
  for (const tab of spec.tabs) content = tab.apply(content, sources[tab.source]);

  return { content, diagnostics, siteValues, sources };
}

/* ---- export: content → sheet template ---- */

/** Every single-valued field of the content as key/value rows, plus blank optional ones. */
export function siteRows<C extends Plain>(content: C, spec: KitSheetSpec<C>): Row[] {
  const owned = new Set(spec.tabs.map((tab) => tab.owns));
  const out = new Map<string, string>();

  const walk = (value: unknown, path: string[]) => {
    const key = path.join(".");
    if (path.length > 0 && (isLocked(key) || (path.length === 1 && owned.has(path[0])))) return;
    if (Array.isArray(value)) {
      if (value.every((item) => typeof item === "string")) out.set(key, cell(value));
      return;
    }
    if (isPlain(value)) {
      for (const [child, next] of Object.entries(value)) walk(next, [...path, child]);
      return;
    }
    if (value !== undefined && value !== null && path.length > 1) out.set(key, cell(value));
  };
  walk(content, []);

  for (const group of spec.optional) {
    for (const field of group.fields) {
      const key = `${group.path}.${field}`;
      if (!out.has(key) && !isLocked(key)) out.set(key, "");
    }
  }

  // Keep sections together in content order: site, hero, about, …
  const order = [...Object.keys(content), ...spec.optional.map((group) => group.path.split(".")[0])];
  const rank = (key: string) => {
    const index = order.indexOf(key.split(".")[0]);
    return index === -1 ? order.length : index;
  };
  const rowsOut = [...out.entries()]
    .map(([key, value], index) => ({ key, value, index }))
    .sort((a, b) => rank(a.key) - rank(b.key) || a.index - b.index)
    .map(({ key, value }) => ({ key, value }));

  return [...(spec.extraSiteRows?.(content) ?? []), ...rowsOut];
}

function csvField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toCsv(columns: string[], data: Row[]): string {
  const lines = [columns.map(csvField).join(",")];
  for (const row of data) lines.push(columns.map((column) => csvField(row[column] ?? "")).join(","));
  return `${lines.join("\n")}\n`;
}

/** The full set of template CSVs for one customer, pre-filled with their content. */
export function sheetTemplate<C extends Plain>(content: C, spec: KitSheetSpec<C>): Array<{ file: string; source: string; csv: string }> {
  return [
    { file: "1_site.csv", source: "site", csv: toCsv(["key", "value"], siteRows(content, spec)) },
    ...spec.tabs.map((tab) => ({ file: tab.file, source: tab.source, csv: toCsv(tab.columns, tab.toRows(content)) })),
  ];
}
