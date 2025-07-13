"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import {
  FooterSocialLinks,
  FooterCopyright,
  FooterLinks,
  FooterCompanyInfo,
  FooterLogo
} from "@/modules/shared";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales/footer";
import { SupportedLocale } from "@/types/common";
import { useMemo } from "react";
import { Loading } from "@/shared";
import { ISocialLink } from "@/modules/company/types";
import type { IServices } from "@/modules/services/types";

// --- Main Links extractor ---
function extractLinks(raw: any, lang: string) {
  if (!raw || typeof raw !== "object") return [];
  return Object.entries(raw).map(([key, val]: any) => ({
    label: val?.label?.[lang]?.trim?.() || val?.label?.en || key,
    href: val?.url?.trim?.() || "#",
  }));
}

// --- Service Title (çoklu dil için) ---
function getServiceTitle(srv: IServices, lang: string) {
  return (
    srv.title?.[lang as SupportedLocale]?.trim?.() ||
    srv.slug ||
    "Service"
  );
}


export default function FooterSection() {
  // Services (masaj türleri)
  const { services, status: servicesStatus } = useAppSelector((state) => state.services);

  // Settings
  const rawSettings = useAppSelector((state) => state.settings.settings);
  const settings = useMemo(() => rawSettings ?? [], [rawSettings]);
  const { i18n, t } = useI18nNamespace("footer", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // Main Links
  const settingMap = useMemo(() => {
    const obj: Record<string, any> = {};
    for (const s of settings) obj[s.key] = s.value;
    return obj;
  }, [settings]);
  const mainLinks = extractLinks(settingMap.navbar_main_links, lang);

  // Masaj türleri: ilk 5 aktif ve yayınlanmış, dil fallback ile
  const massageLinks = (services || [])
    .filter((s: IServices) => s.isActive && s.isPublished)
    .slice(0, 5)
    .map((srv: IServices) => ({
      label: getServiceTitle(srv, lang),
      href: srv.slug ? `/services/${srv.slug}` : "#",
    }));

  // Sosyal medya ve copyright
  const socialLinksRaw = settingMap.footer_social_links as
    | Record<string, { url: string; icon: string }>
    | undefined;
  const socialLinks: ISocialLink | undefined = socialLinksRaw
    ? Object.keys(socialLinksRaw).reduce((acc, key) => {
        const val = socialLinksRaw[key];
        if (val?.url)
          acc[key.trim().toLowerCase() as keyof ISocialLink] = val.url;
        return acc;
      }, {} as ISocialLink)
    : undefined;
  const rightsText =
    (settingMap.footer_rights &&
      (settingMap.footer_rights[lang] ||
        settingMap.footer_rights.en ||
        settingMap.footer_rights.tr)) ||
    "";

  // Loader
  if (!Array.isArray(settings) || settings.length === 0 || servicesStatus === "loading") {
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
          <FooterLinks title={t("companyInfo", "Bilgilerimiz")} links={[]} />
          <FooterCompanyInfo />
        </InfoBlock>
        <InfoBlock>
          <FooterLinks title={t("massageTypes", "Massage Types")} links={massageLinks} />
        </InfoBlock>
        <InfoBlock>
          <FooterLinks title={t("mainLinks", "Main Links")} links={mainLinks} />
        </InfoBlock>
      </FooterGrid>
      {socialLinks && Object.keys(socialLinks).length > 0 && <FooterSocialLinks />}
      {rightsText && <FooterCopyright />}
    </FooterWrapper>
  );
}

// --- Styled Components ---
const FooterWrapper = styled.footer`
  padding: ${({ theme }) => theme.spacings.xl} ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
  border-top: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  text-align: center;
  width: 100%;
  box-sizing: border-box;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacings.xl};
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: ${({ theme }) => theme.spacings.lg} auto 0 auto;
  align-items: flex-start;
  ${({ theme }) => theme.media.small} {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacings.md};
    margin-top: ${({ theme }) => theme.spacings.md};
  }
`;

const InfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 ${({ theme }) => theme.spacings.md};
  text-align: center;
`;
