Teşekkürler düzeltme için Orhan. Şimdi senin senaryona tam uygun olarak, **sadece frontend’i yerelde** çalıştırdığın ve **uzak sunucudaki backend’e bağlandığın** ortamı adım adım, doğru şekilde özetliyorum:

---

# 🧪 Yerel Geliştirme Ortamında Tenant Projesi Çalıştırma (Frontend)

> Amaç: Sadece **frontend’i** `bun run dev` ile çalıştırmak ve **uzak sunucu (production backend)** ile entegrasyonu test etmek
> Ortam: `anastasia`
> Backend: `https://api.guezelwebdesign.com`

---

## ✅ 1. `.env.anastasia` Dosyasını Hazırla

Proje kök dizininde şu içeriğe sahip bir `.env.anastasia` dosyası bulundur:

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

## 🚀 2. `.env.local` Dosyasını Oluştur

Terminalden çalıştır:

```bash
cp .env.anastasia .env.local
```

> Next.js çalışma zamanı yalnızca `.env.local` dosyasını otomatik okur. Bu nedenle `.env.anastasia` dosyasını `.env.local` olarak kopyalamalısın.

---

## 🧑‍💻 3. Frontend’i Başlat

```bash
bun run dev
```

> Eğer `bun` yüklü değilse alternatif:

```bash
npm run dev
# veya
yarn dev
```

---

## 🌐 4. Tarayıcıda Aç

Frontend artık şu adreste çalışıyor olacak:

```
http://localhost:3000
```

Tüm API istekleri doğrudan şu adrese yönlenir:

```
https://api.guezelwebdesign.com
```

---

## 🧾 Özet Akış

| Adım                           | Açıklama                                         |
| ------------------------------ | ------------------------------------------------ |
| `.env.anastasia`               | Uzak prod backend ile bağlantı ayarlarını içerir |
| `cp .env.anastasia .env.local` | Next.js’in okuması için env dosyası hazırlanır   |
| `bun run dev`                  | Frontend başlatılır                              |
| `http://localhost:3000`        | Frontend arayüzüne erişim yapılır                |

---

## ❗ Notlar

* Yerel makinede **PM2 gerekmez**. Bu sadece prod ortam için geçerlidir.
* `.env.local` içinde kullanılan tüm `NEXT_PUBLIC_` değişkenleri frontend'e açık aktarılır.
* Backend’e bağlanmak için `withCredentials: true` doğru yapılandırılmış olmalıdır (senin projen bu kısmı zaten tamamlıyor).
* `NODE_ENV=production` olsa bile `bun run dev` geliştirici sunucusudur, SSR çalışır.

---

İstersen bu dokümanı `docs/dev-anastasia-local.md` gibi kalıcı bir yere ekleyebilirim. Başka tenantlar için de otomatik betik istersen (`cp .env.XXX .env.local` yapan), onu da yazabilirim. Devam edelim mi?
