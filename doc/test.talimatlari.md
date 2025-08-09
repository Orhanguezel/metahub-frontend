# 🧪 MetaHub API Test Talimatları — **Postman** (tenant-scoped)

Bu talimatlar, **Modules (Meta / Setting / Maintenance)** uçlarını **Postman** ile test etmek için net bir standart sunar. Tüm istekler **`x-tenant`** header’ı ile **tenant-scoped** çalışır; **path/body’de tenant YOK**.

---

## 1) Koleksiyonu içeri aktar

1. Postman > **Import** > **Raw text / File** ile verdiğim “**Metahub Modules API**” koleksiyonunu içeri al.
2. Koleksiyon adını değiştirme—CI/CD’de aynısını kullanacağız.

---

## 2) Environment ve Değişkenler

Postman’de **3 environment** öneriyoruz: **Local**, **Staging**, **Prod**. Her birinde şu değişkenler tanımlı olsun:

* `base_url` → `http://localhost:5000/api` (veya env’e göre)
* `tenant` → ör. `metahub`
* `admin_token` → JWT / session token (backend auth gerekiyorsa)
* `moduleName` → test modül adı (boş bırakabilirsin; pre-request script üretir)

**Koleksiyon değişkenleri** (Collection Variables) da desteklenir; env > collection > request sırasıyla override olur.

---

## 3) Zorunlu Header’lar

* `x-tenant: {{tenant}}` (**zorunlu**)
* Auth gerekiyorsa:

  * **Authorization** tab’ından **Bearer Token** seç → `{{admin_token}}`
    (Ya da direkt header: `Authorization: Bearer {{admin_token}}`)

> Not: Projede authenticate middleware kapalıysa Authorization gerekmez. Açık ise token şart.

---

## 4) Çalıştırma Sırası (önerilen)

**Modules / Meta**

1. Create Module Meta
2. List Module Metas
3. Get Module Meta by Name
4. Update Module Meta
5. Delete Module Meta (cleanup)

**Modules / Setting**

1. List Tenant Module Settings
2. Update Module Setting (override)
3. Delete One Module Setting
4. Delete ALL Tenant Settings (cleanup)

**Modules / Maintenance**

1. Matrix (tenant)
2. Batch Assign (tenant)
3. Repair Settings (tenant)
4. Analytics Status (tenant)
5. Cleanup Orphan (tenant)
6. Tenant Cleanup (delete all mappings)

> İpucu: **Runner** ile klasör bazında sırayla koştur, “Stop run on failure” işaretli olsun.

---

## 5) Dinamik veri (otomatik moduleName üretimi)

Koleksiyon “Pre-request Script”’ine ekle (zaten ekli geldiyse dokunma):

```js
const ts = Date.now();
if (!pm.collectionVariables.get('moduleName')) {
  pm.collectionVariables.set('moduleName', `pm_meta_${ts}`);
}
if (!pm.collectionVariables.get('timestamp')) {
  pm.collectionVariables.set('timestamp', ts.toString());
}
```

**Kullanım:** Body/Path içinde `{{moduleName}}` ve `{{timestamp}}`.

---

## 6) Test/Assertions (Tests tab’ına ekle)

Her istekte aşağıdaki minimal kontrolleri öneriyoruz:

```js
pm.test("HTTP 2xx", () => pm.response.code >= 200 && pm.response.code < 300);
pm.test("JSON", () => pm.response.headers.get("Content-Type").includes("application/json"));
const json = pm.response.json();
pm.test("success:true", () => json.success === true);
```

Örnek: **Create Meta** sonrası **Get by Name**’e aktarım:

```js
const json = pm.response.json();
if (json?.data?.name) {
  pm.collectionVariables.set("moduleName", json.data.name);
}
```

---

## 7) Body/Path Kuralları (tenant-scoped)

* **Tenant** path/body ile **ASLA** gönderilmez.
  Sadece `x-tenant` header’ı kullanılır.
* **Modules / Setting** ve **Maintenance** uçları, **header’daki tenant** için çalışır.
* **Meta** uçlarında da `tenant` field body’de yasak (validasyon hata verir).

---

## 8) Cleanup Politikası

* Testler **her koşumda iz bırakmamalı**.
* “Delete Module Meta” ve “Delete ALL Tenant Settings” isteklerini **run** sonunda çalıştır.
* Runner’da klasör bazında **en altta** cleanup istekleri olsun.

---

## 9) Hata Ayıklama

* **401/403**: Token eksik/yanlış → `{{admin_token}}` kontrol et; Auth sekmesinden Bearer seçili mi?
* **404 (notFound)**: Meta adın yanlış ya da silinmiş. `{{moduleName}}` güncel mi?
* **400 (tenantRequired/tenantNotAllowed)**: Tenant’ı path/body’de gönderme; sadece header!
* **CORS/Proxy**: `base_url` domain/port doğru mu? Nginx/proxy’den geçiyorsan **/api** önekini unutma.

---

## 10) Postman Runner & Raporlama (opsiyonel)

* **Runner** ile klasörleri sırayla koştur.
* Takım/CI için **Monitors** veya **Newman** (opsiyonel) kullan—ama bu doküman **Postman UI** odaklı.

---

## 11) Kabul Kriterleri (Done Definition)

* Tüm folder istekleri **2xx** dönüyor.
* Her istek **`success: true`** ve beklenen şemaya uygun.
* **Tenant path/body** ihlali yok (yalnız `x-tenant`).
* Çalıştırma sonrası **databasede artık test artığı yok** (cleanup tamam).

---

İhtiyaç olursa koleksiyonu ortamına göre (Local/Staging/Prod) üç kopya olarak kaydedip yalnızca **Environment** değiştir; istek JSON’larını elle değiştirme.
