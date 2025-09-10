import { NextRequest, NextResponse } from "next/server";
import { detectTenantFromHost, getFaviconPathForTenant } from "@/lib/tenant";

function pickHost(req: NextRequest) {
  return req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
}

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const { pathname } = url;

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

  // PNG favicon varyantlarını da yönlendirmek istersen (opsiyonel)
  if (pathname === "/favicon-32x32.png" || pathname === "/favicon-16x16.png") {
    const tenant = detectTenantFromHost(pickHost(req)) || "metahub";
    const size = pathname.includes("32") ? 32 : 16;
    url.pathname = `/favicons/${tenant}-${size}.png`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/favicon.ico",
    "/apple-touch-icon.png",
    "/favicon-32x32.png",
    "/favicon-16x16.png",
  ],
};
