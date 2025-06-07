"use client";
import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useTranslation } from "react-i18next";
import { fetchDashboardStats } from "@/modules/dashboard/slice/dashboardSlice";
import {
  FeedbacksCard,
  RevenueCard,
  StatsGrid,
  UsersCard,
} from "@/modules/dashboard";

export default function AdminDashboardPage() {
  const { t } = useTranslation("admin-dashboard");
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<
    "modules" | "stats" | "users" | "revenue" | "feedbacks"
  >("modules");

  // Tüm hook'lar komponentin en üstünde, koşulsuz şekilde!
  const stats = useAppSelector((state) => state.dashboard.stats);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const tabs = [
    { key: "modules", label: t("tabs.modules", "Modüller") },
    { key: "stats", label: t("tabs.stats", "İstatistikler") },
    { key: "users", label: t("tabs.users", "Kullanıcılar") },
    { key: "revenue", label: t("tabs.revenue", "Gelir") },
    { key: "feedbacks", label: t("tabs.feedbacks", "Geri Bildirimler") },
  ];

  // Stateleri işleyip StatsGrid'e uygun entries array'i hazırla
  const statEntries = useMemo(() => {
    if (!stats) return [];
    return [
      {
        key: "users",
        label: t("stats.users", "Kullanıcılar"),
        value: stats.users || 0,
      },
      {
        key: "products",
        label: t("stats.products", "Ürünler"),
        value: stats.products || 0,
      },
      {
        key: "orders",
        label: t("stats.orders", "Siparişler"),
        value: stats.orders || 0,
      },
      {
        key: "revenue",
        label: t("stats.revenue", "Toplam Gelir"),
        value: stats.revenue || 0,
        highlight: true,
      },
      // Backend’deki ek statlara göre artırabilirsin!
    ];
  }, [stats, t]);

  return (
    <Main>
      <TabBar>
        {tabs.map((item) => (
          <TabBtn
            key={item.key}
            $active={tab === item.key}
            onClick={() => setTab(item.key as any)}
          >
            {item.label}
          </TabBtn>
        ))}
      </TabBar>

      {tab === "modules" && <ModulesGrid />}
      {tab === "stats" && <StatsGrid entries={statEntries} />}
      {tab === "users" && <UsersCard />}
      {tab === "revenue" && <RevenueCard />}
      {tab === "feedbacks" && <FeedbacksCard />}
    </Main>
  );
}

// --- Modüller Grid ---
function ModulesGrid() {
  const { i18n } = useTranslation();
  const modules = useAppSelector((state) => state.admin.modules);
  const lang = (i18n.language || "en") as "tr" | "en" | "de";
  const dashboardModules = Array.isArray(modules)
    ? modules
        .filter((mod) => mod.showInDashboard !== false && mod.enabled !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((mod) => ({
          key: mod.name,
          label: mod.label?.[lang] || mod.name,
          description: mod.description?.[lang] || "",
          slug: mod.slug || mod.name,
        }))
    : [];
  return (
    <Grid>
      {dashboardModules.map((mod) => (
        <Link
          href={`/admin/${mod.slug}`}
          key={mod.key}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Card tabIndex={0}>
            <Label>{mod.label}</Label>
            <Description>{mod.description}</Description>
          </Card>
        </Link>
      ))}
    </Grid>
  );
}

// Styled components
const Main = styled.div`
  width: 100%;
  padding: 2rem;
`;
const TabBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;
const TabBtn = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1.3rem;
  font-size: 1rem;
  border-radius: 1.1rem;
  border: none;
  cursor: pointer;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.background};
  color: ${({ $active, theme }) =>
    $active ? "#fff" : theme.colors.textPrimary};
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
  box-shadow: ${({ $active }) =>
    $active ? "0 4px 12px rgba(44,55,125,0.11)" : "none"};
  transition: all 0.18s;
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 2rem;
`;
const Card = styled.div`
  background: ${({ theme }) => theme.colors.background || "#fff"};
  border-radius: 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: box-shadow 0.12s;
  &:hover,
  &:focus {
    box-shadow: 0 6px 20px rgba(44, 55, 125, 0.13);
  }
`;
const Label = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
`;
const Description = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary || "#888"};
  font-size: 0.95rem;
  text-align: center;
`;
