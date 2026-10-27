import type { EventSiteContent } from "@evalycloud/content-schema";
import { loadSheet } from "./sheet.ts";

/**
 * The only live values an event page reads at build time.
 *
 * Kept deliberately small: everything else about an event is stable enough to
 * live in content.ts, and every extra live field is another thing that can be
 * wrong on the day.
 */
export type EventLive = {
  /** May only make the page more conservative — see resolveStatus. */
  status?: string;
  registered?: number;
  capacity?: number;
  /** One-line banner the organizer can change without a rebuild. */
  notice?: string;
  /** Why the values are missing, for build logs. Never rendered. */
  sourceStatus: "disabled" | "ok" | "empty" | "failed";
  error?: string;
};

/**
 * Expects a two-column sheet: a key column and a value column, one row per
 * field. That shape survives an organizer inserting rows, which a wide
 * one-row-of-headers layout does not.
 *
 *   key        | value
 *   status     | closed
 *   registered | 128
 *   capacity   | 150
 *   notice     | 因雨延期至 3/15
 */
export async function loadEventLive(content: EventSiteContent): Promise<EventLive> {
  const result = await loadSheet<{ key?: string; value?: string }>(content.site.sheet, {
    fallback: [],
  });

  const live: EventLive = { sourceStatus: result.status, error: result.error };

  for (const row of result.rows) {
    const key = String(row.key ?? "").trim().toLowerCase();
    const value = String(row.value ?? "").trim();
    if (!key || value === "") continue;

    if (key === "status") live.status = value.toLowerCase();
    if (key === "notice") live.notice = value;
    if (key === "registered" || key === "capacity") {
      const parsed = Number(value.replace(/[,\s]/g, ""));
      if (Number.isFinite(parsed) && parsed >= 0) live[key] = parsed;
    }
  }

  return live;
}
