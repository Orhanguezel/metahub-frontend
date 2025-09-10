"use client";

import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { loginTranslations } from "@/modules/users";
import { FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
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

type RoleLike = string | undefined;
const ADMIN_ROLES = ["admin", "superadmin", "administrator", "owner", "manager"];
const toRole = (r: RoleLike) => (r || "").toString().trim().toLowerCase();
const isAdmin = (role?: RoleLike, roles?: string[]) =>
  ADMIN_ROLES.includes(toRole(role)) ||
  (Array.isArray(roles) && roles.map(toRole).some((x) => ADMIN_ROLES.includes(x)));

const pickUserFromStore = (s: RootState): any =>
  // auth.user öncelik + account.profile / account.user fallback
  (s as any)?.auth?.user ||
  (s as any)?.account?.profile ||
  (s as any)?.account?.user ||
  null;

export default function LoginSuccessStep({
  onAuthSuccess,
  autoRedirect = true,
  redirectDelayMs = 900,
}: Props) {
  const { t } = useI18nNamespace("login", loginTranslations);
  const router = useRouter();

  // Sadece store’u dinle (provider zaten fetch ediyor)
  const user: any = useSelector(pickUserFromStore);

  // Hedef path — role yoksa güvenli varsayılan: /account
  const redirectPath = useMemo(() => {
    const role = user?.role ?? user?.user?.role;
    const roles = user?.roles ?? user?.user?.roles;
    return isAdmin(role, roles) ? "/admin" : "/account";
  }, [user]);

  // EN GARANTİ yönlendirme (push → replace → hard navigation)
  const guaranteedRedirect = useCallback(
    (path: string) => {
      try {
        const before = typeof window !== "undefined" ? window.location.pathname : "";
        router.push(path);
        setTimeout(() => {
          if (typeof window !== "undefined" && window.location.pathname === before) {
            router.replace(path);
          }
        }, 120);
        setTimeout(() => {
          if (typeof window !== "undefined" && window.location.pathname !== path) {
            window.location.assign(path);
          }
        }, 700);
      } catch {
        if (typeof window !== "undefined") window.location.assign(path);
      }
    },
    [router]
  );

  // Otomatik yönlendirme — user beklemeden fallback ile çalışır
  useEffect(() => {
    if (!autoRedirect) return;
    const timer = setTimeout(() => {
      onAuthSuccess?.();
      guaranteedRedirect(redirectPath);
    }, redirectDelayMs);
    return () => clearTimeout(timer);
  }, [autoRedirect, redirectDelayMs, guaranteedRedirect, redirectPath, onAuthSuccess]);

  // Elle yönlendirme
  const handleClick = useCallback(() => {
    onAuthSuccess?.();
    guaranteedRedirect(redirectPath);
  }, [onAuthSuccess, guaranteedRedirect, redirectPath]);

  // User yoksa da mesaj + otomatik yönlendirme çalışır
  if (!user) {
    return (
      <Wrapper style={{ maxWidth: 440, margin: "0 auto" }}>
        <IconWrap>
          <FaCheckCircle size={52} />
        </IconWrap>
        <Title>{t("loginSuccess", "Giriş başarılı!")}</Title>
        <Desc>{t("loadingUser", "Kullanıcı yükleniyor...")}</Desc>
        <RedirectMsg>{t("redirectingFallback", "Birazdan hesabına yönlendirileceksin...")}</RedirectMsg>
      </Wrapper>
    );
  }

  return (
    <Wrapper style={{ maxWidth: 440, margin: "0 auto" }}>
      <IconWrap>
        <FaCheckCircle size={52} aria-label={t("loginSuccess", "Giriş başarılı!")} />
      </IconWrap>
      <Title>{t("loginSuccess", "Giriş başarılı!")}</Title>
      <Desc>
        {t("welcomeUser", {
          defaultValue: "Hoş geldin, {{name}}!",
          name: user?.name || user?.email || user?.user?.name || user?.user?.email || "",
        })}
      </Desc>
      {(user?.email || user?.user?.email) && (
        <UserMail>{user?.email || user?.user?.email}</UserMail>
      )}
      <Button type="button" onClick={handleClick}>
        {redirectPath === "/admin"
          ? t("goToAdminDashboard", "Yönetim Paneline Git")
          : t("goToAccount", "Hesabıma Git")}
      </Button>
      {autoRedirect && (
        <RedirectMsg>
          {redirectPath === "/admin"
            ? t("redirectingToDashboard", "Birazdan yönetim paneline yönlendirileceksin...")
            : t("redirectingToAccount", "Birazdan hesap sayfana yönlendirileceksin...")}
        </RedirectMsg>
      )}
    </Wrapper>
  );
}
