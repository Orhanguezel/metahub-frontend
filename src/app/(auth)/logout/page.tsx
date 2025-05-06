"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { logoutUser, clearAuthMessages } from "@/store/user/authSlice";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function LogoutPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("logout");
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
        router.push("/login"); 
      }
    };

    doLogout();
  }, [dispatch, router]);

  return (
    <main style={{ textAlign: "center", padding: "4rem 2rem" }}>
      <h1>{t("loggingOut")}</h1>
    </main>
  );
}
