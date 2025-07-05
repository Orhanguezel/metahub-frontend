"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { motion } from "framer-motion";
import i18n from "@/i18n";
import translations from "../../locales";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import Image from "next/image";
import { Skeleton, ErrorMessage } from "@/shared";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearNewsMessages,
  fetchNewsBySlug,
  setSelectedNews,
} from "@/modules/news/slice/newsSlice";
import { CommentForm, CommentList } from "@/modules/comment";
import { getCurrentLocale } from "@/utils/getCurrentLocale";
import type { INews } from "@/modules/news/types";

export default function NewsDetailSection() {
  const { slug } = useParams() as { slug: string };
  const { t } = useTranslation("news");
  const dispatch = useAppDispatch();
  const lang = getCurrentLocale();

  // Locale dosyalarını i18n'e yükle
  Object.entries(translations).forEach(([locale, resources]) => {
    if (!i18n.hasResourceBundle(locale, "news")) {
      i18n.addResourceBundle(locale, "news", resources, true, true);
    }
  });

  const {
    selected: news,
    news: allNews,
    loading,
    error,
  } = useAppSelector((state) => state.news);

  useEffect(() => {
    if (allNews && allNews.length > 0) {
      const found = allNews.find((item: INews) => item.slug === slug);
      if (found) {
        dispatch(setSelectedNews(found));
      } else {
        dispatch(fetchNewsBySlug(slug));
      }
    } else {
      dispatch(fetchNewsBySlug(slug));
    }
    return () => {
      dispatch(clearNewsMessages());
    };
  }, [dispatch, allNews, slug]);

  if (loading) {
    return (
      <Container>
        <Skeleton />
      </Container>
    );
  }

  if (error || !news) {
    return (
      <Container>
        <ErrorMessage />
      </Container>
    );
  }

  const otherNews = allNews.filter((item: INews) => item.slug !== slug).slice(0, 2);

  return (
    <Container
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Title>{news.title?.[lang] || t("page.noTitle", "Başlık yok")}</Title>

      {news.images?.[0]?.url && (
        <ImageWrapper>
          <Image
            src={news.images[0].url}
            alt={news.title?.[lang] || ""}
            width={800}
            height={400}
            style={{ width: "100%", height: "auto", objectFit: "cover" }}
          />
        </ImageWrapper>
      )}

      {news.summary?.[lang] && (
        <SummaryBox>
          <h3>{t("page.summary")}</h3>
          <div>{news.summary?.[lang]}</div>
        </SummaryBox>
      )}

      {news.content?.[lang] && (
        <ContentBox>
          <h3>{t("page.detail")}</h3>
          <div dangerouslySetInnerHTML={{ __html: news.content[lang] }} />
        </ContentBox>
      )}

      {otherNews?.length > 0 && (
        <OtherSection>
          <h3>{t("page.other")}</h3>
          <OtherList>
            {otherNews.map((item: INews) => (
              <OtherItem key={item._id}>
                <Link href={`/news/${item.slug}`}>{item.title?.[lang]}</Link>
              </OtherItem>
            ))}
          </OtherList>
        </OtherSection>
      )}
      <CommentForm contentId={news._id} contentType="news" />
      <CommentList contentId={news._id} contentType="news" />
    </Container>
  );
}

// --------- STYLES -----------
const Container = styled(motion.section)`
  max-width: 900px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxl}
    ${({ theme }) => theme.spacings.md};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const ImageWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  img {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: ${({ theme }) => theme.radii.sm};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const SummaryBox = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacings.lg};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  border-radius: ${({ theme }) => theme.radii.sm};
`;

const ContentBox = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacings.lg};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  border-radius: ${({ theme }) => theme.radii.sm};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  h3 {
    margin-bottom: ${({ theme }) => theme.spacings.md};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const OtherSection = styled.div`
  margin-top: ${({ theme }) => theme.spacings.xxl};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacings.lg};
`;

const OtherList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const OtherItem = styled.li`
  font-size: ${({ theme }) => theme.fontSizes.base};
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;
