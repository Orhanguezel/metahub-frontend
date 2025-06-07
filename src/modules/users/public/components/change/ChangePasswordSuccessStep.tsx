// modules/users/ChangePasswordSuccessStep.tsx
"use client";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function ChangePasswordSuccessStep({
  onAuthSuccess,
}: {
  onAuthSuccess?: () => void;
}) {
  const { t } = useTranslation("changePassword");

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
