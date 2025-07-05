// src/lib/apiCall.ts
import API from "./api";

// Dinamik dil seçici
const getLang = (): string => {
  if (typeof window === "undefined") return "de";
  return (
    localStorage.getItem("lang") ||
    (window.navigator.language && window.navigator.language.split("-")[0]) ||
    "de"
  );
};

const isDev = process.env.NODE_ENV === "development";

// **Universal API Call**
const apiCall = async (
  method: "get" | "post" | "put" | "delete" | "patch",
  url: string,
  data: any = null,
  rejectWithValue?: (error: any) => any,
  config: any = {}
): Promise<any> => {
  try {
    if (isDev) {
      console.log(`📡 [API] ${method.toUpperCase()} → ${url}`);
      if (data) console.log("📤 Payload:", data);
    }

    // TENANT OVERRIDE: Vite ile aynı şekilde, localStorage'dan tenant yakala
    let tenantOverride: string | null = null;
    if (typeof window !== "undefined") {
      tenantOverride = localStorage.getItem("selectedTenantOverride");
    }

    // FormData kontrolü
    const isFormData =
      typeof FormData !== "undefined" && data instanceof FormData;

    const finalConfig = {
      ...config,
      withCredentials: true,
      headers: {
        ...(config?.headers || {}),
        ...(typeof tenantOverride === "string" && tenantOverride
          ? { "x-tenant": tenantOverride }
          : {}),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        "Accept-Language": getLang(),
      },
    };

    const response =
      method === "get"
        ? await API.get(url, { ...finalConfig, params: data })
        : await (API as any)[method](url, data, finalConfig);

    if (isDev) {
      console.log(`✅ [API] ${method.toUpperCase()} ${url}`, response.data);
    }

    return response.data;
  } catch (error: any) {
    const status = error?.response?.status || "Unknown";
    const errorData = error?.response?.data ?? {};
    const message =
      errorData?.message ||
      (errorData?.errors &&
        errorData.errors[Object.keys(errorData.errors)[0]]?.message) ||
      error?.message ||
      "Etwas ist schiefgelaufen!";

    if (status === 401 && url === "/account/me") {
      if (isDev) {
        console.warn("🔐 [account/me] için 401 — kullanıcı login değil.");
      }
      return null;
    }

    // Hata logu ve reject
    if (error?.response) {
      const res = error.response;
      const logObj = {
        url: res?.config?.url || url || "Unbekannte URL",
        status: res?.status ?? "-",
        data: res?.data ?? "-",
        method:
          (res?.config?.method &&
            res.config.method.toUpperCase &&
            res.config.method.toUpperCase()) ||
          (method && method.toUpperCase && method.toUpperCase()) ||
          "-",
      };
      const isEmptyObj = Object.values(logObj).every(
        (v) => v === "-" || v === "" || v == null
      );
      if (!isEmptyObj) {
        console.error("❌ API Fehler / Error Details:", logObj);
      } else {
        console.error("❌ API Fehler / Error: Empty or invalid error object.");
      }
    } else {
      console.error("❌ API Network/Error:", {
        url,
        message: error?.message || message,
        error,
      });
    }
    if (rejectWithValue) {
      return rejectWithValue({ status, message, data: errorData });
    }
    throw error;
  }
};

export default apiCall;
