import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Initialize OpenNext for local development with Cloudflare bindings
initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingExcludes: {
    '*': ['./archive/**/*'],
  },
  // Ignore ESLint warnings during production build (warnings should not block deployment)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
