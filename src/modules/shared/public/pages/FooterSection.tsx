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
  // Services (ör: masaj türleri)
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

  // Masaj türleri: ilk 5 aktif ve yayınlanmış
  const massageLinks = (services || [])
    .filter((s: IServices) => s.isActive && s.isPublished)
    .slice(0, 5)
    .map((srv: IServices) => ({
      label: getServiceTitle(srv, lang),
      href: srv.slug ? `/services/${srv.slug}` : "#",
    }));

  // Copyright metni
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
    <FooterCompanyInfo />
  </InfoBlock>
  <InfoBlock>
    <FooterLinks title={t("massageTypes", "Massage Types")} links={massageLinks} />
  </InfoBlock>
  <InfoBlock>
    <FooterLinks title={t("mainLinks", "Main Links")} links={mainLinks} />
  </InfoBlock>
</FooterGrid>


      <FooterSocialLinks />
      {rightsText && <FooterCopyright />}
    </FooterWrapper>
  );
}const FooterWrapper = styled.footer`
  width: 100%;
  background: ${({ theme }) => theme.colors.footerBackground};
  border-top: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacings.xl} 0 ${({ theme }) => theme.spacings.md};
  row-gap: ${({ theme }) => theme.spacings.lg};
  z-index: 1;

  ${({ theme }) => theme.media.medium} {
    padding: ${({ theme }) => theme.spacings.lg} 0 ${({ theme }) => theme.spacings.sm};
    row-gap: ${({ theme }) => theme.spacings.md};
  }

  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacings.md} 0 ${({ theme }) => theme.spacings.sm};
    row-gap: ${({ theme }) => theme.spacings.sm};
  }
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacings.lg};
  width: 100%;
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacings.lg};

  ${({ theme }) => theme.media.large} {
    max-width: 1000px;
    gap: ${({ theme }) => theme.spacings.md};
    padding: 0 ${({ theme }) => theme.spacings.md};
  }
  ${({ theme }) => theme.media.medium} {
    grid-template-columns: 1fr 1fr;
    max-width: 650px;
    gap: ${({ theme }) => theme.spacings.md};
    padding: 0 ${({ theme }) => theme.spacings.sm};
  }
  ${({ theme }) => theme.media.small} {
    grid-template-columns: 1fr;
    max-width: 100vw;
    gap: ${({ theme }) => theme.spacings.xl}; /* Burada spacing arttırıldı */
    padding: 0 ${({ theme }) => theme.spacings.sm};
    align-items: center;
    text-align: center;
    justify-items: center;
  }
`;

const InfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  padding: 0;
  width: 100%;

  ${({ theme }) => theme.media.small} {
    align-items: center;
    text-align: center;
    padding: 0;
    margin-bottom: ${({ theme }) => theme.spacings.xl}; /* Ekstra gap */
    width: 90vw; /* Mobile'da bloklar biraz daha geniş gözüksün */
    max-width: 480px;
  }
  &:last-child {
    margin-bottom: 0;
  }
`;

