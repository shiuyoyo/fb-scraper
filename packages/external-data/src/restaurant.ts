import type {
  MenuCategory,
  MenuItem,
  OpeningHoursDay,
  RestaurantSiteContent,
} from "@evalycloud/content-schema";
import { mergeList } from "./merge.ts";
import type { MultiSheetConfig } from "./sources.ts";
import type { SheetResult } from "./sheet.ts";
import {
  bool,
  bySort,
  cell,
  faqColumns,
  faqRows,
  galleryColumns,
  galleryRows,
  image,
  mapFaq,
  mapGallery,
  num,
  rows,
  type Row,
} from "./common.ts";
import { imageFields, linkFields, resolveKitSheets, sharedOptional, type KitSheetSpec } from "./kit-sheets.ts";

export { mapFaq };

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
      image: image(row.image_src, row.image_alt),
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
    if (!item.image) delete item.image;

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
      image: image(row.image_src, row.image_alt),
      tags: (row.tags ?? "").split("|").map((tag) => tag.trim()).filter(Boolean),
      soldOut: bool(row.sold_out),
      featured: true,
      sort: num(row.item_sort),
    };
    if (item.tags && item.tags.length === 0) delete item.tags;
    if (!item.image) delete item.image;
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

export function mapPromotions(result: SheetResult | undefined) {
  const data = rows(result);
  if (data.length === 0) return undefined;

  const list = data
    .filter((row) => (row.title ?? "").trim() && bool(row.enabled ?? "true"))
    .map((row) => ({
      id: (row.id ?? row.title).trim(),
      title: row.title.trim(),
      body: (row.body ?? "").trim(),
      enabled: true,
      sort: num(row.sort_order),
    }))
    .sort(bySort);

  return list.length > 0 ? list : undefined;
}

/* ---- content → sheet rows ---- */

const itemColumns = [
  "item_id",
  "item_name",
  "item_description",
  "price",
  "price_label",
  "currency",
  "image_src",
  "image_alt",
  "tags",
];

export const menuColumns = [
  "category_id",
  "category_name",
  "category_description",
  "category_sort",
  ...itemColumns,
  "featured",
  "new_item",
  "sold_out",
  "item_sort",
];

export const featuredColumns = [...itemColumns, "sold_out", "item_sort"];

function itemCells(item: MenuItem): Row {
  return {
    item_id: item.id,
    item_name: item.name,
    item_description: cell(item.description),
    price: cell(item.price),
    price_label: cell(item.priceLabel),
    currency: cell(item.currency),
    image_src: cell(item.image?.src),
    image_alt: cell(item.image?.alt),
    tags: cell(item.tags),
    sold_out: item.soldOut ? "true" : "false",
    item_sort: cell(item.sort),
  };
}

function menuRows(menu: MenuCategory[]): Row[] {
  return menu.flatMap((category) =>
    category.items.map((item) => ({
      category_id: category.id,
      category_name: category.name,
      category_description: cell(category.description),
      category_sort: cell(category.sort),
      ...itemCells(item),
      featured: item.featured ? "true" : "false",
      new_item: item.isNew ? "true" : "false",
    })),
  );
}

export const openingHoursColumns = ["day", "closed", "open_1", "close_1", "open_2", "close_2", "note", "sort_order"];

function openingHoursRows(list: OpeningHoursDay[] | undefined): Row[] {
  return (list ?? []).map((day) => ({
    day: day.day,
    closed: day.closed ? "true" : "false",
    open_1: cell(day.open1),
    close_1: cell(day.close1),
    open_2: cell(day.open2),
    close_2: cell(day.close2),
    note: cell(day.note),
    sort_order: cell(day.sort),
  }));
}

export const promotionColumns = ["id", "title", "body", "enabled", "sort_order"];

function promotionRows(list: RestaurantSiteContent["promotions"]): Row[] {
  return (list ?? []).map((promo) => ({
    id: promo.id,
    title: promo.title,
    body: promo.body,
    enabled: promo.enabled === false ? "false" : "true",
    sort_order: cell(promo.sort),
  }));
}

export const restaurantSheetSpec: KitSheetSpec<RestaurantSiteContent> = {
  optional: [
    ...sharedOptional,
    { path: "site", fields: ["currency"] },
    { path: "hero", fields: ["subtitle", "tagline", "intro", "areaLabel", "hoursSummary"] },
    { path: "hero.image", ...imageFields },
    { path: "hero.menuCta", ...linkFields },
    { path: "hero.reservationCta", ...linkFields },
    { path: "about", fields: ["title", "description"], required: ["title"] },
    { path: "venue", fields: ["name", "mapUrl", "transportNotes"], arrays: ["transportNotes"] },
    { path: "reservation", fields: ["intro", "phone", "lineUrl", "formUrl", "platformUrl", "platformLabel"] },
    {
      path: "labels",
      fields: ["about", "featured", "menu", "promotions", "hours", "location", "reservation", "gallery", "faq"],
    },
  ],
  tabs: [
    {
      source: "featured",
      file: "2_featured.csv",
      owns: "featured",
      columns: featuredColumns,
      toRows: (content) => (content.featured ?? []).map(itemCells),
      apply: (content, result) => ({ ...content, featured: mergeList(content.featured ?? [], mapFeatured(result)) }),
    },
    {
      source: "menu",
      file: "3_menu.csv",
      owns: "menu",
      columns: menuColumns,
      toRows: (content) => menuRows(content.menu),
      apply: (content, result) => ({ ...content, menu: mergeList(content.menu, mapMenu(result)) }),
    },
    {
      source: "openingHours",
      file: "4_opening_hours.csv",
      owns: "openingHours",
      columns: openingHoursColumns,
      toRows: (content) => openingHoursRows(content.openingHours),
      apply: (content, result) => {
        const hours = mapOpeningHours(result);
        return hours ? { ...content, openingHours: mergeList(content.openingHours ?? [], hours) } : content;
      },
    },
    {
      source: "announcements",
      file: "5_announcements.csv",
      owns: "promotions",
      columns: promotionColumns,
      toRows: (content) => promotionRows(content.promotions),
      apply: (content, result) => ({
        ...content,
        promotions: mergeList(content.promotions ?? [], mapPromotions(result)),
      }),
    },
    {
      source: "faq",
      file: "6_faq.csv",
      owns: "faq",
      columns: faqColumns,
      toRows: (content) => faqRows(content.faq),
      apply: (content, result) => ({ ...content, faq: mergeList(content.faq ?? [], mapFaq(result)) }),
    },
    {
      source: "gallery",
      file: "7_gallery.csv",
      owns: "gallery",
      columns: galleryColumns,
      toRows: (content) => galleryRows(content.gallery),
      apply: (content, result) => ({ ...content, gallery: mergeList(content.gallery ?? [], mapGallery(result)) }),
    },
  ],
};

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
  const { content, diagnostics } = await resolveKitSheets(fallback, config, restaurantSheetSpec);
  return { content, diagnostics };
}
