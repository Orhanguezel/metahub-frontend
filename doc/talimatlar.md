
---

# 📚 **Metahub Proje Özeti (Dokümantasyon v2.0 - Güncel)**

---

## 🎯 **Genel Amacımız:**

✅ Yüzlerce farklı web sitesinin frontendini ortak bir altyapıdan yönetmek.  
✅ Backend API hazır olduğunda, frontend **otomatik şekillenecek** (hardcoded yok).  
✅ Next.js + Redux Toolkit + Styled-Components + i18n + Tema altyapısı ile Admin Panel + Visitor Panel kuruyoruz.  
✅ Çoklu dil desteği ve tema (site_template) desteği hazır.  
✅ SSR, SSG ve SEO uyumlu.  
✅ Her şey modüler olacak: kartlar, formlar, tablolardan oluşacak.

---

## 🧱 **Teknik Altyapı:**

| Alan | Teknoloji |
|:---|:---|
| Framework | Next.js (App Router) |
| State Yönetimi | Redux Toolkit (RTK Query + Slices) |
| Styling | Styled-Components |
| Tema Yönetimi | ThemeProviderWrapper + dynamic themes |
| Dil Desteği | react-i18next |
| Bildirimler | react-toastify |
| API İletişimi | Axios (apiCall helper ile) |
| Skeleton / Loading | SkeletonBox bileşeni |
| Sidebar | Dinamik modül listesiyle |
| Page Builder | DynamicAdminPageBuilder & DynamicVisitorPageBuilder (gelecek) |
| Deployment | Vercel / Hostinger / Nginx opsiyonlu |

---

## 📋 **Genel Yapı:**

- `/src/app/admin/...` → Admin Panel sayfaları
- `/src/app/visitor/...` → Ziyaretçi (kullanıcı) site sayfaları
- `/src/hooks/adminHooks.ts` → Admin veri çekim hookları
- `/src/components/admin/...` → Admin bileşenleri
- `/src/components/visitor/...` → Visitor bileşenleri
- `/src/store/...` → Redux store yapıları (Slices)
- `/src/i18n/...` → Dil dosyaları (en, tr, de)
- `/src/styles/themes/...` → Tema dosyaları (classic, modern, minimal, futuristic)

---

## 🚦 **Şu Anda Tamamlananlar:**

- [✔️] Redux adminSlice hazır
- [✔️] Toplu işlem (bulk delete) destekli
- [✔️] Toast bildirim entegrasyonu tamam
- [✔️] Dinamik Sidebar modül yönetimi çalışıyor
- [✔️] Admin Panel Dashboard / Pages yapısı kuruldu
- [✔️] Çoklu dil (i18n) altyapısı aktif
- [✔️] SkeletonBox loading sistemi entegre
- [✔️] Tema sistemi (dynamic site_template + dark/light mode) tamam

---

## 🔥 **Kritik Eksikler / Sorunlar:**

| Alan | Durum |
|:---|:---|
| Admin Page Builder için veri tipi uyuşmazlığı | Çözüm: useGetAdminModules hook içinde mapping |
| DynamicAdminPageBuilder beklediği yapıya tam uygun değil | Çözüm: gelen datayı uygun tipe çevirip gönder |
| Bazı page.tsx dosyalarında eski import hataları var | Çözüm: adminHooks güncellendi, sabitlenecek |

---

## 📋 **Kritik Talimatlar (İzlenecek Sıra):**

1. 🔵 `src/hooks/adminHooks.ts` dosyasına eksiksiz `useGetAdminModules` fonksiyonunu ekle.
2. 🔵 Admin tüm page.tsx dosyalarında `useGetAdminModules()` ile veri çekildiğini test et.
3. 🔵 `DynamicAdminPageBuilder` bileşenine doğru transform edilmiş `modules` gönder.
4. 🟠 Gerekirse Builder içine küçük bir `map` dönüşüm helper'ı koy (esneklik için).
5. 🟠 Admin Panel modül kartlarını grid görünümüne geçirelim (isteğe bağlı).
6. 🟠 Visitor tarafına geçip Home, Products, News, Blogs modüllerini toparla.
7. 🔵 Tema sisteminde site_template ayarını backend Settings üzerinden alıp uygula.

---

## 🛡️ **Altın Kurallar:**

- **Önce veriler hatasız gelsin**, sonra UI ve tasarımlar yapılsın.
- **Hardcoded component yok!**  
  Her şey **modül verisi** + **builder bileşenleri** üzerinden işliyor.
- **Her Admin Sayfası aynı veri akışı şablonunu kullanacak**.

---

## 🌈 **Tema Sistemi Özeti:**

- Tema dosyaları: `src/styles/themes/`
- Temalar: classic, modern, minimal, futuristic (ve kolayca yeni eklenebilir)
- Seçim: backend'den gelen `site_template` değeri okunur.
- Kullanıcı: sadece dark/light mod arasında seçim yapabilir.
- Final Theme: templateTheme + dark mode override ile hazırlanır.
- Yeni tema eklemek: bir dosya + bir import → anında aktif.

---

## 🛠️ **Admin Sayfa Akış Şablonu:**

```tsx
if (loading) return <div>Yükleniyor...</div>;
if (error) return <div>Hata oluştu...</div>;

return (
  <main>
    <DynamicAdminPageBuilder modules={mappedModules} />
  </main>
);
```

---

## 🗺️ **Veri Akışı (Özet Şema):**

```
Page açıldı →
fetchAvailableProjects() →
selectedProject seçildi →
fetchAdminModules(selectedProject) →
modules state doldu →
mappedModules oluşturuldu →
DynamicAdminPageBuilder / Sidebar kullanıldı →
UI çizildi
```

---

## ⚙️ **Özet:**

| Alan | Hedef |
|:---|:---|
| Backend'den veri çekimi | RTK Query veya axios + apiCall |
| Frontend veri kullanımı | useGetAdminModules + mappedModules |
| Tema yönetimi | site_template + light/dark mode |
| Admin Page UI | DynamicAdminPageBuilder |
| Visitor UI | DynamicVisitorPageBuilder (gelecek) |
| Loading/Error | Standart bileşenler |
| Dil desteği | react-i18next |

---

# ✅ Şu anda yapmamız gereken en önemli şey:

➔ **Settings modülünü** de aynı standart kurala göre getirip çalıştırmak.  
➔ **Tema seçimi** ayarını (site_template) Settings içinden almak ve uygulamak.

---

Bu dokümanı bu şekilde kaydedersek, her yeni modül eklerken veya bir şey değiştirirken hep doğru yoldan ilerleriz.
