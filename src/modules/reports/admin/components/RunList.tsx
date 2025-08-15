"use client";
import styled, { css } from "styled-components";
import { useCallback, useMemo, useState } from "react";
import type { IReportRun, RunAdminFilters, ReportKind, RunStatus } from "@/modules/reports/types";
import { useAppDispatch } from "@/store/hooks";
import { deleteRun, fetchRuns, fetchRunById } from "@/modules/reports/slice/reportsSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/reports";

const KINDS: ReportKind[] = [
  "ar_aging","ap_aging","revenue","expense","cashflow",
  "profitability","billing_forecast","invoice_collections",
  "employee_utilization","workload","service_performance",
];
const STATUSES: RunStatus[] = ["queued","running","success","error","cancelled"];

export default function RunList({ items, loading }: { items: IReportRun[]; loading?: boolean }) {
  const dispatch = useAppDispatch();
  const { t, i18n } = useI18nNamespace("reports", translations);

  const [f, setF] = useState<RunAdminFilters>({});
  const onF = (k: keyof RunAdminFilters, v: any) => setF((s) => ({ ...s, [k]: v ?? undefined }));

  const fmtDateTime = useCallback(
    (d: any) =>
      d
        ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium", timeStyle: "short" })
            .format(new Date(d))
        : "–",
    [i18n.language]
  );
  const nf = useMemo(() => new Intl.NumberFormat(i18n.language), [i18n.language]);

  const confirmDelete = (r: IReportRun) => {
    const token = r.code || r._id || "";
    if (window.confirm(t("runs.confirmDelete", "Delete run {{code}}?", { code: token }))) {
      if (r._id) dispatch(deleteRun(r._id));
    }
  };
  const viewRun = (r: IReportRun) => { if (r._id) dispatch(fetchRunById(r._id)); };

  return (
    <Wrap>
      <Toolbar role="region" aria-label={t("runs.filters", "Run filters")}>
        <Filters>
          <Input
            placeholder={t("runs.qPh", "Search in code/error")}
            value={f.q || ""}
            onChange={(e) => onF("q", e.target.value)}
            aria-label={t("runs.qLabel", "Search")}
          />
          <Select
            value={f.kind || ""}
            onChange={(e) => onF("kind", e.target.value || undefined)}
            aria-label={t("form.kind", "Kind")}
          >
            <option value="">{t("list.kindAny", "Kind")}</option>
            {KINDS.map((k) => (
              <option key={k} value={k}>{t(`kinds.${k}`, k)}</option>
            ))}
          </Select>
          <Select
            value={f.status || ""}
            onChange={(e) => onF("status", e.target.value || undefined)}
            aria-label={t("runs.statusAny", "Status")}
          >
            <option value="">{t("runs.statusAny", "Status")}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{t(`runs.status.${s}`, s)}</option>
            ))}
          </Select>
          <Input
            placeholder={t("runs.definitionId", "DefinitionId")}
            value={f.definitionRef || ""}
            onChange={(e) => onF("definitionRef", e.target.value)}
            aria-label={t("runs.definitionId", "DefinitionId")}
          />
          <Input
            type="date"
            value={f.from || ""}
            onChange={(e) => onF("from", e.target.value)}
            aria-label={t("runs.from", "From")}
          />
          <Input
            type="date"
            value={f.to || ""}
            onChange={(e) => onF("to", e.target.value)}
            aria-label={t("runs.to", "To")}
          />
        </Filters>
        <Actions>
          <Btn onClick={() => dispatch(fetchRuns(f))} disabled={loading} aria-label={t("actions.apply", "Apply")}>
            {t("actions.apply", "Apply")}
          </Btn>
          <Btn
            onClick={() => { setF({}); dispatch(fetchRuns()); }}
            disabled={loading}
            aria-label={t("actions.reset", "Reset")}
          >
            {t("actions.reset", "Reset")}
          </Btn>
        </Actions>
      </Toolbar>

      {/* Desktop / tablet table */}
      <DesktopOnly>
        <Table role="table" aria-label={t("runs.tableLabel", "Report runs")}>
          <thead>
            <tr>
              <th>{t("runs.th.code", "Code")}</th>
              <th>{t("runs.th.kind", "Kind")}</th>
              <th>{t("runs.th.status", "Status")}</th>
              <th>{t("runs.th.started", "Started")}</th>
              <th>{t("runs.th.duration", "Duration")}</th>
              <th>{t("runs.th.rows", "Rows")}</th>
              <th aria-label={t("list.th.actions", "Actions")} />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={7}><Empty>∅ {t("runs.empty", "No results")}</Empty></td>
              </tr>
            )}
            {items.map((r) => (
              <tr key={r._id ?? r.code ?? `${r.kind}-${fmtDateTime(r.startedAt)}`}>
                <td className="mono">{r.code}</td>
                <td>{t(`kinds.${r.kind}`, r.kind)}</td>
                <td><Badge data-status={r.status}>{t(`runs.status.${r.status}`, r.status)}</Badge></td>
                <td>{fmtDateTime(r.startedAt)}</td>
                <td>
                  {typeof r.durationMs === "number"
                    ? t("runDetail.durationMs", "{{ms}} ms", { ms: nf.format(r.durationMs) })
                    : "–"}
                </td>
                <td>{r.rowCount != null ? nf.format(r.rowCount) : "–"}</td>
                <td className="actions">
                  <Row>
                    <Btn onClick={() => viewRun(r)}>{t("actions.view", "View")}</Btn>
                    <Danger onClick={() => confirmDelete(r)}>{t("actions.delete", "Delete")}</Danger>
                  </Row>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </DesktopOnly>

      {/* Mobile card list */}
      <MobileOnly aria-label={t("runs.tableLabel", "Report runs")}>
        {items.length === 0 && !loading && <Empty>∅ {t("runs.empty", "No results")}</Empty>}
        {items.map((r) => (
          <Card key={r._id ?? r.code ?? `${r.kind}-${fmtDateTime(r.startedAt)}`}>
            <CardHead>
              <Code className="mono">{r.code || "—"}</Code>
              <Badge data-status={r.status}>{t(`runs.status.${r.status}`, r.status)}</Badge>
            </CardHead>

            <KV><K>{t("runs.th.kind", "Kind")}</K><V>{t(`kinds.${r.kind}`, r.kind)}</V></KV>
            <KV><K>{t("runs.th.started", "Started")}</K><V>{fmtDateTime(r.startedAt)}</V></KV>
            <KV>
              <K>{t("runs.th.duration", "Duration")}</K>
              <V>{typeof r.durationMs === "number" ? t("runDetail.durationMs", "{{ms}} ms", { ms: nf.format(r.durationMs) }) : "–"}</V>
            </KV>
            <KV><K>{t("runs.th.rows", "Rows")}</K><V>{r.rowCount != null ? nf.format(r.rowCount) : "–"}</V></KV>

            <CardActions>
              <Btn onClick={() => viewRun(r)}>{t("actions.view", "View")}</Btn>
              <Danger onClick={() => confirmDelete(r)}>{t("actions.delete", "Delete")}</Danger>
            </CardActions>
          </Card>
        ))}
      </MobileOnly>
    </Wrap>
  );
}

/* styled */
const Wrap = styled.div`
  display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};
`;

const Toolbar = styled.div`
  display:flex;align-items:center;justify-content:space-between;gap:${({theme})=>theme.spacings.sm};
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  padding:${({theme})=>theme.spacings.md};
  ${({theme})=>theme.media.tablet}{flex-direction:column;align-items:stretch;}
`;

const Filters = styled.div`
  display:grid;gap:${({theme})=>theme.spacings.sm};
  grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
`;

const Actions = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};`;

const inputBase = css`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  transition:border-color ${({theme})=>theme.transition.fast}, box-shadow ${({theme})=>theme.transition.fast};
  &:focus{outline:none;border-color:${({theme})=>theme.colors.inputBorderFocus};box-shadow:${({theme})=>theme.colors.shadowHighlight};}
