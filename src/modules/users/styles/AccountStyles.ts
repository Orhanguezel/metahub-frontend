// src/modules/users/styles/AccountStyles.ts

import styled, { keyframes } from "styled-components";

// --- Wrapper ---

export const DivForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Wrapper = styled.div`
  width: 100%;
  max-width: 900px;
  margin: ${({ theme }) => `${theme.spacings.md} auto`};
  padding: ${({ theme }) => `${theme.spacings.xl} ${theme.spacings.xl}`};
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow ${({ theme }) => theme.transition.normal},
    background ${({ theme }) => theme.transition.normal};

  @media ${({ theme }) => theme.media.small} {
    max-width: 98vw;
    padding: ${({ theme }) => `${theme.spacings.lg} ${theme.spacings.sm}`};
  }
`;

// --- Button ---

export const Button = styled.button<{ $danger?: boolean }>`
  width: fit-content;
  min-width: 120px;
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.xl};
  background: ${({ theme, $danger }) =>
    $danger
      ? theme.buttons.danger.background
      : theme.buttons.primary.background};
  color: ${({ theme, $danger }) =>
    $danger ? theme.buttons.danger.text : theme.buttons.primary.text};
  border: ${({ theme, $danger }) =>
    $danger
      ? theme.borders.thin + " " + theme.colors.danger
      : theme.borders.thin + " " + theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.pill};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.md};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: all ${({ theme }) => theme.transition.normal};
  margin-right: ${({ theme }) => theme.spacings.sm};
  margin-top: ${({ theme }) => theme.spacings.xs};

  &:hover,
  &:focus {
    background: ${({ theme, $danger }) =>
      $danger
        ? theme.buttons.danger.backgroundHover
        : theme.buttons.primary.backgroundHover};
    color: ${({ theme, $danger }) =>
      $danger
        ? theme.buttons.danger.textHover
        : theme.buttons.primary.textHover};
    border-color: ${({ theme, $danger }) =>
      $danger ? theme.colors.dangerHover : theme.colors.primaryHover};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
    box-shadow: none;
    border-color: ${({ theme }) => theme.colors.disabled};
  }
`;
// --- Title ---

export const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  color: ${({ theme }) => theme.colors.primary};
  letter-spacings: 0.02em;
  text-shadow: 0 2px 12px ${({ theme }) => theme.colors.primaryTransparent};
`;

// --- Message & Success ---

export const Success = styled.div`
  color: ${({ theme }) => theme.colors.success};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-top: ${({ theme }) => theme.spacings.xs};
  text-align: center;
  line-height: ${({ theme }) => theme.lineHeights.normal};
  text-shadow: 0 1px 12px ${({ theme }) => theme.colors.success}44;
`;

export const Message = styled.div<{
  $success?: boolean;
  $error?: boolean;
  $warning?: boolean;
}>`
  margin: ${({ theme }) => theme.spacings.xs} 0;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  letter-spacings: 0.01em;
  text-align: center;
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacings.sm};
  background: ${({ theme, $success, $error, $warning }) =>
    $success
      ? theme.colors.success + "15"
      : $error
      ? theme.colors.danger + "15"
      : $warning
      ? theme.colors.warning + "15"
      : theme.colors.backgroundAlt};
  color: ${({ theme, $success, $error, $warning }) =>
    $success
      ? theme.colors.success
      : $error
      ? theme.colors.danger
      : $warning
      ? theme.colors.warning
      : theme.colors.textSecondary};
  box-shadow: ${({ theme, $error }) =>
    $error ? theme.shadows.md : theme.shadows.sm};
  border: ${({ theme, $success, $error, $warning }) =>
    $success
      ? `${theme.borders.thin} ${theme.colors.success}`
      : $error
      ? `${theme.borders.thin} ${theme.colors.danger}`
      : $warning
      ? `${theme.borders.thin} ${theme.colors.warning}`
      : "none"};
  transition: all ${({ theme }) => theme.transition.normal};
