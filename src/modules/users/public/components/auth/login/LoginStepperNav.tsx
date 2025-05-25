"use client";

import styled from "styled-components";
import { AuthStepType } from "@/modules/users";
import { useTranslation } from "react-i18next";

// Adım tanımı için type
export interface StepLabel {
  key: AuthStepType;
  label: string;
}

// Artık steps parametre olarak geliyor. Default değer yukarıdan verilmezse bu kullanılacak.
const DEFAULT_STEPS: StepLabel[] = [
  { label: "login", key: "login" },
  { label: "otp", key: "otp" },
  { label: "done", key: "done" },
];

interface Props {
  currentStep: AuthStepType;
  steps?: StepLabel[]; // Opsiyonel: dışarıdan steps al
}

export default function LoginStepperNav({ currentStep, steps }: Props) {
  const { t } = useTranslation("login");
  const stepList = steps || DEFAULT_STEPS;

  return (
    <StepperBar>
      {stepList.map((s, i) => (
        <>
          <Step
            key={s.key}
            $active={currentStep === s.key}
            aria-current={currentStep === s.key ? "step" : undefined}
          >
            <StepIndex $active={currentStep === s.key}>{i + 1}</StepIndex>
            {t(`steps.${s.label}`, s.label)}
          </Step>
          {i < stepList.length - 1 && <StepConnector aria-hidden="true" />}
        </>
      ))}
    </StepperBar>
  );
}

// --- Styled Components ---

const StepperBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.lg};
  margin: ${({ theme }) => `${theme.spacing.xl} 0`};
  position: relative;

  @media (max-width: 600px) {
    gap: ${({ theme }) => theme.spacing.md};
    margin: ${({ theme }) => `${theme.spacing.md} 0`};
  }
`;

const Step = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ $active, theme }) => ($active ? theme.fontWeights.bold : theme.fontWeights.regular)};
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.textSecondary)};
  border-bottom: 2px solid
    ${({ $active, theme }) => ($active ? theme.colors.primary : "transparent")};
  padding: 0 ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xs};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primaryTransparent : "transparent"};
  border-radius: ${({ theme }) => theme.radii.sm} ${({ theme }) => theme.radii.sm} 0 0;
  transition: color 0.2s, border 0.2s, background 0.18s;

  &:hover, &:focus {
    color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
  }
`;

const StepIndex = styled.span<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.85em;
  height: 1.85em;
  font-size: 1em;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  border-radius: 50%;
  background: ${({ $active, theme }) =>
    $active
      ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`
      : theme.colors.inputBackground};
  color: ${({ $active, theme }) => ($active ? "#fff" : theme.colors.textSecondary)};
  border: 2px solid
    ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  box-shadow: ${({ $active, theme }) =>
    $active ? theme.shadows.sm : "none"};
  margin-right: ${({ theme }) => theme.spacing.xs};
  transition: background 0.19s, color 0.19s, border 0.18s, box-shadow 0.18s;
`;

const StepConnector = styled.span`
  width: 2.6rem;
  height: 2px;
  background: ${({ theme }) => theme.colors.border};
  margin: 0 ${({ theme }) => theme.spacing.sm};
  border-radius: 1px;
  opacity: 0.45;
  @media (max-width: 600px) {
    width: 1.2rem;
    margin: 0 ${({ theme }) => theme.spacing.xs};
  }
`;
