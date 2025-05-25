"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { verifyOtp, resendOtp } from "@/modules/users/slice/advancedSlice";
import { AppDispatch } from "@/store";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

interface Props {
  email: string;
  channel?: "sms" | "email";
  onNext: (step: { step: "done"; payload?: any }) => void;
}

export default function OtpStep({ email, onNext, channel = "sms" }: Props) {
  const { t } = useTranslation("login");
  const dispatch = useDispatch<AppDispatch>();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // OTP verify
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(verifyOtp({ email, code })).unwrap();
      toast.success(t("otpVerified", "Verification successful!"));
      onNext({ step: "done" });
    } catch (err: any) {
      toast.error(err?.message || t("otpFailed", "Code could not be verified."));
    } finally {
      setLoading(false);
    }
  };

  // OTP resend
  const handleResend = async () => {
    setResending(true);
    try {
      await dispatch(resendOtp({ email })).unwrap();
      toast.success(t("otpResent", "Code resent!"));
    } catch (err: any) {
      toast.error(err?.message || t("otpResendFailed", "Code could not be sent."));
    } finally {
      setResending(false);
    }
  };

  return (
    <Form onSubmit={handleVerify}>
      <Title>{t("otpTitle", "Security Code Verification")}</Title>
      <Desc>
        {t(
          "otpDesc",
          "Please enter the 6-digit code sent via {{channel}}.",
          { channel: channel === "sms" ? t("sms", "SMS") : t("email", "Email") }
        )}
      </Desc>
      <Label htmlFor="otpCode">{t("otpLabel", "6-digit code")}</Label>
      <Input
        id="otpCode"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        placeholder="123456"
        value={code}
        onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ""))}
        autoFocus
        disabled={loading}
        aria-label={t("otpLabel", "6-digit code")}
      />
      <Button type="submit" disabled={loading || code.length < 6}>
        {loading ? t("verifying", "Verifying...") : t("verify", "Verify")}
      </Button>
      <Resend type="button" onClick={handleResend} disabled={resending || loading}>
        {resending ? t("resending", "Resending...") : t("resendCode", "Resend Code")}
      </Resend>
    </Form>
  );
}

// --- Styled Components ---
const Form = styled.form`
  width: 100%;
  max-width: 400px;
  margin: ${({ theme }) => `${theme.spacing.xl} auto`};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.xl}`};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.form || theme.shadows.sm};
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 600px) {
    max-width: 98vw;
    padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.md}`};
    border-radius: ${({ theme }) => theme.radii.md};
  }
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: 0.02em;
`;

const Desc = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.fontSizes.base};
`;

const Label = styled.label`
  display: block;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  width: 72%;
  min-width: 120px;
  max-width: 260px;
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  text-align: center;
  letter-spacing: 0.28em;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  transition: border 0.18s, box-shadow 0.18s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryTransparent};
    outline: none;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
    opacity: 0.82;
    font-style: italic;
    font-size: ${({ theme }) => theme.fontSizes.base};
  }
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
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.base};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: background 0.18s, transform 0.13s;

  &::before {
    content: "";
    position: absolute;
    top: 0; left: -100%; width: 100%; height: 100%;
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
    transform: translateY(-2px) scale(1.012);
    &::before { left: 100%; }
  }
  &:active { transform: scale(0.98); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const Resend = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.info};
  color: ${({ theme }) => theme.colors.buttonText};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: background 0.17s, color 0.16s;
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &:hover:not(:disabled), &:focus {
    background: ${({ theme }) => theme.colors.primaryHover};
    color: #fff;
  }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;
