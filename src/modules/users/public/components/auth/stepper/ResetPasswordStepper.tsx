"use client";
import { useState } from "react";
import { ResetPasswordForm, ResetPasswordSuccessStep } from "@/modules/users";
import { StepperNav } from "@/shared";
import { AuthStepType, AuthStep } from "@/modules/users";
import { useTranslation } from "react-i18next";

interface StepLabel {
  key: AuthStepType;
  label: string;
}

interface Props {
  token: string;
  onAuthSuccess?: () => void;
  steps?: StepLabel[];
}

export default function ResetPasswordStepper({ token, onAuthSuccess, steps }: Props) {
  const { t } = useTranslation("resetPassword");
  const stepList =
    steps ||
    [
      { key: "reset", label: t("steps.reset", "Şifre Sıfırla") },
      { key: "done", label: t("steps.done", "Tamamlandı") },
    ];

  const [step, setStep] = useState<AuthStepType>("reset");

  const nextStep = (next: AuthStep) => {
    setStep(next.step);
  };

  return (
    <>
      <StepperNav currentStep={step} steps={stepList} />
      {step === "reset" && <ResetPasswordForm token={token} onNext={nextStep} />}
      {step === "done" && (
        <ResetPasswordSuccessStep onAuthSuccess={onAuthSuccess} />
      )}
    </>
  );
}
