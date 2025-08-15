"use client";
import styled, { css } from "styled-components";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { deletePriceList, fetchPriceListById } from "@/modules/pricelist/slice/pricelistSlice";
import type {
  IPriceList,
  PriceListAdminFilters,
  PriceListStatus,
  TranslatedLabel,
  IPriceListItem,
} from "@/modules/pricelist/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/pricelist";
import type { SupportedLocale } from "@/types/common";
import { SUPPORTED_LOCALES, getMultiLang } from "@/types/common";
import apiCall from "@/lib/apiCall";

const STATUSES: PriceListStatus[] = ["draft", "active", "archived"];
const BASE_ADMIN = "/pricelist/admin";

type Stat = { count: number; min: number; max: number; currency: string };

export default function PriceListList({
  items,
  loading,
  onEdit,
}: {
  items: IPriceList[];
  loading?: boolean;
  onEdit: (pl: IPriceList) => void;
}) {
  const dispatch = useAppDispatch();
  const { t, i18n } = useI18nNamespace("pricelist", translations);

  const uiLocale = useMemo<SupportedLocale>(() => {
    const raw = i18n.language || "en";
    return (SUPPORTED_LOCALES.find((l) => raw.startsWith(l)) ?? "en") as SupportedLocale;
  }, [i18n.language]);

  const [f, setF] = useState<PriceListAdminFilters>({});
  const onChange = (k: keyof PriceListAdminFilters, v: unknown) =>
    setF((s) => ({ ...s, [k]: v ?? undefined }));

  const localName = useCallback(
    (m?: TranslatedLabel) => getMultiLang(m as any, uiLocale) || "-",
    [uiLocale]
  );

  const fmtDate = useCallback(
    (d: unknown) =>
      d
        ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(
            new Date(d as any)
          )
        : "–",
    [i18n.language]
  );

  const fmtAmount = useCallback(
    (n: number, ccy: string) => {
      try {
        return new Intl.NumberFormat(i18n.language, { style: "currency", currency: ccy }).format(
          n
        );
      } catch {
        return `${n.toFixed(2)} ${ccy}`;
      }
    },
    [i18n.language]
  );

  const filtered = useMemo(() => {
    const q = (f.q || "").trim().toLowerCase();
    const eff = f.effectiveAt ? new Date(f.effectiveAt) : null;

    return (items || []).filter((pl) => {
      if (f.status && pl.status !== f.status) return false;
      if (typeof f.isActive === "boolean" && pl.isActive !== f.isActive) return false;

      if (eff) {
        const from = new Date(pl.effectiveFrom);
        const to = pl.effectiveTo ? new Date(pl.effectiveTo) : null;
        const inWindow = from <= eff && (!to || to >= eff);
        if (!inWindow) return false;
      }
      if (q) {
        const name = localName(pl.name).toLowerCase();
        if (!pl.code.toLowerCase().includes(q) && !name.includes(q)) return false;
      }
      return true;
    });
  }, [items, f, localName]);

  // ---- tutar istatistikleri (satır başı min-max + adet) ----
  const [stats, setStats] = useState<Record<string, Stat>>({});
  const ensureStats = useCallback(
    async (pl: IPriceList) => {
      if (stats[pl._id]) return;
      try {
        const res = (await apiCall("get", `${BASE_ADMIN}/${pl._id}/items`)) as {
          data?: IPriceListItem[];
        };
        const arr = (res?.data || []) as IPriceListItem[];
        if (arr.length === 0) {
          setStats((m) => ({ ...m, [pl._id]: { count: 0, min: 0, max: 0, currency: pl.defaultCurrency } }));
          return;
        }
        let min = arr[0].amount;
        let max = arr[0].amount;
        for (const it of arr) {
          if (it.amount < min) min = it.amount;
          if (it.amount > max) max = it.amount;
        }
        setStats((m) => ({
          ...m,
          [pl._id]: { count: arr.length, min, max, currency: arr[0].currency || pl.defaultCurrency },
        }));
      } catch {
        // sessizce geç (istatistik yoksa "—" gösterilecek)
      }
    },
    [stats]
  );

  // görünür listedekiler için istatistikleri doldur
  useEffect(() => {
    filtered.slice(0, 20).forEach((pl) => void ensureStats(pl)); // ilk 20 satır için
  }, [filtered, ensureStats]);

  const renderAmount = (pl: IPriceList) => {
    const st = stats[pl._id];
    if (!st) return "…";
    if (st.count === 0) return "—";
    if (st.min === st.max) return `${fmtAmount(st.min, st.currency)} · ${st.count}`;
    return `${fmtAmount(st.min, st.currency)} – ${fmtAmount(st.max, st.currency)} · ${st.count}`;
  };

  const confirmDelete = (pl: IPriceList) => {
    if (window.confirm(t("list.confirmDelete", "Delete price list {{code}}?", { code: pl.code }))) {
      dispatch(deletePriceList(pl._id));
    }
  };

  return (
    <Wrap>
      <Toolbar role="region" aria-label={t("list.filters", "Filters")}>
        <Filters>
          <Input
            placeholder={t("list.searchPh", "Search")}
            value={f.q || ""}
            onChange={(e) => onChange("q", e.target.value)}
            aria-label={t("list.search", "Search")}
          />
          <Select
            value={f.status || ""}
            onChange={(e) => onChange("status", e.target.value || undefined)}
            aria-label={t("list.status", "Status")}
          >
            <option value="">{t("list.status", "Status")}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`status.${s}`, s)}
              </option>
            ))}
          </Select>
          <Select
            value={f.isActive === undefined ? "" : String(f.isActive)}
            onChange={(e) =>
              onChange("isActive", e.target.value === "" ? undefined : e.target.value === "true")
            }
            aria-label={t("list.isActive", "Active?")}
          >
            <option value="">{t("common.all", "All")}</option>
            <option value="true">{t("common.yes", "Yes")}</option>
            <option value="false">{t("common.no", "No")}</option>
          </Select>
          <Input
            type="date"
            value={f.effectiveAt || ""}
            onChange={(e) => onChange("effectiveAt", e.target.value)}
            aria-label={t("list.effectiveAt", "Effective At")}
          />
        </Filters>
        <Actions>
          <Btn onClick={() => setF({})} aria-label={t("actions.reset", "Reset")}>
            {t("actions.reset", "Reset")}
          </Btn>
        </Actions>
      </Toolbar>

      {/* Desktop table */}
      <Table role="table" aria-label={t("list.tableLabel", "Price lists")}>
        <thead>
          <tr>
            <th>{t("list.th.code", "Code")}</th>
            <th>{t("list.th.name", "Name")}</th>
            <th>{t("list.th.currency", "Currency")}</th>
            <th>{t("list.th.amount", "Amount")}</th>
            <th>{t("list.th.window", "Window")}</th>
            <th>{t("list.th.status", "Status")}</th>
            <th>{t("list.th.active", "Active")}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {!loading && filtered.length === 0 && (
            <tr>
              <td colSpan={8}>
                <Empty>∅ {t("common.noResults", "No results")}</Empty>
              </td>
            </tr>
          )}
          {filtered.map((pl) => (
            <tr key={pl._id}>
              <td className="mono">{pl.code}</td>
              <td title={localName(pl.name)}>{localName(pl.name)}</td>
              <td>{pl.defaultCurrency}</td>
              <td>{renderAmount(pl)}</td>
              <td>
                {fmtDate(pl.effectiveFrom)} →{" "}
                {pl.effectiveTo ? fmtDate(pl.effectiveTo) : t("common.open", "open")}
              </td>
              <td>
                <Badge data-status={pl.status}>{t(`status.${pl.status}`, pl.status)}</Badge>
              </td>
              <td>{pl.isActive ? t("common.yes", "Yes") : t("common.no", "No")}</td>
              <td className="actions">
                <Row>
                  <Secondary onClick={() => onEdit(pl)}>{t("actions.edit", "Edit")}</Secondary>
                  <Btn onClick={() => dispatch(fetchPriceListById(pl._id))}>
                    {t("list.items", "Items")}
                  </Btn>
                  <Danger onClick={() => confirmDelete(pl)}>{t("actions.delete", "Delete")}</Danger>
                </Row>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Mobile cards */}
      <CardList role="list" aria-label={t("list.tableLabel", "Price lists")}>
        {filtered.length === 0 && !loading && <Empty>∅ {t("common.noResults", "No results")}</Empty>}
        {filtered.map((pl) => (
          <Card key={pl._id} role="listitem">
            <Line>
              <Field>{t("list.th.code", "Code")}</Field>
              <Value className="mono">{pl.code}</Value>
            </Line>
            <Line>
              <Field>{t("list.th.name", "Name")}</Field>
              <Value title={localName(pl.name)}>{localName(pl.name)}</Value>
            </Line>
            <Line>
              <Field>{t("list.th.currency", "Currency")}</Field>
              <Value>{pl.defaultCurrency}</Value>
            </Line>
            <Line>
              <Field>{t("list.th.amount", "Amount")}</Field>
              <Value>{renderAmount(pl)}</Value>
            </Line>
            <Line>
              <Field>{t("list.th.window", "Window")}</Field>
              <Value>
                {fmtDate(pl.effectiveFrom)} →{" "}
                {pl.effectiveTo ? fmtDate(pl.effectiveTo) : t("common.open", "open")}
              </Value>
            </Line>
            <Line>
              <Field>{t("list.th.status", "Status")}</Field>
              <Value>
                <Badge data-status={pl.status}>{t(`status.${pl.status}`, pl.status)}</Badge>
              </Value>
            </Line>
            <Line>
              <Field>{t("list.th.active", "Active")}</Field>
              <Value>{pl.isActive ? t("common.yes", "Yes") : t("common.no", "No")}</Value>
            </Line>
            <Buttons>
              <Secondary onClick={() => onEdit(pl)}>{t("actions.edit", "Edit")}</Secondary>
              <Btn onClick={() => dispatch(fetchPriceListById(pl._id))}>
                {t("list.items", "Items")}
              </Btn>
              <Danger onClick={() => confirmDelete(pl)}>{t("actions.delete", "Delete")}</Danger>
            </Buttons>
          </Card>
        ))}
      </CardList>
    </Wrap>
  );
}

