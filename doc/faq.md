
## 📚 FAQ Modülü – Frontend Dökümantasyonu

Bu modül, kullanıcıların **sıkça sorulan soruları** (SSS) görüntüleyebileceği, yönetici panelinde ise çok dilli şekilde oluşturulabileceği, düzenlenebileceği ve silebileceği bir yapıdır.

---

### 🧱 Yapı & Dosya Hiyerarşisi

```
src/
├── components/
│   ├── admin/faq/
│   │   ├── FAQList.tsx              # Admin tarafı listeleme ve silme
│   │   ├── FAQMultiForm.tsx         # Üç dilde SSS ekleme formu
│   ├── visitor/faq/
│   │   ├── FAQListSection.tsx       # Ziyaretçi tarafı SSS listeleme
│   │   ├── FAQAskSection.tsx        # Yapay zeka destekli soru sorma alanı
├── store/faqSlice.ts                # Redux Toolkit slice dosyası
```

---

### 🛠 Redux Yapılandırması (`faqSlice.ts`)

#### Async Thunks
- `fetchFAQs(language)`: Dil filtresine göre SSS'leri çeker.
- `createFAQ({ question, answer, language })`: Yeni SSS oluşturur.
- `deleteFAQ(id)`: SSS siler.
- `askFAQ({ question, language })`: Ollama üzerinden yapay zeka cevabı alır.

#### State
```ts
interface FAQState {
  faqs: FAQ[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  answer: string | null;
}
```

---

### 👨‍💼 Admin Panel Özellikleri

#### ✅ Çok Dilli SSS Ekleme
- `FAQMultiForm.tsx` ile `en`, `tr`, `de` dillerinde aynı sorunun karşılıkları tek seferde girilir.
- Her dil için input kartı görünür.
- Tüm diller doldurulmadıkça “Oluştur” butonu aktif olmaz.
- Başarılı eklemede tüm alanlar temizlenir.

#### 📋 SSS Listeleme ve Silme
- `FAQList.tsx` içerisinde dil filtresi (dropdown select) ile gösterim yapılır.
- Her satırda silme ve (ileride) düzenleme butonu vardır.

---

### 👥 Kullanıcı Paneli Özellikleri

#### 📌 Listeleme
- `FAQListSection.tsx` bileşeniyle veritabanındaki aktif sorular listelenir.
- Dil filtresi otomatik `i18next` üzerinden alınır.

#### 🧠 Yapay Zeka Destekli Soru Sorma
- `FAQAskSection.tsx` bileşeni ile kullanıcı serbest metinle soru sorar.
- Sistem Pinecone üzerinden semantik arama yapar, Ollama ile yanıt üretir.
- Dil seçimi yapılabilir (TR / EN / DE).
- Kullanıcıya sade bir cevap sunulur.

---

### 🌍 Dil Desteği

- Tüm UI öğeleri `i18next` üzerinden çeviri dosyalarıyla yönetilir:
  - `locales/admin.json` içinde:
    ```json
    "faqs": {
      "new": "Neue FAQ",
      "question": "Frage",
      "answer": "Antwort",
      "language": "Sprache",
      "askTitle": "Frage stellen",
      ...
    }
    ```

---

### 🔗 API Entegrasyonu

- `/faqs`: GET ile listeleme (lang query param ile)
- `/faqs`: POST ile ekleme
- `/faqs/:id`: DELETE ile silme
- `/faqs/ask`: POST ile AI cevabı

---

### ✅ Kullanım Notları

- `i18n.language` Redux thunk'lara otomatik geçirilebilir.
- Formlar `react-toastify` ile kullanıcıya geri bildirim verir.
- Form validasyonları sade ve UX dostudur.

---

Bu yapıyı kolayca genişletebilir, örneğin:
- ✅ SSS güncelleme
- 🔍 Arama filtresi
- 🧠 Cevapları puanlama (iyi / kötü)
- 📊 Admin dashboard'da “en çok sorulanlar” gibi özellikler ekleyebilirsin.
