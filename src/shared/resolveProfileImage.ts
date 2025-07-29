// src/shared/resolveProfileImage.ts
import { getImageSrc } from "@/shared/getImageSrc";
import type { ImageType } from "@/types/image";

// Profil veya genel görsel için merkezi resolver
export function resolveProfileImage(
  img: any,
  folder: ImageType = "profile",
  fallback: string = "/defaults/profile-thumbnail.png"
): string {
  if (!img) return fallback;

  if (typeof img === "object" && img !== null) {
    if (img.thumbnail && typeof img.thumbnail === "string" && img.thumbnail.startsWith("http"))
      return img.thumbnail;
    if (img.url && typeof img.url === "string" && img.url.startsWith("http"))
      return img.url;
    return getImageSrc(img.thumbnail || img.url || "", folder);
  }

  if (typeof img === "string") {
    if (!img.trim()) return fallback;
    if (img.startsWith("http")) return img;
    return getImageSrc(img, folder);
  }

  return fallback;
}
