"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { motion } from "framer-motion";
import translations from "@/modules/promotions/locales";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import Link from "next/link";
import Image from "next/image";
import { Skeleton, ErrorMessage } from "@/shared";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearPromotionsMessages,
  fetchPromotionsBySlug,
  setSelectedPromotions,
} from "@/modules/promotions/slice";
import type { IPromotions } from "@/modules/promotions";
import { SupportedLocale, getMultiLang } from "@/types/common";

export default function PromotionsDetailSection() {
  const { i18n, t } = useI18nNamespace("promotions", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { slug } = useParams() as { slug: string };
  const dispatch = useAppDispatch();

  Object.entries(translations).forEach(([locale, resources]) => {
    if (!i18n.hasResourceBundle(locale, "promotions")) {
      i18n.addResourceBundle(locale, "promotions", resources, true, true);
    }
  });

  const {
    selected: promotions,
    promotions: allPromotions,
    loading,
    error,
  } = useAppSelector((state) => state.promotions);

  useEffect(() => {
    if (allPromotions && allPromotions.length > 0) {
      const found = allPromotions.find((item: IPromotions) => item.slug === slug);
      if (found) {
        dispatch(setSelectedPromotions(found));
      } else {
        dispatch(fetchPromotionsBySlug(slug));
      }
    } else {
      dispatch(fetchPromotionsBySlug(slug));
    }
    return () => {
      dispatch(clearPromotionsMessages());
    };
  }, [dispatch, allPromotions, slug]);

  if (loading) {
    return (
      <Container>
        <Skeleton />
      </Container>
    );
  }

  if (error || !promotions) {
    return (
      <Container>
        <ErrorMessage />
      </Container>
    );
  }

  const otherPromotions = allPromotions.filter((item: IPromotions) => item.slug !== slug);

  return (
    <Container
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.57 }}
    >
      {/* Başlık */}
      <Title>{getMultiLang(promotions.title, lang)}</Title>

      {/* Büyük görsel */}
      {promotions.images?.[0]?.url && (
        <ImageWrapper>
          <StyledImage
            src={promotions.images[0].url}
            alt={getMultiLang(promotions.title, lang)}
            width={1080}
            height={410}
            priority
          />
        </ImageWrapper>
      )}

      {/* Özet (Kısa Bilgi) */}
      {promotions.summary && getMultiLang(promotions.summary, lang) && (
        <SummaryBox>
          <div>{getMultiLang(promotions.summary, lang)}</div>
        </SummaryBox>
      )}

      {/* Ana içerik */}
      {promotions.content && getMultiLang(promotions.content, lang) && (
        <ContentBox>
          <div
            className="promotions-content"
            dangerouslySetInnerHTML={{ __html: getMultiLang(promotions.content, lang) }}
          />
        </ContentBox>
      )}

      {/* Diğer içerikler */}
      {otherPromotions?.length > 0 && (
        <OtherSection>
          <OtherTitle>{t("page.other", "Diğer Hakkımızda İçerikleri")}</OtherTitle>
          <OtherGrid>
            {otherPromotions.map((item: IPromotions) => (
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
                  <Link href={`/promotions/${item.slug}`}>
                    {getMultiLang(item.title, lang)}
                  </Link>
                </OtherTitleMini>
              </OtherCard>
            ))}
          </OtherGrid>
        </OtherSection>
      )}
    </Container>
  );
}

// --------- STYLES -----------

const Container = styled(motion.section)`
  max-width: 950px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxxl} ${({ theme }) => theme.spacings.md};
  @media (max-width: 650px) {
    padding: ${({ theme }) => theme.spacings.lg} ${({ theme }) => theme.spacings.xs};
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  text-align: center;
  letter-spacing: 0.01em;
`;

const ImageWrapper = styled.div`
  width: 100%;
  margin: 0 auto ${({ theme }) => theme.spacings.xl};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.md};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledImage = styled(Image)`
  max-width: 100%;
  height: auto;
  object-fit: contain !important;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  display: block;
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
