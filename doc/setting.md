Elbette. Aşağıda **Setting Modülü** ile ilgili kapsamlı bir teknik dokümantasyon sundum. Bu doküman, `theme` yönetimi ve `available_themes` ile `site_template` ayarlarını da içermektedir. Her şey adım adım anlatılmıştır.

---

# 📦 **SETTING MODÜLÜ - Teknik Dokümantasyon**

## 🎯 Amaç
- Tüm site ayarlarını (theme, dil, footer yazısı, SEO ayarları vs.) tek merkezden yönetilebilir kılmak.
- Her ayar bir `key` ve `value` çiftiyle temsil edilir.
- Bazı ayarlar çok dilli (`{ tr, en, de }`) olabilir.
- Bazı ayarlar dizi (`string[]`) olabilir (örneğin `available_themes`).

---

## 📁 1. Model (Mongoose)

```ts
key: string;
value: string | string[] | { tr: string; en: string; de: string };
isActive: boolean;
createdAt: Date;
updatedAt: Date;
```

- **`key`** → benzersiz, örnekler: `footer_text`, `available_themes`, `site_template`, `theme_mode`
- **`value`**:
  - Basit string: `"minimal"`
  - Çok dilli: `{ tr: "...", en: "...", de: "..." }`
  - Dizi: `["classic", "modern", "minimal"]`

---

## 🔁 2. API Kullanımı

### ✅ Ayar Ekle/Güncelle

```ts
POST /setting

body:
{
  key: "site_template",
  value: "modern"
}
```

### ✅ Ayar Sil

```ts
DELETE /setting/site_template
```

### ✅ Tüm Ayarları Getir

```ts
GET /setting
```

---

## 🧠 3. Anahtar Ayarlar Açıklaması

### 🧩 `available_themes`
- Tür: `string[]`
- Örnek: `["classic", "modern", "minimal"]`
- Açıklama: Sistem tarafından kullanılabilecek temaların listesi.

### 🎨 `site_template`
- Tür: `string`
- Örnek: `"classic"`
- Açıklama: Şu anda aktif olarak kullanılan tema adıdır.
- Seçenekler: `available_themes` içinde tanımlı olanlardan biri olmalıdır.

### 🌗 `theme_mode`
- Tür: `string` (`"light"` veya `"dark"`)
- Açıklama: Admin için veya tüm site için varsayılan aydınlık/koyu tema seçimi.

---

## 🧠 4. Frontend Entegrasyonu

### 1. `available_themes` ve `site_template`:

- `AdminSettingsForm` içinde `site_template` seçimi yapılırken `available_themes` listesinden radio/select ile seçim yapılır.
- Yeni tema adı girilerek `available_themes` listesi güncellenebilir.
- Silme işlemiyle listedeki temalar kaldırılabilir.
- `site_template` değeri `available_themes` içinden seçilmelidir (ama frontend'de bu kontrol kaldırıldı → daha esnek yapı sağlandı).

---

## 💡 5. Örnek Veri (MongoDB)

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

## ⚠️ Notlar
- `value` içeriği bazen string, bazen dizi, bazen object olabilir → tip kontrollerine dikkat edilmeli.
- `site_template` sadece 1 aktif tema göstermek için kullanılır.
- `available_themes` temaları frontend’de radio/select listesi ile göstermek için kullanılır.
- `theme_mode` varsayılan dark/light görünüm için kullanılır (ziyaretçinin tercihi ise `localStorage` ile tutulur).

---
