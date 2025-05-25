"use client";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { AuthStepType } from "@/modules/users";
import { motion } from "framer-motion";

interface StepperNavProps {
  currentStep: AuthStepType;
  onStepChange?: (step: AuthStepType) => void;
  steps?: { label: string; key: AuthStepType }[];
}

export default function StepperNav({
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
          <StepBtn
            as={motion.button}
            type="button"
            key={s.key}
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
            <span>{s.label}</span>
            {isActive && (
              <ActiveBar
                layoutId="step-underline"
                as={motion.div}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
              />
            )}
          </StepBtn>
        );
      })}
    </StepperBar>
  );
}

// --- Styled Components ---

const StepperBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.xl};
  margin: ${({ theme }) => `${theme.spacing.xl} 0 ${theme.spacing.lg} 0`};
  position: relative;

  @media (max-width: 700px) {
    gap: ${({ theme }) => theme.spacing.md};
    margin: ${({ theme }) => `${theme.spacing.lg} 0 ${theme.spacing.md} 0`};
  }
  @media (max-width: 480px) {
    gap: ${({ theme }) => theme.spacing.xs};
    margin: ${({ theme }) => `${theme.spacing.md} 0 ${theme.spacing.sm} 0`};
    font-size: 90%;
  }
`;

const StepBtn = styled.button<{ $active?: boolean; $clickable?: boolean }>`
  position: relative;
  background: none;
  border: none;
  outline: none;
  padding: 0 ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xs};
  font-weight: ${({ $active, theme }) =>
    $active ? theme.fontWeights.bold : theme.fontWeights.regular};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
  border-bottom: 2px solid
    ${({ $active, theme }) => ($active ? theme.colors.primary : "transparent")};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.base};
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  opacity: ${({ $clickable }) => ($clickable ? 1 : 0.7)};
  transition: color 0.18s, border 0.18s, opacity 0.18s, box-shadow 0.19s;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    z-index: 1;
  }

  @media (max-width: 520px) {
    padding: 0 ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.xs};
    gap: 3px;
  }
`;

const StepIndex = styled.span<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.7em;
  height: 1.7em;
  border-radius: 50%;
  background: ${({ $active, theme }) =>
    $active
      ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`
      : theme.colors.inputBackground};
  color: ${({ $active, theme }) => ($active ? "#fff" : theme.colors.textSecondary)};
  font-size: 1em;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  box-shadow: ${({ $active, theme }) =>
    $active ? theme.shadows.sm : "none"};
  margin-right: ${({ theme }) => theme.spacing.xs};
  border: 2px solid
    ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  transition: background 0.17s, color 0.17s, border 0.16s, box-shadow 0.18s;

  @media (max-width: 520px) {
    width: 1.2em;
    height: 1.2em;
    font-size: 0.98em;
    margin-right: 0.28em;
  }
`;

const ActiveBar = styled.div`
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 2.5px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 2px;
  z-index: 2;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.primaryTransparent};
`;
