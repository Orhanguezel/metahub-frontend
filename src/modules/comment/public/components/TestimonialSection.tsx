"use client";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchTestimonialsPublic,
  selectTestimonials,
} from "@/modules/comment/slice/slice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations3 from "@/modules/comment/locales";
import type { SupportedLocale } from "@/types/common";
import TestimonialCarousel from "./TestimonialCarousel";
import TestimonialModal from "./TestimonialModal";
import styled from "styled-components";
import { MdAddComment, MdStar, MdStarBorder } from "react-icons/md";
import { motion } from "framer-motion";

export default function TestimonialSection() {
  const { i18n, t } = useI18nNamespace("testimonial", translations3);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const dispatch = useAppDispatch();

  // --- carousel state ---
  const [windowed, setWindowed] = useState<any[]>([]);
  const [x, setX] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [showModal, setShowModal] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  // ✅ Doğru public fetch pattern’i
  useEffect(() => {
    dispatch(fetchTestimonialsPublic({ page: 1, limit: 6 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Store’dan testimonials
  const source = useAppSelector(selectTestimonials);

  // ✅ Çalışan filtreleme + ilk 6 + rating desc (eşitse tarihe göre yeni→eski)
  const testimonials = useMemo(() => {
    const list = (Array.isArray(source) ? source : [])
      .filter((c) => (c?.type ? c.type === "testimonial" : true))
      .filter((c) => c?.isPublished !== false)
      .slice(0, 6);

    const safeTime = (v: any) => {
      const raw = typeof v === "string" ? v : v?.$date || v?.toString?.();
      const d = raw ? new Date(raw) : null;
      return d && !isNaN(d.valueOf()) ? d.getTime() : 0;
    };

    return [...list].sort((a, b) => {
      const rb = typeof b.rating === "number" ? b.rating : 0;
      const ra = typeof a.rating === "number" ? a.rating : 0;
      if (rb !== ra) return rb - ra; // yüksek puan önce
      return safeTime(b.createdAt) - safeTime(a.createdAt); // yeni önce
    });
  }, [source]);

  // ⭐ Genel puan/oy sayısı (rank göstergesi)
  const { avgRating, ratingCount } = useMemo(() => {
    const ratings = testimonials
      .map((c) => (typeof c.rating === "number" ? c.rating : 0))
      .filter((r) => r > 0);
    const total = ratings.length;
    const sum = ratings.reduce((a, b) => a + b, 0);
    return {
      avgRating: total ? Math.round((sum / total) * 10) / 10 : 0,
      ratingCount: total,
    };
  }, [testimonials]);

  // pencere/otomatik kaydırma (karusel)
  useEffect(() => {
    setWindowed(testimonials.slice(0, Math.min(3, testimonials.length)));
    setX(0);
    setIsSliding(false);
  }, [testimonials]);

  useEffect(() => {
    if (windowed.length < 1 || isSliding) return;
    const timer = setTimeout(() => slide("next"), 4800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowed, isSliding]);

  function slide(dir: "next" | "prev") {
    if (isSliding || testimonials.length <= windowed.length) return;
    setDirection(dir);
    setIsSliding(true);

    if (dir === "next") {
      const last = windowed[windowed.length - 1];
      const lastIdx = testimonials.findIndex((c) => c._id === last._id);
      const nextIdx = (lastIdx + 1) % testimonials.length;
      const newWindow = [...windowed, testimonials[nextIdx]];
      setWindowed(newWindow);
      setX(0);
      setTimeout(() => setX(-1 * (windowed.length > 1 ? 360 : 320)), 0);
    } else {
      const first = windowed[0];
      const firstIdx = testimonials.findIndex((c) => c._id === first._id);
      const prevIdx = (firstIdx - 1 + testimonials.length) % testimonials.length;
      const newWindow = [testimonials[prevIdx], ...windowed];
      setWindowed(newWindow);
      setX(-1 * (windowed.length > 1 ? 360 : 320));
      setTimeout(() => setX(0), 0);
    }
  }

  function handleAnimationComplete() {
    if (direction === "next") setWindowed((w) => w.slice(1));
    else setWindowed((w) => w.slice(0, -1));
    setX(0);
    setIsSliding(false);
    setAnimKey((k) => k + 1);
  }

  if (windowed.length < 1) return null;

  return (
    <Section>
      <SectionHeader>
        <TitleLine>
          <Title>{t("sectionTitle2", "Testimonial")}</Title>
        </TitleLine>
        <SectionDesc>
          {t(
            "sectionDesc",
            "Kullanıcılarımızdan gelen gerçek yorumlar. Siz de yorum bırakmak için giriş yapın."
          )}
        </SectionDesc>

        {/* ⭐ Rank (ortalama puan + toplam oy) */}
        <RankWrap aria-label={t("rating.summary", "Ortalama puan")}>
          <Stars aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => {
              const fill = i + 1 <= Math.round(avgRating);
              return fill ? <MdStar key={i} size={18} /> : <MdStarBorder key={i} size={18} />;
            })}
          </Stars>
          <RankText>
            {avgRating ? `${avgRating}/5` : "—/5"}{" "}
            <Count>· {ratingCount} {t("votes", "oy")}</Count>
          </RankText>
        </RankWrap>
      </SectionHeader>

      <OuterContainer>
        <TestimonialCarousel
          cards={windowed}          // IComment[] → her kartta rating alanı mevcut
          x={x}
          animKey={animKey}
          isSliding={isSliding}
          onPrev={() => slide("prev")}
          onNext={() => slide("next")}
          onAnimationComplete={handleAnimationComplete}
          lang={lang}
          // Eğer bileşen destekliyorsa rating göstermek için bir ipucu:
          // showRating
        />
      </OuterContainer>

      <BtnRow>
        <AddCommentBtn
          onClick={() => setShowModal(true)}
          type="button"
          aria-label={t("form.addTestimonial", "Yorum Yaz")}
        >
          <MdAddComment size={22} />
          <span>{t("form.addTestimonial", "Yorum Yaz")}</span>
        </AddCommentBtn>
      </BtnRow>

      <TestimonialModal
        open={showModal}
        onClose={() => setShowModal(false)}
        t={t}
        lang={lang}
        contentType="global"
        afterSubmit={() => dispatch(fetchTestimonialsPublic({ page: 1, limit: 6 }))}
      />
    </Section>
  );
}

/* -------------------- styled -------------------- */

const Section = styled(motion.section)`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
  padding: 0 0 ${({ theme }) => theme.spacings.xxl};
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 540px;
  width: 100%;
  transition: background-color ${({ theme }) => theme.transition.fast},
    color ${({ theme }) => theme.transition.fast};

  ${({ theme }) => theme.media.mobile} {
    padding: 0 0 ${({ theme }) => theme.spacings.xl};
    min-height: 360px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: ${({ theme }) => theme.spacings.sm} 0 ${({ theme }) => theme.spacings.md};
`;

const TitleLine = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const Title = styled.h2`
  font-size: clamp(2.2rem, 3.3vw, 2.7rem);
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  margin: 20px 0 0.23em 0;
  letter-spacing: -0.01em;
  line-height: 1.13;
`;

const SectionDesc = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  text-align: center;
  margin: 0.8rem;
  max-width: 720px;

  ${({ theme }) => theme.media.mobile} {
    font-size: 1rem;
    padding: 0 12px;
  }
`;

/* ⭐ Rank UI */
const RankWrap = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const Stars = styled.div`
  display: inline-flex;
  align-items: center;
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;
const RankText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;
const Count = styled.span`
  opacity: 0.8;
`;

const OuterContainer = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.xxl};
  transition: background-color ${({ theme }) => theme.transition.fast};
  box-sizing: border-box;

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacings.lg} 0 ${({ theme }) => theme.spacings.xl};
  }
`;

const BtnRow = styled.div`
  text-align: center;
  width: 100%;
`;

const AddCommentBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.7em;
  margin: 2rem auto 0 auto;

  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.xl};
  font-size: 1.13rem;
  font-weight: 600;
  padding: 0.85em 2.1em;
  cursor: pointer;

  box-shadow: ${({ theme }) => `${theme.shadows.lg}, ${theme.colors.shadowHighlight}`};
  transition: background ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast},
    transform ${({ theme }) => theme.transition.fast};

  svg {
    flex: 0 0 auto;
  }

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
    outline: none;
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => `${theme.shadows.xl}, ${theme.colors.shadowHighlight}`};
  }

  ${({ theme }) => theme.media.mobile} {
    width: 94vw;
    max-width: 350px;
    padding: 0.8em 0;
    font-size: 1.01rem;
    margin: 1.5rem auto 0 auto;
    text-align: center;
  }
`;
