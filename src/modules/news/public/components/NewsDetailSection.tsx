"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import Link from "next/link";
import "react-image-lightbox/style.css";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchNewsBySlug,
  fetchNews,
  clearNewsMessages,
} from "@/modules/news/slice/newsSlice";
import {
  Skeleton,
  ErrorMessage
 } from "@/shared";
import {
  CommentForm,
  CommentList,
 } from "@/modules/comment";

const Lightbox = dynamic(() => import("react-image-lightbox"), { ssr: false });

export default function NewsDetailSection() {
  const { slug } = useParams() as { slug: string };
  const { i18n, t } = useTranslation("news");
  const dispatch = useAppDispatch();

  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";

  const { selectedNews, news, loading, error } = useAppSelector(
    (state) => state.news
  );

  const [photoIndex, setPhotoIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      dispatch(fetchNewsBySlug(slug));
    }
    dispatch(fetchNews(lang));

    return () => {
      dispatch(clearNewsMessages());
    };
  }, [dispatch, slug, lang]);

  const otherNews = news.filter((n) => n.slug !== slug).slice(0, 2);

  if (loading) {
    return (
      <Container>
        <Skeleton/>
      </Container>
    );
  }

  if (error || !selectedNews) {
    return (
      <Container>
        <ErrorMessage />
      </Container>
    );
  }

  return (
    <Container
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Title>{selectedNews.title?.[lang]}</Title>

      {selectedNews.images?.length > 0 && (
        <Gallery>
          {selectedNews.images.map((img, idx) => (
            <ImageWrapper
              key={idx}
              onClick={() => {
                setPhotoIndex(idx);
                setIsOpen(true);
              }}
            >
              <img src={img.url} alt={`image-${idx}`} />
            </ImageWrapper>
          ))}
        </Gallery>
      )}

      <Content
        dangerouslySetInnerHTML={{ __html: selectedNews.content?.[lang] || "" }}
      />

      {isOpen && selectedNews.images?.length > 0 && (
        <Lightbox
          mainSrc={selectedNews.images[photoIndex].url}
          nextSrc={
            selectedNews.images[(photoIndex + 1) % selectedNews.images.length]
              .url
          }
          prevSrc={
            selectedNews.images[
              (photoIndex + selectedNews.images.length - 1) %
                selectedNews.images.length
            ].url
          }
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() =>
            setPhotoIndex(
              (photoIndex + selectedNews.images.length - 1) %
                selectedNews.images.length
            )
          }
          onMoveNextRequest={() =>
            setPhotoIndex((photoIndex + 1) % selectedNews.images.length)
          }
          imageCaption={selectedNews.title?.[lang]}
        />
      )}

      <MetaInfo>
        {selectedNews.author && <MetaItem>✍️ {selectedNews.author}</MetaItem>}
        {selectedNews.publishedAt && (
          <MetaItem>
            🗓{" "}
            {new Date(selectedNews.publishedAt).toLocaleDateString(lang, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </MetaItem>
        )}
        {selectedNews.tags?.length > 0 && (
          <Tags>
            {selectedNews.tags.map((tag, i) => (
              <Tag key={i}>#{tag}</Tag>
            ))}
          </Tags>
        )}
      </MetaInfo>

      {otherNews.length > 0 && (
        <OtherNews>
          <h3>{t("other", "Diğer Haberler")}</h3>
          <NewsList>
            {otherNews.map((item) => (
              <NewsItem key={item._id}>
                <Link href={`/news/${item.slug}`}>{item.title?.[lang]}</Link>
              </NewsItem>
            ))}
          </NewsList>
        </OtherNews>
      )}

      <CommentForm contentId={selectedNews._id} contentType="news" />
      <CommentList contentId={selectedNews._id} contentType="news" />
    </Container>
  );
}

// Styled Components
const Container = styled(motion.section)`
  max-width: 900px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xxl}
    ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const Gallery = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ImageWrapper = styled.div`
  flex: 1 1 280px;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: transform 0.3s ease;
  cursor: pointer;

  img {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: ${({ theme }) => theme.radii.sm};
  }

  &:hover {
    transform: scale(1.02);
  }
`;

const Content = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.7;

  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const MetaInfo = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Tag = styled.span`
  background: ${({ theme }) => theme.colors.tagBackground || "#eee"};
  color: ${({ theme }) => theme.colors.text};
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 500;
`;

const OtherNews = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xxl};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacing.lg};
`;

const NewsList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const NewsItem = styled.li`
  font-size: ${({ theme }) => theme.fontSizes.base};

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;
