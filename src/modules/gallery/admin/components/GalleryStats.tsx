"use client";

import React from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

// Flexible prop type for future extensibility
interface GalleryStatsProps {
  stats?: {
    total?: number;
    published?: number;
    archived?: number;
    active?: number;
    inactive?: number;
    images?: number;
    videos?: number;
  } | null; // null eklenir
}

const GalleryStats: React.FC<GalleryStatsProps> = ({ stats }) => {
  const { t } = useI18nNamespace("gallery", translations);

  const statList = [
    { key: "total", label: t("stats.total", "Total"), value: stats?.total ?? 0 },
    { key: "published", label: t("stats.published", "Published"), value: stats?.published ?? 0 },
    { key: "archived", label: t("stats.archived", "Archived"), value: stats?.archived ?? 0 },
    { key: "active", label: t("stats.active", "Active"), value: stats?.active ?? 0 },
    { key: "inactive", label: t("stats.inactive", "Inactive"), value: stats?.inactive ?? 0 },
    { key: "images", label: t("stats.images", "Images"), value: stats?.images ?? 0 },
    { key: "videos", label: t("stats.videos", "Videos"), value: stats?.videos ?? 0 },
  ];

  return (
    <StatsWrapper>
      <Title>{t("stats.title", "Gallery Statistics")}</Title>
      <Grid>
        {statList.map((stat) => (
          <StatBox key={stat.key}>
            <Label>{stat.label}</Label>
            <Value>{stat.value}</Value>
          </StatBox>
        ))}
      </Grid>
    </StatsWrapper>
  );
};

export default GalleryStats;

// 💅 Styled Components

const StatsWrapper = styled.section`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacings.xl};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  transition: box-shadow ${({ theme }) => theme.transition.normal},
    background ${({ theme }) => theme.transition.normal};

  @media ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacings.md};
    border-radius: ${({ theme }) => theme.radii.md};
    margin-bottom: ${({ theme }) => theme.spacings.lg};
  }
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.01em;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: ${({ theme }) => theme.spacings.lg};
`;

const StatBox = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacings.lg};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: background ${({ theme }) => theme.transition.normal},
    box-shadow ${({ theme }) => theme.transition.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.hoverBackground};
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  @media ${({ theme }) => theme.media.mobile} {
    border-radius: ${({ theme }) => theme.radii.md};
    padding: ${({ theme }) => theme.spacings.md};
  }
`;

const Label = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.body};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  letter-spacing: 0.01em;
`;

const Value = styled.span`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin: 0;
  letter-spacing: 0.01em;
`;
