#!/usr/bin/env node
import { listCustomers, readSite } from "./lib.mjs";

const slugs = listCustomers();
if (slugs.length === 0) {
  console.log("No customers yet. Create one with: pnpm new:customer <slug>");
  process.exit(0);
}
for (const slug of slugs) {
  const site = readSite(slug);
  const domain = site.domain ? ` — ${site.domain}` : "";
  console.log(`${slug.padEnd(24)} ${site.kit.padEnd(9)} ${site.displayName || ""}${domain}`);
}
