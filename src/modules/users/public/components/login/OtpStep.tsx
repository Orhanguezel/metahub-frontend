"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { verifyOtp, resendOtp } from "@/modules/users/slice/advancedSlice";
import { toast } from "react-toastify";

import {
  Wrapper,
  Title,
  Message as Desc,
  Button,
} from "@/modules/users/styles/AccountStyles";
import {
  Input,
  Label,
  Form,
} from "@/modules/users/styles/AccountStyles";
import { ResendButton } from "@/modules/users/styles/AuthStyles"; 

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
      toast.error(
        err?.message || t("otpFailed", "Code could not be verified.")
      );
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
      toast.error(
        err?.message || t("otpResendFailed", "Code could not be sent.")
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <Wrapper>
      <Form onSubmit={handleVerify} style={{ maxWidth: 340, margin: "0 auto" }}>
        <Title>{t("otpTitle", "Security Code Verification")}</Title>
        <Desc>
          {t("otpDesc", "Please enter the 6-digit code sent via {{channel}}.", {
            channel: channel === "sms" ? t("sms", "SMS") : t("email", "Email"),
          })}
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
          onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
          autoFocus
          disabled={loading}
          aria-label={t("otpLabel", "6-digit code")}
          style={{
            textAlign: "center",
            letterSpacing: "0.26em",
            fontWeight: 700,
            fontSize: "1.23em",
            marginBottom: 24,
          }}
        />
        <Button type="submit" disabled={loading || code.length < 6} style={{ marginBottom: 8 }}>
          {loading ? t("verifying", "Verifying...") : t("verify", "Verify")}
        </Button>
        <ResendButton
          type="button"
          onClick={handleResend}
          disabled={resending || loading}
        >
          {resending
            ? t("resending", "Resending...")
            : t("resendCode", "Resend Code")}
        </ResendButton>
      </Form>
    </Wrapper>
  );
}
