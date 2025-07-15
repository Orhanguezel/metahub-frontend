"use client";

import { useEffect } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {forgotTranslations} from "@/modules/users";

interface Props {
  onAuthSuccess?: () => void;
}

export default function ForgotPasswordSuccessStep({ onAuthSuccess }: Props) {
  const { t } = useI18nNamespace("forgotPassword", forgotTranslations);

  useEffect(() => {
    if (onAuthSuccess) {
      const timeout = setTimeout(() => onAuthSuccess(), 2000);
      return () => clearTimeout(timeout);
    }
  }, [onAuthSuccess]);

  return (
    <div
      style={{
        textAlign: "center",
        padding: "2rem",
        fontSize: "1.1rem",
        color: "var(--color-success, green)",
      }}
    >
      {t(
        "success",
      )}
    </div>
  );
}
