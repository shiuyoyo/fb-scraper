#!/usr/bin/env node
/**
 * Scaffold a new customer.
 *
 *   pnpm new:customer <slug> <kit> [template]
 *
 * Validates against the product matrix: a planned-but-unbuilt template is
 * refused (not scaffolded and left broken), and an invalid kit/template pair
 * lists the valid options. Nothing is written unless everything checks out.
 */
import { cpSync, existsSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { customersDir, fail, kits, listCustomers } from "./lib.mjs";
import { templateMatrix } from "../packages/content-schema/src/index.ts";

// Which templates are actually implemented. Mirrors the registry; kept here so
// the scaffold has no runtime dependency on the React package.
const available = {
  business: ["classic"],
  restaurant: ["classic"],
  event: ["classic"],
  education: ["classic"],
  portfolio: ["classic"],
};

const slug = process.argv[2];
const kitName = process.argv[3];
const templateName = process.argv[4] ?? "classic";

if (!slug || !kitName) {
  fail("Usage: pnpm new:customer <slug> <kit> [template]\n\nKits: " + Object.keys(templateMatrix).join(", "));
}
if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) fail(`"${slug}" must be lowercase letters, digits and hyphens.`);
if (!templateMatrix[kitName]) {
  fail(`Unknown kit "${kitName}". Valid kits: ${Object.keys(templateMatrix).join(", ")}`);
}
if (!templateMatrix[kitName].includes(templateName)) {
  fail(
    `"${templateName}" is not a template of the ${kitName} kit.\n` +
      `Valid templates: ${templateMatrix[kitName].join(", ")}`,
  );
}
if (!available[kitName]?.includes(templateName)) {
  fail(
    `${kitName}/${templateName} is planned but not built yet (RFC-002).\n` +
      `Available now: ${available[kitName].map((t) => `${kitName}/${t}`).join(", ") || "(none)"}`,
  );
}
if (!kits[kitName]) {
  fail(`${kitName} has no demo app wired yet. Available kits: ${Object.keys(kits).join(", ")}`);
}
if (existsSync(join(customersDir, slug))) fail(`customers/${slug} already exists.`);

cpSync(join(customersDir, "_template"), join(customersDir, slug), { recursive: true });

// Keep only the content skeleton for the chosen kit.
for (const name of Object.keys(templateMatrix)) {
  const file = join(customersDir, slug, `content.${name}.ts`);
  if (name === kitName) {
    if (existsSync(file)) renameSync(file, join(customersDir, slug, "content.ts"));
  } else {
    rmSync(file, { force: true });
  }
}

const siteFile = join(customersDir, slug, "site.json");
const site = JSON.parse(readFileSync(siteFile, "utf8"));
writeFileSync(
  siteFile,
  JSON.stringify(
    { slug, kit: kitName, template: templateName, displayName: "", domain: "", cloudflareProject: "" },
    null,
    2,
  ) + "\n",
);

const contentFile = join(customersDir, slug, "content.ts");
writeFileSync(
  contentFile,
  readFileSync(contentFile, "utf8").replace(/template: "classic"/, `template: "${templateName}"`),
);

console.log(`✓ customers/${slug} created (${kitName}/${templateName})`);
console.log(`  1. edit customers/${slug}/content.ts`);
console.log(`  2. drop photos into customers/${slug}/images-source/, then pnpm images ${slug}`);
console.log(`  3. pnpm dev:customer ${slug}`);
console.log(`\n  Customers so far: ${listCustomers().join(", ")}`);
