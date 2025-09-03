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

  // Başlık/özet olan ilk kaydı seç (güçlendirilmiş)
  const main = useMemo<IAbout | null>(() => {
    if (!validAbout.length) return null;
    const preferred = validAbout.find(
      (x) => (x.title?.[lang] || x.title?.en) && (x.summary?.[lang] || x.summary?.en)
    );
    return preferred || validAbout[0];
  }, [validAbout, lang]);

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
            <MinorTitle>{t("page.aboutus.minorTitle", "About Us")}</MinorTitle>
            <MainTitle>{t("page.aboutus.title", "Hakkımızda")}</MainTitle>
            <Desc>{t("about.aboutus.empty", "Hakkında içeriği bulunamadı.")}</Desc>
          </RightCol>
        </Grid>
      </Section>
    );
  }

  const mainImg = main?.images?.[0]?.url;

  return (
    <Section
      variants={groupStagger}
      /* 🚫 HATA KAYNAĞI: whileInView görünürlük eşiğine kadar çocuklar opacity:0 kalıyordu */
      /* initial="initial" */
      /* whileInView="animate" */
      /* viewport={{ once: true, amount: 0.25 }} */

      /* ✔ ÇÖZÜM 1: Mount’ta hemen animasyona geç (içerik her zaman görünür) */
      initial="initial"
      animate="animate"
    >
      <Grid>
        {/* SOL — yalnızca 1. kaydın resmi */}
        <LeftCol>
          <VisualBoard>
            {mainImg && (
              <MainFigure variants={fadeInLeft} aria-label="main image">
                <MainImg
                  src={mainImg}
                  alt={main?.title?.[lang] || main?.title?.en || "About"}
                  width={1400}
                  height={1400}
                  priority
                />
              </MainFigure>
            )}
          </VisualBoard>
        </LeftCol>

        {/* SAĞ — başlık, metin ve maddeler */}
        <RightCol
          as={motion.div}
          variants={groupStagger}
          /* ✔ ÇÖZÜM 2 (opsiyonel): görünürlük tabanlı tetik istenirse eşiği çok düşür */
          /* viewport={{ once: true, amount: 0.01 }} */
        >
          <MinorTitle as={motion.div} variants={fadeUp}>
            {t("page.aboutus.minorTitle", "About Us")}
          </MinorTitle>

          <MainTitle as={motion.h2} variants={fadeUp}>
            {main?.title?.[lang] || main?.title?.en || t("page.aboutus.title", "Hakkımızda")}
          </MainTitle>

          <Desc as={motion.p} variants={fadeUp}>
            {main?.summary?.[lang] || main?.summary?.en || ""}
          </Desc>

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

/* ===================== Styles (antalya2Theme uyumlu) ===================== */

const Section = styled(motion.section)`
  background: ${({ theme }) => theme.colors.sectionBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.xl};

  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.lg};
  }
`;

const Grid = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacings.xl};
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: clamp(${({ theme }) => theme.spacings.md}, 4vw, ${({ theme }) => theme.spacings.xxxl});
  align-items: center;

  ${({ theme }) => theme.media.medium} {
    padding: 0 ${({ theme }) => theme.spacings.md};
  }
  ${({ theme }) => theme.media.small} {
    grid-template-columns: 1fr;
    gap: clamp(${({ theme }) => theme.spacings.xs}, 2.5vw, ${({ theme }) => theme.spacings.md});
    padding: 0 ${({ theme }) => theme.spacings.sm};
    text-align: center;
    align-items: center;
  }
`;

/* SOL sütun */
const LeftCol = styled.div`
  flex: 1.1 1 440px;
  min-width: 320px;
  max-width: 760px;
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

/* Next/Image wrapper – temalı arkaplan/border/shadow ve radius */
const MainFigure = styled(motion.div)`
  width: 100%;
  margin: 0;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;

  /* Next/Image dış <span> için */
  & > span {
    position: relative !important;
    display: block !important;
    width: 100% !important;
    height: auto !important;
  }

  /* <img> için */
  & > span > img {
    display: block !important;
    width: 100% !important;
    height: clamp(420px, 60vh, 720px) !important;
    object-fit: cover !important;
    object-position: center !important;
  }

  ${({ theme }) => theme.media.small} {
    box-shadow: ${({ theme }) => theme.shadows.sm};
    & > span > img {
      height: auto !important;
      width: 100% !important;
      object-fit: contain !important;
    }
  }
`;

const MainImg = styled(Image)``;

/* SAĞ sütun */
const RightCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(${({ theme }) => theme.spacings.sm}, 1.6vw, ${({ theme }) => theme.spacings.md});
  align-items: flex-start;

  ${({ theme }) => theme.media.small} {
    max-width: 100% !important;
    margin: 0 auto;
    gap: ${({ theme }) => theme.spacings.sm};
    align-items: center;
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
  font-size: ${({ theme }) => theme.fontSizes.h2};
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
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin-bottom: ${({ theme }) => theme.spacings.md};
`;

/* Maddeler – motion + temalı renkler */
const Bullets = styled(motion.ul)`
  list-style: none;
  padding: 0;
  margin: .2rem 0 ${({ theme }) => theme.spacings.md} 0;
  display: grid;
  gap: ${({ theme }) => theme.spacings.md};
`;

const BulletItem = styled(motion.li)`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacings.sm};

  .dot{
    width: 18px;
    height: 18px;
    border-radius: ${({ theme }) => theme.radii.circle};
    border: ${({ theme }) => theme.borders.thick} ${({ theme }) => theme.colors.borderHighlight};
    background: ${({ theme }) => theme.colors.primaryTransparent};
    margin-top: 4px;
    box-shadow: ${({ theme }) => theme.shadows.xs};
  }
  .btxt{ flex:1; }
  .btxt h4{
    margin: 0 0 4px 0;
    font-size: ${({ theme }) => theme.fontSizes.medium};
    color: ${({ theme }) => theme.colors.darkColor};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }
  .btxt p{
    margin: 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: ${({ theme }) => theme.fontSizes.small};
    line-height: ${({ theme }) => theme.lineHeights.relaxed};
  }
`;
