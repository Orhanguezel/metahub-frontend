// frontend/src/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { detectTenantFromHost, getFaviconPathForTenant } from "@/lib/tenant";

function pickHost(req: NextRequest) {
  return req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
}

/* ─────────────────────────────────────────────────────────
 * 1) BASE CSP (tüm tenantlar için ortak taban)
 *    Not: GTM/GA burada YOK — sadece Ensotek’te eklenecek.
 * ───────────────────────────────────────────────────────── */
const BASE_CSP = {
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "object-src": ["'none'"],
  "worker-src": ["'self'", "blob:"],
  "frame-ancestors": ["'self'"],
  "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],

  // Mevcut projedeki reCAPTCHA ve temel izinler
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    // prod’da 'unsafe-eval' kapalı tutmak istersen kaldır; dev’de zaten sorun değil
    ...(process.env.NODE_ENV !== "production" ? ["'unsafe-eval'"] : []),
    "https://www.google.com",
    "https://www.gstatic.com",
    "https://www.recaptcha.net",
  ],
  "script-src-elem": [
    "'self'",
    "'unsafe-inline'",
    ...(process.env.NODE_ENV !== "production" ? ["'unsafe-eval'"] : []),
    "https://www.google.com",
    "https://www.gstatic.com",
    "https://www.recaptcha.net",
  ],

  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "res.cloudinary.com",
    "via.placeholder.com",
    "i.imgur.com",
    "images.unsplash.com",
    "cdn.shopify.com",
    "randomuser.me",
    "basemaps.cartocdn.com",
    "www.google.com",
    "www.gstatic.com",
    "ssl.gstatic.com",
  ],

  "frame-src": [
    "'self'",
    "res.cloudinary.com",
    "docs.google.com",
    "https://www.google.com",
    "https://recaptcha.google.com",
    "https://www.recaptcha.net",
  ],

  "connect-src": [
    "'self'",
    "res.cloudinary.com",
    "https://www.google.com",
    "https://www.gstatic.com",
    "https://www.recaptcha.net",
    "https://basemaps.cartocdn.com",
    "https://fonts.openmaptiles.org",
  ],
} as const;

/* Ensotek için eklenecek GTM/GA kaynakları */
const GTM_GA = [
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
];

/* Dev ortamında ws/http izinleri (isteğe bağlı) */
function extendForDev(csp: Record<string, string[]>) {
  if (process.env.NODE_ENV === "production") return;
  csp["connect-src"].push("http://localhost:5019", "ws://localhost:5019");
  csp["frame-src"].push("http://localhost:5019");
}

/* Tenant-bazlı CSP oluşturucu */
function buildCspForTenant(tenant?: string): string {
  // derin kopya
  const csp: Record<string, string[]> = JSON.parse(JSON.stringify(BASE_CSP));

  if (tenant === "ensotek") {
    // GTM/GA script izinleri
    csp["script-src"].push(...GTM_GA);
    csp["script-src-elem"].push(...GTM_GA);
    // dataLayer/collect istekleri ve görselleri
    csp["connect-src"].push(...GTM_GA);
    csp["img-src"].push(...GTM_GA);
    // <noscript> iframe’i
    csp["frame-src"].push("https://www.googletagmanager.com");
  }

  extendForDev(csp);

  const parts = Object.entries(csp).map(
    ([key, vals]) => `${key} ${Array.from(new Set(vals)).join(" ")}`
  );
  return parts.join("; ");
}

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const { pathname } = url;

  // ── Favicon/Apple ikonlarını tenant faviconlarına rewrite et
  if (pathname === "/favicon.ico") {
    const tenant = detectTenantFromHost(pickHost(req)) || "metahub";
    url.pathname = getFaviconPathForTenant(tenant); // /favicons/<tenant>.ico
    return NextResponse.rewrite(url);
  }
  if (pathname === "/apple-touch-icon.png") {
    const tenant = detectTenantFromHost(pickHost(req)) || "metahub";
    url.pathname = `/favicons/${tenant}-apple-180.png`;
    return NextResponse.rewrite(url);
  }
  if (pathname === "/favicon-32x32.png" || pathname === "/favicon-16x16.png") {
    const tenant = detectTenantFromHost(pickHost(req)) || "metahub";
    const size = pathname.includes("32") ? 32 : 16;
    url.pathname = `/favicons/${tenant}-${size}.png`;
    return NextResponse.rewrite(url);
  }

  // ── CSP’yi tenant’a göre set et
  const host = pickHost(req);
  const tenant = detectTenantFromHost(host) || "default";
  const res = NextResponse.next();
  const csp = buildCspForTenant(tenant);

  // Not: next.config.ts içindeki statik CSP kaldırıldı; header çakışması yok.
  res.headers.set("Content-Security-Policy", csp);
  // Ek güvenlik başlıkları (opsiyonel ama faydalı)
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return res;
}

/* Matcher:
 *  - Tüm sayfalar için CSP uygula
 *  - _next/static ve _next/image dışlanır
 *  - Favicon/ikon yolları ayrıca dahil
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image).*)",
    "/favicon.ico",
    "/apple-touch-icon.png",
    "/favicon-32x32.png",
    "/favicon-16x16.png",
  ],
};
