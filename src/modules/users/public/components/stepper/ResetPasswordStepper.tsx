"use client";
import { useState } from "react";
import { ResetPasswordForm, ResetPasswordSuccessStep } from "@/modules/users";
import { StepperNav } from "@/shared";
import { AuthStepType, AuthStep } from "@/modules/users";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {resetTranslations} from "@/modules/users";
import {
  Wrapper,
  Section,
} from "@/modules/users/styles/AccountStyles";

interface StepLabel {
  key: AuthStepType;
  label: string;
}

interface Props {
  token: string;
  onAuthSuccess?: () => void;
  steps?: StepLabel[];
}

export default function ResetPasswordStepper({
  token,
  onAuthSuccess,
  steps,
}: Props) {
  const { t } = useI18nNamespace("resetPassword", resetTranslations);
  const stepList = steps || [
    { key: "reset", label: t("steps.reset", "Şifre Sıfırla") },
    { key: "done", label: t("steps.done", "Tamamlandı") },
  ];

  const [step, setStep] = useState<AuthStepType>("reset");

  const nextStep = (next: AuthStep) => {
    setStep(next.step);
  };

  return (
    <Wrapper style={{ maxWidth: 440, margin: "0 auto" }}>
      <StepperNav currentStep={step} steps={stepList} />
      <Section
        style={{
          marginTop: 0,
          boxShadow: "none",
          background: "transparent",
          border: "none",
          padding: 0,
        }}
      >
        {step === "reset" && (
          <ResetPasswordForm token={token} onNext={nextStep} />
        )}
        {step === "done" && (
          <ResetPasswordSuccessStep onAuthSuccess={onAuthSuccess} />
        )}
      </Section>
    </Wrapper>
  );
}
