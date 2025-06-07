"use client";

import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

// Stat alanlarını prop tipinde daha esnek tanımlayabilirsin
interface GalleryStatsProps {
  stats?: {
    total?: number;
    published?: number;
    archived?: number;
    active?: number;
    inactive?: number;
    images?: number;
    videos?: number;
  };
}

const GalleryStats: React.FC<GalleryStatsProps> = ({ stats }) => {
  const { t} = useTranslation("gallery");

  const statList = [
    { key: "total", label: t("stats.total"), value: stats?.total ?? 0 },
    { key: "published", label: t("stats.published"), value: stats?.published ?? 0 },
    { key: "archived", label: t("stats.archived"), value: stats?.archived ?? 0 },
    { key: "active", label: t("stats.active"), value: stats?.active ?? 0 },
    { key: "inactive", label: t("stats.inactive"), value: stats?.inactive ?? 0 },
    { key: "images", label: t("stats.images"), value: stats?.images ?? 0 },
    { key: "videos", label: t("stats.videos"), value: stats?.videos ?? 0 },
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


// Styled-components
const StatsWrapper = styled.section`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  width: 100%;
  box-sizing: border-box;
  transition: box-shadow ${({ theme }) => theme.transition.normal},
    background ${({ theme }) => theme.transition.normal};

  @media ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.radii.md};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.01em;
  text-align: left;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;
`;

const StatBox = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  transition: background ${({ theme }) => theme.transition.normal},
    box-shadow ${({ theme }) => theme.transition.normal},
    transform ${({ theme }) => theme.transition.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.hoverBackground};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    transform: translateY(-2px) scale(1.025);
  }

  @media ${({ theme }) => theme.media.mobile} {
    border-radius: ${({ theme }) => theme.radii.md};
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const Label = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.body};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
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

export {
  StatsWrapper,
  Title,
  Grid,
  StatBox,
  Label,
  Value,
};
