

````md
# 🏗️ TENANT DEPLOYMENT GUIDE

Bu doküman, `Metahub` altyapısı ile çalışan tenant (çok kiracılı) sistemlerin **tek backend**, **çoklu frontend**, **tek API domaini** üzerinden nasıl yönetileceğini açıklar.

---

## 🔧 GENEL MİMARİ

| Katman       | Açıklama                                                             |
| ------------ | -------------------------------------------------------------------- |
| **Backend**  | `api.guezelwebdesign.com` üzerinden tek bir PM2 süreciyle çalışır    |
| **Frontend** | Her tenant ayrı build alır, kendi domain'inde yayınlanır (`*.com`)   |
| **DB**       | Her tenant, `.env.${tenant}` ile kendi veritabanına bağlanır         |
| **Auth**     | `withCredentials` + `COOKIE_DOMAIN=.domain.com` kullanır             |
| **Tenant**   | `X-Tenant` veya `hostname` ile otomatik çözülür (`resolveTenant.ts`) |

---

## 🚀 1. BACKEND YAPILANDIRMASI

### .env Dosyası

Her tenant için ayrı `.env` dosyası gereklidir (örneğin: `.env.metahub`, `.env.anastasia`).

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
SMTP_HOST=...
...
````

### PM2 ile Tek Backend

`ecosystem.config.js`:

```js
module.exports = {
  apps: [
    {
      name: "metahub-api",
      script: "dist/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 5019,
      },
    },
  ],
};
```

> Not: Tüm tenant'lar aynı API üzerinden çağrılır. Tenant, `req.hostname` veya `X-Tenant` header'ı ile belirlenir.

---

## 💻 2. FRONTEND YAPILANDIRMASI

### .env.production Dosyası (örnek: `anastasia-frontend`)

```env
NODE_ENV=production
TENANT_NAME=anastasia
NEXT_PUBLIC_APP_ENV=anastasia

NEXT_PUBLIC_API_URL=https://www.koenigsmassage.com
NEXT_PUBLIC_API_BASE_URL=https://api.guezelwebdesign.com
NEXT_PUBLIC_MEDIA_URL=https://api.guezelwebdesign.com
NEXT_PUBLIC_SOCKET_URL=https://api.guezelwebdesign.com

NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...

COOKIE_DOMAIN=.koenigsmassage.com
```

### Build Alma

```bash
bun install
export TENANT_NAME=anastasia
export NODE_ENV=production
bun run build
```

> Her tenant için ayrı build klasörü (`/var/www/tenant-frontends/anastasia-frontend`) oluşturulmalıdır.

---

## 📦 3. PM2 FRONTEND CONFIG

```js
{
  name: "anastasia-prod",
  script: ".next/standalone/server.js",
  cwd: "/var/www/tenant-frontends/anastasia-frontend",
  env: {
    NODE_ENV: "production",
    TENANT_NAME: "anastasia",
    NEXT_PUBLIC_APP_ENV: "anastasia",
    NEXT_PUBLIC_API_URL: "https://www.koenigsmassage.com",
    NEXT_PUBLIC_API_BASE_URL: "https://api.guezelwebdesign.com",
    ...
  }
}
```

---

## 🌍 4. DNS ve NGINX

Her tenant için domain yönlendirmesi yapılmalı (örneğin: `koenigsmassage.com → anastasia-frontend`, `api.guezelwebdesign.com → backend`).

```nginx
server {
  server_name koenigsmassage.com;
  root /var/www/tenant-frontends/anastasia-frontend;

  location / {
    proxy_pass http://localhost:3000; # anastasia-prod
    ...
  }
}
```

API için:

```nginx
server {
  server_name api.guezelwebdesign.com;

  location / {
    proxy_pass http://localhost:5019; # Tek backend
    ...
  }
}
```

---

## 🔑 5. TENANT TESPİTİ

```ts
// resolveTenant.ts
export const resolveTenantFromHost = (host: string): string => {
  const tenantMap = {
    "koenigsmassage.com": "anastasia",
    "guezelwebdesign.com": "metahub",
    ...
  };
  return tenantMap[host.toLowerCase()] || "default";
};
```

> Alternatif olarak, frontend her istekte `X-Tenant` header'ı ile tenant'ı gönderebilir.

---

## ✅ 6. CHECKLIST

* [ ] `.env.${tenant}` dosyaları `/api` backend'de mevcut
* [ ] PM2 ile her frontend ayrı process olarak çalışıyor
* [ ] Frontend `.env` içinde `TENANT_NAME`, `NEXT_PUBLIC_API_URL` doğru
* [ ] NGINX yönlendirmeleri doğru yapılandırıldı
* [ ] `resolveTenantFromHost()` tanımı her domain için güncel
* [ ] API çağrıları `X-Tenant` veya `hostname` üzerinden tenant'ı doğru alıyor

---

## 📌 ÖNERİLER

* SEO için frontend'de `og:image`, `canonical`, `robots.txt`, `sitemap.xml` gibi dosyalar tenant’a özgü yapılandırılmalı.
* Her frontend için ayrı `apiKey` belirleyip `.env` içinde `NEXT_PUBLIC_API_KEY` olarak gönderilebilir.
* `.env.production` kullanımı **kapatılmalı**. Sadece `.env.${tenant}` kullanılmalıdır.
* `.next` klasörü production build sonrası PM2 ile birlikte kullanılmalı.

---

## 🧹 Temizlik ve Güncelleme

```bash
# Build öncesi temizlik
rm -rf .next
bun install

# Yeni tenant eklemek için:
cp -r metahub-frontend/ newtenant-frontend/
cd newtenant-frontend
# .env.production güncelle
bun run build
```

---
