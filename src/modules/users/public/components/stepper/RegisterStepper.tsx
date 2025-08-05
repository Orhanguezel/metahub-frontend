"use client";

import { useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { registerTranslations } from "@/modules/users";
import { StepperNav } from "@/shared";
import {
  RegisterSuccessStep,
  RegisterFormStep,
  EmailVerifyStep,
  OtpVerifyStep,
} from "@/modules/users";
import { AuthStep, AuthStepType } from "@/modules/users";
import { Wrapper, Section } from "@/modules/users/styles/AccountStyles";

interface StepLabel {
  key: AuthStepType;
  label: string;
}

interface Props {
  onAuthSuccess?: () => void;
  steps?: StepLabel[];
}

export default function RegisterStepper({ onAuthSuccess, steps }: Props) {
  const { t } = useI18nNamespace("register", registerTranslations);

  // Varsayılan adım listesi, label çevirisi otomatik
  const DEFAULT_STEPS: StepLabel[] = [
    { key: "register", label: t("steps.register", "Kayıt Ol") },
    { key: "verifyEmail", label: t("steps.verifyEmail", "E-posta Doğrulama") },
    { key: "otp", label: t("steps.otp", "Kod Onayı") },
    { key: "done", label: t("steps.done", "Tamamlandı") },
  ];
  const stepList = steps || DEFAULT_STEPS;

  const [step, setStep] = useState<AuthStepType>("register");
  const [payload, setPayload] = useState<Record<string, any>>({});

  const nextStep = (next: AuthStep) => {
    setStep(next.step);
    setPayload(next.payload || {});
  };

  return (
    <Wrapper style={{ maxWidth: 480, margin: "0 auto" }}>
      <StepperNav currentStep={step} steps={stepList} />
      <Section style={{
        marginTop: 0,
        boxShadow: "none",
        background: "transparent",
        border: "none",
        padding: 0
      }}>
        {step === "register" && <RegisterFormStep onNext={nextStep} />}
        {step === "verifyEmail" && (
          <EmailVerifyStep email={payload.email} onNext={nextStep} />
        )}
        {step === "otp" && (
          <OtpVerifyStep email={payload.email} onNext={nextStep} />
        )}
        {step === "done" && (
          <RegisterSuccessStep onAuthSuccess={onAuthSuccess} />
        )}
      </Section>
    </Wrapper>
  );
}
