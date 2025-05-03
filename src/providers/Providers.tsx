// Providers.tsx
"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import I18nProvider from "@/providers//I18nProvider";
import ThemeProviderWrapper from "@/providers/ThemeProviderWrapper";
import ReduxProvider from "@/providers/ReduxProvider";
import Navbar from "@/components/navbar/Navbar";
import FooterSection from "@/components/footer/FooterSection";
import { fetchCurrentUser } from "@/store/user/accountSlice";
import type { AppDispatch } from "@/store";
import { setAuthUser } from "@/store/user/authSlice";
import { usePathname } from "next/navigation";
import ToastProvider from "./ToastProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <InitUserLoader />
      <ThemeProviderWrapper>
        <I18nProvider>
          <ToastProvider />
          <Navbar />
          {children}
          <FooterSection />
        </I18nProvider>
      </ThemeProviderWrapper>
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
      dispatch(fetchCurrentUser()).then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          dispatch(setAuthUser(res.payload));
        }
      });
    }
  }, [dispatch, pathname]);

  return null;
}
