// src/shared/StepperNav.tsx
"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import { AuthStepType } from "@/modules/users";

export interface StepperNavProps {
  currentStep: AuthStepType;
  steps: { label: string; key: AuthStepType }[];
}

export default function StepperNav({ currentStep, steps }: StepperNavProps) {
  return (
    <StepperBar>
      {steps.map((s, i) => (
        <Step
          as={motion.div}
          key={s.key}
          $active={currentStep === s.key}
        >
          <StepIndex
            as={motion.span}
            $active={currentStep === s.key}
            layout
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            {i + 1}
          </StepIndex>
          <StepLabel $active={currentStep === s.key}>{s.label}</StepLabel>
          {currentStep === s.key && (
            <ActiveBar
              layoutId="step-underline"
              as={motion.div}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
            />
          )}
        </Step>
      ))}
    </StepperBar>
  );
}

const StepperBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 2rem;
  margin: 2rem 0;
  position: relative;
`;

const Step = styled.div<{ $active?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.textSecondary)};
  border-bottom: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary : "transparent")};
  padding: 0 8px 4px 8px;
  font-size: 1rem;
  transition: color 0.2s, border 0.2s;
`;

const StepIndex = styled.span<{ $active?: boolean }>`
  display: inline-block;
  width: 1.7em;
  height: 1.7em;
  border-radius: 50%;
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  color: ${({ $active, theme }) => ($active ? "#fff" : theme.colors.textSecondary)};
  font-size: 1rem;
  line-height: 1.7em;
  text-align: center;
  margin-right: 0.5em;
  font-weight: 700;
`;

const StepLabel = styled.span<{ $active?: boolean }>`
  font-size: 1rem;
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
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
`;
