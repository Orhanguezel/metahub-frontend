// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { detectTenantFromHost, getFaviconPathForTenant } from "@/lib/tenant";

export function middleware(req: NextRequest) {
  // Sadece /favicon.ico isteğini tenant'a göre doğru dosyaya rewrite et
  if (req.nextUrl.pathname === "/favicon.ico") {
    const host = req.headers.get("host") || "";
    const tenant = detectTenantFromHost(host);
    const target = getFaviconPathForTenant(tenant); // /favicons/{tenant}.ico veya /favicon.ico

    const url = req.nextUrl.clone();
    url.pathname = target;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

// Performans için sadece favicon'a çalışsın:
export const config = {
  matcher: ["/favicon.ico"],
};
