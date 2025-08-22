// next.config.ts
import { DOMAIN_TENANT_MAP } from "./src/lib/tenant";

/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production";

// tenant domain’lerini tenant.ts’ten çek
const tenantDomains = Object.keys(DOMAIN_TENANT_MAP);

// next/image izinleri
const devImagePatterns = [
  { protocol: "http", hostname: "localhost", port: "5019", pathname: "/**" },
];

const prodImagePatterns = tenantDomains.map((host) => ({
  protocol: "https",
  hostname: host,
  pathname: "/**",
}));

// CDN + paylaşılan kaynaklar
const sharedImagePatterns = [
  { protocol: "https", hostname: "via.placeholder.com", pathname: "/**" },
  { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
  { protocol: "https", hostname: "i.imgur.com", pathname: "/**" },
  { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
  { protocol: "https", hostname: "cdn.shopify.com", pathname: "/**" },

  // 🔵 Random User (ör: https://randomuser.me/api/portraits/women/45.jpg)
  { protocol: "https", hostname: "randomuser.me", pathname: "/api/**" },

  // 🔵 Sizin subdomain'ler
  { protocol: "https", hostname: "metahub.guezelwebdesign.com", pathname: "/**" },
  { protocol: "https", hostname: "test.guezelwebdesign.com", pathname: "/**" },

  // (İsteğe bağlı) MapLibre sprite/görselleri için next/image kullanırsanız
  { protocol: "https", hostname: "basemaps.cartocdn.com", pathname: "/**" },
];

/* ----------------------  CSP ---------------------- */
// reCAPTCHA
const RECAPTCHA_SCRIPT = [
  "https://www.google.com",
  "https://www.gstatic.com",
  "https://www.recaptcha.net",
];
const RECAPTCHA_FRAME = [
  "https://www.google.com",
  "https://recaptcha.google.com",
  "https://www.recaptcha.net",
];

// frame-src (PDF önizleme & reCAPTCHA)
const frameSrc = ["'self'", "res.cloudinary.com", "docs.google.com", ...RECAPTCHA_FRAME];

// WS/WSS
const wsDev = isDev ? ["ws://localhost:5019"] : [];
const wsProd = !isDev ? tenantDomains.map((host) => `wss://${host}`) : [];

// 🔵 Harita kaynakları (MapLibre/Carto)
const MAP_CONNECT = [
  "https://basemaps.cartocdn.com",    // style.json, tiles, sprite
  "https://fonts.openmaptiles.org",   // glyph pbf
];

// connect-src (XHR/fetch/WebSocket)
const connectSrc = ["'self'", "res.cloudinary.com", ...RECAPTCHA_SCRIPT, ...wsDev, ...wsProd, ...MAP_CONNECT];
if (isDev) {
  frameSrc.push("http://localhost:5019");
  connectSrc.push("http://localhost:5019");
}

// img-src (görseller)
const imgSrc = [
  "'self'",
  "data:",
  "blob:",
  "res.cloudinary.com",
  "via.placeholder.com",
  "i.imgur.com",
  "images.unsplash.com",
  "cdn.shopify.com",

  // 🔵 Random User
  "randomuser.me",

  // 🔵 Sizin subdomain'ler
  "metahub.guezelwebdesign.com",
  "test.guezelwebdesign.com",

  // 🔵 Harita sprite/görselleri (gerekirse)
  "basemaps.cartocdn.com",

  // Google görselleri
  "www.google.com",
  "www.gstatic.com",
  "ssl.gstatic.com",
];
if (isDev) imgSrc.push("http://localhost:5019");

// script-src
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...RECAPTCHA_SCRIPT,
  ...(isDev ? ["'unsafe-eval'"] : []),
];

// script-src-elem
const scriptSrcElem = [
  "'self'",
  "'unsafe-inline'",
  ...RECAPTCHA_SCRIPT,
  ...(isDev ? ["'unsafe-eval'"] : []),
];

const csp = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`,
  `worker-src 'self' blob:`,
  `frame-ancestors 'self'`,

  `script-src ${scriptSrc.join(" ")}`,
  `script-src-elem ${scriptSrcElem.join(" ")}`,

  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' data: https://fonts.gstatic.com`,

  `img-src ${imgSrc.join(" ")}`,
  `frame-src ${frameSrc.join(" ")}`,
  `connect-src ${connectSrc.join(" ")}`,
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
          { key: "Content-Security-Policy", value: csp }, // img-src & connect-src güncel
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
