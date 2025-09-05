import type { ImageType } from "@/types/image";

const folderMap: Record<ImageType, string> = {
  product: "product-images",
  profile: "profile-images",
  category: "category-images",
  blog: "blog-images",
  news: "news-images",
  articles: "articles-images",
  references: "references-images",
  library: "library-images",
  comment: "comment-images",
  feedback: "feedback-images",
  email: "email-attachments",
  gallery: "gallery-images",
  galleryCategory: "galleryCategory-images",
  faq: "faq-images",
  services: "services-images",
  massage: "massage-images", // Yeni eklenen tip
  notification: "notification-images",
  settings: "settings-images",
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
  tenants: "tenant-images",
  ensotekprod: "ensotekprod-images",
  ensotekCategory: "ensotekCategory-images",
  sparepart: "sparepart-images",
  sparepartCategory: "sparepartCategory-images",
  team: "team-images",
  skill:"skill-images",
  portfolio:"portfolio-images",
  apartment:"apartment-images",
  menuitem:"menuitem-images",
  menu:"menu-images",
  menucategory:"menucategory-images",
  misc: "misc",
};

const defaultImageMap: Record<ImageType, string> = {
  product: "product.png",
  profile: "profile.png",
  category: "category.png",
  blog: "blog.png",
  news: "news.png",
  articles: "articles.png",
  references: "references.png",
  library: "library.png",
  comment: "comment.png",
  feedback: "feedback.png",
  email: "email.png",
  gallery: "gallery.png",
  galleryCategory: "galleryCategory.png",
  faq: "faq.png",
  services: "service.png",
  massage: "massage.png", // Yeni eklenen varsayılan resim
  notification: "notification.png",
  settings: "setting.png",
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
  tenants: "tenant.png",
  ensotekprod: "ensotekprod.png",
  ensotekCategory: "ensotekCategory.png",
  sparepart: "sparepart.png",
  sparepartCategory: "sparepartCategory.png",
  team: "team.png",
  skill:"skill.png",
  portfolio:"portfolio.png",
  apartment:"apartment.png",
  menuitem:"menuitem.png",
  menu:"menu.png",
  menucategory:"menucategory.png",
  misc: "default.png",
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5019";
const PROJECT_ENV = process.env.NEXT_PUBLIC_APP_ENV || "ensotek";

// Fonksiyonu hook ile çağırırken parametre olarak tenantSlug geç!
export function getImageSrc(
  imagePath?: string,
  type: ImageType = "profile",
  tenantSlug?: string // Ekstra parametre!
): string {
  const folder = folderMap[type];
  const defaultImage = defaultImageMap[type];

  // 1. Tenant slug'ı belirle (prod: runtime, dev: env)
  let tenant = tenantSlug;
  if (!tenant) {
    if (typeof window !== "undefined" && window.location.hostname.includes("localhost")) {
      tenant = PROJECT_ENV; // Dev/test ortamı
    }
    // SSR/CSR ayrımı, SSR'da tenant parametresi zorunlu!
  }
  if (!tenant) tenant = "default";

  if (!folder || !defaultImage) {
    return `${BASE_URL}/uploads/${tenant}/misc/default.png`;
  }

  if (typeof imagePath !== "string" || imagePath.trim() === "") {
    return `/defaults/${defaultImage}`;
  }

  if (imagePath.startsWith("/defaults/")) return imagePath;
  if (imagePath === "/default-avatar.png") return imagePath;

  if (imagePath.startsWith("http")) return imagePath;

  return `${BASE_URL}/uploads/${tenant}/${folder}/${imagePath}`;
}
