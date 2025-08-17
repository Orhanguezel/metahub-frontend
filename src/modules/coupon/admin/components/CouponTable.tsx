"use client";
import React from "react";
import styled from "styled-components";
import { Button } from "@/shared";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/coupon";
import type { SupportedLocale } from "@/types/common";
import type { Coupon } from "@/modules/coupon/types";

interface Props {
  coupons: Coupon[];
  loading?: boolean;
  error?: string;
  successMessage?: string;
  onEdit: (coupon: Coupon) => void;
  onDelete: (id: string) => void;
}

export default function CouponTable({ coupons, onEdit, onDelete }: Props) {
  const { t, i18n } = useI18nNamespace("coupon", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const rows = (Array.isArray(coupons) ? coupons : []).filter(
    (x): x is Coupon => !!x && typeof x === "object"
  );

  if (!rows.length) {
    return <EmptyMsg>{t("admin.empty", "No coupons available.")}</EmptyMsg>;
  }

  const fmtDate = (d: unknown) => {
    if (!d) return "-";
    const dd = d instanceof Date ? d : new Date(d as any);
    return isNaN(dd.getTime()) ? "-" : dd.toLocaleDateString(lang);
  };

  const getTitle = (c: Coupon) =>
    (c.title as any)?.[lang] ||
    (c.title as any)?.en ||
    (c.title ? (Object.values(c.title)[0] as string) : "-") ||
    "-";

  return (
    <Wrap>
      {/* Desktop */}
      <Table>
        <thead>
          <tr>
            <th>{t("form.code", "Code")}</th>
            <th>{t("form.discount", "Discount %")}</th>
            <th>{t("form.expiresAt", "Expires At")}</th>
            <th>{t("form.title", "Title")}</th>
            <th>{t("form.active", "Active")}</th>
            <th>{t("form.actions", "Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c, idx) => {
            const key = c._id || `row-${idx}`;
            const code = c.code ?? "-";
            const discount = typeof c.discount === "number" ? c.discount : Number(c.discount ?? 0);
            return (
              <tr key={key}>
                <td><Mono>{code}</Mono></td>
                <td>{Number.isFinite(discount) ? discount : 0}%</td>
                <td>{fmtDate(c.expiresAt)}</td>
                <td>{getTitle(c)}</td>
                <td><Dot $on={!!c.isActive} aria-label={c.isActive ? t("on","On") : t("off","Off")} /></td>
                <td className="actions">
                  <Button size="sm" variant="outline" onClick={() => onEdit(c)}>
                    {t("form.edit", "Edit")}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    style={{ marginLeft: 8 }}
                    onClick={() => c._id && onDelete(c._id)}
                    disabled={!c._id}
                  >
                    {t("form.delete", "Delete")}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {/* Mobile */}
      <Cards>
        {rows.map((c, idx) => {
          const key = c._id || `card-${idx}`;
          return (
            <Card key={key}>
              <Row><Key>{t("form.code", "Code")}:</Key><Val><Mono>{c.code ?? "-"}</Mono></Val></Row>
              <Row><Key>{t("form.discount", "Discount %")}:</Key><Val>{(c.discount as any) ?? 0}%</Val></Row>
              <Row><Key>{t("form.expiresAt", "Expires At")}:</Key><Val>{fmtDate(c.expiresAt)}</Val></Row>
              <Row><Key>{t("form.title", "Title")}:</Key><Val>{getTitle(c)}</Val></Row>
              <Row><Key>{t("form.active", "Active")}:</Key><Val><Dot $on={!!c.isActive} /></Val></Row>
              <Actions>
                <Button size="sm" variant="outline" onClick={() => onEdit(c)}>
                  {t("form.edit", "Edit")}
                </Button>
                <Button size="sm" variant="danger" onClick={() => c._id && onDelete(c._id!)} disabled={!c._id}>
                  {t("form.delete", "Delete")}
                </Button>
              </Actions>
            </Card>
          );
        })}
      </Cards>
    </Wrap>
  );
}

/* styled */
const Wrap = styled.div`width: 100%;`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  overflow: hidden;

  thead th {
    background: ${({ theme }) => theme.colors.tableHeader};
    color: ${({ theme }) => theme.colors.text};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    padding: ${({ theme }) => theme.spacings.md};
    text-align: left;
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
    white-space: nowrap;
  }
  td {
    padding: ${({ theme }) => theme.spacings.md};
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.text};
    vertical-align: middle;
  }
  td.actions { text-align: right; }
  tbody tr:hover td { background: ${({ theme }) => theme.colors.hoverBackground}; }

  ${({ theme }) => theme.media.small} { display: none; }
`;

const Cards = styled.div`
  display: none;
  ${({ theme }) => theme.media.small} {
    display: grid;
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacings.md};
  }
`;

const Card = styled.article`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xs};
`;

const Row = styled.div`
  display: flex; gap: ${({ theme }) => theme.spacings.sm}; align-items: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;
const Key = styled.span`
  min-width: 92px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;
const Val = styled.span`color: ${({ theme }) => theme.colors.text};`;

const Actions = styled.div`
  display: flex; gap: ${({ theme }) => theme.spacings.xs};
  margin-top: ${({ theme }) => theme.spacings.sm};
  justify-content: flex-end;
`;

const Dot = styled.span<{ $on: boolean }>`
  display: inline-block; width: 14px; height: 14px; border-radius: 50%;
  background: ${({ $on, theme }) => ($on ? theme.colors.success : theme.colors.danger)};
`;

const Mono = styled.code`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyMsg = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  padding: ${({ theme }) => theme.spacings.lg};
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.xs};
`;
