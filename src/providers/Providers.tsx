"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import I18nProvider from "@/providers/I18nProvider";
import ThemeProviderWrapper from "@/providers/ThemeProviderWrapper";
import ReduxProvider from "@/providers/ReduxProvider";
import { fetchCurrentUser } from "@/modules/users/slice/accountSlice";
import type { AppDispatch } from "@/store";
import { setAuthUser } from "@/modules/users/slice/authSlice";
import { fetchSettings } from "@/modules/settings/slice/settingSlice";
import { usePathname } from "next/navigation";
import ToastProvider from "./ToastProvider";
import i18n from "@/i18n";
import { setApiKey } from "@/lib/api";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <InitUserLoader />
      <InitSettingsLoader />
      <InitI18nLoader />
      <I18nProvider>
        <ThemeProviderWrapper>
          <ToastProvider />
          {children}
        </ThemeProviderWrapper>
      </I18nProvider>
    </ReduxProvider>
  );
}

function InitUserLoader() {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();

  useEffect(() => {
    const excludedRoutes = [
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
    ];
    if (!excludedRoutes.some((path) => pathname.startsWith(path))) {
      dispatch(fetchCurrentUser())
        .then((res) => {
          if (res.meta.requestStatus === "fulfilled") {
            dispatch(setAuthUser(res.payload));
          } else {
            console.log(
              "Not logged in or error fetching user (expected if guest)."
            );
          }
        })
        .catch((err) => {
          console.log("Error fetching current user (ignored):", err);
        });
    }
  }, [dispatch, pathname]);

  return null;
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
/*
function InitI18nLoader() {
  useEffect(() => {
    if (!i18n.language) {
      const lang = navigator.language.split("-")[0];
      i18n.changeLanguage(lang);
    }
  }, []);
  return null;
}

*/
function InitI18nLoader() {
  useEffect(() => {
    const lang = navigator.language.split("-")[0];
    i18n.changeLanguage(lang);
  }, []);
  return null;
}
