"use client";
import { useMemo, useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/contacts/locales";
import { useAppDispatch } from "@/store/hooks";
import { fetchAllContactsAdmin, deleteContact } from "@/modules/contacts/slice/contactsSlice";
import type { IContact, ContactListFilters, ContactKind } from "@/modules/contacts/types";

interface Props {
  items: IContact[];
  loading?: boolean;
  onEdit: (c: IContact) => void;
}

export default function ContactList({ items, loading, onEdit }: Props) {
  const { t } = useI18nNamespace("contacts", translations);
  const dispatch = useAppDispatch();

  // Backend admin query ile birebir: { q, kind, isActive }
  const [filters, setFilters] = useState<ContactListFilters>({});
  const onChange = (k: keyof ContactListFilters, v: any) =>
    setFilters((s) => ({ ...s, [k]: v || undefined }));
  const applied = useMemo(() => filters, [filters]);

  const primaryEmail = (c: IContact) =>
    c.emails?.find(e => e?.primary)?.value || c.emails?.[0]?.value || "-";
  const primaryPhone = (c: IContact) =>
    c.phones?.find(p => p?.primary)?.value || c.phones?.[0]?.value || "-";
  const displayName = (c: IContact) =>
    c.kind === "organization"
      ? (c.tradeName || c.legalName || "-")
      : [c.firstName, c.lastName].filter(Boolean).join(" ") || "-";

  // id -> help bağlamak için
  const hid = (k: string) => `contacts_filters_${k}`;

  return (
    <Wrap>
      <Toolbar as="fieldset">
        <Legend>{t("legend.filters", "Filters")}</Legend>
        <FilterRow role="group" aria-label={t("legend.filters", "Filters")}>
          <Field>
            <Label htmlFor={hid("q")}>{t("filters.q", "Search")}</Label>
            <Input
              id={hid("q")}
              placeholder={t("ph.search", "Name / Email / Phone")}
              value={filters.q || ""}
              onChange={(e) => onChange("q", e.target.value)}
            />
          </Field>

          <Field>
            <Label htmlFor={hid("kind")}>{t("filters.kind", "Kind")}</Label>
            <Select
              id={hid("kind")}
              value={filters.kind || ""}
              onChange={(e) => onChange("kind", (e.target.value || undefined) as ContactKind)}
            >
              <option value="">{t("common.all", "All")}</option>
              <option value="person">{t("kinds.person", "Person")}</option>
              <option value="organization">{t("kinds.organization", "Organization")}</option>
            </Select>
          </Field>

          <Field>
            <Label htmlFor={hid("isActive")}>{t("filters.isActive", "Active?")}</Label>
            <Select
              id={hid("isActive")}
              value={filters.isActive === undefined ? "" : String(filters.isActive)}
              onChange={(e) =>
                onChange("isActive", e.target.value === "" ? undefined : e.target.value === "true")
              }
            >
              <option value="">{t("common.all", "All")}</option>
              <option value="true">{t("common.yes", "Yes")}</option>
              <option value="false">{t("common.no", "No")}</option>
            </Select>
          </Field>
        </FilterRow>

        <Actions>
          <Btn
            type="button"
            onClick={() => dispatch(fetchAllContactsAdmin(applied))}
            disabled={loading}
            aria-busy={loading}
          >
            {t("actions.apply", "Apply")}
          </Btn>
          <Btn
            type="button"
            onClick={() => { setFilters({}); dispatch(fetchAllContactsAdmin()); }}
            disabled={loading}
          >
            {t("actions.reset", "Reset")}
          </Btn>
        </Actions>
      </Toolbar>

      {/* Desktop Table */}
      <Table role="table" aria-label={t("sections.contacts","Contacts")}>
        <thead>
          <tr>
            <th>{t("labels.name", "Name")}</th>
            <th>{t("labels.slug", "Slug")}</th>
            <th>{t("labels.primaryEmail", "Primary Email")}</th>
            <th>{t("labels.primaryPhone", "Primary Phone")}</th>
            <th>{t("labels.active", "Active")}</th>
            <th>{t("labels.actions", "Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {!loading && items.length === 0 && (
            <tr><td colSpan={6}><Empty>{t("common.empty","Empty")}</Empty></td></tr>
          )}
          {items.map((c) => (
            <tr key={c._id}>
              <td><Kind>{t(`kinds.${c.kind}`, c.kind)}</Kind> {displayName(c)}</td>
              <td className="mono">{c.slug}</td>
              <td>{primaryEmail(c)}</td>
              <td>{primaryPhone(c)}</td>
              <td>
                <Badge $ok={!!c.isActive}>
                  {c.isActive ? t("common.yes", "Yes") : t("common.no", "No")}
                </Badge>
              </td>
              <td className="actions">
                <Row>
                  <Secondary type="button" onClick={() => onEdit(c)}>
                    {t("actions.edit","Edit")}
                  </Secondary>
                  <Danger type="button" onClick={() => dispatch(deleteContact(c._id))}>
                    {t("actions.delete","Delete")}
                  </Danger>
                </Row>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Mobile Cards */}
      <CardList>
        {items.length === 0 && !loading && <Empty>{t("common.empty","Empty")}</Empty>}
        {items.map((c) => (
          <Card key={c._id}>
            <Line><FieldLabel>{t("labels.name","Name")}</FieldLabel><Value><Kind>{t(`kinds.${c.kind}`, c.kind)}</Kind> {displayName(c)}</Value></Line>
            <Line><FieldLabel>{t("labels.slug","Slug")}</FieldLabel><Value className="mono">{c.slug}</Value></Line>
            <Line><FieldLabel>{t("labels.primaryEmail","Primary Email")}</FieldLabel><Value>{primaryEmail(c)}</Value></Line>
            <Line><FieldLabel>{t("labels.primaryPhone","Primary Phone")}</FieldLabel><Value>{primaryPhone(c)}</Value></Line>
            <Line>
              <FieldLabel>{t("labels.active","Active")}</FieldLabel>
              <Value><Badge $ok={!!c.isActive}>{c.isActive ? t("common.yes","Yes") : t("common.no","No")}</Badge></Value>
            </Line>
            <Buttons>
              <Secondary type="button" onClick={() => onEdit(c)}>{t("actions.edit","Edit")}</Secondary>
              <Danger type="button" onClick={() => dispatch(deleteContact(c._id))}>{t("actions.delete","Delete")}</Danger>
            </Buttons>
          </Card>
        ))}
      </CardList>
    </Wrap>
  );
}

/* ---- styled (theme + tablet/mobil uyumlu) ---- */
const Wrap = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};`;

const Toolbar = styled.fieldset`
  display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.md};
`;
const Legend = styled.legend`
  padding:0 ${({theme})=>theme.spacings.xs};
  color:${({theme})=>theme.colors.textPrimary};
  font-weight:${({theme})=>theme.fontWeights.semiBold};
`;
const FilterRow = styled.div`
  display:grid;gap:${({theme})=>theme.spacings.sm};
  grid-template-columns:1.4fr 1fr 1fr;
  ${({theme})=>theme.media.tablet}{grid-template-columns:repeat(2,1fr);}
  ${({theme})=>theme.media.mobile}{grid-template-columns:1fr;}
`;
const Field = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.xs};`;
const Label = styled.label`font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};`;

const Actions = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};`;

const Input = styled.input`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  min-width:0;
  &:focus{outline:none;border-color:${({theme})=>theme.inputs.borderFocus};box-shadow:${({theme})=>theme.colors.shadowHighlight};background:${({theme})=>theme.colors.inputBackgroundFocus};}
  &::placeholder{color:${({theme})=>theme.colors.placeholder};}
