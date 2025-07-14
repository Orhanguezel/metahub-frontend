"use client";

import React from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/bikes";

interface Props {
  activeTab: "list" | "create" | "categories";
  onChange: (tab: "list" | "create" | "categories") => void;
}

const tabs = [
  { key: "list", label: "admin.tabs.bike", fallback: "Bikes" },
  { key: "create", label: "admin.tabs.create", fallback: "Add New" },
  { key: "categories", label: "admin.tabs.categories", fallback: "Categories" },
] as const;

export default function BikesTabs({ activeTab, onChange }: Props) {
  const {  t } = useI18nNamespace("bikes", translations);


  return (
    <Header>
      {tabs.map((tab) => (
        <TabButton
          key={tab.key}
          $active={activeTab === tab.key}
          onClick={() => onChange(tab.key)}
        >
          {t(tab.label, tab.fallback)}
        </TabButton>
      ))}
    </Header>
  );
}

const Header = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
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
