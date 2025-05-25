import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['app']
  },
  typescript: {
    ignoreBuildErrors: true
  },
  /* config options here */
};

export default nextConfig;
