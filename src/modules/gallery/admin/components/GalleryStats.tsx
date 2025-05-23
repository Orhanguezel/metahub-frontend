import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

interface Props {
  stats: {
    total: number;
    published: number;
    archived: number;
    active: number;
    inactive: number;
    images: number;
    videos: number;
  };
}

const GalleryStats: React.FC<Props> = ({ stats }) => {
  const { t } = useTranslation("gallery");

  if (!stats) return null;

  return (
    <StatsWrapper>
      <Title>{t("stats.title")}</Title>
      <Grid>
        <StatBox>
          <Label>{t("stats.total")}</Label>
          <Value>{stats.total}</Value>
        </StatBox>
        <StatBox>
          <Label>{t("stats.published")}</Label>
          <Value>{stats.published}</Value>
        </StatBox>
        <StatBox>
          <Label>{t("stats.archived")}</Label>
          <Value>{stats.archived}</Value>
        </StatBox>
        <StatBox>
          <Label>{t("stats.active")}</Label>
          <Value>{stats.active}</Value>
        </StatBox>
        <StatBox>
          <Label>{t("stats.inactive")}</Label>
          <Value>{stats.inactive}</Value>
        </StatBox>
        <StatBox>
          <Label>{t("stats.images")}</Label>
          <Value>{stats.images}</Value>
        </StatBox>
        <StatBox>
          <Label>{t("stats.videos")}</Label>
          <Value>{stats.videos}</Value>
        </StatBox>
      </Grid>
    </StatsWrapper>
  );
};

export default GalleryStats;

// 🎨 styled-components
const StatsWrapper = styled.section`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const StatBox = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const Label = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Value = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
`;
