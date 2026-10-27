import type { EducationSiteContent } from "@evalycloud/content-schema";

const content: EducationSiteContent = {
  site: { name: "機構名稱", language: "zh-TW", template: "classic" },
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
