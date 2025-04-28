"use client";
import { useTranslation } from "react-i18next";

export default function ErrorMessage() {
  const { t } = useTranslation("admin-settings");
  return <div>{t("error", "Bir hata oluştu.")}</div>;
}
