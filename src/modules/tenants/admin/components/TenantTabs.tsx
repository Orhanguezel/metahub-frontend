// TenantTabs.tsx
"use client";

import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/tenants";

export type ActiveTab = "list" | "form";

const tabs: { key: ActiveTab; label: string; fallback: string }[] = [
  { key: "list", label: "admin.tabs.tenant", fallback: "Tenants" },
  { key: "form", label: "admin.tabs.create", fallback: "Add New" },
];

export interface TenantTabsProps {
  activeTab: ActiveTab;
  onChange: (key: ActiveTab) => void;
}

export default function TenantTabs({ activeTab, onChange }: TenantTabsProps) {
  const { t } = useI18nNamespace("tenant", translations);

  return (
    <Tabs>
      {tabs.map((tab) => (
        <Tab
          key={tab.key}
          $active={activeTab === tab.key}
          aria-current={activeTab === tab.key ? "page" : undefined}
          onClick={() => onChange(tab.key)}
          type="button"
        >
          {t(tab.label, tab.fallback)}
        </Tab>
      ))}
    </Tabs>
  );
}

/* styled — pill tabs pattern */
const Tabs = styled.div`
  display:flex; gap:${({ theme }) => theme.spacings.xs};
`;

const Tab = styled.button<{ $active?: boolean }>`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ $active, theme }) => ($active ? theme.colors.primaryLight : theme.colors.cardBackground)};
  color: ${({ theme }) => theme.colors.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  cursor: pointer;
`;
