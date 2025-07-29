"use client";
import React, { useState, ChangeEvent } from "react";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/shared/locales/header";
import { ThemeToggle, AvatarMenu } from "@/modules/shared";
import { FaBars } from "react-icons/fa";
import { SUPPORTED_LOCALES } from "@/i18n";

function getLocaleLabel(locale: string): string {
  return SUPPORTED_LOCALES.includes(locale as any)
    ? locale.toUpperCase()
    : locale;
}

type HeaderAdminProps = {
  onToggleSidebar?: () => void;
};

const HeaderAdmin: React.FC<HeaderAdminProps> = ({ onToggleSidebar }) => {
  const { profile: user } = useAppSelector((state) => state.account);
  const { i18n, t } = useI18nNamespace("header", translations);
  const [showDropdown, setShowDropdown] = useState(false);

  // Dil değiştirici
  const handleLangChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = e.target.value as (typeof SUPPORTED_LOCALES)[number];
    i18n.changeLanguage(selectedLang);
  };

  return (
    <HeaderWrapper>
      <LeftSection>
        {onToggleSidebar && (
          <HamburgerButton onClick={onToggleSidebar} aria-label="Open Sidebar">
            <FaBars />
          </HamburgerButton>
        )}
        <Welcome>
          👋 {t("welcome", "Hoş geldiniz")},{" "}
          <strong>{user?.name || t("defaultUser", "Admin")}</strong>
        </Welcome>
      </LeftSection>
      <RightSection>
        <LangSelect
          value={i18n.language}
          onChange={handleLangChange}
          aria-label={t("selectLanguage", "Dil Seç")}
        >
          {SUPPORTED_LOCALES.map((locale) => (
            <option key={locale} value={locale}>
              {getLocaleLabel(locale)}
            </option>
          ))}
        </LangSelect>
        <ThemeToggle />
        <AvatarMenu
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
        />
      </RightSection>
    </HeaderWrapper>
  );
};

export default HeaderAdmin;

// --- Styled Components ---

const HeaderWrapper = styled.header`
  width: 100%;
  min-height: 72px;
  background: ${({ theme }) => theme.colors.primaryLight};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacings.xl};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.main};
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  box-shadow: ${({ theme }) => theme.shadows.sm};

  ${({ theme }) => theme.media.small} {
    padding: 0 ${({ theme }) => theme.spacings.md};
    min-height: 62px;
  }
  ${({ theme }) => theme.media.xsmall} {
    padding: 0 ${({ theme }) => theme.spacings.sm};
    min-height: 54px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.md};

  ${({ theme }) => theme.media.small} {
    gap: ${({ theme }) => theme.spacings.sm};
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.lg};

  ${({ theme }) => theme.media.small} {
    gap: ${({ theme }) => theme.spacings.md};
  }
  ${({ theme }) => theme.media.xsmall} {
    gap: ${({ theme }) => theme.spacings.sm};
  }
`;

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};

  ${({ theme }) => theme.media.small} {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${({ theme }) => theme.spacings.xs};
    margin-right: ${({ theme }) => theme.spacings.sm};
  }
`;

const Welcome = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text};

  strong {
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    color: ${({ theme }) => theme.colors.primary};
    margin-left: 2px;
  }

  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
  ${({ theme }) => theme.media.xsmall} {
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
  }
`;

const LangSelect = styled.select`
  background: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  padding: ${({ theme }) => theme.spacings.xs} ${({ theme }) => theme.spacings.md};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.text};
  transition: border-color ${({ theme }) => theme.transition.normal};
  cursor: pointer;
  outline: none;

  &:hover,
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
  option {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.inputBackground};
  }

  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    padding: ${({ theme }) => theme.spacings.xs} ${({ theme }) => theme.spacings.sm};
  }
`;

