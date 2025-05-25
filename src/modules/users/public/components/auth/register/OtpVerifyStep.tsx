"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { verifyOtp, resendOtp } from "@/modules/users/slice/advancedSlice";
import { AppDispatch } from "@/store";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { FaShieldAlt } from "react-icons/fa";
import { AuthStepType } from "@/modules/users";

interface Props {
  email: string; // Ekranda gösterilecek ve backend’e gönderilecek
  onNext: (step: { step: AuthStepType; payload?: any }) => void;
}

export default function OtpVerifyStep({ email, onNext }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("register");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!code.trim() || code.length < 6) {
      setError(t("otpRequired"));
      return;
    }
    setLoading(true);
    try {
      await dispatch(verifyOtp({ email, code })).unwrap();
      toast.success(t("otpVerified"));
      onNext({ step: "done" });
    } catch (err: any) {
      setError(t("otpFailed"));
      toast.error(t("otpFailed"), err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await dispatch(resendOtp({ email })).unwrap();
      toast.success(t("otpResent"));
    } catch {
      toast.error(t("otpResendFailed"));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Wrapper>
      <IconWrap>
        <FaShieldAlt size={38} />
      </IconWrap>
      <Title>{t("otpTitle", "Kodu Girin")}</Title>
      <Desc>{t("otpDesc", { email })}</Desc>
      <Form onSubmit={handleVerify}>
        <Input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          maxLength={6}
          placeholder={t("otpPlaceholder")}
          autoFocus
          inputMode="numeric"
          pattern="[0-9]*"
        />

        {error && <ErrorText>{error}</ErrorText>}
        <SubmitButton type="submit" disabled={loading || !code.trim()}>
          {loading ? t("loading") : t("submit")}
        </SubmitButton>
      </Form>
      <ResendBox>
        <span>{t("otpNoCode")}</span>
        <ResendButton
          type="button"
          onClick={handleResend}
          disabled={resendLoading}
        >
          {resendLoading ? t("loading") : t("otpResend")}
        </ResendButton>
      </ResendBox>
    </Wrapper>
  );
}

// --- Styled Components aşağıda aynen bırakabilirsin ---

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
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: 0.01em;
`;

const Desc = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.base};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  letter-spacing: 6px;
  text-align: center;
  font-weight: 700;
  outline: none;
  width: 100%;
  max-width: 240px;
  margin: 0 auto;
  box-shadow: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.7;
    letter-spacing: 3px;
    font-size: ${({ theme }) => theme.fontSizes.base};
    font-weight: 500;
  }
`;

const SubmitButton = styled.button`
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
  margin-top: ${({ theme }) => theme.spacing.xs};

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
      rgba(255,255,255,0.13),
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
    transform: translateY(-2px) scale(1.012);
    &::before { left: 100%; }
  }
  &:active { transform: scale(0.98); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-top: -2px;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ResendBox = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ResendButton = styled.button`
  background: none;
  color: ${({ theme }) => theme.colors.primary};
  border: none;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-left: ${({ theme }) => theme.spacing.xs};
  transition: color 0.17s;

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;
