import type { EventStatus } from "@evalycloud/content-schema";

export type StatusTone = "neutral" | "positive" | "warning" | "muted";

export type ResolvedStatus = {
  status: EventStatus;
  /** Short badge text shown next to the event title. */
  label: string;
  /** Longer line explaining what a visitor can do right now. Empty when nothing needs saying. */
  note: string;
  tone: StatusTone;
  /** Whether the registration section and CTAs are shown at all. */
  showRegistration: boolean;
  /** Whether the registration link is live, as opposed to shown but inert. */
  registrationActive: boolean;
  /** Past events keep their content but stop pushing people to act. */
  isArchived: boolean;
};

const zh: Record<EventStatus, Omit<ResolvedStatus, "status">> = {
  upcoming: {
    label: "即將開放",
    note: "報名尚未開始，請留意公告。",
    tone: "neutral",
    showRegistration: true,
    registrationActive: false,
    isArchived: false,
  },
  open: {
    label: "報名中",
    note: "",
    tone: "positive",
    showRegistration: true,
    registrationActive: true,
    isArchived: false,
  },
  closed: {
    label: "報名已截止",
    note: "報名已結束，現場名額請洽主辦單位。",
    tone: "warning",
    showRegistration: true,
    registrationActive: false,
    isArchived: false,
  },
  completed: {
    label: "活動已結束",
    note: "感謝參與。以下資訊保留供查詢。",
    tone: "muted",
    showRegistration: false,
    registrationActive: false,
    isArchived: true,
  },
  archived: {
    label: "已封存",
    note: "本頁為歷史紀錄，資訊可能已不適用。",
    tone: "muted",
    showRegistration: false,
    registrationActive: false,
    isArchived: true,
  },
};

const en: Record<EventStatus, Omit<ResolvedStatus, "status">> = {
  upcoming: { label: "Coming soon", note: "Registration has not opened yet.", tone: "neutral", showRegistration: true, registrationActive: false, isArchived: false },
  open: { label: "Registration open", note: "", tone: "positive", showRegistration: true, registrationActive: true, isArchived: false },
  closed: { label: "Registration closed", note: "Registration has ended.", tone: "warning", showRegistration: true, registrationActive: false, isArchived: false },
  completed: { label: "Event finished", note: "Thanks for coming. Details are kept for reference.", tone: "muted", showRegistration: false, registrationActive: false, isArchived: true },
  archived: { label: "Archived", note: "This page is a historical record.", tone: "muted", showRegistration: false, registrationActive: false, isArchived: true },
};

/** How urgent each status is. A live source may only move a page to a stricter one. */
const severity: Record<EventStatus, number> = {
  open: 0,
  upcoming: 1,
  closed: 2,
  completed: 3,
  archived: 4,
};

/**
 * Resolve the status a page should render.
 *
 * `liveStatus` comes from a spreadsheet the organizer controls. It may only
 * make the page more conservative — an organizer can cancel or close an event
 * within minutes, but cannot re-open registration from a spreadsheet, because
 * a stale or mistyped cell that says "open" on a cancelled event sends people
 * to a venue for nothing. Re-opening requires a rebuild.
 */
export function resolveStatus(
  status: EventStatus,
  language: string,
  liveStatus?: string,
): ResolvedStatus {
  let effective = status;

  if (liveStatus && liveStatus in severity) {
    const candidate = liveStatus as EventStatus;
    if (severity[candidate] > severity[status]) effective = candidate;
  }

  const table = language.toLowerCase().startsWith("zh") ? zh : en;
  return { status: effective, ...table[effective] };
}

export const statusToneClasses: Record<StatusTone, string> = {
  neutral: "border-primary/30 bg-primary/10 text-primary",
  positive: "border-success/40 bg-success/10 text-foreground",
  warning: "border-warning/50 bg-warning/10 text-foreground",
  muted: "border bg-surface text-foreground/70",
};
