
---

## 📋 **AnastasiaTheme ile %100 Uyumlu Stil Geliştirme Talimatı**

### 1. **Renkler ve Arka Planlar**

* **Tüm renkleri** doğrudan `theme.colors` üzerinden kullanın.

  * **Ana arka plan:** `theme.colors.background`
  * **Kart/Panel arka planı:** `theme.colors.cardBackground`
  * **Butonlar:** `theme.buttons.primary.background` ve benzerleri
  * **Border, input, placeholder:** Tema key’leri dışında renk **tanımlamayın**.
* **Soft pastel ve kontrastlara özen gösterin:** Koyu renkler yerine tema pastel tonlarını tercih edin.

### 2. **Fontlar ve Boyutlar**

* **Font aileleri** için:

  * Başlıklar: `theme.fonts.heading`
  * Metin: `theme.fonts.body`
* **Font boyutları**: Tüm `font-size` değerleri `theme.fontSizes` üzerinden seçilmelidir.

  * Ör: `${({ theme }) => theme.fontSizes.lg};`
* **Font ağırlıkları:** `theme.fontWeights` kullanın.

### 3. **Spacing ve Padding**

* **Tüm margin/padding/gap** değerlerini `theme.spacing` ile belirleyin.

  * Sabit piksel veya yüzde yerine `${({ theme }) => theme.spacing.md}` gibi kullanın.
* **Büyük boşluklarda** özellikle `xl`, `xxl` gibi daha ferah spacing’ler seçin.

### 4. **Border Radius & Shadow**

* **Tüm köşe yumuşatmalarında** sadece `theme.radii` anahtarları kullanın.

  * Butonlarda `pill`, kartlarda `xl` veya `md` uygundur.
* **Gölge efektleri** için sadece `theme.shadows` kullanın.

### 5. **Transition & Hover**

* **Hover ve geçiş efektleri** için tema içindeki transition anahtarlarını kullanın:

  * `${({ theme }) => theme.transition.normal}`
* **Butonlarda hover:**

  * Arka plan: `theme.buttons.primary.backgroundHover`
  * Yazı rengi: `theme.buttons.primary.textHover`
  * Gölge: `theme.shadows.lg`

### 6. **Responsive ve Grid Sistem**

* **Grid, flex ve medya sorguları** için tema breakpoints ve media key’lerini kullanın.

  * `@media (max-width: 768px)` yerine `${({ theme }) => theme.media.mobile}`
* **Grid için**:

  * Desktop: 3 kolona kadar genişlet
  * Tablet: 2 kolon
  * Mobile: 1 kolon

### 7. **Button ve Input Bileşenleri**

* **Butonlar**:

  * Arka plan, yazı rengi ve border doğrudan `theme.buttons.primary/secondary/danger` üzerinden alınmalı.
* **Inputlar**:

  * Arka plan, border ve placeholder için `theme.inputs` key’leri.
  * Focus halinde border ve shadow yine temadan.

### 8. **Card & Panel**

* **Kartlar**da background, border, gölge ve padding tamamen temadan alınmalı.
* Hover’da renk açılması, büyüme ve gölge tema ile sağlanmalı.

### 9. **Modal ve Overlay**

* Modal arka planları ve içerik kutuları için:

  * Overlay: `theme.colors.overlayEnd` veya rgba ile soft beyaz/pembe blur
  * İçerik: `theme.colors.cardBackground`, köşe yumuşatma ve xl shadow

### 10. **Icon, Tag, Badge, Link**

* **Renkler:** `theme.colors.primary`, `accent`, `tagBackground`
* **Linklerde hover:** Renk geçişi `theme.colors.primaryHover` ile belirginleşmeli.

---

### **Örnek Kodu Temaya Uyumlu Hale Getirmek İçin:**

* Hiçbir yerde sabit değer, hex/rgb veya `px` ile renk/boyut **tanımlamayın**.
* Sadece **`${({ theme }) => theme...}`** şeklinde kullanın.
* Her component için *padding*, *margin*, *radius*, *shadow*, *background*, *color*, *font* değerleri **mutlaka** temadan gelsin.
* Responsive ve grid için tema breakpoint’lerine bağlı olun.

---

### **Kısa Notlar**

* *Tasarımda “fazla beyaz alan”, “yumuşak border-radius”, “gölge ve pastel renk” asla tesadüf değil: Tema sadeliği ve kadın/modern estetik için seçilmiştir.*
* Eğer component/element için temada karşılığı yoksa, temaya yeni anahtar ekleyin ve tüm projede global kullanıma sokun.

---

## 📌 **Kopyalanabilir Başlangıç Template’i**

```js
const StyledDiv = styled.div`
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin: ${({ theme }) => theme.spacing.md};
  transition: background ${({ theme }) => theme.transition.normal};

  @media ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;
```

---

## **Sonuç**

> **Tüm stilleri ve componentlerini yukarıdaki talimatlara %100 uyarak geliştirirsen, projenin görsel bütünlüğü ve tematik uyumu daima mükemmel olur.**
