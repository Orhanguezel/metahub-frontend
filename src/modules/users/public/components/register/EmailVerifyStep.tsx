"use client";

import { useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {registerTranslations} from "@/modules/users";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { resendEmailVerification } from "@/modules/users/slice/advancedSlice";
import { toast } from "react-toastify";
import { AuthStepType } from "@/modules/users";
import { FaEnvelopeOpenText, FaRedoAlt } from "react-icons/fa";

import {
  Wrapper,
  Title,
  Message as Desc,
} from "@/modules/users/styles/AccountStyles";
import {
  IconWrap,
  ButtonGroup,
  ActionButton,
  AltButton,
} from "@/modules/users/styles/AuthStyles";

interface Props {
  email: string;
  onNext: (step: { step: AuthStepType; payload?: any }) => void;
}

export default function EmailVerifyStep({ email, onNext }: Props) {
  const { t } = useI18nNamespace("register", registerTranslations);
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      await dispatch(resendEmailVerification({ email })).unwrap();
      toast.success(t("verificationEmailSent"));
    } catch (err: any) {
      toast.error(t("verificationEmailFailed"), err?.message || t("tryAgain"));
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
        <AltButton
          type="button"
          onClick={() => onNext({ step: "otp", payload: { email } })}
        >
          {t("haveCode")}
        </AltButton>
      </ButtonGroup>
    </Wrapper>
  );
}
