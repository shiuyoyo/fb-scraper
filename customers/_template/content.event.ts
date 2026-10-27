import type { EventSiteContent } from "@evalycloud/content-schema";

const content: EventSiteContent = {
  site: {
    name: "活動名稱",
    language: "zh-TW",
    template: "classic",
    status: "upcoming", // upcoming | open | closed | completed | archived
    // theme: "ocean" | "forest" | "ivory" | "terracotta" | "plum"
  },
  hero: {
    title: "活動名稱",
    subtitle: "一句話說明這是什麼活動。",
    dateLabel: "2026.01.01–2026.01.02",
    locationLabel: "場地名稱",
    // registrationCta: { label: "立即報名", href: "" },
  },
  overview: {
    title: "活動簡介",
    description: "活動內容、對象、為什麼要來。",
    // organizer: "主辦單位",
  },
  schedule: [
    {
      label: "第一天",
      date: "2026.01.01",
      items: [{ time: "10:00", title: "開場" }],
    },
  ],
  announcements: [],
  venue: {
    name: "場地名稱",
    address: "地址",
    // mapUrl: "",
    // transportNotes: ["捷運…", "停車…"],
  },
  contact: {
    phone: "",
    email: "",
  },
};

export default content;
