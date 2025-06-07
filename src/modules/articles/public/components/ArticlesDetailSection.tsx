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
  fetchArticlesBySlug,
  fetchArticles,
  clearArticlesMessages,
} from "@/modules/articles/slice/articlesSlice";

import { Skeleton, ErrorMessage } from "@/shared";
import { CommentForm, CommentList } from "@/modules/comment";

const Lightbox = dynamic(() => import("react-image-lightbox"), { ssr: false });

export default function ArticlesDetailSection() {
  const { slug } = useParams() as { slug: string };
  const { t, i18n } = useTranslation("articles");
  const dispatch = useAppDispatch();

  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";
  const { selected, articles, loading, error } = useAppSelector(
    (state) => state.articles
  );

  const [photoIndex, setPhotoIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      dispatch(fetchArticlesBySlug(slug));
      dispatch(fetchArticles(lang));
    }

    return () => {
      dispatch(clearArticlesMessages());
    };
  }, [dispatch, slug, lang]);

  const otherArticles = articles.filter((a) => a.slug !== slug).slice(0, 2);

  if (loading) {
    return (
      <Container>
        <Skeleton />
      </Container>
    );
  }

  if (error || !selected) {
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
      <Title>{selected.title?.[lang]}</Title>

      {selected.images?.length > 0 && (
        <Gallery>
          {selected.images.map((img, idx) => (
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
        dangerouslySetInnerHTML={{ __html: selected.content?.[lang] || "" }}
      />

      {isOpen && (
        <Lightbox
          mainSrc={selected.images[photoIndex].url}
          nextSrc={
            selected.images[(photoIndex + 1) % selected.images.length].url
          }
          prevSrc={
            selected.images[
              (photoIndex + selected.images.length - 1) % selected.images.length
            ].url
          }
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() =>
            setPhotoIndex(
              (photoIndex + selected.images.length - 1) % selected.images.length
            )
          }
          onMoveNextRequest={() =>
            setPhotoIndex((photoIndex + 1) % selected.images.length)
          }
          imageCaption={selected.title?.[lang]}
        />
      )}

      <MetaInfo>
        {selected.author && <MetaItem>✍️ {selected.author}</MetaItem>}
        {selected.publishedAt && (
          <MetaItem>
            🗓{" "}
            {new Date(selected.publishedAt).toLocaleDateString(lang, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </MetaItem>
        )}
        {selected.tags?.length > 0 && (
          <Tags>
            {selected.tags.map((tag, i) => (
              <Tag key={i}>#{tag}</Tag>
            ))}
          </Tags>
        )}
      </MetaInfo>

      {otherArticles.length > 0 && (
        <OtherSection>
          <h3>{t("other")}</h3>
          <OtherList>
            {otherArticles.map((item) => (
              <OtherItem key={item._id}>
                <Link href={`/articles/${item.slug}`}>
                  {item.title?.[lang]}
                </Link>
              </OtherItem>
            ))}
          </OtherList>
        </OtherSection>
      )}

      <CommentForm contentId={selected._id} contentType="articles" />
      <CommentList contentId={selected._id} contentType="articles" />
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

const OtherSection = styled.div`
  margin-top:  ${({ theme }) => theme.spacing.xxl};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacing.lg};
`;

const OtherList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
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
