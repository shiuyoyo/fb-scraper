#!/usr/bin/env node
/**
 * Run one customer's site locally.
 *
 *   pnpm dev:customer <slug>
 */
import { spawnSync } from "node:child_process";
import { repoRoot, resolveCustomer } from "./lib.mjs";

const slug = process.argv[2] ?? process.env.CUSTOMER;
const { kit } = resolveCustomer(slug);

const run = (cmd, args) => {
  const result = spawnSync(cmd, args, { cwd: repoRoot, stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

run("node", ["scripts/use-customer.mjs", slug]);
run("pnpm", ["--filter", kit.pkg, "dev"]);
