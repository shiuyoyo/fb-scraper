import type { ImageRef, LinkItem } from "@evalycloud/content-schema";
import type { SheetResult } from "./sheet.ts";

/**
 * Small, pure helpers every kit mapper shares. Each one tolerates the mess a
 * hand-edited spreadsheet produces: stray spaces, blank cells, "TRUE"/"1"/"yes".
 */

export type Row = Record<string, string>;

export function rows(result: SheetResult | undefined): Row[] {
  if (!result || result.status !== "ok") return [];
  return (result.rows as Array<Record<string, string | number>>).map((row) =>
    Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value)])),
  );
}

export function bool(value: string | undefined): boolean {
  const v = (value ?? "").trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "y";
}

export function num(value: string | undefined): number | undefined {
  const raw = (value ?? "").trim();
  if (raw === "") return undefined;
  const parsed = Number(raw.replace(/[,\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Trimmed text, or undefined for a blank cell. */
export function text(value: string | undefined): string | undefined {
  const v = (value ?? "").trim();
  return v === "" ? undefined : v;
}

/** "招牌|人氣" → ["招牌", "人氣"]; blank → undefined. */
export function pipe(value: string | undefined): string[] | undefined {
  const list = (value ?? "")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
  return list.length > 0 ? list : undefined;
}

/** A row is shown unless its `enabled` cell says otherwise. Blank = shown. */
export function enabled(row: Row): boolean {
  return (row.enabled ?? "").trim() === "" || bool(row.enabled);
}

export function image(src: string | undefined, alt: string | undefined): ImageRef | undefined {
  const s = text(src);
  return s ? { src: s, alt: text(alt) ?? "" } : undefined;
}

export function link(label: string | undefined, href: string | undefined): LinkItem | undefined {
  const l = text(label);
  const h = text(href);
  return l && h ? { label: l, href: h } : undefined;
}

export function bySort<T extends { sort?: number }>(a: T, b: T): number {
  return (a.sort ?? Number.MAX_SAFE_INTEGER) - (b.sort ?? Number.MAX_SAFE_INTEGER);
}

/** Drop undefined fields so mapped rows match hand-written content exactly. */
export function compact<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;
}

/**
 * Sort by an optional `sort_order` column, then drop it. Used for lists whose
 * schema has no `sort` field: the column only reorders, it never leaks.
 * Array.prototype.sort is stable, so rows without a number keep sheet order.
 */
export function ordered<T>(list: Array<{ value: T; sort?: number }>): T[] {
  return list.sort(bySort).map((entry) => entry.value);
}

export function orNone<T>(list: T[]): T[] | undefined {
  return list.length > 0 ? list : undefined;
}

/* ---- list mappers shared by several kits ---- */

/** faq — question, answer, enabled, sort_order */
export function mapFaq(result: SheetResult | undefined): Array<{ question: string; answer: string }> | undefined {
  const list = rows(result)
    .filter((row) => text(row.question) && text(row.answer) && enabled(row))
    .map((row) => ({ value: { question: row.question.trim(), answer: row.answer.trim() }, sort: num(row.sort_order) }));
  return orNone(ordered(list));
}

/** gallery — src, alt, enabled, sort_order */
export function mapGallery(result: SheetResult | undefined): ImageRef[] | undefined {
  const list = rows(result)
    .filter(enabled)
    .map((row) => ({ value: image(row.src, row.alt), sort: num(row.sort_order) }))
    .filter((entry): entry is { value: ImageRef; sort: number | undefined } => entry.value !== undefined);
  return orNone(ordered(list));
}

/** services / features — title, description, enabled, sort_order */
export function mapTitled(result: SheetResult | undefined): Array<{ title: string; description: string }> | undefined {
  const list = rows(result)
    .filter((row) => text(row.title) && enabled(row))
    .map((row) => ({
      value: { title: row.title.trim(), description: (row.description ?? "").trim() },
      sort: num(row.sort_order),
    }));
  return orNone(ordered(list));
}

/* ---- the reverse direction: content → sheet rows (for sheet templates) ---- */

export function cell(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.join("|");
  return String(value);
}

export const faqColumns = ["question", "answer", "enabled", "sort_order"];
export function faqRows(list: Array<{ question: string; answer: string }> | undefined): Row[] {
  return (list ?? []).map((item, index) => ({
    question: item.question,
    answer: item.answer,
    enabled: "true",
    sort_order: String((index + 1) * 10),
  }));
}

export const galleryColumns = ["src", "alt", "enabled", "sort_order"];
export function galleryRows(list: ImageRef[] | undefined): Row[] {
  return (list ?? []).map((item, index) => ({
    src: item.src,
    alt: item.alt,
    enabled: "true",
    sort_order: String((index + 1) * 10),
  }));
}

export const titledColumns = ["title", "description", "enabled", "sort_order"];
export function titledRows(list: Array<{ title: string; description: string }> | undefined): Row[] {
  return (list ?? []).map((item, index) => ({
    title: item.title,
    description: item.description,
    enabled: "true",
    sort_order: String((index + 1) * 10),
  }));
}
