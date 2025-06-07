"use client";

import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { FAQListSection, FAQAskSection } from "@/modules/faq";

export default function FaqPage() {
  const { t } = useTranslation("faq");

  return (
    <Wrapper>
      <PageTitle>{t("publicFaq.title")}</PageTitle>

      <FAQListSection />

      <Separator />

      <FAQAskSection />
    </Wrapper>
  );
}

const Wrapper = styled.main`
  max-width: 1000px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xxl}
    ${({ theme }) => theme.spacing.md};
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Separator = styled.hr`
  margin: ${({ theme }) => theme.spacing.xl} 0;
  border: none;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
`;
