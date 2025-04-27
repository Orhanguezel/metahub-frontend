"use client";

import React, { useEffect } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchFAQs } from "@/store/faqSlice";
import { useTranslation } from "react-i18next";

export default function FAQListSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation("visitor");

  const { faqs, loading } = useSelector((state: RootState) => state.faq);

  useEffect(() => {
    dispatch(fetchFAQs(i18n.language));
  }, [dispatch, i18n.language]);

  return (
    <Section>
      <h2>{t("faqs.title")}</h2>

      {loading && <p>{t("common.loading")}...</p>}
      {!loading && faqs.length === 0 && <p>{t("faqs.noFaqs")}</p>}

      {!loading && faqs.length > 0 && (
        <FAQList>
          {faqs.map((faq) => (
            <FAQItem key={faq._id}>
              <Question>{faq.question}</Question>
              <Answer>{faq.answer}</Answer>
            </FAQItem>
          ))}
        </FAQList>
      )}
    </Section>
  );
}

// Styled
const Section = styled.section`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const FAQList = styled.div`
  margin-top: 2rem;
`;

const FAQItem = styled.div`
  margin-bottom: 1.5rem;
`;

const Question = styled.h4`
  font-size: 1.1rem;
  font-weight: bold;
`;

const Answer = styled.p`
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.textSecondary};
`;
