import type { ProfileImageObj } from "@/modules/users/types/user";

export function getProfileImageUrl(profileImage?: string | ProfileImageObj): string | undefined {
  if (!profileImage) return undefined;
  if (typeof profileImage === "string") return profileImage;
  if (typeof profileImage === "object" && profileImage !== null) {
    // thumbnail varsa onu, yoksa url’i al
    return profileImage.thumbnail || profileImage.url;
  }
  return undefined;
}
