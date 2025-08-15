"use client";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/billing/locales";
import { getLocaleStringFromLang, type SupportedLocale } from "@/types/common";
import type { IBillingPlan, BillingPlanStatus } from "@/modules/billing/types";

interface Props {
  plans: IBillingPlan[];
  loading?: boolean;
  onEdit: (p: IBillingPlan) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (id: string, status: BillingPlanStatus) => void;
}

export default function BillingPlanList({
  plans,
  loading,
  onEdit,
  onDelete,
  onChangeStatus,
}: Props) {
  const { i18n, t } = useI18nNamespace("billing", translations);
  const lang = (i18n.language?.slice(0, 2) as SupportedLocale) || "en";
  const locale = getLocaleStringFromLang(lang);

  const weekdayLabel = (w: number) => t(`weekdays.${w}`, String(w));

  const fmtAmount = (amt: number, ccy: string) => {
    try {
      return new Intl.NumberFormat(locale, { style: "currency", currency: ccy, maximumFractionDigits: 2 }).format(amt);
    } catch {
      return `${amt.toLocaleString()} ${ccy}`;
    }
  };

  const fmtDate = (d?: string | Date) =>
    d ? new Intl.DateTimeFormat(locale).format(new Date(d)) : "-";

  const fmtDueRule = (p: IBillingPlan) =>
    p.schedule.dueRule.type === "dayOfMonth"
      ? `${t("due.day", "Day")} ${p.schedule.dueRule.day}`
      : `${t("form.nth", "Nth")} ${p.schedule.dueRule.nth} • ${weekdayLabel(p.schedule.dueRule.weekday)}`;

  return (
    <Wrap>
      {/* Desktop table */}
      <Table role="table" aria-label={t("sections.plans", "Plans")}>
        <thead>
          <tr>
            <th>{t("list.code", "Code")}</th>
            <th>{t("list.status", "Status")}</th>
            <th>{t("list.amount", "Amount")}</th>
            <th>{t("list.period", "Period")}</th>
            <th>{t("list.dueRule", "Due Rule")}</th>
            <th>{t("list.nextDue", "Next Due")}</th>
            <th>{t("list.actions", "Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {!loading && plans.length === 0 && (
            <tr>
              <td colSpan={7}>
                <Empty>{t("common.empty", "Empty")}</Empty>
              </td>
            </tr>
          )}

          {plans.map((p) => (
            <tr key={p._id}>
              <td className="mono">{p.code}</td>
              <td>
                <Status $s={p.status} aria-label={t(`status.${p.status}`, p.status)}>
                  {t(`status.${p.status}`, p.status)}
                </Status>
              </td>
              <td>{fmtAmount(p.schedule.amount, p.schedule.currency)}</td>
              <td>{t(`period.${p.schedule.period}`, p.schedule.period)}</td>
              <td>{fmtDueRule(p)}</td>
              <td>{fmtDate(p.nextDueAt)}</td>
              <td className="actions">
                <Row>
                  <SecondaryBtn type="button" onClick={() => onEdit(p)}>
                    {t("actions.edit", "Edit")}
                  </SecondaryBtn>

                  {p.status !== "active" && (
                    <PrimaryBtn type="button" onClick={() => onChangeStatus(p._id, "active")}>
                      {t("actions.activate", "Activate")}
                    </PrimaryBtn>
                  )}
                  {p.status === "active" && (
                    <SecondaryBtn type="button" onClick={() => onChangeStatus(p._id, "paused")}>
                      {t("actions.pause", "Pause")}
                    </SecondaryBtn>
                  )}
                  {p.status !== "ended" && (
                    <SecondaryBtn type="button" onClick={() => onChangeStatus(p._id, "ended")}>
                      {t("actions.end", "End")}
                    </SecondaryBtn>
                  )}

                  <DangerBtn type="button" onClick={() => onDelete(p._id)}>
                    {t("actions.delete", "Delete")}
                  </DangerBtn>
                </Row>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Mobile cards */}
      <CardList role="list">
        {plans.length === 0 && !loading && <Empty>{t("common.empty", "Empty")}</Empty>}

        {plans.map((p) => (
          <Card key={p._id} role="listitem">
            <RowItem>
              <Field>{t("list.code", "Code")}</Field>
              <Value className="mono">{p.code}</Value>
            </RowItem>

            <RowItem>
              <Field>{t("list.status", "Status")}</Field>
              <Value>
                <Status $s={p.status}>{t(`status.${p.status}`, p.status)}</Status>
              </Value>
            </RowItem>

            <RowItem>
              <Field>{t("list.amount", "Amount")}</Field>
              <Value>{fmtAmount(p.schedule.amount, p.schedule.currency)}</Value>
            </RowItem>

            <RowItem>
              <Field>{t("list.period", "Period")}</Field>
              <Value>{t(`period.${p.schedule.period}`, p.schedule.period)}</Value>
            </RowItem>

            <RowItem>
              <Field>{t("list.dueRule", "Due Rule")}</Field>
              <Value>{fmtDueRule(p)}</Value>
            </RowItem>

            <RowItem>
              <Field>{t("list.nextDue", "Next Due")}</Field>
              <Value>{fmtDate(p.nextDueAt)}</Value>
            </RowItem>

            <Buttons>
              <SecondaryBtn type="button" onClick={() => onEdit(p)}>
                {t("actions.edit", "Edit")}
              </SecondaryBtn>

              {p.status !== "active" && (
                <PrimaryBtn type="button" onClick={() => onChangeStatus(p._id, "active")}>
                  {t("actions.activate", "Activate")}
                </PrimaryBtn>
              )}
              {p.status === "active" && (
                <SecondaryBtn type="button" onClick={() => onChangeStatus(p._id, "paused")}>
                  {t("actions.pause", "Pause")}
                </SecondaryBtn>
              )}
              {p.status !== "ended" && (
                <SecondaryBtn type="button" onClick={() => onChangeStatus(p._id, "ended")}>
                  {t("actions.end", "End")}
                </SecondaryBtn>
              )}

              <DangerBtn type="button" onClick={() => onDelete(p._id)}>
                {t("actions.delete", "Delete")}
              </DangerBtn>
            </Buttons>
          </Card>
        ))}
      </CardList>
    </Wrap>
  );
}

/* ================= styled ================= */

const Wrap = styled.div`
  width: 100%;
`;

/* Table (desktop) */
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
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
    text-align: left;
  }

  td {
    padding: ${({ theme }) => theme.spacings.md};
    border-bottom: ${({ theme }) => theme.borders.thin}
      ${({ theme }) => theme.colors.borderBright};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    vertical-align: middle;
    color: ${({ theme }) => theme.colors.text};
  }

  td.mono { font-family: ${({ theme }) => theme.fonts.mono}; }
  td.actions { text-align: right; }

  tr:hover td { background: ${({ theme }) => theme.colors.hoverBackground}; }

  ${({ theme }) => theme.media.mobile} { display: none; }
`;

const Empty = styled.div`
  padding: ${({ theme }) => theme.spacings.md} 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
`;

/* Status badge */
const Status = styled.span<{ $s: BillingPlanStatus }>`
  display: inline-block;
  padding: 0.35em 0.9em;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderHighlight};
  background: ${({ $s, theme }) =>
    $s === "active" ? theme.colors.successBg
    : $s === "paused" ? theme.colors.warningBackground
    : $s === "ended" ? theme.colors.inputBackgroundLight
    : theme.colors.backgroundAlt};
  color: ${({ $s, theme }) =>
    $s === "active" ? theme.colors.success
    : $s === "paused" ? theme.colors.warning
    : $s === "ended" ? theme.colors.textSecondary
    : theme.colors.text};
