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
  experimental: {
    outputFileTracingExcludes: {
      '*': ['./archive/**/*'],
    },
  },
};

export default nextConfig;
