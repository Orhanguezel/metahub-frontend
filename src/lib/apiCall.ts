import API from "./api";
import { detectTenantFromHost } from "@/lib/tenant";

// Language selector
const getLang = (): string => {
  if (typeof window === "undefined") return "de";
  const storedLang = localStorage.getItem("lang");
  if (storedLang) return storedLang;
  const navLang = window.navigator.language || (window.navigator as any).userLanguage || "";
  return navLang.split("-")[0] || "de";
};

const isDev = process.env.NODE_ENV === "development";

const getTenantSlug = (): string | undefined => {
  // Her iki ortamda da tenant mantığı çalışır.
  // Dev'de env veya hostname, prod'da host header/NGINX veya window.location
  try {
    return detectTenantFromHost();
  } catch {
    return undefined;
  }
};

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

    // Tüm ortamlarda tenant slug kullanılsın (NGINX header ile taşınan tenant da buradan okunacak)
    const tenantSlug = getTenantSlug();

    // FormData kontrolü
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

    const finalConfig = {
      ...config,
      withCredentials: true,
      headers: {
        ...(config?.headers || {}),
        ...(tenantSlug ? { "x-tenant": tenantSlug } : {}),
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
      if (!isEmptyObj && isDev) {
        console.error("❌ API Fehler / Error Details:", logObj);
      } else if (isDev) {
        console.warn(
          "⚠️ API Warn: No details from API error object (muhtemelen unauthorized/public fetch)."
        );
      }
    } else if (isDev) {
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
