// src/modules/scheduling/ui/components/PlanList.tsx
"use client";
import styled, { css } from "styled-components";
import { useCallback, useMemo, useState } from "react";
import type {
  ISchedulePlan,
  PlanAdminFilters,
  PlanStatus,
  TranslatedLabel,
  RecurrencePattern,
} from "@/modules/scheduling/types";
import type { IContract } from "@/modules/contracts/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deletePlan, fetchPlans, setSelectedPlan } from "@/modules/scheduling/slice/schedulingSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/scheduling";

type Option = { value: string; label: string; [k: string]: any };
const STATUSES: PlanStatus[] = ["active", "paused", "archived"];

export default function PlanList({
  items,
  loading,
  onEdit,
}: {
  items: ISchedulePlan[];
  loading?: boolean;
  onEdit: (p: ISchedulePlan) => void;
}) {
  const dispatch = useAppDispatch();
  const { t, i18n } = useI18nNamespace("scheduling", translations);

  // --- Store bağımlılıkları ---
  const apartmentSlice     = useAppSelector((s) => (s as any).apartment);
  const serviceCatalogList = useAppSelector((s) => (s as any).servicecatalog);

  // ✔ Contracts: admin sayfasındaki pattern ile
  const contracts: IContract[] = useAppSelector(
    (s) =>
      (Array.isArray((s as any).contracts?.contractsAdmin)
        ? (s as any).contracts.contractsAdmin
        : []) as IContract[]
  );

  // ✔ Templates
  const { items: tplItems = [], loading: tplLoading } =
    useAppSelector((s) => (s as any).opstemplates || {});

  // --- Yerel filtre state ---
  const [f, setF] = useState<PlanAdminFilters>({});
  const onF = (k: keyof PlanAdminFilters, v: unknown) =>
    setF((s) => ({ ...s, [k]: (v === "" || v === undefined) ? undefined : (v as any) }));

  // Dil odaklı label seçimi
  const pickTL = useCallback(
    (tl?: TranslatedLabel) => {
      if (!tl) return "";
      const lang = i18n.language?.split("-")[0] || "en";
      return tl[lang] ?? tl.en ?? tl.tr ?? Object.values(tl).find(Boolean) ?? "";
    },
    [i18n.language]
  );

  // --- Opsiyon listeleri ---
  const apartmentOptions: Option[] = useMemo(() => {
    const list = apartmentSlice?.apartmentAdmin ?? [];
    return list.map((apt: any) => ({
      value: String(apt._id),
      label: pickTL(apt.title) || apt.slug || String(apt._id).slice(-6),
    }));
  }, [apartmentSlice?.apartmentAdmin, pickTL]);

  const serviceOptions: Option[] = useMemo(() => {
    const svcItems = serviceCatalogList?.items ?? [];
    return svcItems.map((svc: any) => ({
      value: String(svc._id),
      label: (pickTL(svc.name) ? `${pickTL(svc.name)} (${svc.code})` : String(svc.code ?? svc._id)),
      code: svc.code,
    }));
  }, [serviceCatalogList?.items, pickTL]);

  const templateOptions: Option[] = useMemo(() => {
    if (!f.apartmentRef) return [];
    const get = (o:any, keys:string[]) => keys.reduce<any>((acc,k)=>acc ?? o?.[k], undefined);
    return (tplItems as any[])
      .filter((tpl:any) => {
        const aptId = get(tpl, ["apartmentRef","apartmentId","apartment"]);
        const srvId = get(tpl, ["serviceRef","serviceId","service"]);
        const okApt = String(aptId || "") === String(f.apartmentRef);
        const okSrv = f.serviceRef ? String(srvId || "") === String(f.serviceRef) : true;
        return okApt && okSrv;
      })
      .map((tpl:any)=>({
        value: String(tpl._id),
        label: pickTL(tpl.name) || tpl.code || String(tpl._id).slice(-6),
      }));
  }, [tplItems, f.apartmentRef, f.serviceRef, pickTL]);

  // 🔧 Contracts: id alanı ve statüyü esnek karşıla
  const contractOptions: Option[] = useMemo(() => {
    if (!contracts.length || !f.apartmentRef) return [];

    const getAptId = (c: any): string | undefined => {
      const v =
        c?.apartmentRef ??
        c?.apartmentId ??
        (typeof c?.apartment === "string" ? c.apartment : undefined) ??
        (typeof c?.apartment === "object" ? (c.apartment?._id ?? c.apartment?.id) : undefined);
      return v ? String(v) : undefined;
    };

    return contracts
      .filter((c:any) => String(getAptId(c) || "") === String(f.apartmentRef))
      // Eğer sadece aktif istiyorsanız bir alt satırı açın:
      // .filter((c:any)=> String(c?.status ?? "").toLowerCase() === "active")
      .map((c:any)=>({
        value: String(c._id),
        label: c.code || `${t("contract", "Contract")} · ${String(c._id).slice(-6)}`,
      }));
  }, [contracts, f.apartmentRef, t]);

  // Tag önerileri
  const tagSuggestions: string[] = useMemo(() => {
    const set = new Set<string>();
    items.forEach(p => (p.tags || []).forEach(tag => set.add(tag)));
    return Array.from(set).sort();
  }, [items]);

  // Tarih formatlayıcı
  const fmtDateTime = useCallback(
    (d: unknown) =>
      d
        ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium", timeStyle: "short" })
            .format(new Date(d as any))
        : "–",
    [i18n.language]
  );

  // Pattern özet
  const patternText = useCallback(
    (p?: RecurrencePattern) => {
      if (!p) return "-";
      switch (p.type) {
        case "weekly": {
          const list = (p.daysOfWeek || []).join(",");
          return t("pattern.summary.weekly", "weekly/{{every}} [{{days}}]", { every: p.every, days: list });
        }
        case "dayOfMonth":
          return t("pattern.summary.dayOfMonth", "dayOfMonth/{{every}} day={{day}}", {
            every: p.every, day: p.day,
          });
        case "nthWeekday":
          return t("pattern.summary.nthWeekday", "nthWeekday/{{every}} {{nth}}.{{weekday}}", {
            every: p.every, nth: p.nth, weekday: p.weekday,
          });
        case "yearly":
          return t("pattern.summary.yearly", "yearly {{month}}/{{day}}", { month: p.month, day: p.day });
        default:
          return "-";
      }
    },
    [t]
  );

  // Bağımlı filtre temizleyici
  const onAptChange = (val: string) => {
    setF((s)=>({ ...s, apartmentRef: val || undefined, templateRef: undefined, contractRef: undefined }));
  };
  const onServiceChange = (val: string) => {
    setF((s)=>({ ...s, serviceRef: val || undefined, templateRef: undefined }));
  };

  // Hızlı tarih aralıkları
  const setQuickRange = (type: "thisMonth" | "last30" | "next30") => {
    const today = new Date();
    const iso = (d: Date) => d.toISOString().slice(0,10);
    if (type === "thisMonth") {
      const from = new Date(today.getFullYear(), today.getMonth(), 1);
      const to = new Date(today.getFullYear(), today.getMonth()+1, 0);
      setF((s)=>({ ...s, from: iso(from), to: iso(to) }));
    } else if (type === "last30") {
      const from = new Date(today); from.setDate(from.getDate()-30);
      setF((s)=>({ ...s, from: iso(from), to: iso(today) }));
    } else {
      const to = new Date(today); to.setDate(to.getDate()+30);
      setF((s)=>({ ...s, from: iso(today), to: iso(to) }));
    }
  };

  const localTitle = useCallback(
    (tl?: TranslatedLabel) => pickTL(tl) || "-",
    [pickTL]
  );

  const confirmDelete = (p: ISchedulePlan) => {
    const token = p.code;
    if (window.confirm(t("list.confirmDelete", "Delete plan {{code}}?", { code: token }))) {
      if (p._id) dispatch(deletePlan(p._id));
    }
  };

  // Apply/Reset
  const applyFilters = () => dispatch(fetchPlans(f));
  const resetFilters = () => { setF({}); dispatch(fetchPlans()); };

  return (
    <Wrap>
      {/* FİLTRE ARAÇ ÇUBUĞU */}
      <Toolbar role="region" aria-label={t("list.filters", "Plan filters")}>
        <Filters>
          <Group>
            <Label htmlFor="flt-q">{t("list.qLabel", "Search")}</Label>
            <Input
              id="flt-q"
              placeholder={t("list.qPh", "Search (code/title)")}
              value={f.q || ""}
              onChange={(e) => onF("q", e.target.value)}
            />
          </Group>

          <Group>
            <Label htmlFor="flt-status">{t("list.status", "Status")}</Label>
            <Select
              id="flt-status"
              value={f.status || ""}
              onChange={(e) => onF("status", e.target.value || undefined)}
            >
              <option value="">{t("list.any", "Any")}</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{t(`status.${s}`, s)}</option>
              ))}
            </Select>
          </Group>

          <Group>
            <Label htmlFor="flt-apt">{t("list.apartment", "Apartment")}</Label>
            <Select
              id="flt-apt"
              value={f.apartmentRef || ""}
              onChange={(e)=> onAptChange(e.target.value)}
            >
              <option value="">{t("list.any", "Any")}</option>
              {apartmentOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </Group>

          <Group>
            <Label htmlFor="flt-svc">{t("list.service", "Service")}</Label>
            <Select
              id="flt-svc"
              value={f.serviceRef || ""}
              onChange={(e)=> onServiceChange(e.target.value)}
            >
              <option value="">{t("list.any", "Any")}</option>
              {serviceOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </Group>

          <Group>
            <Label htmlFor="flt-tpl">{t("list.template", "Template")}</Label>
            <Select
              id="flt-tpl"
              value={f.templateRef || ""}
              onChange={(e)=> onF("templateRef", e.target.value || undefined)}
              disabled={!f.apartmentRef || tplLoading}
              title={
                !f.apartmentRef
                  ? t("list.pickApartmentFirst","Pick apartment first")
                  : tplLoading
                    ? t("common.loading","Loading…")
                    : ""
              }
            >
              <option value="">{tplLoading ? t("common.loading","Loading…") : t("list.any", "Any")}</option>
              {templateOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </Group>

          <Group>
            <Label htmlFor="flt-ctr">{t("list.contract", "Contract")}</Label>
            <Select
              id="flt-ctr"
              value={f.contractRef || ""}
              onChange={(e)=> onF("contractRef", e.target.value || undefined)}
              disabled={!f.apartmentRef}
              title={!f.apartmentRef ? t("list.pickApartmentFirst","Pick apartment first") : ""}
            >
              <option value="">{t("list.any", "Any")}</option>
              {contractOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </Group>

          <Group>
            <Label htmlFor="flt-tag">{t("list.tag", "Tag")}</Label>
            <Input
              list="tag-suggestions"
              id="flt-tag"
              placeholder={t("list.tag", "Tag")}
              value={f.tag || ""}
              onChange={(e) => onF("tag", e.target.value)}
            />
            <datalist id="tag-suggestions">
              {tagSuggestions.map(tag => <option key={tag} value={tag} />)}
            </datalist>
          </Group>

          {/* Tarih aralığı */}
          <DateGroup>
            <Legend>{t("list.dateRange.title", "Start Date Range")}</Legend>
            <RowH>
              <div>
                <SmallLabel htmlFor="flt-from">{t("list.from", "From")}</SmallLabel>
                <Input
                  id="flt-from"
                  type="date"
                  value={f.from || ""}
                  onChange={(e) => onF("from", e.target.value)}
                />
              </div>
              <div>
                <SmallLabel htmlFor="flt-to">{t("list.to", "To")}</SmallLabel>
                <Input
                  id="flt-to"
                  type="date"
                  value={f.to || ""}
                  onChange={(e) => onF("to", e.target.value)}
                />
              </div>
            </RowH>
            <Quick>
              <Btn type="button" onClick={()=>setQuickRange("thisMonth")}>
                {t("list.quick.thisMonth","This month")}
              </Btn>
              <Btn type="button" onClick={()=>setQuickRange("last30")}>
                {t("list.quick.last30","Last 30d")}
              </Btn>
              <Btn type="button" onClick={()=>setQuickRange("next30")}>
                {t("list.quick.next30","Next 30d")}
              </Btn>
            </Quick>
          </DateGroup>
        </Filters>

        <Actions>
          <Btn onClick={applyFilters} disabled={loading} aria-label={t("actions.apply", "Apply")}>
            {t("actions.apply", "Apply")}
          </Btn>
          <Btn onClick={resetFilters} disabled={loading} aria-label={t("actions.reset", "Reset")}>
            {t("actions.reset", "Reset")}
          </Btn>
        </Actions>
      </Toolbar>

      {/* Desktop/tablet: table */}
      <TableWrap>
        <Table role="table" aria-label={t("list.tableLabel", "Plans")}>
          <thead>
            <tr>
              <th>{t("list.th.code", "Code")}</th>
              <th>{t("list.th.title", "Title")}</th>
              <th>{t("list.th.status", "Status")}</th>
              <th>{t("list.th.nextRun", "Next Run")}</th>
              <th>{t("list.th.start", "Start")}</th>
              <th>{t("list.th.pattern", "Pattern")}</th>
              <th aria-label={t("list.th.actions", "Actions")} />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={7}>
                  <Empty>∅ {t("list.empty", "No results")}</Empty>
                </td>
              </tr>
            )}
            {items.map((p) => (
              <tr key={p._id}>
                <td className="mono">{p.code}</td>
                <td title={localTitle(p.title)}>{localTitle(p.title)}</td>
                <td><Badge data-status={p.status}>{t(`status.${p.status}`, p.status)}</Badge></td>
                <td>{fmtDateTime(p.nextRunAt)}</td>
                <td>{String(p.startDate).slice(0, 10)}</td>
                <td className="mono small">{patternText(p.pattern)}</td>
                <td className="actions">
                  <RowBtns>
                    <Btn onClick={() => dispatch(setSelectedPlan(p))}>{t("actions.view", "View")}</Btn>
                    <Secondary onClick={() => onEdit(p)}>{t("actions.edit", "Edit")}</Secondary>
                    <Danger onClick={() => confirmDelete(p)}>{t("actions.delete", "Delete")}</Danger>
                  </RowBtns>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>

      {/* Mobile: cards */}
      <Cards role="list" aria-label={t("list.tableLabel", "Plans")}>
        {items.length === 0 && !loading && <CardEmpty>∅ {t("list.empty", "No results")}</CardEmpty>}
        {items.map((p) => (
          <Card key={p._id} role="listitem">
            <TopRow>
              <Code className="mono">{p.code}</Code>
              <Badge data-status={p.status}>{t(`status.${p.status}`, p.status)}</Badge>
            </TopRow>
            <KV>
              <K>{t("list.th.title", "Title")}</K>
              <V title={localTitle(p.title)}>{localTitle(p.title)}</V>
            </KV>
            <KV>
              <K>{t("list.th.nextRun", "Next Run")}</K>
              <V>{fmtDateTime(p.nextRunAt)}</V>
            </KV>
            <KV>
              <K>{t("list.th.start", "Start")}</K>
              <V>{String(p.startDate).slice(0, 10)}</V>
            </KV>
            <KV>
              <K>{t("list.th.pattern", "Pattern")}</K>
              <V className="mono">{patternText(p.pattern)}</V>
            </KV>
            <RowBtns>
              <Btn onClick={() => dispatch(setSelectedPlan(p))}>{t("actions.view", "View")}</Btn>
              <Secondary onClick={() => onEdit(p)}>{t("actions.edit", "Edit")}</Secondary>
              <Danger onClick={() => confirmDelete(p)}>{t("actions.delete", "Delete")}</Danger>
            </RowBtns>
          </Card>
        ))}
      </Cards>
    </Wrap>
  );
}

/* styled (değişmedi) */
const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;
const Toolbar = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.md};
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
  flex: 1;
  display: grid;
  gap: ${({ theme }) => theme.spacings.sm};
  grid-template-columns: repeat(4, minmax(160px, 1fr));
  ${({ theme }) => theme.media.desktop} { grid-template-columns: repeat(3, minmax(160px, 1fr)); }
  ${({ theme }) => theme.media.tablet}   { grid-template-columns: repeat(2, minmax(160px, 1fr)); }
  ${({ theme }) => theme.media.mobile}   { grid-template-columns: 1fr; }
`;
const Group = styled.div`display:flex;flex-direction:column;gap:6px;`;
const Legend = styled.div`font-size:12px;color:${({theme})=>theme.colors.textSecondary};margin-bottom:4px;`;
const DateGroup = styled.div`
  display:flex;flex-direction:column;gap:6px;padding:8px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderLight};
  background:${({theme})=>theme.colors.backgroundAlt};
`;
const RowH = styled.div`display:grid;gap:${({theme})=>theme.spacings.xs};grid-template-columns:repeat(2,1fr);`;
const Quick = styled.div`display:flex;gap:${({theme})=>theme.spacings.xs};flex-wrap:wrap;`;
const Actions = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};flex-wrap:wrap;align-items:flex-start;`;
const focusable = css`
  transition: border-color ${({ theme }) => theme.transition.fast}, box-shadow ${({ theme }) => theme.transition.fast};
  &:focus { outline:none; border-color:${({ theme }) => theme.colors.inputBorderFocus}; box-shadow:${({ theme }) => theme.colors.shadowHighlight}; }
`;
const Label = styled.label`font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};`;
const SmallLabel = styled(Label)`font-size:11px;`;
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
  padding: 8px 12px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
  background:${({theme})=>theme.buttons.secondary.background}; color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  transition: background ${({theme})=>theme.transition.fast}, color ${({theme})=>theme.transition.fast};
  &:hover { background:${({theme})=>theme.buttons.secondary.backgroundHover}; color:${({theme})=>theme.colors.white}; }
  &:disabled{ opacity:${({theme})=>theme.opacity.disabled}; cursor:not-allowed; }
`;
const Btn = styled.button`${buttonBase}`;
const Secondary = styled(Btn)``;
const Danger = styled(Btn)`
  background:${({theme})=>theme.colors.dangerBg}; color:${({theme})=>theme.colors.danger};
  border-color:${({theme})=>theme.colors.danger};
  &:hover{ background:${({theme})=>theme.colors.dangerHover}; color:${({theme})=>theme.colors.white};
    border-color:${({theme})=>theme.colors.dangerHover}; }
`;
const TableWrap = styled.div`display:block; ${({theme})=>theme.media.mobile}{display:none;}`;
const Table = styled.table`
  width:100%; border-collapse:collapse; background:${({theme})=>theme.colors.cardBackground};
  border-radius:${({theme})=>theme.radii.lg}; overflow:hidden;
  thead th{ background:${({theme})=>theme.colors.tableHeader}; color:${({theme})=>theme.colors.textSecondary};
    padding:${({theme})=>theme.spacings.md}; text-align:left; }
  td{ padding:${({theme})=>theme.spacings.md}; border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
    vertical-align:middle; }
  td.mono{ font-family:${({theme})=>theme.fonts.mono}; }
  td.small{ font-size:12px; }
  td.actions{ text-align:right; }
`;
const Cards = styled.div`
  display:none; gap:${({theme})=>theme.spacings.sm};
  ${({theme})=>theme.media.mobile}{ display:grid; grid-template-columns:1fr; gap:${({theme})=>theme.spacings.sm}; }
`;
const Card = styled.div`
  background:${({theme})=>theme.colors.cardBackground}; border-radius:${({theme})=>theme.radii.lg};
  padding:${({theme})=>theme.spacings.md}; border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderLight};
  display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.xs};
