"use client";

import React, { useCallback, useRef } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/apartment";

// --- Tab enum
type ApartmentTab = "list" | "create" | "multiUpload" | "categories";

// --- Tab listesi
const TABS: Array<{ key: ApartmentTab; labelKey: string; fallback: string }> = [
  { key: "list",        labelKey: "tabs.apartment",   fallback: "Apartment" },
  { key: "create",      labelKey: "tabs.create",      fallback: "New apartment" },
  { key: "multiUpload", labelKey: "tabs.multiUpload", fallback: "Bulk Logo Upload" },
  { key: "categories",  labelKey: "tabs.categories",  fallback: "Categories" },
];

interface Props {
  activeTab: ApartmentTab;
  onChange: (tab: ApartmentTab) => void;
  loading?: boolean; // <-- eklendi
}

export default function ApartmentTabs({ activeTab, onChange, loading = false }: Props) {
  const { t } = useI18nNamespace("apartment", translations);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Klavye ile sekme gezme
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, idx: number) => {
      if (loading) return; // yüklenirken engelle
      if (e.key === "ArrowRight") {
        const next = (idx + 1) % TABS.length;
        tabRefs.current[next]?.focus();
        onChange(TABS[next].key);
      } else if (e.key === "ArrowLeft") {
        const prev = (idx - 1 + TABS.length) % TABS.length;
        tabRefs.current[prev]?.focus();
        onChange(TABS[prev].key);
      }
    },
    [onChange, loading]
  );

  return (
    <Header role="tablist" aria-label="Apartment Management Tabs" aria-busy={loading || undefined}>
      {TABS.map((tab, idx) => {
        const isActive = activeTab === tab.key;
        return (
          <TabButton
            key={tab.key}
            ref={(el) => { tabRefs.current[idx] = el; }}
            $active={isActive}
            $disabled={loading}
            onClick={() => { if (!loading) onChange(tab.key); }}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.key}`}
            aria-disabled={loading}
            disabled={loading}
            tabIndex={isActive ? 0 : -1}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            title={loading ? t("loading", "Loading...") : undefined}
          >
            {t(tab.labelKey, tab.fallback)}
          </TabButton>
        );
      })}
    </Header>
  );
}

// --- Styles
const Header = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  justify-content: flex-start;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar { display: none; }
`;

const TabButton = styled.button<{ $active: boolean; $disabled?: boolean }>`
  position: relative;
  padding: 0.75rem 1.75rem;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.background)};
  color: ${({ $active, theme }) => ($active ? "#fff" : theme.colors.text)};
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.7 : 1)};
  transition: background 0.2s, box-shadow 0.2s, color 0.2s, opacity 0.2s;
  outline: none;
  box-shadow: ${({ $active, theme }) =>
    $active ? `0 2px 16px 0 ${theme.colors.primary}44` : "none"};

  &::after {
    content: "";
    display: block;
    position: absolute;
    left: 32%;
    right: 32%;
    bottom: 0;
    height: 3px;
    border-radius: 3px;
    background: ${({ $active, theme }) => ($active ? theme.colors.primary : "transparent")};
    transition: background 0.3s, left 0.2s, right 0.2s;
  }

  &:hover,
  &:focus-visible {
    background: ${({ theme, $active, $disabled }) =>
      $disabled ? theme.colors.background : ($active ? theme.colors.primary : theme.colors.primaryHover)};
    color: ${({ $disabled }) => ($disabled ? "inherit" : "#fff")};
  }
`;
