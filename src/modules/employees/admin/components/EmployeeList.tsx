"use client";
import styled, { css } from "styled-components";
import { useMemo, useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllEmployeesAdmin } from "../../slice/employeesSlice";
import type { IEmployee, EmployeeListFilters, EmployeeStatus } from "../../types";

interface Props {
  items: IEmployee[];
  loading?: boolean;
  onEdit: (e: IEmployee) => void;
  onDelete: (id: string) => void;
}

const STATUSES: EmployeeStatus[] = ["active", "inactive", "onleave", "terminated"];

export default function EmployeeList({ items, loading, onEdit, onDelete }: Props) {
  const { t, i18n } = useI18nNamespace("employees", translations);
  const dispatch = useAppDispatch();

  const locale = (i18n.language || "en").replace("_", "-");
  const df = useMemo(() => new Intl.DateTimeFormat(locale), [locale]);

  // 🔗 Service Catalog (dinamik)
  const serviceOptions = useAppSelector((s: any) => s?.servicecatalog?.items ?? []);

  // 🔗 Listeden türetilen dinamik filtre seçenekleri
  const languageOptions = useMemo(
    () =>
      Array.from(
        new Set(
          items.flatMap((e) => (e.languages || []).map((l) => l.code)).filter(Boolean)
        )
      ).sort(),
    [items]
  );
  const skillOptions = useMemo(
    () => Array.from(new Set(items.flatMap((e) => (e.skills || []).map((s) => s.key)))).sort(),
    [items]
  );
  const tagOptions = useMemo(
    () => Array.from(new Set(items.flatMap((e) => e.tags || []))).sort(),
    [items]
  );

  const [filters, setFilters] = useState<EmployeeListFilters>({});
  const onChange = (k: keyof EmployeeListFilters, v: any) =>
    setFilters((s) => ({ ...s, [k]: v || undefined }));
  const applied = useMemo(() => filters, [filters]);

  const hid = (k: string) => `employees_filters_${k}`;

  return (
    <Wrap>
      {/* Filters */}
      <Toolbar as="fieldset">
        <Legend>{t("legend.filters", "Filters")}</Legend>

        <FilterRow role="group" aria-label={t("legend.filters", "Filters")}>
          <Input
            placeholder={t("filters.q", "Search")}
            value={filters.q || ""}
            onChange={(e) => onChange("q", e.target.value)}
            aria-label={t("filters.q", "Search")}
          />

          <Select
            value={filters.status || ""}
            onChange={(e) => onChange("status", (e.target.value || undefined) as EmployeeStatus)}
            aria-label={t("filters.status", "Status")}
          >
            <option value="">{t("filters.status", "Status")}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`status.${s}`, s)}
              </option>
            ))}
          </Select>

          {/* Language (dinamik) */}
          <Select
            value={filters.language || ""}
            onChange={(e) => onChange("language", e.target.value)}
            aria-label={t("filters.language", "Language")}
          >
            <option value="">{t("filters.language", "Language")}</option>
            {languageOptions.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </Select>

          {/* Skill (dinamik) */}
          <Select
            value={filters.skill || ""}
            onChange={(e) => onChange("skill", e.target.value)}
            aria-label={t("filters.skill", "Skill")}
          >
            <option value="">{t("filters.skill", "Skill")}</option>
            {skillOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>

          {/* Tag (dinamik) */}
          <Select
            value={filters.tag || ""}
            onChange={(e) => onChange("tag", e.target.value)}
            aria-label={t("filters.tag", "Tag")}
          >
            <option value="">{t("filters.tag", "Tag")}</option>
            {tagOptions.map((tg) => (
              <option key={tg} value={tg}>
                {tg}
              </option>
            ))}
          </Select>

          {/* Service (dinamik) */}
          <Field>
            <Label htmlFor={hid("serviceRef")}>{t("filters.serviceRef", "Service Ref")}</Label>
            <Select
              id={hid("serviceRef")}
              value={filters.serviceRef || ""}
              onChange={(e) => onChange("serviceRef", e.target.value)}
            >
              <option value="">{t("filters.serviceRef_ph", "Select service")}</option>
              {serviceOptions.map((svc: any) => (
                <option key={svc._id} value={svc._id}>
                  {svc?.name?.[i18n.language] || svc?.name?.en || svc?.name?.tr || svc?.code}
                </option>
              ))}
            </Select>
          </Field>

          <Field>
            <Label htmlFor={hid("limit")}>{t("filters.limit", "Limit")}</Label>
            <Input
              id={hid("limit")}
              type="number"
              min={1}
              max={500}
              inputMode="numeric"
              placeholder="200"
              value={filters.limit ?? ""}
              onChange={(e) => onChange("limit", e.target.value ? Number(e.target.value) : undefined)}
            />
          </Field>
        </FilterRow>

        <Actions>
          <Btn
            type="button"
            onClick={() => dispatch(fetchAllEmployeesAdmin(applied))}
            disabled={loading}
            aria-busy={loading}
          >
            {t("actions.apply", "Apply")}
          </Btn>
          <Btn
            type="button"
            onClick={() => {
              setFilters({});
              dispatch(fetchAllEmployeesAdmin());
            }}
            disabled={loading}
          >
            {t("actions.reset", "Reset")}
          </Btn>
        </Actions>
      </Toolbar>

      {/* Table */}
      <Table role="table" aria-label={t("sections.list", "Employees")}>
        <thead>
          <tr>
            <th>{t("labels.code", "Code")}</th>
            <th>{t("labels.fullName", "Full Name")}</th>
            <th>{t("labels.position", "Position")}</th>
            <th>{t("labels.phone", "Phone")}</th>
            <th>{t("labels.email", "Email")}</th>
            <th>{t("labels.startDate", "Start")}</th>
            <th>{t("labels.status", "Status")}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {!loading && items.length === 0 && (
            <tr>
              <td colSpan={8}>
                <Empty>∅</Empty>
              </td>
            </tr>
          )}

          {items.map((e) => (
            <tr key={e._id}>
              <td className="mono">{e.code}</td>
              <td>{e.displayName || e.fullName || `${e.firstName} ${e.lastName}`}</td>
              <td>{e.employment?.position || "-"}</td>
              <td className="mono">{e.contact?.phone || "-"}</td>
              <td>{e.contact?.email || "-"}</td>
              <td>{e.employment?.startDate ? df.format(new Date(e.employment.startDate)) : "-"}</td>
              <td>
                <Status $s={e.status}>{t(`status.${e.status}`, e.status)}</Status>
              </td>
              <td className="actions">
                <Row>
                  <Secondary type="button" onClick={() => onEdit(e)}>
                    {t("actions.edit", "Edit")}
                  </Secondary>
                  <Danger type="button" onClick={() => onDelete(e._id)}>
                    {t("actions.delete", "Delete")}
                  </Danger>
                </Row>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Mobile Cards */}
      <CardList>
        {items.length === 0 && !loading && <Empty>∅</Empty>}
        {items.map((e) => (
          <Card key={e._id}>
            <Line>
              <FieldText>{t("labels.code", "Code")}</FieldText>
              <Value className="mono">{e.code}</Value>
            </Line>
            <Line>
              <FieldText>{t("labels.fullName", "Full Name")}</FieldText>
              <Value>{e.displayName || e.fullName || `${e.firstName} ${e.lastName}`}</Value>
            </Line>
            <Line>
              <FieldText>{t("labels.position", "Position")}</FieldText>
              <Value>{e.employment?.position || "-"}</Value>
            </Line>
            <Line>
              <FieldText>{t("labels.phone", "Phone")}</FieldText>
              <Value className="mono">{e.contact?.phone || "-"}</Value>
            </Line>
            <Line>
              <FieldText>{t("labels.email", "Email")}</FieldText>
              <Value>{e.contact?.email || "-"}</Value>
            </Line>
            <Line>
              <FieldText>{t("labels.startDate", "Start")}</FieldText>
              <Value>{e.employment?.startDate ? df.format(new Date(e.employment.startDate)) : "-"}</Value>
            </Line>
            <Line>
              <FieldText>{t("labels.status", "Status")}</FieldText>
              <Value>
                <Status $s={e.status}>{t(`status.${e.status}`, e.status)}</Status>
              </Value>
            </Line>
            <Buttons>
              <Secondary type="button" onClick={() => onEdit(e)}>
                {t("actions.edit", "Edit")}
              </Secondary>
              <Danger type="button" onClick={() => onDelete(e._id)}>
                {t("actions.delete", "Delete")}
              </Danger>
            </Buttons>
          </Card>
        ))}
      </CardList>
    </Wrap>
  );
}

/* ---- styled ---- */
const controlStyles = css`
  min-width: 0;
  width: 100%;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => (theme.colors?.inputBorder ?? theme.colors?.border)};
  background: ${({ theme }) =>
    theme.inputs?.background ?? theme.colors?.inputBackground ?? theme.colors?.backgroundAlt};
  color: ${({ theme }) => theme.inputs?.text ?? theme.colors?.text};
  &::placeholder {
    color: ${({ theme }) => theme.colors?.placeholder};
  }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs?.borderFocus ?? theme.colors?.borderHighlight};
    box-shadow: ${({ theme }) => theme.colors?.shadowHighlight};
  }
`;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;

const Toolbar = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.md};
`;
const Legend = styled.legend`
  padding: 0 ${({ theme }) => theme.spacings.xs};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const FilterRow = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.sm};
  grid-template-columns: 1.3fr 1fr 1fr 1fr 1fr 1.2fr 0.8fr;
  ${({ theme }) => theme.media.tablet} {
    grid-template-columns: repeat(3, 1fr);
  }
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xs};
  min-width: 0;
