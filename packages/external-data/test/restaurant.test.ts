import assert from "node:assert/strict";
import { test } from "node:test";
import { applyOverrides, mergeList, EMPTY_SENTINEL } from "../src/merge.ts";
import { mapMenu, mapOpeningHours, mapFaq, mapPromotions } from "../src/restaurant.ts";
import { formatPrice } from "../src/price.ts";
import type { SheetResult } from "../src/sheet.ts";
import { templateMatrix } from "@evalycloud/content-schema";

const ok = (rows: Array<Record<string, string>>): SheetResult => ({ status: "ok", rows });

/* ---- merge ---- */

test("sheet value overrides the fallback", () => {
  const out = applyOverrides({ site: { name: "old" } }, { "site.name": "new" });
  assert.equal(out.site.name, "new");
});

test("a blank value leaves the fallback untouched", () => {
  const out = applyOverrides({ site: { name: "keep" } }, { "site.name": "  " });
  assert.equal(out.site.name, "keep");
});

test("EMPTY_SENTINEL clears a field on purpose", () => {
  const out = applyOverrides({ hero: { tagline: "old" } }, { "hero.tagline": EMPTY_SENTINEL });
  assert.equal(out.hero.tagline, "");
});

test("unknown paths are ignored, not injected", () => {
  const out = applyOverrides({ site: { name: "x" } }, { "site.bogus": "y", "totally.fake": "z" });
  assert.deepEqual(out, { site: { name: "x" } });
});

test("the fallback object is not mutated", () => {
  const fallback = { site: { name: "original" } };
  applyOverrides(fallback, { "site.name": "changed" });
  assert.equal(fallback.site.name, "original");
});

test("mergeList keeps the fallback when the sheet list is empty", () => {
  assert.deepEqual(mergeList([1, 2], []), [1, 2]);
  assert.deepEqual(mergeList([1, 2], undefined), [1, 2]);
  assert.deepEqual(mergeList([1, 2], [9]), [9]);
});

/* ---- restaurant mappers ---- */

test("menu groups items by category and sorts both levels", () => {
  const menu = mapMenu(
    ok([
      { category_id: "drink", category_name: "飲品", category_sort: "20", item_id: "d1", item_name: "茶", item_sort: "10" },
      { category_id: "main", category_name: "主餐", category_sort: "10", item_id: "m2", item_name: "B", item_sort: "20" },
      { category_id: "main", category_name: "主餐", category_sort: "10", item_id: "m1", item_name: "A", item_sort: "10" },
    ]),
  );
  assert.equal(menu?.[0].id, "main");
  assert.deepEqual(menu?.[0].items.map((i) => i.name), ["A", "B"]);
  assert.equal(menu?.[1].id, "drink");
});

test("a menu row without an item id is dropped, not fatal", () => {
  const menu = mapMenu(
    ok([
      { category_id: "main", category_name: "主餐", item_id: "", item_name: "無效" },
      { category_id: "main", category_name: "主餐", item_id: "m1", item_name: "有效" },
    ]),
  );
  assert.equal(menu?.[0].items.length, 1);
  assert.equal(menu?.[0].items[0].name, "有效");
});

test("時價 stays in priceLabel and never becomes a number", () => {
  const menu = mapMenu(
    ok([{ category_id: "m", category_name: "主餐", item_id: "1", item_name: "季節料理", price: "", price_label: "時價" }]),
  );
  const item = menu![0].items[0];
  assert.equal(item.price, undefined);
  assert.equal(item.priceLabel, "時價");
});

test("a thousands-separated price parses to a number", () => {
  const menu = mapMenu(
    ok([{ category_id: "m", category_name: "主餐", item_id: "1", item_name: "套餐", price: "1,280" }]),
  );
  assert.equal(menu![0].items[0].price, 1280);
});

test("boolean-ish fields and pipe tags parse", () => {
  const menu = mapMenu(
    ok([
      { category_id: "m", category_name: "主餐", item_id: "1", item_name: "X", sold_out: "true", featured: "1", tags: "招牌|人氣" },
    ]),
  );
  const item = menu![0].items[0];
  assert.equal(item.soldOut, true);
  assert.equal(item.featured, true);
  assert.deepEqual(item.tags, ["招牌", "人氣"]);
});

test("opening hours rejects an invalid day", () => {
  const hours = mapOpeningHours(
    ok([
      { day: "funday", closed: "false" },
      { day: "monday", closed: "true", note: "公休", sort_order: "10" },
    ]),
  );
  assert.equal(hours?.length, 1);
  assert.equal(hours?.[0].day, "monday");
});

test("faq drops disabled rows", () => {
  const faq = mapFaq(
    ok([
      { question: "Q1", answer: "A1", enabled: "true", sort_order: "10" },
      { question: "Q2", answer: "A2", enabled: "false", sort_order: "20" },
    ]),
  );
  assert.equal(faq?.length, 1);
  assert.equal(faq?.[0].question, "Q1");
});

test("promotions drop disabled rows and keep order", () => {
  const promos = mapPromotions(
    ok([
      { id: "p2", title: "T2", body: "B2", enabled: "true", sort_order: "20" },
      { id: "p1", title: "T1", body: "B1", enabled: "true", sort_order: "10" },
      { id: "p0", title: "off", body: "", enabled: "false", sort_order: "5" },
    ]),
  );
  assert.deepEqual(promos?.map((p) => p.id), ["p1", "p2"]);
});

/* ---- price formatting ---- */

test("formatPrice: number gets NT$ and grouping", () => {
  assert.equal(formatPrice({ id: "1", name: "x", price: 1280 }), "NT$1,280");
});
test("formatPrice: priceLabel wins over a number", () => {
  assert.equal(formatPrice({ id: "1", name: "x", price: 999, priceLabel: "時價" }), "時價");
});
test("formatPrice: neither yields empty string, never NaN", () => {
  assert.equal(formatPrice({ id: "1", name: "x" }), "");
});

/* ---- product matrix ---- */

test("the matrix is five kits of three templates", () => {
  const kits = Object.keys(templateMatrix);
  assert.equal(kits.length, 5);
  for (const kit of kits) {
    assert.equal(templateMatrix[kit as keyof typeof templateMatrix].length, 3);
  }
});
