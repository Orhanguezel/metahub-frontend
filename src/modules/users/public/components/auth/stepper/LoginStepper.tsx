"use client";

import { useState } from "react";
import { LoginSuccessStep, OtpStep, LoginForm } from "@/modules/users";
import {StepperNav} from "@/shared";
import { AuthStepType, AuthStep } from "@/modules/users";
import { useTranslation } from "react-i18next";

interface StepLabel {
  key: AuthStepType;
  label: string;
}

interface Props {
  onAuthSuccess?: () => void;
  steps?: StepLabel[]; // opsiyonel: adım sıralaması ve başlıkları override edilebilir
}

export default function LoginStepper({ onAuthSuccess, steps }: Props) {
  const { t } = useTranslation("login");
  // Çok dillilik destekli step label'ları
  const stepList =
    steps ||
    [
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
    <>
      <StepperNav currentStep={step} steps={stepList} />
      {step === "login" && <LoginForm onNext={nextStep} />}
      {step === "otp" && <OtpStep email={payload.email} onNext={nextStep} />}
      {step === "done" && <LoginSuccessStep onAuthSuccess={onAuthSuccess} />}
    </>
  );
}


