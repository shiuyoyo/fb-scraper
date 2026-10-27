import type { BusinessSectionLabels } from "@evalycloud/content-schema";

type Labels = Required<BusinessSectionLabels> & {
  menu: string;
  skip: string;
  contactIntro: string;
  phone: string;
  email: string;
  line: string;
  instagram: string;
  map: string;
};

const zh: Labels = {
  services: "服務項目",
  gallery: "作品實績",
  faq: "常見問題",
  contact: "聯絡我們",
  menu: "選單",
  skip: "跳到主要內容",
  contactIntro: "歡迎透過以下方式與我們聯繫。",
  phone: "電話",
  email: "Email",
  line: "LINE",
  instagram: "Instagram",
  map: "地圖位置",
};

const en: Labels = {
  services: "Services",
  gallery: "Gallery",
  faq: "FAQ",
  contact: "Contact",
  menu: "Menu",
  skip: "Skip to content",
  contactIntro: "Get in touch through any of the channels below.",
  phone: "Phone",
  email: "Email",
  line: "LINE",
  instagram: "Instagram",
  map: "Map",
};

/** Built-in defaults, overridable per site via `content.labels`. */
export function resolveLabels(language: string, overrides?: BusinessSectionLabels): Labels {
  const base = language.toLowerCase().startsWith("zh") ? zh : en;
  return { ...base, ...overrides };
}
