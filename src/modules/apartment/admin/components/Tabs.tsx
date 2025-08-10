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
  loading?: boolean;
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

/* ---------------- Styles (classicTheme uyumlu) ---------------- */

const Header = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  align-items: center;

  /* Mobilde taşma olmaması için yatay kaydırma + snap */
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  padding: 0 ${({ theme }) => theme.spacings.xs};

  /* kenarlarda yumuşak fade efekti */
  mask-image: linear-gradient(
    to right,
    transparent 0,
    black 14px,
    black calc(100% - 14px),
    transparent 100%
  );

  /* scrollbar gizle */
  &::-webkit-scrollbar { display: none; }
  scrollbar-width: none;

  /* Çocuklar satır dışına taşmasın, snap noktasına otursun */
  & > * {
    flex: 0 0 auto;
    scroll-snap-align: start;
  }

  /* Tablet ve üstü: boşlukları biraz aç */
  ${({ theme }) => theme.media.desktop} {
    gap: ${({ theme }) => theme.spacings.md};
    padding: 0;
    mask-image: none;
  }
`;

const TabButton = styled.button<{ $active: boolean; $disabled?: boolean }>`
  position: relative;
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 0.55rem 1.15rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  outline: none;

  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.background};
  color: ${({ $active, theme }) => ($active ? "#fff" : theme.colors.text)};
  box-shadow: ${({ $active, theme }) =>
    $active ? theme.shadows.button : "none"};
  transition: transform ${props => props.theme.transition.fast},
              background ${props => props.theme.transition.fast},
              color ${props => props.theme.transition.fast},
              box-shadow ${props => props.theme.transition.fast},
              border-color ${props => props.theme.transition.fast};

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.colors.primaryHover};
    color: #fff;
    border-color: ${({ theme }) => theme.colors.borderHighlight};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }

  &:active {
    transform: translateY(1px) scale(0.99);
  }

  /* Disabled görünüm */
  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    pointer-events: none;
  }

  /* Küçük ekranlarda biraz daha kompakt */
  ${({ theme }) => theme.media.small} {
    padding: 0.5rem 1rem;
    font-size: ${({ theme }) => theme.fontSizes.xs};
  }

  ${({ theme }) => theme.media.xsmall} {
    padding: 0.45rem 0.9rem;
    font-size: 0.8rem;
  }
`;
