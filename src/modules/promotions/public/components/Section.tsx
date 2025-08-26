"use client";
import styled from "styled-components";
import Link from "next/link";
import translations from "@/modules/promotions/locales";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { Skeleton, ErrorMessage, SeeAllBtn } from "@/shared";
import Image from "next/image";
import type { SupportedLocale } from "@/types/common";
import { FaChartLine, FaLightbulb } from "react-icons/fa";

export default function PromotionsSection() {
  const { i18n, t } = useI18nNamespace("promotions", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "promotions")) {
      i18n.addResourceBundle(lng, "promotions", resources, true, true);
    }
  });

  const { promotions, loading, error } = useAppSelector((state) => state.promotions);

  if (loading) {
    return (
      <Section>
        <PromotionsGrid>
          <Left>
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </Left>
          <Right>
            <Skeleton />
          </Right>
        </PromotionsGrid>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <PromotionsGrid>
          <ErrorMessage />
        </PromotionsGrid>
      </Section>
    );
  }

  if (!Array.isArray(promotions) || promotions.filter(Boolean).length === 0) {
    return (
      <Section>
        <PromotionsGrid>
          <Left>
            <MainTitle>{t("page.promotions.allPromotions", "Hakkımızda")}</MainTitle>
            <Desc>{t("promotions.promotions.empty", "Hakkında içeriği bulunamadı.")}</Desc>
          </Left>
        </PromotionsGrid>
      </Section>
    );
  }

  const validPromotions = promotions.filter((item) => !!item && typeof item === "object");
  const main = validPromotions[0] || {};
  const featuresData = [validPromotions[1] || {}, validPromotions[2] || {}];

  const icons = [
    <FaChartLine size={32} color="#2875c2" key="vizyon" />,
    <FaLightbulb size={32} color="#2875c2" key="misyon" />,
  ];

  const features = featuresData.map((item, i) => ({
    icon: icons[i],
    title: item?.title?.[lang] || item?.title?.en || "-",
    summary: item?.summary?.[lang] || item?.summary?.en || "-",
    slug: item?.slug || "",
  }));

  // Sağdaki ek görseller
  const rightImages = validPromotions
    .filter(
      (item) =>
        !!item &&
        !!main &&
        typeof item.slug === "string" &&
        typeof main.slug === "string" &&
        item.slug !== main.slug &&
        item.images?.[0]?.url
    )
    .slice(0, 2);

  return (
    <Section
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.66 }}
      viewport={{ once: true }}
    >
      <PromotionsGrid>
        {/* SOL BLOK */}
        <Left>
          <MinorTitle>{t("page.promotions.minorTitle", "HAKKIMIZDA")}</MinorTitle>
          <MainTitle>
            {main?.title?.[lang] ||
              main?.title?.en ||
              t("page.promotions.title", "Ensotek Hakkında")}
          </MainTitle>
          <Desc>
            {main?.summary?.[lang] || main?.summary?.en || ""}
          </Desc>
          <Features>
            {features.map((item, i) => (
              <Feature key={i}>
                <IconWrap>{item.icon}</IconWrap>
                <FeatureText>
                  <FeatureTitle>{item.title}</FeatureTitle>
                  <FeatureDesc>{item.summary}</FeatureDesc>
                </FeatureText>
              </Feature>
            ))}
          </Features>
          <SeeAllBtn href="/promotions">
            {t("page.promotions.all", "Daha Fazla Bilgi")}
          </SeeAllBtn>
        </Left>

        {/* SAĞ BLOK */}
        <Right>
          {main?.slug && main?.images?.[0]?.url && (
            <MainImageWrap as={Link} href={`/promotions/${main.slug}`}>
              {/* width/height kaldırıldı, fill + aspect-ratio kullanılıyor */}
              <MainImage
                src={main.images[0].url}
                alt={main.title?.[lang] || "Promotions"}
                fill
                sizes="(max-width: 600px) 100vw, 340px"
                priority
              />
            </MainImageWrap>
          )}

          <StackedImages>
            {rightImages.map(
              (item) =>
                item?.images?.[0]?.url &&
                item?.slug && (
                  <StackedImageLink key={item.slug} href={`/promotions/${item.slug}`}>
                    <StackedImageFrame>
                      {/* width/height kaldırıldı, fill + aspect-ratio kullanılıyor */}
                      <StackedImage
                        src={item.images[0].url}
                        alt={item.title?.[lang] || "Promotions"}
                        fill
                        sizes="(max-width: 600px) 50vw, 135px"
                      />
                    </StackedImageFrame>
                  </StackedImageLink>
                )
            )}
          </StackedImages>
        </Right>
      </PromotionsGrid>
    </Section>
  );
}

/* ===================== Styles ===================== */

const Section = styled(motion.section)`
  background: ${({ theme }) => theme.colors.sectionBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.xxl};
  width: 100%;
`;