`;
const Select = styled.select`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  &:focus{outline:none;border-color:${({theme})=>theme.inputs.borderFocus};box-shadow:${({theme})=>theme.colors.shadowHighlight};background:${({theme})=>theme.colors.inputBackgroundFocus};}
`;

const Btn = styled.button`
  padding:10px 14px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  background:${({theme})=>theme.colors.buttonBackground};
  color:${({theme})=>theme.colors.buttonText};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.buttonBorder};
  box-shadow:${({theme})=>theme.shadows.button};
  transition:opacity ${({theme})=>theme.transition.fast};
  &:hover{opacity:${({theme})=>theme.opacity.hover};}
  &:disabled{opacity:${({theme})=>theme.opacity.disabled};cursor:not-allowed;}
`;
const Secondary = styled(Btn)`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border-color:${({theme})=>theme.colors.border};
`;
const Danger = styled(Btn)`
  background:${({theme})=>theme.colors.dangerBg};
  color:${({theme})=>theme.colors.danger};
  border-color:${({theme})=>theme.colors.danger};
`;

const Table = styled.table`
  width:100%;border-collapse:collapse;background:${({theme})=>theme.colors.cardBackground};
  border-radius:${({theme})=>theme.radii.lg};box-shadow:${({theme})=>theme.cards.shadow};overflow:hidden;
  thead th{
    background:${({theme})=>theme.colors.tableHeader};
    color:${({theme})=>theme.colors.textSecondary};
    font-weight:${({theme})=>theme.fontWeights.semiBold};
    font-size:${({theme})=>theme.fontSizes.sm};
    padding:${({theme})=>theme.spacings.md};
    border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
    text-align:left;
  }
  td{
    padding:${({theme})=>theme.spacings.md};
    border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
    font-size:${({theme})=>theme.fontSizes.sm};
    vertical-align:middle;
  }
  td.mono{font-family:${({theme})=>theme.fonts.mono};}
  td.actions{text-align:right;}
  tr:hover td{background:${({theme})=>theme.colors.hoverBackground};}
  ${({theme})=>theme.media.mobile}{display:none;}
