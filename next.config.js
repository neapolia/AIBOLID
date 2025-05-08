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
  // Отключаем Edge Runtime глобально
  runtime: 'nodejs',
  // Отключаем Edge Runtime для всех API роутов
  api: {
    runtime: 'nodejs'
  }
};

module.exports = nextConfig;