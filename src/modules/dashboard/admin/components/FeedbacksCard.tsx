"use client";
import React from "react";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

const FeedbacksCard = () => {
  const { t } = useI18nNamespace("dashboard", translations);
  // Stat grid ile aynı key, future-proof:
  const count = useAppSelector((s) => s.dashboard.stats?.feedbacks ?? 0);

  return (
    <Card>
      <Title>{t("stats.feedbacks", "Feedbacks")}</Title>
      <Number>{count}</Number>
    </Card>
  );
};
export default FeedbacksCard;

// --- Styled Components ---
const Card = styled.div`
  background: ${({ theme }) => theme.colors.background || "#fff"};
  border-radius: 1.2rem;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 3px 16px rgba(0, 0, 0, 0.07);
`;

const Title = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.4rem;
`;

const Number = styled.div`
  font-size: 2.1rem;
  color: ${({ theme }) => theme.colors.primary || "#357"};
  font-weight: 700;
`;
