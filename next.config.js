/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    suppressHydrationWarning: true,
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  }
}

module.exports = nextConfig; 