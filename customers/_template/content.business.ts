import type { BusinessSiteContent } from "@evalycloud/content-schema";

const content: BusinessSiteContent = {
  site: {
    name: "商家名稱",
    language: "zh-TW",
    template: "classic",
    // theme: "ocean" | "forest" | "ivory" | "terracotta" | "plum"
    // 每個試算表分頁各自「發布到網路 → CSV」,把網址貼進對應的 csvUrl。
    // csvUrl 留空 = 該分頁停用,那一段就用下面的本地內容。
    // 分頁範本:pnpm sheet:template <slug>。說明:docs/GOOGLE_SHEETS_CONTENT.md
    sheets: {
      enabled: true,
      sources: {
        site: { enabled: true, csvUrl: "" },
        services: { enabled: true, csvUrl: "" },
        gallery: { enabled: true, csvUrl: "" },
        faq: { enabled: true, csvUrl: "" },
      },
    },
  },
  hero: {
    eyebrow: "一句話說明你在做什麼",
    title: "給客戶的明確承諾",
    subtitle: "兩到三句話，講清楚你解決什麼問題、為誰解決。",
    primaryCta: { label: "聯絡我們", href: "#contact" },
    // secondaryCta: { label: "看作品", href: "#gallery" },
  },
  about: {
    title: "關於我們",
    description: "團隊、年資、為什麼值得信任。",
  },
  services: [
    { title: "服務一", description: "在做什麼，客戶得到什麼。" },
    { title: "服務二", description: "在做什麼，客戶得到什麼。" },
  ],
  // 照片放進同一層的 images/，這裡用 /images/檔名 引用。
  // 留空陣列的話，整個區塊和導覽列的連結都會消失。
  gallery: [],
  faq: [],
  contact: {
    phone: "",
    email: "",
    // lineUrl: "",
    // instagramUrl: "",
    // mapUrl: "",
  },
  // labels: { services: "服務項目", gallery: "作品實績" },
};

export default content;
