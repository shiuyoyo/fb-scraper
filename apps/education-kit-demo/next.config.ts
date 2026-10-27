import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Cloudflare Pages / Direct Upload. Produces an out/ folder.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  transpilePackages: [
    "@evalycloud/config",
    "@evalycloud/ui",
    "@evalycloud/templates",
    "@evalycloud/content-schema",
    "@evalycloud/external-data",
  ],
};

export default nextConfig;
