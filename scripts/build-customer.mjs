#!/usr/bin/env node
/**
 * Build one customer's site.
 *
 *   pnpm build:customer <slug>
 */
import { spawnSync } from "node:child_process";
import { repoRoot, resolveCustomer } from "./lib.mjs";

const slug = process.argv[2] ?? process.env.CUSTOMER;
const { kit, site } = resolveCustomer(slug);

const run = (cmd, args) => {
  const result = spawnSync(cmd, args, { cwd: repoRoot, stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

run("node", ["scripts/use-customer.mjs", slug]);
run("pnpm", ["--filter", kit.pkg, "build"]);

console.log(`\n✓ Built ${site.displayName || slug} → apps/${kit.app}/.next`);
console.log(`  Add output: "export" to that app's next.config.ts if you need a static out/ folder to upload.\n`);
