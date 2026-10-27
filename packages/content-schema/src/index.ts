import type { ThemeName } from "@evalycloud/config";

export type { ThemeName };

/* ------------------------------------------------------------------ *
 * Shared building blocks
 *
 * Anything both kits need lives here exactly once. Per-kit types below
 * compose these rather than redeclaring their own copy.
 * ------------------------------------------------------------------ */

export type LinkItem = {
  label: string;
  href: string;
};

export type ImageRef = {
  /** Path under the customer's images/ folder, e.g. /images/gallery/food.webp */
  src: string;
  alt: string;
};

export type ContactInfo = {
  phone?: string;
  email?: string;
  lineUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  mapUrl?: string;
};

export type SeoMeta = {
  title?: string;
  description?: string;
  ogImage?: string;
};

/**
 * A published Google Sheet used as a live data source.
 *
 * Templates never fetch this themselves — see @evalycloud/external-data.
 * `enabled: false` (or omitting the whole field) keeps the site fully static.
 */
export type SheetSource = {
  enabled: boolean;
  /** File → Share → Publish to web → CSV. */
  csvUrl: string;
  /**
   * Column header in the sheet → field name the mapper expects. Omit it to
   * use the headers as-is (the kit sheet templates already use the right names).
   */
  mapping?: Record<string, string>;
  /** Fields to coerce from text to number; unparseable values are dropped. */
  numberFields?: string[];
  /** Seconds before a rebuild refetches. Only meaningful when not statically exported. */
  revalidateSeconds?: number;
};

/**
 * Several named published sheets, one per concern, each failing independently.
 * The generic single-source `SheetSource` above is one CSV; this groups many.
 * `SheetSourceName` and the loader live in @evalycloud/external-data.
 */
export type MultiSheetConfig = {
  enabled: boolean;
  refreshInterval?: number;
  sources: Partial<Record<string, SheetSource>>;
};

type SiteMetaBase = {
  name: string;
  language: string;
  logo?: string;
  /** Brand palette. Omitted means the default palette. See RFC-001. */
  theme?: ThemeName;
  seo?: SeoMeta;
  /** Single-source live data (used by the Event kit's key/value sheet). */
  sheet?: SheetSource;
  /** One published tab per section; every kit supports it. See docs/GOOGLE_SHEETS_CONTENT.md. */
  sheets?: MultiSheetConfig;
};

/* ------------------------------------------------------------------ *
 * Kits and templates
 *
 * Six templates are planned (RFC-002). The names are declared here so
 * content can be authored against them; the registry in
 * @evalycloud/templates decides which are actually implemented and falls
 * back safely for the rest.
 * ------------------------------------------------------------------ */

export type KitName = "business" | "restaurant" | "event" | "education" | "portfolio";

export type BusinessTemplateName = "classic" | "visual" | "minimal";
export type RestaurantTemplateName = "classic" | "visual" | "minimal";
export type EventTemplateName = "classic" | "festival" | "minimal";
export type EducationTemplateName = "classic" | "playful" | "minimal";
export type PortfolioTemplateName = "classic" | "visual" | "minimal";

export type TemplateNameByKit = {
  business: BusinessTemplateName;
  restaurant: RestaurantTemplateName;
  event: EventTemplateName;
  education: EducationTemplateName;
  portfolio: PortfolioTemplateName;
};

export type TemplateNameFor<K extends KitName> = TemplateNameByKit[K];

/**
 * The full product matrix, as data. The registry decides which of these are
 * actually implemented; this is the planning surface. See RFC-002.
 */
export const templateMatrix: { [K in KitName]: TemplateNameByKit[K][] } = {
  business: ["classic", "visual", "minimal"],
  restaurant: ["classic", "visual", "minimal"],
  event: ["classic", "festival", "minimal"],
  education: ["classic", "playful", "minimal"],
  portfolio: ["classic", "visual", "minimal"],
};

export const kitNames = Object.keys(templateMatrix) as KitName[];

/* ------------------------------------------------------------------ *
 * Business kit
 * ------------------------------------------------------------------ */

/**
 * Headings for sections whose titles are not part of the content itself.
 * Omitted values fall back to a built-in label for `site.language`.
 */
export type BusinessSectionLabels = {
  services?: string;
  gallery?: string;
  faq?: string;
  contact?: string;
};

