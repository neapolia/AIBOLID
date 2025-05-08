/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'aibolid.vercel.app']
    }
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      fs: false,
      perf_hooks: false
    };
    return config;
  },
  // Отключаем Edge Runtime для всего приложения
  runtime: 'nodejs'
};

module.exports = nextConfig;