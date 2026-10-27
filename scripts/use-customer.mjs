#!/usr/bin/env node
/**
 * Point an app at one customer's content.
 *
 *   node scripts/use-customer.mjs <slug>
 *   node scripts/use-customer.mjs --ensure business   # only if nothing is set up yet
 *
 * Copies content.ts to the app as content.generated.ts and syncs the customer's
 * images into the app's public/images. The image folder is wiped first, so one
 * customer's photos can never survive into another customer's build.
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { customersDir, fail, kits, repoRoot, resolveCustomer } from "./lib.mjs";
import { resolveContentForBuild } from "./resolve-content.mjs";

const args = process.argv.slice(2);
const ensureMode = args[0] === "--ensure";
let slug = ensureMode ? null : args[0] ?? process.env.CUSTOMER;

if (ensureMode) {
  const kitName = args[1];
  const kit = kits[kitName];
  if (!kit) fail(`--ensure needs a kit name: ${Object.keys(kits).join(" | ")}`);
  const target = join(repoRoot, "apps", kit.app, "app", "content.generated.ts");
  if (existsSync(target)) process.exit(0);
  slug = process.env.CUSTOMER ?? kit.fallback;
}

const { site, kit } = resolveCustomer(slug);
const appDir = join(repoRoot, "apps", kit.app);

const source = join(customersDir, slug, "content.ts");
if (!existsSync(source)) fail(`customers/${slug}/content.ts not found.`);

// Resolve Google Sheet overrides here, in Node, BEFORE next build — because a
// static export never runs the page's async fetch. The result is baked in.
const kitNameForSlug = site.kit;
let resolvedContent;
let live;
try {
  const result = await resolveContentForBuild(slug, source, kitNameForSlug, repoRoot);
  resolvedContent = result.content;
  live = result.live;
  console.log(`✓ ${kit.app} → ${slug} (${site.displayName || slug}) — ${result.note}`);
  if (result.diagnostics && Object.keys(result.diagnostics).length > 0) {
    console.log(`  sheet notes: ${JSON.stringify(result.diagnostics)}`);
  }
} catch (error) {
  // Never break the build over sheet issues — fall back to the raw TS content.
  console.warn(`  sheet resolution skipped: ${error?.message ?? error}`);
  resolvedContent = null;
}

// The Event kit also gets its live values (status / notice / seats), baked in
// for the same reason as the content: the page must not fetch.
const liveExport =
  kitNameForSlug === "event"
    ? `\nexport const live: EventLive | undefined = ${live ? JSON.stringify(live, null, 2) : "undefined"};\n`
    : "";
const liveImport = kitNameForSlug === "event" ? `import type { EventLive } from "@evalycloud/external-data";\n` : "";

const banner = `// GENERATED — do not edit.\n// Source: customers/${slug}/content.ts\n// Run: pnpm use:customer ${slug}\n\n`;

if (resolvedContent) {
  // Emit already-resolved content as a typed object literal.
  const typeName =
    kitNameForSlug === "restaurant"
      ? "RestaurantSiteContent"
      : kitNameForSlug === "event"
        ? "EventSiteContent"
        : kitNameForSlug === "education"
          ? "EducationSiteContent"
          : kitNameForSlug === "portfolio"
            ? "PortfolioSiteContent"
            : "BusinessSiteContent";
  const body =
    `import type { ${typeName} } from "@evalycloud/content-schema";\n` +
    liveImport +
    `\nconst content: ${typeName} = ${JSON.stringify(resolvedContent, null, 2)};\n\n` +
    `export default content;\n` +
    liveExport;
  writeFileSync(join(appDir, "app", "content.generated.ts"), banner + body);
} else {
  const raw = readFileSync(source, "utf8");
  writeFileSync(
    join(appDir, "app", "content.generated.ts"),
    banner + (liveExport ? liveImport + raw + liveExport : raw),
  );
}

const publicImages = join(appDir, "public", "images");
rmSync(publicImages, { recursive: true, force: true });
mkdirSync(publicImages, { recursive: true });

const customerImages = join(customersDir, slug, "images");
if (existsSync(customerImages)) {
  cpSync(customerImages, publicImages, { recursive: true });
}

console.log(`✓ ${kit.app} → ${slug} (${site.displayName || slug})`);
