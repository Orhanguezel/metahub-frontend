'use client';

import { useAppSelector } from "@/store/hooks";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import SkeletonBox from "@/components/shared/Skeleton";

export default function AdminAnalysisSection() {
  const { stats, loading: statsLoading } = useAppSelector((state) => state.dashboard);
  const { t } = useTranslation("dashboard");

  const overview = stats?.dailyOverview;

  if (statsLoading) {
    return (
      <Section>
        <SectionTitle>{t("analysisTitle")}</SectionTitle>
        <Grid>
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonAnalysisBox key={idx} />
          ))}
        </Grid>
      </Section>
    );
  }

  if (!overview) return null;

  return (
    <Section>
      <SectionTitle>{t("analysisTitle")}</SectionTitle>
      <Grid>
        <Box>
          <strong>{t("newUsers")}</strong>
          <p>{overview.newUsers}</p>
        </Box>
        <Box>
          <strong>{t("revenue")}</strong>
          <p>{overview.revenue} €</p>
        </Box>
        <Box>
          <strong>{t("orders")}</strong>
          <p>{overview.orders}</p>
        </Box>
        <Box>
          <strong>{t("feedbacks")}</strong>
          <p>{overview.feedbacks}</p>
        </Box>
      </Grid>
    </Section>
  );
}

// Styled Components

const Section = styled.section`
  margin-top: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  margin-bottom: 1rem;
`;

const Grid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
`;

const Box = styled.div`
  padding: 1rem;
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 10px;
  text-align: center;
`;

const SkeletonAnalysisBox = styled(SkeletonBox)`
  height: 100px;
  border-radius: 10px;
`;
