// src/lib/api.ts
import axios from "axios";

const isDev = process.env.NODE_ENV === "development";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error("❌ Environment variable 'NEXT_PUBLIC_API_URL' is missing! Please check your .env.local or deployment config.");
}

if (isDev) {
  console.log("👉 API_BASE_URL:", API_BASE_URL);
}

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 🔑 API Key global değişken
let apiKey: string | null = null;

// API Key ayarlayıcı
export const setApiKey = (key: string) => {
  apiKey = key;
  if (isDev) {
    console.log("✅ API key set edildi:", key);
  }
};

// Interceptor: Header’a X-API-KEY ekle
API.interceptors.request.use((config) => {
  if (apiKey) {
    config.headers["X-API-KEY"] = apiKey;
  }
  return config;
});

// Global response error logger
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (isDev && (status === 401 || status === 403)) {
      console.warn("🚪 Unauthorized request – not authorized (silent).");
    }
    if (isDev) {
      console.error("❌ API request error:", error);
    }
    return Promise.reject(error);
  }
);

export default API;
