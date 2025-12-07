import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getEnv(key: string) {
  try {
    // Edge runtime (Cloudflare)
    return (getCloudflareContext().env as any)[key];
  } catch {
    // Node runtime (next dev, build time, tests)
    return process.env[key];
  }
}