import type { RestaurantSiteContent } from "@evalycloud/content-schema";

// Placeholder copy for a fictional vegetarian restaurant. All values here are
// the local fallback; a customer's published Google Sheet can override them.
const content: RestaurantSiteContent = {
  site: {
    name: "森日蔬食",
    language: "zh-TW",
    template: "classic",
    theme: "forest",
    currency: "TWD",
    // Enable and fill csvUrl per source to let the sheet override content.
    // See docs/GOOGLE_SHEETS_CONTENT.md. Disabled here so the demo is static.
    sheets: {
      enabled: true,
      sources: {
        // 每個分頁各自「發布到網路 → CSV」,把網址貼進對應的 csvUrl。
        // csvUrl 留空 = 該分頁停用,那一段就用下面的本地內容。
        site: {
          enabled: true,
          csvUrl:
            "https://docs.google.com/spreadsheets/d/e/2PACX-1vQlICWDkw79pY6Yk9kjcplBuphDGGMAQoYPUXha7lSEJnaPzGgnRFvAzJZrx0QvNUqW9aVML4IGt8u6/pub?gid=0&single=true&output=csv",
          mapping: { key: "key", value: "value" },
        },
        featured: {
          enabled: true,
          csvUrl: "",
          mapping: {
            item_id: "item_id",
            item_name: "item_name",
            item_description: "item_description",
            price: "price",
            price_label: "price_label",
            currency: "currency",
            tags: "tags",
            sold_out: "sold_out",
            item_sort: "item_sort",
          },
        },
        menu: {
          enabled: true,
          csvUrl: "",
          mapping: {
            category_id: "category_id",
            category_name: "category_name",
            category_description: "category_description",
            category_sort: "category_sort",
            item_id: "item_id",
            item_name: "item_name",
            item_description: "item_description",
            price: "price",
            price_label: "price_label",
            currency: "currency",
            tags: "tags",
            featured: "featured",
            new_item: "new_item",
            sold_out: "sold_out",
            item_sort: "item_sort",
          },
        },
        openingHours: {
          enabled: true,
          csvUrl: "",
          mapping: {
            day: "day",
            closed: "closed",
            open_1: "open_1",
            close_1: "close_1",
            open_2: "open_2",
            close_2: "close_2",
            note: "note",
            sort_order: "sort_order",
          },
        },
        announcements: {
          enabled: true,
          csvUrl: "",
          mapping: {
            id: "id",
            title: "title",
            body: "body",
            enabled: "enabled",
            sort_order: "sort_order",
          },
        },
        faq: {
          enabled: true,
          csvUrl: "",
          mapping: {
            id: "id",
            question: "question",
            answer: "answer",
            enabled: "enabled",
            sort_order: "sort_order",
          },
        },
      },
    },
  },
  hero: {
    name: "森日蔬食",
    subtitle: "Sunday Green Kitchen",
    tagline: "讓蔬食成為每天都想吃的料理",
    intro: "使用當季在地食材，做溫暖又有層次的日常蔬食。全店料理皆為蔬食，部分可調整為純素。",
    areaLabel: "高雄・示範區",
    hoursSummary: "今日營業至 21:00",
    menuCta: { label: "查看菜單", href: "#menu" },
    reservationCta: { label: "立即訂位", href: "#reservation" },
  },
  about: {
    title: "關於森日",
    description:
      "森日開在巷子裡的第六年。我們相信蔬食不必是妥協——用心處理食材，青菜也能成為主角。廚房每天現做，menu 隨季節微調。",
  },
  featured: [
    { id: "item-001", name: "炙燒時蔬燉飯", description: "季節蔬菜與香草慢燉，鋪上炙燒杏鮑菇。", price: 320, tags: ["signature", "popular"], featured: true },
    { id: "item-005", name: "森日咖哩鍋", description: "十種蔬菜熬煮的日式咖哩，附糙米飯。", price: 280, tags: ["popular", "vegetarian"], featured: true },
    { id: "item-009", name: "主廚季節料理", description: "依當日市場食材決定，數量有限。", priceLabel: "時價", tags: ["limited"], featured: true },
  ],
  menu: [
    {
      id: "main",
      name: "主餐",
      description: "每日新鮮製作，附季節湯品。",
      sort: 10,
      items: [
        { id: "item-001", name: "炙燒時蔬燉飯", description: "季節蔬菜與香草慢燉。", price: 320, tags: ["signature"], sort: 10 },
        { id: "item-005", name: "森日咖哩鍋", description: "十種蔬菜熬煮的日式咖哩。", price: 280, tags: ["vegetarian"], sort: 20 },
        { id: "item-009", name: "主廚季節料理", description: "依當日市場食材決定。", priceLabel: "時價", tags: ["limited"], isNew: true, sort: 30 },
        { id: "item-010", name: "麻辣乾鍋（售完示範）", description: "重口味乾鍋，微辣。", price: 300, tags: ["spicy"], soldOut: true, sort: 40 },
      ],
    },
    {
      id: "side",
      name: "配菜與小點",
      sort: 20,
      items: [
        { id: "item-002", name: "烤時蔬盤", description: "當季根莖類炭烤。", price: 160, sort: 10 },
        { id: "item-003", name: "溫野菜沙拉", description: "溫熱蔬菜佐胡麻醬。", price: 140, tags: ["vegan"], sort: 20 },
        { id: "item-004", name: "手工餐包", description: "每日現烤，附橄欖油。", price: 80, sort: 30 },
      ],
    },
    {
      id: "drink",
      name: "飲品",
      sort: 30,
      items: [
        { id: "item-006", name: "當季果昔", description: "依水果調整。", price: 120, sort: 10 },
        { id: "item-007", name: "冷萃茶", price: 100, sort: 20 },
        { id: "item-008", name: "手沖咖啡", price: 140, sort: 30 },
      ],
    },
  ],
  promotions: [
    { id: "promo-001", title: "平日午餐優惠", body: "平日 11:30–14:00 主餐套餐贈當日飲品。", enabled: true, sort: 10 },
  ],
  openingHours: [
    { day: "monday", closed: true, note: "公休", sort: 10 },
    { day: "tuesday", open1: "11:30", close1: "14:30", open2: "17:30", close2: "21:00", sort: 20 },
    { day: "wednesday", open1: "11:30", close1: "14:30", open2: "17:30", close2: "21:00", sort: 30 },
    { day: "thursday", open1: "11:30", close1: "14:30", open2: "17:30", close2: "21:00", sort: 40 },
    { day: "friday", open1: "11:30", close1: "14:30", open2: "17:30", close2: "21:00", sort: 50 },
    { day: "saturday", open1: "11:00", close1: "21:00", note: "全天營業", sort: 60 },
    { day: "sunday", open1: "11:00", close1: "21:00", note: "全天營業", sort: 70 },
  ],
  venue: {
    name: "森日蔬食",
    address: "高雄市示範區幸福路 10 號",
    mapUrl: "https://maps.google.com/",
    transportNotes: ["捷運示範站 2 號出口步行 5 分鐘。", "鄰近有付費停車場。"],
  },
  reservation: {
    intro: "建議提前訂位，假日尤其容易客滿。",
    phone: "07-123-4567",
    lineUrl: "https://line.me/",
    formUrl: "https://forms.gle/",
  },
  gallery: [],
  faq: [
    { question: "有提供素食料理嗎？", answer: "全店料理皆為蔬食，部分餐點可調整為純素，點餐時可告知。" },
    { question: "可以帶寵物嗎？", answer: "戶外座位區歡迎攜帶寵物，室內恕不開放。" },
    { question: "有低消嗎？", answer: "用餐時段每位低消一份主餐或兩份小點。" },
  ],
  contact: {
    phone: "07-123-4567",
    email: "hello@example.com",
    lineUrl: "https://line.me/",
    instagramUrl: "https://instagram.com/",
  },
};

export default content;
