"use client";

import { useMemo, useState } from "react";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import {
  LineChart,
  BarChart,
  AnalyticsTable,
  FilterBar,
  DateRangeSelector,
} from "@/modules/dashboard";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales";
import { Loader } from "@/shared";
import { Download, FileText } from "lucide-react";
import dynamic from "next/dynamic";

const MapChart = dynamic(
  () => import("@/modules/dashboard/admin/components/analytics/MapChart"),
  { ssr: false }
);

function exportToCSV(data: any[], filename = "export.csv") {
  if (!data?.length) return;
  const keys = Object.keys(data[0]);
  const csvRows = [
    keys.join(","),
    ...data.map((row) =>
      keys
        .map((k) => `"${(row[k] ?? "").toString().replace(/"/g, '""')}"`)
        .join(",")
    ),
  ];
  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function AnalyticsPanel() {
  const { t, i18n } = useI18nNamespace("dashboard", translations);

  // Redux State: (Parent’ta fetch edilmiş olmalı!)
  const analytics = useAppSelector((state) => state.analytics);
  const { modules = [], loading: modulesLoading } = useAppSelector((state) => state.moduleMeta);
  const { tenantModules = [], loading: settingsLoading } = useAppSelector((state) => state.moduleSetting);

  // Filtreler
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedEventType, setSelectedEventType] = useState<string>("");

  // Memo: Aktif analytics modülleri (tenant + meta merge)
  const activeAnalyticsModules = useMemo(() => {
    if (!Array.isArray(modules) || !Array.isArray(tenantModules)) return [];
    return modules
      .filter((mod) => {
        const setting = tenantModules.find((set) => set.module === mod.name);
        return setting?.enabled !== false && setting?.useAnalytics === true;
      })
      .map((mod) => ({
        value: mod.name,
        label: mod.label?.[i18n.language as keyof typeof mod.label] || mod.name,
      }));
  }, [modules, tenantModules, i18n.language]);

  // Tüm veriler (parent’tan)
  const trends = analytics.trends ?? [];
  const events = analytics.events ?? [];
  const loading = analytics.loading || modulesLoading || settingsLoading;
  const error = analytics.error;

  // Otomatik event tipleri/modül listesi
  const availableEventTypes = useMemo(() => {
    return Array.from(new Set(events.map((e) => e.eventType).filter(Boolean)));
  }, [events]);
  const availableModules = useMemo(() => {
    return Array.from(new Set(events.map((e) => e.module).filter(Boolean)));
  }, [events]);

  // Sadece location içeren eventler
  const eventsWithLocation = useMemo(
    () => events.filter((e) => e.location?.coordinates?.length === 2),
    [events]
  );

  // --- Local filter logic: UI için data’yı filtrele (isteğe bağlı) ---
  const filteredTrends = useMemo(() => {
    if (!selectedModule && !selectedEventType && !startDate && !endDate)
      return trends;
    // Trendler genelde backend filtreli gelir, gerekirse burada da filtre yapılır.
    return trends.filter((t: any) => {
      let ok = true;
      if (selectedModule && t.module !== selectedModule) ok = false;
      if (selectedEventType && t.eventType !== selectedEventType) ok = false;
      // Trendlerde tarih varsa burada date check de eklenebilir.
      return ok;
    });
  }, [trends, selectedModule, selectedEventType, startDate, endDate]);

  const filteredEvents = useMemo(() => {
    let result = events;
    if (selectedModule)
      result = result.filter((e: any) => e.module === selectedModule);
    if (selectedEventType)
      result = result.filter((e: any) => e.eventType === selectedEventType);
    if (startDate)
      result = result.filter(
        (e: any) =>
          e.timestamp && new Date(e.timestamp) >= new Date(startDate)
      );
    if (endDate)
      result = result.filter(
        (e: any) =>
          e.timestamp && new Date(e.timestamp) <= new Date(endDate)
      );
    return result;
  }, [events, selectedModule, selectedEventType, startDate, endDate]);

  // Export
  const handleExport = (format: "csv" | "json" = "csv") => {
    if (!filteredEvents?.length) return;
    if (format === "json") {
      const blob = new Blob([JSON.stringify(filteredEvents, null, 2)], {
        type: "application/json",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "analytics-export.json");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      exportToCSV(filteredEvents, "analytics-export.csv");
    }
  };

  const handleResetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedModule("");
    setSelectedEventType("");
  };
 return (
    <PanelWrapper>
      <Header>
        <Title>
          {t("analytics.title", "Log Analizi ve Etkinlik Trendleri")}
        </Title>
        <BtnGroup>
          <ExportBtn onClick={() => handleExport("csv")} title={t("exportCSV", "CSV Dışa Aktar")}>
            <Download size={18} /> CSV
          </ExportBtn>
          <ExportBtn onClick={() => handleExport("json")} title={t("exportJSON", "JSON Dışa Aktar")}>
            <FileText size={18} /> JSON
          </ExportBtn>
          <ResetBtn onClick={handleResetFilters}>
            {t("reset", "Filtreleri Temizle")}
          </ResetBtn>
        </BtnGroup>
      </Header>

      <Row>
        <label htmlFor="moduleSelect">{t("selectModule", "Modül Seç")}</label>
        <select
          id="moduleSelect"
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          disabled={!activeAnalyticsModules.length}
        >
          <option value="">{t("allModules", "Tümü")}</option>
          {activeAnalyticsModules.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <label htmlFor="eventTypeSelect">{t("eventType", "Event Tipi")}</label>
        <select
          id="eventTypeSelect"
          value={selectedEventType}
          onChange={(e) => setSelectedEventType(e.target.value)}
          disabled={!availableEventTypes.length}
        >
          <option value="">{t("allEvents", "Tümü")}</option>
          {availableEventTypes.map((et) => (
            <option key={et} value={et}>
              {et}
            </option>
          ))}
        </select>
      </Row>

      <DateRangeSelector
        startDate={startDate}
        endDate={endDate}
        onChange={({ startDate, endDate }) => {
          setStartDate(startDate);
          setEndDate(endDate);
        }}
      />

      <FilterBar
        module={selectedModule}
        eventType={selectedEventType}
        onChange={({ module, eventType }) => {
          setSelectedModule(module);
          setSelectedEventType(eventType);
        }}
        availableModules={availableModules}
        availableEventTypes={availableEventTypes}
      />

      {loading && <Loader />}
      {error && <Error>{error}</Error>}

      {!loading && (
        <>
          <Section>
            <SectionTitle>
              {t("analytics.dailyTrends", "Günlük Event Trendleri")}
            </SectionTitle>
            {filteredTrends.length ? (
              <LineChart data={filteredTrends} />
            ) : (
              <NoData>{t("noData")}</NoData>
            )}
          </Section>

          <Section>
            <SectionTitle>
              {t("analytics.moduleDistribution", "Modül Bazlı Yoğunluk")}
            </SectionTitle>
            {filteredEvents.length ? (
              <BarChart data={filteredEvents} />
            ) : (
              <NoData>{t("noData")}</NoData>
            )}
          </Section>

          <Section>
            <SectionTitle>
              {t("analytics.geoMap", "Coğrafi Dağılım")}
            </SectionTitle>
            {filteredEvents.filter((e: any) => e.location?.coordinates?.length === 2).length ? (
              <MapChart data={filteredEvents.filter((e: any) => e.location?.coordinates?.length === 2)} />
            ) : (
              <NoData>
                {t("noGeoData", "Konum verisi içeren kayıt yok.")}
              </NoData>
            )}
          </Section>

          <Section>
            <SectionTitle>
              {t("analytics.logTable", "Log Detayları")}
            </SectionTitle>
            <AnalyticsTable data={filteredEvents.slice(0, 20)} />
          </Section>
        </>
      )}
    </PanelWrapper>
  );
}

// --- THEMED & RESPONSIVE STYLED COMPONENTS ---
const PanelWrapper = styled.div`
  padding: ${({ theme }) => theme.spacings.xxl};
  @media (max-width: 1000px) {
    padding: ${({ theme }) => theme.spacings.lg};
  }
  @media (max-width: 700px) {
    padding: ${({ theme }) => theme.spacings.sm};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  gap: ${({ theme }) => theme.spacings.md};

  @media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
    gap: ${({ theme }) => theme.spacings.sm};
    margin-bottom: ${({ theme }) => theme.spacings.lg};
  }
`;

const BtnGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  align-items: center;
  flex-wrap: wrap;
`;

const ExportBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.whiteColor};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  @media (max-width: 700px) {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    padding: ${({ theme }) => theme.spacings.xs} ${({ theme }) => theme.spacings.sm};
  }
`;

const ResetBtn = styled.button`
  padding: ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.md};
  font-size: ${({ theme }) => theme.fontSizes.small};
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.buttonText};
  }
  @media (max-width: 700px) {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    padding: ${({ theme }) => theme.spacings.xs} ${({ theme }) => theme.spacings.sm};
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.md};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  flex-wrap: wrap;

  label {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    min-width: 80px;
  }

  select {
    padding: ${({ theme }) => theme.spacings.sm};
    border-radius: ${({ theme }) => theme.radii.sm};
    border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    background: ${({ theme }) => theme.inputs.background};
    color: ${({ theme }) => theme.inputs.text};
    min-width: 120px;
  }

  @media (max-width: 700px) {
    gap: ${({ theme }) => theme.spacings.xs};
    flex-direction: column;
    align-items: stretch;
    margin-bottom: ${({ theme }) => theme.spacings.sm};
    label, select { min-width: 0; width: 100%; }
  }
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.title};
  @media (max-width: 700px) {
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }
`;
const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacings.xxl};
  @media (max-width: 700px) {
    margin-bottom: ${({ theme }) => theme.spacings.lg};
  }
`;
const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.large};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  @media (max-width: 700px) {
    font-size: ${({ theme }) => theme.fontSizes.base};
    margin-bottom: ${({ theme }) => theme.spacings.sm};
  }
`;
const Error = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  margin-top: ${({ theme }) => theme.spacings.md};
  font-size: 1.1em;
  text-align: center;
  @media (max-width: 700px) {
    font-size: 1em;
    margin-top: ${({ theme }) => theme.spacings.sm};
  }
`;
const NoData = styled.div`
  padding: ${({ theme }) => theme.spacings.md};
  color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  text-align: center;
  font-size: 1em;
  @media (max-width: 700px) {
    font-size: 0.98em;
    padding: ${({ theme }) => theme.spacings.sm};
  }
`;