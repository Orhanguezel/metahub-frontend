"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { getImageSrc } from "@/shared/getImageSrc";
import { useThemeContext } from "@/providers/ThemeProviderWrapper";

function extractLogoUrl(val: any): string | undefined {
  if (!val) return undefined;
  if (typeof val === "string") return getImageSrc(val, "setting");
  if (typeof val === "object") {
    if (val.url && typeof val.url === "string")
      return getImageSrc(val.url, "setting");
    // Eğer doğrudan string property varsa
    const maybeString = Object.values(val).find((v) => typeof v === "string");
    if (maybeString) return getImageSrc(maybeString, "setting");
  }
  return undefined;
}

function resolveLogoSrc(
  value: any,
  themeMode: "light" | "dark" | undefined
): string {
  if (!value) return "";
  if (typeof value === "string") return getImageSrc(value, "setting");
  if (typeof value === "object") {
    const light = extractLogoUrl(value.light);
    const dark = extractLogoUrl(value.dark);
    if (themeMode === "dark") return dark || light || "";
    else return light || dark || "";
  }
  return "";
}

export default function FooterLogo() {
  const { settings } = useAppSelector((state) => state.setting);
  const { mode: themeMode } = useThemeContext();

  const footerLogos = settings.find((s) => s.key === "footer_logos");
  const logoSrc = resolveLogoSrc(footerLogos?.value, themeMode);

  if (!logoSrc) return null;

  return (
    <LogoWrapper>
      <LogoImg src={logoSrc} alt="Footer Logo" loading="lazy" />
    </LogoWrapper>
  );
}

const LogoWrapper = styled.div`
  margin: ${({ theme }) => theme.spacings.lg} 0
    ${({ theme }) => theme.spacings.md};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LogoImg = styled.img`
  max-width: 140px;
  height: auto;
  display: block;
  margin: 0 auto;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  @media (max-width: 600px) {
    max-width: 110px;
    padding: 8px;
  }
`;
