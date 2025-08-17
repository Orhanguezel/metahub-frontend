// utils/cloudinary.ts
export function isCloudinary(u?: string) {
  if (!u) return false;
  try { return new URL(u).hostname.endsWith("res.cloudinary.com"); } catch { return false; }
}

export function withCb(u?: string, v = 0) {
  if (!u) return u;
  try { const url = new URL(u); url.searchParams.set("cbv", String(v)); return url.toString(); }
  catch { return u; }
}

/** /upload/fl_attachment... -> /upload/  (inline önizleme) */
export function toInline(u?: string) {
  if (!u) return u;
  try {
    const url = new URL(u);
    if (isCloudinary(u)) {
      url.pathname = url.pathname.replace(/\/upload\/fl_attachment[^/]*\//, "/upload/");
    } else {
      url.searchParams.set("response-content-disposition", "inline");
    }
    return url.toString();
  } catch { return u; }
}

/** Cloudinary: /upload/ -> /upload/fl_attachment/ ; Diğerlerinde ?response-content-disposition=attachment */
export function toAttachment(u?: string) {
  if (!u) return u;
  try {
    const url = new URL(u);
    if (isCloudinary(u)) {
      if (!/\/upload\/fl_attachment/.test(url.pathname)) {
        url.pathname = url.pathname.replace(/\/upload\//, "/upload/fl_attachment/");
      }
    } else {
      url.searchParams.set("response-content-disposition", "attachment");
    }
    return url.toString();
  } catch { return u; }
}
