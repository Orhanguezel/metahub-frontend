"use client";
import { useMemo, useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/cashbook/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchEntries,
  deleteEntry,
  reconcile,
  unreconcile,
  toggleEntrySelection,
  clearEntrySelection,
} from "@/modules/cashbook/slice/cashbookSlice";
import type { EntryListFilters, EntryDirection, ICashEntry } from "@/modules/cashbook/types";

interface Props {
  items: ICashEntry[];
  loading?: boolean;
}

export default function CashEntryList({ items, loading }: Props) {
  const { t, i18n } = useI18nNamespace("cashbook", translations);
  const dispatch = useAppDispatch();
  const selected = useAppSelector((s) => s.cashbook.selectedEntryIds);

  const [filters, setFilters] = useState<EntryListFilters>({});
  const [rid, setRid] = useState("");

  const locale = useMemo(() => (i18n.language || "en").replace("_", "-"), [i18n.language]);
  const df = useMemo(() => new Intl.DateTimeFormat(locale), [locale]);

  const onChange = (k: keyof EntryListFilters, v: any) =>
    setFilters((s) => ({ ...s, [k]: v || undefined }));

  const applied = useMemo(() => filters, [filters]);

  const fmtDate = (d: string | Date) => {
    const dt = new Date(d);
    return Number.isNaN(dt.getTime()) ? "-" : df.format(dt);
  };

  const fmtAmount = (e: ICashEntry) => {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: e.currency,
        maximumFractionDigits: 2,
      }).format(e.amount);
    } catch {
      return `${e.amount.toLocaleString()} ${e.currency}`;
    }
  };

  const short = (s: string, n = 8) => (s?.length <= n ? s : s.slice(0, n) + "…");

  return (
    <Wrap>
      <Toolbar role="region" aria-label={t("filters._", "Filters")}>
        <FilterRow>
          <FieldGroup>
            <Label htmlFor="f-acc">{t("entry.account", "Account")}</Label>
            <Input
              id="f-acc"
              placeholder={t("entry.account", "Account")}
              value={filters.accountId || ""}
              onChange={(e) => onChange("accountId", e.target.value)}
            />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="f-dir">{t("entry.direction", "Direction")}</Label>
            <Select
              id="f-dir"
              value={filters.direction || ""}
              onChange={(e) => onChange("direction", (e.target.value || undefined) as EntryDirection)}
            >
              <option value="">{t("entry.direction", "Direction")}</option>
              <option value="in">{t("entry.in", "In")}</option>
              <option value="out">{t("entry.out", "Out")}</option>
            </Select>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="f-from">{t("filters.startFrom", "Start from")}</Label>
            <Input id="f-from" type="date" value={filters.from || ""} onChange={(e) => onChange("from", e.target.value)} />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="f-to">{t("filters.startTo", "Start to")}</Label>
            <Input id="f-to" type="date" value={filters.to || ""} onChange={(e) => onChange("to", e.target.value)} />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="f-rec">{t("entry.reconciled", "Reconciled?")}</Label>
            <Select
              id="f-rec"
              value={filters.reconciled === undefined ? "" : String(filters.reconciled)}
              onChange={(e) => onChange("reconciled", e.target.value === "" ? undefined : e.target.value === "true")}
            >
              <option value="">{t("entry.reconciled", "Reconciled?")}</option>
              <option value="true">{t("common.yes", "Yes")}</option>
              <option value="false">{t("common.no", "No")}</option>
            </Select>
          </FieldGroup>
        </FilterRow>

        <Actions>
          <Btn
            type="button"
            onClick={() => dispatch(fetchEntries(applied))}
            disabled={loading}
            aria-busy={loading}
          >
            {t("actions.apply", "Apply")}
          </Btn>
          <Btn
            type="button"
            onClick={() => {
              setFilters({});
              dispatch(fetchEntries());
            }}
            disabled={loading}
          >
            {t("actions.reset", "Reset")}
          </Btn>
        </Actions>
      </Toolbar>

      <RecoBar aria-live="polite">
        <RecoLeft>
          <small>
            {t("reco.selected", "Selected")}: {selected.length}
          </small>
        </RecoLeft>
        <RecoRight>
          <Input
            small
            id="reco-id"
            placeholder={t("reco.id", "Reconciliation Id (opt.)")}
            value={rid}
            onChange={(e) => setRid(e.target.value)}
          />
          <Primary
            type="button"
            onClick={() =>
              dispatch(reconcile({ entryIds: selected, reconciliationId: rid || undefined }))
                .then(() => dispatch(fetchEntries(applied)))
                .then(() => dispatch(clearEntrySelection()))
            }
            disabled={!selected.length}
          >
            {t("reco.apply", "Reconcile")}
          </Primary>
          <Danger
            type="button"
            onClick={() =>
              rid &&
              dispatch(unreconcile(rid))
                .then(() => dispatch(fetchEntries(applied)))
                .then(() => dispatch(clearEntrySelection()))
            }
            disabled={!rid}
          >
            {t("reco.remove", "Unreconcile")}
          </Danger>
        </RecoRight>
      </RecoBar>

      {/* Desktop table */}
      <Table role="table" aria-label={t("sections.entries", "Entries")}>
        <thead>
          <tr>
            <th aria-label="select" />
            <th>{t("entry.date", "Date")}</th>
            <th>{t("entry.account", "Account")}</th>
            <th>{t("entry.direction", "Direction")}</th>
            <th>{t("entry.amount", "Amount")}</th>
            <th>{t("entry.desc", "Description")}</th>
            <th>{t("entry.reconciled", "Reconciled?")}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {!loading && items.length === 0 && (
            <tr>
              <td colSpan={8}>
                <Empty>{t("common.empty", "Empty")}</Empty>
              </td>
            </tr>
          )}
          {items.map((e) => (
            <tr key={e._id}>
              <td className="check">
                <input
                  type="checkbox"
                  aria-label={t("reco.select", "Select")}
                  checked={selected.includes(e._id)}
                  onChange={() => dispatch(toggleEntrySelection(e._id))}
                />
              </td>
              <td>{fmtDate(e.date)}</td>
              <td className="mono">{short(String(e.accountId))}</td>
              <td>
                <Badge $dir={e.direction}>{t(`entry.${e.direction}`, e.direction)}</Badge>
              </td>
              <td>{fmtAmount(e)}</td>
              <td>{e.description || "-"}</td>
              <td>
                <Badge2 $ok={e.isReconciled}>
                  {e.isReconciled ? e.reconciliationId || t("reco.yes", "Yes") : t("reco.no", "No")}
                </Badge2>
              </td>
              <td className="actions">
                <Danger
                  type="button"
                  onClick={() =>
                    dispatch(deleteEntry(e._id))
                      .then(() => dispatch(fetchEntries(applied)))
                  }
                >
                  {t("actions.delete", "Delete")}
                </Danger>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Mobile cards */}
      <CardList>
        {items.length === 0 && !loading && <Empty>{t("common.empty", "Empty")}</Empty>}
        {items.map((e) => (
          <Card key={e._id}>
            <Row>
              <Field>{t("entry.date", "Date")}</Field>
              <Value>{fmtDate(e.date)}</Value>
            </Row>
            <Row>
              <Field>{t("entry.account", "Account")}</Field>
              <Value className="mono">{short(String(e.accountId))}</Value>
            </Row>
            <Row>
              <Field>{t("entry.direction", "Direction")}</Field>
              <Value>
                <Badge $dir={e.direction}>{t(`entry.${e.direction}`, e.direction)}</Badge>
              </Value>
            </Row>
            <Row>
              <Field>{t("entry.amount", "Amount")}</Field>
              <Value>{fmtAmount(e)}</Value>
            </Row>
            <Row>
              <Field>{t("entry.desc", "Description")}</Field>
              <Value>{e.description || "-"}</Value>
            </Row>
            <Row>
              <Field>{t("entry.reconciled", "Reconciled?")}</Field>
              <Value>
                <Badge2 $ok={e.isReconciled}>
                  {e.isReconciled ? e.reconciliationId || t("reco.yes", "Yes") : t("reco.no", "No")}
                </Badge2>
              </Value>
            </Row>
            <Buttons>
              <SmallCheck>
                <input
                  type="checkbox"
                  checked={selected.includes(e._id)}
                  onChange={() => dispatch(toggleEntrySelection(e._id))}
                />
                <span>{t("reco.select", "Select")}</span>
              </SmallCheck>
              <Danger
                type="button"
                onClick={() =>
                  dispatch(deleteEntry(e._id))
                    .then(() => dispatch(fetchEntries(applied)))
                }
              >
                {t("actions.delete", "Delete")}
              </Danger>
            </Buttons>
          </Card>
        ))}
      </CardList>
    </Wrap>
  );
}

/* styled (theme-compliant) */
const Wrap = styled.div`
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.spacings.md};
`;

const Toolbar = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.sm};
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.md};
  ${({ theme }) => theme.media.mobile}{ flex-direction: column; align-items: stretch; }
