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
  margin: 3rem auto;
  padding: 2rem;
  background-color: ${({ theme }) => theme.backgroundSecondary};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.light};

  h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.text};
  }

  p {
    font-size: 0.95rem;
    margin-bottom: 2rem;
    color: ${({ theme }) => theme.textSecondary};
  }
`;
