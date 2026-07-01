import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.71"],
  images: {
    dangerouslyAllowLocalIP: isDev,
    qualities: [90, 75, 85],
    unoptimized: true,
    minimumCacheTTL: 60 * 60 * 24 * 30, //30 days
    domains: [
      "192.168.100.18",
      "192.168.100.23",
      "192.168.1.68",
      "images.pexels.com",
      "api.medishop.dworklabs.com",
      "images.unsplash.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "api.medishop.dworklabs.com",
        port: "",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "api.medishop.dworklabs.com",
        port: "",
        pathname: "/assets/img/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "192.168.1.69",
        port: "8002",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "192.168.1.69",
        port: "8000",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
