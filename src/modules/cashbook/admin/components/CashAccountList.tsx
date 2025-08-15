"use client";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/cashbook/locales";
import type { ICashAccount } from "@/modules/cashbook/types";

interface Props {
  items: ICashAccount[];
  loading?: boolean;
  onEdit: (a: ICashAccount) => void;
}

export default function CashAccountList({ items, loading, onEdit }: Props) {
  const { t, i18n } = useI18nNamespace("cashbook", translations);
  const locale = (i18n.language || "en").replace("_", "-");

  const fmtBalance = (a: ICashAccount) => {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: a.currency,
        maximumFractionDigits: 2,
      }).format(a.currentBalance);
    } catch {
      return a.currentBalance.toLocaleString() + " " + a.currency;
    }
  };

  return (
    <Wrap>
      <Table role="table" aria-label={t("sections.accounts", "Accounts")} aria-busy={!!loading}>
        <thead>
          <tr>
            <th>{t("acc.code", "Code")}</th>
            <th>{t("acc.name", "Name")}</th>
            <th>{t("acc.type", "Type")}</th>
            <th>{t("acc.currency", "Currency")}</th>
            <th>{t("acc.balance", "Balance")}</th>
            <th>{t("acc.active", "Active")}</th>
            <th>{t("list.actions", "Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {!loading && items.length === 0 && (
            <tr>
              <td colSpan={7}>
                <Empty>{t("common.empty", "Empty")}</Empty>
              </td>
            </tr>
          )}
          {items.map((a) => (
            <tr key={a._id}>
              <td className="mono">{a.code}</td>
              <td>{a.name}</td>
              <td>{t(`acc.t.${a.type}`, a.type)}</td>
              <td>{a.currency}</td>
              <td>{fmtBalance(a)}</td>
              <td>
                <Badge $ok={a.isActive}>
                  {a.isActive ? t("common.yes", "Yes") : t("common.no", "No")}
                </Badge>
              </td>
              <td className="actions">
                <SecondaryBtn type="button" onClick={() => onEdit(a)}>
                  {t("actions.edit", "Edit")}
                </SecondaryBtn>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Mobile Cards */}
      <CardList aria-busy={!!loading}>
        {items.length === 0 && !loading && <Empty>{t("common.empty", "Empty")}</Empty>}
        {items.map((a) => (
          <Card key={a._id}>
            <Row>
              <Field>{t("acc.code", "Code")}</Field>
              <Value className="mono">{a.code}</Value>
            </Row>
            <Row>
              <Field>{t("acc.name", "Name")}</Field>
              <Value>{a.name}</Value>
            </Row>
            <Row>
              <Field>{t("acc.type", "Type")}</Field>
              <Value>{t(`acc.t.${a.type}`, a.type)}</Value>
            </Row>
            <Row>
              <Field>{t("acc.currency", "Currency")}</Field>
              <Value>{a.currency}</Value>
            </Row>
            <Row>
              <Field>{t("acc.balance", "Balance")}</Field>
              <Value>{fmtBalance(a)}</Value>
            </Row>
            <Row>
              <Field>{t("acc.active", "Active")}</Field>
              <Value>
                <Badge $ok={a.isActive}>
                  {a.isActive ? t("common.yes", "Yes") : t("common.no", "No")}
                </Badge>
              </Value>
            </Row>
            <Buttons>
              <SecondaryBtn type="button" onClick={() => onEdit(a)}>
                {t("actions.edit", "Edit")}
              </SecondaryBtn>
            </Buttons>
          </Card>
        ))}
      </CardList>
    </Wrap>
  );
}

/* styled */
const Wrap = styled.div`
  width: 100%;
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
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
    text-align: left;
  }
  td {
    padding: ${({ theme }) => theme.spacings.md};
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.text};
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

const Badge = styled.span<{ $ok: boolean }>`
  display: inline-block;
  padding: 0.3em 0.8em;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderHighlight};
  background: ${({ $ok, theme }) => ($ok ? theme.colors.successBg : theme.colors.warningBackground)};
  color: ${({ $ok, theme }) => ($ok ? theme.colors.success : theme.colors.warning)};
`;

const SecondaryBtn = styled.button`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: opacity ${({ theme }) => theme.transition.fast};
  &:hover {
    opacity: ${({ theme }) => theme.opacity.hover};
  }
`;

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

const Row = styled.div`
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
