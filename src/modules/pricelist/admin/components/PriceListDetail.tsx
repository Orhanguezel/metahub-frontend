// src/modules/pricelist/ui/components/PriceListDetail.tsx
"use client";
import styled, { css } from "styled-components";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchPriceListById, fetchPriceListItems, deletePriceListItem
} from "@/modules/pricelist/slice/pricelistSlice";
import type { BillingPeriod, IPriceListItem, PriceListItemAdminFilters } from "@/modules/pricelist/types";
import { PriceListItemForm } from "@/modules/pricelist";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/pricelist";
import type { SupportedLocale } from "@/types/common";
import { SUPPORTED_LOCALES } from "@/types/common";

/* yeni period seti */
const PERIODS: BillingPeriod[] = [
  "weekly",
  "ten_days",
  "fifteen_days",
  "monthly",
  "quarterly",
  "yearly",
  "once",
];

export default function PriceListDetail({
  listId, onClose
}: { listId: string; onClose: () => void; }) {
  const dispatch = useAppDispatch();
  const { selected, selectedItems, loading } = useAppSelector(s => s.pricelists);
  const { t, i18n } = useI18nNamespace("pricelist", translations);

  // i18n.language -> SupportedLocale
  const uiLocale = useMemo<SupportedLocale>(() => {
    const raw = i18n.language || "en";
    return SUPPORTED_LOCALES.find(l => raw.startsWith(l)) ?? "en";
  }, [i18n.language]);

  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<IPriceListItem | null>(null);
  const [filters, setFilters] = useState<PriceListItemAdminFilters>({});
  const onF = (k: keyof PriceListItemAdminFilters, v: unknown) => setFilters(s=>({ ...s, [k]: v ?? undefined }));

  useEffect(()=>{ dispatch(fetchPriceListById(listId)); },[dispatch, listId]);

  const fmtAmount = useCallback((amt: number, curr?: string) => {
    const c = (curr || selected?.defaultCurrency || "EUR") as Intl.NumberFormatOptions["currency"];
    try {
      return new Intl.NumberFormat(i18n.language, { style: "currency", currency: c }).format(amt);
    } catch {
      return `${amt.toFixed(2)} ${c}`;
    }
  }, [i18n.language, selected?.defaultCurrency]);

  const localName = useMemo(() => {
    const m: Partial<Record<SupportedLocale, string>> = selected?.name ?? {};
    return m[uiLocale] ?? m.en ?? m.tr ?? Object.values(m)[0] ?? "";
  }, [selected?.name, uiLocale]);

  const periodLabel = (p: BillingPeriod) => t(`period.${p}`, p);

  const confirmDelete = (it: IPriceListItem) => {
    if (window.confirm(t("items.confirmDelete", "Delete item {{code}}/{{period}}?", { code: it.serviceCode, period: it.period }))) {
      dispatch(deletePriceListItem({ listId, itemId: it._id }));
    }
  };

  return (
    <Wrap>
      <Head>
        <div>
          <h2>{t("detail.title","Price List")}: <code>{selected?.code}</code></h2>
          <Small title={localName}>{localName}</Small>
        </div>
        <Right>
          <Badge title={t("detail.defaultCurrency","Default currency")}>{selected?.defaultCurrency}</Badge>
          <Close onClick={onClose} aria-label={t("actions.close","Close")}>{t("actions.close","Close")}</Close>
        </Right>
      </Head>

      <Filters role="region" aria-label={t("items.filters","Item filters")}>
        <Input
          placeholder={t("items.serviceCode","Service Code")}
          value={filters.serviceCode || ""}
          onChange={(e)=>onF("serviceCode", e.target.value)}
          aria-label={t("items.serviceCode","Service Code")}
        />
        <Select
          value={filters.period || ""}
          onChange={(e)=>onF("period", e.target.value || undefined)}
          aria-label={t("items.period","Period")}
        >
          <option value="">{t("common.allPeriods","All periods")}</option>
          {PERIODS.map(p=><option key={p} value={p}>{periodLabel(p)}</option>)}
        </Select>
        <Select
          value={filters.isActive===undefined? "" : String(filters.isActive)}
          onChange={(e)=>onF("isActive", e.target.value===""? undefined : e.target.value==="true")}
          aria-label={t("items.activeQ","Active?")}
        >
          <option value="">{t("common.all","All")}</option>
          <option value="true">{t("common.yes","Yes")}</option>
          <option value="false">{t("common.no","No")}</option>
        </Select>

        <Btn onClick={()=>dispatch(fetchPriceListItems({ listId, filters }))} disabled={loading}>
          {t("actions.apply","Apply")}
        </Btn>
        <Btn onClick={()=>{ setFilters({}); dispatch(fetchPriceListItems({ listId })); }} disabled={loading}>
          {t("actions.reset","Reset")}
        </Btn>

        <Grow />
        <Primary onClick={()=>{ setEditingItem(null); setShowItemForm(true); }}>
          + {t("items.add","Add Item")}
        </Primary>
      </Filters>

      {showItemForm && (
        <Card role="region" aria-label={t("items.formRegion","Create or edit price list item")}>
          <PriceListItemForm
            listId={listId}
            initial={editingItem || undefined}
            onClose={()=>setShowItemForm(false)}
            onSaved={()=>{ setShowItemForm(false); dispatch(fetchPriceListItems({ listId })); }}
          />
        </Card>
      )}

      <TableWrap>
        <Card>
          <Table role="table" aria-label={t("items.table","Items")}>
            <thead>
              <tr>
                <th>{t("items.th.service","Service")}</th>
                <th>{t("items.th.amount","Amount")}</th>
                <th>{t("items.th.currency","Currency")}</th>
                <th>{t("items.th.period","Period")}</th>
                <th>{t("items.th.active","Active")}</th>
                <th aria-label={t("items.th.actions","Actions")} />
              </tr>
            </thead>
            <tbody>
              {(selectedItems.length===0 && !loading) && (
                <tr><td colSpan={6}><Empty>∅ {t("common.noResults","No results")}</Empty></td></tr>
              )}
              {selectedItems.map(it=>(
                <tr key={it._id}>
                  <td className="mono">{it.serviceCode}</td>
                  <td>{fmtAmount(it.amount, it.currency || selected?.defaultCurrency)}</td>
                  <td>{it.currency || selected?.defaultCurrency}</td>
                  <td>{periodLabel(it.period)}</td>
                  <td>{it.isActive ? t("common.yes","Yes") : t("common.no","No")}</td>
                  <td className="actions">
                    <Row>
                      <Btn onClick={()=>{ setEditingItem(it); setShowItemForm(true); }}>{t("actions.edit","Edit")}</Btn>
                      <Danger onClick={()=>confirmDelete(it)}>{t("actions.delete","Delete")}</Danger>
                    </Row>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </TableWrap>

      <Cards role="list" aria-label={t("items.table","Items")}>
        {selectedItems.length===0 && !loading && <CardEmpty>∅ {t("common.noResults","No results")}</CardEmpty>}
        {selectedItems.map(it=>(
          <Card key={it._id} role="listitem">
            <TopRow>
              <Code className="mono">{it.serviceCode}</Code>
              <Badge data-active={String(!!it.isActive)}>
                {it.isActive ? t("common.active","Active") : t("common.inactive","Inactive")}
              </Badge>
            </TopRow>
            <KV><K>{t("items.th.amount","Amount")}</K><V>{fmtAmount(it.amount, it.currency || selected?.defaultCurrency)}</V></KV>
            <KV><K>{t("items.th.currency","Currency")}</K><V>{it.currency || selected?.defaultCurrency}</V></KV>
            <KV><K>{t("items.th.period","Period")}</K><V>{periodLabel(it.period)}</V></KV>
            <Row>
              <Btn onClick={()=>{ setEditingItem(it); setShowItemForm(true); }}>{t("actions.edit","Edit")}</Btn>
              <Danger onClick={()=>confirmDelete(it)}>{t("actions.delete","Delete")}</Danger>
            </Row>
          </Card>
        ))}
      </Cards>
    </Wrap>
  );
}

/* styled (aynı) */
const Wrap=styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};`;
const Head=styled.div`display:flex;align-items:center;justify-content:space-between;`;
const Right=styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};align-items:center;`;
const Badge=styled.span`
  padding:4px 8px;border-radius:${({theme})=>theme.radii.pill};background:${({theme})=>theme.colors.backgroundAlt};
  &[data-active="true"]{background:${({theme})=>theme.colors.successBg};color:${({theme})=>theme.colors.success};}
  &[data-active="false"]{background:${({theme})=>theme.colors.warningBackground};color:${({theme})=>theme.colors.textOnWarning};}
`;
const Small=styled.div`opacity:0.7;font-size:${({theme})=>theme.fontSizes.xsmall};`;
const focusable = css`
  transition: border-color ${({theme})=>theme.transition.fast}, box-shadow ${({theme})=>theme.transition.fast};
  &:focus{ outline:none; border-color:${({theme})=>theme.colors.inputBorderFocus}; box-shadow:${({theme})=>theme.colors.shadowHighlight}; }
  &:disabled{ opacity:${({theme})=>theme.opacity.disabled}; cursor:not-allowed; }
`;
const Close=styled.button`
  padding:6px 10px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  cursor:pointer; ${focusable}
`;
const Filters=styled.div`
  display:grid;grid-template-columns:repeat(6,1fr);gap:${({theme})=>theme.spacings.sm};
  ${({theme})=>theme.media.tablet}{grid-template-columns:repeat(3,1fr);}
  ${({theme})=>theme.media.mobile}{grid-template-columns:1fr;}
`;
const Input=styled.input`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  ${focusable}
`;
const Select=styled.select`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  ${focusable}
`;
const Btn=styled.button`
  padding:8px 12px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  background:${({theme})=>theme.buttons.secondary.background};color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  ${focusable}
  &:hover{background:${({theme})=>theme.buttons.secondary.backgroundHover};color:${({theme})=>theme.buttons.secondary.textHover};}
`;
const Primary=styled(Btn)`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border-color:${({theme})=>theme.buttons.primary.backgroundHover};
  &:hover{background:${({theme})=>theme.buttons.primary.backgroundHover};}
`;
const Grow=styled.div`flex:1;`;
const Card=styled.div`
  background:${({theme})=>theme.colors.cardBackground};border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};padding:${({theme})=>theme.spacings.md};
`;
const TableWrap=styled.div`display:block; ${({theme})=>theme.media.mobile}{ display:none; }`;
const Table=styled.table`
  width:100%;border-collapse:collapse;
  thead th{background:${({theme})=>theme.colors.tableHeader};color:${({theme})=>theme.colors.textSecondary};font-size:${({theme})=>theme.fontSizes.sm};padding:${({theme})=>theme.spacings.md};text-align:left;}
  td{padding:${({theme})=>theme.spacings.md};border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};font-size:${({theme})=>theme.fontSizes.sm};vertical-align:middle;}
  td.mono{font-family:${({theme})=>theme.fonts.mono};}
  td.actions{text-align:right;}
`;
const Row=styled.div`display:flex;gap:${({theme})=>theme.spacings.xs};justify-content:flex-end;flex-wrap:wrap;`;
const Danger=styled(Btn)`background:${({theme})=>theme.colors.dangerBg};color:${({theme})=>theme.colors.danger};border-color:${({theme})=>theme.colors.danger};`;
const Empty=styled.div`padding:${({theme})=>theme.spacings.md} 0;color:${({theme})=>theme.colors.textSecondary};text-align:center;`;
const Cards=styled.div`
  display:none; gap:${({theme})=>theme.spacings.sm};
  ${({theme})=>theme.media.mobile}{ display:grid; grid-template-columns:1fr; gap:${({theme})=>theme.spacings.sm}; }
`;
const CardEmpty=styled.div`
  background:${({theme})=>theme.colors.cardBackground}; border-radius:${({theme})=>theme.radii.lg};
  padding:${({theme})=>theme.spacings.md}; text-align:center; color:${({theme})=>theme.colors.textSecondary};
`;
const TopRow=styled.div`display:flex;align-items:center;justify-content:space-between;gap:${({theme})=>theme.spacings.xs};`;
const Code=styled.span`font-weight:${({theme})=>theme.fontWeights.medium};`;
const KV=styled.div`display:flex;gap:${({theme})=>theme.spacings.xs};`;
const K=styled.div`min-width:110px;color:${({theme})=>theme.colors.textSecondary};font-size:12px;`;
const V=styled.div`flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`;
