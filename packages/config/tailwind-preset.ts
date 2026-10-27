import type { Config } from "tailwindcss";

/**
 * Shared Tailwind preset for all EvalyCloud apps.
 *
 * Brand colors resolve to CSS custom properties so a site can be re-themed by
 * content alone, with no rebuild. The variables are emitted by `themeStyle()`
 * in ./themes.ts — palette values live there, never here.
 *
 * Content globs are relative to the consuming app's directory (apps/<name>),
 * so every app must sit at the same depth.
 *
 * Note: the Product Bible spacing scale (8/16/24/32/48/64 px) already maps to
 * Tailwind's default 2/4/6/8/12/16 steps, so no spacing override is needed.
 */
const brand = {
  primary: {
    DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
    hover: "rgb(var(--color-primary-hover) / <alpha-value>)",
  },
  accent: "rgb(var(--color-accent) / <alpha-value>)",
  background: "rgb(var(--color-background) / <alpha-value>)",
  surface: "rgb(var(--color-surface) / <alpha-value>)",
  foreground: "rgb(var(--color-foreground) / <alpha-value>)",
  border: "rgb(var(--color-border) / <alpha-value>)",
};

const preset = {
  // content is set per-app (see each app's tailwind.config.ts) so the globs
  // resolve relative to a known location regardless of build CWD.
  theme: {
    extend: {
      colors: {
        ...brand,
        // Semantic colors are fixed and do not follow the brand palette.
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      // Makes the bare `border` utility pick up the themed border color.
      borderColor: {
        DEFAULT: brand.border,
      },
      borderRadius: {
        // Product Bible radius. Matches Tailwind's default xl, kept explicit
        // so the value is traceable to the design system.
        xl: "12px",
      },
      fontFamily: {
        sans: [
          // Inter covers Latin only. Chinese deliberately falls through to the
          // platform's system font — no CJK webfont is shipped, because a
          // Traditional Chinese webfont costs far more bytes than it earns on
          // the mobile connections these sites are actually read on.
          "var(--font-inter)",
          "'PingFang TC'",
          "'Noto Sans TC'",
          "'Noto Sans CJK TC'",
          "'Microsoft JhengHei'",
          "'微軟正黑體'",
          "'Heiti TC'",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "'Segoe UI'",
          "Roboto",
          "'Helvetica Neue'",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
} satisfies Partial<Config>;

export default preset;