`;
const Input = styled.input`${inputBase}`;
const Select = styled.select`${inputBase}`;

const Btn = styled.button`
  padding:8px 12px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  &:hover{background:${({theme})=>theme.buttons.secondary.backgroundHover};color:${({theme})=>theme.buttons.secondary.textHover};}
  &:disabled{opacity:${({theme})=>theme.opacity.disabled};cursor:not-allowed;}
`;
const Danger = styled(Btn)`
  background:${({theme})=>theme.colors.dangerBg};
  color:${({theme})=>theme.colors.danger};
  border-color:${({theme})=>theme.colors.danger};
  &:hover{background:${({theme})=>theme.colors.dangerHover};color:${({theme})=>theme.colors.white};border-color:${({theme})=>theme.colors.dangerHover};}
`;

/* Desktop table visible only above mobile breakpoint */
const DesktopOnly = styled.div`
  display:block;
  ${({theme})=>theme.media.mobile}{display:none;}
`;

const Table = styled.table`
  width:100%;border-collapse:collapse;background:${({theme})=>theme.colors.cardBackground};
  border-radius:${({theme})=>theme.radii.lg};overflow:hidden;

  thead th{
    background:${({theme})=>theme.colors.tableHeader};
    color:${({theme})=>theme.colors.textSecondary};
    padding:${({theme})=>theme.spacings.md};
    text-align:left;
    font-weight:${({theme})=>theme.fontWeights.semiBold};
  }
  td{
    padding:${({theme})=>theme.spacings.md};
    border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
    vertical-align:middle;
  }
  td.mono{ font-family:${({theme})=>theme.fonts.mono}; }
  td.actions{ text-align:right; }
