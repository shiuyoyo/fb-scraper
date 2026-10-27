import type { EducationSiteContent } from "@evalycloud/content-schema";

const content: EducationSiteContent = {
  site: {
    name: "機構名稱",
    language: "zh-TW",
    template: "classic",
    // 每個試算表分頁各自「發布到網路 → CSV」,把網址貼進對應的 csvUrl。
    // csvUrl 留空 = 該分頁停用,那一段就用下面的本地內容。
    // 分頁範本:pnpm sheet:template <slug>。說明:docs/GOOGLE_SHEETS_CONTENT.md
    sheets: {
      enabled: true,
      sources: {
        site: { enabled: true, csvUrl: "" },
        features: { enabled: true, csvUrl: "" },
        courses: { enabled: true, csvUrl: "" },
        teachers: { enabled: true, csvUrl: "" },
        gallery: { enabled: true, csvUrl: "" },
        faq: { enabled: true, csvUrl: "" },
      },
    },
  },
  hero: {
    name: "機構名稱",
    tagline: "一句品牌短句",
    intro: "簡短介紹。",
    coursesCta: { label: "查看課程", href: "#courses" },
    enrollCta: { label: "預約試聽", href: "#enroll" },
  },
  courses: [
    { id: "c1", name: "課程一", audience: "適合對象", description: "課程說明。", priceLabel: "電洽" },
  ],
  contact: { phone: "" },
};

export default content;
