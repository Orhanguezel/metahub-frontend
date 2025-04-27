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
  margin: 3rem auto;
  padding: 2rem;
  background: ${({ theme }) => theme.backgroundSecondary};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.light};

  h2 {
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.text};
  }

  p {
    margin-bottom: 1.5rem;
    color: ${({ theme }) => theme.textSecondary};
  }
`;
