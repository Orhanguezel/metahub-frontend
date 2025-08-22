"use client";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/shared/locales/navbar";
import { SupportedLocale } from "@/types/common";
import { useAppSelector } from "@/store/hooks";

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

export default function NavbarLogo({
  height = 64,
  maxWidth = 200,
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
    <LogoWrapper href="/" aria-label="Home">
      {logoSrc ? (
        <LogoImgBox $h={height} $mw={maxWidth}>
          <Image
            src={logoSrc}
            alt="Ensotek Logo"
            fill
            priority
            sizes={`(max-width: 600px) 110px, ${maxWidth}px`}
            style={{ objectFit: "contain" }} // oran korunur
          />
        </LogoImgBox>
      ) : (
        <Fallback style={{ height }}>{/* fallback */}</Fallback>
      )}
      {slogan && <LogoSlogan>{slogan}</LogoSlogan>}
    </LogoWrapper>
  );
}

/* --- styled --- */

const LogoWrapper = styled(Link)`
  display: inline-flex;          /* yüzdeye göre genişleyip uzamasın */
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  text-decoration: none;
  background: transparent;
  min-width: 0;
`;

const LogoImgBox = styled.div<{ $h: number; $mw: number }>`
  position: relative;
  width: ${({ $mw }) => $mw}px;      /* en fazla bu kadar genişler */
  height: ${({ $h }) => $h}px;       /* navbar yüksekliği */
  max-width: 100%;
  overflow: hidden;                  /* taşma yok */
  background: transparent;
  line-height: 0;                    /* küçük sapmaları engeller */

  @media (max-width: 600px) {
    width: 110px;                    /* mobilde daha dar */
    height: 38px;                    /* ve daha alçak */
  }
`;

const Fallback = styled.div`
  height: 64px;
  min-width: 32px;
  background: transparent;
  @media (max-width: 600px) {
    height: 38px;
    min-width: 24px;
  }
`;

const LogoSlogan = styled.span`
  margin-top: 2px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.secondary};
  font-family: ${({ theme }) => theme.fonts.body};
  font-style: italic;
  font-weight: ${({ theme }) => theme.fontWeights.light};
  text-align: center;
  letter-spacing: 0.01em;
  line-height: 1.2;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;

  @media (max-width: 600px) {
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
    max-width: 75vw;
  }
`;
