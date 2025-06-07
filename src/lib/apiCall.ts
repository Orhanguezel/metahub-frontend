
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
 
     const finalConfig = {
       ...config,
       withCredentials: true,
       headers: {
         ...(config?.headers || {}),
         ...(isFormData ? {} : { "Content-Type": "application/json" }),
         "Accept-Language": i18n.language || navigator.language || "de",
       },
     };
 
     const response =
       method === "get"
         ? await API.get(url, { ...finalConfig, params: data })
         : await API[method](url, data, finalConfig);
 
   if (isDev) {
     console.log(`✅ API Response [${method.toUpperCase()} ${url}]:`, response.data);
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
 
     // 🛑 Sadece /account/me için 401 olduğunda sessiz geç
     if (status === 401 && url === "/account/me") {
       if (isDev) {
         console.warn("🔐 [account/me] için 401 — kullanıcı login değil.");
       }
       return null;
     }

     if (error?.response) {
       const { status, data, config } = error.response;
       console.error("❌ API Fehler / Error Details:", {
         url: config?.url || "Unbekannte URL",
         status,
         data,
       });
     }
 
     return rejectWithValue({ status, message, data: errorData });
   }
 };
 
 export default apiCall;
