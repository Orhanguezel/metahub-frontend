"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNewsBySlug } from "@/store/newsSlice";
import { AppDispatch, RootState } from "@/store";
import styled from "styled-components";
import { getImageSrc } from "@/utils/getImageSrc";
import NewsTags from "./NewsTags";
import NewsCategoryBadge from "./NewsCategoryBadge";
import RelatedNews from "./RelatedNews";
import { useTranslation } from "react-i18next";

interface Props {
  slug: string;
}

export default function NewsDetailSection({ slug }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("visitor");
  const { selectedNews, loading } = useSelector((state: RootState) => state.news);

  useEffect(() => {
    if (slug) {
      dispatch(fetchNewsBySlug(slug));
    }
  }, [slug, dispatch]);

  if (loading || !selectedNews || selectedNews.slug !== slug) {
    return <Loading>{t("common.loading") || "Yükleniyor..."}</Loading>;
  }

  if (!selectedNews) {
    return <ErrorMessage>{t("news.notFound") || "Haber bulunamadı."}</ErrorMessage>;
  }

  return (
    <Wrapper>
      <Title>{selectedNews.title}</Title>
      <Image
        src={getImageSrc(selectedNews.image, "news")}
        alt={selectedNews.title}
      />
      <Content dangerouslySetInnerHTML={{ __html: selectedNews.content }} />
      <Meta>
        <DateLabel>
          📅 {new Date(selectedNews.publishedAt!).toLocaleDateString()}
        </DateLabel>
        <NewsCategoryBadge category={selectedNews.category} />
        <NewsTags tags={selectedNews.tags || []} />
      </Meta>
      <RelatedNews
        currentId={selectedNews._id!}
        category={selectedNews.category}
      />
    </Wrapper>
  );
}


// Styled

const Wrapper = styled.article`
  padding: 2rem 0;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const Image = styled.img`
  width: 100%;
  border-radius: 8px;
  max-height: 420px;
  object-fit: cover;
  margin-bottom: 1.5rem;
`;

const Content = styled.div`
  font-size: 1rem;
  line-height: 1.75;
  color: ${({ theme }) => theme.text};
  margin-bottom: 2rem;
`;

const Meta = styled.div`
  margin-bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const DateLabel = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textLight};
`;

const Loading = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.primary};
`;

const ErrorMessage = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.danger};
`;