`;
const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Input = styled.input`
  ${controlStyles}
`;
const Select = styled.select`
  ${controlStyles}
`;

const Btn = styled.button`
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  background: ${({ theme }) => theme.colors.buttonBackground};
  color: ${({ theme }) => theme.colors.buttonText};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.buttonBorder};
  transition: opacity ${({ theme }) => theme.transition.fast};
  &:hover {
    opacity: ${({ theme }) => theme.opacity.hover};
  }
  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;
const Secondary = styled(Btn)`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border-color: ${({ theme }) => theme.colors.border};
`;
const Danger = styled(Btn)`
  background: ${({ theme }) => theme.colors.dangerBg};
  color: ${({ theme }) => theme.colors.danger};
  border-color: ${({ theme }) => theme.colors.danger};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  overflow: hidden;

  thead th {
    background: ${({ theme }) => theme.colors.tableHeader};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    padding: ${({ theme }) => theme.spacings.md};
    text-align: left;
  }
  td {
    padding: ${({ theme }) => theme.spacings.md};
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    vertical-align: middle;
  }
  td.mono {
    font-family: ${({ theme }) => theme.fonts.mono};
  }
  td.actions {
    text-align: right;
  }
  tr:hover td {
    background: ${({ theme }) => theme.colors.hoverBackground};
  }

  ${({ theme }) => theme.media.mobile} {
    display: none;
  }
`;

