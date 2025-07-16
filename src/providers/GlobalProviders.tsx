"use client";

import React, { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import ReduxProvider from "@/providers/ReduxProvider";
import TenantProvider from "@/providers/TenantProvider";
import I18nProvider from "@/providers/I18nProvider";
import ThemeProviderWrapper from "@/providers/ThemeProviderWrapper";
import ToastProvider from "@/providers/ToastProvider"; // Sadece render amaçlı
import GlobalStyle from "@/styles/GlobalStyle";
import i18n from "@/i18n";
import InitUserLoader from "@/providers/InitUserLoader";
import { Loading, ErrorMessage } from "@/shared";

export default function GlobalProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReduxProvider>
      <TenantProvider>
        <PostTenantProviders>{children}</PostTenantProviders>
      </TenantProvider>
    </ReduxProvider>
  );
}

function PostTenantProviders({ children }: { children: React.ReactNode }) {
  const { loading, error } = useAppSelector((state) => state.account);

  return (
    <>
      <InitI18n />
      <ThemeProviderWrapper>
        <InitUserLoader />
        <I18nProvider>
          {/* İçerik provider'ları buraya */}
          <GlobalStyle />
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : (
            children
          )}
        </I18nProvider>
        {/* ToastProvider sadece dışta bağımsız olarak çağrılır */}
        <ToastProvider />
      </ThemeProviderWrapper>
    </>
  );
}

function InitI18n() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const lang = navigator.language.split("-")[0];
      i18n.changeLanguage(lang);
    }
  }, []);
  return null;
}
