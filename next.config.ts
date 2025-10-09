import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** @type {import('next').NextConfig} */
    async rewrites() {
      return [
        {
          source: '/',
          destination: '/es/demoglobal',
        },
        {
          source: '/es',
          destination: '/es/demoglobal',
        },
        {
          source: '/en',
          destination: '/en/demoglobal',
      },
    ];
  },
  output: "standalone",
};

module.exports = nextConfig;

export default nextConfig;
