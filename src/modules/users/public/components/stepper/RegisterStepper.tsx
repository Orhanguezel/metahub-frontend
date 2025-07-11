"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StepperNav } from "@/shared";
import {
  RegisterSuccessStep,
  RegisterFormStep,
  EmailVerifyStep,
  OtpVerifyStep,
} from "@/modules/users";
import { AuthStep, AuthStepType } from "@/modules/users";
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

export default function RegisterStepper({ onAuthSuccess, steps }: Props) {
  const { t } = useTranslation("register");

  const stepList = steps || [
    { key: "register", label: t("steps.register", "Kayıt Ol") },
    { key: "verifyEmail", label: t("steps.verifyEmail", "E-posta Doğrulama") },
    { key: "otp", label: t("steps.otp", "Kod Onayı") },
    { key: "done", label: t("steps.done", "Tamamlandı") },
  ];

  const [step, setStep] = useState<AuthStepType>("register");
  const [formData, setFormData] = useState<Record<string, any>>({});

  const nextStep = (next: AuthStep) => {
    setStep(next.step);
    setFormData(next.payload || {});
  };

  return (
    <Wrapper style={{ maxWidth: 480, margin: "0 auto" }}>
      <StepperNav currentStep={step} steps={stepList} />
      <Section style={{ marginTop: 0, boxShadow: "none", background: "transparent", border: "none", padding: 0 }}>
        {step === "register" && <RegisterFormStep onNext={nextStep} />}
        {step === "verifyEmail" && (
          <EmailVerifyStep email={formData.email} onNext={nextStep} />
        )}
        {step === "otp" && (
          <OtpVerifyStep email={formData.email} onNext={nextStep} />
        )}
        {step === "done" && (
          <RegisterSuccessStep onAuthSuccess={onAuthSuccess} />
        )}
      </Section>
    </Wrapper>
  );
}
