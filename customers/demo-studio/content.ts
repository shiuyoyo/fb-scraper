import type { PortfolioSiteContent } from "@evalycloud/content-schema";

const content: PortfolioSiteContent = {
  site: { name: "沐光設計", language: "zh-TW", template: "classic", theme: "ivory" },
  hero: {
    name: "沐光設計工作室",
    role: "品牌與平面設計",
    tagline: "把想說的,設計成看得見的",
    intro: "專注品牌識別、包裝與網頁視覺。合作過餐飲、文創與新創品牌。",
    workCta: { label: "查看作品", href: "#work" },
    contactCta: { label: "談談合作", href: "#contact" },
  },
  projects: [
    { id: "p1", title: "森日蔬食 品牌識別", meta: "2025・品牌設計", description: "從 logo 到菜單的整套視覺規劃。", tags: ["品牌識別", "餐飲"], featured: true, sort: 10 },
    { id: "p2", title: "溪畔藝術節 主視覺", meta: "2025・活動視覺", description: "社區藝術節的識別與周邊。", tags: ["活動", "插畫"], sort: 20 },
    { id: "p3", title: "晨光學苑 網站改版", meta: "2024・網頁設計", description: "語言學苑的形象網站設計。", tags: ["網頁", "UI"], sort: 30 },
    { id: "p4", title: "手作皂品牌包裝", meta: "2024・包裝設計", description: "小型手工皂的系列包裝。", tags: ["包裝", "文創"], sort: 40 },
  ],
  about: {
    title: "關於沐光",
    description: "一人工作室,第六年。相信好設計來自把問題聽清楚。從品牌策略到落地執行,一起把事情做完。",
  },
  services: [
    { title: "品牌識別", description: "Logo、識別系統、品牌指南。" },
    { title: "平面設計", description: "包裝、海報、菜單、印刷品。" },
    { title: "網頁視覺", description: "形象網站的視覺設計與規劃。" },
  ],
  clients: [
    { name: "森日蔬食" }, { name: "溪畔社區發展協會" }, { name: "晨光語言學苑" },
  ],
  contact: { email: "hello@example.com", lineUrl: "https://line.me/", instagramUrl: "https://instagram.com/" },
};

export default content;
