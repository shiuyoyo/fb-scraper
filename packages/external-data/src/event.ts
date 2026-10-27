import type {
  EventScheduleDay,
  EventSiteContent,
  EventSpeaker,
  EventSponsor,
} from "@evalycloud/content-schema";
import { loadSheet, type SheetResult, type SheetStatus } from "./sheet.ts";
import { mergeList } from "./merge.ts";
import type { MultiSheetConfig } from "./sources.ts";
import {
  cell,
  compact,
  enabled,
  faqColumns,
  faqRows,
  image,
  link,
  mapFaq,
  num,
  orNone,
  ordered,
  rows,
  text,
  type Row,
} from "./common.ts";
import { linkFields, resolveKitSheets, sharedOptional, type KitSheetSpec } from "./kit-sheets.ts";

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
  /** One-line banner the organizer can change with a rebuild. */
  notice?: string;
  /** Why the values are missing, for build logs. Never rendered. */
  sourceStatus: SheetStatus;
  error?: string;
};

/** The site-tab keys that feed EventLive rather than a content path. */
export const EVENT_LIVE_KEYS = ["status", "registered", "capacity", "notice"] as const;

/**
 * Read live keys from a key/value map:
 *
 *   key        | value
 *   status     | closed
 *   registered | 128
 *   capacity   | 150
 *   notice     | 因雨延期至 3/15
 */
export function liveFromValues(values: Record<string, string>, sourceStatus: SheetStatus, error?: string): EventLive {
  const live: EventLive = { sourceStatus, error };

  for (const [rawKey, rawValue] of Object.entries(values)) {
    const key = rawKey.trim().toLowerCase();
    const value = String(rawValue ?? "").trim();
    if (!key || value === "") continue;

    if (key === "status") live.status = value.toLowerCase();
    if (key === "notice") live.notice = value;
    if (key === "registered" || key === "capacity") {
      const parsed = Number(value.replace(/[,\s]/g, ""));
      if (Number.isFinite(parsed) && parsed >= 0) live[key] = parsed;
    }
  }

  return compact(live);
}

/** Legacy single-sheet live source (`site.sheet`). */
export async function loadEventLive(content: EventSiteContent): Promise<EventLive> {
  const result = await loadSheet<{ key?: string; value?: string }>(content.site.sheet, { fallback: [] });
  const values: Record<string, string> = {};
  for (const row of result.rows) {
    const key = String(row.key ?? "").trim();
    if (key) values[key] = String(row.value ?? "");
  }
  return liveFromValues(values, result.status, result.error);
}

/* ---- list tabs ---- */

export const scheduleColumns = ["day_label", "day_date", "time", "title", "description", "location", "enabled", "sort_order"];

/**
 * schedule — one row per session; day columns repeat down the rows, like the
 * restaurant menu. Days keep their first-appearance order; sessions within a
 * day follow sort_order, then sheet order.
 */
export function mapSchedule(result: SheetResult | undefined): EventScheduleDay[] | undefined {
  const days = new Map<string, { day: EventScheduleDay; items: Array<{ value: EventScheduleDay["items"][number]; sort?: number }> }>();

  for (const row of rows(result)) {
    const label = text(row.day_label);
    const time = text(row.time);
    const title = text(row.title);
    if (!label || !time || !title || !enabled(row)) continue;

    const date = text(row.day_date) ?? "";
    const key = `${label}\u0000${date}`;
    if (!days.has(key)) days.set(key, { day: { label, date, items: [] }, items: [] });
    days.get(key)!.items.push({
      value: compact({ time, title, description: text(row.description), location: text(row.location) }),
      sort: num(row.sort_order),
    });
  }

  const list = [...days.values()].map(({ day, items }) => ({ ...day, items: ordered(items) }));
  return orNone(list);
}

function scheduleRows(list: EventScheduleDay[]): Row[] {
  return list.flatMap((day) =>
    day.items.map((item, index) => ({
      day_label: day.label,
      day_date: day.date,
      time: item.time,
      title: item.title,
      description: cell(item.description),
      location: cell(item.location),
      enabled: "true",
      sort_order: String((index + 1) * 10),
    })),
  );
}

export const speakerColumns = ["name", "role", "bio", "photo_src", "photo_alt", "link_label", "link_href", "enabled", "sort_order"];

export function mapSpeakers(result: SheetResult | undefined): EventSpeaker[] | undefined {
  const list = rows(result)
    .filter((row) => text(row.name) && enabled(row))
    .map((row) => ({
      value: compact({
        name: row.name.trim(),
        role: text(row.role),
        bio: text(row.bio),
        photo: image(row.photo_src, row.photo_alt),
        link: link(row.link_label, row.link_href),
      }),
      sort: num(row.sort_order),
    }));
  return orNone(ordered(list));
}

function speakerRows(list: EventSpeaker[] | undefined): Row[] {
  return (list ?? []).map((speaker, index) => ({
    name: speaker.name,
    role: cell(speaker.role),
    bio: cell(speaker.bio),
    photo_src: cell(speaker.photo?.src),
    photo_alt: cell(speaker.photo?.alt),
    link_label: cell(speaker.link?.label),
    link_href: cell(speaker.link?.href),
    enabled: "true",
    sort_order: String((index + 1) * 10),
  }));
}

