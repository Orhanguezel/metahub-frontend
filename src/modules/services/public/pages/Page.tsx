"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/services/locales/index";
import { Skeleton, ErrorMessage } from "@/shared";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { SupportedLocale } from "@/types/common";
import type { IServices } from "@/modules/services/types";

export default function ServicesPage() {
  const { i18n, t } = useI18nNamespace("services", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { services, loading, error } = useAppSelector((state) => state.services);

  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "services")) {
      i18n.addResourceBundle(lng, "services", resources, true, true);
    }
  });

  // Çoklu dil fallback
  const getMultiLang = (obj?: Record<string, string>) =>
    obj?.[lang] || obj?.tr || obj?.en || Object.values(obj || {})[0] || "—";

  if (loading) {
    return (
      <PageWrapper>
        <PageTitle>{t("page.allServices", "Hakkımızda")}</PageTitle>
        <ServicesGrid>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} />
          ))}
        </ServicesGrid>
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

  if (!services || services.length === 0) {
    return (
      <PageWrapper>
        <PageTitle>{t("page.allServices", "Hakkımızda")}</PageTitle>
        <EmptyMsg>
          {t("page.noServices", "Herhangi bir içerik bulunamadı.")}
        </EmptyMsg>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageTitle>{t("page.allServices", "Hakkımızda")}</PageTitle>
      <ServicesGrid>
        {services.map((item: IServices, index: number) => {
          const detailHref = `/services/${item.slug}`;
          return (
            <ServicesCard
              key={item._id}
              as={motion.div}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.09, duration: 0.48 }}
              viewport={{ once: true }}
            >
              <Link href={detailHref} tabIndex={-1} style={{ display: "block" }}>
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
              </Link>
              <CardContent>
                <CardTitle as={Link} href={detailHref}>
                  {getMultiLang(item.title)}
                </CardTitle>
                <CardSummary>{getMultiLang(item.summary)}</CardSummary>
                {item.tags?.length > 0 && (
                  <Tags>
                    {item.tags.map((tag, i) => (
                      <Tag key={i}>{tag}</Tag>
                    ))}
                  </Tags>
                )}
              </CardContent>
            </ServicesCard>
          );
        })}
      </ServicesGrid>
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

const ServicesGrid = styled.div`
  display: grid;
  gap: 2.1rem 2rem;
  grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
  align-items: stretch;
  margin: 0 auto;

  @media (max-width: 800px) {
    gap: 1.3rem;
  }
`;

const ServicesCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBackground};
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
  cursor: pointer;
  transition: color 0.17s;
  &:hover,
  &:focus {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }
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

const EmptyMsg = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  font-size: 1.18em;
  margin: 2.4em 0 1.7em 0;
`;
