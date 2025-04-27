import type { ImageType } from "@/types/image";

const folderMap: Record<ImageType, string> = {
  product: "product-images",
  profile: "profile-images",
  category: "category-images",
  blog: "blog-images",
  news: "news-images",
  article: "article-images",
  reference: "reference-images",
  library: "library-images",
  comment: "comment-images",
  feedback: "feedback-images",
  email: "email-attachments",
  gallery: "gallery-images",
  faq: "faq-images",
  service: "service-images",
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
  misc: "misc",
};

const defaultImageMap: Record<ImageType, string> = {
  product: "product.png",
  profile: "profile.png",
  category: "category.png",
  blog: "blog.png",
  news: "news.png",
  article: "article.png",
  reference: "reference.png",
  library: "library.png",
  comment: "comment.png",
  feedback: "feedback.png",
  email: "email.png",
  gallery: "gallery.png",
  faq: "faq.png",
  service: "service.png",
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
  misc: "default.png",
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5015";

export function getImageSrc(imagePath?: string, type: ImageType = "profile"): string {
  const fallbackType: ImageType = type || "profile";

  const folder = folderMap[fallbackType];
  const defaultImage = defaultImageMap[fallbackType];

  if (!imagePath || imagePath.trim() === "") {
    return `${BASE_URL}/uploads/${defaultImage}`;
  }

  if (imagePath.startsWith("blob:") || imagePath.startsWith("data:")) return imagePath;
  if (imagePath.startsWith("http")) return imagePath;

  return `${BASE_URL}/uploads/${folder}/${imagePath}`;
}


