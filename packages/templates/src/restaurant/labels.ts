import type { RestaurantSectionLabels } from "@evalycloud/content-schema";

type Labels = Required<RestaurantSectionLabels> & {
  menu: string;
  skip: string;
  viewMenu: string;
  reserve: string;
  closed: string;
  soldOut: string;
  address: string;
  transport: string;
  map: string;
  phone: string;
  line: string;
  form: string;
  days: Record<string, string>;
};

const zh: Labels = {
  about: "關於我們",
  featured: "人氣料理",
  menu: "完整菜單",
  promotions: "最新優惠",
  hours: "營業時間",
  location: "位置與交通",
  reservation: "聯絡與訂位",
  gallery: "餐點與空間",
  faq: "常見問題",
  skip: "跳到主要內容",
  viewMenu: "查看菜單",
  reserve: "立即訂位",
  closed: "公休",
  soldOut: "售完",
  address: "地址",
  transport: "交通方式",
  map: "地圖位置",
  phone: "電話訂位",
  line: "LINE 訂位",
  form: "線上表單",
  days: {
    monday: "星期一", tuesday: "星期二", wednesday: "星期三", thursday: "星期四",
    friday: "星期五", saturday: "星期六", sunday: "星期日",
  },
};

const en: Labels = {
  about: "About", featured: "Featured", menu: "Menu", promotions: "Offers",
  hours: "Hours", location: "Location", reservation: "Reserve", gallery: "Gallery",
  faq: "FAQ", skip: "Skip to content", viewMenu: "View menu", reserve: "Reserve",
  closed: "Closed", soldOut: "Sold out", address: "Address", transport: "Getting there",
  map: "Map", phone: "Call to book", line: "Book on LINE", form: "Online form",
  days: {
    monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
    friday: "Fri", saturday: "Sat", sunday: "Sun",
  },
};

export function resolveRestaurantLabels(language: string, overrides?: RestaurantSectionLabels): Labels {
  const base = language.toLowerCase().startsWith("zh") ? zh : en;
  return { ...base, ...overrides };
}

const tagLabels: Record<string, { zh: string; className: string }> = {
  signature: { zh: "招牌", className: "border-primary/40 bg-primary/10 text-primary" },
  popular: { zh: "人氣", className: "border-accent/40 bg-accent/10 text-accent" },
  new: { zh: "新品", className: "border-success/40 bg-success/10 text-foreground" },
  vegetarian: { zh: "素食", className: "border-success/40 bg-success/10 text-foreground" },
  vegan: { zh: "純素", className: "border-success/40 bg-success/10 text-foreground" },
  spicy: { zh: "辣", className: "border-danger/40 bg-danger/10 text-danger" },
  limited: { zh: "限量", className: "border-warning/50 bg-warning/10 text-foreground" },
};

export function tagDisplay(tag: string, language: string): { label: string; className: string } {
  const known = tagLabels[tag];
  if (!known) return { label: tag, className: "border bg-surface text-foreground/70" };
  return {
    label: language.toLowerCase().startsWith("zh") ? known.zh : tag,
    className: known.className,
  };
}
