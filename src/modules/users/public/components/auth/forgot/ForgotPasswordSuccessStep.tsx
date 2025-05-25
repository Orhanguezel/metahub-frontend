"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  onAuthSuccess?: () => void;
}

export default function ForgotPasswordSuccessStep({ onAuthSuccess }: Props) {
  const { t } = useTranslation("forgotPassword");

  useEffect(() => {
    if (onAuthSuccess) {
      // Örneğin 2 saniye sonra bir sonraki adıma git
      const timeout = setTimeout(() => onAuthSuccess(), 2000);
      return () => clearTimeout(timeout);
    }
  }, [onAuthSuccess]);

  return (
    <div style={{
      textAlign: "center",
      padding: "2rem",
      fontSize: "1.1rem",
      color: "var(--color-success, green)"
    }}>
      {t("success", "Şifre sıfırlama bağlantısı e-postanıza gönderildi. Lütfen gelen kutunuzu kontrol edin.")}
    </div>
  );
}
