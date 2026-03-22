import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Previously used `output: "export"` for static-only deployment.
  // Removed to support API routes (Cloudflare Pages Functions / D1 backend).
  // Cloudflare Pages will build with the standard Next.js adapter.
  // See wrangler.toml for D1 binding configuration.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
