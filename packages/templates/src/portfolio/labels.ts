import type { PortfolioSectionLabels } from "@evalycloud/content-schema";

type Labels = Required<PortfolioSectionLabels> & {
  menu: string; skip: string; viewWork: string; getInTouch: string;
  phone: string; email: string; line: string; instagram: string;
};

const zh: Labels = {
  about: "關於我", work: "作品", services: "服務項目", clients: "合作對象", contact: "聯絡我",
  menu: "選單", skip: "跳到主要內容", viewWork: "查看作品", getInTouch: "與我聯絡",
  phone: "電話", email: "Email", line: "LINE", instagram: "Instagram",
};
const en: Labels = {
  about: "About", work: "Work", services: "Services", clients: "Clients", contact: "Contact",
  menu: "Menu", skip: "Skip to content", viewWork: "View work", getInTouch: "Get in touch",
  phone: "Phone", email: "Email", line: "LINE", instagram: "Instagram",
};
export function resolvePortfolioLabels(language: string, overrides?: PortfolioSectionLabels): Labels {
  const base = language.toLowerCase().startsWith("zh") ? zh : en;
  return { ...base, ...overrides };
}
