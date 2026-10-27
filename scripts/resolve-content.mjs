/**
 * Build-time content resolution for static export.
 *
 * Next's `output: "export"` does NOT run a page's async fetch during build, so
 * fetching Google Sheets inside the page silently no-ops and the site ships the
 * local fallback. Instead we resolve here — in plain Node, before `next build`,
 * where fetch works — and write already-merged content for the page to import
 * synchronously.
 *
 * Every kit resolves through @evalycloud/external-data's resolveCustomerContent.
 */
import { pathToFileURL } from "node:url";

async function loadModule(tsPath) {
  // Node 22 can import .ts directly with --experimental-strip-types (set by caller).
  const mod = await import(pathToFileURL(tsPath).href);
  return mod.default ?? mod;
}

export async function resolveContentForBuild(slug, contentTsPath, kitName, repoRoot) {
  const content = await loadModule(contentTsPath);
  const wired = content?.site?.sheets?.enabled || (kitName === "event" && content?.site?.sheet?.enabled);

  if (!wired) {
    return { content, note: "no sheet resolution" };
  }

  const { resolveCustomerContent } = await loadModule(`${repoRoot}/packages/external-data/src/index.ts`);

  try {
    const { content: resolved, live, diagnostics } = await resolveCustomerContent(kitName, content);
    return { content: resolved, live, note: "sheets resolved", diagnostics };
  } catch (error) {
    return { content, note: `sheet resolution failed: ${error?.message ?? error}` };
  }
}
