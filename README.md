
---

# 🌐 MetaHub Frontend

**Yüzlerce farklı web sitesi için modüler, çok dilli, tematik ve sürdürülebilir bir frontend altyapısı.**
(Next.js 14+, Redux Toolkit, styled-components, i18n, dinamik tema ve merkezi ayarlar desteği ile)

---

## 🚀 Özellikler

* **Tamamen modüler yapı:** Her fonksiyon, sayfa, bileşen ve state yönetimi kendi modülünde yaşar.
* **Çoklu tema (Dynamic Theme):** Tüm temalar merkezi olarak `settings` üzerinden değişir, dark/light mod desteklenir.
* **Çok dilli destek:** Tüm görsel metinler i18n üzerinden, global veya modül bazında yönetilir.
* **Dinamik admin & public sayfa akışı:** Admin ve ziyaretçi tarafı net ayrılmıştır. Route’lar sadece yönlendiricidir.
* **Sıfır hardcoded:** Tema, metin ve ayarların tamamı slice, i18n veya settings üzerinden gelir.
* **API entegrasyonu:** Tüm API istekleri redux slice veya hook ile yönetilir.
* **Kolay modül ekleme:** Yeni modül, tema veya dil dosyası eklemek çok kolay ve dokümante.
* **Modern DevOps:** Nginx + PM2 + Webhook ile VPS veya Vercel deploy.
* **SEO ve performans:** SSR, SSG uyumlu, meta tag yönetimi `SEOManager` ile yapılır.

---

## 🏗️ Klasör Yapısı (Özet)

```txt
src/
  app/
    admin/[modül]/page.tsx         # Admin sayfa router’ı (sadece yönlendirir)
    (public)/[modül]/page.tsx      # Public sayfa router’ı (sadece yönlendirir)
  modules/
    [modül]/
      admin/pages/page.tsx         # Ana admin sayfası (tüm logic burada)
      admin/components/            # Admin’e özel componentler
      public/pages/page.tsx        # Public ana sayfa (logic burada)
      public/components/           # Public componentler
      slice/[modul]Slice.ts        # Redux slice (state yönetimi)
      i18n/[lang].json             # Modüle özel çeviri dosyaları (tr/en/de)
      types/                       # TS tipler
  shared/                          # Ortak komponent ve yardımcılar
  hooks/                           # Tekrar kullanılabilir custom hook’lar
  providers/                       # ThemeProvider, I18nProvider, ReduxProvider
  store/                           # Root redux store, sadece slice birleştirir
  styles/themes/                   # Temalar ve theme export’ları
  i18n/                            # Global çeviriler
  lib/, utils/, types/             # Yardımcı kütüphane ve tip dosyaları
```

---

## ⚡ Kurulum

### 1. Gerekli Bağımlılıklar

> Node.js 18+ ve yarn veya npm gereklidir.

```bash
git clone https://github.com/senin-kullanici-adin/metahub-frontend.git
cd metahub-frontend
npm install
# veya
yarn
```

### 2. Ortam Değişkenleri

`.env` dosyasını kopyalayın ve API adresi gibi ortam bilgilerini doldurun:

```
NEXT_PUBLIC_API_URL=https://api.senin-domainin.com
```

### 3. Geliştirme Ortamı

```bash
npm run dev
# veya
yarn dev
```

### 4. Build ve Production Deploy

```bash
npm run build
npm run start
```

---

## 🧩 Modül Eklemek

1. `src/modules/[modül]` altında aşağıdaki yapıyı oluştur:

   * `admin/pages/page.tsx`, `admin/components/`, `public/pages/page.tsx`, `public/components/`, `slice/[modul]Slice.ts`, `i18n/[lang].json`, `types/index.ts`
2. `src/app/admin/[modül]/page.tsx` → yönlendirme bileşeni ile modüle bağla.
3. Redux store’a yeni slice’ı ekle.
4. Çeviri dosyalarını hazırla, yeni alanlar ekleyeceksen önce i18n’e anahtarını gir.
5. Gerekli API endpointlerini backend ile dokümante et.

---

## 🎨 Tema Sistemi

* Temalar backend’den gelen `settings` ile (`site_template` ve `available_themes`) otomatik belirlenir.
* Yeni tema eklemek için:

  1. `src/styles/themes/[tema].ts` oluştur.
  2. `themes/index.ts`’te import et, export’la.
  3. `available_themes`’e ekle (backend/admin panelden).
* Ziyaretçi dark/light modunu kendi değiştirebilir; ana tema sabit admin tarafından belirlenir.

---

## 🌍 Dil Sistemi

* Her modülün kendi içinde `i18n/[lang].json` dosyası bulunur.
* Global metinler `src/i18n/` altında tutulur.
* Yeni metin eklerken önce çeviri dosyasına anahtar eklenir, sonra bileşende kullanılır.
* Varsayılan ve aktif dil, provider üzerinden yönetilir.

---

## ⚙️ Geliştirici Kuralları

* **Kod tekrarı yasak!** Ortak kodlar shared veya kendi modülünde.
* **Doğrudan API çağrısı YASAK!** Her API slice veya hook’tan yapılır.
* **Tüm görsel metinler i18n’den çekilir.** Hardcoded text yasak.
* **Tüm stiller styled-components ile tanımlanır.** Manuel className kullanma.
* **Her yeni modül veya bileşen dökümante edilmeli.**
* **Commit’lerde Prettier + ESLint aktif.**

---

## 🛡️ Güvenlik, SEO & Performans

* Tüm public data SSG/SSR ile dikkatli işlenir.
* SEOManager ile meta tag yönetimi zorunlu.
* Performans için lazy loading ve code splitting aktif.
* Ortam değişkenleri `.env` + `settings` üzerinden yönetilir.

---

## 🛠️ DevOps & Deploy

* **VPS (Hostinger), Nginx reverse proxy + PM2** ile production deploy önerilir.
* **Vercel** alternatiftir.
* Otomatik deploy için webhook entegre edilebilir.
* Tüm ayarlar merkezi olarak settings üzerinden yönetilir.

---

## 👥 Katkıda Bulunmak

1. Tüm yeni feature veya fixler için PR aç.
2. Kodun dökümantasyonunu ve çeviri anahtarlarını güncelle.
3. Merge öncesi en az 2 kod review iste.
4. Kurallara ve dizin standartlarına harfiyen uy!

---

## 📞 İletişim & Destek

> Proje yöneticisi: Orhan Güzel
> [LinkedIn](https://www.linkedin.com/in/orhanguzel)
> [GitHub](https://github.com/Orhanguezel)

---

Herhangi bir hata, öneri veya katkı için issue açabilirsin!

---

> **MetaHub ile modüler, sürdürülebilir, kolay büyüyen frontend hayaline bir adım daha yakınsın. 👨‍💻🚀**

---
