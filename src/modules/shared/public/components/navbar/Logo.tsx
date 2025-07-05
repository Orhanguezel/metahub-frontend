import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import { getImageSrc } from "@/shared/getImageSrc";
import { useThemeContext } from "@/providers/ThemeProviderWrapper";

function resolveLogoSrc(
  value: any,
  themeMode: "light" | "dark" | undefined
): string {
  if (!value) return "";

  if (typeof value === "string") return getImageSrc(value, "setting");
  if (typeof value === "object") {
    // Cloudinary gibi: {light: {url}, dark: {url}}
    const light = value.light?.url || value.light;
    const dark = value.dark?.url || value.dark;
    if (themeMode === "dark")
      return dark
        ? getImageSrc(dark, "setting")
        : light
        ? getImageSrc(light, "setting")
        : "";
    return light
      ? getImageSrc(light, "setting")
      : dark
      ? getImageSrc(dark, "setting")
      : "";
  }

  return "";
}

export default function Logo({
  width = 60,
  height = 60,
}: {
  width?: number;
  height?: number;
}) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const { settings = [] } = useAppSelector((state) => state.setting || {});
  const { mode: themeMode } = useThemeContext();

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

  // Modern: resolveLogoSrc ile hem Cloudinary hem eski string hem yeni object desteği!
  const logoSrc = resolveLogoSrc(navbarLogos?.value, themeMode);

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
  gap: ${({ theme }) => theme.spacings.xs};
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
