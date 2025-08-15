"use client";
import styled from "styled-components";
import { useMemo, useState, useCallback } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllOpsJobsAdmin, updateOpsJob, deleteOpsJob } from "@/modules/operationsjobs/slice/opsjobsSlice";
import type { IOperationJob, JobsAdminFilters } from "@/modules/operationsjobs/types";
import { translations } from "@/modules/operationsjobs";
import {
  type SupportedLocale,
  SUPPORTED_LOCALES,
  getMultiLang,
} from "@/types/common";

type LabelResolver = (ref: any) => string;

type Props = {
  items: IOperationJob[];
  loading?: boolean;
  meta?: { total: number; page: number; limit: number };
  onEdit: (job: IOperationJob) => void;

  /** Parent opsiyonel olarak ID→etiket çözücüler gönderebilir */
  getApartmentLabel?: LabelResolver;
  getServiceLabel?: LabelResolver;
  getContractLabel?: LabelResolver;
  getEmployeeLabel?: LabelResolver;
  getCategoryLabel?: LabelResolver;
};

type Opt = { id: string; label: string; sub?: string };

// i18n dilini 2 harfe indirip destekleniyorsa döndür
const getUILang = (lng?: string): SupportedLocale | undefined => {
  const two = (lng || "").slice(0, 2).toLowerCase();
  return (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(two)
    ? (two as SupportedLocale)
    : undefined;
};

export default function JobList({
  items,
  loading,
  onEdit,
  getApartmentLabel, 
}: Props) {
  const { t, i18n } = useI18nNamespace("opsjobs", translations);
  const lang = useMemo<SupportedLocale | undefined>(() => getUILang(i18n?.language), [i18n?.language]);
  const dispatch = useAppDispatch();

  /* 🔹 ilişkili veriler (state) */
  const apartments = useAppSelector((s) => (s as any).apartment?.apartmentAdmin ?? (s as any).apartment?.apartment ?? []) as any[];
  const services   = useAppSelector((s) => (s as any).servicecatalog?.items ?? (s as any).services?.items ?? []) as any[];
  const { employeesAdmin = [] } = useAppSelector((s) => (s as any).employees ?? {});

  const apartmentOpts: Opt[] = useMemo(
    () =>
      (apartments || []).map((a: any) => ({
        id: String(a._id),
        label: getMultiLang(a?.title, lang) || a?.slug || String(a._id),
        sub:
          a?.address?.fullText ||
          [a?.address?.city, a?.address?.country].filter(Boolean).join(", "),
      })),
    [apartments, lang]
  );

  const serviceOpts: Opt[] = useMemo(
    () =>
      (services || []).map((s: any) => ({
        id: String(s._id),
        label: (typeof s?.name === "string" ? s?.name : getMultiLang(s?.name, lang)) || s?.code || String(s._id),
        sub: s?.code,
      })),
    [services, lang]
  );

  const employeeOpts: Opt[] = useMemo(
    () =>
      (employeesAdmin || []).map((e: any) => ({
        id: String(e._id),
        label:
          e?.fullName?.trim?.() ||
          [e?.firstName, e?.lastName].filter(Boolean).join(" ").trim() ||
          e?.email ||
          String(e._id),
        sub: [e?.email, e?.phone].filter(Boolean).join(" • "),
      })),
    [employeesAdmin]
  );

  /* 🔹 label map */
  const apLabelById  = useMemo(() => new Map(apartmentOpts.map((o) => [o.id, o.label])), [apartmentOpts]);

  /* ---- filters ---- */
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobsAdminFilters>({ limit: 50, page: 1, isActive: true });

  const onChange = (k: keyof JobsAdminFilters, v: any) =>
    setFilters((s) => ({ ...s, [k]: v === "" || v === null ? undefined : v }));

  const applyFilters = useCallback(() => {
    dispatch(fetchAllOpsJobsAdmin(filters) as any);
  }, [dispatch, filters]);

  const resetFilters = useCallback(() => {
    const base = { limit: 50, page: 1, isActive: true } as JobsAdminFilters;
    setFilters(base);
    dispatch(fetchAllOpsJobsAdmin(base) as any);
  }, [dispatch]);

  const d = (v?: string | Date) => (v ? new Date(v).toLocaleString() : "-");

  const toggleActive = async (j: IOperationJob) => {
    setBusyId(j._id);
    try {
      await dispatch(updateOpsJob({ id: j._id, changes: { isActive: !j.isActive } }) as any).unwrap();
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (j: IOperationJob) => {
    if (!confirm(t("confirmDelete", "Are you sure?"))) return;
    setBusyId(j._id);
    try {
      await dispatch(deleteOpsJob(j._id) as any).unwrap();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Wrap>
      <Toolbar aria-label={t("filters", "Filters")}>
        <FilterGrid>
          <FormField>
            <Label htmlFor="q">{t("q", "Search")}</Label>
            <Input id="q" value={filters.q || ""} onChange={(e) => onChange("q", e.target.value)} />
          </FormField>

          <FormField>
            <Label htmlFor="code">{t("code", "Code")}</Label>
            <Input id="code" value={filters.code || ""} onChange={(e) => onChange("code", e.target.value)} />
          </FormField>

          <FormField>
            <Label htmlFor="status">{t("status", "Status")}</Label>
            <Select id="status" value={filters.status || ""} onChange={(e) => onChange("status", e.target.value || undefined)}>
              <option value="">{t("status", "Status")}</option>
              {["draft", "scheduled", "in_progress", "paused", "completed", "cancelled"].map((s) => (
                <option key={s} value={s}>
                  {t(`status_${s}`, s)}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField>
            <Label htmlFor="source">{t("source", "Source")}</Label>
            <Select id="source" value={filters.source || ""} onChange={(e) => onChange("source", e.target.value || undefined)}>
              <option value="">{t("source", "Source")}</option>
              {["manual", "recurrence", "contract", "adhoc"].map((s) => (
                <option key={s} value={s}>
                  {t(`source_${s}`, s)}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField>
            <Label htmlFor="priority">{t("priority", "Priority")}</Label>
            <Select id="priority" value={filters.priority || ""} onChange={(e) => onChange("priority", e.target.value || undefined)}>
              <option value="">{t("priority", "Priority")}</option>
              {["low", "normal", "high", "critical"].map((p) => (
                <option key={p} value={p}>
                  {t(`priority_${p}`, p)}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField>
            <Label htmlFor="apartment">{t("apartment", "Apartment")}</Label>
            <Select id="apartment" value={filters.apartment || ""} onChange={(e) => onChange("apartment", e.target.value)}>
              <option value="">{t("apartment", "Apartment")}</option>
              {apartmentOpts.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                  {o.sub ? ` — ${o.sub}` : ""}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField>
            <Label htmlFor="service">{t("service", "Service")}</Label>
            <Select id="service" value={filters.service || ""} onChange={(e) => onChange("service", e.target.value)}>
              <option value="">{t("service", "Service")}</option>
              {serviceOpts.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                  {o.sub ? ` — ${o.sub}` : ""}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField>
            <Label htmlFor="employee">{t("employee", "Employee")}</Label>
            <Select id="employee" value={filters.employee || ""} onChange={(e) => onChange("employee", e.target.value)}>
              <option value="">{t("employee", "Employee")}</option>
              {employeeOpts.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                  {o.sub ? ` — ${o.sub}` : ""}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField>
            <Label htmlFor="active">{t("isActive", "Active?")}</Label>
            <Select
              id="active"
              value={filters.isActive === undefined ? "" : String(filters.isActive)}
              onChange={(e) => onChange("isActive", e.target.value === "" ? undefined : e.target.value === "true")}
            >
              <option value="">{t("isActive", "Active?")}</option>
              <option value="true">{t("yes", "Yes")}</option>
              <option value="false">{t("no", "No")}</option>
            </Select>
          </FormField>

          <FormField>
            <Label htmlFor="plannedFrom">{t("plannedFrom", "Planned From")}</Label>
            <Input id="plannedFrom" type="date" value={filters.plannedFrom || ""} onChange={(e) => onChange("plannedFrom", e.target.value || undefined)} />
          </FormField>
          <FormField>
            <Label htmlFor="plannedTo">{t("plannedTo", "Planned To")}</Label>
            <Input id="plannedTo" type="date" value={filters.plannedTo || ""} onChange={(e) => onChange("plannedTo", e.target.value || undefined)} />
          </FormField>

          <FormField>
            <Label htmlFor="dueFrom">{t("dueFrom", "Due From")}</Label>
            <Input id="dueFrom" type="date" value={filters.dueFrom || ""} onChange={(e) => onChange("dueFrom", e.target.value || undefined)} />
          </FormField>
          <FormField>
            <Label htmlFor="dueTo">{t("dueTo", "Due To")}</Label>
            <Input id="dueTo" type="date" value={filters.dueTo || ""} onChange={(e) => onChange("dueTo", e.target.value || undefined)} />
          </FormField>
        </FilterGrid>

        <Actions>
          <Btn onClick={applyFilters} disabled={loading} aria-busy={loading}>
            {t("refresh", "Refresh")}
          </Btn>
          <Btn onClick={resetFilters} disabled={loading}>
            {t("cancel", "Cancel")}
          </Btn>
        </Actions>
      </Toolbar>

      {/* -------- Desktop: Table -------- */}
      <TableWrap aria-live="polite" aria-busy={loading}>
        <Table>
          <thead>
            <tr>
              <th>{t("code", "Code")}</th>
              <th>{t("titleField", "Title")}</th>
              <th>{t("apartment", "Apartment")}</th>
              <th>{t("status", "Status")}</th>
              <th>{t("plannedStart", "Planned Start")}</th>
              <th>{t("dueAt", "Due At")}</th>
              <th>{t("assignees", "Assignees")}</th>
              <th>{t("priority", "Priority")}</th>
              <th>{t("isActive", "Active?")}</th>
              <th aria-label={t("actions", "Actions")} />
            </tr>
          </thead>
          <tbody>
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={10}>
                  <Empty>∅</Empty>
                </td>
              </tr>
            )}
            {items.map((j) => {
              const rowDisabled = busyId === j._id;
              const title = getMultiLang(j.title as any, lang) || "-";

              // 🔹 Apartman etiketi: parent resolver varsa onu kullan, yoksa fallback
              const aptTitle = getApartmentLabel
                ? getApartmentLabel(j.apartmentRef)
                : (typeof j.apartmentRef === "string"
                    ? apLabelById.get(j.apartmentRef) || j.apartmentRef
                    : getMultiLang((j.apartmentRef as any)?.title, lang) ||
                      apLabelById.get(String((j.apartmentRef as any)?._id)) ||
                      "-");

              return (
                <tr key={j._id} aria-busy={rowDisabled}>
                  <td className="mono">{j.code}</td>
                  <td title={title}>{title}</td>
                  <td title={aptTitle}>{aptTitle || "-"}</td>
                  <td>{t(`status_${j.status}`, j.status)}</td>
                  <td>{d(j.schedule?.plannedStart)}</td>
                  <td>{d(j.schedule?.dueAt)}</td>
                  <td>{j.assignments?.length || 0}</td>
                  <td>{t(`priority_${j.priority || "normal"}`, j.priority || "normal")}</td>
                  <td>
                    <Badge $on={j.isActive}>{j.isActive ? t("yes", "Yes") : t("no", "No")}</Badge>
                  </td>
                  <td className="actions">
                    <Row>
                      <Secondary onClick={() => onEdit(j)} disabled={rowDisabled}>
                        {t("edit", "Edit")}
                      </Secondary>
                      <Secondary onClick={() => toggleActive(j)} disabled={rowDisabled}>
                        {j.isActive ? t("deactivate", "Deactivate") : t("activate", "Activate")}
                      </Secondary>
                      <Danger onClick={() => remove(j)} disabled={rowDisabled}>
                        {t("delete", "Delete")}
                      </Danger>
                    </Row>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </TableWrap>

      {/* -------- Mobile: Cards -------- */}
      <CardsWrap aria-live="polite" aria-busy={loading}>
        {items.length === 0 && !loading && <Empty>∅</Empty>}
        {items.map((j) => {
          const rowDisabled = busyId === j._id;
          const title = getMultiLang(j.title as any, lang) || "-";

          const aptTitle = getApartmentLabel
            ? getApartmentLabel(j.apartmentRef)
            : (typeof j.apartmentRef === "string"
                ? apLabelById.get(j.apartmentRef) || j.apartmentRef
                : getMultiLang((j.apartmentRef as any)?.title, lang) ||
                  apLabelById.get(String((j.apartmentRef as any)?._id)) ||
                  "-");

          return (
            <Card key={j._id} aria-busy={rowDisabled}>
              <CardHeader>
                <HeaderLeft>
                  <Code className="mono">{j.code}</Code>
                  <NameTitle title={title}>{title}</NameTitle>
                </HeaderLeft>
                <Status $on={j.isActive}>{j.isActive ? t("yes", "Yes") : t("no", "No")}</Status>
              </CardHeader>

              <CardBody>
                <DetailsGrid>
                  <Detail>
                    <Field>{t("apartment", "Apartment")}</Field>
                    <Value title={aptTitle}>{aptTitle || "-"}</Value>
                  </Detail>
                  <Detail>
                    <Field>{t("status", "Status")}</Field>
                    <Value>{t(`status_${j.status}`, j.status)}</Value>
                  </Detail>
                  <Detail>
                    <Field>{t("plannedStart", "Planned Start")}</Field>
                    <Value>{d(j.schedule?.plannedStart)}</Value>
                  </Detail>
                  <Detail>
                    <Field>{t("dueAt", "Due At")}</Field>
                    <Value>{d(j.schedule?.dueAt)}</Value>
                  </Detail>
                  <Detail>
                    <Field>{t("assignees", "Assignees")}</Field>
                    <Value>{j.assignments?.length || 0}</Value>
                  </Detail>
                  <Detail>
                    <Field>{t("priority", "Priority")}</Field>
                    <Value>{t(`priority_${j.priority || "normal"}`, j.priority || "normal")}</Value>
                  </Detail>
                </DetailsGrid>
              </CardBody>

              <CardActions>
                <Secondary onClick={() => onEdit(j)} disabled={rowDisabled}>
                  {t("edit", "Edit")}
                </Secondary>
                <Secondary onClick={() => toggleActive(j)} disabled={rowDisabled}>
                  {j.isActive ? t("deactivate", "Deactivate") : t("activate", "Activate")}
                </Secondary>
                <Danger onClick={() => remove(j)} disabled={rowDisabled}>
                  {t("delete", "Delete")}
                </Danger>
              </CardActions>
            </Card>
          );
        })}
      </CardsWrap>
    </Wrap>
  );
}

/* ---- styled ---- */
const Wrap = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};`;
const Toolbar = styled.div`
  display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.md};
`;
const FilterGrid = styled.div`
  display:grid;gap:${({theme})=>theme.spacings.sm};
  grid-template-columns:repeat(4, minmax(160px, 1fr));
  ${({theme})=>theme.media.tablet}{grid-template-columns:repeat(2, minmax(160px, 1fr));}
  ${({theme})=>theme.media.mobile}{grid-template-columns:1fr;}
`;
const FormField = styled.div`display:flex;flex-direction:column;gap:6px;`;
const Label = styled.label`font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};`;
const Actions = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};justify-content:flex-end;`;
const Input = styled.input`
  min-width:0;padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
`;
const Select = styled.select`
  min-width:0;padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
`;
const Btn = styled.button`
  padding:10px 14px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  &:disabled{opacity:${({theme})=>theme.opacity.disabled};cursor:not-allowed;}
`;
const TableWrap = styled.div`
  width:100%;overflow-x:auto;border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};background:${({theme})=>theme.colors.cardBackground};
  ${({theme})=>theme.media.mobile}{display:none;}
`;
const Table = styled.table`
  width:100%;border-collapse:collapse;
  thead th{
    background:${({theme})=>theme.colors.tableHeader};
    color:${({theme})=>theme.colors.textSecondary};
    font-weight:${({theme})=>theme.fontWeights.semiBold};
    font-size:${({theme})=>theme.fontSizes.sm};
    padding:${({theme})=>theme.spacings.md};
    text-align:left;white-space:nowrap;
  }
  td{
    padding:${({theme})=>theme.spacings.md};
    border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
    font-size:${({theme})=>theme.fontSizes.sm};
    vertical-align:middle;
  }
  td.mono{font-family:${({theme})=>theme.fonts.mono};}
  td.actions{text-align:right;}
  tbody tr:hover td{background:${({theme})=>theme.colors.hoverBackground};}
`;
const CardsWrap = styled.div`
  display:none;
  ${({theme})=>theme.media.mobile}{
    display:grid;grid-template-columns:1fr;gap:${({theme})=>theme.spacings.md};
  }
`;
const Card = styled.article`
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  overflow:hidden;
`;
const CardHeader = styled.header`
  background:${({theme})=>theme.colors.primaryLight};
  color:${({theme})=>theme.colors.title};
  padding:${({theme})=>theme.spacings.sm} ${({theme})=>theme.spacings.md};
  display:flex;align-items:center;justify-content:space-between;gap:${({theme})=>theme.spacings.sm};
  border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
`;
const HeaderLeft = styled.div`display:flex;flex-direction:column;gap:2px;min-width:0;`;
const Code = styled.span`font-weight:${({theme})=>theme.fontWeights.semiBold};`;
const NameTitle = styled.span`
  font-size:${({theme})=>theme.fontSizes.sm};color:${({theme})=>theme.colors.textSecondary};
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:70vw;
`;
const Status = styled.span<{ $on:boolean }>`
  padding:.2em .6em;border-radius:${({theme})=>theme.radii.pill};
  background:${({$on,theme})=>$on?theme.colors.successBg:theme.colors.inputBackgroundLight};
  color:${({$on,theme})=>$on?theme.colors.success:theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.xsmall};
`;
const CardBody = styled.div`padding:${({theme})=>theme.spacings.md};`;
const DetailsGrid = styled.div`
  display:grid;grid-template-columns:1fr 1fr;gap:${({theme})=>theme.spacings.sm};
  ${({theme})=>theme.media.xsmall}{grid-template-columns:1fr;}
`;
const Detail = styled.div`
  display:grid;grid-template-columns:140px 1fr;gap:${({theme})=>theme.spacings.xs};
  ${({theme})=>theme.media.xsmall}{grid-template-columns:120px 1fr;}
`;
const Field = styled.span`color:${({theme})=>theme.colors.textSecondary};font-size:${({theme})=>theme.fontSizes.xsmall};`;
const Value = styled.span`font-size:${({theme})=>theme.fontSizes.xsmall};word-break:break-word;`;
const CardActions = styled.div`
  display:flex;gap:${({theme})=>theme.spacings.xs};justify-content:flex-end;
  padding:${({theme})=>theme.spacings.sm} ${({theme})=>theme.spacings.md} ${({theme})=>theme.spacings.md};
  border-top:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
`;
const Row = styled.div`display:flex;gap:${({theme})=>theme.spacings.xs};flex-wrap:wrap;justify-content:flex-end;`;
const Empty = styled.div`padding:${({theme})=>theme.spacings.md} 0;color:${({theme})=>theme.colors.textSecondary};text-align:center;`;
const Secondary = styled.button`
  padding:8px 10px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
`;
const Danger = styled(Secondary)`
  background:${({theme})=>theme.colors.dangerBg};
  color:${({theme})=>theme.colors.danger};
  border-color:${({theme})=>theme.colors.danger};
  &:hover{
    background:${({theme})=>theme.colors.dangerHover};
    color:${({theme})=>theme.colors.textOnDanger};
    border-color:${({theme})=>theme.colors.dangerHover};
  }
`;
const Badge = styled.span<{ $on:boolean }>`
  display:inline-block;padding:.2em .6em;border-radius:${({theme})=>theme.radii.pill};
  background:${({$on,theme})=>$on?theme.colors.successBg:theme.colors.inputBackgroundLight};
  color:${({$on,theme})=>$on?theme.colors.success:theme.colors.textSecondary};
`;
