// src/modules/users/styles/AuthStyles.ts

import styled from "styled-components";


export const InputIconWrapper = styled.div<{ $hasError?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  border: 1.5px solid
    ${({ $hasError, theme }) =>
      $hasError ? theme.colors.danger : theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.inputBackground};
  transition: border-color ${({ theme }) => theme.transition.fast}, box-shadow ${({ theme }) => theme.transition.fast};
  &:focus-within {
    border-color: ${({ $hasError, theme }) =>
      $hasError ? theme.colors.danger : theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryTransparent};
  }
`;

export const Icon = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.52;
  font-size: 1.13em;
`;

export const TogglePassword = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1em;
  display: flex;
  align-items: center;
  padding: 0 0.2em;
  transition: color 0.18s;
  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

export const OptionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  gap: ${({ theme }) => theme.spacing.xs};
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

export const RememberMe = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4em;
  input[type="checkbox"] {
    width: 1.08em;
    height: 1.08em;
    border: 1.5px solid ${({ theme }) => theme.colors.inputBorder};
    border-radius: 3px;
    accent-color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    transition: border-color 0.16s;
    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryTransparent};
    }
  }
  label {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

export const ActionLink = styled.button`
  color: ${({ theme }) => theme.colors.primaryHover};
  text-decoration: underline;
  cursor: pointer;
  background: none;
  border: none;
  font: inherit;
  padding: 0;
  transition: color 0.18s;
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const AltAction = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px dashed ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  letter-spacing: 0.01em;
`;

export const InputIcon = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.56;
  font-size: 1.08em;
  margin-right: ${({ theme }) => theme.spacing.xs};
`;

export const Terms = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin: ${({ theme }) => `${theme.spacing.md} 0`};

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
    &:hover,
    &:focus {
      color: ${({ theme }) => theme.colors.primaryHover};
    }
  }
`;

export const InputWrapper = styled.div<{ $hasError?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: 0 ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid
    ${({ $hasError, theme }) =>
      $hasError ? theme.colors.danger : theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.inputBackground};
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus-within {
    border-color: ${({ $hasError, theme }) =>
      $hasError ? theme.colors.danger : theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryTransparent};
  }
`;


export const StepperBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.xl};
  margin: ${({ theme }) => `${theme.spacing.xl} 0 ${theme.spacing.lg} 0`};
  position: relative;
`;

export const StepItem = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

export const Step = styled.button<{ $active?: boolean; $clickable?: boolean }>`
  background: none;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: 0 ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ $active, theme }) =>
    $active ? theme.fontWeights.bold : theme.fontWeights.regular};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
  border-bottom: 2px solid
    ${({ $active, theme }) => ($active ? theme.colors.primary : "transparent")};
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  opacity: ${({ $clickable }) => ($clickable ? 1 : 0.7)};
  position: relative;
  transition: color 0.18s, border 0.18s, opacity 0.18s;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    z-index: 2;
  }
`;


export const StepIndex = styled.span<{ $active?: boolean }>`
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
  color: ${({ $active, theme }) =>
    $active ? "#fff" : theme.colors.textSecondary};
  font-size: 1em;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  box-shadow: ${({ $active, theme }) => ($active ? theme.shadows.sm : "none")};
  margin-right: ${({ theme }) => theme.spacing.xs};
  border: 2px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.primary : theme.colors.border};
  transition: background 0.17s, color 0.17s, border 0.16s, box-shadow 0.18s;
`;


export const StepLabelText = styled.span<{ $active?: boolean }>`
  font-weight: ${({ $active, theme }) =>
    $active ? theme.fontWeights.bold : theme.fontWeights.regular};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
  letter-spacing: 0.02em;
  transition: color 0.17s;
`;

export const StepConnector = styled.span`
  width: 2.6rem;
  height: 2px;
  background: ${({ theme }) => theme.colors.border};
  margin: 0 ${({ theme }) => theme.spacing.sm};
  border-radius: 1px;
  opacity: 0.45;
`;

export const ActiveBar = styled.div`
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


export const IconWrap = styled.div`
  color: ${({ theme }) => theme.colors.success};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    filter: drop-shadow(0 2px 8px ${({ theme }) => theme.colors.success}33);
  }
`;

export const RedirectMsg = styled.div`
  color: ${({ theme }) => theme.colors.info};
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  opacity: 0.75;
  text-align: center;
`;



export const InfoTooltip = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.info || theme.colors.primary};
  background: ${({ theme }) => theme.colors.primaryTransparent};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  min-height: 2em;
  width: 100%;
  box-sizing: border-box;

  svg {
    color: ${({ theme }) => theme.colors.primary};
    margin-top: 2px;
    flex-shrink: 0;
    font-size: 1.1em;
    opacity: 0.93;
  }

  span {
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.6;
    font-size: inherit;
    font-weight: 500;
    word-break: break-word;
    flex: 1;
  }
`;



export const BarContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  width: 100%;
`;

export const StrengthBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  height: 0.85em;
  width: 100%;
`;

export const StrengthBlock = styled.div<{ $active: boolean; $score: number }>`
  flex: 1;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $active, $score, theme }) => {
    if (!$active) return theme.colors.inputBackground;
    if ($score === 0) return theme.colors.danger;
    if ($score === 1) return theme.colors.warning;
    if ($score === 2) return theme.colors.info;
    if ($score === 3) return theme.colors.success;
    return theme.colors.primary;
  }};
  box-shadow: ${({ $active, $score, theme }) =>
    $active && $score >= 2 ? theme.shadows.sm : "none"};
  opacity: ${({ $active }) => ($active ? 1 : 0.44)};
  transition: background 0.32s, opacity 0.18s;
`;

export const PwLabel = styled.div<{ $score: number }>`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-top: ${({ theme }) => theme.spacing.xs};
  min-height: 1.2em;
  letter-spacing: 0.03em;
  text-align: left;
  color: ${({ $score, theme }) =>
    $score === 0
      ? theme.colors.danger
      : $score === 1
      ? theme.colors.warning
      : $score === 2
      ? theme.colors.info
      : $score === 3
      ? theme.colors.success
      : theme.colors.primary};
  opacity: 0.92;
`;


export const Desc = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.base};
`;

export const OtpInput = styled.input`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  letter-spacing: 7px;
  text-align: center;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  outline: none;
  width: 100%;
  max-width: 240px;
  margin: 0 auto;
  box-shadow: none;
  margin-bottom: ${({ theme }) => theme.spacing.xs};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.7;
    letter-spacing: 4px;
    font-size: ${({ theme }) => theme.fontSizes.base};
    font-weight: 500;
  }
`;

export const ResendBox = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const ResendButton = styled.button`
  background: none;
  color: ${({ theme }) => theme.colors.primary};
  border: none;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  cursor: pointer;
  text-decoration: underline;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-left: ${({ theme }) => theme.spacing.xs};
  transition: color 0.17s;
  padding: 0;

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;


export const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
`;

export const ActionButton = styled.button`
  flex: 1 1 170px;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.primaryHover}
  );
  color: ${({ theme }) => theme.colors.buttonText};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.18s, transform 0.13s;

  &:hover,
  &:focus {
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.primaryHover},
      ${({ theme }) => theme.colors.primary}
    );
    transform: translateY(-2px) scale(1.013);
  }
  &:active {
    transform: scale(0.98);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    margin-right: 8px;
    font-size: 1.1em;
  }
`;

export const AltButton = styled.button`
  flex: 1 1 170px;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  border: 1.5px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: pointer;
  transition: background 0.18s, color 0.18s, border 0.15s;

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.buttonText};
  }
`;







