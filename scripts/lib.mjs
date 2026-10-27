import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const customersDir = join(repoRoot, "customers");

/** Which app renders which kit, and which customer it falls back to. */
export const kits = {
  business: { app: "business-kit-demo", pkg: "@evalycloud/business-kit-demo", fallback: "demo-qingguang" },
  restaurant: { app: "restaurant-kit-demo", pkg: "@evalycloud/restaurant-kit-demo", fallback: "demo-restaurant" },
  event: { app: "event-kit-demo", pkg: "@evalycloud/event-kit-demo", fallback: "demo-event" },
  education: { app: "education-kit-demo", pkg: "@evalycloud/education-kit-demo", fallback: "demo-academy" },
  portfolio: { app: "portfolio-kit-demo", pkg: "@evalycloud/portfolio-kit-demo", fallback: "demo-studio" },
};

export function listCustomers() {
  if (!existsSync(customersDir)) return [];
  return readdirSync(customersDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .map((entry) => entry.name)
    .sort();
}

export function readSite(slug) {
  const file = join(customersDir, slug, "site.json");
  if (!existsSync(file)) {
    fail(`customers/${slug}/site.json not found.`);
  }

  let site;
  try {
    site = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    fail(`customers/${slug}/site.json is not valid JSON — ${error.message}`);
  }

  if (!kits[site.kit]) {
    fail(`customers/${slug}/site.json has kit "${site.kit}". Expected one of: ${Object.keys(kits).join(", ")}`);
  }

  return site;
}

export function resolveCustomer(slug) {
  if (!slug) {
    fail(`No customer given.\n\nAvailable: ${listCustomers().join(", ") || "(none)"}`);
  }
  if (!existsSync(join(customersDir, slug))) {
    fail(`Customer "${slug}" not found.\n\nAvailable: ${listCustomers().join(", ") || "(none)"}`);
  }
  const site = readSite(slug);
  return { slug, site, kit: kits[site.kit] };
}

export function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}
