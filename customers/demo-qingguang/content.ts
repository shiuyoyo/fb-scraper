import type { BusinessSiteContent } from "@evalycloud/content-schema";

// Placeholder copy. Everything a customer sees comes from this one object.
const content: BusinessSiteContent = {
  site: {
    name: "晴光室內設計",
    language: "zh-TW",
    template: "classic",
  },
  hero: {
    eyebrow: "住宅與商空設計",
    title: "把你想要的生活，蓋成一個空間",
    subtitle:
      "從丈量、規劃到施工監造，一組團隊負責到底。十二年來完成兩百多個住宅與店面案子。",
    primaryCta: { label: "免費諮詢", href: "#contact" },
    secondaryCta: { label: "看看作品", href: "#gallery" },
  },
  about: {
    title: "關於我們",
    description:
      "我們相信好的空間不是把型錄搬回家，而是讓動線、採光和收納配合真正住在裡面的人。每個案子都由主設計師親自跟到完工。",
  },
  services: [
    { title: "住宅設計", description: "新成屋、中古屋翻修、老屋改造，含全室規劃與系統櫃。" },
    { title: "商業空間", description: "餐飲、零售、辦公室的空間規劃與品牌感營造。" },
    { title: "施工監造", description: "工班管理、進度追蹤、驗收把關，屋主不必自己跑工地。" },
  ],
  gallery: [
    { src: "/images/placeholder-1.svg", alt: "北歐風客廳，淺色木地板與大面採光" },
    { src: "/images/placeholder-2.svg", alt: "開放式廚房中島，搭配吧檯座位" },
    { src: "/images/placeholder-3.svg", alt: "主臥室系統衣櫃與臥榻設計" },
    { src: "/images/placeholder-4.svg", alt: "咖啡店店面，水泥牆面與木質吧台" },
    { src: "/images/placeholder-5.svg", alt: "小坪數書房兼客房的多功能空間" },
    { src: "/images/placeholder-6.svg", alt: "辦公室會議區，玻璃隔間與植栽" },
  ],
  faq: [
    {
      question: "設計費怎麼計算？",
      answer: "以室內坪數計價，丈量與初次諮詢不收費。報價會列出設計、監造與工程三段費用，簽約前不會有額外項目。",
    },
    {
      question: "從簽約到完工大概要多久？",
      answer: "一般三十坪住宅約三到四個月，含設計討論與施工。老屋翻修因為管線更換，通常會多一個月。",
    },
    {
      question: "可以只做設計不做施工嗎？",
      answer: "可以。我們提供純設計方案，交付完整圖說讓你自行發包，也可以協助審核其他工班的報價單。",
    },
    {
      question: "完工後有保固嗎？",
      answer: "工程項目保固兩年，系統櫃五金依原廠保固。保固期內的問題由我們統一窗口處理。",
    },
  ],
  contact: {
    phone: "02-2345-6789",
    email: "hello@example.com",
    lineUrl: "https://line.me/",
    instagramUrl: "https://instagram.com/",
    mapUrl: "https://maps.google.com/",
  },
};

export default content;
