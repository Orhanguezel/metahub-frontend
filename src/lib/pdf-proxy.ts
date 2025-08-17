// src/lib/pdf-proxy.ts
// pages/api/pdf-proxy.ts
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Proxy sadece Cloudinary için izinli. (SSRF koruması)
 * Query:
 *   u=<cloudinary_url>
 *   dl=1  -> Content-Disposition: attachment (indirme)
 *   dl=0  -> inline (önizleme, varsayılan)
 * HEAD istekleri desteklenir.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const u = (req.query.u as string) || "";
    if (!u) return res.status(400).end("missing u");

    let url: URL;
    try { url = new URL(u); } catch { return res.status(400).end("bad url"); }

    if (!url.hostname.endsWith("res.cloudinary.com")) {
      return res.status(400).end("bad host");
    }

    const method = req.method === "HEAD" ? "HEAD" : "GET";
    const upstream = await fetch(url.toString(), { method, cache: "no-store" });

    if (!upstream.ok) {
      return res.status(upstream.status).end("upstream error");
    }

    // header’ları ayarla
    const ct = upstream.headers.get("content-type") ?? "application/pdf";
    res.setHeader("Content-Type", ct);

    const filename = url.pathname.split("/").pop() || "file.pdf";
    const asAttachment = req.query.dl ? String(req.query.dl) !== "0" : false; // default inline
    res.setHeader(
      "Content-Disposition",
      `${asAttachment ? "attachment" : "inline"}; filename="${filename}"`
    );

    const cc = upstream.headers.get("cache-control");
    if (cc) res.setHeader("Cache-Control", cc);

    if (method === "HEAD") {
      return res.status(200).end();
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    return res.status(200).send(buf);
  } catch (e:any) {
    console.error("PDF Proxy Error:", e);
    return res.status(500).end("proxy error");
  }
}
