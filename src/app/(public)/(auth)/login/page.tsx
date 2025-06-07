"use client";

import { LoginPage } from "@/modules/users";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

export default function LoginRouterPage() {
  const { t } = useTranslation("login");

  return (
    <OuterWrapper>
      <Wrapper>
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>
        <LoginPage />
      </Wrapper>
    </OuterWrapper>
  );
}

// 1. Sayfa dış wrapper'ı (tam ortalama sağlar!)
const OuterWrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.lg}`};
  @media (max-width: 700px) {
    padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.md}`};
  }
`;

// 2. Login kartı/card
const Wrapper = styled.div`
  width: 100%;
  max-width: 740px;
  min-width: 0;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.xl}`};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.form || theme.shadows.sm};
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 700px) {
    max-width: 98vw;
    padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.md}`};
    border-radius: ${({ theme }) => theme.radii.md};
  }

  h1 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    letter-spacing: 0.01em;
    line-height: 1.15;
    @media (max-width: 600px) {
      font-size: ${({ theme }) => theme.fontSizes.lg};
    }
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.base};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.5;
    max-width: 95%;
    @media (max-width: 600px) {
      font-size: ${({ theme }) => theme.fontSizes.sm};
      margin-bottom: ${({ theme }) => theme.spacing.lg};
    }
  }
`;
