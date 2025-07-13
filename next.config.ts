/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production";

const devImagePatterns = [
  {
    protocol: "http",
    hostname: "localhost",
    port: "5019",
  },
];

const prodImagePatterns = [
  { protocol: "https", hostname: "ensotek.de" },
  { protocol: "https", hostname: "www.ensotek.de" },
];

// Ortak (her ortamda) uzaktan görsel sağlayıcılar:
const sharedImagePatterns = [
  { protocol: "https", hostname: "via.placeholder.com" },
  { protocol: "https", hostname: "res.cloudinary.com" },
  { protocol: "https", hostname: "i.imgur.com" },
  { protocol: "https", hostname: "images.unsplash.com" },
  { protocol: "https", hostname: "cdn.shopify.com" },
];

const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "standalone",
  compiler: {
    styledComponents: true,
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    serverActions: {},
    optimizeCss: true,
    typedRoutes: false,
  },
  images: {
    remotePatterns: [
      ...(isDev ? devImagePatterns : prodImagePatterns),
      ...sharedImagePatterns,
    ],
  },
};

module.exports = nextConfig;
