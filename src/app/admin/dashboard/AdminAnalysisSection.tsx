// src/components/admin/dashboard/AdminAnalysisSection.tsx
"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

export default function AdminAnalysisSection() {
  const { stats } = useSelector((state: RootState) => state.dashboard);
  const { t } = useTranslation("dashboard");

  const overview = stats?.dailyOverview;

  if (!overview) return null;

  return (
    <AnalysisWrapper>
      <h2>{t("analysisTitle")}</h2>
      <AnalysisBox>
        <div>
          <strong>{t("newUsers")}</strong>
          <p>{overview.newUsers}</p>
        </div>
        <div>
          <strong>{t("revenue")}</strong>
          <p>{overview.revenue} €</p>
        </div>
        <div>
          <strong>{t("orders")}</strong>
          <p>{overview.orders}</p>
        </div>
        <div>
          <strong>{t("feedbacks")}</strong>
          <p>{overview.feedbacks}</p>
        </div>
      </AnalysisBox>
    </AnalysisWrapper>
  );
}

const AnalysisWrapper = styled.section`
  margin-top: 3rem;
`;

const AnalysisBox = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  div {
    padding: 1rem;
    background: ${({ theme }) => theme.cardBackground};
    border-radius: 10px;
  }
`;
