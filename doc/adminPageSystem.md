
# 📚 **Admin Panel Sistem Notları (2025)**

---

## 🎯 **Genel Amacımız:**
➔ Admin Panelindeki tüm sayfalarda **aynı standart veri akışı** ve **bileşen yapısını** kullanmak.  
➔ Böylece **tüm Admin modülleri** (Settings, Users, Products vs.) aynı yapıdan çalışacak.

---

## 🛠️ **Admin Sayfa Akışı (Standart Prosedür):**

1. **Başlangıçta:**  
   ➔ `fetchAvailableProjects()` ➔ Tüm projeleri getir.

2. **Sonra:**  
   ➔ `selectedProject` seçiliyse `fetchAdminModules(selectedProject)` çağır.  
   ➔ Aynı anda istersen `fetchAllModulesAnalytics()` de çekilebilir (sayfa ihtiyacına göre).

3. **Veriler geldiğinde:**  
   ➔ `modules` state içinden verileri al.  
   ➔ Gerekirse **filtrele**, **dil desteği uygula**, **iconları çek**.

4. **Arayüzde Kullanım:**  
   ➔ `DynamicAdminPageBuilder` gibi modül kartlarını çizdir.  
   ➔ Sidebar içeriğini `useAdminSidebarModules()` ile doldur.

---

## 📂 **Veri Kaynakları:**

| Kullanım Alanı  | Data Kaynağı                  | Açıklama                        |
|-----------------|--------------------------------|----------------------------------|
| **Dashboard Kartları** | `state.admin.modules` ➔ `mappedModules` | Kart görünümü için |
| **Sidebar Menüsü** | `state.admin.modules` ➔ `sidebarModules` | Sidebar için (enabled + visibleInSidebar) |
| **Settings Verisi** | `state.settings.settings` | Ayarlar için özel store |
| **Kullanıcı Verisi** | `state.user.users` veya ilgili slice | Kullanıcı listesi için |

---

## 🖇️ **Component Yapı Standardı:**

Her Admin Sayfası:
- Başta **Proje** ve **Modüller** fetch eder.
- Gelen modülleri kullanarak `DynamicAdminPageBuilder` gibi liste bileşenleri oluşturur.
- **Loading** ve **Error** durumlarını **standart** gösterir.

**Şablon:**
```tsx
if (loading) return <div>Yükleniyor...</div>;
if (error) return <div>Hata oluştu...</div>;

return (
  <main>
    <DynamicAdminPageBuilder modules={mappedModules} />
  </main>
);
```

---

## 🗺️ **Veri Akışı (Sıralı Şema):**

```
Page açıldı →
fetchAvailableProjects() →
selectedProject set edildi →
fetchAdminModules(selectedProject) →
modules state doldu →
mappedModules veya sidebarModules hazırlandı →
DynamicAdminPageBuilder / Sidebar kullanıldı →
UI çizildi
```

---

## ⚙️ **Hooklar:**

| Hook               | Görev                                               |
|--------------------|-----------------------------------------------------|
| `useAppSelector`    | Redux state verilerini almak için |
| `useAppDispatch`    | Redux action dispatch etmek için |
| `useAdminSidebarModules` | Sidebar için modülleri almak |
| `useGetAdminModules`     | Page builder için modülleri almak |

---

# 🏗️ **Özetle Ne Yapmak İstiyoruz?**

- **Her admin modülü aynı yapıda olsun.**
- **Backend'den gelen admin modül verileri hem dashboard, hem sidebar için kullanılsın.**
- **SettingsPage, UsersPage gibi tüm admin sayfaları bu yapıyı takip etsin.**
- **Tema sistemi, dark-light ayrımı ve çoklu proje desteği daima aktif olsun.**
- **Loading, error gibi durumlar standart kalsın.**
- **Yeni admin modülü eklendiğinde 5 dk'da çalışır olsun!** 🚀

---