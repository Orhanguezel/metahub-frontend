"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { resendEmailVerification } from "@/modules/users/slice/advancedSlice";
import { toast } from "react-toastify";
import styled from "styled-components";
import { AuthStepType } from "@/modules/users";
import { FaEnvelopeOpenText, FaRedoAlt } from "react-icons/fa";

interface Props {
  email: string;
  onNext: (step: { step: AuthStepType; payload?: any }) => void;
}

export default function EmailVerifyStep({ email, onNext }: Props) {
  const { t } = useTranslation("register");
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      await dispatch(resendEmailVerification({ email })).unwrap();
      toast.success(t("verificationEmailSent"));
    } catch (err: any) {
      toast.error(t("verificationEmailFailed"),err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <IconWrap>
        <FaEnvelopeOpenText size={40} />
      </IconWrap>
      <Title>{t("verifyEmailTitle")}</Title>
      <Desc>
        {t("verifyEmailDesc", { email })}
        <br />
        <strong>{t("spamCheck")}</strong>
      </Desc>
      <ButtonGroup>
        <ActionButton type="button" onClick={handleResend} disabled={loading}>
          <FaRedoAlt style={{ marginRight: 8 }} />
          {loading ? t("loading") : t("resendVerification")}
        </ActionButton>
        <AltButton type="button" onClick={() => onNext({ step: "otp", payload: { email } })}>
          {t("haveCode")}
        </AltButton>
      </ButtonGroup>
    </Wrapper>
  );
}

// --- Styled Components ---
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
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    filter: drop-shadow(0 2px 8px ${({ theme }) => theme.colors.primaryTransparent || "rgba(0,0,0,0.08)"});
  }
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: 0.01em;
`;

const Desc = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.base};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
`;

const ActionButton = styled.button`
  flex: 1 1 170px;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.primaryHover}
  );
  color: ${({ theme }) => theme.colors.buttonText};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.18s, transform 0.13s;

  &:hover,
  &:focus {
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.primaryHover},
      ${({ theme }) => theme.colors.primary}
    );
    transform: translateY(-2px) scale(1.013);
  }
  &:active { transform: scale(0.98); }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    margin-right: 8px;
    font-size: 1.1em;
  }
`;

const AltButton = styled.button`
  flex: 1 1 170px;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  border: 1.5px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: pointer;
  transition: background 0.18s, color 0.18s, border 0.15s;

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.buttonText};
  }
`;
