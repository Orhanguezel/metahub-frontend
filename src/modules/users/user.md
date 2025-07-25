Harika, çok iyi gidiyoruz! 🎯  
Senin `userCrudSlice.ts` ve `userStatusSlice.ts` dosyaların **admin user yönetimi** için eksiksiz yapılandırılmış. Artık bu altyapıyı kullanarak aşağıdaki işlemleri kolayca gerçekleştirebiliriz:

---

### ✅ Yapılabilecek İşlemler (Mevcut)

| İşlem                        | Slice                 | Endpoint                              |
|-----------------------------|-----------------------|----------------------------------------|
| 🔍 Tüm kullanıcıları getir   | `userCrudSlice`       | `GET /users/users`                    |
| 👤 Tek kullanıcıyı getir     | `userCrudSlice`       | `GET /users/users/:id`                |
| ✏️ Kullanıcıyı güncelle      | `userCrudSlice`       | `PUT /users/users/:id`                |
| ❌ Kullanıcıyı sil           | `userCrudSlice`       | `DELETE /users/users/:id`             |
| 🔄 Aktif/Pasif durumu       | `userStatusSlice`     | `PUT /users/users/:id/status`         |
| 🏷️ Rol güncelle             | `userStatusSlice`     | `PUT /users/users/:id/role`           |

---

### 📦 Frontend Yapısı Önerisi

**Ana Sayfa:**
```
/app/admin/users/page.tsx
```
Bu dosya içerisinde `UsersPage` bileşenini render ediyoruz.

**Bileşenler:**
```
/components/admin/users/
├── UsersPage.tsx            ✅ Ana container
├── UserTable.tsx            ✅ Listeleme tablosu
├── UserTableRow.tsx         ✅ Tek satır
├── UserTableFilters.tsx     ✅ Arama / filtreleme
├── UserActions.tsx          ✅ Satır içi butonlar (Sil / Düzenle / Aktiflik)
├── UserEditModal.tsx        ✅ Güncelleme modalı (FormData ile)
```

---

### 🧠 Geliştirme Planı (Adım Adım)

1. ✅ `UsersPage.tsx` – Tüm bileşenleri bağlayan ana container.
2. ✅ `UserTable.tsx` – RTK'dan kullanıcı listesini alıp `UserTableRow` ile gösterir.
3. ✅ `UserTableFilters.tsx` – Arama inputu + filtreleme mantığı (isteğe bağlı).
4. ✅ `UserActions.tsx` – Aktiflik/rol değiştir, düzenle modalı aç, sil.
5. ✅ `UserEditModal.tsx` – Kullanıcıyı güncellemek için form.
6. ✅ Slice'lara bağlanan tüm işlemler yukarıdaki `userCrudSlice.ts` ve `userStatusSlice.ts` üzerinden yapılır.

---

### 💡 Ek Olarak Düşünebileceklerin

| Özellik                            | Açıklama |
|------------------------------------|----------|
| 🗂️ Sayfalama (Pagination)           | `GET /users?limit=10&page=2` gibi |
| 🔍 Detaylı arama / filtreleme       | Rol, email, aktiflik durumu vb. |
| 🏷️ Rol renkleri (Badge'ler)        | UI tarafında görsellik |
| 📸 Profil resmini değiştirme        | `FormData` destekli güncelleme |
| 📅 Kayıt tarihi gösterimi          | `createdAt` badge/tarih formatıyla |
| 🌐 Dil destekli kullanıcı listesi   | Kullanıcının dil tercihi vs. |

---

### ⚙️ Devam Edelim mi?

İstersen şimdi sırayla ilerleyelim:

- `UsersPage.tsx` dosyasının içeriğini birlikte organize edelim mi?
- Ardından `UserTable`, `UserTableRow` ve `UserActions` bileşenlerini bağlı şekilde geliştiririz.

Hazırsan `UsersPage.tsx` ile başlayalım 💪  
Yoksa önce `UserEditModal` veya `UserActions` gibi bir parça üzerinden mi gitmek istersin?



{
  "companyName": {
    "tr": "Ensotek CTP Su Soğutma Kuleleri Mühendislik San. Tic. Ltd. Şti.",
    "en": "Ensotek GRP Cooling Towers Engineering Ltd.",
    "de": "Ensotek GFK Kühltürme Ingenieurwesen GmbH",
    "fr": "Ensotek Tours de Refroidissement en PRV Ingénierie SARL",
    "pl": "Ensotek Wieże Chłodnicze z GRP Inżynieria Sp. z o.o.",
    "es": "Ensotek Torres de Refrigeración GRP Ingeniería S.L."
  },
  "companyDesc": {
    "tr": "Su soğutma kulelerinde 20 yılı aşkın tecrübe. Endüstriyel ve enerji santralleri için yüksek verimli çözümler.",
    "en": "Over 20 years of experience in cooling towers. High-efficiency solutions for industrial and power plants.",
    "de": "Über 20 Jahre Erfahrung mit Kühltürmen. Hochleistungs-Lösungen für Industrie und Kraftwerke.",
    "fr": "Plus de 20 ans d'expérience dans les tours de refroidissement. Solutions à haute efficacité pour l'industrie et les centrales électriques.",
    "pl": "Ponad 20 lat doświadczenia w wieżach chłodniczych. Wydajne rozwiązania dla przemysłu i elektrowni.",
    "es": "Más de 20 años de experiencia en torres de refrigeración. Soluciones de alta eficiencia para la industria y plantas de energía."
  },
  "tenant": "ensotek",
  "language": "tr",
  "taxNumber": "1234567890",
  "handelsregisterNumber": "9876543210",
  "registerCourt": "İstanbul Ticaret Sicil Müdürlüğü",
  "website": "https://www.ensotek.com.tr",
  "email": "info@ensotek.com.tr",
  "phone": "+90 212 123 45 67",
  "addresses": [
  ],
  "bankDetails": {
    "bankName": "Türkiye İş Bankası",
    "iban": "TR330006100519786457841326",
    "swiftCode": "ISBKTRISXXX"
  },
  "managers": [
    "Orhan Güzel",
    "Mehmet Yıldız"
  ],
  "images": [
     {   "url": "/uploads/company/logo.png",
   "thumbnail": "/uploads/company/logo-thumb.png",
   "webp": "/uploads/company/logo.webp",
      "publicId": "ensotek/logo_xxx"
    }
  ],
  "socialLinks": {
    "facebook": "https://www.facebook.com/ensotek",
    "instagram": "https://www.instagram.com/ensotek",
    "twitter": "https://twitter.com/ensotek",
    "linkedin": "https://www.linkedin.com/company/ensotek",
    "youtube": "https://www.youtube.com/@ensotek"
  },
  "createdAt": { "$date": "2024-07-24T20:00:00.000Z" },
  "updatedAt": { "$date": "2024-07-24T20:00:00.000Z" }
}
