
---

# 📙 **MetaHub Çok Dilli (i18n) Modül ve API Mimari Standartları (2025)**

## 1. **Amaç & Temel Prensipler**

* **Her modülün kendi i18n klasörü ve dil dosyası vardır** (`/locales/index.ts`).
* **Yeni bir dil eklemek**: Sadece `SupportedLocale` ve ilgili modülün json’larını ekle. Otomatik genişler, kodda başka değişiklik gerekmez.
* **Dil hiçbir yerde hardcoded (sabit) olmaz**; daima `SUPPORTED_LOCALES` ve `TranslatedLabel` kullanılır.

---

## 2. **Ortak Tipler ve Locale Yönetimi**

### `/src/types/common.ts`

```ts
export type SupportedLocale = "tr" | "en" | "de" | "pl" | "fr" | "es";
export const SUPPORTED_LOCALES: SupportedLocale[] = [ "tr", "en", "de", "pl", "fr", "es" ];

export type TranslatedLabel = { [key in SupportedLocale]: string };

export const LANG_LABELS: Record<SupportedLocale, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  pl: "Polski",
  fr: "Français",
  es: "Español"
};
```

### `/src/utils/getCurrentLocale.ts`

```ts
import i18n from "@/i18n";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";

export function getCurrentLocale(): SupportedLocale {
  const lang =
    (i18n.language?.split("-")[0] ||
      (typeof navigator !== "undefined" && navigator.language?.split("-")[0]) ||
      "en") as string;

  return (SUPPORTED_LOCALES.includes(lang as SupportedLocale)
    ? lang
    : "en") as SupportedLocale;
}
```

---

## 3. **Modül Bazlı i18n Standartları**

### `/src/modules/[modul]/locales/index.ts`

```ts
import tr from "./tr.json";
import en from "./en.json";
import de from "./de.json";
import fr from "./fr.json";
import es from "./es.json";
import pl from "./pl.json";
import type { SupportedLocale } from "@/types/common";

const translations: Record<SupportedLocale, any> = { tr, en, de, fr, es, pl };
export default translations;
```

* **Her modülün kendi i18n yapısı böyle olmalı**. `SUPPORTED_LOCALES` ile uyumlu.

---

## 4. **Tipler ve State**

### `/src/modules/[modul]/types/index.ts`

```ts
import type { SupportedLocale, TranslatedLabel } from "@/types/common";

export interface IBike {
  _id: string;
  name: TranslatedLabel;
  description: TranslatedLabel;
  // diğer alanlar
}
```

* Çok dilli alanlar **daima** `TranslatedLabel` ile tanımlanır.

---

## 5. **Backend Otomasyonu — fillAllLocales**

* **Create/Edit:** Tek dilde veya çok dilli obje gelse de backend'de `fillAllLocales` fonksiyonu ile **tüm diller doldurulur**.
* **Update:** Sadece gelen diller güncellenir, eksik olanlar olduğu gibi kalır.

---

## 6. **Frontend Slice & RTK Kullanımı**

### **Slice ve API Çağrısı**

```ts
// name: { tr: "Test" }   veya   name: { tr: "Test", en: "Test", ... }
formData.append("name", JSON.stringify(name));
```

* Backend eksik dilleri otomatik tamamlar.

---

## 7. **Form Handling & Utils**

* **Create:** Tek dil ile başlat (örn. sadece `tr`). Backend tüm dilleri kopyalar.
* **Update:** İstediğin dili güncelleyebilirsin.
* **Utils:** Kullanıcı arayüzünde çoklu dil inputları sunmak için yardımcı fonksiyonlar ve hook’lar oluşturabilirsin.

---

## 8. **Slice Update & State**

* Store’da objeler her zaman **tüm dillerde** tutulur.
* Slice action’larında sadece gelen diller güncellenir.

---

## 9. **Validasyon ve Otomasyon**

* **Backend’de:** Her create/update sonunda `fillAllLocales` çağrılır.
* **Frontend’de:** Eksik alanlar için placeholder veya fallback gösterilebilir.

---

## 10. **Yeni Dil veya Modül Eklemek**

1. `/types/common.ts` dosyasına yeni dili ekle.
2. Her modülün `locales` dizinine yeni dil json dosyasını ekle (`fr.json`, `es.json`, vs.).
3. Otomatik olarak her yerde kullanılabilir olur. Kodda başka bir değişiklik gerekmez.

---

## 11. **Ekstra: Centralized + Modular i18n Import**

Her modül **kendi i18n index’i** ile gelir. Ana `i18n.ts` dosyasında şu şekilde toplarsın:

```ts
import bikeTranslations from "@/modules/bike/locales";
import productTranslations from "@/modules/product/locales";
...
const resources = {
  en: {
    bike: bikeTranslations.en,
    product: productTranslations.en,
    ...
  },
  tr: {
    bike: bikeTranslations.tr,
    product: productTranslations.tr,
    ...
  },
  ...
};
```

> *Yani `import xyzEN from "@/modules/xyz/i18n/en.json"` tek tek değil, `index.ts` ile modüler ve otomatik olur!*

---

## 12. **Örnek: Formda Kullanım**

* **Locale seçici:** (örn. dropdown)
* **Input değerini** `{ [locale]: value }` olarak güncelle.
* **Backend’e gönderirken** eksik olanları otomatik kopyalat.

---

## 13. **Ekstra: Fallback**

* Eğer kullanıcı dili yoksa **en** (veya tr) otomatik fallback.

```ts
const lang: SupportedLocale = getCurrentLocale();
const value = label[lang] || label["en"];
```

---

### **Özet**

* Her modülün kendi çok dilli yapısı var (6 dil).
* Tek bir noktadan güncellenebilir, sürdürülebilir.
* Kodda hardcoded dil kullanılmaz, tipler ve helperlar her zaman güncel ve otomatik.
* Backend otomasyonu ile her yeni alan/dil kolayca uyarlanır.
* Fallback ve dinamik seçim mekanizması her yerde geçerli.

---

**MetaHub i18n 2025**:

> “Tek noktadan, modüler, sürdürülebilir, tüm ekibe uygun — yeni bir dil eklemek asla zahmet değil!”

---
