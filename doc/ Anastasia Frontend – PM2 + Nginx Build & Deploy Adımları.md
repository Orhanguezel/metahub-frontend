

```md
# 🚀 MetaHub Multi-Tenant Frontend + Backend Prod Kurulum Rehberi (Anastasia Örneği)

## 📁 1. Dosya Yapısı

Tüm tenant projeleri `/var/www/tenant-frontends/` altında tutulur:

```

/var/www/tenant-frontends/anastasia-frontend
/var/www/tenant-frontends/metahub-frontend
...

```

Backend ise:
```

/var/www/metahub-backend

````

---

## 🧪 2. Ortam Değişkenleri (Frontend)

`.env.production.anastasia` (Next.js tenant-specific):

```env
NODE_ENV=production
TENANT_NAME=anastasia
NEXT_PUBLIC_APP_ENV=anastasia
PORT=3001
NEXT_PUBLIC_API_URL=https://api.guezelwebdesign.com
NEXT_PUBLIC_API_BASE_URL=https://api.guezelwebdesign.com
NEXT_PUBLIC_MEDIA_URL=https://api.guezelwebdesign.com
NEXT_PUBLIC_SOCKET_URL=https://api.guezelwebdesign.com
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LdvkxArAAAAAFNlFovqunFxta6Gp2yyarkdiMqY
````

---

## 🧱 3. Build İşlemi (Frontend)

```bash
cd /var/www/metahub-frontend
rm -rf .next-anastasia
TENANT_NAME=anastasia NEXT_PUBLIC_APP_ENV=anastasia yarn build
mv .next .next-anastasia
```

> Not: `.next` dizini `.next-anastasia` olarak taşınarak diğer build'lerle çakışma önlenir.

---

## 📦 4. Taşıma ve PM2 ile Çalıştırma

```bash
cp -r .next-anastasia /var/www/tenant-frontends/anastasia-frontend/.next
cp -r public node_modules package.json next.config.js /var/www/tenant-frontends/anastasia-frontend
```

### PM2 ile Çalıştırma

```bash
cd /var/www/tenant-frontends/anastasia-frontend
PORT=3001 pm2 start "yarn start" --name anastasia-prod
```

---

## 🌐 5. Backend Ortam Değişkenleri (`.env.metahub` örneği)

```env
PORT=5019
NODE_ENV=production
APP_ENV=metahub
CORS_ORIGIN=https://www.koenigsmassage.com,http://localhost:5173,http://localhost:3000,http://localhost:5017,https://api.guezelwebdesign.com
FRONTEND_URL=https://www.koenigsmassage.com
BASE_URL=https://api.guezelwebdesign.com
```

> ⚠️ `CORS_ORIGIN` içinde ilgili tenant domain mutlaka tanımlı olmalı.

---

## 🖥️ 6. PM2 Backend Süreci (`ecosystem.config.js`)

```js
module.exports = {
  apps: [
    {
      name: "metahup-anastasia",
      script: "./dist/server.js",
      env: { APP_ENV: "anastasia" }
    },
    {
      name: "metahup-metahub",
      script: "./dist/server.js",
      env: { APP_ENV: "metahub" }
    },
    ...
  ]
};
```

```bash
cd /var/www/metahub-backend
pm2 start ecosystem.config.js
pm2 save
```

---

## 🧼 7. Log Temizliği (isteğe bağlı)

```bash
rm ~/.pm2/logs/*.log
```

---

## ✅ 8. Durum Kontrolü

```bash
pm2 status
pm2 logs
```

---

## 🔁 Geliştirici Notları

* Her tenant için ayrı `.env.production.[tenant]` kullanılmalı.
* `.next-[tenant]` dizini sayesinde build çakışmaları engellenir.
* PM2 ile frontend ve backend servisleri ayrı ayrı kontrol edilir.
* Nginx yapılandırmasında port yönlendirmeleri yapılmalıdır.

---
