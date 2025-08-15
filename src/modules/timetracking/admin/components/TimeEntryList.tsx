"use client";
import styled from "styled-components";
import { useEffect, useState, useMemo } from "react";
import type { ITimeEntry, TimeEntryAdminFilters } from "@/modules/timetracking/types";
import { useAppDispatch } from "@/store/hooks";
import { deleteTimeEntry, fetchTimeEntries, setSelectedTE } from "@/modules/timetracking/slice/timeEntrySlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/timetracking";

export default function TimeEntryList({
  items,
  loading,
  meta,
  onEdit,
}: {
  items: ITimeEntry[];
  loading?: boolean;
  meta?: { page: number; limit: number; total: number };
  onEdit: (t: ITimeEntry) => void;
}) {
  const dispatch = useAppDispatch();
  const { i18n, t } = useI18nNamespace("timetracking", translations);

  const [f, setF] = useState<TimeEntryAdminFilters>({
    limit: 50,
    page: 1,
    sort: "date",
    order: "desc",
  });
  const onF = (k: keyof TimeEntryAdminFilters, v: any) => setF((s) => ({ ...s, [k]: v }));

  // İlk yükleme (sadece mount'ta)
  useEffect(() => {
    dispatch(fetchTimeEntries({ limit: 50, page: 1, sort: "date", order: "desc" }));
  }, [dispatch]);

  const apply = () => dispatch(fetchTimeEntries(f));
  const reset = () => {
    const nf: TimeEntryAdminFilters = { limit: 50, page: 1, sort: "date", order: "desc" };
    setF(nf);
    dispatch(fetchTimeEntries(nf));
  };

  const confirmDelete = (entry: ITimeEntry) => {
    // locale’ye göre tarih
    const token =
      entry.code ||
      new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(new Date(entry.date));
    if (window.confirm(t("list.confirmDelete", { code: token }))) {
      dispatch(deleteTimeEntry(entry._id));
    }
  };

  // Linter için bağımlılıkları tam: items + dil + t
  const rows = useMemo(() => {
    const dFmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" });
    const tFmt = new Intl.DateTimeFormat(i18n.language, { timeStyle: "short" });
    return items.map((e) => ({
      id: e._id,
      date: e.date ? dFmt.format(new Date(e.date)) : "–",
      emp: e.employeeRef,
      cin: e.clockInAt ? tFmt.format(new Date(e.clockInAt)) : "–",
      cout: e.clockOutAt ? tFmt.format(new Date(e.clockOutAt)) : "–",
      worked: e.minutesWorked ?? "–",
      paid: e.minutesPaid ?? "–",
      status: t(`status.${e.status}`),
      statusKey: e.status,
      billable: e.payCode?.billable === false ? t("common.no") : t("common.yes"),
      raw: e,
    }));
  }, [items, i18n.language, t]);

  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / (meta.limit || 50))) : 1;

  return (
    <Wrap>
      <Toolbar aria-label={t("list.filters")}>
        <Filters>
          <Input
            placeholder={t("list.employeeId")}
            value={f.employeeRef || ""}
            onChange={(e) => onF("employeeRef", e.target.value)}
          />
          <Input
            placeholder={t("list.jobId")}
            value={f.jobRef || ""}
            onChange={(e) => onF("jobRef", e.target.value)}
          />
          <Select
            value={f.status || ""}
            onChange={(e) => onF("status", e.target.value || undefined)}
            aria-label={t("list.status")}
          >
            <option value="">{t("list.statusAny")}</option>
            {["open", "submitted", "approved", "rejected", "locked", "exported"].map((s) => (
              <option key={s} value={s}>
                {t(`status.${s}`)}
              </option>
            ))}
          </Select>
          <Input
            type="date"
            value={f.dateFrom || ""}
            onChange={(e) => onF("dateFrom", e.target.value || undefined)}
            aria-label={t("list.dateFrom")}
          />
          <Input
            type="date"
            value={f.dateTo || ""}
            onChange={(e) => onF("dateTo", e.target.value || undefined)}
            aria-label={t("list.dateTo")}
          />
          <Select
            value={f.sort}
            onChange={(e) => onF("sort", e.target.value as any)}
            aria-label={t("list.sort")}
          >
            {["date", "createdAt", "updatedAt", "clockInAt"].map((s) => (
              <option key={s} value={s}>
                {t("list.sortPrefix")} {t(`list.sortFields.${s}`)}
              </option>
            ))}
          </Select>
          <Select
            value={f.order}
            onChange={(e) => onF("order", e.target.value as any)}
            aria-label={t("list.order")}
          >
            <option value="desc">{t("list.orderDesc")}</option>
            <option value="asc">{t("list.orderAsc")}</option>
          </Select>
        </Filters>
        <Actions>
          <Btn onClick={apply} disabled={loading}>
            {t("list.apply")}
          </Btn>
          <Btn onClick={reset} disabled={loading}>
            {t("list.reset")}
          </Btn>
        </Actions>
      </Toolbar>

      {/* Her zaman KART */}
      <CardsWrap aria-label={t("list.tableLabel")}>
        {rows.length === 0 && !loading && <Empty>{t("list.empty")}</Empty>}
        {rows.map((r) => (
          <Card key={r.id}>
            <CardTop>
              <DateText>{r.date}</DateText>
              <Status $status={r.statusKey}>{r.status}</Status>
            </CardTop>

            <Grid>
              <KV>
                <K>{t("list.th.employee")}</K>
                <V className="mono">{r.emp}</V>
              </KV>
              <KV>
                <K>{t("list.th.in")}</K>
                <V>{r.cin}</V>
              </KV>
              <KV>
                <K>{t("list.th.out")}</K>
                <V>{r.cout}</V>
              </KV>
              <KV>
                <K>{t("list.th.worked")}</K>
                <V>{r.worked}</V>
              </KV>
              <KV>
                <K>{t("list.th.paid")}</K>
                <V>{r.paid}</V>
              </KV>
              <KV>
                <K>{t("list.th.billable")}</K>
                <V>{r.billable}</V>
              </KV>
            </Grid>

            <CardActions>
              <Btn onClick={() => dispatch(setSelectedTE(r.raw))}>{t("list.view")}</Btn>
              <Secondary onClick={() => onEdit(r.raw)}>{t("list.edit")}</Secondary>
              <Danger onClick={() => confirmDelete(r.raw)}>{t("list.delete")}</Danger>
            </CardActions>
          </Card>
        ))}
      </CardsWrap>

      {meta && (
        <Pager>
          <span>
            {t("list.pageInfo", {
              page: meta.page,
              totalPages,
              total: meta.total,
            })}
          </span>
          <Row>
            <Btn
              disabled={loading || meta.page <= 1}
              onClick={() => {
                const p = (meta.page || 1) - 1;
                setF((s) => ({ ...s, page: p }));
                dispatch(fetchTimeEntries({ ...f, page: p }));
              }}
            >
              {t("list.prev")}
            </Btn>
            <Btn
              disabled={loading || meta.page >= totalPages}
              onClick={() => {
                const p = (meta.page || 1) + 1;
                setF((s) => ({ ...s, page: p }));
                dispatch(fetchTimeEntries({ ...f, page: p }));
              }}
            >
              {t("list.next")}
            </Btn>
          </Row>
        </Pager>
      )}
    </Wrap>
  );
}

