import { NextRequest, NextResponse } from "next/server";

// 🌍 Sadece production ortamında yönlendirme yap
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host") || "";

  // www olmayanı www. olan versiyona yönlendir (örnek: ensotek.com → www.ensotek.com)
  if (
    process.env.NODE_ENV === "production" &&
    !hostname.startsWith("www.") &&
    hostname === "ensotek.de"
  ) {
    url.hostname = `www.${hostname}`;
    return NextResponse.redirect(url);
  }

  // www olanı www'siz yapacaksan tam tersine çevir:
  // if (hostname.startsWith("www.")) {
  //   url.hostname = hostname.replace("www.", "");
  //   return NextResponse.redirect(url);
  // }

  return NextResponse.next();
}
