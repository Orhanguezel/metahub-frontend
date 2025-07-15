"use client";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { verifyOtp, resendOtp } from "@/modules/users/slice/advancedSlice";
import { AppDispatch } from "@/store";
import { toast } from "react-toastify";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {registerTranslations} from "@/modules/users";
import { FaShieldAlt } from "react-icons/fa";
import { AuthStepType } from "@/modules/users";
import {
  Wrapper,
  Title,
  Button,
  Message as ErrorText,
} from "@/modules/users/styles/AccountStyles";
import {
  IconWrap,
  ResendBox,
  ResendButton,
  Desc,
  OtpInput,
} from "@/modules/users/styles/AuthStyles";

interface Props {
  email: string;
  onNext: (step: { step: AuthStepType; payload?: any }) => void;
}

export default function OtpVerifyStep({ email, onNext }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useI18nNamespace("register", registerTranslations);

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
      <form onSubmit={handleVerify} style={{ width: "100%" }}>
        <OtpInput
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          maxLength={6}
          placeholder={t("otpPlaceholder")}
          autoFocus
          inputMode="numeric"
          pattern="[0-9]*"
        />
        {error && <ErrorText $error>{error}</ErrorText>}
        <Button type="submit" disabled={loading || !code.trim()} style={{ marginTop: 12 }}>
          {loading ? t("loading") : t("submit")}
        </Button>
      </form>
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
