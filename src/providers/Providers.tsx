
 "use client";
 
 import React, { useEffect } from "react";
 import I18nProvider from "@/providers/I18nProvider";
 import ThemeProviderWrapper from "@/providers/ThemeProviderWrapper";
 import { Provider } from "react-redux";
 import { PersistGate } from "redux-persist/integration/react";
 import store, { persistor } from "@/store";
 import { fetchSettings } from "@/modules/settings/slice/settingSlice";
 import ToastProvider from "./ToastProvider";
 import i18n from "@/i18n";
 import { setApiKey } from "@/lib/api";
 import { useDispatch } from "react-redux";
 import type { AppDispatch } from "@/store";
 import GlobalStyle from "@/styles/GlobalStyle";
 import { Loading } from "@/shared";
 
const isDev = process.env.NODE_ENV === "development";

 
 export default function Providers({ children }: { children: React.ReactNode }) {
   return (
     <Provider store={store}>
       <PersistGate loading={<Loading />} persistor={persistor}>
         <InitSettingsLoader />
         <InitI18nLoader />
         <I18nProvider>
           <ThemeProviderWrapper>
             <ToastProvider />
             <GlobalStyle />
             {children}
           </ThemeProviderWrapper>
         </I18nProvider>
       </PersistGate>
     </Provider>
   );
 }
 
 
 
 function InitSettingsLoader() {
   const dispatch = useDispatch<AppDispatch>();
   useEffect(() => {
     dispatch(fetchSettings())
       .then((res) => {
         if (res.meta.requestStatus === "fulfilled") {
           const settings = res.payload;
           const apiKeySetting = settings.find((s: any) => s.key === "api_key");
           if (apiKeySetting?.value) {
             setApiKey(apiKeySetting.value);
           }
         }
       })
       .catch((err) => {
         if (isDev) {
           console.warn("Settings fetch error (ignored):", err);
         }
       });
   }, [dispatch]);
   return null;
 }
 
 function InitI18nLoader() {
   useEffect(() => {
     const lang = navigator.language.split("-")[0];
     i18n.changeLanguage(lang);
   }, []);
   return null;
 }
