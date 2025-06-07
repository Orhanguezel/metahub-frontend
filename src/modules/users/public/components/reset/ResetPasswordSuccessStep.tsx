"use client";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function ResetPasswordSuccessStep({
  onAuthSuccess,
}: {
  onAuthSuccess?: () => void;
}) {
  const { t } = useTranslation("resetPassword");

  useEffect(() => {
    if (onAuthSuccess) {
      setTimeout(() => onAuthSuccess(), 2000);
    }
  }, [onAuthSuccess]);
  return <div>{t("success")}</div>;
}