/* styled */
const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.sm};
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacings.md};
  ${({ theme }) => theme.media.tablet} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Filters = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.sm};
  /* taşmayı engellemek için 200px min */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  flex-wrap: wrap;
`;

const inputBase = `
  padding: 10px 12px;
  border-radius: var(--r-md);
  border: var(--b-thin) var(--c-input-border);
  background: var(--c-input-bg);
  color: var(--c-input-text);
  transition: box-shadow var(--t-fast), border-color var(--t-fast);
  &:focus {
    outline: none;
    border-color: var(--c-input-focus);
    box-shadow: var(--shadow-focus);
  }
`;

const Input = styled.input`
  --b-thin: ${({ theme }) => theme.borders.thin};
  --c-input-border: ${({ theme }) => theme.colors.inputBorder};
  --c-input-bg: ${({ theme }) => theme.inputs.background};
  --c-input-text: ${({ theme }) => theme.inputs.text};
  --c-input-focus: ${({ theme }) => theme.colors.inputBorderFocus};
  --shadow-focus: ${({ theme }) => theme.colors.shadowHighlight};
  --r-md: ${({ theme }) => theme.radii.md};
  --t-fast: ${({ theme }) => theme.durations.fast};
  ${inputBase}
`;

const Select = styled.select`
  --b-thin: ${({ theme }) => theme.borders.thin};
  --c-input-border: ${({ theme }) => theme.colors.inputBorder};
  --c-input-bg: ${({ theme }) => theme.inputs.background};
  --c-input-text: ${({ theme }) => theme.inputs.text};
  --c-input-focus: ${({ theme }) => theme.colors.inputBorderFocus};
  --shadow-focus: ${({ theme }) => theme.colors.shadowHighlight};
  --r-md: ${({ theme }) => theme.radii.md};
  --t-fast: ${({ theme }) => theme.durations.fast};
  ${inputBase}
