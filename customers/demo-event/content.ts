import type { EventSiteContent } from "@evalycloud/content-schema";

// Placeholder copy. Everything a visitor sees comes from this one object.
const content: EventSiteContent = {
  site: {
    name: "溪畔社區藝術節",
    language: "zh-TW",
    status: "open",
    template: "classic",
    // 舊版的單一即時狀態分頁,仍然支援。新客戶請改用下面 sheets.site 分頁的
    // status / notice / registered / capacity 四列。兩者都要重新建置才會生效。
    sheet: {
      enabled: false,
      csvUrl: "",
      mapping: { key: "key", value: "value" },
    },
    // 每個試算表分頁各自「發布到網路 → CSV」,把網址貼進對應的 csvUrl。
    // csvUrl 留空 = 該分頁停用,那一段就用下面的本地內容。
    // 分頁範本:pnpm sheet:template <slug>。說明:docs/GOOGLE_SHEETS_CONTENT.md
    sheets: {
      enabled: true,
      sources: {
        site: { enabled: true, csvUrl: "" },
        schedule: { enabled: true, csvUrl: "" },
        speakers: { enabled: true, csvUrl: "" },
        announcements: { enabled: true, csvUrl: "" },
        faq: { enabled: true, csvUrl: "" },
        sponsors: { enabled: true, csvUrl: "" },
      },
    },
  },
  hero: {
    title: "溪畔社區藝術節",
    subtitle: "兩天的音樂、手作與在地food，沿著河堤一路擺到晚上。",
    dateLabel: "2026.08.15–2026.08.16",
    locationLabel: "溪畔河濱公園",
    registrationCta: { label: "免費索票", href: "#register" },
  },
  overview: {
    title: "活動簡介",
    description:
      "第六屆溪畔社區藝術節，集合三十組在地攤位與八場演出。適合全家參加，現場備有輪椅通道與哺乳室。",
    organizer: "溪畔社區發展協會",
  },
  schedule: [
    {
      label: "第一天",
      date: "2026.08.15（六）",
      items: [
        { time: "10:00", title: "市集開場", description: "三十組攤位同步開始。", location: "河堤大道" },
        { time: "14:00", title: "兒童手作工作坊", description: "限額二十組親子，現場報名。", location: "工作坊帳篷" },
        { time: "19:00", title: "夜間音樂會", description: "四組在地樂團接力演出。", location: "主舞台" },
      ],
    },
    {
      label: "第二天",
      date: "2026.08.16（日）",
      items: [
        { time: "10:00", title: "市集開場", location: "河堤大道" },
        { time: "15:00", title: "社區紀錄片放映", description: "映後與導演座談。", location: "活動中心" },
        { time: "18:30", title: "閉幕演出", location: "主舞台" },
      ],
    },
  ],
  speakers: [
    { name: "林向晚", role: "獨立音樂人", bio: "在地出身，第三年參與藝術節演出。" },
    { name: "陳品瑜", role: "紀錄片導演", bio: "作品長期關注河川與社區生活。" },
    { name: "溪畔木工班", role: "手作工作坊", bio: "帶大小朋友用漂流木做小物。" },
  ],
  venue: {
    name: "溪畔河濱公園",
    address: "示範縣示範鄉河堤路一段",
    mapUrl: "https://maps.google.com/",
    transportNotes: [
      "公車 302、305 於「河濱公園」站下車，步行三分鐘。",
      "自行開車請停活動中心停車場，週末免費。",
      "活動期間河堤路封閉，請勿臨停。",
    ],
  },
  announcements: [
    { date: "2026.07.20", title: "索票開放", body: "免費索票即日起開放，每人限索四張。" },
    { date: "2026.07.05", title: "攤位名單公布", body: "三十組攤位名單已公布於社群頁面。" },
  ],
  faq: [
    { question: "需要門票嗎？", answer: "免費入場。演出區域為維持品質採索票制，市集則自由參觀。" },
    { question: "下雨會取消嗎？", answer: "小雨照常。若因颱風或豪雨調整，會在本頁公告欄第一時間更新。" },
    { question: "可以帶寵物嗎？", answer: "可以，請繫繩並自行清理。演出區域禁止進入。" },
  ],
  sponsors: [
    { name: "示範縣文化局", tier: "指導單位" },
    { name: "溪畔社區發展協會", tier: "主辦單位" },
    { name: "在地商圈聯誼會", tier: "協辦單位" },
  ],
  contact: {
    phone: "03-1234-5678",
    email: "festival@example.com",
    lineUrl: "https://line.me/",
  },
};

export default content;
