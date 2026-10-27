/**
 * Theme palettes — the single source of truth for brand color.
 *
 * See docs/RFC/RFC-001-configurable-brand-color.md.
 * Every value here is WCAG AA checked: white text on primary / primaryHover /
 * accent, and foreground on background / surface, all reach at least 4.5:1.
 *
 * Semantic colors (success / warning / danger) intentionally do NOT follow the
 * brand — they carry meaning, not identity — and live in the Tailwind preset.
 */

export type ThemeName = "ocean" | "forest" | "ivory" | "terracotta" | "plum";

export type ThemePalette = {
  /** Display name used in sales material and demos. */
  label: string;
  /** Short note on the kind of business this palette suits. */
  suitedFor: string;
  primary: string;
  primaryHover: string;
  accent: string;
  background: string;
  surface: string;
  foreground: string;
  border: string;
};

export const defaultTheme: ThemeName = "ocean";

export const themes: Record<ThemeName, ThemePalette> = {
  ocean: {
    label: "專業海藍",
    suitedFor: "科技、資訊服務、顧問、診所",
    primary: "#2563EB",
    primaryHover: "#1D4ED8",
    accent: "#0E7490",
    background: "#FFFFFF",
    surface: "#F8FAFC",
    foreground: "#0F172A",
    border: "#E2E8F0",
  },
  forest: {
    label: "自然墨綠",
    suitedFor: "有機食品、農產、環保、療癒、居家",
    primary: "#15803D",
    primaryHover: "#166534",
    accent: "#4D7C0F",
    background: "#FFFFFF",
    surface: "#F5F7F1",
    foreground: "#1A2B20",
    border: "#E3E9DE",
  },
  ivory: {
    label: "象牙石板",
    suitedFor: "顧問、律師、攝影、婚紗、精品",
    primary: "#334155",
    primaryHover: "#1E293B",
    accent: "#57534E",
    background: "#FBFAF7",
    surface: "#F3F1EC",
    foreground: "#1C1917",
    border: "#E7E5E4",
  },
  terracotta: {
    label: "暖陶土",
    suitedFor: "餐飲、咖啡、烘焙、市集、零售",
    primary: "#C2410C",
    primaryHover: "#9A3412",
    accent: "#B45309",
    background: "#FFFDFB",
    surface: "#FDF4EC",
    foreground: "#1F1A17",
    border: "#EFE0D2",
  },
  plum: {
    label: "質感紫",
    suitedFor: "美業、美妝、課程、講座、藝文",
    primary: "#6D28D9",
    primaryHover: "#5B21B6",
    accent: "#7E22CE",
    background: "#FFFFFF",
    surface: "#FAF7FF",
    foreground: "#1E1B2E",
    border: "#E9E3F5",
  },
};

export const themeNames = Object.keys(themes) as ThemeName[];

/**
 * Tailwind resolves colors as `rgb(var(--color-x) / <alpha-value>)`, so the
 * variables must hold space-separated RGB channels, not a hex string.
 * "#2563EB" -> "37 99 235"
 */
function toChannels(hex: string): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/**
 * CSS custom properties for a palette, ready to spread onto a style prop.
 * Unknown or omitted names fall back to the default palette.
 */
export function themeStyle(theme?: ThemeName): Record<string, string> {
  const palette = (theme && themes[theme]) || themes[defaultTheme];

  return {
    "--color-primary": toChannels(palette.primary),
    "--color-primary-hover": toChannels(palette.primaryHover),
    "--color-accent": toChannels(palette.accent),
    "--color-background": toChannels(palette.background),
    "--color-surface": toChannels(palette.surface),
    "--color-foreground": toChannels(palette.foreground),
    "--color-border": toChannels(palette.border),
  };
}
