import type {
  MenuCategory,
  MenuItem,
  OpeningHoursDay,
  RestaurantSiteContent,
} from "@evalycloud/content-schema";
import { applyOverrides, mergeList } from "./merge.ts";
import { keyValueRows, loadAllSources, type MultiSheetConfig } from "./sources.ts";
import type { SheetResult } from "./sheet.ts";

/**
 * Restaurant content resolver.
 *
 * Takes the local fallback plus a customer's sheet config, fetches every
 * source, maps each into the restaurant shape, and merges. A broken or absent
 * source falls back to the corresponding part of local content. Returns
 * content that is always renderable — the caller never has to null-check.
 */
export async function resolveRestaurantContent(
  fallback: RestaurantSiteContent,
  config?: MultiSheetConfig,
): Promise<{ content: RestaurantSiteContent; diagnostics: Record<string, string> }> {
  const diagnostics: Record<string, string> = {};
  const sources = await loadAllSources(config);

  for (const [name, result] of Object.entries(sources)) {
    if (result && result.status !== "ok") {
      diagnostics[name] = result.error ? `${result.status}: ${result.error}` : result.status;
    }
  }

  // site: key/value overrides onto the nested content.
  const overrides = keyValueRows(sources.site);
  let content = applyOverrides(fallback, overrides);

  // menu: full replacement when the sheet yields valid categories.
  const menu = mapMenu(sources.menu);
  content = { ...content, menu: mergeList(content.menu, menu) };

  // featured: a flat list of highlighted dishes, same columns as a menu row.
  const featured = mapFeatured(sources.featured);
  content = { ...content, featured: mergeList(content.featured ?? [], featured) };

  // opening hours, faq, promotions: independent list merges.
  const hours = mapOpeningHours(sources.openingHours);
  if (hours) content = { ...content, openingHours: mergeList(content.openingHours ?? [], hours) };

  const faq = mapFaq(sources.faq);
  content = { ...content, faq: mergeList(content.faq ?? [], faq) };

  const promotions = mapPromotions(sources.announcements);
  content = { ...content, promotions: mergeList(content.promotions ?? [], promotions) };

  return { content, diagnostics };
}

function rows(result: SheetResult | undefined): Array<Record<string, string>> {
  if (!result || result.status !== "ok") return [];
  return result.rows as Array<Record<string, string>>;
}

function bool(value: string | undefined): boolean {
  const v = (value ?? "").trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "y";
}

function num(value: string | undefined): number | undefined {
  const raw = (value ?? "").trim();
  if (raw === "") return undefined;
  const parsed = Number(raw.replace(/[,\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function bySort<T extends { sort?: number }>(a: T, b: T): number {
  return (a.sort ?? Number.MAX_SAFE_INTEGER) - (b.sort ?? Number.MAX_SAFE_INTEGER);
}

/**
 * Menu is one flat sheet: each row is an item, category fields repeat. Rows
 * without an item_id or item_name are dropped (they carry no dish), so a
 * malformed row removes only itself.
 */
export function mapMenu(result: SheetResult | undefined): MenuCategory[] | undefined {
  const data = rows(result);
  if (data.length === 0) return undefined;

  const categories = new Map<string, MenuCategory>();

  for (const row of data) {
    const categoryId = (row.category_id ?? "").trim();
    const itemId = (row.item_id ?? "").trim();
    const itemName = (row.item_name ?? "").trim();
    if (!categoryId || !itemId || !itemName) continue;

    if (!categories.has(categoryId)) {
      categories.set(categoryId, {
        id: categoryId,
        name: (row.category_name ?? categoryId).trim(),
        description: (row.category_description ?? "").trim() || undefined,
        sort: num(row.category_sort),
        items: [],
      });
    }

    const item: MenuItem = {
      id: itemId,
      name: itemName,
      description: (row.item_description ?? "").trim() || undefined,
      price: num(row.price),
      priceLabel: (row.price_label ?? "").trim() || undefined,
      currency: (row.currency ?? "").trim() || undefined,
      tags: (row.tags ?? "")
        .split("|")
        .map((t) => t.trim())
        .filter(Boolean),
      featured: bool(row.featured),
      isNew: bool(row.new_item),
      soldOut: bool(row.sold_out),
      sort: num(row.item_sort),
    };
    if (item.tags && item.tags.length === 0) delete item.tags;

    categories.get(categoryId)!.items.push(item);
  }

  const list = [...categories.values()].sort(bySort);
  for (const category of list) category.items.sort(bySort);
  return list.length > 0 ? list : undefined;
}

/**
 * 人氣料理 — a flat sheet of items with no category column. Rows missing an id
 * or a name are dropped so one bad row can't empty the section.
 */
export function mapFeatured(result: SheetResult | undefined): MenuItem[] | undefined {
  const data = rows(result);
  if (data.length === 0) return undefined;

  const items: MenuItem[] = [];
  for (const row of data) {
    const id = (row.item_id ?? "").trim();
    const name = (row.item_name ?? "").trim();
    if (!id || !name) continue;

    const item: MenuItem = {
      id,
      name,
      description: (row.item_description ?? "").trim() || undefined,
      price: num(row.price),
      priceLabel: (row.price_label ?? "").trim() || undefined,
      currency: (row.currency ?? "").trim() || undefined,
      tags: (row.tags ?? "").split("|").map((tag) => tag.trim()).filter(Boolean),
      soldOut: bool(row.sold_out),
      featured: true,
      sort: num(row.item_sort),
    };
    if (item.tags && item.tags.length === 0) delete item.tags;
    items.push(item);
  }

  return items.length > 0 ? items.sort(bySort) : undefined;
}

export function mapOpeningHours(result: SheetResult | undefined): OpeningHoursDay[] | undefined {
  const data = rows(result);
  if (data.length === 0) return undefined;

  const valid = new Set(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]);
  const list: OpeningHoursDay[] = [];

  for (const row of data) {
    const day = (row.day ?? "").trim().toLowerCase();
    if (!valid.has(day)) continue;
    list.push({
      day: day as OpeningHoursDay["day"],
      closed: bool(row.closed),
      open1: (row.open_1 ?? "").trim() || undefined,
      close1: (row.close_1 ?? "").trim() || undefined,
      open2: (row.open_2 ?? "").trim() || undefined,
      close2: (row.close_2 ?? "").trim() || undefined,
      note: (row.note ?? "").trim() || undefined,
      sort: num(row.sort_order),
    });
  }

  return list.length > 0 ? list.sort(bySort) : undefined;
}

export function mapFaq(result: SheetResult | undefined) {
  const data = rows(result);
  if (data.length === 0) return undefined;

  const list = data
    .filter((row) => (row.question ?? "").trim() && (row.answer ?? "").trim() && bool(row.enabled ?? "true"))
    .map((row) => ({
      question: row.question.trim(),
      answer: row.answer.trim(),
      sort: num(row.sort_order),
    }))
    .sort(bySort);

  return list.length > 0 ? list.map(({ question, answer }) => ({ question, answer })) : undefined;
}

export function mapPromotions(result: SheetResult | undefined) {
  const data = rows(result);
  if (data.length === 0) return undefined;

  const list = data
    .filter((row) => (row.title ?? "").trim() && bool(row.enabled ?? "true"))
    .map((row) => ({
      id: (row.id ?? row.title).trim(),
      title: row.title.trim(),
      body: (row.body ?? "").trim(),
      sort: num(row.sort_order),
    }))
    .sort(bySort);

  return list.length > 0 ? list : undefined;
}
