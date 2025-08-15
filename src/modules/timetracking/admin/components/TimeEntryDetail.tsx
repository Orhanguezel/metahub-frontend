"use client";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/timetracking";
import type { ITimeEntry } from "@/modules/timetracking/types";

export default function TimeEntryDetail({
  item,
  onClose,
}: {
  item?: ITimeEntry | null;
  onClose: () => void;
}) {
  const { i18n, t } = useI18nNamespace("timetracking", translations);
  if (!item) return null;

  const fmtDate = (v?: string | Date) =>
    v ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(new Date(v)) : "–";
  const fmtDateTime = (v?: string | Date) =>
    v
      ? new Intl.DateTimeFormat(i18n.language, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(v))
      : "–";

  return (
    <Card aria-live="polite">
      <Head>
        <div>
          <Title>
            {t("detail.entry")} <code>{item.code}</code>
          </Title>
          <Small>
            {fmtDate(item.date)} — {t("detail.emp")} <code>{String(item.employeeRef)}</code> —{" "}
            {t("detail.status")} <b>{t(`status.${item.status}`)}</b>
          </Small>
        </div>
        <Btn type="button" onClick={onClose} aria-label={t("detail.close")}>
          {t("detail.close")}
        </Btn>
      </Head>

      <Grid role="list">
        <Box role="listitem">
          <K>{t("detail.clockIn")}</K>
          <V>{fmtDateTime(item.clockInAt)}</V>
        </Box>
        <Box role="listitem">
          <K>{t("detail.clockOut")}</K>
          <V>{fmtDateTime(item.clockOutAt)}</V>
        </Box>
        <Box role="listitem">
          <K>{t("detail.workedMin")}</K>
          <V>{item.minutesWorked ?? "–"}</V>
        </Box>
        <Box role="listitem">
          <K>{t("detail.paidMin")}</K>
          <V>{item.minutesPaid ?? "–"}</V>
        </Box>
        <Box role="listitem">
          <K>{t("detail.costAmount")}</K>
          <V>{item.costAmount ?? "–"}</V>
        </Box>
        <Box role="listitem">
          <K>{t("detail.billAmount")}</K>
          <V>{item.billAmount ?? "–"}</V>
        </Box>
      </Grid>

      <Pre aria-label={t("detail.raw")}>
        {JSON.stringify(item, null, 2)}
      </Pre>
    </Card>
  );
}

/* styled */
const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacings.lg};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
  box-shadow: ${({ theme }) => theme.cards.shadow};
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const Title = styled.h3`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.title};
`;

const Small = styled.div`
  opacity: 0.8;
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  margin-top: 2px;
  code { font-family: ${({ theme }) => theme.fonts.mono}; }
`;

const Btn = styled.button`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.buttons.secondary.backgroundHover}; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: ${({ theme }) => theme.spacings.sm};
  margin: ${({ theme }) => theme.spacings.md} 0;
`;

const Box = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 10px;
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
`;

const K = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const V = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Pre = styled.pre`
  max-height: 420px;
  overflow: auto;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 12px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => theme.spacings.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-top: ${({ theme }) => theme.spacings.sm};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
`;
