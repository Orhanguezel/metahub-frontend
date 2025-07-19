"use client";

import styled from "styled-components";
import Link from "next/link";
import translations from "@/modules/about/locales";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { Skeleton, ErrorMessage } from "@/shared";
import Image from "next/image";
import type { SupportedLocale } from "@/types/common";
import { FaChartLine, FaLightbulb, FaFlask } from "react-icons/fa"; // Örnek ikonlar

export default function AboutSection() {
  const { i18n, t } = useI18nNamespace("about", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "about")) {
      i18n.addResourceBundle(lng, "about", resources, true, true);
    }
  });

  const { about, loading, error } = useAppSelector((state) => state.about);

  if (loading) {
    return (
      <Section>
        <AboutGrid>
          <Left>
            <Skeleton />
            <Skeleton  />
            <Skeleton />
          </Left>
          <Right>
            <Skeleton />
          </Right>
        </AboutGrid>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <AboutGrid>
          <ErrorMessage />
        </AboutGrid>
      </Section>
    );
  }

  if (!about || about.length === 0) {
    return (
      <Section>
        <AboutGrid>
          <Left>
            <MainTitle>{t("page.about.allAbout", "Hakkımızda")}</MainTitle>
            <Desc>{t("about.about.empty", "Hakkında içeriği bulunamadı.")}</Desc>
          </Left>
        </AboutGrid>
      </Section>
    );
  }

  // --- 3 yazı ve resim ---
  const main = about[0];
  const highlights = about.slice(0, 3);

  // Öne çıkan değerler (ikon + başlık + özet) örneği
  const features = [
    {
      icon: <FaChartLine size={32} color="#2875c2" />,
      title: highlights[0]?.title?.[lang] || highlights[0]?.title?.en || "-",
      summary: highlights[0]?.summary?.[lang] || highlights[0]?.summary?.en || "-",
    },
    {
      icon: <FaLightbulb size={32} color="#2875c2" />,
      title: highlights[1]?.title?.[lang] || highlights[1]?.title?.en || "-",
      summary: highlights[1]?.summary?.[lang] || highlights[1]?.summary?.en || "-",
    },
    {
      icon: <FaFlask size={32} color="#2875c2" />,
      title: highlights[2]?.title?.[lang] || highlights[2]?.title?.en || "-",
      summary: highlights[2]?.summary?.[lang] || highlights[2]?.summary?.en || "-",
    },
  ];

  return (
    <Section
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.66 }}
      viewport={{ once: true }}
    >
      <AboutGrid>
        {/* SOL BLOK */}
        <Left>
          <MinorTitle>{t("page.about.minorTitle", "HAKKIMIZDA")}</MinorTitle>
          <MainTitle>
            {main.title?.[lang] || main.title?.en || t("page.about.title", "Ensotek Hakkında")}
          </MainTitle>
          <Desc>
            {main.summary?.[lang] || main.summary?.en || ""}
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
          <SeeAllBtn href="/about">
            {t("page.about.all", "Daha Fazla Bilgi")}
          </SeeAllBtn>
        </Left>

        {/* SAĞ BLOK - GÖRSELLER */}
        <Right>
          <MainImageWrap>
            {main.images?.[0]?.url && (
              <MainImage
                src={main.images[0].url}
                alt={main.title?.[lang] || "About"}
                width={330}
                height={210}
                style={{ objectFit: "cover", borderRadius: "18px" }}
                priority
              />
            )}
          </MainImageWrap>
          <StackedImages>
            {highlights.slice(1, 3).map((item, idx) =>
              item.images?.[0]?.url ? (
                <StackedImage
                  key={idx}
                  src={item.images[0].url}
                  alt={item.title?.[lang] || "About"}
                  width={135}
                  height={90}
                  style={{
                    objectFit: "cover",
                    borderRadius: "14px",
                    marginTop: idx === 1 ? "12px" : "0"
                  }}
                  loading="lazy"
                />
              ) : null
            )}
          </StackedImages>
        </Right>
      </AboutGrid>
    </Section>
  );
}

// --- STYLES ---
const Section = styled(motion.section)`
  background: ${({ theme }) => theme.colors.sectionBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.xxl};
  width: 100%;
`;

const AboutGrid = styled.div`
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
    gap: 2.5rem;
    padding: 0 ${({ theme }) => theme.spacings.sm};
    align-items: center;
  }
`;

const Left = styled.div`
  flex: 1.1 1 340px;
  min-width: 320px;
  max-width: 540px;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  justify-content: flex-start;
  ${({ theme }) => theme.media.small} {
    max-width: 100%;
    align-items: center;
    text-align: center;
    gap: 2rem;
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
  grid-template-columns: 1fr 1fr;
  gap: 1.3rem 2.1rem;
  margin: 2.1rem 0 1.1rem 0;

  ${({ theme }) => theme.media.small} {
    grid-template-columns: 1fr;
    gap: 1.3rem 0;
    margin: 1.6rem 0 0.9rem 0;
  }
`;

const Feature = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.1rem;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: 1rem 1.2rem 1rem 1.2rem;
  transition: box-shadow 0.18s, transform 0.14s;
  &:hover, &:focus-visible {
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-4px) scale(1.025);
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
  border-radius: ${({ theme }) => theme.radii.circle};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.xs};
`;

const FeatureText = styled.div`
  flex: 1;
`;

const FeatureTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.title};
  margin-bottom: 0.18rem;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const FeatureDesc = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SeeAllBtn = styled(Link)`
  display: inline-block;
  margin-top: 2.1rem;
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

const Right = styled.div`
  flex: 1.5 1 320px;
  min-width: 270px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1.7rem;
  ${({ theme }) => theme.media.small} {
    flex-direction: row;
    align-items: center;
    gap: 1.15rem;
    margin-top: 1.5rem;
    justify-content: center;
    width: 100%;
  }
`;

const MainImageWrap = styled.div`
  width: 340px;
  height: 220px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  box-shadow: 0 8px 30px 0 rgba(40,117,194,0.16), ${({ theme }) => theme.shadows.lg};
  margin-bottom: 0.8rem;
  position: relative;
  isolation: isolate;
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: ${({ theme }) => theme.radii.xl};
    background: linear-gradient(120deg, rgba(40,117,194,0.07) 12%, rgba(11,182,214,0.06) 100%);
    z-index: 1;
  }
  ${({ theme }) => theme.media.small} {
    width: 100vw;
    min-width: 170px;
    height: 170px;
    max-width: 340px;
    margin: 0 auto 0.6rem auto;
  }
`;

const MainImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  position: relative;
  z-index: 2;
`;

const StackedImages = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  ${({ theme }) => theme.media.small} {
    flex-direction: row;
    gap: 0.85rem;
  }
`;
const StackedImage = styled(Image)`
  width: 110px;
  height: 72px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  box-shadow: 0 2px 14px 0 rgba(40,117,194,0.07);
  transition: box-shadow 0.17s, transform 0.15s;
  cursor: pointer;
  &:hover, &:focus-visible {
    box-shadow: 0 7px 32px 0 rgba(40,117,194,0.14);
    transform: scale(1.055);
    outline: none;
  }
  ${({ theme }) => theme.media.small} {
    width: 175px;
    height: 152px;
  }
`;

