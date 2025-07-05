"use client";

import React, { useEffect } from "react";
import ReduxProvider from "@/providers/ReduxProvider";
import I18nProvider from "@/providers/I18nProvider";
import ThemeProviderWrapper from "@/providers/ThemeProviderWrapper";
import ToastProvider from "@/providers/ToastProvider";
import GlobalStyle from "@/styles/GlobalStyle";
import { useLayoutInit } from "@/hooks/useLayoutInit";
import i18n from "@/i18n";
import InitUserLoader from "@/providers/InitUserLoader";

export default function GlobalProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReduxProvider>
      <PostReduxProviders>{children}</PostReduxProviders>
    </ReduxProvider>
  );
}

function PostReduxProviders({ children }: { children: React.ReactNode }) {
  // Burası her sayfa için merkezi INIT (tek store olduğu için admin ayrımı gerekmez)
  useLayoutInit(); // Sadece bu şekilde bırakabilirsin, opsiyonları gerekirse ekle

  return (
    <>
      <InitI18n />
      <InitUserLoader />
      <I18nProvider>
        <ThemeProviderWrapper>
          <ToastProvider />
          <GlobalStyle />
          {children}
        </ThemeProviderWrapper>
      </I18nProvider>
    </>
  );
}

function InitI18n() {
  useEffect(() => {
    const lang = typeof window !== "undefined"
      ? navigator.language.split("-")[0]
      : "en";
    i18n.changeLanguage(lang);
  }, []);
  return null;
}