const PromotionsGrid = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  gap: 2.8rem;
  align-items: flex-start;
  padding: 0 ${({ theme }) => theme.spacings.xl};
  flex-wrap: wrap;

  ${({ theme }) => theme.media.medium} {
    padding: 0 ${({ theme }) => theme.spacings.md};
    gap: 2rem;
  }
  ${({ theme }) => theme.media.small} {
    flex-direction: column;
    gap: 2rem;
    padding: 0 ${({ theme }) => theme.spacings.sm};
    text-align: center;
    align-items: center;
  }
`;

const Left = styled.div`
  flex: 1.1 1 440px;
  min-width: 440px;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  justify-content: flex-start;

  ${({ theme }) => theme.media.small} {
    min-width: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
    align-items: center;
    text-align: center;
    gap: 2rem;
  }
`;

const Right = styled.div`
  flex: 1.5 1 320px;
  min-width: 270px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1.7rem;

  ${({ theme }) => theme.media.small} {
    min-width: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
    margin: 0 auto;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
`;

/* --- Ana görsel: fill + aspect-ratio --- */
const MainImageWrap = styled(Link)`
  width: 340px;
  aspect-ratio: 16 / 9;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  overflow: hidden;
  box-shadow: 0 8px 30px 0 rgba(40,117,194,0.16), ${({ theme }) => theme.shadows.lg};
  margin-bottom: 0.8rem;
  position: relative; /* fill için gerekli */
  isolation: isolate;
  cursor: pointer;
  display: block;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(120deg, rgba(40,117,194,0.07) 12%, rgba(11,182,214,0.06) 100%);
    z-index: 1;
  }

  &:hover, &:focus-visible {
    box-shadow: 0 12px 38px 0 rgba(40,117,194,0.25), ${({ theme }) => theme.shadows.xl};
    transform: scale(1.025);
  }

  ${({ theme }) => theme.media.small} {
    width: 100%;
    max-width: 340px;
    min-width: 170px;
    /* sabit height kaldırıldı; aspect-ratio korunsun */
    margin: 0 auto 0.5rem auto;
  }
`;

const MainImage = styled(Image)`
  object-fit: cover;
  display: block;
  z-index: 2;
`;

/* --- Küçük yığılmış görseller: frame + fill --- */
const StackedImages = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.15rem;

  ${({ theme }) => theme.media.small} {
    width: 100%;
    max-width: 340px;
    flex-direction: row;
    justify-content: center;
    gap: 0.85rem;
  }
`;

const StackedImageLink = styled(Link)`
  display: block;
  cursor: pointer;
`;

/* Görsel için oranlı çerçeve (3:2) */
const StackedImageFrame = styled.div`
  width: 135px;
  aspect-ratio: 3 / 2;
  position: relative; /* fill için zorunlu */
  overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  box-shadow: 0 2px 14px 0 rgba(40,117,194,0.07);
  transition: box-shadow 0.17s, transform 0.15s;

  &:hover, &:focus-visible {
    box-shadow: 0 7px 32px 0 rgba(40,117,194,0.14);
    transform: translateY(-2px);
    outline: none;
  }

  ${({ theme }) => theme.media.small} {
    width: 50%;
    max-width: 170px;
  }
`;

const StackedImage = styled(Image)`
  object-fit: cover;
  transition: transform 0.15s;
  /* hover efekti için frame’den hedefle */
  ${StackedImageFrame}:hover &,
  ${StackedImageFrame}:focus-visible & {
    transform: scale(1.055);
  }
`;

const MinorTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.accent};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

const MainTitle = styled.h2`
  font-size: clamp(2.2rem, 3.3vw, 2.7rem);
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  margin: 0 0 0.45em 0;
  letter-spacing: -0.01em;
  line-height: 1.13;
`;

const Desc = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.base};
  line-height: 1.7;
  margin-bottom: 1.8rem;
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.2rem 1.3rem;
  margin: 2.5rem 0 1.3rem 0;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
    gap: 1.3rem;
    margin: 1.4rem 0 0.7rem 0;
  }
`;

const Feature = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.12rem;
  background: ${({ theme }) => theme.colors.cardBackground || "#fff"};
  border: 1.5px solid ${({ theme }) => theme.colors.borderLight || "#f1f3f8"};
  box-shadow: 0 2px 14px 0 rgba(40,117,194,0.07);
  padding: 1.45rem 1.1rem 1.15rem 1.15rem;
  min-height: 145px;
  transition: box-shadow 0.17s, transform 0.16s, border-color 0.15s;
  cursor: pointer;

  &:hover, &:focus-visible {
    box-shadow: 0 8px 26px 0 rgba(40,117,194,0.13);
    transform: translateY(-5px) scale(1.032);
    border-color: ${({ theme }) => theme.colors.primaryTransparent};
    outline: none;
  }
`;

const IconWrap = styled.div`
  min-width: 44px;
  min-height: 44px;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primaryTransparent} 40%,
    ${({ theme }) => theme.colors.backgroundAlt} 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.xs};
  font-size: 1.8rem;
`;

const FeatureText = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const FeatureTitle = styled.h3`
  font-size: 1.14rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: 0.21rem;
  line-height: 1.2;
  white-space: pre-line;
`;

const FeatureDesc = styled.div`
  font-size: 0.97rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.95;
  line-height: 1.55;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  min-height: 2.7em;
`;
