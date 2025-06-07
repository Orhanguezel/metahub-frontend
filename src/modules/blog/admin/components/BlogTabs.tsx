"use client";

import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

interface Props {
  activeTab: "list" | "create" | "categories";
  onChange: (tab: "list" | "create" | "categories") => void;
}

export default function BlogTabs({ activeTab, onChange }: Props) {
  const { t } = useTranslation("adminBlog");

  return (
    <Header>
      <TabButton
        $active={activeTab === "list"}
        onClick={() => onChange("list")}
      >
        {t("tabs.blog", "Bloglar")}
      </TabButton>
      <TabButton
        $active={activeTab === "create"}
        onClick={() => onChange("create")}
      >
        {t("tabs.create", "Yeni Blog")}
      </TabButton>
      <TabButton
        $active={activeTab === "categories"}
        onClick={() => onChange("categories")}
      >
        {t("tabs.categories", "Kategoriler")}
      </TabButton>
    </Header>
  );
}

const Header = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.5rem;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.background};
  color: ${({ $active, theme }) => ($active ? "#fff" : theme.colors.text)};
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    color: #fff;
  }
`;
