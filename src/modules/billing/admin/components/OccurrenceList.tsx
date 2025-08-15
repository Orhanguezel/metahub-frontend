"use client";
import { useMemo, useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/billing/locales";
import { getLocaleStringFromLang, type SupportedLocale } from "@/types/common";
import type {
  IBillingOccurrence,
  OccurrenceListFilters,
  BillingOccurrenceStatus,
} from "@/modules/billing/types";
import { useAppDispatch } from "@/store/hooks";
import { fetchOccurrences, deleteOccurrence } from "@/modules/billing/slice/billingSlice";

interface Props {
  items: IBillingOccurrence[];
  loading?: boolean;
}

export default function OccurrenceList({ items, loading }: Props) {
  const { i18n, t } = useI18nNamespace("billing", translations);
  const lang = (i18n.language?.slice(0, 2) as SupportedLocale) || "en";
  const locale = getLocaleStringFromLang(lang);

  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState<OccurrenceListFilters>({});

  const onChange = (k: keyof OccurrenceListFilters, v: any) =>
    setFilters((s) => ({ ...s, [k]: v === "" || v === null ? undefined : v }));

  const applied = useMemo(() => filters, [filters]);

  /* format helpers */
  const fmtDate = (d?: string | Date) =>
    d ? new Intl.DateTimeFormat(locale).format(new Date(d)) : "-";

  const fmtAmount = (amt: number, ccy: string) => {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: ccy,
        maximumFractionDigits: 2,
      }).format(amt);
    } catch {
      return `${amt.toLocaleString()} ${ccy}`;
    }
  };

  const truncate = (s: string, n = 10) => (s.length <= n ? s : s.slice(0, n) + "…");

  const planLabel = (plan: unknown) => {
    if (plan && typeof plan === "object") {
      const anyp = plan as any;
      if (anyp.code) return anyp.code as string;
      if (anyp._id) return truncate(String(anyp._id));
      return "-";
    }
    return truncate(String(plan ?? "-"));
  };

  return (
    <Wrap>
      <Toolbar role="region" aria-label={t("occ.filters.title", "Occurrence Filters")}>
        <FilterRow>
          <Control>
            <Label htmlFor="plan">{t("occ.filters.planId", "Plan Id")}</Label>
            <Input
              id="plan"
              placeholder={t("occ.filters.planId", "Plan Id")}
              value={filters.plan || ""}
              onChange={(e) => onChange("plan", e.target.value)}
            />
          </Control>

          <Control>
            <Label htmlFor="status">{t("occ.filters.status", "Status")}</Label>
            <Select
              id="status"
              value={filters.status || ""}
              onChange={(e) => onChange("status", (e.target.value || undefined) as BillingOccurrenceStatus)}
            >
              <option value="">{t("common.all", "All")}</option>
              <option value="pending">{t("status.pending", "pending")}</option>
              <option value="invoiced">{t("status.invoiced", "invoiced")}</option>
              <option value="skipped">{t("status.skipped", "skipped")}</option>
              <option value="canceled">{t("status.canceled", "canceled")}</option>
            </Select>
          </Control>

          <Control>
            <Label htmlFor="dueFrom">{t("occ.filters.dueFrom", "Due from")}</Label>
            <Input
              id="dueFrom"
              type="date"
              value={filters.dueFrom || ""}
              onChange={(e) => onChange("dueFrom", e.target.value)}
            />
          </Control>

          <Control>
            <Label htmlFor="dueTo">{t("occ.filters.dueTo", "Due to")}</Label>
            <Input
              id="dueTo"
              type="date"
              value={filters.dueTo || ""}
              onChange={(e) => onChange("dueTo", e.target.value)}
            />
          </Control>

          <Control>
            <Label htmlFor="invoice">{t("occ.filters.invoice", "Invoice Id")}</Label>
            <Input
              id="invoice"
              placeholder={t("occ.filters.invoice", "Invoice Id")}
              value={filters.invoice || ""}
              onChange={(e) => onChange("invoice", e.target.value)}
            />
          </Control>

          <Control>
            <Label htmlFor="seqFrom">{t("occ.filters.seqFrom", "Seq from")}</Label>
            <Input
              id="seqFrom"
              type="number"
              min={1}
              value={filters.seqFrom ?? ""}
              onChange={(e) => onChange("seqFrom", e.target.value ? Number(e.target.value) : undefined)}
            />
          </Control>

          <Control>
            <Label htmlFor="seqTo">{t("occ.filters.seqTo", "Seq to")}</Label>
            <Input
              id="seqTo"
              type="number"
              min={1}
              value={filters.seqTo ?? ""}
              onChange={(e) => onChange("seqTo", e.target.value ? Number(e.target.value) : undefined)}
            />
          </Control>

          <Control>
            <Label htmlFor="limit">{t("occ.filters.limit", "Limit")}</Label>
            <Input
              id="limit"
              type="number"
              min={1}
              value={filters.limit ?? ""}
              onChange={(e) => onChange("limit", e.target.value ? Number(e.target.value) : undefined)}
            />
          </Control>
        </FilterRow>

        <ActionRow>
          <PrimaryBtn onClick={() => dispatch(fetchOccurrences(applied))} disabled={loading}>
            {t("actions.apply", "Apply")}
          </PrimaryBtn>
          <SecondaryBtn
            onClick={() => {
              setFilters({});
              dispatch(fetchOccurrences());
            }}
            disabled={loading}
          >
            {t("actions.reset", "Reset")}
          </SecondaryBtn>
        </ActionRow>
      </Toolbar>

      {/* Card Grid (her ekranda) */}
      <CardGrid role="list" aria-label={t("sections.occurrences", "Occurrences")}>
        {items.length === 0 && !loading && (
          <Empty>{t("common.empty", "Empty")}</Empty>
        )}

        {items.map((o) => (
          <Card key={o._id} role="listitem">
            <CardHeader>
              <PlanCode className="mono" title={typeof o.plan === "string" ? o.plan : (o as any)?.plan?._id}>
                {planLabel(o.plan)}
              </PlanCode>
              <RightTop>
                <SeqBadge>#{o.seq}</SeqBadge>
                <Status $s={o.status}>{t(`status.${o.status}`, o.status)}</Status>
              </RightTop>
            </CardHeader>

            <Amount>
              {fmtAmount(o.amount, o.currency)}
            </Amount>

            <MetaGrid>
              <MetaItem>
                <MetaLabel>{t("occ.columns.window", "Window")}</MetaLabel>
                <MetaValue>{fmtDate(o.windowStart)} → {fmtDate(o.windowEnd)}</MetaValue>
              </MetaItem>
              <MetaItem>
                <MetaLabel>{t("occ.columns.due", "Due")}</MetaLabel>
                <MetaValue>{fmtDate(o.dueAt)}</MetaValue>
              </MetaItem>
              <MetaItem>
                <MetaLabel>{t("occ.columns.invoice", "Invoice")}</MetaLabel>
                <MetaValue className="mono">
                  {o.invoice ? truncate(String((o as any).invoice?._id ?? o.invoice)) : "-"}
                </MetaValue>
              </MetaItem>
            </MetaGrid>

            <CardActions>
              <DangerBtn
                onClick={() =>
                  dispatch(deleteOccurrence(o._id)).then(() => dispatch(fetchOccurrences(applied)))
                }
              >
                {t("actions.delete", "Delete")}
              </DangerBtn>
            </CardActions>
          </Card>
        ))}
      </CardGrid>
    </Wrap>
  );
}

