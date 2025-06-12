
---

# 🌐 MetaHub — Admin Panel: Veri Yönetimi ve Render Prensipleri

### Amaç

* Her modülün/verinin **tek bir yerde** ve **gereksiz tekrar olmadan** çekilmesini, dağıtılmasını ve kullanılmasını sağlamak.
* Komponentlerde **gereksiz tekrar fetch/useEffect** olmamasını, sadece store’dan *consume* (tüketim) olmasını garanti etmek.
* Büyük data ile çalışırken frontend performansını korumak ve future-proof, sürdürülebilir mimari sunmak.

---

## 1. **Ana Prensip: Tek Noktada Fetch, Diğerlerinde Sadece Store’dan Tüketim**

* **Fetch/dispatch işlemleri** (API’den veri çekme, state güncelleme) **sadece bir parent** (ör: `AdminLayout`, `AnalyticsPanel`, veya modülün ana sayfası) içinde yapılır.
* **Child componentler** (ör: `Sidebar`, `Header`, `AnalyticsTable`, `MapChart`) **asla kendi başına fetch/dispatch yapmaz**; sadece `useAppSelector` ile store’dan veri okur.
* Herhangi bir child’ın fetch/disptach işlemi yapması *kesinlikle yasaktır*; “props drilling” ya da store’dan okuma ile veri taşınır.

---

## 2. **Store’dan Okuma — Tüketici Componentler**

* Child componentlerde **yalnızca store’dan veri okunur**:

  * Örneğin `Sidebar` için:

    ```ts
    const modules = useAppSelector((state) => state.admin.modules);
    ```
  * `AnalyticsPanel`, `MapChart`, `BarChart`, `LineChart`, `AnalyticsTable` için:

    ```ts
    const events = useAppSelector((state) => state.analytics.events);
    ```
* **Props ile veri geçirmek** sadece geçici ve *stateless* bilgiler (ör: filtre değerleri, UI seçimleri) için kullanılır.

---

## 3. **Central Fetching Logic (Tek Yerde Fetch)**

* **Tüm API fetch/dispatch işlemleri**:

  * Sadece `AdminLayout`, `AnalyticsPanel` gibi en üst parent bileşenlerde yapılır.
  * Bu parent bileşen, store’a gerekli dispatch’leri yapar ve yüklenen state’i store’a yazar.
  * `useEffect` ile yapılan fetch’ler sadece burada tanımlanır.
* Hiçbir child component veya hook tekrar fetch/dispatch trigger edemez!

---

## 4. **Performans ve Memoization Best Practice**

* Büyük array veya obje state’leri child’a geçerken, **`slice` ile sadece gerekli kısmı** geçir:

  * Örn: `<AnalyticsTable data={events.slice(0, 50)} />`
* Child componentlerde, veri değişmediği sürece tekrar render olmaması için:

  * useMemo ve/veya memoized selector kullan.
* State’in shallow compare ile değişmediğinden emin ol.
* Büyük veri ile çalışan bileşenlerde (tablo, harita, grafik), sadece “görünen” kadarını render et.

---

## 5. **Tekrar Eden Fetch, Sonsuz Döngü ve Redundant Render Önlemleri**

* Aynı store state’i birden fazla yerde tekrar fetch etmeyin.
* Aynı veriyi birden fazla parent/child component tekrar fetch etmemeli.
* Tab/dependency değişimlerinde, gereksiz yere useEffect tetiklenmesini önle (örn: project, filter veya sadece ilk yüklemede fetch).
* Gerekiyorsa “fetched” state’i ile ilk yüklemede fetch edilmiş mi kontrol edin.

---

## 6. **Future-Proof ve Modülerlik**

* Her modül sadece kendi alanından sorumludur; veri yönetimini tek yerde yapar.
* Yeni modül eklendiğinde, o modülün ana sayfası veya context’i dışında fetch/dispatch yapılmaz.
* Childlar store’dan okuyarak kolayca başka parent’a takılabilir, yeniden kullanılabilir.

---

## 7. **Örnek Kod Özetleri**

### AdminLayout:

```ts
// Sadece burada dispatch ile fetch
useEffect(() => {
  if (!fetchedAvailableProjects) {
    dispatch(fetchAvailableProjects());
  }
  // ...diğer fetchler
}, [dispatch, fetchedAvailableProjects]);
```

### Sidebar:

```ts
// Sadece useAppSelector ile store'dan oku, fetch yok!
const modules = useAppSelector((state) => state.admin.modules);
```

### AnalyticsPanel:

```ts
useEffect(() => {
  // Sadece burada fetch!
  dispatch(fetchAnalyticsEvents({ ...filters, limit: 100 }));
}, [dispatch, selectedProject, ...]);
```

### MapChart/BarChart/AnalyticsTable:

```ts
const events = useAppSelector((state) => state.analytics.events);
// Sadece events'in küçük bir kısmını ver
<AnalyticsTable data={events.slice(0, 50)} />
```

---

## 8. **Checklist — Kontrol Listesi**

* [ ] **Childlar** sadece store’dan veri okuyor (fetch/dispatch yok).
* [ ] **Parent** (layout/panel) sadece bir kez fetch/dispatch yapıyor.
* [ ] **Büyük array/objeler** child’a sadece gerekli kadar geçiriliyor.
* [ ] **Aynı veri tekrar tekrar fetch edilmiyor**.
* [ ] **useMemo/memo** ile gereksiz render önlenmiş.
* [ ] **Yeni modül eklerken**: sadece parent fetch, child store’dan okur.

---

> **Sonuç:**
> Bu akışa uyduğun sürece;

* Sonsuz döngü, redundant fetch, performans kaybı olmaz.
* Kod future-proof, sürdürülebilir ve modüler kalır.
* Tüm childlar “stateless ve bağımlı” şekilde kolayca başka layoutlarda da kullanılabilir.

---

Dilersen bu talimatı direkt **project-docs/frontend-architecture.md** veya “contributing” dökümanına da koyabilirsin!
Ek örnek, kod template veya otomatik test kuralı istersen yazabilirim.
