"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";

import {
  FooterLogo,
  FooterContact,
  FooterSocialLinks,
  FooterCopyright,
  FooterLinks, 
  
} from "@/modules/shared";
import {LinkItem } from "@/modules/shared/public/components/footer/FooterLinks";

import { useTranslation } from "react-i18next";
import { getImageSrc } from "@/utils/getImageSrc";
import { useMemo } from "react";
import {Loading} from "@/shared";
import { SocialLinks } from "@/types/SocialLinks";

interface SettingItem {
  key: string;
  value: any;
}

type MultiLangValue = {
  tr?: string;
  en?: string;
  de?: string;
  [key: string]: string | undefined;
};

export default function FooterSection() {
  const rawSettings = useAppSelector((state) => state.setting.settings);
  const settings = useMemo(
    () => rawSettings ?? ([] as SettingItem[]),
    [rawSettings]
  );
  const { i18n, t } = useTranslation("footer");
  const currentLang = i18n.language || "tr";

  const getLocalizedValue = (value: any): string | undefined => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const obj = value as MultiLangValue;
      return obj[currentLang]?.trim() || obj.tr?.trim() || "";
    }
    if (typeof value === "string") {
      return value.trim();
    }
    return undefined;
  };

  // ✅ Logo
  const logoRaw = settings.find((s) => s.key === "footer_logo")?.value;
  const logoFileName = getLocalizedValue(logoRaw);
  const logo = getImageSrc(logoFileName, "setting");

  // ✅ Hakkımızda Linkleri
  const aboutLinksRaw = settings.find(
    (s) => s.key === "footer_about_links"
  )?.value;
  const aboutLinks: LinkItem[] =
    aboutLinksRaw && typeof aboutLinksRaw === "object"
      ? Object.entries(aboutLinksRaw).map(([key, val]) => {
          const label =
            val?.label?.[currentLang]?.trim() || val?.label?.tr?.trim() || key;
          const href = val?.url?.trim() || "#";
          return { label, href };
        })
      : [];

  // ✅ Hizmetler Linkleri (çok dilli format)
  const servicesLinksRaw = settings.find(
    (s) => s.key === "footer_services_links"
  )?.value;
  const servicesLinks: LinkItem[] =
    servicesLinksRaw && typeof servicesLinksRaw === "object"
      ? Object.entries(servicesLinksRaw).map(([key, val]) => {
          const label =
            val?.label?.[currentLang]?.trim() || val?.label?.tr?.trim() || key;
          const href = val?.url?.trim() || "#";
          return { label, href };
        })
      : [];

  // ✅ İletişim Bilgileri
  const footerContactRaw = settings.find(
    (s) => s.key === "footer_contact"
  )?.value;
  const contactInfo: Record<string, string> =
    footerContactRaw && typeof footerContactRaw === "object"
      ? Object.fromEntries(
          Object.entries(footerContactRaw)
            .map(([key, val]) => {
              const normalizedKey = key.trim().toLowerCase();
              const url = getLocalizedValue(val);
              if (url) return [normalizedKey, url] as [string, string];
              return undefined;
            })
            .filter((entry): entry is [string, string] => Boolean(entry))
        )
      : {};

  // ✅ Sosyal Linkler
  const socialLinksRaw = settings.find((s) => s.key === "footer_social_links")
    ?.value as Record<string, { url: string; icon: string }> | undefined;

  const socialLinks: SocialLinks | undefined = socialLinksRaw
    ? Object.keys(socialLinksRaw).reduce((acc, key) => {
        const val = socialLinksRaw[key];
        const normalizedKey = key.trim().toLowerCase();
        if (val?.url) {
          acc[normalizedKey as keyof SocialLinks] = val.url;
        }
        return acc;
      }, {} as SocialLinks)
    : undefined;

  // ✅ Copyright
  const rightsTextRaw = settings.find((s) => s.key === "footer_rights")?.value;
  const rightsText = getLocalizedValue(rightsTextRaw);

  if (!Array.isArray(settings) || settings.length === 0) {
    return (
      <FooterWrapper>
        <Loading />
      </FooterWrapper>
    );
  }

  return (
    <FooterWrapper>
      {logo && <FooterLogo/>}
      <FooterContent>
        {aboutLinks.length > 0 && (
          <FooterLinks title={t("aboutUs")} links={aboutLinks} />
        )}
        {Object.keys(contactInfo).length > 0 && (
          <FooterContact contactInfo={contactInfo} />
        )}
        {servicesLinks.length > 0 && (
          <FooterLinks title={t("ourServices")} links={servicesLinks} />
        )}
      </FooterContent>
      {socialLinks && Object.keys(socialLinks).length > 0 && (
        <FooterSocialLinks links={socialLinks} />
      )}
      <FooterCopyright rightsText={rightsText} />
    </FooterWrapper>
  );
}

// 🎨 Styled Components
const FooterWrapper = styled.footer`
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  border-top: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  width: 100%;

  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacing.md}
      ${({ theme }) => theme.spacing.sm};
  }
`;

const FooterContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  text-align: left;
  margin-top: ${({ theme }) => theme.spacing.lg};
  width: 100%;
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin-left: auto;
  margin-right: auto;

  ${({ theme }) => theme.media.small} {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;