/* ---------- styled (classicTheme) ---------- */
const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;

const Toolbar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.sm};
  background: ${({ theme }) => theme.cards.background};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.cards.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.md};
`;

const FilterRow = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.sm};
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacings.sm};
  flex-wrap: wrap; /* dar ekranda alt satıra insin */
`;

const Control = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xs};
  min-width: 0;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const inputLike = `
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
`;

const Input = styled.input`
  ${inputLike}
  border-color: ${({ theme }) => theme.inputs.border};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  &::placeholder { color: ${({ theme }) => theme.inputs.placeholder}; }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
  }
`;

const Select = styled.select`
  ${inputLike}
  border-color: ${({ theme }) => theme.inputs.border};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
  }
`;

const BaseBtn = styled.button`
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  border: ${({ theme }) => theme.borders.thin} transparent;
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: opacity ${({ theme }) => theme.transition.fast}, transform ${({ theme }) =>
      theme.transition.fast};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  &:hover { opacity: ${({ theme }) => theme.opacity.hover}; }
  &:disabled { opacity: ${({ theme }) => theme.opacity.disabled}; cursor: not-allowed; }
  &:active { transform: translateY(1px); }
`;

const PrimaryBtn = styled(BaseBtn)`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border-color: ${({ theme }) => theme.buttons.primary.background};
`;

const SecondaryBtn = styled(BaseBtn)`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border-color: ${({ theme }) => theme.colors.border};
`;

const DangerBtn = styled(BaseBtn)`
  background: ${({ theme }) => theme.buttons.danger.background};
  color: ${({ theme }) => theme.buttons.danger.text};
  border-color: ${({ theme }) => theme.colors.danger};
`;

/* ---- Card Grid ---- */
const CardGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.md};
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  ${({ theme }) => theme.media.small} {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
`;

const Card = styled.article`
  background: ${({ theme }) => theme.cards.background};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.cards.border};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacings.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const CardHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.xs};
`;

const PlanCode = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.title};
  font-family: ${({ theme }) => theme.fonts.mono};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RightTop = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  align-items: center;
`;

const SeqBadge = styled.span`
  padding: 0.2em 0.6em;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.primaryTransparent};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderHighlight};
`;

const Amount = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.text};
`;

const MetaGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.xs};
  grid-template-columns: repeat(2, minmax(0, 1fr));
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const MetaLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
`;

const MetaValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacings.sm};
`;

const Empty = styled.div`
  grid-column: 1 / -1;
  padding: ${({ theme }) => theme.spacings.md} 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
`;

/* Status badge */
const Status = styled.span<{ $s: BillingOccurrenceStatus }>`
  display: inline-block;
  padding: 0.25em 0.7em;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderHighlight};
  background: ${({ $s, theme }) =>
    $s === "invoiced" ? theme.colors.successBg :
    $s === "pending" ? theme.colors.warningBackground :
    $s === "skipped" ? theme.colors.inputBackgroundLight :
    $s === "canceled" ? theme.colors.dangerBg :
    theme.colors.backgroundAlt};
  color: ${({ $s, theme }) =>
    $s === "invoiced" ? theme.colors.success :
    $s === "pending" ? theme.colors.warning :
    $s === "skipped" ? theme.colors.textSecondary :
    $s === "canceled" ? theme.colors.danger :
    theme.colors.text};
`;
