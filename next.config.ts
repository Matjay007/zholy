import type { NextConfig } from "next";

/**
 * ZHOLY — standalone Voice AI Platform
 * Served at zholy.com (root domain, no basePath)
 */
const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,
};

export default nextConfig;
