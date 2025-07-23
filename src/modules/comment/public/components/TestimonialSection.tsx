"use client";

import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations3 from "@/modules/comment/locales";
import { useAppSelector } from "@/store/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState,useEffect } from "react";
import { MdStars } from "react-icons/md";
import { SupportedLocale } from "@/types/common";

export default function TestimonialSection() {
  const { i18n, t } = useI18nNamespace("testimonial", translations3);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const allComments = useAppSelector((state) => state.comments.comments);

  // Sadece type/testimonial ve published olanları al
  const testimonials = useMemo(
    () =>
      Array.isArray(allComments)
        ? allComments.filter(
            (c: any) => (c.type === "testimonial" || c.contentType === "testimonial") && c.isPublished
          )
        : [],
    [allComments]
  );

  const [current, setCurrent] = useState(0);
  const count = testimonials.length;
  const active = count > 0 ? testimonials[current % count] : null;

  // Otomatik slider (isteğe bağlı)
  useEffect(() => {
  if (count < 2) return;
  const timer = setTimeout(() => setCurrent((c) => (c + 1) % count), 7000);
  return () => clearTimeout(timer);
}, [count, current]);

  if (!active) return null;

  // avatar, company, rating gibi alanlar IComment modelinde yoksa (ör: customFields/avatar), burada typescript şikayet etmemesi için güvenli erişim
  // (backendde eklenmişse interface'e de eklemen iyi olur)

  // Dil desteği: alanın [lang] var ise, yoksa "" (boş)
  const getLangField = (field: any) =>
    typeof field === "object" && field
      ? field[lang] || field.tr || field.en || Object.values(field)[0] || ""
      : field || "";

  return (
    <Section>
      <SectionTitle>
        <MdStars size={28} style={{ verticalAlign: "middle" }} />
        <span>{t("sectionTitle", "Müşteri Yorumları")}</span>
      </SectionTitle>
      <AnimatePresence mode="wait">
        <TestimonialCard
          key={active._id}
          as={motion.div}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.55 }}
        >
          {/* Unescaped " hatası için: &quot; veya ' */}
          <Quote>
            &quot;{getLangField(active.text)}&quot;
          </Quote>
          <User>
            {/* avatar desteği: customFields.avatar veya active.avatar olabilir, interface'e eklenmediyse as any ile */}
            {("avatar" in active && (active as any).avatar) && (
              <Avatar src={(active as any).avatar} alt="avatar" />
            )}
            <UserInfo>
              <Name>{getLangField(active.name)}</Name>
              {/* company alanı varsa göster */}
              {"company" in active && (active as any).company && (
                <Company>{getLangField((active as any).company)}</Company>
              )}
              {/* Opsiyonel rating */}
              {"rating" in active && typeof (active as any).rating === "number" && (
                <Rating>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} $filled={i < (active as any).rating}>★</Star>
                  ))}
                </Rating>
              )}
            </UserInfo>
          </User>
        </TestimonialCard>
      </AnimatePresence>
      <Dots>
        {testimonials.map((_, i) => (
          <Dot
            key={i}
            $active={i === current}
            aria-label={`Go to testimonial ${i + 1}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </Dots>
    </Section>
  );
}

// --- Styles ---
const Section = styled.section`
  background: ${({ theme }) => theme.colors.achievementBackground};
  padding: ${({ theme }) => theme.spacings.xxl} 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  display: flex;
  align-items: center;
  gap: 0.6em;
  margin-bottom: 2rem;
`;

const TestimonialCard = styled.div`
  max-width: 620px;
  width: 94vw;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 2.7rem 2.2rem 2.3rem 2.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Quote = styled.p`
  font-size: 1.25em;
  color: ${({ theme }) => theme.colors.text};
  font-style: italic;
  line-height: 1.66;
  margin-bottom: 2.1rem;
  text-align: center;
`;

const User = styled.div`
  display: flex; align-items: center; gap: 1.15em;
`;

const Avatar = styled.img`
  width: 56px; height: 56px;
  border-radius: 50%;
  border: 2.5px solid ${({ theme }) => theme.colors.primary};
  object-fit: cover;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;

const UserInfo = styled.div`
  display: flex; flex-direction: column; gap: 0.25em;
`;

const Name = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: 1.12em;
`;
const Company = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.97em;
`;

const Dots = styled.div`
  margin-top: 2.2em;
  display: flex; gap: 0.65em; justify-content: center;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: 13px; height: 13px;
  border-radius: 50%;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.skeleton};
  border: none;
  cursor: pointer;
  transition: background 0.18s;
  &:focus { outline: 2px solid ${({ theme }) => theme.colors.primaryLight}; }
`;

const Rating = styled.div`
  margin-top: 0.25em;
  display: flex;
  gap: 0.1em;
`;
const Star = styled.span<{ $filled?: boolean }>`
  color: ${({ $filled, theme }) => ($filled ? theme.colors.primary : theme.colors.skeleton)};
  font-size: 1.05em;
`;
