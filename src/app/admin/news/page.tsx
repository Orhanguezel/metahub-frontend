"use client";

import React from "react";
import styled from "styled-components";
import NewsList from "@/components/admin/news/NewsList";
import NewsMultiForm from "@/components/admin/news/NewsMultiForm";
import { useTranslation } from "react-i18next";

export default function AdminNewsPage() {
  const { t } = useTranslation("admin");

  return (
    <Wrapper>
      <h2>{t("news.title") || "Haberler"}</h2>

      <NewsMultiFormWrapper>
        <NewsMultiForm />
      </NewsMultiFormWrapper>

      <NewsList />
    </Wrapper>
  );
}

// Styled Components
const Wrapper = styled.div`
  padding: 2rem;
`;

const NewsMultiFormWrapper = styled.div`
  margin-bottom: 3rem;
`;
