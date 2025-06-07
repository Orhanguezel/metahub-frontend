"use client";

import { useTranslation } from "react-i18next";
import { FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Ortak stiller
import {
  Wrapper,
  Title,
  Button,
  Message as Desc,
} from "@/modules/users/styles/AccountStyles";
import {
  IconWrap,
  RedirectMsg,
} from "@/modules/users/styles/AuthStyles";

interface Props {
  onAuthSuccess?: () => void;
  autoRedirect?: boolean;
  redirectDelayMs?: number; // ms after which to auto-redirect
}

export default function RegisterSuccessStep({
  onAuthSuccess,
  autoRedirect = false,
  redirectDelayMs = 3000,
}: Props) {
  const { t } = useTranslation("register");
  const router = useRouter();

  useEffect(() => {
    if (autoRedirect) {
      const timer = setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess();
        else router.push("/login");
      }, redirectDelayMs);
      return () => clearTimeout(timer);
    }
  }, [autoRedirect, onAuthSuccess, redirectDelayMs, router]);

  const handleClick = () => {
    if (onAuthSuccess) onAuthSuccess();
    else router.push("/login");
  };

  return (
    <Wrapper>
      <IconWrap>
        <span aria-hidden="true">
          <FaCheckCircle size={52} />
        </span>
      </IconWrap>
      <Title>{t("successTitle", "Registration Complete!")}</Title>
      <Desc>
        {t(
          "successDesc",
          "Your account has been created and verified. You can now log in."
        )}
      </Desc>
      <Button type="button" onClick={handleClick}>
        {t("goToLogin", "Go to Login")}
      </Button>
      {autoRedirect && (
        <RedirectMsg>
          {t(
            "redirectingToLogin",
            "Redirecting you to the login page shortly..."
          )}
        </RedirectMsg>
      )}
    </Wrapper>
  );
}
