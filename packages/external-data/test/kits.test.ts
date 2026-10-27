import assert from "node:assert/strict";
import { test } from "node:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { KitName, MultiSheetConfig } from "@evalycloud/content-schema";
import { customerSheetTemplate, resolveCustomerContent } from "../src/resolve.ts";
import { applySiteOverrides, LOCKED_PATHS } from "../src/kit-sheets.ts";
import { resolveEventContent } from "../src/event.ts";
import { resolveEducationContent } from "../src/education.ts";
import { loadSheet } from "../src/sheet.ts";

const customersDir = new URL("../../../customers/", import.meta.url).pathname;

function stubFetch(byUrl: Record<string, string | number>) {
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL) => {
    const body = byUrl[String(input)];
    if (body === undefined) return new Response("not found", { status: 404 });
    if (typeof body === "number") return new Response("error", { status: body });
    return new Response(body, { status: 200, headers: { "content-type": "text/csv" } });
  }) as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

function wire(names: string[]): MultiSheetConfig {
  return {
    enabled: true,
    sources: Object.fromEntries(names.map((name) => [name, { enabled: true, csvUrl: `https://sheet.test/${name}` }])),
  };
}

/** Replace every string and number in the content with a placeholder, keeping its shape. */
function blankOut(value: unknown, path: string[] = []): unknown {
  const key = path.join(".");
  if (LOCKED_PATHS.some((locked) => key === locked || key.startsWith(`${locked}.`))) return value;
  if (key === "site.theme") return value;
  if (Array.isArray(value)) return value.map((item, index) => blankOut(item, [...path, String(index)]));
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, blankOut(v, [...path, k])]));
  }
  if (typeof value === "string") return "～";
  if (typeof value === "number") return -1;
  return value;
}

/** Ignore representation-only differences: missing vs undefined, false, or []. */
function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === "object" && value !== null) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined || v === false || (Array.isArray(v) && v.length === 0)) continue;
      out[k] = normalize(v);
    }
    return out;
  }
  return value;
}

const demos = readdirSync(customersDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
  .map((entry) => entry.name);

for (const slug of demos) {
  test(`${slug}: every field on the page can be set from the sheet`, async () => {
    const kit = JSON.parse(readFileSync(join(customersDir, slug, "site.json"), "utf8")).kit as KitName;
    const original = (await import(join(customersDir, slug, "content.ts"))).default;

    const files = customerSheetTemplate(kit, original);
    const restore = stubFetch(Object.fromEntries(files.map((f) => [`https://sheet.test/${f.source}`, f.csv])));
    try {
      const fallback = { ...(blankOut(original) as typeof original) };
      fallback.site = { ...fallback.site, sheets: wire(files.map((f) => f.source)) };
      delete fallback.site.sheet;

      const { content, diagnostics } = await resolveCustomerContent(kit, fallback);
      // An empty list in the content exports as a header-only tab, which reads as "empty".
      assert.deepEqual(Object.values(diagnostics).filter((note) => note !== "empty"), []);

      const expected = { ...original, site: { ...original.site, sheets: fallback.site.sheets } };
      delete expected.site.sheet;
      assert.deepEqual(normalize(content), normalize(expected));
    } finally {
      restore();
    }
  });
}

/* ---- site tab ---- */

test("a sheet can fill an optional image the fallback did not have", () => {
  const out = applySiteOverrides(
    { hero: { name: "x" } },
    { "hero.image.src": "/images/hero.webp", "hero.image.alt": "店門口" },
    [{ path: "hero.image", fields: ["src", "alt"], required: ["src"] }],
  );
  assert.deepEqual(out, { hero: { name: "x", image: { src: "/images/hero.webp", alt: "店門口" } } });
});

test("a half-filled optional button is dropped, not rendered broken", () => {
  const out = applySiteOverrides(
    { hero: { name: "x" } },
    { "hero.secondaryCta.label": "看作品", "hero.secondaryCta.href": "" },
    [{ path: "hero.secondaryCta", fields: ["label", "href"], required: ["label", "href"] }],
  );
  assert.deepEqual(out, { hero: { name: "x" } });
});

test("untouched optional fields are not invented", () => {
  const out = applySiteOverrides({ hero: { name: "x" } }, {}, [{ path: "hero", fields: ["tagline"] }]);
  assert.deepEqual(out, { hero: { name: "x" } });
});

test("transport notes can be added as a | list", () => {
  const out = applySiteOverrides(
    { venue: { address: "a" } },
    { "venue.transportNotes": "捷運 2 號出口|有停車場" },
    [{ path: "venue", fields: ["transportNotes"], arrays: ["transportNotes"] }],
  );
  assert.deepEqual(out.venue, { address: "a", transportNotes: ["捷運 2 號出口", "有停車場"] });
});

test("template, wiring, language and event status are locked; unknown palettes are ignored", () => {
  const fallback = {
    site: { name: "a", language: "zh-TW", template: "classic", status: "closed", theme: "ocean", sheets: { enabled: true } },
  };
  const out = applySiteOverrides(
    fallback,
    {
      "site.template": "visual",
      "site.language": "en",
      "site.status": "open",
      "site.sheets.enabled": "false",
      "site.theme": "neon",
      "site.name": "b",
    },
    [],
  );
  assert.deepEqual(out.site, { ...fallback.site, name: "b" });
  assert.equal(applySiteOverrides(fallback, { "site.theme": "plum" }, []).site.theme, "plum");
});

/* ---- failure isolation ---- */

test("a broken tab keeps its fallback while other tabs still apply", async () => {
  const fallback = (await import(join(customersDir, "demo-academy", "content.ts"))).default;
  const restore = stubFetch({
    "https://sheet.test/site": "key,value\nhero.tagline,新標語\n",
    "https://sheet.test/courses": 500,
  });
  try {
    const { content, diagnostics } = await resolveEducationContent(fallback, wire(["site", "courses"]));
    assert.equal(content.hero.tagline, "新標語");
    assert.deepEqual(content.courses, fallback.courses);
    assert.match(diagnostics.courses, /HTTP 500/);
  } finally {
    restore();
  }
});

/* ---- event live values ---- */

test("event live values come from the site tab and never rewrite site.status", async () => {
  const fallback = (await import(join(customersDir, "demo-event", "content.ts"))).default;
  const restore = stubFetch({
    "https://sheet.test/site": "key,value\nstatus,closed\nnotice,因雨延期\nregistered,\"1,280\"\ncapacity,1500\nsite.status,archived\n",
  });
  try {
    const { content, live } = await resolveEventContent(fallback, wire(["site"]));
    assert.equal(content.site.status, fallback.site.status);
    assert.deepEqual(live, { status: "closed", notice: "因雨延期", registered: 1280, capacity: 1500, sourceStatus: "ok" });
  } finally {
    restore();
  }
});

/* ---- loader ---- */

test("omitting mapping uses the sheet headers as-is", async () => {
  const restore = stubFetch({ "https://sheet.test/faq": "question,answer,extra\nQ,A,x\n" });
  try {
    const result = await loadSheet({ enabled: true, csvUrl: "https://sheet.test/faq" });
    assert.deepEqual(result.rows, [{ question: "Q", answer: "A", extra: "x" }]);
  } finally {
    restore();
  }
});
