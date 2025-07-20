"use client";

import styled from "styled-components";
import Link from "next/link";
import translations from "@/modules/news/locales";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { Skeleton, ErrorMessage } from "@/shared";
import type { INews } from "@/modules/news/types";
import type { SupportedLocale } from "@/types/common";
import {
  getLocaleStringFromLang,
  getTitle,
  getSummary,
} from "@/types/common";

export default function NewsSection() {
  const { i18n, t } = useI18nNamespace("news", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "news")) {
      i18n.addResourceBundle(lng, "news", resources, true, true);
    }
  });

  const { news, loading, error } = useAppSelector((state) => state.news);

  if (loading) {
    return (
      <Section>
        <SectionTitle>
          <span>📰</span> {t("page.news.title","Bizden Haberler")}
        </SectionTitle>
        <Cards>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </Cards>
        <ButtonArea>
          <SeeAllBtn href="/news">{t("page.news.all", "Tüm Haberler")}</SeeAllBtn>
        </ButtonArea>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <SectionTitle>
          <span>📰</span> {t("page.news.title")}
        </SectionTitle>
        <ErrorMessage />
        <ButtonArea>
          <SeeAllBtn href="/news">{t("page.news.all", "Tüm Haberler")}</SeeAllBtn>
        </ButtonArea>
      </Section>
    );
  }

  if (!news || news.length === 0) {
    return (
      <Section>
        <SectionTitle>
          <span>📰</span> {t("page.news.title")}
        </SectionTitle>
        <NoNews>
          {t("page.news.noNews", "Haber bulunamadı.")}
        </NoNews>
        <ButtonArea>
          <SeeAllBtn href="/news">{t("page.news.all", "Tüm Haberler")}</SeeAllBtn>
        </ButtonArea>
      </Section>
    );
  }

  const latestNews = news.slice(0, 3);

  return (
    <Section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.52 }}
    >
      <SectionTitle>
        <span>📰</span> {t("page.news.title","Bizden Haberler")}
      </SectionTitle>

      <Cards>
        {latestNews.map((item: INews, index: number) => (
          <CardLink key={item._id} href={`/news/${item.slug}`}>
            <Card
              as={motion.article}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.44, delay: index * 0.11 }}
              viewport={{ once: true }}
            >
              <CardImageBox>
                {item.images?.[0]?.url ? (
                  <StyledImage
                    src={item.images[0].url}
                    alt={getTitle(item, lang)}
                    loading="lazy"
                  />
                ) : (
                  <ImagePlaceholder>
                    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                      <rect width="52" height="52" rx="13" fill="#e7f0f8"/>
                      <path d="M14 38L22.5 29L28.5 35L34 29L42 38H14Z" fill="#b6d4ee"/>
                      <circle cx="18.5" cy="22.5" r="3.5" fill="#a2bad3"/>
                    </svg>
                  </ImagePlaceholder>
                )}
              </CardImageBox>
              <CardContent>
                <NewsTitle>{getTitle(item, lang)}</NewsTitle>
                <Excerpt>
                  {getSummary(item, lang).slice(0, 145)}
                </Excerpt>
                <CardBottom>
                  <CardDate>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString(
                          getLocaleStringFromLang(lang),
                          { year: "numeric", month: "short", day: "2-digit" }
                        )
                      : ""}
                  </CardDate>
                  <ReadMore>
                    {t("page.news.readMore", "Devamı »")}
                  </ReadMore>
                </CardBottom>
              </CardContent>
            </Card>
          </CardLink>
        ))}
      </Cards>
      <ButtonArea>
        <SeeAllBtn href="/news">{t("page.news.all", "Tüm Haberler")}</SeeAllBtn>
      </ButtonArea>
    </Section>
  );
}

// --- Styled Components ---


const Section = styled(motion.section)`
  background: ${({ theme }) => theme.colors.sectionBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.xxl};
  width: 100%;
  margin: 0;
`;

