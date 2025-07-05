"use client";
import React from "react";

import { RegisterPage } from "@/modules/users";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

export default function RegisterRouterPage() {
  const { t } = useTranslation("register");

  return (
    <OuterWrapper>
      <Wrapper>
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>
        <RegisterPage />
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
  padding: ${({ theme }) => `${theme.spacings.xl} ${theme.spacings.lg}`};
  @media (max-width: 700px) {
    padding: ${({ theme }) => `${theme.spacings.lg} ${theme.spacings.md}`};
  }
`;

// 2. Login kartı/card
const Wrapper = styled.div`
  width: 100%;
  max-width: 740px;
  min-width: 0;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacings.xxl} ${theme.spacings.xl}`};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.form || theme.shadows.sm};
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 700px) {
    max-width: 98vw;
    padding: ${({ theme }) => `${theme.spacings.lg} ${theme.spacings.md}`};
    border-radius: ${({ theme }) => theme.radii.md};
  }

  h1 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    margin-bottom: ${({ theme }) => theme.spacings.md};
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    letter-spacings: 0.01em;
    line-height: 1.15;
    @media (max-width: 600px) {
      font-size: ${({ theme }) => theme.fontSizes.lg};
    }
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.base};
    margin-bottom: ${({ theme }) => theme.spacings.xl};
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.5;
    max-width: 95%;
    @media (max-width: 600px) {
      font-size: ${({ theme }) => theme.fontSizes.sm};
      margin-bottom: ${({ theme }) => theme.spacings.lg};
    }
  }
`;
