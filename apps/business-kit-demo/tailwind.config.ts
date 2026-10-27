import type { Config } from "tailwindcss";
import preset from "../../packages/config/tailwind-preset";

export default {
  presets: [preset],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/templates/src/**/*.{js,ts,jsx,tsx}",
  ],
} satisfies Config;
