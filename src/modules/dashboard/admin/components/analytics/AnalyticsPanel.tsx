"use client";

import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAnalyticsTrends,
  fetchAnalyticsEvents,
} from "@/modules/dashboard/slice/analyticsSlice";
import {
  LineChart,
  BarChart,
  MapChart,
  AnalyticsTable,
  FilterBar,
  DateRangeSelector,
} from "@/modules/dashboard";
import { useTranslation } from "react-i18next";
import { Loader } from "@/shared";
import { Download, FileText } from "lucide-react";

// --- CSV helper ---
function exportToCSV(data: any[], filename = "export.csv") {
  if (!data || !data.length) return;
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
  const { t, i18n } = useTranslation("admin-dashboard");
  const dispatch = useAppDispatch();

  // Redux State
  const analytics = useAppSelector((state) => state.analytics);
  const moduleMetaState = useAppSelector((state) => state.moduleMeta);
  const moduleSettingState = useAppSelector((state) => state.moduleSetting);

  // Arrayler
  const modules = useMemo(
    () =>
      Array.isArray(moduleMetaState.modules) ? moduleMetaState.modules : [],
    [moduleMetaState.modules]
  );
  // SADECE BU: settings yerine tenantModules!
  const tenantModules = useMemo(
    () =>
      Array.isArray(moduleSettingState.tenantModules)
        ? moduleSettingState.tenantModules
        : [],
    [moduleSettingState.tenantModules]
  );
  const trends = useMemo(
    () => (Array.isArray(analytics.trends) ? analytics.trends : []),
    [analytics.trends]
  );
  const events = useMemo(
    () => (Array.isArray(analytics.events) ? analytics.events : []),
    [analytics.events]
  );
  const loading = analytics.loading;
  const error = analytics.error;
  const modulesLoading = moduleMetaState.loading || moduleSettingState.loading;

  // Filtreler
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedEventType, setSelectedEventType] = useState<string>("");

  // --- Aktif analytics modülleri (meta + tenant setting merge) ---
  const activeAnalyticsModules = useMemo(() => {
    return modules
      .filter((mod) => {
        const setting = tenantModules.find((set) => set.module === mod.name);
        // useAnalytics ve enabled sadece settingte override edilir
        // Setting yoksa default: aktif değil.
        return setting?.enabled !== false && setting?.useAnalytics === true;
      })
      .map((mod) => ({
        value: mod.name,
        label: mod.label?.[i18n.language as keyof typeof mod.label] || mod.name,
      }));
  }, [modules, tenantModules, i18n.language]);

  // Event tipleri
  const availableEventTypes = useMemo(() => {
    const set = new Set(events.map((e) => e.eventType).filter(Boolean));
    return Array.from(set);
  }, [events]);

  // Modül isimleri (event içindeki module)
  const availableModules = useMemo(() => {
    const set = new Set(events.map((e) => e.module).filter(Boolean));
    return Array.from(set);
  }, [events]);

  // Sadece lokasyon içeren eventler
  const eventsWithLocation = useMemo(
    () => events.filter((e) => e.location?.coordinates?.length === 2),
    [events]
  );

  // NOT: useEffect ile module/setting fetch yok! Parent'ta çağrıldığı için burada yok.

  useEffect(() => {
    const filters: any = {
      ...(selectedModule && { module: selectedModule }),
      ...(selectedEventType && { eventType: selectedEventType }),
      ...(startDate && { startDate: startDate.toISOString() }),
      ...(endDate && { endDate: endDate.toISOString() }),
      period: "day",
    };
    dispatch(fetchAnalyticsTrends(filters));
    dispatch(fetchAnalyticsEvents({ ...filters, limit: 1000 }));
  }, [dispatch, selectedModule, selectedEventType, startDate, endDate]);

  // Export
  const handleExport = (format: "csv" | "json" = "csv") => {
    if (!events || !events.length) return;
    if (format === "json") {
      const blob = new Blob([JSON.stringify(events, null, 2)], {
        type: "application/json",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "analytics-export.json");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      exportToCSV(events, "analytics-export.csv");
    }
  };

  // Filtreleri Sıfırla
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
          <ExportBtn
            onClick={() => handleExport("csv")}
            title={t("exportCSV", "CSV Dışa Aktar")}
          >
            <Download size={18} /> CSV
          </ExportBtn>
          <ExportBtn
            onClick={() => handleExport("json")}
            title={t("exportJSON", "JSON Dışa Aktar")}
          >
            <FileText size={18} /> JSON
          </ExportBtn>
          <ResetBtn onClick={handleResetFilters}>
            {t("reset", "Filtreleri Temizle")}
          </ResetBtn>
        </BtnGroup>
      </Header>

      {/* --- Modül ve Event Tipi Filtreleri --- */}
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

      {(loading || modulesLoading) && <Loader />}
      {error && <Error>{error}</Error>}

      {!loading && !modulesLoading && (
        <>
          <Section>
            <SectionTitle>
              {t("analytics.dailyTrends", "Günlük Event Trendleri")}
            </SectionTitle>
            {trends.length ? (
              <LineChart data={trends} />
            ) : (
              <NoData>{t("noData")}</NoData>
            )}
          </Section>

          <Section>
            <SectionTitle>
              {t("analytics.moduleDistribution", "Modül Bazlı Yoğunluk")}
            </SectionTitle>
            {events.length ? (
              <BarChart data={events} />
            ) : (
              <NoData>{t("noData")}</NoData>
            )}
          </Section>

          <Section>
            <SectionTitle>
              {t("analytics.geoMap", "Coğrafi Dağılım")}
            </SectionTitle>
            {eventsWithLocation.length ? (
              <MapChart data={eventsWithLocation} />
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
            <AnalyticsTable data={events.slice(0, 20)} />
          </Section>
        </>
      )}
    </PanelWrapper>
  );
}

// --- Styled Components ---
const PanelWrapper = styled.div`
  padding: ${({ theme }) => theme.spacings.xxl};
`;
const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.xl};
`;
const BtnGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  align-items: center;
`;
const ExportBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.whiteColor};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;
const ResetBtn = styled.button`
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.md};
  font-size: ${({ theme }) => theme.fontSizes.small};
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.buttonText};
  }
`;
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.md};
  margin-bottom: ${({ theme }) => theme.spacings.md};

  label {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  select {
    padding: ${({ theme }) => theme.spacings.sm};
    border-radius: ${({ theme }) => theme.radii.sm};
    border: ${({ theme }) => theme.borders.thin}
      ${({ theme }) => theme.colors.border};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    background: ${({ theme }) => theme.inputs.background};
    color: ${({ theme }) => theme.inputs.text};
  }
`;
const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.title};
`;
const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacings.xxl};
`;
const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.large};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const Error = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  margin-top: ${({ theme }) => theme.spacings.md};
`;
const NoData = styled.div`
  padding: ${({ theme }) => theme.spacings.md};
  color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  text-align: center;
`;
