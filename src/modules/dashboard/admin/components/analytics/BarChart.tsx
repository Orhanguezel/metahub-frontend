"use client";

import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales";
import styled, { useTheme } from "styled-components";

interface AnalyticsEvent {
  module: string;
  [key: string]: any;
}

interface Props {
  data?: AnalyticsEvent[]; // prop optional, garanti için
}

export default function BarChart({ data }: Props) {
  const { t } = useI18nNamespace("dashboard", translations);
  const theme = useTheme();

  // Data güvenliği — undefined, null, false vs. asla hata çıkarmaz
  const safeData: AnalyticsEvent[] = Array.isArray(data) ? data : [];

  // 🔢 Modül bazlı event sayısı
  const moduleCounts: Record<string, number> = {};
  safeData.forEach((event) => {
    const mod = (event.module || "").trim();
    if (!mod) return;
    moduleCounts[mod] = (moduleCounts[mod] || 0) + 1;
  });

  // 📊 Grafik için çeviri desteğiyle veri oluştur
  const chartData =
    Object.entries(moduleCounts)
      .map(([module, count]) => ({
        module,
        label: t(`modules.${module}`, module),
        count,
      }))
      .sort((a, b) => b.count - a.count) || [];

  if (chartData.length === 0) {
    return <EmptyInfo>{t("noData", "Veri bulunamadı.")}</EmptyInfo>;
  }

  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height={300}>
        <ReBarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
        >
          <CartesianGrid
            stroke={theme.colors.borderLight}
            strokeDasharray="3 3"
          />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{
              fill: theme.colors.textSecondary,
              fontSize: 12,
            }}
            axisLine={{ stroke: theme.colors.borderLight }}
            label={{
              value: t("analytics.events", "Event Count"),
              position: "insideBottomRight",
              offset: -5,
              fill: theme.colors.textSecondary,
              fontSize: 13,
            }}
          />
          <YAxis
            dataKey="label"
            type="category"
            width={140}
            tick={{
              fill: theme.colors.textSecondary,
              fontSize: 12,
            }}
            axisLine={{ stroke: theme.colors.borderLight }}
            label={{
              value: t("analytics.module", "Module"),
              position: "insideLeft",
              angle: -90,
              offset: 10,
              fill: theme.colors.textSecondary,
              fontSize: 13,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.colors.cardBackground,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: "8px",
              fontSize: "0.85rem",
              color: theme.colors.textPrimary,
            }}
            formatter={(value: any) => [
              `${value}`,
              t("analytics.events", "Event Count"),
            ]}
            labelFormatter={(label: any) =>
              `${t("analytics.module", "Module")}: ${label}`
            }
          />
          <Bar
            dataKey="count"
            fill={theme.colors.primary}
            radius={[0, 6, 6, 0]} // üst-sağ, alt-sağ köşeler yuvarlak
          >
            <LabelList
              dataKey="count"
              position="right"
              style={{
                fill: theme.colors.textPrimary,
                fontWeight: 600,
                fontSize: "0.95rem",
              }}
            />
          </Bar>
        </ReBarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

const ChartWrapper = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: ${({ theme }) => theme.spacings.md};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.cards.shadow};
`;

const EmptyInfo = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 1.1rem;
  text-align: center;
  padding: 2.5rem 0;
`;
