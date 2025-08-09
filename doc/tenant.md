
---

# TALİMATLAR.md — **Tenant Çözümleme & Modül Yönetimi (FINAL)**

Bu dosya tek kaynaktır. Kod, script, controller ve frontend sadece buradaki kurallara göre yazılır.

---

# 0) Çekirdek Gerçekler (değişmez)

* **Tek backend, tek frontend, tek `.env`.** `.env` sadece **boot**’ta okunur.
* **Tenant runtime’da çözülür.** Veri okuma/yazma ilgili **tenant’ın veritabanında** yapılır.
* **FS tabanlı meta/ayar yok.** `meta-configs/{tenant}/` ve benzerleri **yok**.

---

# 1) Backend — Tenant Resolve Sözleşmesi

**Öncelik sırası (verdiğin koda %100 uyumlu):**

1. **Header:** `x-tenant` (trim + lowercase)

   ```ts
   const tenantHeader = req.headers["x-tenant"]?.toString().trim().toLowerCase()
   ```

   * Varsa: `Tenants.findOne({ slug: tenantHeader })`

2. **Domain/Subdomain:**

   * `normalizeHost(req.hostname || req.headers.host)` → `www.` ve `:port` atılır.
   * Eğer host **API\_DOMAINS** içindeyse **Origin/Referer**’dan gerçek host çözülür.
   * DB’de arama:

     ```js
     { $or: [{ "domain.main": host }, { "domain.customDomains": host }] }
     ```

3. **DEV fallback (yalnız development):**

   * Sırasıyla `NEXT_PUBLIC_APP_ENV` → `NEXT_PUBLIC_TENANT_NAME` → `TENANT_NAME` env ile `slug` bulunur.

4. **Bulunursa req’e yaz:**

   ```ts
   req.tenant = tenantDoc.slug;
   req.tenantData = tenantDoc;
   req.enabledModules = (tenantDoc.enabledModules || []).map(m => m.trim().toLowerCase());
   next();
   ```

5. **Bulunamazsa 404 + i18n mesajı ve log:**

   ```ts
   logger.warn("[TENANT] Resolving failed", { host, tenantHeader });
   res.status(404).json({
     success: false,
     message: t("tenant.resolve.fail", locale, translations, { host, tenantHeader }),
     detail: process.env.NODE_ENV === "production"
       ? "Tenant slug not found on request object."
       : "Tenant slug not found in DEV environment. Please check your request and tenant setup.",
   });
   return;
   ```

**Host normalizasyonu (zorunlu):**

```ts
hostname.replace(/^www\./, "").toLowerCase().replace(/:\d+$/, "")
```

**Not:** Tüm controller’larda yanıt kuralı:

```ts
res.status(...).json(...);
return;
```

> `return res.status(...).json(...)` **yasak**.

---

# 2) Frontend — Tenant Detect Sözleşmesi

**Verdiğin koda uyumlu davranış:**

* **DOMAIN\_TENANT\_MAP**: bilinen prod domain → tenant eşlemesi (örn. `koenigsmassage.com → anastasia`).
* **Local/dev**: `localhost/127.0.0.1` için

  ```ts
  getDefaultTenant() = NEXT_PUBLIC_TENANT_NAME || NEXT_PUBLIC_APP_ENV || NEXT_PUBLIC_DEFAULT_TENANT || "metahub"
  ```
* **detectTenantFromHost(host?)**:

  * Host lowercase + **portu temizle**.
  * Map’te doğrudan eşleşme varsa onu dön.
  * Değilse: `www.` at, parçala → **iki parçaysa** ilk parça; **ikiden fazlaysa** sondan 2. parça.
  * **Prod’da fallback yok**: `undefined` dönebilir; üst katman handle eder.

**Favicon kuralı:**

* Varsayılan: `/favicon.ico`
* Tenant spesifik: `/favicons/{tenant}.ico`

**Zorunlu FE→BE başlık:**
Tüm API çağrıları **`x-tenant: <tenantSlug>`** header’ı ile gider.
Axios interceptor örneği:

```ts
api.interceptors.request.use((config) => {
  const tenant = detectTenantFromHost(); // ya da state’ten
  if (tenant) config.headers["x-tenant"] = tenant;
  return config;
});
```

