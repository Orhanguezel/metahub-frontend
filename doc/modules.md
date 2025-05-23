Tabii! İşte **MetaHub Admin Paneli - Frontend Modules Modülü** için **ayrıntılı teknik dokümantasyon**:

---

# 🧩 Frontend Modules Modülü – MetaHub Admin

Bu modül, **MetaHub Admin Paneli** altında yer alan tüm backend modüllerini **listelemek**, **oluşturmak**, **düzenlemek** ve **silmek** için geliştirilmiştir.

Kullanıcı dostu arayüzü, çok dilli destek (TR/EN/DE), Toast bildirimleri ve güvenli işlem adımları (onaylı silme) içerir.

---

## 📁 Dosya Yapısı

| Dosya                          | Açıklama                                                        |
|:--------------------------------|:-----------------------------------------------------------------|
| `page.tsx`                      | Ana sayfa, sadece `<ModuleManager />` bileşenini render eder.   |
| `ModuleManager.tsx`             | Modül listesini ve proje seçiciyi yöneten ana yönetim bileşeni. |
| `ModuleCard.tsx`                | Her bir modülü kart formatında gösterir. Silme ve Swagger linki içerir. |
| `ModuleDetailModal.tsx`         | Seçili modül detaylarını ve geçmişini (history) gösterir. |
| `CreateModuleModal.tsx`         | Yeni bir modül oluşturmak için modal formu. |
| `ConfirmDeleteModal.tsx`        | Modül silmeden önce kullanıcı onayı isteyen modal. |
| `EditModuleModal.tsx`           | Seçili modülü düzenlemek için modal formu. |

---

## 🛠️ Ana Özellikler

### 1. ModuleManager.tsx

- Tüm projeleri (`/admin/projects`) çeker.
- Seçili projeye bağlı modülleri (`/admin/modules?project=xxx`) listeler.
- Modül detayını (`/admin/module/:name`) açar.
- Yeni modül eklemek için CreateModuleModal'ı açar.
- Modül silme için ConfirmDeleteModal'ı açar.
- Seçili modül düzenlenebiliyor.

> Redux Toolkit üzerinden `adminSlice` kullanılarak tüm API çağrıları yapılır.

---

### 2. ModuleCard.tsx

- Modülün temel bilgilerini (ad, label, durumlar, tarih) gösterir.
- Swagger linki oluşturur (`/api-docs/#/moduleName`).
- Sağ üst köşede modül silme (`Trash`) ikonu vardır.
- Aktif / Pasif / Sidebar / Analytics durumlarını renkli ikonlarla gösterir.

---

### 3. ModuleDetailModal.tsx

- Seçili modülün detaylı bilgilerini ve geçmiş versiyonlarını listeler.
- Başlık alanında `Edit (Pencil)` ve `Close (X)` butonları vardır.
- `Pencil` butonuna basıldığında düzenleme moduna geçiş yapılır.

---

### 4. CreateModuleModal.tsx

- Yeni bir modül eklemek için form sunar.
- Alanlar:
  - Modül İsmi
  - İkon
  - Dil seçimi (EN/TR/DE)
  - Sidebar görünürlüğü
  - Analytics kullanımı
  - Aktif/Pasif durumu
- **Başarılı** oluşturma sonrası: 
  - Modüller yeniden yüklenir.
  - Toastify ile bilgi mesajı gösterilir.
  - `.env` dosyasına dikkat çekilir ("Modülü aktif etmek için .env kontrolü yapın.").

---

### 5. ConfirmDeleteModal.tsx

- Silme işleminden önce kullanıcıya "Bu modül silinecek, emin misiniz?" sorusu sorar.
- İptal veya Sil butonları sunar.
- Silme işlemi sonrası modül listesi yenilenir.

---

### 6. EditModuleModal.tsx

- Seçili modülün:
  - Label (TR/EN/DE)
  - İkon
  - Roller (virgülle ayrılmış)
  - Sidebar görünürlüğü
  - Analytics kullanımı
  - Aktiflik durumu
- bilgilerini düzenlemeye imkan verir.
- Düzenleme sonrası modüller tekrar yüklenir ve Toastify ile bildirim yapılır.

---

## 🌐 API İstekleri

| Endpoint                       | Açıklama                       |
|:--------------------------------|:-------------------------------|
| `GET /admin/projects`           | Tüm projeleri getirir.         |
| `GET /admin/modules?project=xx` | Projeye bağlı modülleri getirir. |
| `GET /admin/module/:name`       | Seçili modül detaylarını getirir. |
| `POST /admin/modules`           | Yeni modül oluşturur.           |
| `PATCH /admin/module/:name`     | Var olan modülü günceller.      |
| `DELETE /admin/module/:name`    | Var olan modülü siler.          |

---

## 📈 Akış Diyagramı

```
ModuleManager
  ├── CreateModuleModal (➕ Yeni modül oluştur)
  ├── ModuleCard (🗑️ Modül Sil | 🧩 Swagger Link | ✏️ Düzenle)
  ├── ModuleDetailModal (🔍 Modül Detayı)
  │     └── EditModuleModal (✏️ Düzenleme ekranı)
  └── ConfirmDeleteModal (🛑 Silme Onayı)
```

---

## ✅ Kullanım Özetleri

- **Yeni Modül Ekleme** ➡️ `CreateModuleModal`
- **Mevcut Modülü İnceleme ve Düzenleme** ➡️ `ModuleDetailModal` ➡️ `EditModuleModal`
- **Modül Silme** ➡️ `ConfirmDeleteModal`
- **Proje Seçme ve Dinamik Modül Listeleme** ➡️ `ModuleManager`
- **Anlık bildirimler** ➡️ `react-toastify`

---

## 🚀 Ekstra Güçlü Özellikler

- Çoklu Dil Desteği (i18next) 🔥
- Tüm işlemler Toastify Bildirimli ✅
- Silme işlemleri kullanıcı onaylı 🛡️
- Proje bazlı modül yönetimi destekli 🏗️
- Redux Toolkit ile global durum yönetimi 🌎

---

## 📋 Minimum Gereksinimler

- Next.js 14+ (veya React 18+)
- Redux Toolkit
- Styled Components
- react-i18next
- react-toastify
- Tailwind veya kendi tema sistemi (Opsiyonel)
- Axios (apiCall.js içinde var)

---
