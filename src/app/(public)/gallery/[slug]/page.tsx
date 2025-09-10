// src/app/(public)/gallery/[slug]/page.tsx
import { redirect } from "next/navigation";

// Prefetch sırasında 404 düşmesin diye, şimdilik ana sayfaya yönlendiriyoruz.
// İleride gerçek detay sayfası gerekli olursa bu dosyayı güncelleyin.
export const dynamic = "force-dynamic";

export default function GallerySlugPage() {
  redirect("/"); // isterseniz "/#hero" ya da "/gallery" yapın
}
