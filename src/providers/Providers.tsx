"use client";

import React, { useEffect } from "react";
import I18nProvider from "@/providers/I18nProvider";
import ThemeProviderWrapper from "@/providers/ThemeProviderWrapper";
import ReduxProvider from "@/providers/ReduxProvider";
import { fetchSettings } from "@/modules/settings/slice/settingSlice";
import ToastProvider from "./ToastProvider";
import i18n from "@/i18n";
import { setApiKey } from "@/lib/api";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import GlobalStyle from "@/styles/GlobalStyle";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <InitSettingsLoader />
      <InitI18nLoader />
      <I18nProvider>
        <ThemeProviderWrapper>
          <ToastProvider />
          <GlobalStyle />
          {children}
        </ThemeProviderWrapper>
      </I18nProvider>
    </ReduxProvider>
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
        console.warn("Settings fetch error (ignored):", err);
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