`;

// --- Section & SectionTitle ---

export const Section = styled.section`
  width: 100%;
  margin: ${({ theme }) => theme.spacings.xxl} 0;
  padding: ${({ theme }) => theme.spacings.xl}
    ${({ theme }) => theme.spacings.xl};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.borderLight};
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: box-shadow ${({ theme }) => theme.transition.normal},
    background ${({ theme }) => theme.transition.normal},
    border-color ${({ theme }) => theme.transition.normal};

  @media ${({ theme }) => theme.media.medium} {
    padding: ${({ theme }) => theme.spacings.lg}
      ${({ theme }) => theme.spacings.md};
  }
  @media ${({ theme }) => theme.media.small} {
    margin: ${({ theme }) => theme.spacings.lg} 0;
    padding: ${({ theme }) => theme.spacings.md}
      ${({ theme }) => theme.spacings.sm};
    border-radius: ${({ theme }) => theme.radii.md};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

export const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  letter-spacings: 0.02em;
  text-shadow: 0 2px 16px ${({ theme }) => theme.colors.primaryTransparent},
    0 1px 4px #0006;

  @media ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.md};
    margin-bottom: ${({ theme }) => theme.spacings.sm};
  }
`;

// --- Form & FormGroup ---

export const Form = styled.form`
  width: 100%;
  max-width: 840px;
  margin: ${({ theme }) => theme.spacings.xxl} auto
    ${({ theme }) => theme.spacings.lg};
  padding: clamp(2.2rem, 6vw, 3.6rem) clamp(1.5rem, 5vw, 2.6rem);
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.form};
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: clamp(1.1rem, 3vw, 2.1rem);
  border: ${({ theme }) => theme.borders.thick}
    ${({ theme }) => theme.colors.inputBorder};
  transition: background ${({ theme }) => theme.transition.normal},
    box-shadow ${({ theme }) => theme.transition.normal},
    border-color ${({ theme }) => theme.transition.normal};

  @media ${({ theme }) => theme.media.small} {
    max-width: 98vw;
    padding: 1.1rem 0.4rem;
    border-radius: ${({ theme }) => theme.radii.md};
    gap: 1rem;
  }
`;

export const FormGroup = styled.div`
  width: 100%;
  margin-bottom: clamp(1.1rem, 2vw, 1.7rem);

  label {
    display: block;
    margin-bottom: 0.56rem;
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    font-size: 1.1em;
    color: ${({ theme }) => theme.colors.primary};
    letter-spacings: 0.03em;
    text-shadow: 0 1px 8px #0005;
  }
`;

// --- Input ---

export const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 3px ${({ theme }) =>
    theme.colors.inputBorderFocus}, 0 2px 18px 0 #0005; }
  60% { box-shadow: 0 0 0 6px ${({ theme }) =>
    theme.colors.inputBorderFocus}cc, 0 2px 22px 0 #000a; }
  100% { box-shadow: 0 0 0 3px ${({ theme }) =>
    theme.colors.inputBorderFocus}, 0 2px 18px 0 #0005; }
`;

export const Input = styled.input<{ $hasError?: boolean }>`
  flex: 1;
  width: 100%;
  font-size: ${({ theme }) => theme.fontSizes.md};
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.colors.inputBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.main};
  font-weight: 500;
  letter-spacings: 0.01em;
  box-shadow: 0 1px 6px 0 ${({ theme }) => theme.colors.primaryTransparent};
  border: 1.5px solid
    ${({ $hasError, theme }) =>
      $hasError ? theme.colors.danger : theme.colors.inputBorder};
  transition: border-color ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast},
    background ${({ theme }) => theme.transition.fast},
    color ${({ theme }) => theme.transition.fast};

  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
    opacity: 1;
    font-style: italic;
    font-size: 0.98em;
    letter-spacings: 0.02em;
    text-shadow: none;
  }

  &:focus {
    outline: none;
    border-color: ${({ $hasError, theme }) =>
      $hasError ? theme.colors.danger : theme.colors.inputBorderFocus};
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    box-shadow: 0 0 0 2.5px ${({ theme }) => theme.colors.inputBorderFocus},
      0 2px 12px 0 ${({ theme }) => theme.colors.primaryTransparent};
  }

  @media ${({ theme }) => theme.media.small} {
    padding: 0.34em 0.6em;
    gap: 0.6rem;
  }
`;

