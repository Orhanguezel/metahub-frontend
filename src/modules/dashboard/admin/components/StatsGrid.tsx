"use client";
import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { StatCard } from "@/modules/dashboard";

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
  const { t } = useTranslation("admin-dashboard");

  if (!Array.isArray(entries) || entries.length === 0) {
    return <EmptyInfo>{t("noData", "Hiç veri bulunamadı.")}</EmptyInfo>;
  }
  return (
    <Grid>
      {entries.map((stat) => (
        <StatCard
          key={stat.key}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          highlight={stat.highlight}
        />
      ))}
    </Grid>
  );
};

export default StatsGrid;

// --- Styled Components ---
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 2rem;
`;

const EmptyInfo = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.15rem;
  text-align: center;
  padding: 2rem 0;
`;
