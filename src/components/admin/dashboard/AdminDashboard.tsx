"use client";

import DashboardCards from "./DashboardCards";
import AdminAnalysisSection from "./AdminAnalysisSection";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

export default function AdminDashboard() {
  const { t } = useTranslation("dashboard");

  return (
    <Container>
      <Title>{t("adminPanel", "Admin Paneli")}</Title>
      <Welcome>{t("welcome", "Hoş geldiniz")}, 👋</Welcome>

      <DashboardCards />
      <AdminAnalysisSection />
    </Container>
  );
}

// --- Styled Components ---
const Container = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.text};
`;

const Welcome = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 2rem;
`;
