"use client";

import React, { useEffect, useMemo } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPublishedFAQs } from "@/modules/faq/slice/faqSlice";
import { useTranslation } from "react-i18next";

export default function FAQListSection() {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation("faq");

  const lang = useMemo(() => {
    return (
      ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
    ) as "tr" | "en" | "de";
  }, [i18n.language]);

  const { faqs, loading } = useAppSelector((state) => state.faq);

  useEffect(() => {
    dispatch(fetchPublishedFAQs(lang));
  }, [dispatch, lang]);

  return (
    <Section>
      <Title>{t("publicFaq.title")}</Title>

      {loading && <Paragraph>{t("common.loading", "Loading...")}</Paragraph>}
      {!loading && faqs.length === 0 && (
        <Paragraph>{t("publicFaq.noFaqs")}</Paragraph>
      )}

      {!loading && faqs.length > 0 && (
        <FAQList>
          {faqs.map((faq) => (
            <FAQItem key={faq._id}>
              <Question>{faq.question?.[lang]}</Question>
              <Answer>{faq.answer?.[lang]}</Answer>
            </FAQItem>
          ))}
        </FAQList>
      )}
    </Section>
  );
}

// 💅 Styled Components
const Section = styled.section`
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl}
    ${({ theme }) => theme.spacings.md};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
`;

const Paragraph = styled.p`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacings.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.base};
`;

const FAQList = styled.div`
  margin-top: ${({ theme }) => theme.spacings.xl};
`;

const FAQItem = styled.div`
  margin-bottom: ${({ theme }) => theme.spacings.lg};
`;

const Question = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.text};
`;

const Answer = styled.p`
  margin-top: ${({ theme }) => theme.spacings.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.base};
  line-height: 1.6;
`;
