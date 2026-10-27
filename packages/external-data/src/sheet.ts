import type { SheetSource } from "@evalycloud/content-schema";
import { parseCsv } from "./csv.ts";

export type SheetStatus = "disabled" | "ok" | "empty" | "failed";

export type SheetResult<T = Record<string, string | number>> = {
  status: SheetStatus;
  rows: T[];
  /** Present when status is "failed". Safe to log, never rendered raw. */
  error?: string;
};

export type LoadSheetOptions<T> = {
  /** Returned whenever the sheet is disabled, empty, or unreachable. */
  fallback?: T[];
  timeoutMs?: number;
};

/**
 * Fetch a published Google Sheet and turn it into typed rows.
 *
 * Never throws and never returns undefined. Any failure — disabled, offline,
 * 404, HTML error page, malformed CSV, missing columns — comes back as the
 * fallback with a status the caller can act on. A build must not break
 * because someone un-published a spreadsheet.
 *
 * Templates must not call this directly; a page or loader resolves the data
 * and hands plain values to the template.
 */
export async function loadSheet<T = Record<string, string | number>>(
  source: SheetSource | undefined,
  options: LoadSheetOptions<T> = {},
): Promise<SheetResult<T>> {
  const fallback = options.fallback ?? [];

  if (!source?.enabled || !source.csvUrl) {
    return { status: "disabled", rows: fallback };
  }

  let text: string;
  try {
    const response = await fetch(source.csvUrl, {
      signal: AbortSignal.timeout(options.timeoutMs ?? 10_000),
      redirect: "follow",
      // No next.revalidate here: under static export there is no server to
      // revalidate, so the fetch is a one-shot at build time. Freshness comes
      // from rebuilding, not from a revalidate window. revalidateSeconds is
      // kept in the type for a future server-rendered deployment.
    });

    if (!response.ok) {
      return { status: "failed", rows: fallback, error: `HTTP ${response.status}` };
    }

    const contentType = response.headers.get("content-type") ?? "";
    text = await response.text();

    // An un-published or permission-denied sheet answers 200 with a login page.
    if (contentType.includes("text/html") || /^\s*</.test(text)) {
      return {
        status: "failed",
        rows: fallback,
        error: "回應不是 CSV。試算表可能沒有發布到網路，或權限不足。",
      };
    }
  } catch (error) {
    return {
      status: "failed",
      rows: fallback,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  let rows: string[][];
  try {
    rows = parseCsv(text);
  } catch (error) {
    return {
      status: "failed",
      rows: fallback,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  if (rows.length < 2) {
    return { status: "empty", rows: fallback };
  }

  const headers = rows[0].map((header) => header.trim());
  const numberFields = new Set(source.numberFields ?? []);

  const records = rows.slice(1).map((cells) => {
    const record: Record<string, string | number> = {};

    headers.forEach((header, index) => {
      const field = source.mapping[header];
      if (!field) return; // column not mapped — ignore it rather than guess

      const raw = (cells[index] ?? "").trim();

      if (numberFields.has(field)) {
        // Sheets export thousands separators and stray spaces.
        const parsed = Number(raw.replace(/[,\s]/g, ""));
        if (raw !== "" && Number.isFinite(parsed)) record[field] = parsed;
        return;
      }

      if (raw !== "") record[field] = raw;
    });

    return record as T;
  });

  const usable = records.filter((record) => Object.keys(record as object).length > 0);

  if (usable.length === 0) {
    return { status: "empty", rows: fallback };
  }

  return { status: "ok", rows: usable };
}


