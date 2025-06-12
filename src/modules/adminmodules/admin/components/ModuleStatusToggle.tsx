"use client";

import styled from "styled-components";
import { Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
//import { getCurrentLocale } from "@/utils/getCurrentLocale";
//import { SUPPORTED_LOCALES } from "@/types/common";

interface Props {
  isActive: boolean;
  onToggle: () => void;
}

const ModuleStatusToggle: React.FC<Props> = ({ isActive, onToggle }) => {
  const { t } = useTranslation("adminModules");
  //const lang = getCurrentLocale();

  // Accessibility: Çoklu dilde tooltip/aria-label desteği
  const label = isActive
    ? t("toggleActive", "Active") // "adminModules:toggleActive"
    : t("toggleInactive", "Inactive"); // "adminModules:toggleInactive"

  return (
    <ToggleButton
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      $active={isActive}
      aria-pressed={isActive}
      aria-label={label}
      title={label}
      tabIndex={0}
    >
      {isActive ? <Check size={16} /> : <X size={16} />}
    </ToggleButton>
  );
};

export default ModuleStatusToggle;

// 🎨 Styled Components
const ToggleButton = styled.button<{ $active: boolean }>`
  background: ${({ theme, $active }) =>
    $active ? theme.colors.success : theme.colors.danger};
  color: #fff;
  border: none;
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover,
  &:focus {
    opacity: 0.85;
    outline: none;
  }
`;
