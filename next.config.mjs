// Conditionally setup Cloudflare dev platform
if (process.env.NODE_ENV === 'development' && !process.env.SKIP_CF_SETUP) {
  try {
    const { setupDevPlatform } = await import('@cloudflare/next-on-pages/next-dev');
    await setupDevPlatform();
  } catch (error) {
    console.warn('Cloudflare dev setup failed, continuing without bindings:', error.message);
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingExcludes: {
    '*': ['./archive/**/*'],
  },
  webpack: (config, { isServer, nextRuntime }) => {
    if (nextRuntime === 'edge') {
      // For edge runtime, exclude SQLite-related modules
      config.resolve.alias = {
        ...config.resolve.alias,
        'better-sqlite3': false,
        './sqlite': false,
        './sqlite.js': false,
      };
    } else if (!isServer) {
      // For client-side, add fallbacks
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;