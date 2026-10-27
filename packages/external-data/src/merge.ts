/**
 * Content merge rules (RFC-002 §7).
 *
 *   typed local fallback  →  valid sheet override  →  resolved content
 *
 * The local content.ts is always a complete, schema-valid fallback. Sheet
 * values only override where they are present and valid. A blank cell leaves
 * the fallback untouched; the sentinel below is the only way a sheet can
 * deliberately clear a field.
 *
 * This layer is pure and synchronous so it can be unit-tested without a
 * network. Fetching happens elsewhere; this only merges already-parsed data.
 */

/** Explicit "make this field empty" — distinguishes intent from a blank cell. */
export const EMPTY_SENTINEL = "__EMPTY__";

type Plain = Record<string, unknown>;

function isPlainObject(value: unknown): value is Plain {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Apply a flat map of overrides onto a nested object using dot paths.
 *
 *   applyOverrides(content, { "site.name": "新店名", "hero.title": "__EMPTY__" })
 *
 * - undefined / missing / blank string  → leave the fallback as-is
 * - EMPTY_SENTINEL                       → set to "" (deliberate clear)
 * - any other value                      → override
 *
 * Unknown paths are ignored rather than creating stray keys, so a typo in a
 * sheet header can never inject a field the schema does not expect.
 */
export function applyOverrides<T extends Plain>(fallback: T, overrides: Record<string, unknown>): T {
  // Structured clone keeps the fallback immutable for callers and tests.
  const result = structuredClone(fallback);

  for (const [path, raw] of Object.entries(overrides)) {
    if (raw === undefined || raw === null) continue;
    if (typeof raw === "string" && raw.trim() === "") continue;

    const value = raw === EMPTY_SENTINEL ? "" : raw;
    setPath(result, path.split("."), value);
  }

  return result;
}

function setPath(target: Plain, keys: string[], value: unknown): void {
  let node: Plain = target;

  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    const next = node[key];
    if (!isPlainObject(next)) {
      // Don't invent structure the fallback didn't already have.
      return;
    }
    node = next;
  }

  const leaf = keys[keys.length - 1];
  if (!(leaf in node)) return; // don't invent fields the schema doesn't declare

  // A fallback array is filled from a pipe-separated cell: "捷運…|停車…"
  if (Array.isArray(node[leaf]) && typeof value === "string") {
    node[leaf] = value === "" ? [] : value.split("|").map((part) => part.trim()).filter(Boolean);
    return;
  }

  node[leaf] = value;
}

/**
 * Replace a whole list section (menu, faq, announcements) when the sheet
 * provides a non-empty, valid one; otherwise keep the fallback list intact.
 *
 * A sheet that is present but yields zero valid rows is treated as "no data",
 * not "empty the section" — an organizer who breaks their menu sheet should
 * see the last-known menu, not a blank page.
 */
export function mergeList<T>(fallback: T[], fromSheet: T[] | undefined): T[] {
  if (!fromSheet || fromSheet.length === 0) return fallback;
  return fromSheet;
}
