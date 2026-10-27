#!/usr/bin/env node
/**
 * Export a customer's Google Sheet template, pre-filled with their content.
 *
 *   pnpm sheet:template <slug>
 *
 * Writes customers/<slug>/sheet-template/*.csv — one file per tab. Import each
 * into its own tab of one Google Sheet (File → Import → Upload → Insert new
 * sheet), publish each tab as CSV, and paste the links into content.ts.
 *
 * Every field the customer can edit appears here, so the sheet starts as an
 * exact copy of the site: nothing changes until they edit a cell.
 */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { customersDir, repoRoot, resolveCustomer } from "./lib.mjs";

const slug = process.argv[2] ?? process.env.CUSTOMER;
const { site } = resolveCustomer(slug);

const content = (await import(pathToFileURL(join(customersDir, slug, "content.ts")).href)).default;
const { customerSheetTemplate } = await import(
  pathToFileURL(join(repoRoot, "packages/external-data/src/index.ts")).href
);

const outDir = join(customersDir, slug, "sheet-template");
mkdirSync(outDir, { recursive: true });
// Replace old CSVs so a renamed tab never leaves a stale file behind; keep README etc.
for (const file of readdirSync(outDir)) {
  if (file.endsWith(".csv")) rmSync(join(outDir, file));
}

for (const { file, source, csv } of customerSheetTemplate(site.kit, content)) {
  // BOM so Excel and Google Sheets both read the Chinese text as UTF-8.
  writeFileSync(join(outDir, file), `﻿${csv}`);
  console.log(`✓ ${file.padEnd(22)} → sources.${source}`);
}
console.log(`\ncustomers/${slug}/sheet-template/ (${site.kit})`);
