"use client";

import styled from "styled-components";
import { useTranslation } from "react-i18next";
import type { AnalyticsEvent } from "@/modules/dashboard/types";

interface Props {
  data?: AnalyticsEvent[]; // optional, undefined gelse bile boş tablo döner
  onExportClick?: () => void;
}

export default function AnalyticsTable({ data, onExportClick }: Props) {
  const { t, i18n } = useTranslation("admin-dashboard");
  // Her ihtimale karşı array garantisi
  const safeData: AnalyticsEvent[] = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return <NoData>{t("noData", "Veri bulunamadı.")}</NoData>;
  }

  return (
    <TableWrapper>
      {onExportClick && (
        <ExportBtn onClick={onExportClick}>
          {t("exportCSV", "CSV Dışa Aktar")}
        </ExportBtn>
      )}
      <Table>
        <thead>
          <tr>
            <th>{t("table.timestamp", "Zaman")}</th>
            <th>{t("table.module", "Modül")}</th>
            <th>{t("table.eventType", "Olay Türü")}</th>
            <th>{t("table.user", "Kullanıcı")}</th>
            <th>{t("table.location", "Konum")}</th>
            <th>{t("table.city", "Şehir")}</th>
            <th>{t("table.country", "Ülke")}</th>
            <th>{t("table.ip", "IP")}</th>
            <th>{t("table.agent", "Tarayıcı")}</th>
          </tr>
        </thead>
        <tbody>
          {safeData.map((log, i) => {
            // Date formatting güvenliği
            let formatted = "-";
            if (log.timestamp) {
              const date = new Date(log.timestamp);
              if (!isNaN(date.getTime())) {
                formatted = `${date.toLocaleDateString(i18n.language)} ${date.toLocaleTimeString(i18n.language, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`;
              }
            }

            const moduleLabel =
              t(`modules.${log.module}`, log.module) || log.module || "-";
            const eventLabel =
              t(`events.${log.eventType}`, log.eventType) || log.eventType || "-";

            const latLon =
              log.location?.coordinates && log.location.coordinates.length === 2
                ? `${log.location.coordinates[1].toFixed(4)}, ${log.location.coordinates[0].toFixed(4)}`
                : "-";

            return (
              <tr key={log._id || i}>
                <td>{formatted}</td>
                <td>{moduleLabel}</td>
                <td>{eventLabel}</td>
                <td>{log.userId || "-"}</td>
                <td>{latLon}</td>
                <td>{log.city || "-"}</td>
                <td>{log.country || "-"}</td>
                <td>{log.ip || "-"}</td>
                <td>
                  <span title={log.userAgent || ""}>
                    {log.userAgent?.slice(0, 32) || "-"}
                    {log.userAgent && log.userAgent.length > 32 ? "…" : ""}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </TableWrapper>
  );
}

const TableWrapper = styled.div`
  overflow-x: auto;
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ExportBtn = styled.button`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: background-color ${({ theme }) => theme.transition.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};

  th,
  td {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
    text-align: left;
    white-space: nowrap;
  }

  thead {
    background: ${({ theme }) => theme.colors.tableHeader};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  tbody tr:hover {
    background-color: ${({ theme }) => theme.colors.hoverBackground};
  }
`;

const NoData = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.small};
  text-align: center;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.md};
`;