`;

/* Action buttons */
const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const BaseBtn = styled.button`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  border: ${({ theme }) => theme.borders.thin} transparent;
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: opacity ${({ theme }) => theme.transition.fast},
              transform ${({ theme }) => theme.transition.fast};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  &:hover { opacity: ${({ theme }) => theme.opacity.hover}; }
  &:disabled { opacity: ${({ theme }) => theme.opacity.disabled}; cursor: not-allowed; }
  &:active { transform: translateY(1px); }
`;

const PrimaryBtn = styled(BaseBtn)`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border-color: ${({ theme }) => theme.buttons.primary.backgroundHover};
`;

const SecondaryBtn = styled(BaseBtn)`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border-color: ${({ theme }) => theme.colors.border};
`;

const DangerBtn = styled(BaseBtn)`
  background: ${({ theme }) => theme.colors.dangerBg};
  color: ${({ theme }) => theme.colors.danger};
  border-color: ${({ theme }) => theme.colors.danger};
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

const RowItem = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.sm};
  padding: 6px 0;
`;

const Field = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  min-width: 90px;
`;

const Value = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  text-align: right;
  &.mono { font-family: ${({ theme }) => theme.fonts.mono}; }
  word-break: break-word;
  max-width: 60%;
`;

const Buttons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacings.xs};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacings.sm};
`;
