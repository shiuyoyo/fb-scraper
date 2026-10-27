import type { EducationSiteContent } from "@evalycloud/content-schema";

const content: EducationSiteContent = {
  site: { name: "晨光語言學苑", language: "zh-TW", template: "classic", theme: "ocean" },
  hero: {
    name: "晨光語言學苑",
    subtitle: "Morning Light Language Academy",
    tagline: "把語言變成孩子帶得走的能力",
    intro: "小班制英語與日語教學，第十二年。重視開口，不只考試。",
    coursesCta: { label: "查看課程", href: "#courses" },
    enrollCta: { label: "預約試聽", href: "#enroll" },
  },
  about: {
    title: "關於晨光",
    description: "我們相信語言是用出來的。每班不超過八人，每堂課都要求孩子開口。師資皆有實際教學經驗與檢定資格。",
  },
  features: [
    { title: "小班制", description: "每班最多 8 人，老師顧得到每個孩子。" },
    { title: "重視口說", description: "每堂課都有開口練習，不只寫考卷。" },
    { title: "定期回報", description: "每月一次學習回報，家長掌握進度。" },
  ],
  courses: [
    { id: "c1", name: "兒童美語（初階）", audience: "國小一至三年級", description: "從自然發音開始，建立聽說基礎。", schedule: "每週二、四 17:00–18:30", duration: "12 週 / 24 堂", priceLabel: "電洽", featured: true },
    { id: "c2", name: "兒童美語（進階）", audience: "國小四至六年級", description: "閱讀與寫作並重，銜接國中課程。", schedule: "每週一、三 18:00–19:30", duration: "12 週 / 24 堂", priceLabel: "電洽" },
    { id: "c3", name: "成人日語入門", audience: "零基礎成人", description: "從五十音到日常會話。", schedule: "每週六 10:00–12:00", duration: "16 週 / 16 堂", priceLabel: "體驗課免費" },
  ],
  teachers: [
    { name: "王曉明", title: "英語科主任", bio: "十年兒童美語教學經驗。", subjects: ["兒童美語", "會話"] },
    { name: "陳美惠", title: "日語講師", bio: "留日五年，專長初階教學。", subjects: ["日語", "檢定"] },
  ],
  gallery: [],
  faq: [
    { question: "可以先試聽嗎？", answer: "可以，歡迎預約一堂免費試聽,再決定是否報名。" },
    { question: "缺課可以補課嗎？", answer: "同一課程若有其他班次,可安排補課,請提前告知。" },
    { question: "有寒暑假班嗎？", answer: "有,寒暑假開設密集班,詳情請洽櫃檯。" },
  ],
  enrollment: {
    intro: "歡迎預約試聽或來電諮詢課程與費用。",
    phone: "04-1234-5678",
    lineUrl: "https://line.me/",
    formUrl: "https://forms.gle/",
  },
  venue: { name: "晨光語言學苑", address: "台中市示範區學府路 25 號 3 樓", mapUrl: "https://maps.google.com/", transportNotes: ["捷運學府站步行 3 分鐘。"] },
  contact: { phone: "04-1234-5678", email: "hello@example.com", lineUrl: "https://line.me/" },
};

export default content;
