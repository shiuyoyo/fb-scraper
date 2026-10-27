import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";

const inter = localFont({
  // Self-hosted on purpose — no build-time dependency on Google Fonts.
  src: "../../../packages/config/fonts/inter-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Business Website Kit Demo | EvalyCloud",
  description: "A reusable business website built with EvalyCloud Website Kits.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
