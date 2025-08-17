"use client";

import styled from "styled-components";
import { useCallback, useRef } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/library/locales";

const TABS: Array<{ key: "list" | "create" | "categories"; labelKey: string; fallback: string }> = [
  { key: "list", labelKey: "tabs.library", fallback: "Library" },
  { key: "create", labelKey: "tabs.create", fallback: "New Library" },
  { key: "categories", labelKey: "tabs.categories", fallback: "Categories" },
];

interface Props {
  activeTab: "list" | "create" | "categories";
  onChange: (tab: "list" | "create" | "categories") => void;
}

export default function LibraryTabs({ activeTab, onChange }: Props) {
  const { t } = useI18nNamespace("library", translations);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, idx: number) => {
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
    [onChange]
  );

  return (
    <Header role="tablist" aria-label="Library Management Tabs">
      {TABS.map((tab, idx) => (
        <TabButton
          key={tab.key}
          ref={(el) => { tabRefs.current[idx] = el; }}
          $active={activeTab === tab.key}
          onClick={() => onChange(tab.key)}
          tabIndex={activeTab === tab.key ? 0 : -1}
          role="tab"
          aria-selected={activeTab === tab.key}
          aria-controls={`tabpanel-${tab.key}`}
          onKeyDown={(e) => handleKeyDown(e, idx)}
        >
          {t(tab.labelKey, tab.fallback)}
        </TabButton>
      ))}
    </Header>
  );
}

/* styled */
const Header = styled.div`
  display:flex; gap:${({theme})=>theme.spacings.sm};
  margin-bottom:${({theme})=>theme.spacings.lg};
  overflow-x:auto; scrollbar-width:none; -ms-overflow-style:none;
  &::-webkit-scrollbar{ display:none; }
`;
const TabButton = styled.button<{ $active: boolean }>`
  position:relative; padding:.75rem 1.6rem;
  border:none; border-radius:${({theme})=>theme.radii.md};
  font-weight:${({theme})=>theme.fontWeights.medium};
  background:${({$active,theme})=>$active? theme.colors.primary : theme.colors.background};
  color:${({$active,theme})=>$active? theme.colors.textPrimary : theme.colors.text};
  cursor:pointer; transition:background .2s, box-shadow .2s, color .2s;
  box-shadow:${({$active,theme})=>$active? `0 2px 16px ${theme.colors.primary}44` : "none"};

  &::after{
    content:""; position:absolute; left:32%; right:32%; bottom:0; height:3px; border-radius:3px;
    background:${({$active,theme})=>$active? theme.colors.primaryDark : "transparent"};
    transition:all .2s;
  }
  &:hover,&:focus-visible{
    background:${({$active,theme})=>$active? theme.colors.primary : theme.colors.primaryHover};
    color:${({theme})=>theme.colors.textPrimary};
  }
`;
