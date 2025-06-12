// src/lib/apiCall.ts
import API from "./api";
import i18n from "@/i18n/index";

const isDev = process.env.NODE_ENV === "development";

const apiCall = async (
  method: "get" | "post" | "put" | "delete" | "patch",
  url: string,
  data: any = null,
  rejectWithValue: (error: any) => any,
  config: any = {}
) => {
  try {
    if (isDev) {
      console.log(`📡 API CALL → [${method.toUpperCase()}] ${url}`);
      if (data) console.log("📤 Request Payload:", data);
    }

    const isFormData = data instanceof FormData;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    const finalConfig = {
      ...config,
      withCredentials: true,
      headers: {
        ...(config?.headers || {}),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        "Accept-Language":
          i18n.language?.split("-")[0] ||
          navigator.language?.split("-")[0] ||
          "de",
        ...(apiKey ? { "x-api-key": apiKey } : {}),
      },
    };

    const response =
      method === "get"
        ? await API.get(url, { ...finalConfig, params: data })
        : await API[method](url, data, finalConfig);

    if (isDev) {
      console.log(
        `✅ API Response [${method.toUpperCase()} ${url}]:`,
        response.data
      );
    }

    return response.data;
  } catch (error: any) {
    const status = error?.response?.status || "Unknown";
    const errorData = error?.response?.data ?? {};
    const message =
      errorData?.message ||
      errorData?.errors?.[Object.keys(errorData.errors || {})[0]]?.message ||
      error?.message ||
      "Etwas ist schiefgelaufen!";

    // Sadece /account/me için 401 ise sessiz geç
    if (status === 401 && url === "/account/me") {
      if (isDev) {
        console.warn("🔐 [account/me] için 401 — kullanıcı login değil.");
      }
      return null;
    }

    // --- LOG DÜZENLEMESİ ---
    if (error?.response) {
      const res = error.response;
      const logObj = {
        url: res?.config?.url || url || "Unbekannte URL",
        status: res?.status ?? "-",
        data: res?.data ?? "-",
        method:
          res?.config?.method?.toUpperCase?.() ||
          method?.toUpperCase?.() ||
          "-",
      };
      // Sadece boş bir obje dönüyorsa (ör: {}), loglamayı gereksiz büyütme
      const isEmptyObj = Object.values(logObj).every(
        (v) => v === "-" || v === "" || v == null
      );
      if (!isEmptyObj) {
        console.error("❌ API Fehler / Error Details:", logObj);
      } else {
        console.error("❌ API Fehler / Error: Empty or invalid error object.");
      }
    } else {
      // response yoksa
      console.error("❌ API Network/Error:", {
        url,
        message: error?.message || message,
        error,
      });
    }
    // --- SON LOG DÜZENLEMESİ ---

    return rejectWithValue({ status, message, data: errorData });
  }
};

export default apiCall;