const Empty = styled.div`
  padding: ${({ theme }) => theme.spacings.md} 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
`;

const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const Status = styled.span<{ $s: EmployeeStatus }>`
  display: inline-block;
  padding: 0.3em 0.9em;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderHighlight};
  background: ${({ $s, theme }) =>
    $s === "active"
      ? theme.colors.successBg
      : $s === "onleave"
      ? theme.colors.warningBackground
      : $s === "terminated"
      ? theme.colors.dangerBg
      : theme.colors.inputBackgroundLight};
  color: ${({ $s, theme }) =>
    $s === "active"
      ? theme.colors.success
      : $s === "onleave"
      ? theme.colors.warning
      : $s === "terminated"
      ? theme.colors.danger
      : theme.colors.textSecondary};
`;

/* Mobile cards */
const CardList = styled.div`
  display: none;
  ${({ theme }) => theme.media.mobile} {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacings.md};
  }
`;
const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.md};
`;
const Line = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.sm};
  padding: 6px 0;
`;
const FieldText = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  min-width: 110px;
`;
const Value = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  text-align: right;
  max-width: 60%;
  word-break: break-word;
  &.mono {
    font-family: ${({ theme }) => theme.fonts.mono};
  }
`;
const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacings.xs};
  margin-top: ${({ theme }) => theme.spacings.sm};
`;