const SectionTitle = styled.h2`
  font-size: clamp(2.15rem, 3.4vw, 2.65rem);
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  margin-bottom: 2.8rem;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: ${({ theme }) => theme.spacings.xl};
  display: flex;
  align-items: center;
  gap: 0.6em;

  span {
    font-size: 1.23em;
    display: flex;
    align-items: center;
  }

  @media (max-width: 900px) {
    padding-left: ${({ theme }) => theme.spacings.md};
  }
  @media (max-width: 600px) {
    padding-left: ${({ theme }) => theme.spacings.sm};
    font-size: 2rem;
  }
`;

const Cards = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.7rem;
  align-items: stretch;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.6rem;
  }
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
  height: 100%;
`;

const Card = styled(motion.article)`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 24px;
  border: 1.5px solid ${({ theme }) => theme.colors.borderLight};
  box-shadow: 0 6px 36px 0 rgba(40,117,194,0.11);
  overflow: hidden;
  min-height: 390px;
  max-height: 390px;
  height: 390px;
  transition: box-shadow 0.17s, transform 0.14s, border-color 0.13s;
  cursor: pointer;
  position: relative;

  &:hover, &:focus-visible {
    box-shadow: 0 14px 46px 0 rgba(40,117,194,0.18);
    transform: translateY(-8px) scale(1.028);
    border-color: ${({ theme }) => theme.colors.primaryTransparent};
    outline: none;
  }
`;

const CardImageBox = styled.div`
  width: 100%;
  aspect-ratio: 16/9;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24px 24px 0 0;
  position: relative;
  overflow: hidden;
  min-height: 150px;
  max-height: 150px;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  min-height: 150px;
  object-fit: cover;
  border-radius: 24px 24px 0 0;
  transition: transform 0.18s;
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e7edf6;
`;

const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  background: none;
  padding: 1.3rem 1.23rem 1.18rem 1.23rem;
`;

const NewsTitle = styled.h3`
  font-size: 1.09rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: 0.36rem;
  line-height: 1.18;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Excerpt = styled.p`
  font-size: 0.99rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 1.08rem;
  opacity: 0.98;
  line-height: 1.54;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  min-height: 2.3em;
`;

const CardBottom = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
`;

const CardDate = styled.span`
  background: linear-gradient(90deg, #2875c2 50%, #0bb6d6 100%);
  color: #fff;
  font-size: 0.97em;
  padding: 0.18em 0.89em;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: 0 3px 8px 0 rgba(40,117,194,0.09);
  letter-spacing: 0.01em;
  z-index: 2;
  margin-right: 7px;
`;

const ReadMore = styled.span`
  font-size: 0.97rem;
  color: ${({ theme }) => theme.colors.accent};
  font-weight: 600;
  margin-left: auto;
  cursor: pointer;
  text-decoration: underline;
  opacity: 0.93;
  letter-spacing: 0.02em;
  &:hover { color: ${({ theme }) => theme.colors.primary}; opacity: 1; }
`;

const ButtonArea = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2.1rem;
`;

const SeeAllBtn = styled(Link)`
  display: inline-block;
  padding: 0.75em 2.3em;
  font-size: 1.09em;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.white};
  background: linear-gradient(90deg, #2875c2 60%, #0bb6d6 100%);
  border-radius: ${({ theme }) => theme.radii.pill};
  text-decoration: none;
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: none;
  letter-spacing: 0.01em;
  transition: background 0.22s, color 0.22s, transform 0.19s;
  &:hover, &:focus-visible {
    background: linear-gradient(90deg, #0bb6d6 0%, #2875c2 90%);
    color: #fff;
    transform: translateY(-2px) scale(1.04);
    text-decoration: none;
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const NoNews = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 2.1rem 0 3rem 0;
  font-size: 1.12rem;
  opacity: 0.85;
  text-align: center;
`;
