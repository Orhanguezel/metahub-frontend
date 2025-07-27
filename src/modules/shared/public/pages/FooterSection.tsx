"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import {
  FooterSocialLinks,
  FooterCopyright,
  FooterLinks,
  FooterCompanyInfo,
  FooterLogo,
} from "@/modules/shared";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales/footer";
import { SupportedLocale } from "@/types/common";
import { useMemo } from "react";
import { Loading } from "@/shared";
import type { IServices } from "@/modules/services/types";
import Link from "next/link";

// --- Main Links extractor ---
function extractLinks(raw: any, lang: string) {
  if (!raw || typeof raw !== "object") return [];
  return Object.entries(raw).map(([key, val]: any) => ({
    label: val?.label?.[lang]?.trim?.() || val?.label?.en || key,
    href: val?.url?.trim?.() || "#",
  }));
}

function getServiceTitle(srv: IServices, lang: string) {
  return (
    srv.title?.[lang as SupportedLocale]?.trim?.() ||
    slugToTitle(srv.slug) ||
    "Service"
  );
}
function slugToTitle(slug: string = "") {
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function FooterSection() {
  // Çoklu modül: services (massage), ensotekprod, sparepart, library...
  const { services, status: servicesStatus } = useAppSelector((state) => state.services || {});
  const { ensotekprod } = useAppSelector((state) => state.ensotekprod || {});
  const { sparepart } = useAppSelector((state) => state.sparepart || {});
  const { library } = useAppSelector((state) => state.library || {});
  const { faqs } = useAppSelector((state) => state.faq || {});
  const { team } = useAppSelector((state) => state.team || {});

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

  // Copyright metni
  const rightsText = (settingMap.footer_rights && (settingMap.footer_rights[lang] || ""));

  // --- DİNAMİK FOOTER BLOKLARI ---
  type FooterBlock = { title: string; links: { label: string; href: string }[] };

  // Diğer bloklar
  const footerBlocks: FooterBlock[] = [
    services && Array.isArray(services) && services.length > 0 && {
      title: t("massageTypes", "Massage Types"),
      links: services
        .filter((s: IServices) => s.isActive && s.isPublished)
        .slice(0, 5)
        .map((srv: IServices) => ({
          label: getServiceTitle(srv, lang),
          href: srv.slug ? `/services/${srv.slug}` : "#",
        })),
    },
    ensotekprod && Array.isArray(ensotekprod) && ensotekprod.length > 0 && {
      title: t("ensotekprod", "Products"),
      links: ensotekprod.slice(0, 5).map((item: any) => ({
        label:
          item?.title?.[lang]?.trim?.() ||
          item?.title?.en?.trim?.() ||
          item?.name?.[lang]?.trim?.() ||
          item?.name?.en?.trim?.() ||
          slugToTitle(item?.slug) ||
          "Product",
        href: item.slug ? `/ensotekprod/${item.slug}` : "#",
      })),
    },
    sparepart && Array.isArray(sparepart) && sparepart.length > 0 && {
      title: t("sparepart", "Spare Parts"),
      links: sparepart.slice(0, 5).map((item: any) => ({
        label:
          item?.title?.[lang]?.trim?.() ||
          item?.title?.en?.trim?.() ||
          item?.name?.[lang]?.trim?.() ||
          item?.name?.en?.trim?.() ||
          slugToTitle(item?.slug) ||
          "Spare Part",
        href: item.slug ? `/sparepart/${item.slug}` : "#",
      })),
    },
    library && Array.isArray(library) && library.length > 0 && {
      title: t("library", "Library"),
      links: library.slice(1, 7).map((item: any) => ({
        label:
          item?.title?.[lang]?.trim?.() ||
          item?.title?.en?.trim?.() ||
          slugToTitle(item?.slug) ||
          "Library",
        href: item.slug ? `/library/${item.slug}` : "#",
      })),
    },
    mainLinks && Array.isArray(mainLinks) && mainLinks.length > 0 && {
      title: t("mainLinks", "Main Links"),
      links: mainLinks,
    },
  ].filter((block): block is FooterBlock => !!block);

  // --- Diğer Linkler Bloğu ---
  const otherLinks: { label: string; href: string }[] = [];
  if (faqs && Array.isArray(faqs) && faqs.length > 0) {
    otherLinks.push({
      label: t("faqLink", "Sıkça Sorulan Sorular"),
      href: "/faq",
    });
  }
  if (team && Array.isArray(team) && team.length > 0) {
    otherLinks.push({
      label: t("teamLink", "Takım"),
      href: "/team",
    });
  }
  // // İleride başka linkler (mesela destek) eklemek için örnek:
  // if (supportCenterEnabled) {
  //   otherLinks.push({ label: t("support", "Destek Merkezi"), href: "/support" });
  // }

  // Eğer diğer linkler varsa, bloğu ekle
  if (otherLinks.length > 0) {
    footerBlocks.push({
      title: t("other", "Other Links"),
      links: otherLinks,
    });
  }

  // Legal (yasal) linkler en alt için
  const legalLinks = [
    { label: t("impressum", "Impressum"), href: "/impressum" },
    { label: t("privacyPolicy", "Datenschutzerklärung"), href: "/privacy-policy" },
    { label: t("terms", "AGB"), href: "/terms" },
    { label: t("contact", "Kontakt"), href: "/contact" },
  ];

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
        {footerBlocks.map((block, i) => (
          <InfoBlock key={block.title + i}>
            <FooterLinks title={block.title} links={block.links} />
          </InfoBlock>
        ))}
      </FooterGrid>
      <FooterSocialLinks />
      <LegalLinks>
        {legalLinks.map((item, idx) => (
          <span key={item.href}>
            <Link href={item.href}>{item.label}</Link>
            {idx !== legalLinks.length - 1 && <Divider>&nbsp;-&nbsp;</Divider>}
          </span>
        ))}
      </LegalLinks>
      {rightsText && <FooterCopyright />}
    </FooterWrapper>
  );
}

// --- Styled Components --- (Aynı şekilde bırakabilirsin!)
const FooterWrapper = styled.footer`
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
    gap: ${({ theme }) => theme.spacings.xl};
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
    margin-bottom: ${({ theme }) => theme.spacings.xl};
    width: 90vw;
    max-width: 480px;
  }
  &:last-child {
    margin-bottom: 0;
  }
`;

const LegalLinks = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 18px 0 2px 0;
  font-size: 1.07rem;
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.92;
  a {
    color: ${({ theme }) => theme.colors.text};
    text-decoration: none;
    transition: color 0.16s;
    &:hover {
      color: ${({ theme }) => theme.colors.primary};
      text-decoration: underline;
    }
  }
  @media (max-width: 600px) {
    font-size: 0.97rem;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }
`;

const Divider = styled.span`
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.6;
  user-select: none;
`;
