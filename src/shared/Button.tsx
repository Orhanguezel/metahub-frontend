"use client";
import React from "react";
import styled, { css } from "styled-components";

export type Variant = "primary" | "outline" | "danger" | "ghost";
export type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: React.ReactNode;
}

const StyledButton = styled.button<{
  $variant: Variant;
  $size: Size;
  $loading: boolean;
}>`
  width: fit-content;
  min-width: 120px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: ${({ theme, $size }) =>
    $size === "sm"
      ? `${theme.spacings.xs} ${theme.spacings.md}`
      : $size === "lg"
      ? `${theme.spacings.md} ${theme.spacings.xxl}`
      : `${theme.spacings.sm} ${theme.spacings.xl}`};

  font-size: ${({ theme, $size }) =>
    $size === "sm"
      ? theme.fontSizes.sm
      : $size === "lg"
      ? theme.fontSizes.lg
      : theme.fontSizes.md};

  border-radius: ${({ theme }) => theme.radii.pill};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: all ${({ theme }) => theme.transition.normal};
  cursor: ${({ $loading, disabled }) => ($loading || disabled ? "not-allowed" : "pointer")};
  opacity: ${({ theme, $loading, disabled }) =>
    $loading || disabled ? theme.opacity.disabled : 1};

  ${({ theme, $variant }) =>
    $variant === "danger"
      ? css`
          background: ${theme.buttons.danger.background};
          color: ${theme.buttons.danger.text};
          border: ${theme.borders.thin} ${theme.colors.danger};
          &:hover,
          &:focus {
            background: ${theme.buttons.danger.backgroundHover};
            color: ${theme.buttons.danger.textHover};
            border-color: ${theme.colors.dangerHover};
            box-shadow: ${theme.shadows.md};
          }
        `
      : $variant === "outline"
      ? css`
          background: transparent;
          color: ${theme.colors.primary};
          border: ${theme.borders.thin} ${theme.colors.primary};
          &:hover,
          &:focus {
            background: ${theme.colors.primaryTransparent};
            color: ${theme.colors.primaryHover};
            border-color: ${theme.colors.primaryHover};
            box-shadow: ${theme.shadows.sm};
          }
        `
      : $variant === "ghost"
      ? css`
          background: transparent;
          color: ${theme.colors.primary};
          border: none;
          &:hover,
          &:focus {
            background: ${theme.colors.primaryTransparent};
            color: ${theme.colors.primaryHover};
          }
        `
      : css`
          background: ${theme.buttons.primary.background};
          color: ${theme.buttons.primary.text};
          border: ${theme.borders.thin} ${theme.colors.primary};
          &:hover,
          &:focus {
            background: ${theme.buttons.primary.backgroundHover};
            color: ${theme.buttons.primary.textHover};
            border-color: ${theme.colors.primaryHover};
            box-shadow: ${theme.shadows.md};
          }
        `}

  &:disabled {
    pointer-events: none;
    box-shadow: none;
    border-color: ${({ theme }) => theme.colors.disabledBg};
    opacity: ${({ theme }) => theme.opacity.disabled};
    background: ${({ theme, $variant }) =>
      $variant === "outline" || $variant === "ghost"
        ? theme.colors.backgroundSecondary
        : theme.colors.disabledBg};
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  disabled,
  ...props
}) => (
  <StyledButton
    type="button"
    $variant={variant}
    $size={size}
    $loading={!!loading}
    disabled={disabled || loading}
    {...props}
  >
    {loading && (
      <span
        style={{
          width: "1.1em",
          height: "1.1em",
          border: "2px solid currentColor",
          borderRightColor: "transparent",
          borderRadius: "50%",
          display: "inline-block",
          animation: "spin 0.8s linear infinite",
        }}
      />
    )}
    {children}
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </StyledButton>
);

export default Button;
