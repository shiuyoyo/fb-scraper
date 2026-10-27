import type { EventSectionLabels } from "@evalycloud/content-schema";

type Labels = Required<EventSectionLabels> & {
  menu: string;
  skip: string;
  overview: string;
  organizer: string;
  address: string;
  transport: string;
  map: string;
  phone: string;
  email: string;
  line: string;
  seatsLeft: string;
  registered: string;
  full: string;
};

const zh: Labels = {
  schedule: "活動流程",
  speakers: "講者與內容",
  venue: "場地與交通",
  registration: "報名與聯絡",
  announcements: "最新公告",
  faq: "常見問題",
  sponsors: "合作單位",
  menu: "選單",
  skip: "跳到主要內容",
  overview: "活動簡介",
  organizer: "主辦單位",
  address: "地址",
  transport: "交通方式",
  map: "地圖位置",
  phone: "電話",
  email: "Email",
  line: "LINE",
  seatsLeft: "剩餘名額",
  registered: "已報名",
  full: "名額已滿",
};

const en: Labels = {
  schedule: "Schedule",
  speakers: "Speakers",
  venue: "Venue & travel",
  registration: "Register",
  announcements: "Announcements",
  faq: "FAQ",
  sponsors: "Partners",
  menu: "Menu",
  skip: "Skip to content",
  overview: "About",
  organizer: "Organizer",
  address: "Address",
  transport: "Getting there",
  map: "Map",
  phone: "Phone",
  email: "Email",
  line: "LINE",
  seatsLeft: "Seats left",
  registered: "Registered",
  full: "Fully booked",
};

/** Built-in defaults, overridable per site via `content.labels`. */
export function resolveEventLabels(language: string, overrides?: EventSectionLabels): Labels {
  const base = language.toLowerCase().startsWith("zh") ? zh : en;
  return { ...base, ...overrides };
}
