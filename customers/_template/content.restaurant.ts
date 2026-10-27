import type { RestaurantSiteContent } from "@evalycloud/content-schema";

const content: RestaurantSiteContent = {
  site: {
    name: "餐廳名稱",
    language: "zh-TW",
    template: "classic",
    currency: "TWD",
    // theme: "forest" | "terracotta" | "ivory" | "ocean" | "plum"
    // 每個試算表分頁各自「發布到網路 → CSV」,把網址貼進對應的 csvUrl。
    // csvUrl 留空 = 該分頁停用,那一段就用下面的本地內容。
    // 分頁範本:pnpm sheet:template <slug>。說明:docs/GOOGLE_SHEETS_CONTENT.md
    sheets: {
      enabled: true,
      sources: {
        site: { enabled: true, csvUrl: "" },
        featured: { enabled: true, csvUrl: "" },
        menu: { enabled: true, csvUrl: "" },
        openingHours: { enabled: true, csvUrl: "" },
        announcements: { enabled: true, csvUrl: "" },
        faq: { enabled: true, csvUrl: "" },
        gallery: { enabled: true, csvUrl: "" },
      },
    },
  },
  hero: {
    name: "餐廳名稱",
    tagline: "一句品牌短句",
    intro: "簡短介紹：你做什麼料理、為誰而做。",
    menuCta: { label: "查看菜單", href: "#menu" },
    reservationCta: { label: "立即訂位", href: "#reservation" },
  },
  menu: [
    {
      id: "main",
      name: "主餐",
      items: [
        { id: "item-001", name: "品項一", description: "說明。", price: 280 },
        { id: "item-002", name: "時價品項", priceLabel: "時價" },
      ],
    },
  ],
  venue: {
    address: "地址",
  },
  reservation: {
    phone: "",
  },
  contact: {
    phone: "",
  },
};

export default content;
