"use client";

import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/faq/locales";

const TABS: Array<{ key: "list" | "create"; labelKey: string; fallback: string }> = [
  { key: "list", labelKey: "tabs.faq", fallback: "FAQ List" },
  { key: "create", labelKey: "tabs.create", fallback: "New FAQ" },
];

interface Props {
  activeTab: "list" | "create";
  onChange: (tab: "list" | "create") => void;
}

export default function Tabs({ activeTab, onChange }: Props) {
  const { t } = useI18nNamespace("faq", translations);

  return (
    <Header role="tablist" aria-label="FAQ Tabs">
      {TABS.map((tab) => (
        <TabButton
          key={tab.key}
          $active={activeTab === tab.key}
          onClick={() => onChange(tab.key)}
          role="tab"
          aria-selected={activeTab === tab.key}
        >
          {t(tab.labelKey, tab.fallback)}
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
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.background)};
  color: ${({ $active, theme }) => ($active ? "#fff" : theme.colors.text)};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    color: #fff;
  }
`;
