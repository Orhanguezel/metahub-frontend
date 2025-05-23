"use client";
import { useTranslation } from "react-i18next";

export default function Loading() {
  const { t } = useTranslation("adminSettings");
  return <div>{t("loading", "Yükleniyor...")}</div>;
}
