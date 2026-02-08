import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  
  // 图片优化
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // 压缩
  compress: true,
  
  // 生产环境特定配置
  ...(process.env.NODE_ENV === 'production' ? {
    // 关闭 source maps（生产环境）
    productionBrowserSourceMaps: false,
  } : {}),
};

export default nextConfig;
