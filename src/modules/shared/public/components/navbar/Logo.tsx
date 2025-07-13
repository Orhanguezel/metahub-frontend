"use client";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales/navbar";
import { SupportedLocale } from "@/types/common";
import { useAppSelector } from "@/store/hooks";

// Type guard: value object mi? (title ve slogan içeriyor mu)
function isLogoTextValue(val: any): val is { title: any; slogan: any } {
  return (
    val &&
    typeof val === "object" &&
    "title" in val &&
    "slogan" in val
  );
}

// Her türlü image field'dan (string | array | object) güvenli logo url'si çek
function resolveLogoSrc(images: any): string {
  if (!images) return "";
  if (typeof images === "string") return images;
  if (Array.isArray(images) && images.length > 0) {
    return images[0].url || images[0].thumbnail || images[0].webp || "";
  }
  if (typeof images === "object" && images.url) return images.url;
  return "";
}

export default function Logo({ width = 60, height = 60 }: { width?: number; height?: number }) {
  const { i18n } = useI18nNamespace("navbar", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const settings = useAppSelector((state) => state.settings.settings || []);

  // 1. Logo görseli (cloudinary çoklu resim yapısı: navbar_images)
  const navbarImagesSetting = settings.find((s: any) => s.key === "navbar_images");
  const logoSrc = resolveLogoSrc(navbarImagesSetting?.images || navbarImagesSetting?.value);

  // 2. Logo metni ve sloganı (çoklu dil destekli, type safe extraction)
  const navbarLogoText = settings.find((s: any) => s.key === "navbar_logo_text");
  let title = "Logo";
  let slogan = "";

  if (isLogoTextValue(navbarLogoText?.value)) {
    title =
      navbarLogoText.value.title?.label?.[lang] ||
      navbarLogoText.value.title?.label?.en ||
      "Logo";
    slogan =
      navbarLogoText.value.slogan?.label?.[lang] ||
      navbarLogoText.value.slogan?.label?.en ||
      "";
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
        {slogan && <LogoText2>{slogan}</LogoText2>}
      </LogoTextWrapper>
    </LogoWrapper>
  );
}

// --- Styled Components ---
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
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.backgroundAlt};
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
  min-width: 0;
`;

const LogoText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const LogoText2 = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-style: italic;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.body};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;
