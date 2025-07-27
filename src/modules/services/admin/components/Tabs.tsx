"use client";

import React, { useCallback, useRef } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/services";

const TABS: Array<{
  key: "list" | "create" | "categories";
  labelKey: string;
  fallback: string;
}> = [
  { key: "list", labelKey: "tabs.services", fallback: "Services" },
  { key: "create", labelKey: "tabs.create", fallback: "New Services" },
  { key: "categories", labelKey: "tabs.categories", fallback: "Categories" },
];

interface Props {
  activeTab: "list" | "create" | "categories";
  onChange: (tab: "list" | "create" | "categories") => void;
}

export default function ServicesTabs({ activeTab, onChange }: Props) {
  const { t } = useI18nNamespace("services", translations);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Klavyeden sekme (arrow) ile gezilebilsin
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
    <Header role="tablist" aria-label="Services Management Tabs">
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

// 💅 Gelişmiş stil
const Header = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  justify-content: flex-start;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabButton = styled.button<{ $active: boolean }>`
  position: relative;
  padding: 0.75rem 1.75rem;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.background};
  color: ${({ $active, theme }) =>
    $active ? "#fff" : theme.colors.text};
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, color 0.2s;
  outline: none;
  box-shadow: ${({ $active, theme }) =>
    $active
      ? `0 2px 16px 0 ${theme.colors.primary}44`
      : "none"};

  /* Alt border animasyonu */
  &::after {
    content: "";
    display: block;
    position: absolute;
    left: 32%;
    right: 32%;
    bottom: 0;
    height: 3px;
    border-radius: 3px;
    background: ${({ $active, theme }) =>
      $active ? theme.colors.primary : "transparent"};
    transition: background 0.3s, left 0.2s, right 0.2s;
  }

  &:hover,
  &:focus-visible {
    background: ${({ theme, $active }) =>
      $active ? theme.colors.primary : theme.colors.primaryHover};
    color: #fff;
  }
`;

