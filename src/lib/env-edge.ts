import { getRequestContext } from "@cloudflare/next-on-pages";

export function getEnv(key: string) {
  try {
    // Edge runtime (Cloudflare)
    return getRequestContext().env[key];
  } catch {
    // Node runtime (next dev, build time, tests)
    return process.env[key];
  }
}