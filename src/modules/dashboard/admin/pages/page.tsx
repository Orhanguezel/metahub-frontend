"use client";

import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/dashboard/locales";

import { StatsGrid, AnalyticsPanel } from "@/modules/dashboard";

/* selectors + clear actions (yalnızca okumalar) */
import {
  clearOverviewError,
  selectOverview,
  selectOverviewData,
  selectOverviewLoading,
} from "@/modules/dashboard/slice/dailyOverviewSlice";
import {
  clearChartsError,
  selectCharts,
  selectChartsData,
  selectChartsLoading,
} from "@/modules/dashboard/slice/chartDataSlice";
import {
  clearLogsError,
  selectDashboardLogs,
} from "@/modules/dashboard/slice/logsSlice";
import {
  clearAnalyticsError,
  selectAnalytics,
  selectAnalyticsLoading,
} from "@/modules/dashboard/slice/analyticsSlice";

import {ModulesGrid,DashboardCharts} from "@/modules/dashboard";
import {
  PageWrap,
  HeaderBar,
  Right,
  Counter,
  Section,
  SectionHead,
  Card,
  SmallBtn,
} from "../components/Layout";

type TabKey = "modules" | "stats" | "charts" | "analytics";

export default function AdminDashboardPage() {
  const { t } = useI18nNamespace("dashboard", translations);
  const dispatch = useAppDispatch();

  // slice okumaları
  const overviewState   = useAppSelector(selectOverview);
  const overviewData    = useAppSelector(selectOverviewData);
  const overviewLoading = useAppSelector(selectOverviewLoading);

  const chartsState   = useAppSelector(selectCharts);
  const chartsData    = useAppSelector(selectChartsData);
  const chartsLoading = useAppSelector(selectChartsLoading);

  const logsState   = useAppSelector(selectDashboardLogs);

  const analyticsState   = useAppSelector(selectAnalytics);
  const analyticsLoading = useAppSelector(selectAnalyticsLoading);

  const [tab, setTab] = useState<TabKey>("modules");

  // toast + temizleme (merkezî fetch sonrası yalnız mesajları ele al)
  useEffect(() => {
    if (overviewState.error)  { toast.error(String(overviewState.error));   dispatch(clearOverviewError()); }
    if (chartsState.error)    { toast.error(String(chartsState.error));     dispatch(clearChartsError()); }
    if (logsState.error)      { toast.error(String(logsState.error));       dispatch(clearLogsError()); }
    if (analyticsState.error) { toast.error(String(analyticsState.error));  dispatch(clearAnalyticsError()); }

    if (overviewState.successMessage)  toast.success(String(overviewState.successMessage));
    if (chartsState.successMessage)    toast.success(String(chartsState.successMessage));
    if (logsState.successMessage)      toast.success(String(logsState.successMessage));
    if (analyticsState.successMessage) toast.success(String(analyticsState.successMessage));
  }, [overviewState, chartsState, logsState, analyticsState, dispatch]);

  // stat kartları
  const statEntries = useMemo(() => {
    const {
      apartments = 0,
      employees = 0,
      activeContracts = 0,
      overdueInvoices = 0,
      plannedJobsToday = 0,
      timeLast7dMinutes = 0,
    } = (overviewData?.counters ?? {}) as Partial<{
      apartments: number;
      employees: number;
      activeContracts: number;
      overdueInvoices: number;
      plannedJobsToday: number;
      timeLast7dMinutes: number;
    }>;

    const { revenue = 0, expenses = 0, net = 0 } = (overviewData?.finance ??
      {}) as Partial<{ revenue: number; expenses: number; net: number }>;

    return [
      { key: "apartments", label: t("stats.apartments", "Apartments"), value: apartments },
      { key: "employees",  label: t("stats.employees", "Employees"),   value: employees },
      { key: "contracts",  label: t("stats.contracts", "Active Contracts"), value: activeContracts },
      { key: "overdue",    label: t("stats.overdueInvoices", "Overdue Invoices"), value: overdueInvoices },
      { key: "jobsToday",  label: t("stats.jobsToday", "Jobs Today"), value: plannedJobsToday },
      { key: "time",       label: t("stats.timeLast7d", "Time (7d, min)"), value: timeLast7dMinutes },
      { key: "revenue",    label: t("stats.revenue", "Revenue"), value: revenue,  highlight: true },
      { key: "expenses",   label: t("stats.expenses", "Expenses"), value: expenses },
      { key: "net",        label: t("stats.net", "Net"), value: net, highlight: true },
    ];
  }, [overviewData, t]);

  const modulesCount = useAppSelector((s: any) =>
    Array.isArray(s?.moduleSetting)
      ? s.moduleSetting.filter((m: any) => m?.showInDashboard !== false && m?.enabled !== false).length
      : 0
  );

  const isLoadingCurrentTab =
    (tab === "stats"     && overviewLoading) ||
    (tab === "charts"    && chartsLoading)  ||
    (tab === "analytics" && analyticsLoading);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "modules",   label: t("tabs.modules",   "Modules") },
    { key: "stats",     label: t("tabs.stats",     "Statistics") },
    { key: "charts",    label: t("tabs.revenue",   "Revenue & Series") },
    { key: "analytics", label: t("tabs.analytics", "Analytics") },
  ];

  return (
    <PageWrap>
      <HeaderBar>
        <h1>{t("title", "Dashboard")}</h1>
        <Right>
          <Counter>{modulesCount}</Counter>
          {isLoadingCurrentTab && <SmallBtn disabled>{t("loading", "Loading…")}</SmallBtn>}
        </Right>
      </HeaderBar>

      <TabsBar>
        {tabs.map(tb => (
          <TabBtn key={tb.key} $active={tab===tb.key} onClick={()=>setTab(tb.key)} type="button">
            {tb.label}
          </TabBtn>
        ))}
      </TabsBar>

      {tab === "modules" && (
        <Section>
          <SectionHead><h2>{t("tabs.modules","Modules")}</h2></SectionHead>
          <Card><ModulesGrid /></Card>
        </Section>
      )}

      {tab === "stats" && (
        <Section>
          <SectionHead><h2>{t("tabs.stats","Statistics")}</h2></SectionHead>
          <Card><StatsGrid entries={statEntries} /></Card>
        </Section>
      )}

      {tab === "charts" && (
        <Section>
          <SectionHead><h2>{t("tabs.revenue","Revenue & Series")}</h2></SectionHead>
          <Card><DashboardCharts data={chartsData} /></Card>
        </Section>
      )}

      {tab === "analytics" && (
        <Section>
          <SectionHead><h2>{t("tabs.analytics","Analytics")}</h2></SectionHead>
          <Card><AnalyticsPanel /></Card>
        </Section>
      )}
    </PageWrap>
  );
}

/* — Tabs UI — */
const TabsBar = styled.div`
  display:flex; align-items:center; gap:${({theme})=>theme.spacings.sm};
  margin-bottom:${({theme})=>theme.spacings.lg};
  flex-wrap:wrap;
`;
const TabBtn = styled.button<{ $active:boolean }>`
  padding:${({theme})=>`${theme.spacings.sm} ${theme.spacings.lg}`};
  border:none; cursor:pointer; border-radius:${({theme})=>theme.radii.pill};
  background:${({$active,theme})=>$active?theme.colors.primary:theme.colors.background};
  color:${({$active,theme})=>$active?theme.colors.white:theme.colors.textPrimary};
  font-weight:${({$active})=>$active?700:400};
  box-shadow:${({$active,theme})=>$active?theme.shadows.sm:"none"};
  transition:${({theme})=>theme.transition.fast};
`;
