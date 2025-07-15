"use client";
import { useState } from "react";
import { ChangePasswordForm, ChangePasswordSuccessStep } from "@/modules/users";
import { StepperNav } from "@/shared";
import { AuthStepType, AuthStep } from "@/modules/users";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {changeTranslations} from "@/modules/users";
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

export default function ChangePasswordStepper({ onAuthSuccess, steps }: Props) {
  const { t } = useI18nNamespace("changePassword", changeTranslations);
  const stepList = steps || [
    { key: "change", label: t("steps.change", "Şifre Değiştir") },
    { key: "done", label: t("steps.done", "Tamamlandı") },
  ];

  const [step, setStep] = useState<AuthStepType>("change");

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
        {step === "change" && <ChangePasswordForm onNext={nextStep} />}
        {step === "done" && (
          <ChangePasswordSuccessStep onAuthSuccess={onAuthSuccess} />
        )}
      </Section>
    </Wrapper>
  );
}
