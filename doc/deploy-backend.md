Elbette, işte **MetaHub Backend Production Ortamında PM2 ile Build ve Restart Süreci**. Bu dokümantasyonu `docs/deploy-backend.md` gibi bir yere kaydedebilirsin.

---

# 📦 MetaHub Backend – Production PM2 Süreci

Bu doküman, **MetaHub backend** projesinin production ortamında build edilip PM2 ile çalıştırılmasını adım adım açıklar.

---

## ⚙️ 1. Build İşlemi

```bash
bun run build
```

> `dist/` klasörünü üretir. İçinde `server.js` olmalıdır.

Alternatif olarak npm ile:

```bash
npm run build
```

---

## 🧠 2. PM2 `ecosystem.config.js` Yapısı

> Ana dizinde (`/var/www/metahub-backend/`) bu dosya olmalı:

```js
module.exports = {
  apps: [
    {
      name: "metahup-metahub",
      script: "./dist/server.js",
      env: {
        APP_ENV: "metahub",
      },
    },
    {
      name: "metahup-anastasia",
      script: "./dist/server.js",
      env: {
        APP_ENV: "anastasia",
      },
    },
    {
      name: "metahup-ensotek",
      script: "./dist/server.js",
      env: {
        APP_ENV: "ensotek",
      },
    },
    {
      name: "metahup-radanor",
      script: "./dist/server.js",
      env: {
        APP_ENV: "radanor",
      },
    },
  ],
};
```

---

## 🚀 3. Uygulamaları Yeniden Başlat

```bash
pm2 restart ecosystem.config.js
```

> Tüm projeleri `.env.[APP_ENV]` dosyasına göre başlatır.

Alternatif olarak sadece tek bir servisi yeniden başlatmak için:

```bash
pm2 restart metahup-metahub
```

---

## 💾 4. PM2 Durumu Kaydet

Sunucu yeniden başlatıldığında otomatik olarak devreye alabilmek için:

```bash
pm2 save
```

---

## 🔍 5. Durumu Kontrol Et

```bash
pm2 list
```

Beklenen çıktı:

```
│ name              │ status │ cpu │ mem   │
│ metahup-metahub   │ online │ 0%  │ 152mb │
│ metahup-anastasia │ online │ 0%  │ 140mb │
│ metahup-ensotek   │ online │ 0%  │ 141mb │
│ metahup-radanor   │ online │ 0%  │ 143mb │
```

---

## 🧼 6. Sorun Giderme (Gerekirse)

* Logları incelemek için:

```bash
pm2 logs
```

* Belirli bir servisin logları:

```bash
pm2 logs metahup-metahub
```

---

## 🔁 7. PM2'yi Otomatik Başlat (Opsiyonel)

> Sistemi yeniden başlattığında PM2 uygulamalarını otomatik başlatmak için:

```bash
pm2 startup
# Çıkan komutu çalıştır
pm2 save
```

---

## 🧩 Notlar

* `.env.metahub`, `.env.anastasia` gibi ortam dosyaları `APP_ENV`'e göre yüklenmelidir.
* `server.js` dosyası `dist/` altında olmalıdır. Giriş noktası orasıdır.

---
