"use client";

import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

export default function ForgotPasswordPage() {
  const { t } = useTranslation("forgotPassword");

  return (
    <Wrapper>
      <h2>{t("title")}</h2>
      <p>{t("instruction")}</p>
      <ForgotPasswordForm />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  max-width: 400px;
  margin: ${({ theme }) => theme.spacing.lg} auto;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  color: ${({ theme }) => theme.colors.text};

  h2 {
    margin-bottom: ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }

  p {
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;
