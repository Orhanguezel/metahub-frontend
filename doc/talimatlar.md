
---

# 🚦 **MetaHub Frontend – Talimatlar & Standartlar v3 (2025)**

---

## 1. **Genel Proje Felsefesi**

* **Modülerlik, temizlik ve sürdürülebilirlik**: Her şey modüller üzerinde, her modül kendi bağımsız alanında yaşar.
* **Tekrarsızlık**: Kod tekrarı yasak, ortak kodlar sadece `shared/` içinde merkezi olarak tutulur.
* **Çok Dilli Destek**: Tüm görsel metinler ve hata mesajları i18n çeviri dosyalarından gelir.
* **Tema Yönetimi**: Tema yapısı, backend `settings` üzerinden ve sadece tanımlı key’ler ile yönetilir.
* **Kolay Genişletilebilirlik**: Yeni modül ekleme, tema ekleme, dil ekleme pratik ve belgelidir.
* **API ve veri yönetimi**: Tüm API çağrıları Redux slice veya hook ile yapılır, doğrudan komponent içinde istek yoktur.

---

## 2. **Dizin & Klasör Standartları**

* **Modüller** her zaman `src/modules/[modül]` altında:

  ```
  modules/
    [modül]/
      admin/pages/page.tsx
      admin/components/
      public/pages/page.tsx
      public/components/
      slice/[modul]Slice.ts
      i18n/[lang].json
      types/index.ts
  ```

* **Ana uygulama** dizini `src/app` altında:

  * `/admin/[modül]/page.tsx → modules/[modül]/admin/pages/page.tsx`’e yönlendirir.
  * `/(public)/[modül]/page.tsx → modules/[modül]/public/pages/page.tsx`’e yönlendirir.
  * Detay (ör: `[slug]`) sayfaları da bu kuralı izler.

* **Global paylaşımlı bileşenler ve yardımcılar**:

  * `src/shared/` → ortak modal, yükleyici, hata mesajı vb.
  * `src/hooks/` → tekrar kullanılabilir custom hook’lar.
  * `src/providers/` → ThemeProvider, I18nProvider, ReduxProvider, ToastProvider.

* **Dil dosyaları**: Her modülün içinde kendi i18n klasörü. Global çeviriler için `src/i18n/` altında anahtarlar.

* **Stiller**:

  * Temalar `src/styles/themes/`
  * Her tema, ayrı bir dosya. Hepsi `themes/index.ts`’te birleştirilir.
  * Styled-components zorunlu; `className` ile manuel stil yasak.

---

## 3. **Kodlama ve Bileşen Kuralları**

* **Her bileşen kendi modülünde, kendi alanında yaşar** (başka modülden direkt import yasak, shared dışında).
* **Global componentler** (Navbar, Footer, Sidebar) sadece `shared/` veya özel olarak `modules/shared/` altında olabilir.
* **Tüm görsel metinler** mutlaka `useTranslation` ile i18n’den gelir, *hardcoded text* yasak.
* **Props ve tipler** her zaman TypeScript ile açıkça tanımlanacak (`types/index.ts`).
* **API çağrısı** sadece slice veya custom hook içinde yapılır.
  Bileşenin içinde doğrudan fetch, axios, apiCall YASAK.
* **Redux**: Her modül kendi state’ini kendi slice’ında tutar.
  Global state ya da props drilling kullanılmaz.
* **Düzenli import/alias kullanımı**:

  * Her modül kendi içinden `@/modules/...` ile alias kullanmalı.
  * `../../../` gibi göreli importlar minimumda tutulmalı.

---

## 4. **Tema & Settings Yönetimi**

* **Tüm tema seçimi ve değişimi**, backend’den gelen `settings` ile belirlenir:

  * `site_template`: Aktif tema.
  * `available_themes`: Kullanılabilir temalar (dizi).
  * `theme_mode`: Dark/Light başlangıç modu.
* **Yeni tema eklemek için**:

  1. `src/styles/themes/[tema].ts` dosyası oluştur.
  2. `themes/index.ts`’te export et.
  3. `available_themes` dizisine backend’den ekle.
* **Kullanıcıya tema seçtirmek** sadece dark/light ile sınırlı, ana tema admin tarafından belirlenir.

