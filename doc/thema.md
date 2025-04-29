
---

# 🎨 **Metahub - Tema Sistemi Açıklaması**

---

## 🎯 **Genel Hedef:**

- **Her proje için** farklı görsel **tema** desteği sağlamak. (örnek: Classic, Modern, Minimal, Futuristic gibi)
- Admin panelinde seçilen **"site_template"** ayarına göre frontend teması **otomatik** değişsin.
- Kullanıcı (visitor) sadece **dark / light mode** seçebilsin.
- Ana renkler, fontlar, butonlar, inputlar **temaya göre** gelsin.
- Yeni bir tema eklemek **çok kolay** olsun: sadece bir dosya eklemek ve listeye import etmek yeterli.

---

## 🏗️ **Tema Sistemi Yapısı**

### 1. `src/styles/themes/` klasörü

- Her tema kendi ayrı dosyasında tanımlı:
  - `classicTheme.ts`
  - `modernTheme.ts`
  - `minimalTheme.ts`
  - `futuristicTheme.ts`
- İçeriklerinde:  
  ➔ Renkler, fontlar, buton stilleri, input tasarımı, kart (card) görünümleri gibi alanlar mevcut.

### 2. `themes/index.ts`

```tsx
import classicTheme from "./classicTheme";
import modernTheme from "./modernTheme";
import minimalTheme from "./minimalTheme";
import futuristicTheme from "./futuristicTheme";

export const themes = {
  classic: classicTheme,
  modern: modernTheme,
  minimal: minimalTheme,
  futuristic: futuristicTheme,
};

export type ThemeName = keyof typeof themes;
```

- Yeni bir tema eklersen (örneğin: `businessTheme.ts`) buraya sadece bir `import` ve ekleme yapıyorsun.

### 3. `ThemeProviderWrapper`

```tsx
import { themes } from "@/styles/themes";
import { useAppSelector } from "@/store/hooks";

const templateSetting = settings.find((s) => s.key === "site_template");
const selectedTemplate = templateSetting?.value?.toLowerCase() || "classic";
const templateTheme = themes[selectedTemplate] || themes["classic"];
```

- **Seçilen tema**, backend'deki Settings'den (`site_template`) alınır.
- Kullanıcı dark-light arasında geçiş yapabilir ama **seçilen temanın** içinde kalır.

---

## 🌗 **Light / Dark Mode Yapısı**

- Tema rengi (`classic`, `modern` vs.) **backend ayarı** ile belirlenir.
- Light / Dark modu kullanıcı tarayıcı ayarına göre veya kendi seçimine göre çalışır:
  - `prefers-color-scheme: dark` dinlenir.
  - Veya kullanıcı bir toggle butonuyla `isDark` state'ini değiştirir.

**Kod örneği:**

```tsx
const finalTheme = {
  ...templateTheme,
  background: isDark ? "#121212" : templateTheme.background,
  text: isDark ? "#ffffff" : templateTheme.text,
};
```

---

## 🔥 **Tema Dosyalarında Ortak Yapı**

Her tema dosyası şunları içerir:

| Alan             | Açıklama                           |
|------------------|-------------------------------------|
| colors           | Tüm arkaplanlar, yazılar, butonlar   |
| buttons          | Buton arkaplanları, hover renkleri   |
| inputs           | Input alanı arka plan ve borderlar   |
| cards            | Kart arkaplan ve hover renkleri      |
| fonts, fontSizes | Font aileleri ve büyüklükleri         |
| layout           | Header yüksekliği, container genişliği |

---

## 🚀 **Tema Ekleme Süreci**

1. `src/styles/themes/` klasörüne yeni bir dosya (`newTheme.ts`) ekle.
2. `themes/index.ts` dosyasına import edip `themes` nesnesine ekle.
3. Admin panelden **site_template** ayarına bu yeni temanın adını kaydet.
4. Frontend otomatik o temayı kullanacak!

---

# 🧠 **Özet**

| | |
|:---|:---|
| Tema seçimi | Admin panelde Settings üzerinden yapılır |
| Tema yapısı | Renkler, fontlar, butonlar vs. tamamen değiştirilebilir |
| Kullanıcı seçimi | Sadece Light / Dark Mode arasında seçim yapabilir |
| Tema eklemek | Yeni dosya + import = Hazır |

---

# 📈 **Avantajlar**

- Çok esnek ve geliştirici dostu.
- Yeni projelerde sadece tema dosyası değiştirerek bambaşka görünümler elde edebilirsin.
- Kullanıcı deneyimi artırılır: hem tema, hem dark-light uyumu aktif.

---

