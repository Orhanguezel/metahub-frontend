// modules/shared/public/components/footer/FooterLogo.tsx
"use client";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales/footer";
import { SupportedLocale } from "@/types/common";

function resolveLogoSrc(images: any): string {
  if (!images) return "";
  if (typeof images === "string") return images;
  if (Array.isArray(images) && images.length > 0) {
    return images[0].url || images[0].thumbnail || images[0].webp || "";
  }
  if (typeof images === "object" && images.url) return images.url;
  return "";
}

function isLogoTextValue(val: any): val is { title: any; slogan: any } {
  return val && typeof val === "object" && "title" in val;
}

export default function FooterLogo({ width = 120, height = 120 }: { width?: number; height?: number }) {
   const { i18n } = useI18nNamespace("footer", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const settings = useAppSelector((state) => state.settings.settings || []);
  const navbarImagesSetting = settings.find((s: any) => s.key === "navbar_images");
  const footerImagesSetting = settings.find((s: any) => s.key === "footer_images");
  const logoSrc =
    resolveLogoSrc(navbarImagesSetting?.images || navbarImagesSetting?.value) ||
    resolveLogoSrc(footerImagesSetting?.images || footerImagesSetting?.value);

  const navbarLogoText = settings.find((s: any) => s.key === "navbar_logo_text");
  const footerLogoText = settings.find((s: any) => s.key === "footer_logo_text");
  let title = "Logo";
  let slogan = "";

  const logoTextValue =
    (navbarLogoText && isLogoTextValue(navbarLogoText.value) && navbarLogoText.value) ||
    (footerLogoText && isLogoTextValue(footerLogoText.value) && footerLogoText.value);

  if (logoTextValue) {
    title =
      logoTextValue.title?.label?.[lang] ||
      logoTextValue.title?.label?.en ||
      "Logo";
    slogan =
      logoTextValue.slogan?.label?.[lang] ||
      logoTextValue.slogan?.label?.en ||
      "";
  }

  return (
    <FooterLogoCol>
      {logoSrc ? (
        <LogoImageLink href="/">
          <FooterLogoImage
            src={logoSrc}
            alt={title}
            width={width}
            height={height}
            priority
          />
        </LogoImageLink>
      ) : (
        <FooterFallback>{title}</FooterFallback>
      )}
      <FooterLogoText>{title}</FooterLogoText>
      {slogan && <FooterLogoSlogan>{slogan}</FooterLogoSlogan>}
    </FooterLogoCol>
  );
}

// --- Styles ---
const FooterLogoCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto ${({ theme }) => theme.spacings.lg} auto;
  text-decoration: none;
`;

const LogoImageLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FooterLogoImage = styled(Image)`
  height: 120px;
  width: auto;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  margin: ${({ theme }) => theme.spacings.sm} 0;
`;

const FooterFallback = styled.div`
  width: 120px;
  height: 120px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  border-radius: ${({ theme }) => theme.radii.md};
  margin: ${({ theme }) => theme.spacings.sm} 0;
`;

const FooterLogoText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-top: ${({ theme }) => theme.spacings.xs};
`;

const FooterLogoSlogan = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-style: italic;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.body};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  margin-top: ${({ theme }) => theme.spacings.xs};
  white-space: pre-line;
`;
