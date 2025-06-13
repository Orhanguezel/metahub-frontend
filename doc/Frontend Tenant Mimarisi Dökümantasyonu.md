
---

## 📘 Frontend Tenant Mimarisi Dökümantasyonu

### 1. 🌐 Frontend Alan Adları

| Tenant      | Domain                                                             |
| ----------- | ------------------------------------------------------------------ |
| `metahub`   | [https://www.guezelwebdesign.com](https://www.guezelwebdesign.com) |
| `anastasia` | [https://www.koenigsmassage.com](https://www.koenigsmassage.com)   |
| `ensotek`   | [https://www.ensotek.de](https://www.ensotek.de)                   |
| `radanor`   | [https://www.radanor.de](https://www.radanor.de)                   |

### 2. ⚙️ Frontend API Ayarları

Tüm frontend'ler tek bir backend’e bağlanır:

```ts
const API_BASE_URL = "https://api.guezelwebdesign.com";
```

Frontend'in request’lerine şu header eklenir:

```ts
headers: {
  "X-Tenant": "<tenant_name>", // örn. "anastasia"
}
```

> Eğer `X-Tenant` header eklenmezse, sunucu `resolveTenantFromHost(req.hostname)` kullanarak otomatik çözer.

---

## ✅ Örnek Kullanım: Axios

```ts
axios.get("/api/products", {
  baseURL: "https://api.guezelwebdesign.com",
  headers: {
    "X-Tenant": "anastasia",
  },
});
```

---

## 🧩 Önemli Notlar

* Yeni frontend deploy’larında `.env.production` içindeki `NEXT_PUBLIC_API_URL` ayarı:

```env
NEXT_PUBLIC_API_URL=https://api.guezelwebdesign.com
```

* Eğer statik export yapılacaksa, API endpointleri build sırasında da doğru tenant ile build edilmeli.

---

## ✅ Test için Hazır Tenantlar

| Tenant    | Durum | Not                                               |
| --------- | ----- | ------------------------------------------------- |
| metahub   | ✅     | `resolveTenantFromHost` + `.env.metahub` aktif    |
| anastasia | ⚠️     | frontend yeni API’ye yönlendirilmedi              |
| ensotek   | ⚠️     | yönlendirme + `X-Tenant` yapılandırması gerekiyor |
| radanor   | ⚠️     | yönlendirme + `X-Tenant` yapılandırması gerekiyor |

---

## 📦 Sonraki Adım Önerisi

Birlikte şu adımlarla ilerleyebiliriz:

1. `NEXT_PUBLIC_API_URL` güncellemesi (örnek: `anastasia`)
2. `X-Tenant` header otomatik olarak axios interceptor’a eklenmesi
3. Domain kontrolüyle tenant belirleme (opsiyonel)
4. Frontend deploy ve test
