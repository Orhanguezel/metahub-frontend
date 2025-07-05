"use client";

import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { SUPPORTED_LOCALES, DATE_FORMATS } from "@/types/common";

type TrendEntry = {
  _id: {
    year: number;
    month: number;
    day: number;
  };
  total: number;
};

interface Props {
  data: TrendEntry[];
}

// Dil ve type güvenliği ile tarih formatı
function formatDate(entry: TrendEntry, lang: string): string {
  const { year, month, day } = entry._id;
  // Dil desteğini koddan değil, tanımdan al
  // ex: "yyyy-MM-dd" / "dd.MM.yyyy" / "dd/MM/yyyy"
  const format =
    DATE_FORMATS[lang as keyof typeof DATE_FORMATS] || "yyyy-MM-dd";
  if (format === "yyyy-MM-dd") {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;
  }
  if (format === "dd.MM.yyyy") {
    return `${String(day).padStart(2, "0")}.${String(month).padStart(
      2,
      "0"
    )}.${year}`;
  }
  if (format === "dd/MM/yyyy") {
    return `${String(day).padStart(2, "0")}/${String(month).padStart(
      2,
      "0"
    )}/${year}`;
  }
  // Fallback
  return `${String(day).padStart(2, "0")}.${String(month).padStart(
    2,
    "0"
  )}.${year}`;
}

export default function LineChart({ data }: Props) {
  const { t, i18n } = useTranslation("admin-dashboard");
  const theme = useTheme();
  // Locale güvenli şekilde SupportedLocale'e düşür
  const lang = (
    SUPPORTED_LOCALES.includes(i18n.language as any) ? i18n.language : "en"
  ) as keyof typeof DATE_FORMATS;

  // Güvenli veri kontrolü
  const safeData = Array.isArray(data) ? data : [];

  if (!safeData.length) {
    return <NoData>{t("noData", "Veri bulunamadı.")}</NoData>;
  }

  const chartData = safeData.map((entry) => ({
    date: formatDate(entry, lang),
    count: typeof entry.total === "number" ? entry.total : 0,
  }));

  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height={300}>
        <ReLineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
          role="img"
          aria-label={t(
            "analytics.trendChartLabel",
            "Günlük etkinlik trendi çizgi grafiği"
          )}
        >
          <CartesianGrid stroke={theme.colors.border} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fill: theme.colors.textSecondary, fontSize: 12 }}
            axisLine={{ stroke: theme.colors.border }}
            tickLine={{ stroke: theme.colors.border }}
            label={{
              value: t("analytics.date", "Tarih"),
              position: "insideBottom",
              offset: -2,
              fill: theme.colors.textSecondary,
            }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: theme.colors.textSecondary, fontSize: 12 }}
            axisLine={{ stroke: theme.colors.border }}
            tickLine={{ stroke: theme.colors.border }}
            label={{
              value: t("analytics.total", "Toplam"),
              angle: -90,
              position: "insideLeft",
              fill: theme.colors.textSecondary,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.colors.cardBackground,
              border: `1px solid ${theme.colors.border}`,
              fontSize: "0.9rem",
              borderRadius: "8px",
            }}
            labelStyle={{
              color: theme.colors.textPrimary,
              fontWeight: 500,
            }}
            itemStyle={{
              color: theme.colors.primary,
            }}
            formatter={(value: any) => [
              `${value}`,
              t("analytics.total", "Toplam"),
            ]}
            labelFormatter={(label: any) =>
              `${t("analytics.date", "Tarih")}: ${label}`
            }
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke={theme.colors.primary}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </ReLineChart>
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

const NoData = styled.div`
  margin: ${({ theme }) => theme.spacings.lg} 0;
  padding: ${({ theme }) => theme.spacings.md};
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.md};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.md};
`;
