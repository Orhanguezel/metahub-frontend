// src/types/image.ts

export type ImageType =
  | "product"
  | "profile"
  | "category"
  | "blog"
  | "news"
  | "article"
  | "reference"
  | "library"
  | "comment"
  | "feedback"
  | "email"
  | "gallery"
  | "faq"
  | "service"
  | "notification"
  | "setting"
  | "contact"
  | "stock"
  | "dashboard"
  | "user"             // userSlice → profil resimleri için
  | "order"            // sipariş görselleri (fatura vb. varsa)
  | "cart"             // sepette ürün resmi kullanılıyorsa
  | "appointment"      // randevuya bağlı görsel varsa
  | "coupon"           // kupon banner/görsel desteği varsa
  | "customProduct"    // örneğin özel pizza oluşturma vs.
  | "emailAttachment"  // e-posta ile gelen ekler
  | "misc";            // diğer veya bilinmeyen durumlar
