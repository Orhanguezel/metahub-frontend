// src/lib/api.ts
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
console.log("👉 API_BASE_URL:", API_BASE_URL);

if (!API_BASE_URL) {
  console.warn("Environment variable 'NEXT_PUBLIC_API_URL' is not defined. Check your .env.local file!");
}

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 🔑 API Key'i buraya kaydediyoruz (başta null)
let apiKey: string | null = null;

// 🔐 Setter fonksiyonu: Settings üzerinden bunu çağıracağız
export const setApiKey = (key: string) => {
  apiKey = key;
  console.log("✅ API key set edildi:", key);
};

// 🛡️ Tüm isteklerde otomatik header'a ekleme
API.interceptors.request.use((config) => {
  if (apiKey) {
    config.headers["X-API-KEY"] = apiKey;
  }
  return config;
});

// 🔄 Global response interceptor (senin mevcut yapın aynı kaldı)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      console.warn("🚪 Unauthorized request – not authorized (silent).");
    }

    return Promise.reject(error);
  }
);

export default API;

