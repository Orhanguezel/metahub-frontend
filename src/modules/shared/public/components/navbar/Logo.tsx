"use client";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales/navbar";
import { SupportedLocale } from "@/types/common";
import { useAppSelector } from "@/store/hooks";

// Slogan extraction
function isLogoTextValue(val: any): val is { slogan: any } {
  return val && typeof val === "object" && "slogan" in val;
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
  height = 44,
  maxWidth = 130,
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

  let slogan = "";
  if (isLogoTextValue(navbarLogoText?.value)) {
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
            alt="Ensotek Logo"
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
        <Fallback style={{ height }}>{/* fallback kullanılmazsa logoyu yüklemez */}</Fallback>
      )}
      {slogan && <LogoSlogan>{slogan}</LogoSlogan>}
    </LogoWrapper>
  );
}

// --- Styled Components ---
const LogoWrapper = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.14em;
  text-decoration: none;
  background: transparent;
  min-width: 0;
  padding: 0;
  margin: 0;

  &:hover, &:focus-visible {
    text-decoration: none;
  }
`;

const LogoImgBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  padding: 0;
  margin: 0;
  height: auto;
`;

const Fallback = styled.div`
  height: 44px;
  min-width: 32px;
  background: transparent;
`;

const LogoSlogan = styled.span`
  margin-top: 3px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.secondary};
  font-family: ${({ theme }) => theme.fonts.body};
  font-style: italic;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-align: center;
  letter-spacing: 0.01em;
  line-height: 1.25;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  @media (max-width: 600px) {
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
    max-width: 80vw;
  }
`;