`;

/* Mobile card list visible only on mobile breakpoint */
const MobileOnly = styled.div`
  display:none;
  ${({theme})=>theme.media.mobile}{display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.sm};}
`;

const Card = styled.article`
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderLight};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.md};
  display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.xs};
`;

const CardHead = styled.div`
  display:flex;align-items:center;justify-content:space-between;
  margin-bottom:${({theme})=>theme.spacings.xs};
`;
const Code = styled.span`font-weight:${({theme})=>theme.fontWeights.semiBold};`;

const KV = styled.div`
  display:flex;align-items:center;justify-content:space-between;
  gap:${({theme})=>theme.spacings.sm};
  padding:2px 0;
`;
const K = styled.span`color:${({theme})=>theme.colors.textSecondary};`;
const V = styled.span``;

const CardActions = styled.div`
  display:flex;gap:${({theme})=>theme.spacings.xs};justify-content:flex-end;margin-top:${({theme})=>theme.spacings.sm};
`;

const Empty = styled.div`
  padding:${({theme})=>theme.spacings.md} 0;
  color:${({theme})=>theme.colors.textSecondary};
  text-align:center;
`;

const Badge = styled.span`
  padding:2px 8px;border-radius:${({theme})=>theme.radii.pill};font-size:12px;
  background:${({theme})=>theme.colors.backgroundAlt};color:${({theme})=>theme.colors.textSecondary};

  &[data-status="success"]{background:${({theme})=>theme.colors.successBg};color:${({theme})=>theme.colors.success};}
  &[data-status="error"]{background:${({theme})=>theme.colors.dangerBg};color:${({theme})=>theme.colors.danger};}
  &[data-status="running"]{background:${({theme})=>theme.colors.warningBackground};color:${({theme})=>theme.colors.textOnWarning};}
  &[data-status="queued"],&[data-status="cancelled"]{background:${({theme})=>theme.colors.backgroundAlt};}
`;

const Row = styled.div`
  display:flex;gap:${({theme})=>theme.spacings.xs};
  align-items:center;justify-content:flex-end;
`;

