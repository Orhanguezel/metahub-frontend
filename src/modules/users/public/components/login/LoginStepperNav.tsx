"use client";

import { AuthStepType } from "@/modules/users";
import { useTranslation } from "react-i18next";
import {
  StepperBar,
  StepItem,
  Step,
  StepIndex,
  StepLabelText,
  StepConnector,
} from "@/modules/users/styles/AuthStyles";

export interface StepLabel {
  key: AuthStepType;
  label: string;
}

const DEFAULT_STEPS: StepLabel[] = [
  { label: "login", key: "login" },
  { label: "otp", key: "otp" },
  { label: "done", key: "done" },
];

interface Props {
  currentStep: AuthStepType;
  steps?: StepLabel[];
}

export default function LoginStepperNav({ currentStep, steps }: Props) {
  const { t } = useTranslation("login");
  const stepList = steps || DEFAULT_STEPS;

  return (
    <StepperBar>
      {stepList.map((s, i) => (
        <StepItem key={s.key}>
          <Step $active={currentStep === s.key} aria-current={currentStep === s.key ? "step" : undefined}>
            <StepIndex $active={currentStep === s.key}>{i + 1}</StepIndex>
            <StepLabelText $active={currentStep === s.key}>
              {t(`steps.${s.label}`, s.label)}
            </StepLabelText>
          </Step>
          {i < stepList.length - 1 && <StepConnector aria-hidden="true" />}
        </StepItem>
      ))}
    </StepperBar>
  );
}
