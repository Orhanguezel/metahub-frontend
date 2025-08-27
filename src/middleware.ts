import { NextRequest, NextResponse } from "next/server";
import { detectTenantFromHost, getFaviconPathForTenant } from "@/lib/tenant";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname !== "/favicon.ico") {
    return NextResponse.next();
  }

  const host = req.headers.get("host") || "";
  const tenant = detectTenantFromHost(host);
  const target = getFaviconPathForTenant(tenant); // -> /favicons/<tenant>.ico (default: metahub)

  const url = req.nextUrl.clone();
  url.pathname = target;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/favicon.ico"],
};
