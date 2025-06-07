"use client";
import { useTranslation } from "react-i18next";
import { AuthStepType } from "@/modules/users";
import { motion } from "framer-motion";
import {
  StepperBar,
  StepItem,
  Step,
  StepIndex,
  StepLabelText,
  StepConnector,
  ActiveBar,
} from "@/modules/users/styles/AuthStyles";

interface StepperNavProps {
  currentStep: AuthStepType;
  onStepChange?: (step: AuthStepType) => void;
  steps?: { label: string; key: AuthStepType }[];
}

export default function RegisterStepperNav({
  currentStep,
  onStepChange,
  steps: stepsProp,
}: StepperNavProps) {
  const { t } = useTranslation("register");

  const defaultSteps: { label: string; key: AuthStepType }[] = [
    { label: t("steps.register", "Kayıt Ol"), key: "register" },
    { label: t("steps.verifyEmail", "E-posta Doğrulama"), key: "verifyEmail" },
    { label: t("steps.otp", "Kod Onayı"), key: "otp" },
    { label: t("steps.done", "Tamamlandı"), key: "done" },
  ];

  const steps = stepsProp || defaultSteps;
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <StepperBar as="nav" aria-label={t("steps.ariaLabel", "Kayıt Adımları")}>
      {steps.map((s, i) => {
        const isActive = currentStep === s.key;
        const isClickable = !!onStepChange && i <= currentIndex;
        return (
          <StepItem key={s.key}>
            <Step
              as={motion.button}
              type="button"
              $active={isActive}
              $clickable={isClickable}
              whileTap={isClickable ? { scale: 0.97 } : {}}
              onClick={() => isClickable && onStepChange?.(s.key)}
              tabIndex={isClickable ? 0 : -1}
              aria-current={isActive ? "step" : undefined}
              aria-disabled={!isClickable}
              aria-label={s.label}
            >
              <StepIndex
                $active={isActive}
                as={motion.span}
                layout
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                {i + 1}
              </StepIndex>
              <StepLabelText $active={isActive}>{s.label}</StepLabelText>
              {isActive && (
                <ActiveBar
                  layoutId="step-underline"
                  as={motion.div}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                />
              )}
            </Step>
            {i < steps.length - 1 && <StepConnector aria-hidden="true" />}
          </StepItem>
        );
      })}
    </StepperBar>
  );
}