`;

const FilterRow = styled.div`
  display: grid; gap: ${({ theme }) => theme.spacings.sm};
  grid-template-columns: repeat(5, minmax(160px, 1fr));
  min-width: 0; flex: 1 1 auto;
  ${({ theme }) => theme.media.tablet}{ grid-template-columns: repeat(3, 1fr); }
  ${({ theme }) => theme.media.mobile}{ grid-template-columns: 1fr; }
`;

/* her filtre için label + control bloğu */
const FieldGroup = styled.div`
  display: flex; flex-direction: column; gap: 6px; min-width: 0;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Actions = styled.div`
  display: flex; gap: ${({ theme }) => theme.spacings.sm};
`;

const Input = styled.input<{ small?: boolean }>`
  padding: ${({ small }) => (small ? "8px 10px" : "10px 12px")};
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background}; color: ${({ theme }) => theme.inputs.text};
  &:focus{ outline: none; border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus}; }
  &::placeholder{ color: ${({ theme }) => theme.colors.placeholder}; }
`;

const Select = styled.select`
  padding: 10px 12px; border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background}; color: ${({ theme }) => theme.inputs.text};
  &:focus{ outline: none; border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus}; }
`;

const Btn = styled.button`
  padding: 10px 14px; border-radius: ${({ theme }) => theme.radii.md}; cursor: pointer;
  background: ${({ theme }) => theme.colors.buttonBackground};
  color: ${({ theme }) => theme.colors.buttonText};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.buttonBorder};
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: opacity ${({ theme }) => theme.transition.fast}, transform ${({ theme }) => theme.transition.fast};
  &:hover{ opacity: ${({ theme }) => theme.opacity.hover}; }
  &:disabled{ opacity: ${({ theme }) => theme.opacity.disabled}; cursor: not-allowed; }
  &:active{ transform: translateY(1px); }
`;
const Primary = styled(Btn)`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border-color: ${({ theme }) => theme.buttons.primary.backgroundHover};
`;
const Danger = styled(Btn)`
  background: ${({ theme }) => theme.colors.dangerBg};
  color: ${({ theme }) => theme.colors.danger};
  border-color: ${({ theme }) => theme.colors.danger};
`;

