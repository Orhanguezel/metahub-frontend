// src/lib/api.ts veya src/api/api.ts

import axios from "axios";

// Universal ENV (Vite veya Next)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  console.warn(
    "⚠️ API base URL env (NEXT_PUBLIC_API_URL, VITE_API_URL, REACT_APP_API_URL) not defined!"
  );
}

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let apiKey: string | null = null;

export const setApiKey = (key: string) => {
  apiKey = key;
  if (typeof window !== "undefined") {
    console.log("✅ API key set:", key);
  }
};

API.interceptors.request.use((config) => {
  if (apiKey) {
    config.headers = config.headers || {};
    config.headers["X-API-KEY"] = apiKey;
  }
  return config;
});

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