---

## 5. **Dil (i18n) Standartları**

* Her modül kendi çevirilerini `/i18n/[lang].json` dosyasında saklar.
* Projede yeni bir metin ekleyeceksen önce i18n’e anahtarını ekle, sonra kullan.
* Global çeviriler (header, footer vs.) için `src/i18n/` veya `shared/i18n/`.
* **Dil değişimi** ve varsayılan dil, frontend’de `i18n.ts` ve provider üzerinden yönetilir.

---

## 6. **Redux ve Store Standartları**

* Store içinde modül dışında slice kalmayacak.
  Her şey ilgili modülün kendi slice dosyasında.
* Root store sadece slice’ları birleştirir.
* **Async işlemler** için RTK thunk, createAsyncThunk veya custom hook kullanılır.
* Her slice, yükleme, başarı, hata durumunu yönetir.

---

## 7. **Sayfa & Routing Kuralları**

* Her yeni sayfa, ilgili modülün altında açılır.
* `app/admin/[modül]/page.tsx` ve `modules/[modül]/admin/pages/page.tsx` birebir bağlantılı.
* Detay sayfa (ör: `[slug]`, `[id]`) varsa hem router’da hem modül içinde mantık ayrık olmalı.
* Router, sadece sayfayı yönlendirir, asıl render modülün page bileşenindedir.

---

## 8. **Shared ve Ortak Kaynak Standartları**

* Ortak kullanılan her bileşen (modal, loading, error) sadece `shared/` altında tanımlanır.
* Exportlar daima index.ts dosyasında toplanır.
* Ortak componenti doğrudan kullanırken import şu şekilde yapılır:
  `import { Modal } from "@/shared";`

---

## 9. **Geliştirici Akışı ve Yeni Modül Ekleme**

1. Yeni modül eklemek için:

   * `modules/[modül]` altında klasör aç.
   * Tüm admin, public, i18n, slice, type dosyalarını oluştur.
2. Gerekli olanları export et (index.ts dosyaları ile).
3. Ana router’da ilgili route’u yönlendir.
4. Tema veya i18n gerekiyorsa gerekli dosyaları ve ayarları gir.
5. API endpointlerini backend ile birlikte dokümante et.
6. Kodunu pushlamadan önce lokal test et, i18n ve tema kontrollerini yap.

---

## 10. **Kod Kalitesi ve Kontrol**

* **ESLint + Prettier** aktif olmalı, hatalı commit YASAK.
* Her bileşenin birim testi (Jest, React Testing Library) teşvik edilir.
* Kod review süreci zorunlu, merge öncesi 2 göz kuralı.

---

## 11. **SEO, Performans ve Güvenlik**

* SEO ayarları ve meta tagler **SEOManager** ile yönetilir (modül olarak).
* Her yeni sayfa için uygun `<title>`, `<meta>` eklenmeli.
* Lazy loading, code splitting ve gereksiz importlardan kaçınılmalı.
* Güvenlik için SSR/SSG ile public datalar dikkatli paylaşılmalı.

---

## 12. **Deploy, DevOps ve Ortam Ayarları**

* Deploy prod: **VPS (Hostinger)** veya Vercel üzerinde.
* **Nginx reverse proxy** + **PM2** ile servis yönetimi.
* Webhook ile otomatik deploy pipeline.
* Ortam ayarları `.env` ve `settings` üzerinden yönetilir.
* `next.config.ts`, `tsconfig.json`, `.gitignore` ve benzeri dosyalar standart tutulur.

---

## 13. **Ekstra Altın Kurallar**

* Hiçbir zaman *hardcoded* veri, metin veya tema kullanma.
* Her şey i18n, settings ve slice ile yönetilmeli.
* Her yeni modül, yeni geliştirici için dökümante edilmeli.
* Geriye dönük uyumluluk ve sürdürülebilirlik daima gözetilmeli.
* Kodda açıklamalar (JSdoc veya // notları) anlaşılır ve İngilizce olmalı.

---

> **Bu talimatlara uymak, MetaHub projesinin sürdürülebilir, kolay büyüyen, güvenli ve modüler kalmasını sağlar!**
