"use client";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales/navbar";
import { SupportedLocale } from "@/types/common";
import { useAppSelector } from "@/store/hooks";

// Slogan extraction
function isLogoTextValue(val: any): val is { title: any; slogan: any } {
  return val && typeof val === "object" && ("slogan" in val || "title" in val);
}
function resolveLogoSrc(images: any): string {
  if (!images) return "";
  if (typeof images === "string") return images;
  if (Array.isArray(images) && images.length > 0) {
    return images[0].url || images[0].thumbnail || images[0].webp || "";
  }
  if (typeof images === "object" && images.url) return images.url;
  return "";
}

export default function Logo({
  height = 250,
  maxWidth = 330,
}: {
  height?: number;
  maxWidth?: number;
}) {
  const { i18n } = useI18nNamespace("navbar", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const settings = useAppSelector((state) => state.settings.settings || []);
  const navbarImagesSetting = settings.find((s: any) => s.key === "navbar_images");
  const logoSrc = resolveLogoSrc(navbarImagesSetting?.images || navbarImagesSetting?.value);
  const navbarLogoText = settings.find((s: any) => s.key === "navbar_logo_text");

  let title = "";
let slogan = "";
  if (isLogoTextValue(navbarLogoText?.value)) {
    title =
      navbarLogoText.value.title?.label?.[lang] ||
      navbarLogoText.value.title?.label?.en ||
      "";
    slogan =
      navbarLogoText.value.slogan?.label?.[lang] ||
      navbarLogoText.value.slogan?.label?.en ||
      "";
  }

  return (
    <LogoWrapper href="/">
  {logoSrc ? (
    <LogoImgBox>
      <Image
        src={logoSrc}
        alt={title || "Ensotek Logo"}
        width={maxWidth}
        height={height}
        style={{
          width: "auto",
          height: `${height}px`,
          maxWidth: `${maxWidth}px`,
          minWidth: "32px",
          objectFit: "contain",
          background: "transparent",
          border: "none",
          borderRadius: 0,
          display: "block",
        }}
        priority
      />
    </LogoImgBox>
  ) : (
    <Fallback style={{ height }}>{/* fallback */}</Fallback>
  )}
  {title && <LogoTitle>{title}</LogoTitle>}
  {slogan && <LogoSlogan>{slogan}</LogoSlogan>}
</LogoWrapper>
  );
}

// --- Styled Components ---



const LogoImgBox = styled.div`
  padding: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.primaryTransparent};
  transition: box-shadow 0.3s, background 0.3s;

  /* Mobilde padding daha küçük */
  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacings.xs};
    margin-bottom: ${({ theme }) => theme.spacings.sm};
  }
`;

const Fallback = styled.div`
  height: 180px;
  min-width: 120px;
  background: transparent;
`;

const LogoSlogan = styled.span`
  margin-top: 0.15em;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.body};
  font-style: italic;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-align: center;
  letter-spacing: 0.01em;
  line-height: 1.28;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  opacity: 0.92;
  transition: color 0.25s, opacity 0.25s;

  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
    max-width: 90vw;
  }
`;
const LogoTitle = styled.span`
  margin-top: -10px;
  font-size: ${({ theme }) => theme.fontSizes.xlarge};
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primaryDark};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.015em;
  line-height: 1.08;
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  transition: color 0.2s;

  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    max-width: 90vw;
  }
`;

const LogoWrapper = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1em;
  text-decoration: none;
  background: transparent;
  min-width: 110px;
  padding: 0;
  margin: 0;

  &:hover,
  &:focus-visible {
    text-decoration: none;
    outline: none;

    /* Logo'ya parlama ve shadow efekti */
    ${LogoImgBox} {
      box-shadow: 0 4px 24px ${({ theme }) => theme.colors.primaryTransparent};
      background: linear-gradient(
        90deg,
        ${({ theme }) => theme.colors.primaryTransparent} 0%,
        ${({ theme }) => theme.colors.footerBackground} 100%
      );
      border-radius: ${({ theme }) => theme.radii.md};
    }
    ${LogoSlogan} {
      color: ${({ theme }) => theme.colors.primary};
      opacity: 1;
    }
  }
`;

