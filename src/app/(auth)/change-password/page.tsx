"use client";

import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

export default function ChangePasswordPage() {
  const { t } = useTranslation("changePassword");

  return (
    <Wrapper>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
      <ChangePasswordForm />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  max-width: 500px;
  margin: ${({ theme }) => theme.spacing.lg} auto;
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};

  h1 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.text};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.5;
  }
`;
