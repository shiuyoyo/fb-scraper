import type { RestaurantSiteContent } from "@evalycloud/content-schema";

const content: RestaurantSiteContent = {
  site: {
    name: "餐廳名稱",
    language: "zh-TW",
    template: "classic",
    currency: "TWD",
    // theme: "forest" | "terracotta" | "ivory" | "ocean" | "plum"
    sheets: { enabled: false, sources: {} },
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
