"use client";
import React from "react";
import styled, { keyframes } from "styled-components";
import { Check, X } from "lucide-react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales";

// Props tipi
interface ModuleStatusToggleProps {
  isActive: boolean;
  onToggle: (
    e:
      | React.MouseEvent<HTMLButtonElement>
      | React.KeyboardEvent<HTMLButtonElement>
  ) => void;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
}

// loading ve disabled destekli toggle
const ModuleStatusToggle: React.FC<ModuleStatusToggleProps> = ({
  isActive,
  onToggle,
  disabled = false,
  loading = false,
  title,
}) => {
  const { t } = useI18nNamespace("adminModules", translations);
  const label = isActive
    ? t("toggleActive", "Active")
    : t("toggleInactive", "Inactive");

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!disabled && !loading && typeof onToggle === "function") onToggle(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled && !loading) {
      e.preventDefault();
      if (typeof onToggle === "function") onToggle(e);
    }
  };

  return (
    <ToggleButton
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      $active={isActive}
      aria-pressed={isActive}
      aria-label={label}
      title={title}
      tabIndex={0}
      type="button"
      disabled={disabled || loading}
    >
      {loading ? (
        <Spinner />
      ) : isActive ? (
        <>
          <Check size={16} />
          <span className="label">{label}</span>
        </>
      ) : (
        <>
          <X size={16} />
          <span className="label">{label}</span>
        </>
      )}
    </ToggleButton>
  );
};

export default ModuleStatusToggle;

// --- Spinner (minik loading animasyonu) ---
const spin = keyframes`
  to { transform: rotate(360deg); }
`;
const Spinner = styled.span`
  width: 16px;
  height: 16px;
  border: 2px solid #fff6;
  border-top: 2px solid #fff;
  border-radius: 50%;
  display: inline-block;
  animation: ${spin} 0.8s linear infinite;
`;

// --- Styled Components ---
const ToggleButton = styled.button<{ $active: boolean }>`
  background: ${({ theme, $active }) =>
    $active ? theme.colors.success : theme.colors.danger};
  color: #fff;
  border: none;
  padding: 4px 10px 4px 6px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  min-width: 68px;
  transition: background 0.16s, opacity 0.16s;
  .label {
    font-weight: 500;
    font-size: ${({ theme }) => theme.fontSizes.xs};
    letter-spacing: 0.01em;
    user-select: none;
  }
  &:hover,
  &:focus {
    opacity: 0.85;
    outline: none;
  }
`;
