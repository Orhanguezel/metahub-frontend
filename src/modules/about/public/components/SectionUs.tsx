"use client";

import styled from "styled-components";
import translations from "@/modules/about/locales";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { Skeleton, ErrorMessage, SeeAllBtn } from "@/shared";
import Image from "next/image";
import { useMemo } from "react";
import type { SupportedLocale } from "@/types/common";
import type { IAbout } from "@/modules/about/types";

/* ========= Framer Motion variants ========= */
const fadeInLeft = {
  initial: { opacity: 0, x: -24, scale: 0.98 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const groupStagger = {
  initial: { opacity: 1 },
  animate: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

export default function AboutUsSection() {
  const { i18n, t } = useI18nNamespace("about", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const { about, loading, error } = useAppSelector((s) => s.about ?? {});
  const validAbout: IAbout[] = useMemo(
    () => (Array.isArray(about) ? about.filter((x) => x && typeof x === "object") : []),
    [about]
  );
  const main = useMemo<IAbout | null>(() => (validAbout.length ? validAbout[0] : null), [validAbout]);

  const features = useMemo(() => {
    const arr = [validAbout[1], validAbout[2]].filter(Boolean) as IAbout[];
    return arr.map((item) => ({
      title: item.title?.[lang] || item.title?.en || "-",
      summary: item.summary?.[lang] || item.summary?.en || "-",
      slug: item.slug || "",
    }));
  }, [validAbout, lang]);

  if (loading) {
    return (
      <Section>
        <Grid>
          <LeftCol><Skeleton style={{ width: "100%", height: "100%" }} /></LeftCol>
          <RightCol>
            <Skeleton style={{ height: 28, width: 220 }} />
            <Skeleton style={{ height: 44, width: 480, marginTop: 10 }} />
            <Skeleton style={{ height: 90, width: 520, marginTop: 12 }} />
            <Skeleton style={{ height: 22, width: 360, marginTop: 22 }} />
          </RightCol>
        </Grid>
      </Section>
    );
  }
  if (error) {
    return (
      <Section>
        <Grid><ErrorMessage /></Grid>
      </Section>
    );
  }
  if (!validAbout.length) {
    return (
      <Section>
        <Grid>
          <RightCol>
            <Small>{t("page.aboutus.minorTitle", "About Us")}</Small>
            <Title>{t("page.aboutus.title", "Hakkımızda")}</Title>
            <Text>{t("about.aboutus.empty", "Hakkında içeriği bulunamadı.")}</Text>
          </RightCol>
        </Grid>
      </Section>
    );
  }

  const mainImg = main?.images?.[0]?.url;

  return (
    <Section
      variants={groupStagger}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.25 }}
    >
      <Grid>
        {/* SOL — yalnızca 1. kaydın resmi */}
        <LeftCol>
          <VisualBoard>
            {mainImg && (
              main?.slug ? (
                <MainFigure
                  variants={fadeInLeft}
                  as={motion.div}
                  aria-label="main image"
                >
                  <MainImg src={mainImg} alt={main?.title?.[lang] || main?.title?.en || "About"} width={1400} height={1400} priority />
                </MainFigure>
              ) : (
                <MainFigure
                  variants={fadeInLeft}
                  as={motion.div}
                  aria-label="main image"
                >
                  <MainImg src={mainImg} alt={main?.title?.[lang] || main?.title?.en || "About"} width={1400} height={1400} priority />
                </MainFigure>
              )
            )}
          </VisualBoard>
        </LeftCol>

        {/* SAĞ — başlık, metin ve maddeler */}
        <RightCol as={motion.div} variants={groupStagger}>
          <Small as={motion.div} variants={fadeUp}>
            {t("page.aboutus.minorTitle", "About Us")}
          </Small>

          <Title as={motion.h2} variants={fadeUp}>
            {main?.title?.[lang] || main?.title?.en || t("page.aboutus.title", "Hakkımızda")}
          </Title>

          <Text as={motion.p} variants={fadeUp}>
            {main?.summary?.[lang] || main?.summary?.en || ""}
          </Text>

          <Bullets variants={groupStagger}>
            {(features.length ? features : [{ title: "-", summary: "-" }, { title: "-", summary: "-" }]).map((f, idx) => (
              <BulletItem key={idx} variants={fadeUp}>
                <span className="dot" aria-hidden />
                <div className="btxt">
                  <h4>{f.title}</h4>
                  <p>{f.summary}</p>
                </div>
              </BulletItem>
            ))}
          </Bullets>

          <motion.div variants={fadeUp}>
            <SeeAllBtn href="/aboutus">{t("page.aboutus.all", "Daha Fazla Bilgi")}</SeeAllBtn>
          </motion.div>
        </RightCol>
      </Grid>
    </Section>
  );
}

/* ===================== Styles ONLY (drop-in) ===================== */

const Section = styled(motion.section)`
  background: ${({ theme }) => theme.colors.sectionBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.xl};

  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.lg};
  }
`;

const Grid = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacings.xl};
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: clamp(24px, 4vw, 56px);
  align-items: center;

  ${({ theme }) => theme.media.medium} {
    padding: 0 ${({ theme }) => theme.spacings.md};
  }
  ${({ theme }) => theme.media.small} {
    grid-template-columns: 1fr;
    gap: clamp(8px, 2.5vw, 18px);
    padding: 0 ${({ theme }) => theme.spacings.sm};
    text-align: center;
    align-items: center;
  }
`;

/* SOL sütun – akışta kalsın, sabit min-height yok */
const LeftCol = styled.div`
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

const VisualBoard = styled.div`
  width: 100%;
`;

/* Next/Image wrapper – AKIŞTA, absolute DEĞİL, motion destekli */
const MainFigure = styled(motion.div)`
  width: 100%;
  max-width: 760px;
  margin: 0;

  & > span {
    position: relative !important;
    display: block !important;
    width: 100% !important;
    height: auto !important;
  }

  & > span > img {
    display: block !important;
    width: auto !important;
    max-width: 100% !important;
    height: clamp(420px, 68vh, 760px) !important;
    object-fit: contain !important;
    object-position: left center !important;
    filter: drop-shadow(0 10px 24px rgba(0,0,0,.12));
  }

  @media (max-width: 768px) {
    max-width: 560px;
    & > span > img {
      height: auto !important;
      width: 100% !important;
      object-position: center !important;
      filter: none;
    }
  }
`;

const MainImg = styled(Image)``;

/* SAĞ sütun */
const RightCol = styled.div`
  display: flex; flex-direction: column;
  gap: clamp(12px, 1.6vw, 20px);
  align-items: flex-start;

  ${({ theme }) => theme.media.small} {
    max-width: 100% !important;
    margin: 0 auto;
    gap: ${({ theme }) => theme.spacings.sm};
    align-items: center;
  }
`;

const Small = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: #e53935;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: .04em;
`;

const Title = styled.h2`
  margin: 0;
  font-size: clamp(2rem, 3.4vw, 3rem);
  line-height: 1.12;
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  color: ${({ theme }) => theme.colors.darkColor};
  @media (max-width: 480px) {
    text-align: center;
  }
`;

const Text = styled.p`
  margin: .2rem 0 1.1rem 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.65;
`;

/* Maddeler – motion + stagger */
const Bullets = styled(motion.ul)`
  list-style: none; padding: 0; margin: .2rem 0 1.2rem 0; display: grid; gap: 18px;
`;

const BulletItem = styled(motion.li)`
  display:flex; align-items:flex-start; gap: 12px;

  .dot{
    width: 18px; height: 18px; border-radius: 50%;
    border: 2px solid #000; margin-top: 4px;
    box-shadow: 0 0 0 4px rgba(0,0,0,0.05) inset;
  }
  .btxt{ flex:1; }
  .btxt h4{ margin: 0 0 4px 0; font-size: 1.05rem; color: ${({ theme }) => theme.colors.darkColor}; }
  .btxt p{ margin: 0; color: ${({ theme }) => theme.colors.textSecondary}; }
`;
