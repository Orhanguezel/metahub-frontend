"use client";
import React from "react";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useTranslation } from "react-i18next";

const RevenueCard = () => {
  const { t, i18n } = useTranslation("admin-dashboard");
  const revenue = useAppSelector((s) => s.dashboard.stats?.revenue ?? 0);

  // Lokalize sayı formatı (isteğe bağlı)
  const formattedRevenue = revenue.toLocaleString(i18n.language === "de" ? "de-DE" : i18n.language === "tr" ? "tr-TR" : "en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <Card>
      <Title>{t("stats.revenue", "Total Revenue")}</Title>
      <Number>{formattedRevenue}</Number>
    </Card>
  );
};
export default RevenueCard;

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
