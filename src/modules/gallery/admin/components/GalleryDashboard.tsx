"use client";
import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

const GalleryDashboard = ({ stats }: { stats: any }) => {
  const { t } = useTranslation("gallery");
  if (!stats) return null;

  return (
    <StatsContainer>
      <Card>
        <Label>{t("stats.total")}</Label>
        <Value>{stats.total || 0}</Value>
      </Card>
      <Card>
        <Label>{t("stats.published")}</Label>
        <Value>{stats.published || 0}</Value>
      </Card>
      <Card>
        <Label>{t("stats.archived")}</Label>
        <Value>{stats.archived || 0}</Value>
      </Card>
    </StatsContainer>
  );
};

export default GalleryDashboard;

const StatsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const Card = styled.div`
  flex: 1;
  min-width: 180px;
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const Label = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Value = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`;
