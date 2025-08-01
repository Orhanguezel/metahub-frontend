"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/portfolio/locales";
import { Skeleton, ErrorMessage } from "@/shared";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { SupportedLocale } from "@/types/common";
import type { IPortfolio } from "@/modules/portfolio/types";

export default function PortfolioPage() {
  const { i18n, t } = useI18nNamespace("portfolio", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { portfolio, loading, error } = useAppSelector((state) => state.portfolio);

  // SSR hydration için
  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "portfolio")) {
      i18n.addResourceBundle(lng, "portfolio", resources, true, true);
    }
  });

  // --- Loading ---
  if (loading) {
    return (
      <PageWrapper>
        <ListGrid>
          {[...Array(2)].map((_, i) => <Skeleton key={i} />)}
        </ListGrid>
      </PageWrapper>
    );
  }

  // --- Error ---
  if (error) {
    return (
      <PageWrapper>
        <ErrorMessage message={error} />
      </PageWrapper>
    );
  }

  // --- Empty state ---
  if (!Array.isArray(portfolio) || portfolio.length === 0) {
    return (
      <PageWrapper>
        <NoPortfolio>{t("page.noPortfolio", "Hiç proje bulunamadı.")}</NoPortfolio>
      </PageWrapper>
    );
  }

  // --- Main ---
  return (
    <PageWrapper>
      <ListGrid>
        {portfolio
          .sort(
            (a, b) =>
              new Date(b.publishedAt || b.createdAt).getTime() -
              new Date(a.publishedAt || a.createdAt).getTime()
          )
          .map((item: IPortfolio) => (
            <PortfolioItem key={item._id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
              {item.images?.[0]?.url && (
                <MainImageWrap>
                  <Image
                    src={item.images[0].url}
                    alt={item.title?.[lang] || "Portfolio Image"}
                    width={780}
                    height={440}
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover",
                      borderRadius: "16px",
                      display: "block"
                    }}
                    loading="lazy"
                  />
                </MainImageWrap>
              )}
              <PortfolioTitle>
                <Link href={`/portfolio/${item.slug}`}>
                  {item.title?.[lang] || "Untitled"}
                </Link>
              </PortfolioTitle>
              <PortfolioMeta>
                <span>
                  {new Date(item.publishedAt || item.createdAt).toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                {Array.isArray(item.tags) && item.tags.length > 0 && (
                  <span>
                    {item.tags.map((tag) => (
                      <CategoryLabel key={tag}>{tag}</CategoryLabel>
                    ))}
                  </span>
                )}
              </PortfolioMeta>
              <PortfolioSummary>
                {item.summary?.[lang] ||
                  (item.content?.[lang]
                    ? item.content?.[lang].substring(0, 180) + "..."
                    : "")}
              </PortfolioSummary>
              <ReadMoreBtn href={`/portfolio/${item.slug}`}>
                {t("readMore", "Devamını Oku")}
              </ReadMoreBtn>
            </PortfolioItem>
          ))}
      </ListGrid>
    </PageWrapper>
  );
}

// --- Styled Components ---
const PageWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxl} ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.colors.sectionBackground};
  min-height: 90vh;
`;

const ListGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

const PortfolioItem = styled(motion.article)`
  background: ${({ theme }) => theme.colors.cardBackground || "#fff"};
  border-radius: 20px;
  border: 1.5px solid ${({ theme }) => theme.colors.borderLight || "#e5eaf3"};
  box-shadow: 0 3px 15px 0 rgba(40,117,194,0.09);
  padding: 2.1rem 2.3rem 1.5rem 2.3rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 0.5rem;

  @media (max-width: 650px) {
    padding: 1.1rem 0.7rem 1.1rem 0.7rem;
  }
`;
const MainImageWrap = styled.div`
  width: 100%;
  margin-bottom: 1.1rem;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px 0 rgba(40,117,194,0.11);

  img {
    width: 100% !important;
    height: auto !important;  
    object-fit: cover;
    display: block;
    border-radius: 16px;
  }
`;

const PortfolioTitle = styled.h2`
  font-size: 1.42rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: 0.23rem;
  line-height: 1.18;

  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.17s;
    &:hover {
      color: ${({ theme }) => theme.colors.accent};
    }
  }
`;

const PortfolioMeta = styled.div`
  font-size: 0.98rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  gap: 1.25rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 0.25rem;
`;

const CategoryLabel = styled.span`
  background: ${({ theme }) => theme.colors.primaryTransparent || "#e5f1fb"};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.9em;
  border-radius: 8px;
  padding: 1px 8px;
  margin-left: 0.32em;
  font-weight: 500;
`;

const PortfolioSummary = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.08rem;
  margin: 0.22em 0 1.22em 0;
  line-height: 1.64;
`;

const ReadMoreBtn = styled(Link)`
  align-self: flex-start;
  background: linear-gradient(90deg, #2875c2 60%, #0bb6d6 100%);
  color: #fff;
  padding: 0.46em 1.35em;
  border-radius: 22px;
  font-size: 1.03rem;
  font-weight: 600;
  box-shadow: 0 3px 10px 0 rgba(40,117,194,0.06);
  text-decoration: none;
  transition: background 0.2s, color 0.18s, transform 0.14s;
  &:hover, &:focus-visible {
    background: linear-gradient(90deg, #0bb6d6 0%, #2875c2 90%);
    color: #fff;
    transform: translateY(-2px) scale(1.04);
  }
`;

const NoPortfolio = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.09rem;
  padding: 2.1rem 0 3rem 0;
  opacity: 0.86;
  text-align: center;
`;
