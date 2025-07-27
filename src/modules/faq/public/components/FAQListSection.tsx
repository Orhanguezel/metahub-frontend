"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/faq/locales";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/types/common";
import { MdAdd, MdRemove } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQListSection() {
  const { t, i18n } = useI18nNamespace("faq", translations);
  const faqs = useAppSelector((state) => state.faq.faqs);
  const lang: SupportedLocale = (() => {
    const code = i18n.language?.slice(0, 2);
    return SUPPORTED_LOCALES.includes(code as SupportedLocale)
      ? (code as SupportedLocale)
      : "en";
  })();

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0)
    return <Empty>{t("publicFaq.noFaqs", "No FAQ available.")}</Empty>;

  // 2 kolona bölmek için
  const half = Math.ceil(faqs.length / 2);
  const left = faqs.slice(0, half);
  const right = faqs.slice(half);

  // Accordion item
  const renderItem = (faq: any, idx: number) => (
    <AccordionItem key={faq._id} $open={openIndex === idx}>
      <AccordionHeader
        onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
        tabIndex={0}
        aria-expanded={openIndex === idx}
      >
        <HeaderTitle>{faq.question?.[lang]}</HeaderTitle>
        <IconWrapper>
          {openIndex === idx ? <MdRemove size={24} /> : <MdAdd size={24} />}
        </IconWrapper>
      </AccordionHeader>
      <AnimatePresence initial={false}>
        {openIndex === idx && (
          <MotionPanel
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { height: "auto", opacity: 1, marginTop: 0, marginBottom: 16 },
              collapsed: { height: 0, opacity: 0, marginTop: 0, marginBottom: 0 },
            }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          >
            <PanelInner>
              {faq.answer?.[lang]}
            </PanelInner>
          </MotionPanel>
        )}
      </AnimatePresence>
    </AccordionItem>
  );

  return (
    <Section>
      <AccordionGrid>
        <Column>
          {left.map((faq, i) => renderItem(faq, i))}
        </Column>
        <Column>
          {right.map((faq, i) => renderItem(faq, i + half))}
        </Column>
      </AccordionGrid>
    </Section>
  );
}

// --- Styled Components (ensotekTheme uyumlu) ---
const Section = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxl} ${({ theme }) => theme.spacings.md};
`;

const Empty = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin: ${({ theme }) => theme.spacings.xl} 0;
`;

const AccordionGrid = styled.div`
  display: flex;
  gap: 2.4rem;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 1.2rem;
  }
`;

const Column = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.3rem;
`;

const AccordionItem = styled.div<{ $open: boolean }>`
  background: ${({ theme, $open }) =>
    $open ? theme.colors.successBg : theme.colors.cardBackground};
  border: 1.5px solid ${({ theme, $open }) =>
    $open ? theme.colors.success : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  transition: background 0.22s, border 0.24s, box-shadow 0.18s;
  box-shadow: ${({ theme, $open }) =>
    $open
      ? theme.shadows.md
      : theme.shadows.sm};
`;

const AccordionHeader = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: transparent;
  border: none;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  padding: 1.22rem 1.5rem;
  cursor: pointer;
  outline: none;
  border-radius: ${({ theme }) => theme.radii.xl};
  transition: background 0.16s;
  &:hover, &:focus-visible {
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
  }
`;

const HeaderTitle = styled.span`
  flex: 1;
  text-align: left;
  letter-spacing: 0.01em;
`;

const IconWrapper = styled.span`
  margin-left: 1.4rem;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
`;

const MotionPanel = styled(motion.div)`
  overflow: hidden;
`;

const PanelInner = styled.div`
  padding: 0 1.55rem 1.25rem 1.55rem;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 1;
  line-height: 1.7;
`;

