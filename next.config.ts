import dotenv from "dotenv";

const tenant = process.env.TENANT || "local";
dotenv.config({ path: `.env.${tenant}` });

const isDev = process.env.NODE_ENV !== "production";
const devHost = "localhost";
const devPort = "5019";

// Tenant-specific hostnames
const tenantHosts: Record<string, string[]> = {
  anastasia: ["koenigsmassage.com", "www.koenigsmassage.com"],
  metahub: ["guezelwebdesign.com", "www.guezelwebdesign.com"],
  ensotek: ["ensotek.de", "www.ensotek.de"],
  local: ["localhost"],
};

const prodHosts = tenantHosts[tenant] || ["localhost"];

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
  reactStrictMode: true,
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

  env: {
    TENANT_NAME: process.env.TENANT_NAME,
    API_BASE_URL: process.env.API_BASE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  },
};

export default nextConfig;
