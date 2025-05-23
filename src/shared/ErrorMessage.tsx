// ErrorMessage.tsx
"use client";
import { useTranslation } from "react-i18next";

interface ErrorMessageProps {
  message?: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  const { t } = useTranslation("adminSettings");
  return (
    <div style={{ color: "red", textAlign: "center", margin: "2rem 0" }}>
      {message || t("error", "Bir hata oluştu.")}
    </div>
  );
}
