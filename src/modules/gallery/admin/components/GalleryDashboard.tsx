"use client";
import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

export interface GalleryStatsData {
  total: number;
  published: number;
  archived: number;
  active?: number;
  inactive?: number;
  images?: number;
  videos?: number;
  [key: string]: number | undefined;
}

interface Props {
  stats: GalleryStatsData | null;
}

const statOrder: { key: keyof GalleryStatsData; label: string }[] = [
  { key: "total", label: "stats.total" },
  { key: "published", label: "stats.published" },
  { key: "archived", label: "stats.archived" },
  { key: "active", label: "stats.active" },
  { key: "inactive", label: "stats.inactive" },
  { key: "images", label: "stats.images" },
  { key: "videos", label: "stats.videos" },
];

const GalleryDashboard: React.FC<Props> = ({ stats }) => {
  const { t } = useTranslation("gallery");
  if (!stats) return null;

  return (
    <StatsContainer>
      {statOrder
        .filter(({ key }) => stats[key] !== undefined)
        .map(({ key, label }) => (
          <Card key={key}>
            <Label>{t(label)}</Label>
            <Value>{stats[key] ?? 0}</Value>
          </Card>
        ))}
    </StatsContainer>
  );
};

export default GalleryDashboard;

// Styled Components (100% theme compliant)

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.sm} 0;

  @media ${({ theme }) => theme.media.mobile} {
    gap: ${({ theme }) => theme.spacing.md};
    grid-template-columns: 1fr 1fr;
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  transition: background ${({ theme }) => theme.transition.normal},
    box-shadow ${({ theme }) => theme.transition.normal},
    transform ${({ theme }) => theme.transition.normal};
  cursor: default;

  &:hover {
    background: ${({ theme }) => theme.colors.hoverBackground};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    transform: translateY(-2px) scale(1.025);
  }

  @media ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.radii.md};
  }
`;

const Label = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  letter-spacing: 0.01em;
`;

const Value = styled.h4`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.01em;
`;

