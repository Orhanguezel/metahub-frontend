"use client";

import { useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import {StepperNav} from "@/shared";
import {
  RegisterSuccessStep,
  RegisterFormStep,
  EmailVerifyStep,
  OtpVerifyStep,
} from "@/modules/users";
import { AuthStep, AuthStepType } from "@/modules/users";

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
  // Çok dillilik destekli adım başlıkları
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
    <StepperWrapper>
      <StepperNav currentStep={step} steps={stepList} />
      <StepperBody>
        {step === "register" && <RegisterFormStep onNext={nextStep} />}
        {step === "verifyEmail" && (
          <EmailVerifyStep email={formData.email} onNext={nextStep} />
        )}
        {step === "otp" && (
          <OtpVerifyStep email={formData.email} onNext={nextStep} />
        )}
        {step === "done" && <RegisterSuccessStep onAuthSuccess={onAuthSuccess} />}
      </StepperBody>
    </StepperWrapper>
  );
}

const StepperWrapper = styled.div`
  max-width: 440px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const StepperBody = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;
