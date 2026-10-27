import type { PortfolioSiteContent } from "@evalycloud/content-schema";

const content: PortfolioSiteContent = {
  site: { name: "你的名字或工作室", language: "zh-TW", template: "classic" },
  hero: {
    name: "你的名字",
    role: "你的專業",
    tagline: "一句話介紹你做什麼",
    workCta: { label: "查看作品", href: "#work" },
    contactCta: { label: "聯絡我", href: "#contact" },
  },
  projects: [
    { id: "p1", title: "作品一", meta: "年份・類型", description: "作品說明。", sort: 10 },
  ],
  contact: { email: "" },
};

export default content;