export const announcementColumns = ["date", "title", "body", "enabled", "sort_order"];

export function mapAnnouncements(result: SheetResult | undefined): EventSiteContent["announcements"] | undefined {
  const list = rows(result)
    .filter((row) => text(row.title) && enabled(row))
    .map((row) => ({
      value: { date: (row.date ?? "").trim(), title: row.title.trim(), body: (row.body ?? "").trim() },
      sort: num(row.sort_order),
    }));
  return orNone(ordered(list));
}

function announcementRows(list: EventSiteContent["announcements"]): Row[] {
  return list.map((item, index) => ({
    date: item.date,
    title: item.title,
    body: item.body,
    enabled: "true",
    sort_order: String((index + 1) * 10),
  }));
}

export const sponsorColumns = ["name", "tier", "logo_src", "logo_alt", "url", "enabled", "sort_order"];

export function mapSponsors(result: SheetResult | undefined): EventSponsor[] | undefined {
  const list = rows(result)
    .filter((row) => text(row.name) && enabled(row))
    .map((row) => ({
      value: compact({
        name: row.name.trim(),
        tier: text(row.tier),
        logo: image(row.logo_src, row.logo_alt),
        url: text(row.url),
      }),
      sort: num(row.sort_order),
    }));
  return orNone(ordered(list));
}

function sponsorRows(list: EventSponsor[] | undefined): Row[] {
  return (list ?? []).map((sponsor, index) => ({
    name: sponsor.name,
    tier: cell(sponsor.tier),
    logo_src: cell(sponsor.logo?.src),
    logo_alt: cell(sponsor.logo?.alt),
    url: cell(sponsor.url),
    enabled: "true",
    sort_order: String((index + 1) * 10),
  }));
}

export const eventSheetSpec: KitSheetSpec<EventSiteContent> = {
  optional: [
    ...sharedOptional,
    { path: "hero.registrationCta", ...linkFields },
    { path: "overview", fields: ["organizer"] },
    { path: "venue", fields: ["mapUrl", "transportNotes"], arrays: ["transportNotes"] },
    {
      path: "labels",
      fields: ["schedule", "speakers", "venue", "registration", "announcements", "faq", "sponsors"],
    },
  ],
  extraSiteRows: (content) => [
    { key: "status", value: content.site.status },
    { key: "notice", value: "" },
    { key: "registered", value: "" },
    { key: "capacity", value: "" },
  ],
  tabs: [
    {
      source: "schedule",
      file: "2_schedule.csv",
      owns: "schedule",
      columns: scheduleColumns,
      toRows: (content) => scheduleRows(content.schedule),
      apply: (content, result) => ({ ...content, schedule: mergeList(content.schedule, mapSchedule(result)) }),
    },
    {
      source: "speakers",
      file: "3_speakers.csv",
      owns: "speakers",
      columns: speakerColumns,
      toRows: (content) => speakerRows(content.speakers),
      apply: (content, result) => ({ ...content, speakers: mergeList(content.speakers ?? [], mapSpeakers(result)) }),
    },
    {
      source: "announcements",
      file: "4_announcements.csv",
      owns: "announcements",
      columns: announcementColumns,
      toRows: (content) => announcementRows(content.announcements),
      apply: (content, result) => ({
        ...content,
        announcements: mergeList(content.announcements, mapAnnouncements(result)),
      }),
    },
    {
      source: "faq",
      file: "5_faq.csv",
      owns: "faq",
      columns: faqColumns,
      toRows: (content) => faqRows(content.faq),
      apply: (content, result) => ({ ...content, faq: mergeList(content.faq ?? [], mapFaq(result)) }),
    },
    {
      source: "sponsors",
      file: "6_sponsors.csv",
      owns: "sponsors",
      columns: sponsorColumns,
      toRows: (content) => sponsorRows(content.sponsors),
      apply: (content, result) => ({ ...content, sponsors: mergeList(content.sponsors ?? [], mapSponsors(result)) }),
    },
  ],
};

/**
 * Event content plus its live values. Live keys come from the multi-tab site
 * tab; the legacy single `site.sheet` source still works and its values win
 * when both are set, since it is the one an organizer was told to edit.
 */
export async function resolveEventContent(
  fallback: EventSiteContent,
  config?: MultiSheetConfig,
): Promise<{ content: EventSiteContent; live: EventLive; diagnostics: Record<string, string> }> {
  const { content, diagnostics, siteValues, sources } = await resolveKitSheets(fallback, config, eventSheetSpec);
  const fromTab = liveFromValues(siteValues, sources.site?.status ?? "disabled", sources.site?.error);

  if (!fallback.site.sheet?.enabled) return { content, live: fromTab, diagnostics };

  const legacy = await loadEventLive(fallback);
  if (legacy.sourceStatus !== "ok") diagnostics.sheet = legacy.error ? `${legacy.sourceStatus}: ${legacy.error}` : legacy.sourceStatus;
  const { sourceStatus, error, ...legacyValues } = legacy;
  const live: EventLive = compact({
    ...fromTab,
    ...legacyValues,
    sourceStatus: sourceStatus === "ok" ? sourceStatus : fromTab.sourceStatus,
    error: sourceStatus === "ok" ? undefined : (error ?? fromTab.error),
  });
  return { content, live, diagnostics };
}
