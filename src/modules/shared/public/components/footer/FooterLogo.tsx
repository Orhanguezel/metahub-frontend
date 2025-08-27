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

export default function FooterLogo({
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
      {/* Slogan logonun hemen altında */}
      {slogan && <LogoSlogan>{slogan}</LogoSlogan>}
      {/* Title sloganın altında, asla kesilmez */}
      {title && <LogoTitle>{title}</LogoTitle>}
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
  max-width: 180px;
  @media (max-width: 600px) {
    max-width: 48vw;
    min-width: 70px;
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
  margin-top: 14px;
  font-size: clamp(0.85rem, 1.5vw, 1.05rem);
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.body};
  font-style: italic;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-align: center;
  line-height: 1.14;
  width: 100%;
  max-width: 450px;
  padding: 0 4px;
  @media (max-width: 600px) {
    max-width: 96vw;
    margin-top: 10px;
    font-size: clamp(0.81rem, 3.6vw, 0.99rem);
  }
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
`;


const LogoTitle = styled.span`
  display: block;
  font-size: clamp(1.5rem, 3vw, 2.6rem);
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  text-align: center;
  line-height: 1.13;
  margin-top: 22px;
  max-width: 700px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  white-space: normal;           // <--- Sadece bu!
  overflow-wrap: anywhere;       // <--- DENE! break-word yerine anywhere
  word-break: normal;
`;






