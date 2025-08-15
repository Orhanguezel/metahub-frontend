"use client";
import styled, { css } from "styled-components";
import { useCallback, useMemo, useState } from "react";
import type { DefinitionAdminFilters, IReportDefinition, ReportKind } from "@/modules/reports/types";
import { useAppDispatch } from "@/store/hooks";
import { deleteDefinition, fetchDefinitions, setSelectedDefinition } from "@/modules/reports/slice/reportsSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/reports";

const KINDS: ReportKind[] = [
  "ar_aging","ap_aging","revenue","expense","cashflow",
  "profitability","billing_forecast","invoice_collections",
  "employee_utilization","workload","service_performance",
];

export default function DefinitionList({
  items, loading, onEdit, onTrigger
}: {
  items: IReportDefinition[];
  loading?: boolean;
  onEdit: (d: IReportDefinition)=>void;
  onTrigger: (d: IReportDefinition)=>void;
}) {
  const dispatch = useAppDispatch();
  const { t, i18n } = useI18nNamespace("reports", translations);

  const [f, setF] = useState<DefinitionAdminFilters>({});
  const onF = (k: keyof DefinitionAdminFilters, v: any) =>
    setF(s => ({ ...s, [k]: v ?? undefined }));

  const fmtDateTime = useCallback(
    (d: any) =>
      d
        ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium", timeStyle: "short" })
            .format(new Date(d))
        : "–",
    [i18n.language]
  );

  const confirmDelete = (d: IReportDefinition) => {
    const token = d.code || d.name;
    if (window.confirm(t("list.confirmDelete", "Delete definition {{code}}?", { code: token }))) {
      if (d._id) dispatch(deleteDefinition(d._id));
    }
  };

  const rows = useMemo(
    () =>
      items.map(d => ({
        id: d._id,
        code: d.code,
        name: d.name,
        kind: d.kind,
        isActive: !!d.isActive,
        statusText: d.isActive ? t("status.active", "Active") : t("status.inactive", "Inactive"),
        updated: fmtDateTime(d.updatedAt),
        raw: d
      })),
    [items, t, fmtDateTime]
  );

  return (
    <Wrap>
      <Toolbar role="region" aria-label={t("list.filters", "Definition filters")}>
        <Filters>
          <Input
            placeholder={t("list.searchPh", "Search (code/name/desc)")}
            value={f.q || ""}
            onChange={(e)=>onF("q", e.target.value)}
            aria-label={t("list.search", "Search")}
          />
          <Select
            value={f.kind || ""}
            onChange={(e)=>onF("kind", e.target.value || undefined)}
            aria-label={t("form.kind", "Kind")}
          >
            <option value="">{t("list.kindAny", "Kind")}</option>
            {KINDS.map(k => <option key={k} value={k}>{t(`kinds.${k}`, k)}</option>)}
          </Select>
          <Select
            value={f.isActive === undefined ? "" : String(f.isActive)}
            onChange={(e)=>onF("isActive", e.target.value === "" ? undefined : e.target.value === "true")}
            aria-label={t("list.activeAny", "Active?")}
          >
            <option value="">{t("list.activeAny", "Active?")}</option>
            <option value="true">{t("status.active", "Active")}</option>
            <option value="false">{t("status.inactive", "Inactive")}</option>
          </Select>
          <Input
            placeholder={t("list.tagPh", "Tag")}
            value={f.tag || ""}
            onChange={(e)=>onF("tag", e.target.value)}
            aria-label={t("list.tag", "Tag")}
          />
        </Filters>
        <Actions>
          <Btn onClick={()=>dispatch(fetchDefinitions(f))} disabled={loading} aria-label={t("actions.apply", "Apply")}>
            {t("actions.apply", "Apply")}
          </Btn>
          <Btn
            onClick={()=>{ setF({}); dispatch(fetchDefinitions()); }}
            disabled={loading}
            aria-label={t("actions.reset", "Reset")}
          >
            {t("actions.reset", "Reset")}
          </Btn>
        </Actions>
      </Toolbar>

      {/* Masaüstü / Tablet: Tablo */}
      <DesktopOnly>
        <Table role="table" aria-label={t("list.tableLabel", "Report definitions")}>
          <thead>
            <tr>
              <Th>{t("list.th.code", "Code")}</Th>
              <Th>{t("list.th.name", "Name")}</Th>
              <Th>{t("list.th.kind", "Kind")}</Th>
              <Th>{t("list.th.status", "Status")}</Th>
              <Th>{t("list.th.updated", "Updated")}</Th>
              <Th aria-label={t("list.th.actions", "Actions")} />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={6}><Empty>∅ {t("list.empty", "No results")}</Empty></td>
              </tr>
            )}
            {rows.map(r => (
              <tr key={r.id ?? `${r.code}-${r.name}`}>
                <td className="mono">{r.code}</td>
                <td>{r.name}</td>
                <td>{t(`kinds.${r.kind}`, r.kind)}</td>
                <td>
                  <StatusPill data-active={r.isActive ? "true" : "false"}>{r.statusText}</StatusPill>
                </td>
                <td>{r.updated}</td>
                <td className="actions">
                  <Row>
                    <Secondary onClick={()=>onEdit(r.raw)}>{t("actions.edit", "Edit")}</Secondary>
                    <Btn onClick={()=>onTrigger(r.raw)}>{t("actions.run", "Run")}</Btn>
                    <Btn onClick={()=>dispatch(setSelectedDefinition(r.raw))}>{t("actions.viewJson", "View JSON")}</Btn>
                    <Danger onClick={()=>confirmDelete(r.raw)}>{t("actions.delete", "Delete")}</Danger>
                  </Row>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </DesktopOnly>

      {/* Mobil: Kart listesi */}
      <MobileOnly aria-label={t("list.tableLabel", "Report definitions")}>
        {rows.length === 0 && !loading && <Empty>∅ {t("list.empty", "No results")}</Empty>}
        {rows.map(r => (
          <Card key={r.id ?? `${r.code}-${r.name}`}>
            <CardHead>
              <Code className="mono">{r.code || "—"}</Code>
              <StatusPill data-active={r.isActive ? "true" : "false"}>{r.statusText}</StatusPill>
            </CardHead>

            <KV><K>{t("list.th.name", "Name")}</K><V>{r.name}</V></KV>
            <KV><K>{t("list.th.kind", "Kind")}</K><V>{t(`kinds.${r.kind}`, r.kind)}</V></KV>
            <KV><K>{t("list.th.updated", "Updated")}</K><V>{r.updated}</V></KV>

            <CardActions>
              <Secondary onClick={()=>onEdit(r.raw)}>{t("actions.edit", "Edit")}</Secondary>
              <Btn onClick={()=>onTrigger(r.raw)}>{t("actions.run", "Run")}</Btn>
              <Btn onClick={()=>dispatch(setSelectedDefinition(r.raw))}>{t("actions.viewJson", "View JSON")}</Btn>
              <Danger onClick={()=>confirmDelete(r.raw)}>{t("actions.delete", "Delete")}</Danger>
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

const Actions = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};flex-wrap:wrap;`;

const focusable = css`
  transition: border-color ${({theme})=>theme.transition.fast}, box-shadow ${({theme})=>theme.transition.fast};
  &:focus {
    outline:none;
    border-color:${({theme})=>theme.colors.inputBorderFocus};
    box-shadow:${({theme})=>theme.colors.shadowHighlight};
  }
`;

const Input = styled.input`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  ${focusable}
`;

const Select = styled.select`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  ${focusable}
`;

const buttonBase = css`
  padding:8px 12px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  transition: background ${({theme})=>theme.transition.fast}, color ${({theme})=>theme.transition.fast};
  &:hover{background:${({theme})=>theme.buttons.secondary.backgroundHover};color:${({theme})=>theme.buttons.secondary.textHover};}
  &:disabled{opacity:${({theme})=>theme.opacity.disabled};cursor:not-allowed;}
`;
const Btn = styled.button`${buttonBase}`;
const Secondary = styled(Btn)``;

const Danger = styled(Btn)`
  background:${({theme})=>theme.colors.dangerBg};
  color:${({theme})=>theme.colors.danger};
  border-color:${({theme})=>theme.colors.danger};
  &:hover{
    background:${({theme})=>theme.colors.dangerHover};
    color:${({theme})=>theme.colors.white};
    border-color:${({theme})=>theme.colors.dangerHover};
  }
`;

/* Desktop-only tablo */
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

/* Mobile-only kart listesi */
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

const StatusPill = styled.span<{["data-active"]?: "true" | "false"}>`
  padding:2px 8px;border-radius:${({theme})=>theme.radii.pill};
  font-size:12px;
  background:${({theme})=>theme.colors.backgroundAlt};
  color:${({theme})=>theme.colors.textSecondary};

  &[data-active="true"]{
    background:${({theme})=>theme.colors.successBg};
    color:${({theme})=>theme.colors.success};
  }
  &[data-active="false"]{
    background:${({theme})=>theme.colors.dangerBg};
    color:${({theme})=>theme.colors.danger};
  }
`;

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

const Row = styled.div`
  display:flex;gap:${({theme})=>theme.spacings.xs};justify-content:flex-end;flex-wrap:wrap;
`;

const Empty = styled.div`
  padding:${({theme})=>theme.spacings.md} 0;
  color:${({theme})=>theme.colors.textSecondary};
  text-align:center;
`;

const Th = styled.th`text-align:left;`;
