"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchUsers } from "@/modules/users/slice/userCrudSlice";
import { UserTableRow } from "@/modules/users";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { User } from "@/modules/users/types/user";
import { UserFilterState } from "@/app/admin/users/page";

interface Props {
  filters: UserFilterState;
}

export default function UserTable({ filters }: Props) {
  const { t } = useTranslation("admin");
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading } = useSelector((state: RootState) => state.userCrud);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Bütün user’ları normalize et (isActive garantili boolean)
  const normalizedUsers: User[] = users.map((u: any) => ({
    ...u,
    isActive: !!u.isActive, // force boolean
  }));

  const filteredUsers = normalizedUsers.filter((u) => {
    const matchQuery =
      u.name?.toLowerCase().includes(filters.query.toLowerCase()) ||
      u.email?.toLowerCase().includes(filters.query.toLowerCase());

    const matchRole = filters.role ? u.role === filters.role : true;
    const matchActive =
      filters.isActive === ""
        ? true
        : filters.isActive === "true"
        ? u.isActive === true
        : u.isActive === false;

    return matchQuery && matchRole && matchActive;
  });

  return (
    <Table>
      <thead>
        <tr>
          <Th>{t("users.table.name", "Name")}</Th>
          <Th>{t("users.table.email", "Email")}</Th>
          <Th>{t("users.table.role", "Role")}</Th>
          <Th>{t("users.table.active", "Active")}</Th>
          <Th>{t("users.table.actions", "Actions")}</Th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <LoadingRow>
            <td colSpan={5}>{t("users.loading", "Loading...")}</td>
          </LoadingRow>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <UserTableRow key={user._id} user={user} />
          ))
        ) : (
          <LoadingRow>
            <td colSpan={5}>{t("users.noResults", "No users found.")}</td>
          </LoadingRow>
        )}
      </tbody>
    </Table>
  );
}

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.text};
`;

const Th = styled.th`
  text-align: left;
  padding: 10px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border || "#ccc"};
`;

const LoadingRow = styled.tr`
  td {
    text-align: center;
    padding: 2rem;
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;
