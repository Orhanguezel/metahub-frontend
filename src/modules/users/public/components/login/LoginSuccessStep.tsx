"use client";

import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {loginTranslations} from "@/modules/users";
import { FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

import {
  Wrapper,
  Title,
  Button,
  Message as Desc,
  UserInfo as UserMail,
} from "@/modules/users/styles/AccountStyles";
import { IconWrap, RedirectMsg } from "@/modules/users/styles/AuthStyles";

interface Props {
  onAuthSuccess?: () => void;
  autoRedirect?: boolean;
  redirectDelayMs?: number;
}

export default function LoginSuccessStep({
  onAuthSuccess,
  autoRedirect = true,
  redirectDelayMs = 2000,
}: Props) {
  const { t } = useI18nNamespace("login", loginTranslations);
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  // Role göre path belirle
  const redirectPath = useMemo(() => {
    if (user?.role === "admin" || user?.role === "superadmin") return "/admin";
    return "/account";
  }, [user?.role]);

  useEffect(() => {
    if (!autoRedirect) return;
    const timer = setTimeout(() => {
      if (onAuthSuccess) onAuthSuccess();
      else router.push(redirectPath);
    }, redirectDelayMs);
    return () => clearTimeout(timer);
  }, [autoRedirect, onAuthSuccess, redirectDelayMs, router, redirectPath]);

  const handleClick = useCallback(() => {
    if (onAuthSuccess) onAuthSuccess();
    else router.push(redirectPath);
  }, [onAuthSuccess, router, redirectPath]);

  const dashboardText =
    user?.role === "admin" || user?.role === "superadmin"
      ? t("goToAdminDashboard", "Go to Admin Dashboard")
      : t("goToAccount", "Go to My Account");

  const redirectingMsg =
    user?.role === "admin" || user?.role === "superadmin"
      ? t(
          "redirectingToDashboard",
          "Redirecting to the admin dashboard in a moment..."
        )
      : t(
          "redirectingToAccount",
          "Redirecting to your account page in a moment..."
        );

  return (
    <Wrapper style={{ maxWidth: 440, margin: "0 auto" }}>
      <IconWrap>
        <FaCheckCircle
          size={52}
          aria-label={t("loginSuccess", "Login successful!")}
        />
      </IconWrap>
      <Title>{t("loginSuccess", "Login successful!")}</Title>
      <Desc>
        {t("welcomeUser", {
          defaultValue: "Welcome, {{name}}!",
          name: user?.name || user?.email || "",
        })}
      </Desc>
      {user?.email && <UserMail>{user.email}</UserMail>}
      <Button type="button" onClick={handleClick}>
        {dashboardText}
      </Button>
      {autoRedirect && <RedirectMsg>{redirectingMsg}</RedirectMsg>}
    </Wrapper>
  );
}
