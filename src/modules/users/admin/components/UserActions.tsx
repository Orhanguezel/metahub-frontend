"use client";

import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { toast } from "react-toastify";
import { deleteUser } from "@/modules/users/slice/userCrudSlice";
import {
  toggleUserStatus,
  updateUserRole,
} from "@/modules/users/slice/userStatusSlice";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { User } from "@/modules/users/types/user";

interface Props {
  userId: string;
  currentRole: User["role"];
  onRefresh: () => void;
}

export default function UserActions({ userId, currentRole, onRefresh }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("admin");

  const handleRoleChange = () => {
    const newRole: User["role"] =
      currentRole === "admin" || currentRole === "superadmin"
        ? "user"
        : "admin";
    dispatch(updateUserRole({ id: userId, role: newRole }))
      .unwrap()
      .then(() => {
        toast.success(t("users.actions.roleUpdated"));
        onRefresh();
      })
      .catch((err) => toast.error(err));
  };

  const handleStatusToggle = () => {
    dispatch(toggleUserStatus(userId))
      .unwrap()
      .then(() => {
        toast.success(t("users.actions.statusUpdated"));
        onRefresh();
      })
      .catch((err) => toast.error(err));
  };

  const handleDelete = () => {
    dispatch(deleteUser(userId))
      .unwrap()
      .then(() => {
        toast.success(t("users.actions.deleted"));
        onRefresh();
      })
      .catch((err) => toast.error(err));
  };

  return (
    <ActionContainer>
      <Button onClick={handleRoleChange}>
        {currentRole === "admin"
          ? t("users.actions.demote")
          : t("users.actions.promote")}
      </Button>
      <Button color="#e67e22" onClick={handleStatusToggle}>
        {t("users.actions.toggleStatus")}
      </Button>
      <Button color="#e74c3c" onClick={handleDelete}>
        {t("users.actions.delete")}
      </Button>
    </ActionContainer>
  );
}

const ActionContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Button = styled.button<{ color?: string }>`
  padding: 6px 12px;
  background: ${({ color }) => color || "#3498db"};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;

  &:hover {
    opacity: 0.9;
  }
`;
