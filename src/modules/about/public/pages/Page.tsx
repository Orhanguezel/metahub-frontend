"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/about/locales/index";
import { Skeleton, ErrorMessage } from "@/shared";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { SupportedLocale } from "@/types/common";
import type { IAbout } from "@/modules/about/types";

export default function AboutPage() {
  const { i18n, t } = useI18nNamespace("about", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { about, loading, error } = useAppSelector((state) => state.about);

  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "about")) {
      i18n.addResourceBundle(lng, "about", resources, true, true);
    }
  });

  // Çoklu dil fallback
  const getMultiLang = (obj?: Record<string, string>) =>
    obj?.[lang] || obj?.tr || obj?.en || Object.values(obj || {})[0] || "—";

  if (loading) {
    return (
      <PageWrapper>
        <PageTitle>{t("page.allAbout", "Hakkımızda")}</PageTitle>
        <AboutGrid>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} />
          ))}
        </AboutGrid>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <ErrorMessage message={error} />
      </PageWrapper>
    );
  }

  if (!about || about.length === 0) {
    return (
      <PageWrapper>
        <PageTitle>{t("page.allAbout", "Hakkımızda")}</PageTitle>
        <EmptyMsg>
          {t("page.noAbout", "Herhangi bir içerik bulunamadı.")}
        </EmptyMsg>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageTitle>{t("page.allAbout", "Hakkımızda")}</PageTitle>
      <AboutGrid>
        {about.map((item: IAbout, index: number) => (
          <AboutCard
            key={item._id}
            as={motion.div}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.09, duration: 0.48 }}
            viewport={{ once: true }}
          >
            <ImageWrapper>
              {item.images?.[0]?.url ? (
                <StyledImage
                  src={item.images[0].url}
                  alt={getMultiLang(item.title)}
                  width={440}
                  height={210}
                  loading="lazy"
                />
              ) : (
                <ImgPlaceholder />
              )}
            </ImageWrapper>
            <CardContent>
              <CardTitle>{getMultiLang(item.title)}</CardTitle>
              <CardSummary>{getMultiLang(item.summary)}</CardSummary>
              {item.tags?.length > 0 && (
                <Tags>
                  {item.tags.map((tag, i) => (
                    <Tag key={i}>{tag}</Tag>
                  ))}
                </Tags>
              )}
              <ReadMore href={`/about/${item.slug}`}>
                {t("readMore", "Devamını Oku →")}
              </ReadMore>
            </CardContent>
          </AboutCard>
        ))}
      </AboutGrid>
    </PageWrapper>
  );
}

// ----- STYLES -----
const PageWrapper = styled.div`
  max-width: 1260px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxxl} ${({ theme }) => theme.spacings.md};
  @media (max-width: 600px) {
    padding: ${({ theme }) => theme.spacings.lg} ${({ theme }) => theme.spacings.xs};
  }
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  text-align: center;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.01em;
`;

const AboutGrid = styled.div`
  display: grid;
  gap: 2.1rem 2rem;
  grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
  align-items: stretch;
  margin: 0 auto;

  @media (max-width: 800px) {
    gap: 1.3rem;
  }
`;

const AboutCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1.4px solid ${({ theme }) => theme.colors.borderLight};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.17s, border 0.17s, transform 0.16s;
  cursor: pointer;
  min-height: 335px;

  &:hover, &:focus-visible {
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-8px) scale(1.035);
    z-index: 1;
  }
`;

const ImageWrapper = styled.div`
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledImage = styled(Image)`
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-top-left-radius: ${({ theme }) => theme.radii.xl};
  border-top-right-radius: ${({ theme }) => theme.radii.xl};
`;

const ImgPlaceholder = styled.div`
  width: 100%;
  height: 180px;
  background: ${({ theme }) => theme.colors.skeleton};
  opacity: 0.38;
`;

const CardContent = styled.div`
  padding: ${({ theme }) => theme.spacings.lg} ${({ theme }) => theme.spacings.lg} ${({ theme }) => theme.spacings.md};
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
`;

const CardTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.title};
  margin-bottom: 0.13em;
`;

const CardSummary = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 0.45em;
  line-height: 1.6;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.3em;
`;

const Tag = styled.span`
  background: ${({ theme }) => theme.colors.accent}22;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.21em 1.07em;
  font-size: 0.96em;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-weight: 500;
  letter-spacing: 0.01em;
  display: inline-block;
`;

const ReadMore = styled(Link)`
  display: inline-block;
  margin-top: auto;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.base};
  padding: 0.32em 0.7em;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  box-shadow: ${({ theme }) => theme.shadows.xs};
  text-decoration: none;
  letter-spacing: 0.01em;
  transition: background 0.19s, color 0.16s;
  &:hover, &:focus-visible {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    text-decoration: none;
  }
`;

const EmptyMsg = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  font-size: 1.18em;
  margin: 2.4em 0 1.7em 0;
`;

