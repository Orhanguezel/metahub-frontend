
---

# 🚀 Production Ortamında Tenant Frontend Projesini PM2 ile Çalıştırmak

> 🎯 Örnek: `anastasia` tenant frontend
> 🌍 Domain: `https://anastasia.guezelwebdesign.com` (varsayılan)

---

## ✅ 1. Gerekli Dosyaları ve Ayarları Kontrol Et

### ✅ `.env.anastasia` içeriği:

```env
NODE_ENV=production
TENANT_NAME=anastasia
NEXT_PUBLIC_APP_ENV=anastasia

NEXT_PUBLIC_API_URL=https://api.guezelwebdesign.com
NEXT_PUBLIC_API_BASE_URL=https://api.guezelwebdesign.com
NEXT_PUBLIC_MEDIA_URL=https://api.guezelwebdesign.com
NEXT_PUBLIC_SOCKET_URL=https://api.guezelwebdesign.com

NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LdvkxArAAAAAFNlFovqunFxta6Gp2yyarkdiMqY
METAHUB_API_KEY=your_api_key_here
```

---

## 🧱 2. PM2 `ecosystem.config.js` Yapısını Hazırla

Proje kökünde `ecosystem.config.js` şu tenant'ı içermeli:

```js
module.exports = {
  apps: [
    {
      name: "anastasia-prod",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        TENANT_NAME: "anastasia",
        NEXT_PUBLIC_APP_ENV: "anastasia",
        NEXT_PUBLIC_API_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_API_BASE_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_MEDIA_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_SOCKET_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_RECAPTCHA_SITE_KEY: "6LdvkxArAAAAAFNlFovqunFxta6Gp2yyarkdiMqY",
        METAHUB_API_KEY: "your_api_key_here",
        COOKIE_DOMAIN: "guezelwebdesign.com"
      }
    }
  ]
};
```

---

## 🏗️ 3. Uygulamanın Build Edilmesi

Sunucuda proje dizininde şu komutları sırayla çalıştır:

```bash
# 1. .next klasörünü temizle
rm -rf .next

# 2. Üretim derlemesi (Next.js build)
bun run build
# veya
yarn build
# veya
npm run build
```

---

## 📦 4. PM2 ile Başlatma

```bash
pm2 start ecosystem.config.js --only anastasia-prod
```

✅ Alternatif:

```bash
pm2 restart ecosystem.config.js --only anastasia-prod
```

---

## 🌐 5. Nginx Reverse Proxy (Opsiyonel)

Eğer port yönlendirmesi gerekiyorsa:

```
https://anastasia.guezelwebdesign.com → http://localhost:3001
```

Örnek Nginx config:

```nginx
server {
  listen 80;
  server_name anastasia.guezelwebdesign.com;

  location / {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_cache_bypass $http_upgrade;
  }
}
```

---

## 📋 6. Durum Kontrolü

```bash
pm2 list
pm2 logs anastasia-prod
```

---

## 📁 Özet Akış

| Adım                  | Açıklama                      |
| --------------------- | ----------------------------- |
| `.env.anastasia`      | Gerekli env ayarlarını içerir |
| `ecosystem.config.js` | PM2 için yapılandırma içerir  |
| `bun run build`       | Uygulama derlenir             |
| `pm2 start ...`       | PM2 ile servis başlatılır     |
| `Nginx`               | Domain yönlendirmesi yapılır  |

---

İstersen bu yapıyı `.md` dokümanı olarak hazır hale getirebilirim (`docs/tenant-prod-anastasia.md` gibi).
Devam etmek ister misin? Diğer tenant’lar için `pm2` script otomasyonu da yapılabilir.


Anladım. Artık tüm tenant frontend projeleri **standart bir dizin yapısı** altında çalışıyor:

```
/var/www/tenant-frontends/[TENANT]-frontend
```

Ve her birinde:

* `.next` klasörü içinde standalone build,
* `server.js` ile çalıştırma yapılacak.

---

## ✅ GÜNCELLENMİŞ `ecosystem.config.js` (yalnızca `metahub` ve `anastasia` için)

```js
module.exports = {
  apps: [
    // ✅ METAHUB - PRODUCTION
    {
      name: "metahub-prod",
      script: ".next/standalone/server.js",
      cwd: "/var/www/tenant-frontends/metahub-frontend",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        TENANT_NAME: "metahub",
        NEXT_PUBLIC_APP_ENV: "metahub",
        NEXT_PUBLIC_API_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_API_BASE_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_MEDIA_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_SOCKET_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_RECAPTCHA_SITE_KEY: "6LdvkxArAAAAAFNlFovqunFxta6Gp2yyarkdiMqY",
        METAHUB_API_KEY: "your_api_key_here",
        COOKIE_DOMAIN: "guezelwebdesign.com"
      }
    },

    // ✅ ANASTASIA - PRODUCTION
    {
      name: "anastasia-prod",
      script: ".next/standalone/server.js",
      cwd: "/var/www/tenant-frontends/anastasia-frontend",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        TENANT_NAME: "anastasia",
        NEXT_PUBLIC_APP_ENV: "anastasia",
        NEXT_PUBLIC_API_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_API_BASE_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_MEDIA_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_SOCKET_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_RECAPTCHA_SITE_KEY: "6LdvkxArAAAAAFNlFovqunFxta6Gp2yyarkdiMqY",
        METAHUB_API_KEY: "your_api_key_here",
        COOKIE_DOMAIN: "koenigsmassage.com"
      }
    }
  ]
};
```

---

## 🔁 Build + Deploy Aşamaları (Metahub ve Anastasia için)

### 1. `.env.metahub` veya `.env.anastasia` dosyasını yükle

```bash
cp .env.metahub .env.local
# veya
cp .env.anastasia .env.local
```

### 2. Build al

```bash
TENANT_NAME=metahub NEXT_PUBLIC_APP_ENV=metahub bun run build
# veya
TENANT_NAME=anastasia NEXT_PUBLIC_APP_ENV=anastasia bun run build
```

### 3. Kopyala

```bash
# Örn: metahub için
rm -rf /var/www/tenant-frontends/metahub-frontend/.next
cp -r .next /var/www/tenant-frontends/metahub-frontend
```

### 4. Başlat

```bash
pm2 start ecosystem.config.js --only metahub-prod
# veya
pm2 start ecosystem.config.js --only anastasia-prod
```

---

Hazırsan ileride `ensotek`, `guezelwebdesign`, `radanor`, `pastoraltmgdk` vb. tenantlar için de tek tek bu yapıyı yayabiliriz.

İstersem sana `ecosystem.config.js` dosyasını tüm tenantlar için tam şablon halinde de hazırlayabilirim. Devam edelim mi?
