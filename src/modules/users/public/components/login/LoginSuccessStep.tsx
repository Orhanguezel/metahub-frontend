"use client";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { loginTranslations } from "@/modules/users";
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
  redirectDelayMs = 900,
}: Props) {
  const { t } = useI18nNamespace("login", loginTranslations);
  const router = useRouter();

  // Hem Auth hem Account slice'ı dinle!
  const user = useSelector(
    (state: RootState) => state.auth.user || state.account.profile
  );

  // Hedef path (role'a göre)
  const redirectPath = useMemo(() => {
    if (!user?.role) return "/";
    switch (user.role) {
      case "admin":
      case "superadmin":
        return "/admin";
      case "customer":
      case "user":
      case "staff":
      case "moderator":
        return "/account";
      default:
        return "/";
    }
  }, [user?.role]);

  // EN GARANTİ redirect (hem SPA, hem fallback)
  const guaranteedRedirect = useCallback(
    (path: string) => {
      try {
        router.replace(path);
        setTimeout(() => {
          if (typeof window !== "undefined" && window.location.pathname !== path) {
            window.location.replace(path);
          }
        }, 800);
      } catch {
        if (typeof window !== "undefined") window.location.replace(path);
      }
    },
    [router]
  );

  // --- State güncellendikçe yönlendirme (future-proof) ---
  useEffect(() => {
    if (!autoRedirect) return;
    if (user?.role) {
      const timer = setTimeout(() => {
        guaranteedRedirect(redirectPath);
      }, redirectDelayMs);
      return () => clearTimeout(timer);
    }
  }, [autoRedirect, user?.role, guaranteedRedirect, redirectPath, redirectDelayMs]);

  // Buton: elle yönlendirme
  const handleClick = useCallback(() => {
    if (onAuthSuccess) onAuthSuccess();
    else guaranteedRedirect(redirectPath);
  }, [onAuthSuccess, guaranteedRedirect, redirectPath]);

  // User yüklenmediyse "loading"
  if (!user) {
    return (
      <Wrapper style={{ maxWidth: 440, margin: "0 auto" }}>
        <IconWrap>
          <FaCheckCircle size={52} />
        </IconWrap>
        <Title>{t("loginSuccess", "Login successful!")}</Title>
        <Desc>{t("loadingUser", "Loading user...")}</Desc>
      </Wrapper>
    );
  }

  // Başarı ekranı
  return (
    <Wrapper style={{ maxWidth: 440, margin: "0 auto" }}>
      <IconWrap>
        <FaCheckCircle size={52} aria-label={t("loginSuccess", "Login successful!")} />
      </IconWrap>
      <Title>{t("loginSuccess", "Login successful!")}</Title>
      <Desc>
        {t("welcomeUser", {
          defaultValue: "Welcome, {{name}}!",
          name: user.name || user.email || "",
        })}
      </Desc>
      {user.email && <UserMail>{user.email}</UserMail>}
      <Button type="button" onClick={handleClick}>
        {user.role === "admin" || user.role === "superadmin"
          ? t("goToAdminDashboard", "Go to Admin Dashboard")
          : t("goToAccount", "Go to My Account")}
      </Button>
      {autoRedirect && (
        <RedirectMsg>
          {user.role === "admin" || user.role === "superadmin"
            ? t("redirectingToDashboard", "Redirecting to the admin dashboard in a moment...")
            : t("redirectingToAccount", "Redirecting to your account page in a moment...")}
        </RedirectMsg>
      )}
    </Wrapper>
  );
}
