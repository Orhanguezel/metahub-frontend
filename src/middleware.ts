// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { detectTenantFromHost, getFaviconPathForTenant } from "@/lib/tenant";

function pickHost(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    ""
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Yalnızca favicon isteklerini ele al
  // (İstersen apple-touch ve png varyantlarını da matcher'da ekle)
  if (pathname === "/favicon.ico") {
    const host = pickHost(req);
    const tenant = detectTenantFromHost(host);
    const target = getFaviconPathForTenant(tenant); // /favicons/<tenant>.ico

    // basePath/proxy güvenli mutlak URL
    const url = new URL(target, req.url);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // İstersen diğer favicon yollarını da ekle:
  // matcher: ["/favicon.ico", "/apple-touch-icon.png", "/favicon-16x16.png", "/favicon-32x32.png"],
  matcher: ["/favicon.ico"],
};
