"use client";

import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import { getImageSrc } from "@/utils/getImageSrc";
import { useThemeContext } from "@/providers/ThemeProviderWrapper";

export function Logo({ width = 60, height = 60 }: { width?: number; height?: number }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const { settings = [] } = useAppSelector((state) => state.setting || {});
  const { mode: themeMode } = useThemeContext();

  // ✅ Null-safe
  const navbarLogos = settings.find((s) => s.key === "navbar_logos");
  const navbarLogoSetting = settings.find((s) => s.key === "navbar_logo_text");

  const title =
    (navbarLogoSetting?.value &&
      typeof navbarLogoSetting.value === "object" &&
      "title" in navbarLogoSetting.value &&
      (navbarLogoSetting.value as any).title?.[currentLang]) ||
    "Logo";

  const slogan =
    (navbarLogoSetting?.value &&
      typeof navbarLogoSetting.value === "object" &&
      "slogan" in navbarLogoSetting.value &&
      (navbarLogoSetting.value as any).slogan?.[currentLang]) ||
    "";

  // ✅ Logo src (light/dark)
  let logoSrc = "";
  if (navbarLogos?.value && typeof navbarLogos.value === "object") {
    const val = navbarLogos.value as { light?: string; dark?: string };
    logoSrc =
      themeMode === "dark"
        ? val.dark
          ? getImageSrc(val.dark, "setting")
          : val.light
          ? getImageSrc(val.light, "setting")
          : ""
        : val.light
        ? getImageSrc(val.light, "setting")
        : val.dark
        ? getImageSrc(val.dark, "setting")
        : "";
  }

  return (
    <LogoWrapper href="/">
      {logoSrc ? (
        <LogoImage
          src={logoSrc}
          alt={title}
          width={width}
          height={height}
          priority
        />
      ) : (
        <Fallback>{title}</Fallback>
      )}
      <LogoTextWrapper>
        <LogoText>{title}</LogoText>
        <LogoText2>{slogan}</LogoText2>
      </LogoTextWrapper>
    </LogoWrapper>
  );
}

// 🎨 Styled Components
const LogoWrapper = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  text-decoration: none;
`;

const LogoImage = styled(Image)`
  height: 60px;
  width: auto;
  object-fit: contain;
`;

const Fallback = styled.div`
  width: 60px;
  height: 60px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
`;

const LogoTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const LogoText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
`;

const LogoText2 = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-style: italic;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.body};
`;
