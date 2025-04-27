
## 🧠 Frontend İçerik Modülü Geliştirme Talimatı (News, Blog, Article vs.)

Bu dökümantasyon; **haber**, **blog**, **makale**, **ürün**, **galeri**, **kütüphane** gibi içerik odaklı tüm modüllerin admin panelinde çok dilli, çok görselli, stil uyumlu ve tutarlı şekilde geliştirilmesi için oluşturulmuştur.

---

### 🧱 Dosya Yapısı

Her içerik modülü `/src/components/admin/{modul}` altında aşağıdaki dosyaları içerir:

```
src/
├── components/
│   └── admin/
│       └── news/                  # veya blog/, article/ vs.
│           ├── NewsList.tsx       # Kayıtları listeleme + silme
│           ├── NewsMultiForm.tsx  # Üç dilli oluşturma formu + görsel yükleme
│           └── index.ts           # (isteğe bağlı barrel export)
```

---

### 🔄 Redux Toolkit Yapısı

Slice dosyası `redux/slices/newsSlice.ts` benzeri olacak şekilde oluşturulur:

#### ✅ Async Thunks
- `fetch[Module](lang)` → GET (lang parametresi ile)
- `create[Module](FormData)` → POST
- `delete[Module](id)` → DELETE
- (isteğe bağlı) `update[Module](id, data)` → PUT / PATCH

#### ✅ State Örneği:
```ts
interface NewsState {
  news: NewsItem[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}
```

---

### 👨‍💼 Admin Panel Özellikleri

#### 📝 Çok Dilli Kayıt Formu (`NewsMultiForm.tsx`)
- Her dil için `title`, `summary`, `content`, `slug`, `category`, `tags` inputları bulunur.
- 3 dil ayrı kartlarda gösterilir.
- Form verisi `FormData` ile backend’e gönderilir:
  ```ts
  formData.append("title_en", ...);
  formData.append("title_tr", ...);
  formData.append("title_de", ...);
  ```
- Görseller için:
  ```ts
  <input type="file" multiple />
  formData.append("image", file);
  ```
- En az bir görsel ve tüm dillerde içerik girilmeden “Oluştur” butonu aktif olmaz.

#### 🧾 Listeleme Sayfası (`NewsList.tsx`)
- `fetchNews(lang)` çağrısı ile listeleme yapılır.
- `<select>` ile dil değiştirilebilir.
- Liste satırlarında:
  - Yayın durumu (taslak/yayında)
  - Tarih
  - Dil
  - Edit / Delete butonları
- Silme işlemi öncesi `confirm()` uyarısı vardır.

---

### 🌍 i18n Desteği

- Tüm çeviriler `src/locales/admin.json` içinde:
  ```json
  "news": {
    "title": "Haberler",
    "newMulti": "Yeni Haber (Çok Dilli)",
    "allNews": "Tüm Haberler",
    "created": "Haber başarıyla eklendi.",
    ...
  }
  ```
- `useTranslation("admin")` ile alınır.
- Dil seçimi `i18n.language` veya dil dropdown'ı üzerinden yapılır.

---

### 🎨 Tema Uyumluluğu

- styled-components kullanılır.
- Her input, buton, textarea, kart gibi öğeler global theme ile uyumlu olmalıdır:
  ```ts
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
  ```
- Light/Dark geçişine hazır olmalıdır.

---

### 🧪 UX Detayları

- Görsel yüklendikten sonra `preview` gösterilir.
- Form gönderimi sonrası:
  - `toast.success(...)` ile bildirim verilir.
  - Inputlar ve görseller temizlenir.
- Hatalar için `toast.error(...)` gösterilir.

---

### 🔗 API Entegrasyonu

| Metot | URL                     | Açıklama                |
|-------|--------------------------|--------------------------|
| GET   | `/news?language=tr`     | Dil filtresiyle getir    |
| POST  | `/news` (FormData)      | Çok dilli kayıt + görsel |
| DELETE| `/news/:id`             | Silme işlemi             |
| PUT   | `/news/:id` (isteğe bağlı)| Güncelleme (multi)     |

---

### 💡 Genişletme Önerileri

- ✏️ Kayıt Güncelleme (NewsEditForm.tsx)
- 🧠 AI destekli içerik oluşturma önerisi (future)
- 📊 Admin dashboard’da toplam haber sayısı, yayınlanan vs.

---

### ✅ Kullanımda Olan Modüller (Bu Yapıya Sahip)

| Modül       | Durum       |
|-------------|-------------|
| News        | ✅ Tamamlandı  
| FAQ         | ✅ Tamamlandı  (AI destekli)
| Blog        | 🔜 Başlanacak  
| Article     | 🔜 Başlanacak  
| Gallery     | 🔜 Planlanıyor  
| Library     | 🔜 Planlanıyor  
| Product     | ✅ Tamamlandı  
| Chat        | ✅ Tamamlandı (AI destekli)  
| Users       | ✅ Tamamlandı  
| Categories  | ✅ Tamamlandı  

---