`;
const CardEmpty = styled.div`
  background:${({theme})=>theme.colors.cardBackground}; border-radius:${({theme})=>theme.radii.lg};
  padding:${({theme})=>theme.spacings.md}; text-align:center; color:${({theme})=>theme.colors.textSecondary};
`;
const TopRow = styled.div`display:flex; align-items:center; justify-content:space-between; gap:${({theme})=>theme.spacings.xs};`;
const Code = styled.span`font-weight:${({theme})=>theme.fontWeights.medium};`;
const KV = styled.div`display:flex; gap:${({theme})=>theme.spacings.xs};`;
const K  = styled.div`min-width:110px; color:${({theme})=>theme.colors.textSecondary}; font-size:12px;`;
const V  = styled.div`flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`;
const Empty = styled.div`padding:${({theme})=>theme.spacings.md} 0; color:${({theme})=>theme.colors.textSecondary}; text-align:center;`;
const Badge = styled.span`
  padding:2px 8px; border-radius:${({theme})=>theme.radii.pill}; font-size:12px; background:${({theme})=>theme.colors.backgroundAlt};
  &[data-status="active"]{ background:${({theme})=>theme.colors.successBg}; color:${({theme})=>theme.colors.success}; }
  &[data-status="paused"]{ background:${({theme})=>theme.colors.warningBackground}; color:${({theme})=>theme.colors.textOnWarning}; }
  &[data-status="archived"]{ background:${({theme})=>theme.colors.backgroundAlt}; color:${({theme})=>theme.colors.textSecondary}; }
`;
const RowBtns = styled.div`
  display:flex; gap:${({theme})=>theme.spacings.xs}; align-items:center; justify-content:flex-end;
  button{ flex:1; min-width:0; text-align:center; }
  button + button{ margin-left:${({theme})=>theme.spacings.xs}; }
`;
