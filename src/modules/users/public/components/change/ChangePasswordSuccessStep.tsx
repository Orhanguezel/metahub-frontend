// modules/users/ChangePasswordSuccessStep.tsx
"use client";
import { useEffect } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {changeTranslations} from "@/modules/users";

export default function ChangePasswordSuccessStep({
  onAuthSuccess,
}: {
  onAuthSuccess?: () => void;
}) {
   const { t } = useI18nNamespace("changePassword", changeTranslations);

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
      {t("success")}
    </div>
  );
}