/* styled — mevcut stiller aynen; sadece tablo başlığındaki kolon sayısı arttı */
const Wrap = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};`;

const Toolbar = styled.div`
  display:flex;align-items:center;justify-content:space-between;gap:${({theme})=>theme.spacings.sm};
  background:${({theme})=>theme.colors.cardBackground};border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};box-shadow:${({theme})=>theme.cards.shadow};padding:${({theme})=>theme.spacings.md};
  ${({theme})=>theme.media.tablet}{flex-direction:column;align-items:stretch;}
`;
const Filters = styled.div`display:grid;gap:${({theme})=>theme.spacings.sm};grid-template-columns:repeat(auto-fit,minmax(160px,1fr));`;
const Actions = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};`;

const focusable = css`
  transition: border-color ${({theme})=>theme.transition.fast}, box-shadow ${({theme})=>theme.transition.fast};
  &:focus{ outline:none; border-color:${({theme})=>theme.colors.inputBorderFocus}; box-shadow:${({theme})=>theme.colors.shadowHighlight}; }
  &:disabled{ opacity:${({theme})=>theme.opacity.disabled}; cursor:not-allowed; }
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

const Btn = styled.button`
  padding:8px 12px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  background:${({theme})=>theme.buttons.secondary.background};color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  ${focusable}
  &:hover{background:${({theme})=>theme.buttons.secondary.backgroundHover};color:${({theme})=>theme.buttons.secondary.textHover};}
