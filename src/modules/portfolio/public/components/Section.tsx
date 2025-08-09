"use client";

import styled from "styled-components";
import Link from "next/link";
import translations from "@/modules/portfolio/locales";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { Skeleton, ErrorMessage, SeeAllBtn } from "@/shared";
import Image from "next/image";
import type { SupportedLocale } from "@/types/common";

export default function PortfolioSection() {
  const { i18n, t } = useI18nNamespace("portfolio", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { portfolio, loading, error } = useAppSelector((state) => state.portfolio);

  if (loading) {
    return (
      <Section>
        <SectionHead>
          <MinorTitle>{t("page.portfolio.minorTitle", "PORTFOLYO")}</MinorTitle>
          <MainTitle>{t("page.portfolio.title", "Projelerim")}</MainTitle>
          <Desc>{t("page.portfolio.desc", "Modern SaaS, B2B ve dijital dönüşüm projelerim.")}</Desc>
        </SectionHead>
        <PortfolioGrid>
          <PortfolioCard as={Skeleton} />
          <PortfolioCard as={Skeleton} />
          <PortfolioCard as={Skeleton} />
        </PortfolioGrid>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <SectionHead>
          <MinorTitle>{t("page.portfolio.minorTitle", "PORTFOLYO")}</MinorTitle>
          <MainTitle>{t("page.portfolio.title", "Projelerim")}</MainTitle>
        </SectionHead>
        <PortfolioGrid>
          <ErrorMessage message={error} />
        </PortfolioGrid>
      </Section>
    );
  }

  if (!Array.isArray(portfolio) || portfolio.length === 0) {
    return (
      <Section>
        <SectionHead>
          <MinorTitle>{t("page.portfolio.minorTitle", "PORTFOLYO")}</MinorTitle>
          <MainTitle>{t("page.portfolio.title", "Projelerim")}</MainTitle>
          <Desc>{t("page.portfolio.noPortfolio", "Henüz proje eklenmedi.")}</Desc>
        </SectionHead>
        <PortfolioGrid>
          <NoPortfolio>
            <SeeAllBtn href="/portfolio">
              {t("page.portfolio.all", "Tüm Projeler")}
            </SeeAllBtn>
          </NoPortfolio>
        </PortfolioGrid>
      </Section>
    );
  }

  const shownPortfolio = portfolio.slice(0, 3);

  return (
    <Section
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.66 }}
      viewport={{ once: true }}
    >
      <SectionHead>
        <MinorTitle>{t("page.portfolio.minorTitle", "PORTFOLYO")}</MinorTitle>
        <MainTitle>{t("page.portfolio.title", "Projelerim")}</MainTitle>
        <Desc>{t("page.portfolio.desc", "Modern SaaS, B2B ve dijital dönüşüm projelerim.")}</Desc>
      </SectionHead>

      <PortfolioGrid>
        {shownPortfolio.map((item) => (
          <PortfolioCard key={item._id} as={motion.article}>
            <CardImageWrap as={Link} href={`/portfolio/${item.slug}`}>
              {item.images?.[0]?.url ? (
                <CardImage
                  src={item.images[0].url}
                  alt={item.title?.[lang] || item.title?.en || ""}
                  width={800}
                  height={450}
                  priority
                />
              ) : (
                <ImgPlaceholder />
              )}
            </CardImageWrap>

            <CardBody>
              <CardTitle as={Link} href={`/portfolio/${item.slug}`}>
                {item.title?.[lang] || item.title?.en || ""}
              </CardTitle>
              <CardExcerpt>
                {item.summary?.[lang] ||
                  (item.content?.[lang]?.slice(0, 90) ? item.content?.[lang]!.slice(0, 90) + "…" : "")}
              </CardExcerpt>
            </CardBody>
          </PortfolioCard>
        ))}
      </PortfolioGrid>

      <div style={{ textAlign: "center" }}>
        <SeeAllBtn href="/portfolio">
          {t("page.portfolio.all", "Tüm Projeler")}
        </SeeAllBtn>
      </div>
    </Section>
  );
}

/* ========== STYLES ========== */

const Section = styled(motion.section)`
  background: ${({ theme }) => theme.colors.sectionBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.xxl};
  width: 100%;
`;

const SectionHead = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding-left: ${({ theme }) => theme.spacings.xl};
  box-sizing: border-box;
  text-align: left;

  @media (max-width: 900px) {
    padding-left: ${({ theme }) => theme.spacings.md};
  }
  @media (max-width: 600px) {
    padding-left: ${({ theme }) => theme.spacings.sm};
    margin-bottom: 1.1rem;
    text-align: center;
  }
`;

const MinorTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.accent};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.21em;
`;

const MainTitle = styled.h2`
  font-size: clamp(2.2rem, 3.3vw, 2.7rem);
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  margin: 0 0 0.23em 0;
  letter-spacing: -0.01em;
  line-height: 1.13;
`;

const Desc = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.base};
  line-height: 1.7;
  margin-bottom: 0.7rem;
  max-width: 520px;
  opacity: 0.93;
  padding-right: 2vw;
`;

const PortfolioGrid = styled.div`
  /* Kartlar her zaman ortalı */
  --card-max: 360px;

  width: 100%;
  max-width: 1280px;
  margin: 0 auto;

  display: grid;
  gap: 2rem;
  padding: 0 ${({ theme }) => theme.spacings.xl};

  /* Desktop: 3 kolon */
  grid-template-columns: repeat(3, minmax(0, 1fr));
  place-items: center;

  ${({ theme }) => theme.media.medium} {
    /* Tablet: 2 kolon */
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.6rem;
    padding: 0 ${({ theme }) => theme.spacings.md};
  }

  ${({ theme }) => theme.media.small} {
    /* Mobile: 1 kolon */
    grid-template-columns: 1fr;
    gap: 1.4rem;
    padding: 0 ${({ theme }) => theme.spacings.sm};
  }
`;

const NoPortfolio = styled.div`
  text-align: center;
  width: 100%;
`;

const PortfolioCard = styled(motion.div)`
  width: 100%;
  max-width: var(--card-max);
  margin-inline: auto;

  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: 0 8px 30px 0 rgba(40,117,194,0.10);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 260px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 16px;
  transition: box-shadow 0.16s, transform 0.11s;

  &:hover {
    box-shadow: 0 14px 36px 0 rgba(40,117,194,0.17);
    transform: scale(1.024) translateY(-2px);
  }
`;

const CardImageWrap = styled(Link)`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
`;

const CardImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ImgPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  min-height: 116px;
  background: ${({ theme }) => theme.colors.skeleton};
  opacity: 0.36;
`;

const CardBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 1rem 1.2rem 1.2rem 1.1rem;
`;

const CardTitle = styled.h3`
  font-size: 1.13rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: 0.44rem;
  line-height: 1.18;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardExcerpt = styled.p`
  font-size: 0.96rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 0.62rem;
  opacity: 0.98;
  line-height: 1.37;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  min-height: 2em;
`;
