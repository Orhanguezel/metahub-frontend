

```md
# 🚀 MetaHub Multi-Tenant Frontend + Backend Prod Kurulum Rehberi (Anastasia Örneği)


### ✅ 1. **Build (Yerel veya CI/CD)**

Ana klasörde:

```bash
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=anastasia
bun run build
```

Eğer `bun` yoksa:

```bash
npm run build
```

> Bu işlem `.next/standalone`, `.next/static`, `public/`, `package.json`, `server.js` dosyalarını üretir.

---

### ✅ 2. **Hedef klasörleri oluştur**

Canlı sunucuda, kopyalama öncesi hedef klasörleri oluştur:

```bash
mkdir -p /var/www/tenant-frontends/anastasia-frontend/.next/standalone
mkdir -p /var/www/tenant-frontends/anastasia-frontend/.next/static
```

> Bu adım olmazsa `cp` bazı dosyaları taşıyamaz ve sessizce atlayabilir. Sorun burada çıkıyordu.

---

### ✅ 3. **Dosyaları Kopyala**

Build edilen dosyaları kopyala:

```bash
# Statik dosyalar
cp -r /var/www/metahub-frontend/public \
      /var/www/metahub-frontend/package.json \
      /var/www/metahub-frontend/server.js \
      /var/www/metahub-frontend/.next/BUILD_ID \
      /var/www/metahub-frontend/.next/static \
      /var/www/metahub-frontend/.next/standalone \
      /var/www/tenant-frontends/anastasia-frontend/.next/
```

> Eğer `.next/standalone` klasörü eksikse yukarıdaki `mkdir -p` komutları ile oluşturulmalıydı zaten.

---

### ✅ 4. **Node modüllerini kur (yalnızca production)**

```bash
cd /var/www/tenant-frontends/anastasia-frontend
npm install --omit=dev
```

---

### ✅ 5. **PM2 ile başlat**

```bash
pm2 start server.js --name anastasia-frontend
```

> Daha önce varsa:

```bash
pm2 restart anastasia-frontend
```

---