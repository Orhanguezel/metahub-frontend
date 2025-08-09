"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import {
  deleteUser,
  toggleUserStatus,
  updateUserRole,
} from "@/modules/users/slice/userCrudSlice";
import { toast } from "react-toastify";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { adminUserTranslations } from "@/modules/users";
import type { User } from "@/modules/users/types/user";

interface Props {
  userId: string;
  currentRole: User["role"];
  onRefresh: () => void;
}

export default function UserActions({ userId, currentRole, onRefresh }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useI18nNamespace("adminUser", adminUserTranslations);
  const [busy, setBusy] = useState<"role" | "status" | "delete" | null>(null);

  const handleRoleChange = async () => {
    try {
      setBusy("role");
      // basit toggle: admin/superadmin -> user, diğerleri -> admin
      const nextRole: User["role"] =
        currentRole === "admin" || currentRole === "superadmin" ? "user" : "admin";

      const res = await dispatch(
        updateUserRole({ id: userId, role: nextRole })
      ).unwrap();

      toast.success(res?.message || t("users.actions.roleUpdated", "Rol güncellendi"));
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || t("errors.unexpected", "Beklenmeyen bir hata oluştu"));
    } finally {
      setBusy(null);
    }
  };

  const handleStatusToggle = async () => {
    try {
      setBusy("status");
      const res = await dispatch(
        toggleUserStatus({ id: userId }) // isActive opsiyonel, backend toggle ediyor
      ).unwrap();

      toast.success(res?.message || t("users.actions.statusUpdated", "Durum güncellendi"));
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || t("errors.unexpected", "Beklenmeyen bir hata oluştu"));
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm(
      t("users.actions.confirmDelete", "Bu kullanıcıyı silmek istediğinize emin misiniz?")
    );
    if (!ok) return;

    try {
      setBusy("delete");
      const res = await dispatch(deleteUser(userId)).unwrap();
      toast.success(res?.message || t("users.actions.deleted", "Kullanıcı silindi"));
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || t("errors.unexpected", "Beklenmeyen bir hata oluştu"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <ActionsWrap role="group" aria-label={t("users.actions.group", "Kullanıcı işlemleri")}>
      <Btn
        onClick={handleRoleChange}
        disabled={busy !== null}
        aria-label={
          currentRole === "admin" || currentRole === "superadmin"
            ? t("users.actions.demote", "Yetki düşür")
            : t("users.actions.promote", "Yükselt")
        }
        $variant="secondary"
      >
        {currentRole === "admin" || currentRole === "superadmin"
          ? t("users.actions.demote", "Yetki düşür")
          : t("users.actions.promote", "Yükselt")}
      </Btn>

      <Btn
        onClick={handleStatusToggle}
        disabled={busy !== null}
        aria-label={t("users.actions.toggleStatus", "Durumu değiştir")}
        $variant="warning"
      >
        {t("users.actions.toggleStatus", "Durumu değiştir")}
      </Btn>

      <Btn
        onClick={handleDelete}
        disabled={busy !== null}
        aria-label={t("users.actions.delete", "Sil")}
        $variant="danger"
      >
        {t("users.actions.delete", "Sil")}
      </Btn>
    </ActionsWrap>
  );
}

/* =================== styles =================== */

const ActionsWrap = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  flex-wrap: wrap;
  justify-content: flex-start;
`;

type Variant = "primary" | "secondary" | "warning" | "danger";

const Btn = styled.button<{ $variant?: Variant }>`
  height: 34px;
  padding: 0 ${({ theme }) => theme.spacings.md};
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid transparent;
  font-size: 0.85rem;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: pointer;
  transition: filter 0.15s ease, transform 0.05s ease, box-shadow 0.15s ease;
  color: #fff;

  ${({ theme, $variant }) => {
    switch ($variant) {
      case "secondary":
        return `
          background: ${theme.buttons.secondary.background};
          color: ${theme.buttons.secondary.text};
          border-color: ${theme.buttons.secondary.background};
        `;
      case "warning":
        return `
          background: ${theme.buttons.warning.background};
          border-color: ${theme.buttons.warning.background};
        `;
      case "danger":
        return `
          background: ${theme.buttons.danger.background};
          border-color: ${theme.buttons.danger.background};
        `;
      default:
        return `
          background: ${theme.buttons.primary.background};
          border-color: ${theme.buttons.primary.background};
        `;
    }
  }}

  &:hover { filter: brightness(${({ theme }) => theme.opacity.hover}); }
  &:active { transform: translateY(1px); }
  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;
