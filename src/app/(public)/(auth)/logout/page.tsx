"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { logoutUser, clearAuthMessages } from "@/modules/users/slice/authSlice";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {logoutTranslations} from "@/modules/users";

export default function LogoutPage() {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("logout", logoutTranslations);
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await dispatch(logoutUser()).unwrap();
        toast.success(t("success"));
      } catch (err: any) {
        toast.error(err?.message || t("error"));
      } finally {
        dispatch(clearAuthMessages());
        router.replace("/login");
      }
    };
    doLogout();
  }, [dispatch, router, t]);

  return (
    <main
      style={{
        textAlign: "center",
        padding: "4rem 2rem",
        minHeight: "40vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1>{t("loggingOut", "Logging out...")}</h1>
    </main>
  );
}

