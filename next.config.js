/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /node_modules\/@next\/eslint-plugin-next/ },
    ];
    return config;
  },
};

module.exports = nextConfig; 