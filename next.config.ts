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
  
  // Optimizaciones de rendimiento
  compress: true,
  poweredByHeader: false,
  
  // Optimización de imágenes
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  
  // Reducir bundle size
  swcMinify: true,
  
  // Headers de cache
  async headers() {
    return [
      {
        source: '/videos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

export default nextConfig;