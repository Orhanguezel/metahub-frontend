"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { getImageSrc } from "@/utils/getImageSrc";
import { useThemeContext } from "@/providers/ThemeProviderWrapper";

export default function FooterLogo() {
  const { settings } = useAppSelector((state) => state.setting);
  const { mode: themeMode } = useThemeContext();

  const footerLogos = settings.find((s) => s.key === "footer_logos");

  let logoSrc = "";
  if (footerLogos?.value && typeof footerLogos.value === "object") {
    const val = footerLogos.value as { light?: string; dark?: string };
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

  if (!logoSrc) return null;

  return (
    <LogoWrapper>
      <LogoImg src={logoSrc} alt="Footer Logo" />
    </LogoWrapper>
  );
}

// 🎨 Styled Components
const LogoWrapper = styled.div`
  margin: ${({ theme }) => theme.spacing.md} 0;
`;

const LogoImg = styled.img`
  max-width: 150px;
  height: auto;
  display: block;
  margin: 0 auto;
`;
