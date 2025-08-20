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

// CDN + paylaşılan kaynaklar (sadece GERÇEK kullandıklarını bırak)
const sharedImagePatterns = [
  { protocol: "https", hostname: "via.placeholder.com", pathname: "/**" },
  { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
  { protocol: "https", hostname: "i.imgur.com", pathname: "/**" },
  { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
  { protocol: "https", hostname: "cdn.shopify.com", pathname: "/**" },

  // 🔵 Senin subdomain'lerin (uzaktan görsel yüklüyorsan tut; aksi halde silebilirsin)
  { protocol: "https", hostname: "metahub.guezelwebdesign.com", pathname: "/**" },
  { protocol: "https", hostname: "test.guezelwebdesign.com", pathname: "/**" },
];

/* ----------------------  CSP: reCAPTCHA + PDF + Görseller  ---------------------- */
// reCAPTCHA domainleri
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

// connect-src (XHR/fetch). API ya da farklı origin'e istek atıyorsan buraya ekle.
const connectSrc = ["'self'", "res.cloudinary.com", ...RECAPTCHA_SCRIPT];
if (isDev) {
  frameSrc.push("http://localhost:5019");
  connectSrc.push("http://localhost:5019");
}

// img-src (görseller). Kendi origin'in için 'self' yeter.
// Başka subdomain'den görsel çekiyorsan ekliyoruz:
const imgSrc = [
  "'self'",
  "data:",
  "blob:",
  "res.cloudinary.com",
  "via.placeholder.com",
  "i.imgur.com",
  "images.unsplash.com",
  "cdn.shopify.com",

  // 🔵 Senin subdomain'lerin (cross-origin görsel kullanıyorsan)
  "metahub.guezelwebdesign.com",
  "test.guezelwebdesign.com",

  // reCAPTCHA/Google görselleri
  "www.google.com",
  "www.gstatic.com",
  "ssl.gstatic.com",
];
if (isDev) imgSrc.push("http://localhost:5019");

// script-src (dev’de unsafe-eval serbest, prod’da kapalı)
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...RECAPTCHA_SCRIPT,
  ...(isDev ? ["'unsafe-eval'"] : []),
];

// script-src-elem (bazı tarayıcılar için element tabanlı direktif gerekli)
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
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