export type BusinessSiteContent = {
  site: SiteMetaBase & {
    /** Defaults to "classic". */
    template?: BusinessTemplateName;
  };
  hero: {
    eyebrow?: string;
    title: string;
    subtitle: string;
    primaryCta: LinkItem;
    secondaryCta?: LinkItem;
  };
  about: {
    title: string;
    description: string;
  };
  services: Array<{
    title: string;
    description: string;
  }>;
  gallery: ImageRef[];
  faq: Array<{
    question: string;
    answer: string;
  }>;
  contact: ContactInfo;
  labels?: BusinessSectionLabels;
};

/* ------------------------------------------------------------------ *
 * Event kit
 * ------------------------------------------------------------------ */

export type EventStatus = "upcoming" | "open" | "closed" | "completed" | "archived";

export type EventScheduleItem = {
  time: string;
  title: string;
  description?: string;
  location?: string;
};

export type EventScheduleDay = {
  label: string;
  date: string;
  items: EventScheduleItem[];
};

export type EventSpeaker = {
  name: string;
  /** Job title, affiliation, or for a market stall: what they sell. */
  role?: string;
  bio?: string;
  photo?: ImageRef;
  link?: LinkItem;
};

export type EventSponsor = {
  name: string;
  /** Free-form so organizers can use their own wording (主辦/協辦/贊助). */
  tier?: string;
  logo?: ImageRef;
  url?: string;
};

export type EventSectionLabels = {
  schedule?: string;
  speakers?: string;
  venue?: string;
  registration?: string;
  announcements?: string;
  faq?: string;
  sponsors?: string;
};

export type EventSiteContent = {
  site: SiteMetaBase & {
    status: EventStatus;
    /** Defaults to "classic". */
    template?: EventTemplateName;
  };
  hero: {
    title: string;
    subtitle: string;
    dateLabel: string;
    locationLabel: string;
    registrationCta?: LinkItem;
  };
  overview: {
    title: string;
    description: string;
    organizer?: string;
  };
  schedule: EventScheduleDay[];
  speakers?: EventSpeaker[];
  venue: {
    name: string;
    address: string;
    mapUrl?: string;
    transportNotes?: string[];
  };
  announcements: Array<{
    date: string;
    title: string;
    body: string;
  }>;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  sponsors?: EventSponsor[];
  contact: ContactInfo;
  labels?: EventSectionLabels;
};

/* ------------------------------------------------------------------ *
 * Restaurant kit
 * ------------------------------------------------------------------ */

/** Built-in meaning tags. Free-form strings are also allowed. */
export type MenuItemTag = "signature" | "popular" | "new" | "vegetarian" | "vegan" | "spicy" | "limited";

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  /**
   * Numeric price for items that have one. Kept separate from priceLabel so
   * "時價" / "請洽詢" never has to be coerced into a number.
   */
  price?: number;
  /** Free-form price text: "時價", "請洽詢", "依人數報價". Wins over price when both are set. */
  priceLabel?: string;
  currency?: string;
  image?: ImageRef;
  tags?: Array<MenuItemTag | string>;
  featured?: boolean;
  isNew?: boolean;
  soldOut?: boolean;
  sort?: number;
};

export type MenuCategory = {
  id: string;
  name: string;
  description?: string;
  sort?: number;
  items: MenuItem[];
};

export type OpeningHoursDay = {
  /** ISO-ish day key; templates map it to a localized label. */
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  closed?: boolean;
  /** First service window. */
  open1?: string;
  close1?: string;
  /** Optional second window (split shift). */
  open2?: string;
  close2?: string;
  note?: string;
  sort?: number;
};

export type RestaurantSectionLabels = {
  about?: string;
  featured?: string;
  menu?: string;
  promotions?: string;
  hours?: string;
  location?: string;
  reservation?: string;
  gallery?: string;
  faq?: string;
};

export type RestaurantSiteContent = {
  site: SiteMetaBase & {
    /** Defaults to "classic". */
    template?: RestaurantTemplateName;
    /** Currency applied to menu items that omit their own. Defaults to "TWD". */
    currency?: string;
  };
  hero: {
    name: string;
    /** Latin or secondary name shown under the main one. */
    subtitle?: string;
    tagline?: string;
    intro?: string;
    image?: ImageRef;
    menuCta?: LinkItem;
    reservationCta?: LinkItem;
    areaLabel?: string;
    /** Short "open today until 21:00" style line, if the customer wants one. */
    hoursSummary?: string;
  };
  about?: {
    title: string;
    description: string;
  };
  /** Highlighted items, referenced by id from the menu or defined inline. */
  featured?: MenuItem[];
  menu: MenuCategory[];
  promotions?: Array<{
    id: string;
    title: string;
    body: string;
    enabled?: boolean;
    sort?: number;
  }>;
  openingHours?: OpeningHoursDay[];
  venue: {
    name?: string;
    address: string;
    mapUrl?: string;
    transportNotes?: string[];
  };
  /** Reservation is external-link only — no booking backend. */
  reservation?: {
    intro?: string;
    phone?: string;
    lineUrl?: string;
    formUrl?: string;
    platformUrl?: string;
    platformLabel?: string;
  };
  gallery?: ImageRef[];
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  contact: ContactInfo;
  labels?: RestaurantSectionLabels;
};