const RecoBar = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.sm};
`;
const RecoLeft = styled.div``;
const RecoRight = styled.div`
  display: flex; gap: ${({ theme }) => theme.spacings.xs}; align-items: center;
`;

const Table = styled.table`
  width: 100%; border-collapse: collapse;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  overflow: hidden;

  thead th{
    background: ${({ theme }) => theme.colors.tableHeader};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    padding: ${({ theme }) => theme.spacings.md};
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
    text-align:left;
  }
  td{
    padding: ${({ theme }) => theme.spacings.md};
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.text};
    vertical-align: middle;
  }
  td.mono{ font-family: ${({ theme }) => theme.fonts.mono}; }
  td.actions{ text-align:right; }
  td.check{ width:40px; }
  tr:hover td{ background: ${({ theme }) => theme.colors.hoverBackground}; }
  ${({ theme }) => theme.media.mobile}{ display:none; }
`;

const Empty = styled.div`
  padding: ${({ theme }) => theme.spacings.md} 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
`;

const Badge = styled.span<{ $dir: EntryDirection }>`
  display:inline-block; padding:.25em .7em; border-radius:${({ theme }) => theme.radii.pill};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderHighlight};
  background:${({ $dir, theme }) => ($dir === "in" ? theme.colors.successBg : theme.colors.dangerBg)};
  color:${({ $dir, theme }) => ($dir === "in" ? theme.colors.success : theme.colors.danger)};
`;

const Badge2 = styled.span<{ $ok: boolean }>`
  display:inline-block; padding:.25em .7em; border-radius:${({ theme }) => theme.radii.pill};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderHighlight};
  background:${({ $ok, theme }) => ($ok ? theme.colors.primaryTransparent : theme.colors.inputBackgroundLight)};
  color:${({ $ok, theme }) => ($ok ? theme.colors.primary : theme.colors.textSecondary)};
`;

/* mobile cards */
const CardList = styled.div`
  display:none;
  ${({ theme }) => theme.media.mobile}{
    display:flex; flex-direction:column; gap:${({ theme }) => theme.spacings.md};
  }
`;
const Card = styled.div`
  background:${({ theme }) => theme.colors.cardBackground};
  border-radius:${({ theme }) => theme.radii.lg};
  box-shadow:${({ theme }) => theme.cards.shadow};
  padding:${({ theme }) => theme.spacings.md};
`;
const Row = styled.div`
  display:flex; justify-content:space-between; gap:${({ theme }) => theme.spacings.sm}; padding:6px 0;
`;
const Field = styled.span`
  color:${({ theme }) => theme.colors.textSecondary};
  font-size:${({ theme }) => theme.fontSizes.xsmall};
  min-width:90px;
`;
const Value = styled.span`
  color:${({ theme }) => theme.colors.text};
  font-size:${({ theme }) => theme.fontSizes.xsmall};
  text-align:right; max-width:60%; word-break:break-word;
  &.mono{ font-family:${({ theme }) => theme.fonts.mono}; }
`;
const Buttons = styled.div`
  display:flex; justify-content:space-between; gap:${({ theme }) => theme.spacings.xs};
  margin-top:${({ theme }) => theme.spacings.sm};
`;
const SmallCheck = styled.label`
  display:flex; gap:${({ theme }) => theme.spacings.xs}; align-items:center;
`;
