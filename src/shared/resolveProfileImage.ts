// src/shared/resolveProfileImage.ts
import { getImageSrc } from "@/shared/getImageSrc";
import type { ImageType } from "@/types/image";

// Varsayılan fallback (public/defaults/profile-thumbnail.png)
const fallbackThumbnail = "/defaults/profile-thumbnail.png";

/**
 * Profile image resolver
 * Tüm avatar, profil, testimonial, yorum vs. görsellerinde kullanılabilir.
 * @param img - Profil görseli: string | object | null
 * @param folder - (opsiyonel) image folder, default: "profile"
 * @param fallback - (opsiyonel) default fallback image
 */
export function resolveProfileImage(
  img: any,
  folder: ImageType = "profile",
  fallback: string = fallbackThumbnail
): string {
  if (!img) return fallback;

  // Object (Cloudinary veya local objesi)
  if (typeof img === "object" && img !== null) {
    if (typeof img.thumbnail === "string" && img.thumbnail.startsWith("http"))
      return img.thumbnail;
    if (typeof img.url === "string" && img.url.startsWith("http"))
      return img.url;
    if (typeof img.thumbnail === "string" && img.thumbnail.startsWith("/"))
      return getImageSrc(img.thumbnail, folder);
    if (typeof img.url === "string" && img.url.startsWith("/"))
      return getImageSrc(img.url, folder);
    return fallback;
  }

  // String (direct url veya dosya adı)
  if (typeof img === "string") {
    if (!img.trim()) return fallback;
    if (img.startsWith("http")) return img;
    // Eğer / ile başlıyorsa veya dosya adıysa
    return getImageSrc(img, folder);
  }

  return fallback;
}
