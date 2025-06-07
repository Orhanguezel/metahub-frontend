"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/modules/shared";
import { AvatarMenu } from "@/modules/shared";
import { useState } from "react";
import { getImageSrc } from "@/shared/getImageSrc";
import { FaBars } from "react-icons/fa";

type HeaderProps = {
  onToggleSidebar?: () => void;
  onClose?: () => void;
};

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { profile: user } = useAppSelector((state) => state.account);
  const settings = useAppSelector((state) => state.setting.settings) || [];
  const { t, i18n } = useTranslation("header");

  const apiKeySetting = settings.find((s: any) => s.key === "api_key");
  const hasApiKey = !!apiKeySetting?.value;

  const [showDropdown, setShowDropdown] = useState(false);

  const resolvedProfileImage = (() => {
    if (!user?.profileImage) return "/default-avatar.png";

    // Eğer yeni nesil obje ise
    if (typeof user.profileImage === "object" && user.profileImage !== null) {
      // Tercihen thumbnail > url > fallback
      if (user.profileImage.thumbnail?.startsWith("http"))
        return user.profileImage.thumbnail;
      if (user.profileImage.url?.startsWith("http"))
        return user.profileImage.url;
      // Local fallback ("/uploads/...")
      if (user.profileImage.thumbnail?.startsWith("/"))
        return getImageSrc(user.profileImage.thumbnail, "profile");
      if (user.profileImage.url?.startsWith("/"))
        return getImageSrc(user.profileImage.url, "profile");
      return "/default-avatar.png";
    }

    // Eğer string ise (legacy)
    if (typeof user.profileImage === "string") {
      if (user.profileImage.trim() === "") return "/default-avatar.png";
      if (user.profileImage.startsWith("http")) return user.profileImage;
      return getImageSrc(user.profileImage, "profile");
    }

    return "/default-avatar.png";
  })();

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
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
        {hasApiKey && (
          <ApiKeyInfo>
            ✅ {t("apiKeyLoaded", "API Key başarıyla yüklendi.")}
          </ApiKeyInfo>
        )}
      </LeftSection>

      <RightSection>
        <LangSelect value={i18n.language} onChange={handleLangChange}>
          <option value="de">DE</option>
          <option value="en">EN</option>
          <option value="tr">TR</option>
        </LangSelect>
        <ThemeToggle />
        <AvatarMenu
          isAuthenticated={!!user}
          profileImage={resolvedProfileImage}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
        />
      </RightSection>
    </HeaderWrapper>
  );
}

const HeaderWrapper = styled.header`
  width: 100%;
  min-height: 80px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-bottom: ${({ theme }) =>
    `${theme.borders.thin} ${theme.colors.border}`};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text};
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
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
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};

  strong {
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ApiKeyInfo = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.success};
`;

const LangSelect = styled.select`
  background: ${({ theme }) => theme.inputs.background};
  border: ${({ theme }) => `${theme.borders.thin} ${theme.colors.border}`};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.inputs.text};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  option {
    color: ${({ theme }) => theme.inputs.text};
    background: ${({ theme }) => theme.inputs.background};
  }
`;