`;

const Btn = styled.button`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  &:hover {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
    color: ${({ theme }) => theme.buttons.secondary.textHover};
  }
  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;

const Secondary = styled(Btn)``;

const Danger = styled(Btn)`
  background: ${({ theme }) => theme.colors.dangerBg};
  color: ${({ theme }) => theme.colors.danger};
  border-color: ${({ theme }) => theme.colors.danger};
  &:hover {
    background: ${({ theme }) => theme.colors.dangerHover};
    color: ${({ theme }) => theme.colors.white};
    border-color: ${({ theme }) => theme.colors.dangerHover};
  }
`;

/* KARTLAR: her zaman TEK sütun, tam genişlik */
const CardsWrap = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.md};
  grid-template-columns: 1fr;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cards.background};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.md};
  overflow: hidden;
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
`;

const DateText = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const Status = styled.span<{ $status: ITimeEntry["status"] }>`
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 12px;
  ${({ theme, $status }) => {
    const map: Record<ITimeEntry["status"], { bg: string; fg: string; border: string }> = {
      open: { bg: theme.colors.tagBackground, fg: theme.colors.textSecondary, border: theme.colors.border },
      submitted: { bg: theme.colors.primaryTransparent, fg: theme.colors.primaryDark, border: theme.colors.primary },
      approved: { bg: theme.colors.successBg, fg: theme.colors.textOnSuccess, border: theme.colors.success },
      rejected: { bg: theme.colors.dangerBg, fg: theme.colors.danger, border: theme.colors.danger },
      locked: { bg: theme.colors.backgroundSecondary, fg: theme.colors.darkGrey, border: theme.colors.darkGrey },
      exported: { bg: theme.colors.primaryLight, fg: theme.colors.primaryDark, border: theme.colors.primary },
    };
    const c = map[$status] || map.open;
    return `
      background: ${c.bg};
      color: ${c.fg};
      border: ${theme.borders.thin} ${c.border};
    `;
  }}
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacings.sm};
  ${({ theme }) => theme.media.xsmall} {
    grid-template-columns: 1fr;
  }
`;

const KV = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const K = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const V = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  &.mono {
    font-family: ${({ theme }) => theme.fonts.mono};
    overflow-wrap: anywhere;
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacings.sm};
`;

const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const Empty = styled.div`
  padding: ${({ theme }) => theme.spacings.md} 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
`;

const Pager = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
