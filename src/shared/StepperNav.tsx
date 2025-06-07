"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import { AuthStepType } from "@/modules/users";

export interface StepperNavProps {
  currentStep: AuthStepType;
  steps: { label: string; key: AuthStepType }[];
}

// --- Ana Component ---
export default function StepperNav({ currentStep, steps }: StepperNavProps) {
  return (
    <StepperBar>
      {steps.map((s, i) => {
        const active = currentStep === s.key;
        return (
          <Step key={s.key} $active={active} as={motion.div}>
            <StepCircle $active={active} as={motion.span} layout>
              {i + 1}
            </StepCircle>
            <StepLabel $active={active}>{s.label}</StepLabel>
            {active && (
              <ActiveBar
                layoutId="step-underline"
                as={motion.div}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
              />
            )}
          </Step>
        );
      })}
    </StepperBar>
  );
}

// --- Styled Components ---
const StepperBar = styled.div`
  display: flex;
  flex-direction: row;  
  flex-wrap: wrap;  
  justify-content: center;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin: ${({ theme }) => `${theme.spacing.xl} 0 ${theme.spacing.lg} 0`};
  min-width: 220px;
  max-width: 100vw;
  overflow-x: auto;
  row-gap: ${({ theme }) => theme.spacing.lg};

  @media ${({ theme }) => theme.media.small} {
    gap: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.sm}`};
    margin: ${({ theme }) => `${theme.spacing.lg} 0 ${theme.spacing.md} 0`};
    border-radius: ${({ theme }) => theme.radii.md};
    row-gap: ${({ theme }) => theme.spacing.md};
  }
`;


const StepCircle = styled.span<{ $active?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2.3em;
  height: 2.3em;
  border-radius: 50%;
  background: ${({ $active, theme }) =>
    $active
      ? `radial-gradient(circle at 65% 25%, #fff 17%, ${theme.colors.primary} 83%)`
      : `linear-gradient(125deg, ${theme.colors.backgroundSecondary} 60%, ${theme.colors.backgroundAlt} 100%)`};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primaryDark : theme.colors.textLight};
  border: 2.2px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.primary : theme.colors.borderLight};
  font-size: 1.17em;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  box-shadow: ${({ $active, theme }) =>
    $active
      ? `0 2px 12px ${theme.colors.primaryTransparent}, 0 0 0 2.5px #fff7`
      : theme.shadows.xs};
  transition:
    background ${({ theme }) => theme.transition.fast},
    border ${({ theme }) => theme.transition.fast},
    color ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast};
  z-index: 2;

  @media ${({ theme }) => theme.media.small} {
    width: 1.55em;
    height: 1.55em;
    font-size: 0.98em;
  }
`;

const StepLabel = styled.span<{ $active?: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ $active, theme }) =>
    $active ? theme.fontWeights.bold : theme.fontWeights.regular};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primaryTransparent : "transparent"};
  padding: 0.13em 0.75em;
  border-radius: ${({ theme }) => theme.radii.md};
  letter-spacing: 0.018em;
  user-select: none;
  transition: color 0.18s, background 0.16s, font-weight 0.13s;
  text-shadow: ${({ $active }) =>
    $active
      ? "0 1px 8px #fff6, 0 0 4px #fff5"
      : "0 1px 4px rgba(0,0,0,0.12)"};

  @media ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    padding: 0.08em 0.38em;
  }
`;

const Step = styled.div<{ $active?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  opacity: ${({ $active }) => ($active ? 1 : 0.85)};
  background: transparent;
  transition: opacity ${({ theme }) => theme.transition.fast};

  &:hover {
    opacity: 1;
    ${StepCircle} {
      box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.primaryTransparent};
      border-color: ${({ theme }) => theme.colors.primaryHover};
    }
    ${StepLabel} {
      color: ${({ theme }) => theme.colors.primaryHover};
    }
  }
`;


const ActiveBar = styled.div`
  position: absolute;
  left: 6%;
  bottom: -9px;
  width: 88%;
  height: 4.2px;
  background: linear-gradient(
    90deg,
    #fff 10%,
    ${({ theme }) => theme.colors.primaryHover} 100%
  );
  border-radius: 2px;
  z-index: 3;
  box-shadow: 0 2px 10px 0 ${({ theme }) => theme.colors.primaryTransparent};

  @media ${({ theme }) => theme.media.small} {
    height: 2.2px;
    left: 7%;
    width: 86%;
    bottom: -5px;
  }
`;
