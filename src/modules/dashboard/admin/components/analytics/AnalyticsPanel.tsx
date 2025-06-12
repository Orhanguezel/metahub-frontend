"use client";

import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAnalyticsTrends,
  fetchAnalyticsEvents,
} from "@/modules/dashboard/slice/analyticsSlice";
import {
  setSelectedProject,
} from "@/modules/adminmodules/slice/adminModuleSlice";
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

// --- CSV export helper ---
function exportToCSV(data: any[], filename = "export.csv") {
  if (!data || !data.length) return;
  const keys = Object.keys(data[0]);
  const csvRows = [
    keys.join(","),
    ...data.map((row) =>
      keys.map((k) => `"${(row[k] ?? "").toString().replace(/"/g, '""')}"`).join(",")
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
  // Redux states
  const analytics = useAppSelector((state) => state.analytics);
  const admin = useAppSelector((state) => state.admin);

  // Güvenli array fallback
  const trends = Array.isArray(analytics.trends) ? analytics.trends : [];
  const events = Array.isArray(analytics.events) ? analytics.events : [];
  const loading = analytics.loading;
  const error = analytics.error;
  const modules = Array.isArray(admin.modules) ? admin.modules : [];
  const selectedProject = admin.selectedProject;
  const availableProjects = Array.isArray(admin.availableProjects) ? admin.availableProjects : [];
  const modulesLoading = admin.loading;

  // State
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedEventType, setSelectedEventType] = useState<string>("");

  // 2. Seçilen projeye göre, aktif ve useAnalytics modülleri filtrele
  const activeAnalyticsModules = useMemo(() => {
    return modules
      .filter((m) => m.enabled && m.useAnalytics)
      .map((m) => ({
        value: m.name,
        label: m.label?.[i18n.language as keyof typeof m.label] || m.name,
      }));
  }, [modules, i18n.language]);

  // 3. Event tiplerini çıkar
  const availableEventTypes = useMemo(() => {
    const set = new Set(events.map((e) => e.eventType).filter(Boolean));
    return Array.from(set);
  }, [events]);

  // 4. Event verilerini fetch et
  useEffect(() => {
    if (!selectedProject) return;
    const filters: any = {
      project: selectedProject,
      period: "day",
      ...(selectedModule && { module: selectedModule }),
      ...(selectedEventType && { eventType: selectedEventType }),
      ...(startDate && { startDate: startDate.toISOString() }),
      ...(endDate && { endDate: endDate.toISOString() }),
    };

    dispatch(fetchAnalyticsTrends(filters));
    dispatch(fetchAnalyticsEvents({ ...filters, limit: 1000 }));
  }, [dispatch, selectedProject, startDate, endDate, selectedModule, selectedEventType]);

  // 5. Sadece lokasyon içeren eventler
  const eventsWithLocation = useMemo(
    () => events.filter((e) => e.location?.coordinates?.length === 2),
    [events]
  );

  // Tüm modül ve event listesini tek noktadan çekmek için (FilterBar vs için kullanılabilir)
  const availableModules = useMemo(() => {
    const set = new Set(events.map((e) => e.module).filter(Boolean));
    return Array.from(set);
  }, [events]);

  const handleResetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedModule("");
    setSelectedEventType("");
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const project = e.target.value;
    dispatch(setSelectedProject(project));
    setSelectedModule("");
    setSelectedEventType("");
  };

  // --- Export handler ---
  const handleExport = (format: "csv" | "json" = "csv") => {
    if (!events || !events.length) return;
    if (format === "json") {
      const blob = new Blob([JSON.stringify(events, null, 2)], { type: "application/json" });
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

  return (
    <PanelWrapper>
      <Header>
        <Title>{t("analytics.title", "Log Analizi ve Etkinlik Trendleri")}</Title>
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

      {/* --- Proje Select --- */}
      <Row>
        <label htmlFor="projectSelect">{t("selectProject", "Proje Seç")}</label>
        <select
          id="projectSelect"
          value={selectedProject || ""}
          onChange={handleProjectChange}
          disabled={modulesLoading}
        >
          <option value="">{t("chooseProject", "Proje seçiniz...")}</option>
          {availableProjects.map((proj) => (
            <option key={proj} value={proj}>
              {proj}
            </option>
          ))}
        </select>
      </Row>

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

      {/* Dilersen filter bar da ekleyebilirsin */}
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
              <NoData>{t("noGeoData", "Konum verisi içeren kayıt yok.")}</NoData>
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
  padding: ${({ theme }) => theme.spacing.xxl};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const BtnGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
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
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const ResetBtn = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
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
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  label {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  select {
    padding: ${({ theme }) => theme.spacing.sm};
    border-radius: ${({ theme }) => theme.radii.sm};
    border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
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
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.large};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Error = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const NoData = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  text-align: center;
`;
