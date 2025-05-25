"use client";

import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

// Styled Components
const Wrapper = styled.div`
  width: 100%;
  max-width: 420px;
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
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.fontSizes.base};
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
