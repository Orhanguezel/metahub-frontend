// next.config.ts
import { DOMAIN_TENANT_MAP } from "./src/lib/tenant";

const isDev = process.env.NODE_ENV !== "production";
const tenantDomains = Object.keys(DOMAIN_TENANT_MAP);

const devImagePatterns = [
  { protocol: "http", hostname: "localhost", port: "5019", pathname: "/**" },
];

const prodImagePatterns = tenantDomains.map((host) => ({
  protocol: "https",
  hostname: host,
  pathname: "/**",
}));

const sharedImagePatterns = [
  { protocol: "https", hostname: "via.placeholder.com", pathname: "/**" },
  { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
  { protocol: "https", hostname: "i.imgur.com", pathname: "/**" },
  { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
  { protocol: "https", hostname: "cdn.shopify.com", pathname: "/**" },
  { protocol: "https", hostname: "randomuser.me", pathname: "/api/**" },
  { protocol: "https", hostname: "metahub.guezelwebdesign.com", pathname: "/**" },
  { protocol: "https", hostname: "test.guezelwebdesign.com", pathname: "/**" },
  { protocol: "https", hostname: "basemaps.cartocdn.com", pathname: "/**" },
];

const nextConfig = {
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, // ✅ en az 1 header
        ],
      },
    ];
  },
};

export default nextConfig;
