#!/usr/bin/env node
/**
 * Turn a customer's raw photos into web-ready images.
 *
 *   pnpm images <slug>
 *
 *   customers/<slug>/images-source/   in   (gitignored, originals)
 *   customers/<slug>/images/          out  (committed, what the site serves)
 *
 * Sub-folder name decides the size limits: logo / hero / gallery / thumbnail.
 * Loose files at the top level are treated as gallery.
 *
 * Deliberately local-only. No uploads, no R2, no credentials.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { customersDir, fail, resolveCustomer } from "./lib.mjs";
import {
  categories,
  convertible,
  defaultCategory,
  formatBytes,
  passthrough,
  qualitySteps,
  skipReasons,
  specFor,
} from "./image-specs.mjs";

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  fail("sharp is not installed. Run: pnpm install");
}

const slug = process.argv[2] ?? process.env.CUSTOMER;
const { site } = resolveCustomer(slug);

const sourceDir = join(customersDir, slug, "images-source");
const outDir = join(customersDir, slug, "images");

/** Collect one level of sub-folders plus loose files at the top. */
function collect() {
  if (!existsSync(sourceDir)) return null;

  const found = [];
  for (const entry of readdirSync(sourceDir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;

    if (entry.isDirectory()) {
      const category = categories[entry.name] ? entry.name : defaultCategory;
      if (!categories[entry.name]) {
        console.warn(`  ! images-source/${entry.name}/ 不是已知分類，當作 ${defaultCategory} 處理`);
      }
      for (const file of readdirSync(join(sourceDir, entry.name), { withFileTypes: true })) {
        if (file.isFile() && !file.name.startsWith(".")) {
          found.push({ category, name: file.name, path: join(sourceDir, entry.name, file.name) });
        }
      }
    } else if (entry.isFile()) {
      found.push({ category: defaultCategory, name: entry.name, path: join(sourceDir, entry.name) });
    }
  }
  return found;
}

const files = collect();

// Safety: never clear the output when there is no source to rebuild it from.
if (files === null) {
  console.log(`\ncustomers/${slug}/images-source/ 不存在，沒有動任何檔案。`);
  console.log(`把原始照片放進去再執行一次。分類資料夾：${Object.keys(categories).join(" / ")}\n`);
  process.exit(0);
}
if (files.length === 0) {
  console.log(`\ncustomers/${slug}/images-source/ 是空的，沒有動任何檔案。\n`);
  process.exit(0);
}

const fallbackCounters = {};

/**
 * URLs are far easier to live with in ASCII, so non-Latin filenames get
 * replaced rather than percent-encoded. A name that keeps no letters at all
 * (e.g. "店面 照片#1.jpg") becomes gallery-1, not a bare "1".
 */
function safeName(name, category) {
  const stem = basename(name, extname(name))
    .normalize("NFKD")
    .replace(/[^\w-]+/g, "-")
    .replace(/_/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  if (!/[a-z]/.test(stem)) {
    fallbackCounters[category] = (fallbackCounters[category] ?? 0) + 1;
    return `${category}-${fallbackCounters[category]}`;
  }
  return stem;
}

const used = new Set();
function uniqueName(category, stem, ext) {
  let candidate = `${category}/${stem}${ext}`;
  let n = 2;
  while (used.has(candidate)) {
    candidate = `${category}/${stem}-${n}${ext}`;
    n += 1;
  }
  used.add(candidate);
  return candidate;
}

async function encode(input, spec) {
  const pipeline = sharp(input)
    // .rotate() with no argument applies the EXIF orientation, so this has to
    // happen before any resize or the dimensions get swapped.
    .rotate()
    .resize({
      width: spec.maxWidth,
      height: spec.maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    });

  let last = null;
  for (const quality of qualitySteps) {
    const buffer = await pipeline.clone().webp({ quality }).toBuffer();
    last = { buffer, quality };
    if (buffer.length <= spec.maxBytes) return { ...last, overBudget: false };
  }
  return { ...last, overBudget: true };
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

console.log(`\n${site.displayName || slug} — ${files.length} 個檔案\n`);

const written = [];
const skipped = [];
let totalIn = 0;
let totalOut = 0;

for (const file of files.sort((a, b) => a.path.localeCompare(b.path))) {
  const ext = extname(file.name).toLowerCase();
  const inputBytes = statSync(file.path).size;
  const spec = specFor(file.category);

  if (skipReasons[ext]) {
    skipped.push({ name: file.name, reason: skipReasons[ext] });
    continue;
  }

  if (passthrough.has(ext)) {
    const rel = uniqueName(file.category, safeName(file.name, file.category), ext);
    mkdirSync(join(outDir, file.category), { recursive: true });
    copyFileSync(file.path, join(outDir, rel));
    written.push({ rel, category: file.category, from: inputBytes, to: inputBytes, note: "原樣複製" });
    totalIn += inputBytes;
    totalOut += inputBytes;
    continue;
  }

  if (!convertible.has(ext)) {
    skipped.push({ name: file.name, reason: `不支援的副檔名 ${ext || "(無)"}` });
    continue;
  }

  try {
    const { buffer, quality, overBudget } = await encode(file.path, spec);
    const rel = uniqueName(file.category, safeName(file.name, file.category), ".webp");
    mkdirSync(join(outDir, file.category), { recursive: true });
    writeFileSync(join(outDir, rel), buffer);
    written.push({
      rel,
      category: file.category,
      from: inputBytes,
      to: buffer.length,
      note: overBudget ? `超過上限 ${formatBytes(spec.maxBytes)}，品質已降到 ${quality}` : `q${quality}`,
    });
    totalIn += inputBytes;
    totalOut += buffer.length;
  } catch (error) {
    skipped.push({ name: file.name, reason: `讀取失敗 — ${error.message}` });
  }
}

for (const item of written) {
  const shrink = item.from > 0 ? Math.round((1 - item.to / item.from) * 100) : 0;
  const warn = item.note.startsWith("超過") ? "  ⚠" : "";
  console.log(
    `  ${item.rel.padEnd(40)} ${formatBytes(item.from).padStart(8)} → ${formatBytes(item.to).padStart(8)}` +
      `  -${String(shrink).padStart(2)}%  ${item.note}${warn}`,
  );
}

if (skipped.length > 0) {
  console.log("\n  跳過：");
  for (const item of skipped) console.log(`  ✗ ${item.name}\n      ${item.reason}`);
}

if (written.length > 0) {
  const shrink = totalIn > 0 ? Math.round((1 - totalOut / totalIn) * 100) : 0;
  console.log(`\n  合計 ${formatBytes(totalIn)} → ${formatBytes(totalOut)}（-${shrink}%）`);

  const gallery = written.filter((item) => item.category === "gallery");
  if (gallery.length > 0) {
    console.log(`\n  貼進 customers/${slug}/content.ts：\n`);
    console.log("  gallery: [");
    for (const item of gallery) {
      console.log(`    { src: "/images/${item.rel}", alt: "" },`);
    }
    console.log("  ],");
    console.log("\n  alt 記得填，那是給看不見畫面的人和搜尋引擎看的。");
  }
}

console.log("");
