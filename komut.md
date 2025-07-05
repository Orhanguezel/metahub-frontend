 

cp .env.anastasia .env.production
bun run dev


gelistirme ortami: 
cp .env.anastasia .env.local
bun run dev


cp .env.metahub .env.local
bun run dev



export NODE_ENV=production
export TENANT_NAME=anastasia
export NEXT_PUBLIC_APP_ENV=anastasia
export PORT=3001
...
bun run build


bun install
export TENANT_NAME=anastasia
export NODE_ENV=production
bun run build




### ✅ 1. Tüm klasörü temizle:

```bash
rm -rf /var/www/tenant-frontends/anastasia-frontend
```

---

### ✅ 2. Sıfırdan ve hatasız kurulum (elle veya script değil, direkt komutlarla):

```bash
# 1️⃣ Kaynak ve hedef tanımı
SOURCE_DIR="/var/www/metahub-frontend"
TARGET_DIR="/var/www/tenant-frontends/anastasia-frontend"

# 2️⃣ Temiz kurulum için hedef klasörü oluştur
mkdir -p "$TARGET_DIR/.next/standalone"
mkdir -p "$TARGET_DIR/.next/static"

# 3️⃣ Gerekli dosyaları kopyala
cp -r "$SOURCE_DIR/.next/standalone/"* "$TARGET_DIR/.next/standalone/"
cp -r "$SOURCE_DIR/.next/static" "$TARGET_DIR/.next/"
cp "$SOURCE_DIR/.next/BUILD_ID" "$TARGET_DIR/.next/"

cp -r "$SOURCE_DIR/public" "$TARGET_DIR/"
cp "$SOURCE_DIR/package.json" "$TARGET_DIR/"
cp "$SOURCE_DIR/next.config.js" "$TARGET_DIR/"
cp "$SOURCE_DIR/ecosystem.config.js" "$TARGET_DIR/"
cp "$SOURCE_DIR/server.js" "$TARGET_DIR/"
cp "$SOURCE_DIR/.env.anastasia" "$TARGET_DIR/.env"
```

---

### ✅ 3. Üretim bağımlılıklarını yükle:

```bash
cd "$TARGET_DIR"
bun install --production
```

---

### ✅ 4. PM2 ile başlat:

```bash
pm2 flush
pm2 delete anastasia-prod
pm2 start ecosystem.config.js --only anastasia-prod
pm2 save
pm2 logs anastasia-prod

```

---

Artık logs ile kontrol edebilirsin:

```bash
pm2 logs anastasia-prod
```

nginx -t
systemctl reload nginx


---

### ℹ️ Not:

* `standalone` → `server.js`, `package.json`, `node_modules` içermeli
* `.next/BUILD_ID` → olmadan çalışmaz
* `.env` → doğru adla (`.env`) ve içerikle taşınmalı
* `PORT` değişkeni `.env` veya `ecosystem.config.js` içinde set edilmiş olmalı

---

İstersen bu adımları tek satırlık bir NAT için sadeleştirilmiş versiyon da hazırlayabilirim. Ama bu defa önce **manuel işlem başarılı oldu**, buradan gidelim.
