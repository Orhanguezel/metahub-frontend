/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production";
const devHost = "localhost";
const devPort = "5014";
const prodHosts = ["ensotek.de", "www.ensotek.de"];

const imageDomains = isDev
  ? [
      {
        protocol: "http",
        hostname: devHost,
        port: devPort,
      },
    ]
  : prodHosts.map((host) => ({
      protocol: "https",
      hostname: host,
    }));

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
      ...imageDomains,
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "www.ensotek.de",
      },
    ],
  },
};

module.exports = nextConfig;
