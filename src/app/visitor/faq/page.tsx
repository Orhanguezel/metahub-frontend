"use client";

import React from "react";
import styled from "styled-components";
import FAQAskSection from "@/components/visitor/faq/FAQAskSection";
import FAQListSection from "@/components/visitor/faq/FAQListSection";
import { useTranslation } from "react-i18next";

export default function FAQPage() {
  const { t } = useTranslation("visitor");

  return (
    <Wrapper>
      <h2>{t("faqs.title") || "Sıkça Sorulan Sorular"}</h2>
      <FAQAskSection />
      <Divider />
      <FAQListSection />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const Divider = styled.hr`
  margin: 3rem 0;
  border: none;
  height: 1px;
  background-color: ${({ theme }) => theme.border};
`;
