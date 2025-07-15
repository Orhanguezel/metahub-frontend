"use client";
import React, { useEffect } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {resetTranslations} from "@/modules/users";

export default function ResetPasswordSuccessStep({
  onAuthSuccess,
}: {
  onAuthSuccess?: () => void;
}) {
  const { t } = useI18nNamespace("resetPassword", resetTranslations);

  useEffect(() => {
    if (onAuthSuccess) {
      setTimeout(() => onAuthSuccess(), 2000);
    }
  }, [onAuthSuccess]);
  return <div>{t("success")}</div>;
}