/* ------------------------------------------------------------------ *
 * Education kit
 *
 * For a cram school, language centre, studio, or training provider:
 * introduce the institution, list courses, show teachers, answer the
 * questions parents actually ask, and point at enrolment (external link).
 * ------------------------------------------------------------------ */

export type Course = {
  id: string;
  name: string;
  /** e.g. "國小三年級以上", "成人初階". */
  audience?: string;
  description?: string;
  /** Free-form so it can say "電洽", "體驗免費", or a number with unit. */
  priceLabel?: string;
  /** e.g. "每週二、四 18:00–20:00". */
  schedule?: string;
  /** e.g. "8 週 / 16 堂". */
  duration?: string;
  image?: ImageRef;
  tags?: string[];
  featured?: boolean;
  sort?: number;
};

export type Teacher = {
  name: string;
  title?: string;
  bio?: string;
  photo?: ImageRef;
  subjects?: string[];
};

export type EducationSectionLabels = {
  about?: string;
  courses?: string;
  teachers?: string;
  features?: string;
  faq?: string;
  enroll?: string;
  gallery?: string;
};

export type EducationSiteContent = {
  site: SiteMetaBase & {
    /** Defaults to "classic". */
    template?: EducationTemplateName;
  };
  hero: {
    name: string;
    subtitle?: string;
    tagline?: string;
    intro?: string;
    image?: ImageRef;
    enrollCta?: LinkItem;
    coursesCta?: LinkItem;
  };
  about?: {
    title: string;
    description: string;
  };
  /** Short selling points: small classes, certified teachers, etc. */
  features?: Array<{
    title: string;
    description: string;
  }>;
  courses: Course[];
  teachers?: Teacher[];
  gallery?: ImageRef[];
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  /** Enrolment is external-link only — no application backend. */
  enrollment?: {
    intro?: string;
    phone?: string;
    lineUrl?: string;
    formUrl?: string;
  };
  venue?: {
    name?: string;
    address: string;
    mapUrl?: string;
    transportNotes?: string[];
  };
  contact: ContactInfo;
  labels?: EducationSectionLabels;
};

/* ------------------------------------------------------------------ *
 * Portfolio kit
 *
 * For a designer, photographer, illustrator, studio, or freelancer:
 * lead with the work, say who you are, list what you offer, and make
 * contact easy.
 * ------------------------------------------------------------------ */

export type PortfolioProject = {
  id: string;
  title: string;
  /** Client, year, or category — shown as a small line under the title. */
  meta?: string;
  description?: string;
  cover?: ImageRef;
  /** Additional images shown when the project is opened/expanded. */
  images?: ImageRef[];
  tags?: string[];
  url?: LinkItem;
  featured?: boolean;
  sort?: number;
};

export type PortfolioSectionLabels = {
  about?: string;
  work?: string;
  services?: string;
  clients?: string;
  contact?: string;
};

export type PortfolioSiteContent = {
  site: SiteMetaBase & {
    /** Defaults to "classic". */
    template?: PortfolioTemplateName;
  };
  hero: {
    name: string;
    /** Role or discipline: "平面設計師", "Photographer". */
    role?: string;
    tagline?: string;
    intro?: string;
    image?: ImageRef;
    workCta?: LinkItem;
    contactCta?: LinkItem;
  };
  about?: {
    title: string;
    description: string;
    image?: ImageRef;
  };
  projects: PortfolioProject[];
  services?: Array<{
    title: string;
    description: string;
  }>;
  /** Logos or names of past clients. */
  clients?: Array<{
    name: string;
    logo?: ImageRef;
  }>;
  contact: ContactInfo;
  labels?: PortfolioSectionLabels;
};

export type KitContent = {
  business: BusinessSiteContent;
  restaurant: RestaurantSiteContent;
  event: EventSiteContent;
  education: EducationSiteContent;
  portfolio: PortfolioSiteContent;
};
