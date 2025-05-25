"use client";

import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

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
  const { t } = useTranslation("login");
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  // Role göre path belirle (useMemo ile optimize)
  const redirectPath = useMemo(() => {
    if (user?.role === "admin") return "/admin";
    return "/account"; // veya "/" veya "/dashboard" (kendi ana sayfan neyse)
  }, [user?.role]);

  // Otomatik yönlendirme
  useEffect(() => {
    if (!autoRedirect) return;
    const timer = setTimeout(() => {
      if (onAuthSuccess) onAuthSuccess();
      else router.push(redirectPath);
    }, redirectDelayMs);
    return () => clearTimeout(timer);
  }, [autoRedirect, onAuthSuccess, redirectDelayMs, router, redirectPath]);

  // Butona tıklandığında yönlendirme/callback
  const handleClick = useCallback(() => {
    if (onAuthSuccess) onAuthSuccess();
    else router.push(redirectPath);
  }, [onAuthSuccess, router, redirectPath]);

  // UI mesajları ve buton label'ı role göre değişsin
  const dashboardText =
    user?.role === "admin"
      ? t("goToAdminDashboard", "Go to Admin Dashboard")
      : t("goToAccount", "Go to My Account");

  const redirectingMsg =
    user?.role === "admin"
      ? t("redirectingToDashboard", "Redirecting to the admin dashboard in a moment...")
      : t("redirectingToAccount", "Redirecting to your account page in a moment...");

  return (
    <Wrapper>
      <IconWrap>
        <FaCheckCircle size={52} aria-label={t("loginSuccess", "Login successful!")} />
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
      {autoRedirect && (
        <RedirectMsg>
          {redirectingMsg}
        </RedirectMsg>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  max-width: 410px;
  margin: ${({ theme }) => `${theme.spacing.xl} auto`};
  padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.xl}`};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.form || theme.shadows.sm};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 600px) {
    max-width: 96vw;
    padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.md}`};
    border-radius: ${({ theme }) => theme.radii.md};
  }
`;

const IconWrap = styled.div`
  color: ${({ theme }) => theme.colors.success};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    filter: drop-shadow(0 2px 8px ${({ theme }) => theme.colors.success || "rgba(0,0,0,0.08)"});
  }
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.success};
  letter-spacing: 0.02em;
`;

const Desc = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.base};
`;

const UserMail = styled.div`
  color: ${({ theme }) => theme.colors.info};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  opacity: 0.92;
  word-break: break-all;
`;

const Button = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.primaryHover}
  );
  color: ${({ theme }) => theme.colors.buttonText};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.base};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: background 0.18s, transform 0.13s;
  position: relative;
  overflow: hidden;
  margin-top: ${({ theme }) => theme.spacing.sm};

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,0.18),
      transparent
    );
    transition: left 0.5s ease;
    z-index: 1;
  }

  &:hover:not(:disabled), &:focus {
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.primaryHover},
      ${({ theme }) => theme.colors.primary}
    );
    transform: translateY(-2px) scale(1.013);
    &::before { left: 100%; }
  }
  &:active { transform: scale(0.98); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const RedirectMsg = styled.div`
  color: ${({ theme }) => theme.colors.info};
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  opacity: 0.75;
  text-align: center;
`;
