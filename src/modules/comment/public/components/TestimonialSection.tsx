"use client";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCommentsForContent } from "@/modules/comment/slice/commentSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations3 from "@/modules/comment/locales";
import type { SupportedLocale } from "@/types/common";
import TestimonialCarousel from "./TestimonialCarousel";
import TestimonialModal from "./TestimonialModal";
import styled from "styled-components";
import { MdAddComment } from "react-icons/md";

export default function TestimonialSection() {
  const { i18n, t } = useI18nNamespace("testimonial", translations3);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const dispatch = useAppDispatch();

  // Sadece data state'leri
  const [windowed, setWindowed] = useState<any[]>([]);
  const [x, setX] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [showModal, setShowModal] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  // Sabitler (modül üstünde)
  const contentType = "about";
  const contentId = "000000000000000000000000";

  useEffect(() => {
    dispatch(fetchCommentsForContent({
      type: contentType,
      id: contentId,
      commentType: "testimonial",
    }));
  }, [dispatch]);

  const allComments = useAppSelector((state) => state.comments.comments) || [];
  const testimonials = useMemo(
    () =>
      Array.isArray(allComments)
        ? allComments.filter((c) => c.type === "testimonial" && c.isPublished)
        : [],
    [allComments]
  );

  useEffect(() => {
    setWindowed(testimonials.slice(0, Math.min(3, testimonials.length)));
    setX(0);
    setIsSliding(false);
  }, [testimonials]);

  useEffect(() => {
    if (windowed.length < 1) return;
    if (isSliding) return;
    const timer = setTimeout(() => slide("next"), 4800);
    return () => clearTimeout(timer);
  }, [windowed, isSliding]);

  function slide(dir: "next" | "prev") {
    if (isSliding || testimonials.length <= windowed.length) return;
    setDirection(dir);
    setIsSliding(true);

    let newWindow = [...windowed];
    if (dir === "next") {
      const last = windowed[windowed.length - 1];
      const lastIdx = testimonials.findIndex((c) => c._id === last._id);
      const nextIdx = (lastIdx + 1) % testimonials.length;
      newWindow = [...windowed, testimonials[nextIdx]];
      setWindowed(newWindow);
      setX(0);
      setTimeout(() => setX(-1 * (windowed.length > 1 ? 360 : 320)), 0);
    } else {
      const first = windowed[0];
      const firstIdx = testimonials.findIndex((c) => c._id === first._id);
      const prevIdx = (firstIdx - 1 + testimonials.length) % testimonials.length;
      newWindow = [testimonials[prevIdx], ...windowed];
      setWindowed(newWindow);
      setX(-1 * (windowed.length > 1 ? 360 : 320));
      setTimeout(() => setX(0), 0);
    }
  }

  function handleAnimationComplete() {
    if (direction === "next") setWindowed(w => w.slice(1));
    else setWindowed(w => w.slice(0, -1));
    setX(0);
    setIsSliding(false);
    setAnimKey(k => k + 1);
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
      </SectionHeader>
      <OuterContainer>
        <TestimonialCarousel
          cards={windowed}
          x={x}
          animKey={animKey}
          isSliding={isSliding}
          onPrev={() => slide("prev")}
          onNext={() => slide("next")}
          onAnimationComplete={handleAnimationComplete}
          lang={lang}
        />
      </OuterContainer>
      <div style={{ textAlign: "center" }}>
        <AddCommentBtn
          onClick={() => setShowModal(true)}
          type="button"
          aria-label={t("form.addTestimonial", "Yorum Yaz")}
        >
          <MdAddComment size={22} style={{ marginRight: 10 }} />
          {t("form.addTestimonial", "Yorum Yaz")}
        </AddCommentBtn>
      </div>
      <TestimonialModal
        open={showModal}
        onClose={() => setShowModal(false)}
        t={t}
        lang={lang}
        contentType={contentType}
        contentId={contentId}
        afterSubmit={() =>
          dispatch(fetchCommentsForContent({
            type: contentType,
            id: contentId,
            commentType: "testimonial",
          }))
        }
      />
    </Section>
  );
}

import { motion } from "framer-motion";

// Sadece OuterContainer örnek (istersen kendi styled'ını kullan)
const OuterContainer = styled.div`
background: ${({ theme }) => theme.colors.sectionBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.xxl};
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  box-sizing: border-box;
  @media (max-width: 900px) {
    padding: ${({ theme }) => theme.spacings.xl} 0;
  }
  @media (max-width: 600px) {
    padding: ${({ theme }) => theme.spacings.lg} 0 ${({ theme }) => theme.spacings.xl} 0;
    
  }
`;
const Section = styled(motion.section)`
  background: ${({ theme }) => theme.colors.sectionBackground};
  padding: 0 0 32px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 540px;
  width: 100%;
  ${({ theme }) => theme.media.mobile} {
    padding: 0 0 18px 0;
    min-height: 360px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacings.md};
  margin-top: ${({ theme }) => theme.spacings.sm};
`;

const TitleLine = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: 0.1rem;
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

const AddCommentBtn = styled.button`
  display: flex;
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
  box-shadow: ${({ theme }) => theme.shadows.lg};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.fast};
  outline: none;
  &:hover, &:focus-visible {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
    opacity: ${({ theme }) => theme.opacity.hover};
  }
  ${({ theme }) => theme.media.mobile} {
    width: 94vw;
    max-width: 350px;
    padding: 0.8em 0;
    font-size: 1.01rem;
    margin: 1.5rem auto 0 auto;
  }
`;
