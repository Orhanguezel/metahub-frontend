// next.config.ts
import { DOMAIN_TENANT_MAP } from "./src/lib/tenant";

/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production";

// tenant domain’lerini tenant.ts’ten çek
const tenantDomains = Object.keys(DOMAIN_TENANT_MAP);

// next/image izinleri
const devImagePatterns = [
  { protocol: "http", hostname: "localhost", port: "5019" },
];
const prodImagePatterns = tenantDomains.map((host) => ({
  protocol: "https",
  hostname: host,
}));
const sharedImagePatterns = [
  { protocol: "https", hostname: "via.placeholder.com" },
  { protocol: "https", hostname: "res.cloudinary.com" },
  { protocol: "https", hostname: "i.imgur.com" },
  { protocol: "https", hostname: "images.unsplash.com" },
  { protocol: "https", hostname: "cdn.shopify.com" },
];

// --- CSP (PDF önizleme için frame-src & arkadaşları) ---
const frameSrc = ["'self'", "res.cloudinary.com", "docs.google.com"];
const connectSrc = ["'self'", "res.cloudinary.com"];
if (isDev) {
  frameSrc.push("http://localhost:5019");
  connectSrc.push("http://localhost:5019");
}
const imgSrc = [
  "'self'",
  "data:",
  "blob:",
  "res.cloudinary.com",
  "via.placeholder.com",
  "i.imgur.com",
  "images.unsplash.com",
  "cdn.shopify.com",
];

const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src ${imgSrc.join(" ")}`,
  `frame-src ${frameSrc.join(" ")}`,
  `connect-src ${connectSrc.join(" ")}`,
  `font-src 'self' data:`,
  `object-src 'none'`,
  `base-uri 'self'`,
].join("; ");

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
          // PDF önizleme için gerekli
          { key: "Content-Security-Policy", value: csp },
          // makul güvenlik ekleri
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
