"use client";

import styled from "styled-components";
import Link from "next/link";
import translations from "@/modules/about/locales";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { Skeleton, ErrorMessage, SeeAllBtn } from "@/shared";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { SupportedLocale } from "@/types/common";
import type { IAbout } from "@/modules/about/types";
import { FaChartLine, FaLightbulb } from "react-icons/fa";

/* sabit ikonlar */
const ICONS = [
  <FaChartLine size={32} color="#2875c2" key="vizyon" />,
  <FaLightbulb size={32} color="#2875c2" key="misyon" />,
];

export default function AboutSection() {
  const { i18n, t } = useI18nNamespace("about", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // slice'a dokunmuyoruz
  const { about, loading, error } = useAppSelector((s) => s.about ?? {});

  // ---- hooks (returnlerden önce) ----
  const validAbout: IAbout[] = useMemo(
    () => (Array.isArray(about) ? about.filter((x) => x && typeof x === "object") : []),
    [about]
  );
  const main = useMemo<IAbout | null>(() => (validAbout.length ? validAbout[0] : null), [validAbout]);

  const features = useMemo(() => {
    const arr = [validAbout[1], validAbout[2]].filter(Boolean) as IAbout[];
    return arr.map((item, i) => ({
      icon: ICONS[i],
      title: item.title?.[lang] || item.title?.en || "-",
      summary: item.summary?.[lang] || item.summary?.en || "-",
      slug: item.slug || "",
    }));
  }, [validAbout, lang]);

  const rightImagesRaw = useMemo(() => {
    if (!main?.slug) return [] as IAbout[];
    return validAbout
      .filter((item) => item.slug && item.slug !== main.slug && item.images?.[0]?.url)
      .slice(0, 2);
  }, [validAbout, main?.slug]);

  // ---- erken dönüşler ----
  if (loading) {
    return (
      <Section>
        <AboutGrid>
          <Left><Skeleton /><Skeleton /><Skeleton /></Left>
          <Right><Skeleton /></Right>
        </AboutGrid>
      </Section>
    );
  }
  if (error) {
    return (
      <Section>
        <AboutGrid><ErrorMessage /></AboutGrid>
      </Section>
    );
  }
  if (!validAbout.length) {
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

  return (
    <Section
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.66 }}
      viewport={{ once: true }}
    >
      <AboutGrid>
        {/* SOL */}
        <Left>
          <MinorTitle>{t("page.about.minorTitle", "HAKKIMIZDA")}</MinorTitle>
          <MainTitle>
            {main?.title?.[lang] || main?.title?.en || t("page.about.title", "Ensotek Hakkında")}
          </MainTitle>
          <Desc>{main?.summary?.[lang] || main?.summary?.en || ""}</Desc>

          <Features>
            {features.map((it, i) => (
              <Feature key={i}>
                <IconWrap>{it.icon}</IconWrap>
                <FeatureText>
                  <FeatureTitle>{it.title}</FeatureTitle>
                  <FeatureDesc>{it.summary}</FeatureDesc>
                </FeatureText>
              </Feature>
            ))}
          </Features>

          <SeeAllBtn href="/about">{t("page.about.all", "Daha Fazla Bilgi")}</SeeAllBtn>
        </Left>

        {/* SAĞ */}
        <Right>
          <MainImageBlock
            href={main?.slug ? `/about/${main.slug}` : ""}
            src={main?.images?.[0]?.url}
            alt={main?.title?.[lang] || "About"}
          />

          {rightImagesRaw.length > 0 && (
            <ThumbRow>
              {rightImagesRaw.map((item) => (
                <ThumbImageBlock
                  key={item.slug}
                  href={`/about/${item.slug}`}
                  src={item.images?.[0]?.url}
                  alt={item.title?.[lang] || "About"}
                />
              ))}
            </ThumbRow>
          )}
        </Right>
      </AboutGrid>
    </Section>
  );
}

/* ---------- görsel yardımcıları ---------- */

