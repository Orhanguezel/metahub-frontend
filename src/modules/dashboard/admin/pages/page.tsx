"use client";

import { useState, useMemo } from "react";
import styled from "styled-components";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { useTranslation } from "react-i18next";
import {
  FeedbacksCard,
  RevenueCard,
  StatsGrid,
  UsersCard,
  AnalyticsPanel,
} from "@/modules/dashboard";
import type { SupportedLocale } from "@/types/common";

export default function AdminDashboardPage() {
  const { t } = useTranslation("admin-dashboard");
  const [tab, setTab] = useState<
    "modules" | "stats" | "users" | "revenue" | "feedbacks" | "analytics"
  >("modules");

  // --- SENİN MEVCUT TAB KODUN VE COMPONENTLERİN ---
  const stats = useAppSelector((state) => state.dashboard.stats);

  const tabs = [
    { key: "modules", label: t("tabs.modules", "Modules") },
    { key: "stats", label: t("tabs.stats", "Statistics") },
    { key: "users", label: t("tabs.users", "Users") },
    { key: "revenue", label: t("tabs.revenue", "Revenue") },
    { key: "feedbacks", label: t("tabs.feedbacks", "Feedbacks") },
    { key: "analytics", label: t("tabs.analytics", "Analytics") },
  ];

  const statEntries = useMemo(() => {
    if (!stats) return [];
    return [
      {
        key: "users",
        label: t("stats.users", "Users"),
        value: stats.users || 0,
      },
      {
        key: "products",
        label: t("stats.products", "Products"),
        value: stats.products || 0,
      },
      {
        key: "orders",
        label: t("stats.orders", "Orders"),
        value: stats.orders || 0,
      },
      {
        key: "revenue",
        label: t("stats.revenue", "Total Revenue"),
        value: stats.revenue || 0,
        highlight: true,
      },
      {
        key: "analytics",
        label: t("stats.analytics", "Analytics"),
        value: stats.analytics || 0,
      },
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
      {tab === "analytics" && <AnalyticsPanel />}
    </Main>
  );
}

// --- Module grid sadece selector ile state çeker ---
function ModulesGrid() {
  const { i18n } = useTranslation("admin-dashboard");
  const modules = useAppSelector((state) => state.moduleSetting); // moduleSetting slice!
  const lang = (i18n.language as SupportedLocale) || "en";

  const dashboardModules = Array.isArray(modules)
    ? modules
        .filter((mod) => mod.showInDashboard !== false && mod.enabled !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((mod) => ({
          key: mod.name,
          label: mod.label?.[lang] || mod.label?.en || mod.name,
          description: mod.description?.[lang] || mod.description?.en || "",
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

// --- Styled Components ---
const Main = styled.div`
  width: 100%;
  padding: ${({ theme }) => theme.spacings.xl};
`;

const TabBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.md};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
`;

const TabBtn = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => `${theme.spacings.sm} ${theme.spacings.lg}`};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  border-radius: ${({ theme }) => theme.radii.pill};
  border: none;
  cursor: pointer;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.background};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.white : theme.colors.textPrimary};
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
  box-shadow: ${({ $active, theme }) => ($active ? theme.shadows.sm : "none")};
  transition: ${({ theme }) => theme.transition.fast};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: ${({ theme }) => theme.spacings.xl};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cards.background};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => `${theme.spacings.xl} ${theme.spacings.md}`};
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};
  &:hover,
  &:focus {
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const Label = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
`;

const Description = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
`;
