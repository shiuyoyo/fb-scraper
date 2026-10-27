import type { PortfolioSiteContent } from "@evalycloud/content-schema";

const content: PortfolioSiteContent = {
  site: {
    name: "你的名字或工作室",
    language: "zh-TW",
    template: "classic",
    // 每個試算表分頁各自「發布到網路 → CSV」,把網址貼進對應的 csvUrl。
    // csvUrl 留空 = 該分頁停用,那一段就用下面的本地內容。
    // 分頁範本:pnpm sheet:template <slug>。說明:docs/GOOGLE_SHEETS_CONTENT.md
    sheets: {
      enabled: true,
      sources: {
        site: { enabled: true, csvUrl: "" },
        projects: { enabled: true, csvUrl: "" },
        services: { enabled: true, csvUrl: "" },
        clients: { enabled: true, csvUrl: "" },
      },
    },
  },
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
