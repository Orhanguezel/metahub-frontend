---

# 🎨 **Metahub – Tema Sistemi Dokümantasyonu (v2.0)**

---

## 🎯 **Amaç**

- Her proje için farklı **görsel tema** (örnek: `classic`, `modern`, `minimal`, `futuristic`) desteği sağlamak.
- Admin panelinde tanımlanan `site_template` değeri üzerinden tema **otomatik yüklensin**.
- Ziyaretçiler sadece **light / dark mode** arasında geçiş yapabilsin.
- Tüm renkler, yazı tipleri, butonlar, inputlar **tema dosyasından** gelsin.
- Yeni tema eklemek sadece bir **dosya oluşturmak ve import etmek kadar** kolay olsun.

---

## 🧱 **Yapılandırma**

### `src/styles/themes/` klasörü:

Her tema ayrı bir dosyada tanımlanır:

```txt
classicTheme.ts
modernTheme.ts
minimalTheme.ts
futuristicTheme.ts
```

---

## 🗂️ `themes/index.ts`

```ts
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

✅ Yeni bir tema eklemek için:

1. `newTheme.ts` dosyasını oluştur  
2. `themes/index.ts` içine import et  
3. `themes` nesnesine ekle  
4. `site_template` key’i ile admin panelden tanımla → otomatik çalışır

---

## 🧠 `ThemeProviderWrapper.tsx`

```tsx
const selectedTemplate = settings.find((s) => s.key === "site_template")?.value || "classic";
const templateTheme = themes[selectedTemplate as ThemeName] || themes["classic"];
```

💡 Seçilen tema `styled-components`'a `ThemeProvider` ile aktarılır.  
Bu sayede her component içinden `theme.colors.primary` gibi değerler alınabilir.

---

## 🌗 **Dark / Light Mod Desteği**

```tsx
const [isDark, setIsDark] = useState(() => {
  return localStorage.getItem("theme_mode") === "dark" || window.matchMedia("(prefers-color-scheme: dark)").matches;
});
```

Ziyaretçi `toggle` ile değiştirebilir:

```tsx
const toggle = () => {
  setIsDark((prev) => {
    const next = !prev;
    localStorage.setItem("theme_mode", next ? "dark" : "light");
    return next;
  });
};
```

---

## 🎨 **finalTheme – Uygulanan Tema**

```tsx
const finalTheme = {
  ...templateTheme,
  background: isDark ? "#121212" : templateTheme.background,
  text: isDark ? "#ffffff" : templateTheme.text,
};
```

💡 `styled.d.ts` içinde `DefaultTheme` tipi tanımlıdır, bu sayede tip hataları oluşmaz.

---

## 📦 Tema Dosyası Yapısı

Her tema dosyası aşağıdaki alanları içermelidir:

```ts
export const classicTheme: DefaultTheme = {
  templateName: "classic",
  colors: {
    background: "#ffffff",
    text: "#111111",
    primary: "#0057A0",
    secondary: "#eee",
    ...
  },
  buttons: {
    primary: {
      background: "#0057A0",
      text: "#ffffff",
      hover: "#004080",
    },
  },
  inputs: { ... },
  fontSizes: { sm: "14px", md: "16px", lg: "20px" },
  radii: { sm: "4px", md: "8px" },
  ...
};
```

---

## ⚙️ Ayarların Alındığı Settings

| Anahtar (key)     | Açıklama                             | Tür       | Örnek             |
|-------------------|--------------------------------------|-----------|-------------------|
| `site_template`   | Temanın adı                          | string    | `"classic"`       |
| `theme_mode`      | Ziyaretçi için ilk açılış modu       | string    | `"dark"`, `"light"` |
| `available_themes`| Admin panelde seçilebilecek temalar | string[]  | `["classic", "modern"]` |

---

## 🧪 Kullanım Örnekleri

```tsx
// Temadan gelen renk
color: ${({ theme }) => theme.colors.primary};

// Buton arkaplanı
background: ${({ theme }) => theme.buttons.primary.background};
```

---

## ✅ Geliştirici Notları

| Özellik | Açıklama |
|--------|----------|
| Yeni tema eklemek | `themes/index.ts` dosyasına eklenir, otomatik çalışır |
| Dark-Light desteği | Ziyaretçi tarafından localStorage içinde tutulur |
| Admin kontrolü      | Yalnızca `site_template` backend'den belirlenir |
| Çoklu tema desteği  | Tüm stiller `theme` objesinden gelir |

---

## 📌 Sonuç

- 🎯 Geliştirici olarak UI katmanını tek dosyada tanımlayabilirsin
- 💡 Ziyaretçi deneyimini artırmak için dark/light geçişi hazır
- ⚙️ Projeler arasında aynı kod altyapısıyla farklı tema görünümü sağlanır

---

İstersen sonraki adımda Navbar ya da Visitor Panel için tema geçiş efektlerini de tanımlarız. Hazır mısın?