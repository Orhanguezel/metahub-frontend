"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { motion } from "framer-motion";
import translations from "@/modules/news/locales";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
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
import type { INews } from "@/modules/news";
import { SupportedLocale, getMultiLang } from "@/types/common";
import {SocialLinks} from "@/modules/shared"; 

export default function NewsDetailSection() {
  const { i18n, t } = useI18nNamespace("news", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { slug } = useParams() as { slug: string };
  const dispatch = useAppDispatch();

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

  // Ana görsel state
  const [mainIndex, setMainIndex] = useState(0);

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
    setMainIndex(0);
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

  function formatText(txt: string | undefined) {
    if (!txt) return "";
    return txt.replace(/\\n/g, '\n');
  }

  const images = news.images || [];
  const mainImage = images[mainIndex];
  const thumbnails = images
    .map((img, idx) => ({ ...img, idx }))
    .filter((img) => img.idx !== mainIndex);

  const otherNews = allNews.filter((item: INews) => item.slug !== slug);

  return (
    <Container
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Başlık */}
      <Title>{getMultiLang(news.title, lang)}</Title>

      {/* Büyük görsel + thumb */}
      {mainImage?.url && (
        <ImageSection>
          <MainImageFrame>
            <StyledMainImage
              src={mainImage.url}
              alt={getMultiLang(news.title, lang)}
              width={800}
              height={450}
              priority
            />
          </MainImageFrame>
          {thumbnails.length > 0 && (
            <Gallery>
              {images.map((img, i) =>
                i === mainIndex ? null : (
                  <ThumbFrame
                    key={img.url + i}
                    $active={mainIndex === i}
                    onClick={() => setMainIndex(i)}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setMainIndex(i)}
                    aria-label={`Show image ${i + 1}`}
                  >
                    <StyledThumbImage
                      src={img.url}
                      alt={`${getMultiLang(news.title, lang)} thumbnail ${i + 1}`}
                      width={168}
                      height={96}
                      $active={mainIndex === i}
                    />
                  </ThumbFrame>
                )
              )}
            </Gallery>
          )}
        </ImageSection>
      )}

      {/* Sosyal medya paylaşım */}
      <SocialShareBox>
        <ShareLabel>{t("page.share", "Paylaş")}:</ShareLabel>
        <SocialLinks />
      </SocialShareBox>

      {/* Özet (Kısa Bilgi) */}
      {news.summary && getMultiLang(news.summary, lang) && (
        <SummaryBox>
          <ReactMarkdown>
            {formatText(getMultiLang(news.summary, lang))}
          </ReactMarkdown>
        </SummaryBox>
      )}

      {/* Ana içerik */}
      {news.content && getMultiLang(news.content, lang) && (
        <ContentBox>
          <ReactMarkdown>
            {formatText(getMultiLang(news.content, lang))}
          </ReactMarkdown>
        </ContentBox>
      )}

      {/* Diğer içerikler */}
      {otherNews?.length > 0 && (
        <OtherSection>
          <OtherTitle>{t("page.other", "Diğer Haberler")}</OtherTitle>
          <OtherGrid>
            {otherNews.map((item: INews) => (
              <OtherCard key={item._id} as={motion.div} whileHover={{ y: -6, scale: 1.025 }}>
                <OtherImgWrap>
                  {item.images?.[0]?.url ? (
                    <OtherImg
                      src={item.images[0].url}
                      alt={getMultiLang(item.title, lang)}
                      width={60}
                      height={40}
                    />
                  ) : (
                    <OtherImgPlaceholder />
                  )}
                </OtherImgWrap>
                <OtherTitleMini>
                  <Link href={`/news/${item.slug}`}>
                    {getMultiLang(item.title, lang)}
                  </Link>
                </OtherTitleMini>
              </OtherCard>
            ))}
          </OtherGrid>
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
  padding: ${({ theme }) => theme.spacings.xxl} ${({ theme }) => theme.spacings.md};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const ImageSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacings.xl};
`;

const MainImageFrame = styled.div`
  width: 100%;
  max-width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 18px;
  overflow: hidden;
  background: #e7edf3;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const StyledMainImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 18px;
`;

const Gallery = styled.div`
  margin-top: 1.15rem;
  display: flex;
  gap: 1.05rem;
  flex-wrap: wrap;
`;

const ThumbFrame = styled.button<{ $active?: boolean }>`
  border: none;
  background: none;
  padding: 0;
  outline: none;
  cursor: pointer;
  width: 168px;
  height: 96px;
  aspect-ratio: 16 / 9;
  border-radius: 11px;
  overflow: hidden;
  background: #eef5fa;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.15s, border 0.17s;
  border: 2.3px solid #e1e8ef;

  &:hover, &:focus-visible {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 5px 18px 0 rgba(40,117,194,0.13);
    outline: none;
  }
`;

const StyledThumbImage = styled(Image)<{ $active?: boolean }>`
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
  border-radius: 10px;
`;

const SocialShareBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6em;
  margin-bottom: 2.3em;
  margin-top: 0.7em;
`;

const ShareLabel = styled.div`
  font-size: 1.02em;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.85;
`;

const SummaryBox = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-left: 5px solid ${({ theme }) => theme.colors.accent};
  padding: ${({ theme }) => theme.spacings.xl} ${({ theme }) => theme.spacings.lg};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.xs};
`;

const ContentBox = styled.div`
  background: ${({ theme }) => theme.colors.contentBackground};
  padding: ${({ theme }) => theme.spacings.xl};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border-left: 6px solid ${({ theme }) => theme.colors.primary};
  line-height: 1.73;
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: 0.01em;

  h3 {
    margin-bottom: ${({ theme }) => theme.spacings.md};
    color: ${({ theme }) => theme.colors.primary};
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }
  p, div {
    margin-bottom: ${({ theme }) => theme.spacings.sm};
  }
`;

const OtherSection = styled.div`
  margin-top: ${({ theme }) => theme.spacings.xxl};
  border-top: 1.5px solid ${({ theme }) => theme.colors.borderLight};
  padding-top: ${({ theme }) => theme.spacings.lg};
`;

const OtherTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.large};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const OtherGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem 1.8rem;
  margin-top: 0.7rem;
`;

const OtherCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.xs};
  border: 1.3px solid ${({ theme }) => theme.colors.borderLight};
  padding: 1.1rem 1.2rem 1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 1.1rem;
  transition: box-shadow 0.18s, border 0.18s, transform 0.16s;
  cursor: pointer;
  min-height: 72px;

  &:hover, &:focus-visible {
    box-shadow: ${({ theme }) => theme.shadows.md};
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-5px) scale(1.035);
    z-index: 2;
  }
`;

const OtherImgWrap = styled.div`
  flex-shrink: 0;
  width: 60px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const OtherImg = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.radii.md};
`;

const OtherImgPlaceholder = styled.div`
  width: 60px;
  height: 40px;
  background: ${({ theme }) => theme.colors.skeleton};
  opacity: 0.36;
  border-radius: ${({ theme }) => theme.radii.md};
`;

const OtherTitleMini = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.primary};

  a {
    color: inherit;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;
