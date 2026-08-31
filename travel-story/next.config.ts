import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  // 发布在原站点二级域名下的独立目录时（如 ke-journey.bordy.cn/travel-story/），
  // 通过环境变量 NEXT_PUBLIC_BASE_PATH=/travel-story 注入；独立域名/端口部署留空。
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
};

export default nextConfig;
