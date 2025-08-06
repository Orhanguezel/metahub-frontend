"use client";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/shared/locales/navbar";
import { SupportedLocale } from "@/types/common";
import { useAppSelector } from "@/store/hooks";

function isLogoTextValue(val: any): val is { title?: any; slogan: any } {
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
  height = 264,
  maxWidth = 400,
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
            sizes={`${maxWidth}px`}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: `${height}px`,
              maxWidth: `${maxWidth}px`,
              objectFit: "contain",
              background: "transparent",
              display: "block",
            }}
            priority
          />
        </LogoImgBox>
      ) : (
        <Fallback style={{ height }} />
      )}
      {/* Title aşağıda */}
      {title && <LogoTitle>{title}</LogoTitle>}
      {slogan && <LogoSlogan>{slogan}</LogoSlogan>}
    </LogoWrapper>
  );
}

// --- Styled Components ---
const LogoWrapper = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.08em;
  text-decoration: none;
  background: transparent;
  min-width: 0;
  padding: 0;
  margin: 0;
  width: 100%;
  max-width: 220px;
  @media (max-width: 600px) {
    max-width: 130px;
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
  width: 100%;
  max-width: 200px;
  @media (max-width: 600px) {
    max-width: 110px;
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

const LogoTitle = styled.span`
  margin-top: 3px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primaryDark};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-align: center;
  letter-spacing: 0.01em;
  line-height: 1.13;
  white-space: nowrap;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  @media (max-width: 600px) {
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
    max-width: 80vw;
  }
`;

const LogoSlogan = styled.span`
  margin-top: 0.5px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.secondary};
  font-family: ${({ theme }) => theme.fonts.body};
  font-style: italic;
  font-weight: ${({ theme }) => theme.fontWeights.light};
  text-align: center;
  letter-spacing: 0.01em;
  line-height: 1.2;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 160px;
  @media (max-width: 600px) {
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
    max-width: 80vw;
  }
`;
