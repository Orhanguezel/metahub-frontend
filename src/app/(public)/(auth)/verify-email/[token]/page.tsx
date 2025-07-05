"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { verifyEmail } from "@/modules/users/slice/advancedSlice";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

export default function VerifyEmailPage() {
  const dispatch = useAppDispatch();
  const { token } = useParams() as { token: string };
  const { t } = useTranslation("register");
  const { loading, successMessage, error } = useAppSelector(
    (state) => state.auth
  );
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (token) {
      dispatch(verifyEmail(token))
        .unwrap()
        .then(() => setVerified(true))
        .catch(() => setVerified(false));
    }
  }, [token, dispatch]);

  return (
    <Container>
      <Title>{t("verifyEmail.title", "Email Verification")}</Title>
      {loading && (
        <Info>{t("verifyEmail.verifying", "Verifying your email...")}</Info>
      )}
      {!loading && verified === true && (
        <Success>
          {successMessage ||
            t(
              "verifyEmail.success",
              "Email verified successfully. You can now log in."
            )}
        </Success>
      )}
      {!loading && verified === false && (
        <Error>
          {error ||
            t(
              "verifyEmail.error",
              "Verification failed or the link has expired. Please request a new verification email."
            )}
        </Error>
      )}
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  max-width: 420px;
  margin: ${({ theme }) => `${theme.spacings.xl} auto`};
  padding: ${({ theme }) => `${theme.spacings.xxl} ${theme.spacings.xl}`};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.form || theme.shadows.sm};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 200px;
  @media (max-width: 600px) {
    max-width: 96vw;
    padding: ${({ theme }) => `${theme.spacings.lg} ${theme.spacings.md}`};
    border-radius: ${({ theme }) => theme.radii.md};
  }
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacings: 0.01em;
`;

const Info = styled.p`
  color: ${({ theme }) => theme.colors.info};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  font-size: ${({ theme }) => theme.fontSizes.base};
  margin: ${({ theme }) => `${theme.spacings.xl} 0`};
  letter-spacings: 0.01em;
`;

const Success = styled.p`
  color: ${({ theme }) => theme.colors.success};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin: ${({ theme }) => `${theme.spacings.xl} 0`};
  letter-spacings: 0.01em;
`;

const Error = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin: ${({ theme }) => `${theme.spacings.xl} 0`};
  letter-spacings: 0.01em;
`;
