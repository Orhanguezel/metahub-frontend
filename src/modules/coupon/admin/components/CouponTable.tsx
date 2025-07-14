"use client";
import React from "react";
import styled from "styled-components";
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
  const { t,i18n } = useI18nNamespace("coupon", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale; 

  if (!coupons?.length)
    return <EmptyMsg>{t("admin.empty", "No coupons available.")}</EmptyMsg>;

  return (
    <Table>
      <thead>
        <tr>
          <th>{t("form.code", "Code")}</th>
          <th>{t("form.discount", "Discount %")}</th>
          <th>{t("form.expiresAt", "Expires At")}</th>
          <th>{t("form.title", "Title")}</th>
          <th>{t("form.active", "Active")}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {coupons.map((c) => (
          <tr key={c._id}>
            <td>{c.code}</td>
            <td>{c.discount}%</td>
            <td>
              {c.expiresAt
                ? new Date(c.expiresAt).toLocaleDateString(lang)
                : "-"}
            </td>
            <td>
              {/* Çoklu dil desteği */}
              {c.title?.[lang] ||
                c.title?.en ||
                Object.values(c.title || {})[0] ||
                "-"}
            </td>
            <td>{c.isActive ? "✔" : ""}</td>
            <td>
              <EditBtn type="button" onClick={() => onEdit(c)}>
                {t("form.edit", "Edit")}
              </EditBtn>
              <DeleteBtn type="button" onClick={() => onDelete(c._id as string)}>
                {t("form.delete", "Delete")}
              </DeleteBtn>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

// Styled Components
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${({ theme }) => theme.spacings.md};
  th,
  td {
    padding: 8px 10px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    text-align: left;
  }
`;

const EditBtn = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.97rem;
  margin-right: 6px;
  cursor: pointer;
`;

const DeleteBtn = styled.button`
  background: ${({ theme }) => theme.colors.danger};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.97rem;
  cursor: pointer;
`;

const EmptyMsg = styled.div`
  text-align: center;
  margin-top: 24px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.04rem;
`;
