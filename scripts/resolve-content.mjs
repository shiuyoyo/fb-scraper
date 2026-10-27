/**
 * Build-time content resolution for static export.
 *
 * Next's `output: "export"` does NOT run a page's async fetch during build, so
 * fetching Google Sheets inside the page silently no-ops and the site ships the
 * local fallback. Instead we resolve here — in plain Node, before `next build`,
 * where fetch works — and write already-merged content for the page to import
 * synchronously.
 *
 * Only the restaurant kit currently wires sheets; other kits pass through.
 */
import { pathToFileURL } from "node:url";

async function loadModule(tsPath) {
  // Node 22 can import .ts directly with --experimental-strip-types (set by caller).
  const mod = await import(pathToFileURL(tsPath).href);
  return mod.default ?? mod;
}

export async function resolveContentForBuild(slug, contentTsPath, kitName, repoRoot) {
  const content = await loadModule(contentTsPath);

  if (kitName !== "restaurant" || !content?.site?.sheets?.enabled) {
    return { content, note: "no sheet resolution" };
  }

  const { resolveRestaurantContent } = await loadModule(
    `${repoRoot}/packages/external-data/src/index.ts`,
  );

  try {
    const { content: resolved, diagnostics } = await resolveRestaurantContent(
      content,
      content.site.sheets,
    );
    return { content: resolved, note: "sheets resolved", diagnostics };
  } catch (error) {
    return { content, note: `sheet resolution failed: ${error?.message ?? error}` };
  }
}
