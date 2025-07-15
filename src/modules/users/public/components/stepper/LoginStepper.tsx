"use client";

import { useState } from "react";
import { LoginSuccessStep, OtpStep, LoginForm } from "@/modules/users";
import { StepperNav } from "@/shared";
import { AuthStepType, AuthStep } from "@/modules/users";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {loginTranslations} from "@/modules/users";
import {
  Wrapper,
  Section,
} from "@/modules/users/styles/AccountStyles";

interface StepLabel {
  key: AuthStepType;
  label: string;
}

interface Props {
  onAuthSuccess?: () => void;
  steps?: StepLabel[]; 
}

export default function LoginStepper({ onAuthSuccess, steps }: Props) {
  const { t } = useI18nNamespace("login", loginTranslations);
  const stepList = steps || [
    { key: "login", label: t("steps.login", "Giriş Yap") },
    { key: "otp", label: t("steps.otp", "Kod Onayı") },
    { key: "done", label: t("steps.done", "Tamamlandı") },
  ];

  const [step, setStep] = useState<AuthStepType>("login");
  const [payload, setPayload] = useState<Record<string, any>>({});

  const nextStep = (next: AuthStep) => {
    setStep(next.step);
    setPayload(next.payload || {});
  };

  return (
    <Wrapper style={{ maxWidth: 440, margin: "0 auto" }}>
      <StepperNav currentStep={step} steps={stepList} />
      <Section style={{
        marginTop: 0,
        boxShadow: "none",
        background: "transparent",
        border: "none",
        padding: 0
      }}>
        {step === "login" && <LoginForm onNext={nextStep} />}
        {step === "otp" && <OtpStep email={payload.email} onNext={nextStep} />}
        {step === "done" && <LoginSuccessStep onAuthSuccess={onAuthSuccess} />}
      </Section>
    </Wrapper>
  );
}