// --- Address List & Item ---

export const AddressList = styled.div`
  width: 100%;
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.3rem;
`;

export const AddressItem = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: 1.25rem 1.5rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: ${({ theme }) => theme.borders.thick}
    ${({ theme }) => theme.colors.accent};
  box-shadow: 0 2px 18px 0 ${({ theme }) => theme.colors.primaryTransparent};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: border-color ${({ theme }) => theme.transition.fast},
    background ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryHover};
    background: ${({ theme }) => theme.colors.backgroundAlt};
    box-shadow: 0 4px 24px 0 ${({ theme }) => theme.colors.primaryTransparent};
  }
`;

export const AddressText = styled.p`
  color: ${({ theme }) => theme.colors.textAlt};
  font-size: 1.13rem;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  letter-spacings: 0.04em;
  margin: 0 0 1.15rem 0;
  word-break: break-word;
`;

// --- Misc ---

export const Description = styled.p`
  color: ${({ theme }) => theme.colors.textAlt};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: ${({ theme }) => theme.lineHeights.normal};
  opacity: 0.92;
  letter-spacings: 0.01em;
  margin-bottom: ${({ theme }) => theme.spacings.xs};
`;

export const UserInfo = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.accent};
  margin: 0;
  strong {
    color: ${({ theme }) => theme.colors.accent};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    letter-spacings: 0.01em;
    filter: brightness(1.2);
    text-shadow: 0 1.5px 8px ${({ theme }) => theme.colors.primaryTransparent};
  }
`;

export const Label = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primary};
  letter-spacings: 0.02em;
  cursor: pointer;
`;

export const Checkbox = styled.input.attrs({ type: "checkbox" })`
  accent-color: ${({ theme }) => theme.colors.primary};
  width: 1.2em;
  height: 1.2em;
  margin-right: ${({ theme }) => theme.spacings.xs};
  border-radius: ${({ theme }) => theme.radii.sm};
  box-shadow: 0 2px 6px #0002;
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.borderLight};
  transition: border-color ${({ theme }) => theme.transition.fast};

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const ImagePreview = styled.img`
  width: 148px;
  height: 148px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.circle};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
  box-shadow: 0 4px 22px 0 ${({ theme }) => theme.colors.primaryTransparent};
  border: ${({ theme }) => theme.borders.thick}
    ${({ theme }) => theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  display: block;
  margin-left: auto;
  margin-right: auto;
  transition: border-color ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast};

  &:hover,
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 6px 26px 0 ${({ theme }) => theme.colors.primaryTransparent};
  }

  @media ${({ theme }) => theme.media.small} {
    width: 110px;
    height: 110px;
  }
`;

export const FileInput = styled.input`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  background: transparent;
  border: none;
  outline: none;
  margin-bottom: ${({ theme }) => theme.spacings.xs};
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xs};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  width: 100%;
`;


export const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.colors.inputBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.main};
  font-weight: 500;
  letter-spacings: 0.01em;
  box-shadow: 0 1px 6px 0 ${({ theme }) => theme.colors.primaryTransparent};
  transition: border-color ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast},
    background ${({ theme }) => theme.transition.fast},
    color ${({ theme }) => theme.transition.fast};
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23${encodeURIComponent(
    "#000"
  )}' d='M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.2em;
  padding-right: 2.5rem;
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    box-shadow: 0 0 0 2.5px ${({ theme }) => theme.colors.inputBorderFocus},
      0 2px 12px 0 ${({ theme }) => theme.colors.primaryTransparent};
  }
  & option {
    background: ${({ theme }) => theme.colors.inputBackground};
    color: ${({ theme }) => theme.colors.text};
  }
  @media ${({ theme }) => theme.media.small} {
    padding: 0.34em 0.6em;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24'%3E%3Cpath fill='%23${encodeURIComponent(
      "#000"
    )}' d='M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1.2em;
    padding-right: 2.5rem;
    cursor: pointer;
  }
 `;