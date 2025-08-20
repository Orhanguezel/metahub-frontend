"use client";

import React, { useMemo } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import StatCard from "./StatCard"; // barrel kullanmıyorsan relative; barrel kullanıyorsan: { StatCard } from "@/modules/dashboard";

export interface GridEntry {
  key: string;
  label: string;
  icon?: React.ReactNode;
  value: number | string;
  highlight?: boolean;
}

export interface StatsGridProps {
  entries: GridEntry[];
}

const StatsGrid: React.FC<StatsGridProps> = ({ entries }) => {
  const { t, i18n } = useI18nNamespace("dashboard", translations);

  const formatted = useMemo(() => {
    if (!Array.isArray(entries)) return [];
    const nf = new Intl.NumberFormat(i18n.language || "en-US");
    return entries.map((e) => ({
      ...e,
      value:
        typeof e.value === "number" && Number.isFinite(e.value)
          ? nf.format(e.value)
          : e.value ?? "—",
    }));
  }, [entries, i18n.language]);

  if (!formatted.length) {
    return <EmptyInfo>{t("noData", "Hiç veri bulunamadı.")}</EmptyInfo>;
  }

  return (
    <Grid>
      {formatted.map((stat) => (
        <StatCard
          key={stat.key}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          highlight={!!stat.highlight}
        />
      ))}
    </Grid>
  );
};

export default StatsGrid;

/* styled */
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: ${({ theme }) => theme.spacings.lg};
`;

const EmptyInfo = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.05rem;
  text-align: center;
  padding: 2rem 0;
`;
