"use client";

import { useEffect } from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { getDashboardStats } from "@/store/dashboard/dashboardSlice";
import { useDashboardCards } from "@/hooks/useDashboardCards";
import AdminAnalysisSection from "./AdminAnalysisSection";
import { useTranslation } from "react-i18next";

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { profile, loading: authLoading } = useSelector((state: RootState) => state.account);
  const { loading: statsLoading } = useSelector((state: RootState) => state.dashboard);
  const { t } = useTranslation("dashboard");

  useEffect(() => {
    if (!authLoading && !profile) {
      router.replace("/login");
    } else if (profile) {
      dispatch(getDashboardStats());
    }
  }, [authLoading, profile, dispatch, router]);

  const cards = useDashboardCards();

  if (authLoading || statsLoading) return <div>Loading...</div>;
  if (!profile) return <div>Unauthorized</div>;

  return (
    <Container>
      <Title>{t("adminPanel")}</Title>
      <Welcome>
      {t("willcommen")}, <strong>{profile.name}</strong> 👋
      </Welcome>

      <StatGrid>
        {cards.map(({ key, label, value, path, icon: Icon }) => (
          <Card key={key} onClick={() => router.push(`/admin/${path}`)}>
            {Icon && <StatIcon><Icon /></StatIcon>}
            <StatInfo>
              <StatValue>{value}</StatValue>
              <StatLabel>{label}</StatLabel>
            </StatInfo>
          </Card>
        ))}
      </StatGrid>

      <AdminAnalysisSection />
    </Container>
  );
}


// Styled Components
const Container = styled.div`
  padding: 2rem;
  color: ${({ theme }) => theme.text};
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 1rem;
`;

const Welcome = styled.p`
  font-size: 1rem;
  margin-bottom: 2rem;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground || "#fff"};
  padding: 1.2rem;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
`;

const StatIcon = styled.div`
  font-size: 2rem;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 0.5rem;
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
`;

const StatValue = styled.span`
  font-size: 1.4rem;
  font-weight: bold;
`;

const StatLabel = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
`;