`;

const Empty = styled.div`padding:${({theme})=>theme.spacings.md} 0;color:${({theme})=>theme.colors.textSecondary};text-align:center;`;

const Row = styled.div`display:flex;gap:${({theme})=>theme.spacings.xs};flex-wrap:wrap;justify-content:flex-end;`;

const Badge = styled.span<{ $ok:boolean }>`
  display:inline-block;padding:.3em .8em;border-radius:${({theme})=>theme.radii.pill};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderHighlight};
  background:${({$ok,theme})=>$ok?theme.colors.successBg:theme.colors.warningBackground};
  color:${({$ok,theme})=>$ok?theme.colors.success:theme.colors.warning};
`;
const Kind = styled.span`
  display:inline-block;margin-right:${({theme})=>theme.spacings.xs};
  padding:.1em .5em;border-radius:${({theme})=>theme.radii.pill};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderHighlight};
  background:${({theme})=>theme.colors.inputBackgroundLight};
  color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.xsmall};
`;

const CardList = styled.div`
  display:none;
  ${({theme})=>theme.media.mobile}{display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};}
`;
const Card = styled.div`
  background:${({theme})=>theme.colors.cardBackground};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.md};
`;
const Line = styled.div`
  display:flex;justify-content:space-between;gap:${({theme})=>theme.spacings.sm};
  padding:6px 0;
`;
const FieldLabel = styled.span`
  color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.xsmall};
  min-width:90px;
`;
const Value = styled.span`
  color:${({theme})=>theme.colors.text};
  font-size:${({theme})=>theme.fontSizes.xsmall};
  text-align:right;
  max-width:60%;
  word-break:break-word;
  &.mono{font-family:${({theme})=>theme.fonts.mono};}
`;
const Buttons = styled.div`
  display:flex;justify-content:flex-end;gap:${({theme})=>theme.spacings.xs};
  margin-top:${({theme})=>theme.spacings.sm};
`;
