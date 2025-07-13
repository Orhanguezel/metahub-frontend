import type { ImageType } from "@/types/image";

const folderMap: Record<ImageType, string> = {
  product: "product-images",
  profile: "profile-images",
  category: "category-images",
  blog: "blog-images",
  news: "news-images",
  article: "article-images",
  references: "references-images",
  library: "library-images",
  comment: "comment-images",
  feedback: "feedback-images",
  email: "email-attachments",
  gallery: "gallery-images",
  faq: "faq-images",
  services: "services-images",
  notification: "notification-images",
  setting: "setting-images",
  contact: "contact-files",
  stock: "stock-images",
  dashboard: "dashboard-assets",
  user: "user-images",
  order: "order-assets",
  cart: "cart-assets",
  appointment: "appointment-images",
  coupon: "coupon-banners",
  customProduct: "custom-product-images",
  emailAttachment: "email-attachments",
  about: "about-images",
  activity: "activity-images",
  company: "company-images",
  bikes: "bikes-images",
  bikesCategory: "bikesCategory-images",
  tenant: "tenant-images",
  misc: "misc",
};

const defaultImageMap: Record<ImageType, string> = {
  product: "product.png",
  profile: "profile.png",
  category: "category.png",
  blog: "blog.png",
  news: "news.png",
  article: "article.png",
  references: "references.png",
  library: "library.png",
  comment: "comment.png",
  feedback: "feedback.png",
  email: "email.png",
  gallery: "gallery.png",
  faq: "faq.png",
  services: "service.png",
  notification: "notification.png",
  setting: "setting.png",
  contact: "contact.png",
  stock: "stock.png",
  dashboard: "dashboard.png",
  user: "user.png",
  order: "order.png",
  cart: "cart.png",
  appointment: "appointment.png",
  coupon: "coupon.png",
  customProduct: "custom-product.png",
  emailAttachment: "email-attachment.png",
  about: "about.png",
  activity: "activity.png",
  company: "company.png",
  bikes: "bikes.png",
  bikesCategory: "bikeCategory.png",
  tenant: "tenant.png",
  misc: "default.png",
};

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5019";
const PROJECT_ENV = process.env.NEXT_PUBLIC_APP_ENV || "ensotek";

export function getImageSrc(
  imagePath?: string,
  type: ImageType = "profile"
): string {
  const folder = folderMap[type];
  const defaultImage = defaultImageMap[type];

  if (!folder || !defaultImage) {
    return `${BASE_URL}/uploads/${PROJECT_ENV}/misc/default.png`;
  }

  // 1. ⛔️ Önce string mi diye kontrol et
  if (typeof imagePath !== "string" || imagePath.trim() === "") {
    // Not: default profil resmi için public yolunu kullan
    return `/defaults/${defaultImage}`;
  }

  // 2. Eğer zaten /defaults/ ile başlıyorsa, direkt ver (Next.js public folder)
  if (imagePath.startsWith("/defaults/")) {
    return imagePath;
  }
  if (imagePath === "/default-avatar.png") {
    return imagePath;
  }

  // 3. Cloudinary ya da http ile başlıyorsa
  if (imagePath.startsWith("http")) {
    if (imagePath.includes("cloudinary.com")) {
      return imagePath;
    }
    try {
      const url = new URL(imagePath);
      const parts = url.pathname.split("/");
      if (parts[2] !== PROJECT_ENV) {
        parts[2] = PROJECT_ENV;
        const newPath = parts.join("/");
        return `${url.origin}${newPath}`;
      }
      return imagePath;
    } catch {
      return `${BASE_URL}/uploads/${PROJECT_ENV}/${folder}/${defaultImage}`;
    }
  }

  // 4. Dosya yolu ise (ör: 64a1e3...jpg)
  return `${BASE_URL}/uploads/${PROJECT_ENV}/${folder}/${imagePath}`;
}

