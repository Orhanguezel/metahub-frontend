// modules/users/auth/stepper/ChangePasswordStepper.tsx
"use client";
import { useState } from "react";
import { ChangePasswordForm, ChangePasswordSuccessStep } from "@/modules/users";
import { StepperNav } from "@/shared";
import { AuthStepType, AuthStep } from "@/modules/users";
import { useTranslation } from "react-i18next";

interface StepLabel {
  key: AuthStepType;
  label: string;
}
interface Props {
  onAuthSuccess?: () => void;
  steps?: StepLabel[];
}

export default function ChangePasswordStepper({ onAuthSuccess, steps }: Props) {
  const { t } = useTranslation("changePassword");
  const stepList =
    steps ||
    [
      { key: "change", label: t("steps.change", "Şifre Değiştir") },
      { key: "done", label: t("steps.done", "Tamamlandı") },
    ];

  const [step, setStep] = useState<AuthStepType>("change");

  const nextStep = (next: AuthStep) => {
    setStep(next.step);
  };

  return (
    <>
      <StepperNav currentStep={step} steps={stepList} />
      {step === "change" && <ChangePasswordForm onNext={nextStep} />}
      {step === "done" && (
        <ChangePasswordSuccessStep onAuthSuccess={onAuthSuccess} />
      )}
    </>
  );
}
