"use client";

import { useState } from "react";
import { ForgotPasswordForm, ForgotPasswordSuccessStep } from "@/modules/users";
import { StepperNav } from "@/shared";
import { AuthStepType, AuthStep } from "@/modules/users";
import { useTranslation } from "react-i18next";
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

export default function ForgotPasswordStepper({ onAuthSuccess, steps }: Props) {
  const { t } = useTranslation("forgotPassword");
  const stepList = steps || [
    { key: "forgot", label: t("steps.forgot", "Şifremi Unuttum") },
    { key: "done", label: t("steps.done", "Tamamlandı") },
  ];

  const [step, setStep] = useState<AuthStepType>("forgot");

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
        {step === "forgot" && <ForgotPasswordForm onNext={nextStep} />}
        {step === "done" && (
          <ForgotPasswordSuccessStep onAuthSuccess={onAuthSuccess} />
        )}
      </Section>
    </Wrapper>
  );
}
