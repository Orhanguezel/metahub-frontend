"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import {
  FooterLogo,
  FooterSocialLinks,
  FooterCopyright,
  FooterLinks,
  FooterCompanyInfo,
} from "@/modules/shared";
import { LinkItem } from "@/modules/shared/public/components/footer/FooterLinks";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { Loading } from "@/shared";
import { SocialLinks } from "@/types/SocialLinks";

function getLocalizedValue(value: any, currentLang: string): string {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value[currentLang]?.trim() || value.tr?.trim() || "";
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return "";
}

function extractLinks(raw: any, currentLang: string): LinkItem[] {
  if (!raw || typeof raw !== "object") return [];
  return Object.entries(raw).map(([key, val]: any) => ({
    label: val?.label?.[currentLang]?.trim() || val?.label?.tr?.trim() || key,
    href: val?.url?.trim() || "#",
  }));
}

export default function FooterSection() {
  const rawSettings = useAppSelector((state) => state.setting.settings);
  const settings = useMemo(() => rawSettings ?? [], [rawSettings]);
  const { i18n, t } = useTranslation("footer");
  const currentLang = i18n.language || "tr";

  const settingMap = useMemo(() => {
    const obj: Record<string, any> = {};
    for (const s of settings) obj[s.key] = s.value;
    return obj;
  }, [settings]);

  const aboutLinks = extractLinks(settingMap.footer_about_links, currentLang);
  const servicesLinks = extractLinks(
    settingMap.footer_services_links,
    currentLang
  );

  const socialLinksRaw = settingMap.footer_social_links as
    | Record<string, { url: string; icon: string }>
    | undefined;

  const socialLinks: SocialLinks | undefined = socialLinksRaw
    ? Object.keys(socialLinksRaw).reduce((acc, key) => {
        const val = socialLinksRaw[key];
        if (val?.url)
          acc[key.trim().toLowerCase() as keyof SocialLinks] = val.url;
        return acc;
      }, {} as SocialLinks)
    : undefined;

  const rightsText = getLocalizedValue(settingMap.footer_rights, currentLang);

  if (!Array.isArray(settings) || settings.length === 0) {
    return (
      <FooterWrapper>
        <Loading />
      </FooterWrapper>
    );
  }

  return (
    <FooterWrapper>
      <FooterLogo />
      <FooterGrid>
        <InfoBlock>
          <FooterCompanyInfo />
        </InfoBlock>
        <InfoBlock>
          <FooterLinks title={t("aboutUs")} links={aboutLinks} />
        </InfoBlock>
        <InfoBlock>
          <FooterLinks title={t("ourServices")} links={servicesLinks} />
        </InfoBlock>
      </FooterGrid>
      {socialLinks && Object.keys(socialLinks).length > 0 && (
        <FooterSocialLinks links={socialLinks} />
      )}
      <FooterCopyright rightsText={rightsText} />
    </FooterWrapper>
  );
}

// --- Styled Components ---
const FooterWrapper = styled.footer`
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
  border-top: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  text-align: center;
  width: 100%;
  box-sizing: border-box;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: ${({ theme }) => theme.spacing.lg} auto 0 auto;
  align-items: flex-start;

  ${({ theme }) => theme.media.small} {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.md};
    margin-top: ${({ theme }) => theme.spacing.md};
  }
`;

const InfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 ${({ theme }) => theme.spacing.md};
  text-align: center;
`;