`;
const Secondary = styled(Btn)``;
const Danger = styled(Btn)`
  background:${({theme})=>theme.colors.dangerBg};
  color:${({theme})=>theme.colors.danger};
  border-color:${({theme})=>theme.colors.danger};
  &:hover{background:${({theme})=>theme.colors.dangerHover};color:${({theme})=>theme.colors.white};}
`;

const Badge = styled.span`
  padding:2px 8px;border-radius:${({theme})=>theme.radii.pill};font-size:12px;background:${({theme})=>theme.colors.backgroundAlt};
  &[data-status="active"]{background:${({theme})=>theme.colors.successBg};color:${({theme})=>theme.colors.success};}
  &[data-status="draft"]{background:${({theme})=>theme.colors.warningBackground};color:${({theme})=>theme.colors.textOnWarning};}
  &[data-status="archived"]{background:${({theme})=>theme.colors.backgroundAlt};color:${({theme})=>theme.colors.textSecondary};}
`;

const Table = styled.table`
  width:100%;border-collapse:collapse;background:${({theme})=>theme.colors.cardBackground};
  border-radius:${({theme})=>theme.radii.lg};box-shadow:${({theme})=>theme.cards.shadow};overflow:hidden;
  thead th{background:${({theme})=>theme.colors.tableHeader};color:${({theme})=>theme.colors.textSecondary};
    font-weight:${({theme})=>theme.fontWeights.semiBold};font-size:${({theme})=>theme.fontSizes.sm};
    padding:${({theme})=>theme.spacings.md};text-align:left;}
  td{padding:${({theme})=>theme.spacings.md};border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
    font-size:${({theme})=>theme.fontSizes.sm};vertical-align:middle;}
  td.mono{font-family:${({theme})=>theme.fonts.mono};}
  td.actions{text-align:right;}
  tr:hover td{background:${({theme})=>theme.colors.hoverBackground};}
  ${({theme})=>theme.media.mobile}{display:none;}
`;

const Row = styled.div`display:flex;gap:${({theme})=>theme.spacings.xs};flex-wrap:wrap;justify-content:flex-end;`;
const Empty = styled.div`padding:${({theme})=>theme.spacings.md} 0;color:${({theme})=>theme.colors.textSecondary};text-align:center;`;

const CardList = styled.div`display:none; ${({theme})=>theme.media.mobile}{display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};}`;
const Card = styled.div`background:${({theme})=>theme.colors.cardBackground};border-radius:${({theme})=>theme.radii.lg};box-shadow:${({theme})=>theme.cards.shadow};padding:${({theme})=>theme.spacings.md};`;
const Line = styled.div`display:flex;justify-content:space-between;gap:${({theme})=>theme.spacings.sm};padding:6px 0;`;
const Field = styled.span`color:${({theme})=>theme.colors.textSecondary};font-size:${({theme})=>theme.fontSizes.xsmall};min-width:90px;`;
const Value = styled.span`
  color:${({theme})=>theme.colors.text};font-size:${({theme})=>theme.fontSizes.xsmall};
  text-align:right;max-width:60%;word-break:break-word;&.mono{font-family:${({theme})=>theme.fonts.mono};}
`;
const Buttons = styled.div`display:flex;justify-content:flex-end;gap:${({theme})=>theme.spacings.xs};margin-top:${({theme})=>theme.spacings.sm};`;
