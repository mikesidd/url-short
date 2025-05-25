/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: true,
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /node_modules\/@next\/eslint-plugin-next/ },
    ];
    return config;
  },
};

module.exports = nextConfig; 