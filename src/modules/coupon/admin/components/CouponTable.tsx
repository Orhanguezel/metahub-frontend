"use client";
import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

interface Props {
  coupons: any[];
  onEdit: (coupon: any) => void;
  onDelete: (id: string) => void;
}

export default function CouponTable({ coupons, onEdit, onDelete }: Props) {
  const { t, i18n } = useTranslation("coupon");
  const lang = i18n.language as "tr" | "en" | "de" || "en";

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
            <td>{new Date(c.expiresAt).toLocaleDateString()}</td>
            <td>{c.label.title?.[lang] || c.label.title?.en}</td>
            <td>{c.isActive ? "✔" : ""}</td>
            <td>
              <EditBtn onClick={() => onEdit(c)}>{t("form.edit", "Edit")}</EditBtn>
              <DeleteBtn onClick={() => onDelete(c._id)}>{t("form.delete", "Delete")}</DeleteBtn>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${({ theme }) => theme.spacing.md};
  th, td {
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
