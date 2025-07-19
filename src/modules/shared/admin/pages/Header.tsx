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
          <HamburgerButton onClick={onToggleSidebar}>
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
        {/* Sade ve future-proof AvatarMenu */}
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
  min-height: 80px;
  background: ${({ theme }) => theme.colors.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacings.lg};
  color: ${({ theme }) => theme.colors.text};
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  @media (max-width: 768px) {
    display: block;
  }
`;

const Welcome = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.small};
  font-weight: 500;
  strong {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const LangSelect = styled.select`
  background: ${({ theme }) => theme.colors.background || "#222"};
  border: 1px solid ${({ theme }) => theme.colors.grey};
  padding: ${({ theme }) => theme.spacings.xs}
    ${({ theme }) => theme.spacings.sm};
  border-radius: 6px;
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
  option {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.background || "#222"};
  }
`;
