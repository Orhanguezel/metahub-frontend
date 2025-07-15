"use client";

import React, { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import ReduxProvider from "@/providers/ReduxProvider";
import I18nProvider from "@/providers/I18nProvider";
import ThemeProviderWrapper from "@/providers/ThemeProviderWrapper";
import ToastProvider from "@/providers/ToastProvider";
import GlobalStyle from "@/styles/GlobalStyle";
import i18n from "@/i18n";
//import InitUserLoader from "@/providers/InitUserLoader";
import { Loading, ErrorMessage } from "@/shared";

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
  // Kullanıcı slice'ı ve loading durumu globalde alınır
  const { loading, error } = useAppSelector((state) => state.account);


   return (
    <>
      <InitI18n />
      <ThemeProviderWrapper>
        {/*<InitUserLoader />*/}
        <I18nProvider>
          <ToastProvider />
          <GlobalStyle />
          {loading
            ? <Loading />
            : error
            ? <ErrorMessage message={error} />
            : children}
        </I18nProvider>
      </ThemeProviderWrapper>
    </>
  );
}

function InitI18n() {
  useEffect(() => {
    const lang =
      typeof window !== "undefined"
        ? navigator.language.split("-")[0]
        : "en";
    i18n.changeLanguage(lang);
  }, []);
  return null;
}
