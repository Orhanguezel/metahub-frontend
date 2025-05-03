
---

# 📚 **Metahub Proje Özeti (Dokümantasyon v2.1 – Güncel Tema & Settings Entegrasyonu)**

---

## 🎯 **Genel Amacımız**

✅ Yüzlerce farklı web sitesinin frontend'ini tek bir altyapıdan dinamik olarak yönetmek  
✅ Backend'den gelen API verilerine göre sayfa otomatik oluşacak (hardcoded yapı yok)  
✅ Next.js + Redux Toolkit + Styled-Components + i18n + Tema + Dark/Light desteği  
✅ SSR, SSG ve SEO uyumlu  
✅ Her şey modüler olacak: kartlar, formlar, listeler, tablolar bileşenle gelecek

---

## 🧱 **Teknik Altyapı**

| Alan | Teknoloji |
|------|-----------|
| Framework | Next.js (App Router) |
| State | Redux Toolkit (Slices + RTK Query) |
| Styling | styled-components |
| Tema | ThemeProviderWrapper + dynamic themes |
| Dil Desteği | react-i18next |
| Bildirimler | react-toastify |
| API | Axios + apiCall helper |
| Page Builder | DynamicAdminPageBuilder / DynamicVisitorPageBuilder |
| Deployment | Vercel, Hostinger, Nginx opsiyonlu |

---

## 📁 **Klasör Yapısı**

```
src/
├── app/admin/...          → Admin panel sayfaları
├── app/visitor/...        → Ziyaretçi sayfaları
├── components/admin/...   → Admin bileşenleri
├── components/visitor/... → Visitor bileşenleri
├── store/settingSlice.ts  → Tüm ayarlar burada tutulur
├── styles/themes/         → Tema dosyaları
├── providers/             → ThemeProviderWrapper
```

---

## 🎨 **Tema Sistemi Özeti**

| Alan | Açıklama |
|------|----------|
| Tema Seçimi | `site_template` değeri settings üzerinden alınır |
| Tema Listesi | `available_themes` dizisi olarak settings içinde saklanır |
| Dark/Light | Ziyaretçi tarayıcı ya da localStorage üzerinden değiştirebilir |
| Tema Ekleme | Yeni tema dosyası + `themes/index.ts`'e import eklenmesi yeterli |
| Kullanıcı Teması | Dark/Light geçişi yapılabilir ama `site_template` sabit kalır |

### Örnek:

```json
[
  {
    "key": "available_themes",
    "value": ["classic", "modern", "minimal"]
  },
  {
    "key": "site_template",
    "value": "modern"
  },
  {
    "key": "theme_mode",
    "value": "dark"
  }
]
```

---

## 🛠️ **Settings Modülü Özeti**

| Key               | Açıklama                                 | Tür      |
|------------------|------------------------------------------|----------|
| available_themes | Kullanılabilir tüm temalar               | string[] |
| site_template     | Aktif olarak kullanılan tema             | string   |
| theme_mode        | Başlangıçta dark mı light mı olsun       | string   |
| diğer ayarlar     | Çoklu dil destekli ayarlar               | string veya object |

### Admin Panel Özellikleri:
- [✔] Key girerek yeni ayar ekleyebilme
- [✔] `site_template` için radyo + input destekli özel alan
- [✔] `available_themes` için liste + sil + ekle desteği
- [✔] Tüm ayarlar i18n uyumlu

---

## 🛠️ **Admin Sayfa Akış Şablonu**

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

## ⚙️ **Frontend'de Tema Uygulama Örneği**

```tsx
const selectedTemplate = settings.find((s) => s.key === "site_template")?.value || "classic";
const templateTheme = themes[selectedTemplate];
```

---

## 📋 **Kritik Talimatlar (Güncel)**

1. ✅ `useGetAdminModules` hook'unu `hooks/adminHooks.ts` içine tanımla  
2. ✅ Admin tüm `page.tsx` dosyalarında bu hook'u kullanarak modülleri çek  
3. ✅ `DynamicAdminPageBuilder`'a transform edilmiş `modules` gönder  
4. ✅ Tema sistemi tamamen `site_template` + `available_themes` üzerinden çalışmalı  
5. ✅ `theme_mode` sadece dark/light için kullanılmalı  
6. ✅ Visitor tarafında tema sabit, sadece mod değiştirme izni var  
7. ✅ Navbar, ThemeProviderWrapper, Modal, LanguageSwitcher gibi bileşenler ayarları dinamik şekilde kullanmalı

---

## 🧠 **Hatırlatma – Altın Kurallar**

- 🎯 Tüm temalar merkezi olarak `themes/index.ts` üzerinden kontrol edilir  
- 🎯 Ayarlar slice ile Redux üzerinden tüm uygulamada paylaşılır  
- ❌ Hardcoded yapı yasak  
- ✔️ `site_template` + `theme_mode` sadece Settings üzerinden alınır  
- ⚠️ Yeni tema eklemek için tek gereken: `theme.ts` dosyası ve import

---