function MainImageBlock({ href, src, alt }: { href?: string; src?: string; alt?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  if (!src || !href || errored) return null;
  return (
    <MainImageWrap as={Link} href={href}>
      <MainImage
        src={src}
        alt={alt || ""}
        fill
        sizes="(max-width: 600px) 100vw, 340px"
        priority
        style={{ opacity: loaded ? 1 : 0 }}
        onError={() => setErrored(true)}
        onLoadingComplete={() => setLoaded(true)}
      />
    </MainImageWrap>
  );
}

/* THUMBNAIL: next/image yerine <img> */
function ThumbImageBlock({ href, src, alt }: { href: string; src?: string; alt?: string }) {
  if (!src) return null;
  return (
    <ThumbLink href={href}>
      <ThumbFrame>
        <ThumbImg src={src} alt={alt || ""} loading="lazy" decoding="async" />
      </ThumbFrame>
    </ThumbLink>
  );
}

/* ===================== Styles ===================== */

const Section = styled(motion.section)`
  background: ${({ theme }) => theme.colors.sectionBackground};
  color: ${({ theme }) => theme.colors.text};
  /* Alt boşluğu küçülttük */
  padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.xl};

  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.lg};
  }
`;

const AboutGrid = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  gap: 2.4rem;             /* biraz daralttık */
  align-items: flex-start;
  padding: 0 ${({ theme }) => theme.spacings.xl};
  flex-wrap: wrap;

  ${({ theme }) => theme.media.medium} {
    padding: 0 ${({ theme }) => theme.spacings.md};
    gap: 2rem;
  }
  ${({ theme }) => theme.media.small} {
    flex-direction: column;
    gap: 1.6rem;           /* mobilde dikey boşluk azaldı */
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

  ${({ theme }) => theme.media.small} {
    min-width: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
    align-items: center;
    text-align: center;
    gap: 1.4rem;
  }
`;

const Right = styled.div`
  flex: 1.5 1 320px;
  min-width: 270px;
  display: flex;
  flex-direction: column;
  align-items: center;     /* ✔ her şeyi ortala */
  justify-content: right;
  gap: 0.9rem;             /* görseller arası boşluk azaldı */
  line-height: 0;
  width: 100%;

  ${({ theme }) => theme.media.small} {
    max-width: 100% !important;
    margin: 0 auto;
    gap: ${({ theme }) => theme.spacings.sm};
  }
`;

/* Ana görsel – Next/Image */
const MainImageWrap = styled(Link)`
  width: 340px;
  aspect-ratio: 16 / 9;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  overflow: hidden;
  box-shadow: 0 8px 30px 0 rgba(40,117,194,0.16), ${({ theme }) => theme.shadows.lg};
  margin: 0 auto ${({ theme }) => theme.spacings.xs};   /* ✔ ortala + alttaki boşluk azalt */
  position: relative;
  display: block;
  line-height: 0;

  ${({ theme }) => theme.media.small} {
    width: 100%;
    max-width: 340px;
    margin: 0 auto ${({ theme }) => theme.spacings.xs};
  }
`;
const MainImage = styled(Image)`
  object-fit: cover;
  display: block;
  z-index: 2;
  transition: opacity 180ms ease;
`;

/* Küçükler – mobilde en altta yan yana ve ortada */
const ThumbRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: right;     /* ✔ sağa yasla (desktop’ta da) */
  align-items: center;
  gap: 0.8rem;
  width: 100%;
  max-width: 340px;            /* ana görselle aynı genişlik */
  margin: 0 auto;              /* ✔ ortala */

  ${({ theme }) => theme.media.small} {
    max-width: 340px;
    gap: 0.5rem;
    justify-content: center; 
  }
`;

const ThumbLink = styled(Link)` display: block; cursor: pointer; `;

const ThumbFrame = styled.div`
  width: 135px;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  box-shadow: 0 2px 14px 0 rgba(40,117,194,0.07);
  line-height: 0;

  ${({ theme }) => theme.media.small} {
    width: 48%;
    max-width: 170px;
  }
`;

const ThumbImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.15s;
  &:hover { transform: scale(1.055); }
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
  margin-bottom: 1.2rem;  /* biraz daha az */
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem 1.1rem;
  margin: 1.8rem 0 1rem 0;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin: 1.2rem 0 0.6rem 0;
  }
`;
const Feature = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1.5px solid ${({ theme }) => theme.colors.borderLight};
  box-shadow: 0 2px 14px 0 rgba(40,117,194,0.07);
  padding: 1.2rem 1rem 1rem 1rem;
  min-height: 135px;
`;
const IconWrap = styled.div`
  min-width: 44px; min-height: 44px;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primaryTransparent} 40%,
    ${({ theme }) => theme.colors.backgroundAlt} 100%
  );
  display: flex; align-items: center; justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.xs};
`;
const FeatureText = styled.div` flex: 1; display: flex; flex-direction: column; min-width: 0; `;
const FeatureTitle = styled.h3`
  font-size: 1.14rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: 0.21rem; line-height: 1.2; white-space: pre-line;
`;
const FeatureDesc = styled.div`
  font-size: 0.97rem; color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.55; overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 3; -webkit-box-orient: vertical; text-overflow: ellipsis;
  min-height: 2.7em;
`;
