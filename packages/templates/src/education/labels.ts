import type { EducationSectionLabels } from "@evalycloud/content-schema";

type Labels = Required<EducationSectionLabels> & {
  menu: string; skip: string; viewCourses: string; enrollNow: string;
  address: string; transport: string; map: string; phone: string; line: string; form: string;
};

const zh: Labels = {
  about: "關於我們", courses: "課程介紹", teachers: "師資陣容", features: "教學特色",
  faq: "常見問題", enroll: "報名與諮詢", gallery: "環境與課堂",
  menu: "選單", skip: "跳到主要內容", viewCourses: "查看課程", enrollNow: "立即報名",
  address: "地址", transport: "交通方式", map: "地圖位置", phone: "電話諮詢", line: "LINE 諮詢", form: "線上報名",
};
const en: Labels = {
  about: "About", courses: "Courses", teachers: "Teachers", features: "Why us",
  faq: "FAQ", enroll: "Enroll", gallery: "Gallery",
  menu: "Menu", skip: "Skip to content", viewCourses: "View courses", enrollNow: "Enroll now",
  address: "Address", transport: "Getting there", map: "Map", phone: "Call us", line: "LINE", form: "Online form",
};
export function resolveEducationLabels(language: string, overrides?: EducationSectionLabels): Labels {
  const base = language.toLowerCase().startsWith("zh") ? zh : en;
  return { ...base, ...overrides };
}