---

# 3) Veritabanı Yönlendirme (özet kural)

* **db-per-tenant** senaryosu: tek cluster URI, **dbName = tenant’a ait**. Connection cache edilir.
* **single-db** senaryosu istenirse: tüm query’lerde `{ tenant: req.tenant }` filtresi zorunlu.

> Hangi strateji seçilirse seçilsin controller katmanının kontratı **değişmez**.

---

# 4) Modül Modeli (tenant-scoped — final)

**Artık her tenant’ın kendi `ModuleMeta` ve `ModuleSetting` kaydı var.**

## 4.1 `ModuleMeta` (tenant + name **unique**)

* **Sadece meta’da**: `label`, `icon`, `language`, `statsKey`, `history`, `routes`
* Saha listesi (senin sunduğun final şema ile **birebir**):

```ts
export interface IModuleMeta {
  tenant: string;
  name: string;
  label: TranslatedLabel;
  icon: string;
  roles: string[];
  enabled: boolean;
  language: SupportedLocale;
  version: string;
  order: number;
  statsKey?: string;
  history?: Array<{ version: string; by: string; date: string; note?: string }>;
  routes?: Array<{ method: string; path: string; auth?: boolean; summary?: string; body?: any }>;
  createdAt?: Date;
  updatedAt?: Date;
}
```

## 4.2 `ModuleSetting` (tenant + module **unique**)

* **Override alanları** + **SEO alanları**:

```ts
export interface IModuleSetting {
  module: string;
  tenant: string;
  enabled?: boolean;
  visibleInSidebar?: boolean;
  useAnalytics?: boolean;
  showInDashboard?: boolean;
  roles?: string[];
  order?: number;
  seoTitle?: TranslatedLabel;
  seoDescription?: TranslatedLabel;
  seoSummary?: TranslatedLabel;
  seoOgImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

**Kritik kural:**
`label`, `icon`, `language`, `statsKey`, `history`, `routes` **ASLA** setting’e yazılmaz.

---

# 5) Merge Mantığı (tek doğru)

* `displayLabel = meta.label`
* `displayIcon = meta.icon`
* `displayLanguage = meta.language`
* `displayRoles = setting?.roles ?? meta.roles`
* `enabled = setting?.enabled ?? meta.enabled`
* `order = setting?.order ?? meta.order`
* `seo = { title, description, summary, ogImage }` **yalnızca setting’ten**

---

# 6) Seed & Health Kuralları (özet)

* **Yeni tenant** → tüm modüller için **Meta + Setting** (yoksa) oluştur.
* **Yeni modül** → tüm aktif tenantlarda **Meta + Setting** (yoksa) oluştur.
* **Health/repair** → eksikleri tamamla, (opsiyonel) **orphan** kayıtları temizle.
* Tüm işlemler **idempotent** (tekrar çalıştırmak kopya üretmez).

**Eski/yanlış alan temizlik (tek seferlik):**

```ts
await ModuleSetting.updateMany({}, {
  $unset: { label: "", icon: "", language: "", statsKey: "", history: "", routes: "" }
});
```

---

# 7) Controller Yanıt Standardı (kritik kural)

```ts
res.status(...).json(...);
return;
```

> `return res.status(...).json(...)` **yasak** – log & middleware tutarlılığı için.

---

# 8) Test Checklist

* [ ] Header ile çözümleme: `x-tenant` gönder → doğru tenant set ediliyor mu?
* [ ] Domain çözümleme: **API\_DOMAINS** senaryosunda Origin/Referer’dan host doğru alınıyor mu?
* [ ] DEV fallback: env’deki tenant ile bulunuyor mu (sadece dev)?
* [ ] `req.enabledModules` doğru doluyor mu?
* [ ] Bulunamayan tenant → **404 + i18n mesaj** + **uyarı logu**?
* [ ] FE tüm isteklerde **`x-tenant` header**’ını gönderiyor mu?
* [ ] Favicon **/favicons/{tenant}.ico** ile doğru geliyor mu?

---

Bu talimatlar **senin paylaştığın backend `resolveTenant` ve frontend `tenant.ts` akışına birebir uyumludur.**
